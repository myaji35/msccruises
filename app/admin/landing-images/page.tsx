'use client';

import { useState, useEffect } from 'react';
import { Upload, X, ChevronUp, ChevronDown, Eye, EyeOff, Image as ImageIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface LandingImage {
  id: string;
  url: string;
  filename: string;
  alt: string | null;
  title: string | null;
  description: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LandingImagesPage() {
  const [images, setImages] = useState<LandingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingFields, setEditingFields] = useState<{[key: string]: {title: string, description: string, alt: string}}>({});

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/admin/landing-images');
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // 먼저 파일을 업로드
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('File upload failed');
        }

        const uploadData = await uploadResponse.json();

        // 업로드된 파일을 랜딩 이미지로 등록
        const createResponse = await fetch('/api/admin/landing-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: uploadData.file.url,
            filename: uploadData.file.filename,
            alt: '',
          }),
        });

        if (!createResponse.ok) {
          throw new Error('Failed to create landing image');
        }
      }

      // 이미지 목록 새로고침
      await fetchImages();
      alert('이미지가 성공적으로 업로드되었습니다.');
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const fields = editingFields[id];

    try {
      const response = await fetch(`/api/admin/landing-images/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentState,
          title: fields?.title || '',
          description: fields?.description || '',
          alt: fields?.alt || '',
        }),
      });

      if (response.ok) {
        await fetchImages();
        alert(`이미지가 ${!currentState ? '활성화' : '비활성화'}되었습니다.`);
      }
    } catch (error) {
      console.error('Failed to toggle active state:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const deleteImage = async (id: string) => {
    if (!confirm('이 이미지를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/landing-images/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchImages();
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const moveImage = async (id: string, direction: 'up' | 'down') => {
    const index = images.findIndex((img) => img.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    try {
      // 두 이미지의 order 값을 교환
      const currentImage = images[index];
      const targetImage = images[newIndex];

      await Promise.all([
        fetch(`/api/admin/landing-images/${currentImage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: targetImage.order }),
        }),
        fetch(`/api/admin/landing-images/${targetImage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: currentImage.order }),
        }),
      ]);

      await fetchImages();
    } catch (error) {
      console.error('Failed to move image:', error);
    }
  };

  const updateImageField = async (id: string, field: string, value: string) => {
    try {
      await fetch(`/api/admin/landing-images/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      await fetchImages();
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    }
  };

  const saveImageInfo = async (id: string) => {
    const fields = editingFields[id];
    if (!fields) return;

    try {
      await fetch(`/api/admin/landing-images/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fields.title,
          description: fields.description,
          alt: fields.alt
        }),
      });

      await fetchImages();
      alert('정보가 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save image info:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const initEditingFields = (image: LandingImage) => {
    if (!editingFields[image.id]) {
      setEditingFields(prev => ({
        ...prev,
        [image.id]: {
          title: image.title || '',
          description: image.description || '',
          alt: image.alt || ''
        }
      }));
    }
  };

  const updateEditingField = (id: string, field: 'title' | 'description' | 'alt', value: string) => {
    setEditingFields(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { title: '', description: '', alt: '' }),
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">랜딩페이지 이미지 관리</h1>
              <p className="text-sm text-gray-600">메인 페이지 상단에 표시될 이미지를 관리합니다</p>
            </div>
            <a href="/admin" className="text-blue-600 hover:text-blue-800">
              대시보드로 돌아가기
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">새 이미지 업로드</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-700 mb-2">이미지를 선택하여 업로드하세요</p>
            <p className="text-sm text-gray-500 mb-4">권장 크기: 1920x600px 이상 (JPEG, PNG, WebP)</p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label htmlFor="file-upload">
              <Button asChild disabled={uploading}>
                <span className="cursor-pointer">
                  {uploading ? '업로드 중...' : '파일 선택'}
                </span>
              </Button>
            </label>
          </div>
        </div>

        {/* Images List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              등록된 이미지 ({images.length}개)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              순서를 조정하여 캐러셀에 표시될 순서를 변경할 수 있습니다
            </p>
          </div>

          {images.length === 0 ? (
            <div className="p-12 text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-2">등록된 이미지가 없습니다</p>
              <p className="text-sm text-gray-500">위에서 이미지를 업로드해주세요</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {images.map((image, index) => {
                initEditingFields(image);
                return (
                <div
                  key={image.id}
                  className={`p-4 flex items-center gap-4 ${
                    !image.isActive ? 'bg-gray-50 opacity-60' : ''
                  }`}
                >
                  {/* Order Controls */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveImage(image.id, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-xs text-gray-500 text-center w-6">{index + 1}</span>
                    <button
                      onClick={() => moveImage(image.id, 'down')}
                      disabled={index === images.length - 1}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Image Preview */}
                  <div className="relative w-48 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={image.url}
                      alt={image.alt || 'Landing image'}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Image Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {image.filename}
                    </p>

                    {/* Title Input */}
                    <input
                      type="text"
                      placeholder="제목 (예: 지중해 크루즈의 매력)"
                      value={editingFields[image.id]?.title || ''}
                      onChange={(e) => updateEditingField(image.id, 'title', e.target.value)}
                      className="w-full max-w-md text-sm border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />

                    {/* Description Input */}
                    <textarea
                      placeholder="설명/태그라인 (예: 일생에 한 번은 경험해야 할 황홀한 여행)"
                      value={editingFields[image.id]?.description || ''}
                      onChange={(e) => updateEditingField(image.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full max-w-md text-sm border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />

                    {/* Alt Text Input */}
                    <input
                      type="text"
                      placeholder="Alt 텍스트 (웹 접근성)"
                      value={editingFields[image.id]?.alt || ''}
                      onChange={(e) => updateEditingField(image.id, 'alt', e.target.value)}
                      className="w-full max-w-md text-sm text-gray-600 border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      💡 입력 후 "활성" 또는 "비활성" 버튼을 클릭하면 정보가 저장됩니다
                    </p>

                    <p className="text-xs text-gray-400">
                      추가됨: {new Date(image.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={image.isActive ? 'default' : 'outline'}
                      onClick={() => toggleActive(image.id, image.isActive)}
                      className="flex items-center gap-1"
                    >
                      {image.isActive ? (
                        <>
                          <Eye className="w-4 h-4" />
                          활성
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          비활성
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteImage(image.id)}
                      className="flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      삭제
                    </Button>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">사용 안내</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 이미지는 좌에서 우로 자동 전환됩니다 (5초 간격)</li>
            <li>• 활성화된 이미지만 랜딩페이지에 표시됩니다</li>
            <li>• 화살표 버튼으로 표시 순서를 변경할 수 있습니다</li>
            <li>• 최적의 성능을 위해 이미지 크기는 1920x600px 권장합니다</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
