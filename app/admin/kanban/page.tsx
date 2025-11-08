'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DropResult } from '@hello-pangea/dnd';

const KanbanBoard = dynamic(() => import('@/components/kanban/KanbanBoard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  ),
});

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
  updatedAt: string;
}

const API_URL = '/api/kanban/tasks';
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_KANBAN_API_KEY || '';

const columns = [
  { id: 'TODO', title: '할 일', bgColor: 'bg-gray-100' },
  { id: 'IN_PROGRESS', title: '진행 중', bgColor: 'bg-blue-50' },
  { id: 'DONE', title: '완료', bgColor: 'bg-green-50' },
] as const;

export default function KanbanPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit modal states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<Task['status']>('TODO');

  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated');
    if (auth !== 'true') {
      router.push('/admin');
      return;
    }
    setIsAuthenticated(true);

    const savedApiKey = localStorage.getItem('kanban_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated && apiKey) {
      fetchTasks();
    }
  }, [isAuthenticated, apiKey]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        headers: {
          'X-API-Key': apiKey,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (title: string, status: Task['status']) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();

      if (status !== 'TODO') {
        await updateTaskStatus(newTask.id, status);
      } else {
        await fetchTasks(); // Refresh to get the task
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PATCH',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      await fetchTasks(); // Refresh tasks after update
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PATCH',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      await fetchTasks(); // Refresh tasks after update
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE',
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId as Task['status'];

    // Optimistic update
    const taskToMove = tasks.find(t => t.id === draggableId);
    if (taskToMove) {
      const updatedTasks = tasks.map(t =>
        t.id === draggableId ? { ...t, status: newStatus } : t
      );
      setTasks(updatedTasks);
    }

    // API update
    await updateTaskStatus(draggableId, newStatus);
  };

  const handleAddTask = async (columnId: string, title: string) => {
    await createTask(title, columnId as Task['status']);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditStatus(task.status);
  };

  const handleSaveEdit = async () => {
    if (!editingTask) return;

    await updateTask(editingTask.id, {
      title: editTitle,
      description: editDescription || null,
      status: editStatus,
    });

    setEditingTask(null);
  };

  const saveApiKey = () => {
    localStorage.setItem('kanban_api_key', apiKey);
    setShowApiKeyInput(false);
    fetchTasks();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#003366]">Kanban Board</h1>
                <p className="text-sm text-gray-600">Drag & Drop Project Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{tasks.length} tasks</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              >
                <Settings className="w-4 h-4 mr-2" />
                API Key
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Key Input */}
        {showApiKeyInput && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">API Key Configuration</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API Key"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button onClick={saveApiKey}>Save</Button>
              <Button variant="outline" onClick={() => setShowApiKeyInput(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">Loading...</p>
          </div>
        )}

        {/* Kanban Board */}
        {isAuthenticated && !loading && (
          <KanbanBoard
            tasks={tasks}
            onDragEnd={handleDragEnd}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
          />
        )}
      </main>

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">카드 편집</h2>
              <button
                onClick={() => setEditingTask(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상태
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Task['status'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {columns.map(col => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setEditingTask(null)}>
                  취소
                </Button>
                <Button onClick={handleSaveEdit}>저장</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
