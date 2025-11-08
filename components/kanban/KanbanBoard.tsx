'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
  updatedAt: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  onDragEnd: (result: DropResult) => void;
  onAddTask: (columnId: string, title: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const columns = [
  { id: 'TODO', title: '할 일', bgColor: 'bg-gray-100' },
  { id: 'IN_PROGRESS', title: '진행 중', bgColor: 'bg-blue-50' },
  { id: 'DONE', title: '완료', bgColor: 'bg-green-50' },
] as const;

export default function KanbanBoard({
  tasks,
  onDragEnd,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanBoardProps) {
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;
    onAddTask(columnId, newTaskTitle);
    setNewTaskTitle('');
    setAddingToColumn(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className={`rounded-lg ${column.bgColor} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">{column.title}</h2>
                <span className="text-sm text-gray-600">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[500px] space-y-2 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-100/30' : ''
                    }`}
                  >
                    {tasks
                      .filter(task => task.status === column.id)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`group bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                                snapshot.isDragging ? 'ring-2 ring-blue-600 shadow-lg' : ''
                              }`}
                              onClick={() => onEditTask(task)}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-medium text-gray-900 flex-1">
                                  {task.title}
                                </h3>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTask(task.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {task.description && (
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                  {task.description}
                                </p>
                              )}

                              <p className="text-xs text-gray-500">
                                {formatDate(task.updatedAt)}
                              </p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Add Task */}
              {addingToColumn === column.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddTask(column.id);
                      }
                      if (e.key === 'Escape') {
                        setAddingToColumn(null);
                        setNewTaskTitle('');
                      }
                    }}
                    placeholder="카드 제목 입력..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAddTask(column.id)}>
                      추가
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAddingToColumn(null);
                        setNewTaskTitle('');
                      }}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingToColumn(column.id)}
                  className="mt-2 w-full flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  카드 추가
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
