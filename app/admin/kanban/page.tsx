'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
}

// Use Next.js API route as proxy to avoid CORS issues
const API_URL = '/api/kanban/tasks';
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_KANBAN_API_KEY || '';

// Status mapping between UI and API
const statusMap: Record<string, 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'> = {
  'backlog': 'BACKLOG',
  'todo': 'TODO',
  'in-progress': 'IN_PROGRESS',
  'review': 'REVIEW',
  'done': 'DONE',
};

const reverseStatusMap: Record<string, string> = {
  'BACKLOG': 'backlog',
  'TODO': 'todo',
  'IN_PROGRESS': 'in-progress',
  'REVIEW': 'review',
  'DONE': 'done',
};

export default function KanbanPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated');
    if (auth !== 'true') {
      router.push('/admin');
      return;
    }
    setIsAuthenticated(true);

    // Load API key from localStorage
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
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const addTask = async (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const apiStatus = statusMap[columnId];
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();

      // Update status if different from TODO
      if (apiStatus !== 'TODO') {
        await updateTaskStatus(newTask.id, apiStatus);
      } else {
        setTasks([...tasks, newTask]);
      }

      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsAddingTask(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      console.error('Error creating task:', err);
    } finally {
      setLoading(false);
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
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

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
      console.error('Error deleting task:', err);
    }
  };

  const moveTask = async (taskId: string, columnId: string) => {
    const newStatus = statusMap[columnId];
    await updateTaskStatus(taskId, newStatus);
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
                <p className="text-sm text-gray-600">MSC Cruises Project Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{tasks.length} tasks total</span>
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

      {/* Kanban Board */}
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

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {columns.map(column => (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className={`bg-white rounded-t-lg border-t-4 ${column.color} p-4 shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{column.title}</h3>
                  <span className="text-sm text-gray-500">
                    {tasks.filter(task => reverseStatusMap[task.status] === column.id).length}
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
                        if (e.key === 'Enter' && !e.shiftKey) addTask(column.id);
                      }}
                      placeholder="Task title..."
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                      autoFocus
                    />
                    <textarea
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Description (optional)..."
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => addTask(column.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        disabled={loading}
                      >
                        {loading ? 'Adding...' : 'Add'}
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingTask(null);
                          setNewTaskTitle('');
                          setNewTaskDescription('');
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
                  .filter(task => reverseStatusMap[task.status] === column.id)
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
                              onClick={() => moveTask(task.id, col.id)}
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
