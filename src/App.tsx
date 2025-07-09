import React, { useEffect, useState } from 'react';
import { Task } from './types/Task';
import { loadTasks, saveTasks } from './utils/storage';
import { TaskForm } from './components/TaskForm';
import { Timeline } from './components/Timeline';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  // 初回ロード時にlocalStorageから復元
  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  // タスク変更時にlocalStorageへ保存
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // タスク追加
  const handleAdd = (task: Omit<Task, 'id'>) => {
    setTasks(prev => [...prev, { ...task, id: generateId() }]);
    setShowForm(false);
  };

  // タスク編集
  const handleEdit = (task: Omit<Task, 'id'>) => {
    if (!editingTask) return;
    setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...task } : t));
    setEditingTask(null);
    setShowForm(false);
  };

  // 編集フォーム表示
  const startEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // タスク削除
  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // フォームキャンセル
  const handleCancel = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 16, background: '#fafbfc', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h1 style={{ textAlign: 'center' }}>NowTask</h1>
      {!showForm && (
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <button onClick={() => { setEditingTask(null); setShowForm(true); }}>＋タスク追加</button>
        </div>
      )}
      {showForm ? (
        <TaskForm
          initialTask={editingTask || undefined}
          onSubmit={editingTask ? handleEdit : handleAdd}
          onCancel={handleCancel}
        />
      ) : (
        <Timeline
          tasks={tasks}
          onEdit={startEdit}
          onDelete={handleDelete}
        />
      )}
      <footer style={{ marginTop: 32, fontSize: 12, color: '#888', textAlign: 'center' }}>
        今日一日を、直感的に。 NowTask MVP
      </footer>
    </div>
  );
}; 