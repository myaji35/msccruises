'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
}

const initialTasks: Task[] = [
  // Done
  {
    id: '1',
    title: 'Next.js 16 + React 19 업그레이드',
    description: 'Turbopack 활성화 및 의존성 업데이트',
    status: 'done',
    priority: 'high',
    createdAt: '2025-11-08',
  },
  {
    id: '2',
    title: 'Zustand 상태 관리 구현',
    description: '5개 Store 생성: Booking, Search, Auth, Cart, Admin',
    status: 'done',
    priority: 'high',
    createdAt: '2025-11-08',
  },
  {
    id: '3',
    title: 'Admin Panel 구현',
    description: '패스워드 인증, 대시보드, 설정',
    status: 'done',
    priority: 'high',
    createdAt: '2025-11-08',
  },
  {
    id: '4',
    title: 'GCP App Engine 배포',
    description: 'msccruises.du.r.appspot.com',
    status: 'done',
    priority: 'high',
    createdAt: '2025-11-08',
  },
  // To Do
  {
    id: '5',
    title: '실시간 크루즈 재고 관리',
    description: 'WebSocket 기반 실시간 업데이트',
    status: 'todo',
    priority: 'high',
    createdAt: '2025-11-08',
  },
  {
    id: '6',
    title: '이메일 알림 시스템',
    description: '예약 확인, 출발 안내',
    status: 'todo',
    priority: 'medium',
    createdAt: '2025-11-08',
  },
  {
    id: '7',
    title: '다국어 지원 (i18n)',
    description: '영어, 한국어, 일본어, 중국어',
    status: 'todo',
    priority: 'medium',
    createdAt: '2025-11-08',
  },
  // Backlog
  {
    id: '8',
    title: 'Unit 테스트 작성',
    description: 'Jest 기반 테스트 커버리지 80% 이상',
    status: 'backlog',
    priority: 'low',
    createdAt: '2025-11-08',
  },
  {
    id: '9',
    title: 'E2E 테스트',
    description: 'Playwright로 주요 플로우 테스트',
    status: 'backlog',
    priority: 'low',
    createdAt: '2025-11-08',
  },
];

export default function KanbanPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated');
    if (auth !== 'true') {
      router.push('/admin');
      return;
    }
    setIsAuthenticated(true);

    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('kanban_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, [router]);

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    if (isAuthenticated) {
      localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isAuthenticated]);

  const columns = [
    { id: 'backlog', title: 'Backlog', color: 'border-gray-300' },
    { id: 'todo', title: 'To Do', color: 'border-blue-300' },
    { id: 'in-progress', title: 'In Progress', color: 'border-yellow-300' },
    { id: 'review', title: 'Review', color: 'border-purple-300' },
    { id: 'done', title: 'Done', color: 'border-green-300' },
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const addTask = (status: string) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: status as Task['status'],
      createdAt: new Date().toISOString(),
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsAddingTask(null);
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const moveTask = (taskId: string, newStatus: Task['status']) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
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
                <p className="text-sm text-gray-600">MSC Cruises Project Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{tasks.length} tasks total</span>
            </div>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {columns.map(column => (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className={`bg-white rounded-t-lg border-t-4 ${column.color} p-4 shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{column.title}</h3>
                  <span className="text-sm text-gray-500">
                    {tasks.filter(task => task.status === column.id).length}
                  </span>
                </div>
                <button
                  onClick={() => setIsAddingTask(column.id)}
                  className="w-full flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-gray-900 py-1 border border-dashed border-gray-300 rounded hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                  Add task
                </button>
              </div>

              {/* Column Content */}
              <div className="bg-gray-100 rounded-b-lg p-2 min-h-[500px] space-y-2">
                {/* Add Task Form */}
                {isAddingTask === column.id && (
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') addTask(column.id);
                      }}
                      placeholder="Task title..."
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => addTask(column.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingTask(null);
                          setNewTaskTitle('');
                        }}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Tasks */}
                {tasks
                  .filter(task => task.status === column.id)
                  .map(task => (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm text-gray-900 flex-1">
                          {task.title}
                        </h4>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                      )}

                      {task.priority && (
                        <div className="mb-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      )}

                      {/* Move buttons */}
                      <div className="flex gap-1 flex-wrap">
                        {columns
                          .filter(col => col.id !== column.id)
                          .map(col => (
                            <button
                              key={col.id}
                              onClick={() => moveTask(task.id, col.id as Task['status'])}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                              → {col.title}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
