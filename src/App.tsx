import React, { useEffect, useState } from 'react';
import { version } from '../package.json'; // バージョン情報をインポート
import { Task } from './types/Task';
import { loadTasks, saveTasks } from './utils/storage';
import { TaskForm } from './components/TaskForm';
import { Timeline } from './components/Timeline';
import { TaskList } from './components/TaskList';
import './App.css';

// yyyy-mm-dd形式の文字列を返すヘルパー
const toDateInputString = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null); // インライン編集中のタスクを管理
  const [currentDate, setCurrentDate] = useState(new Date());
  const [addCounter, setAddCounter] = useState(0);
  const [copyStatus, setCopyStatus] = useState('Copy');

  useEffect(() => {
    try {
      const loadedTasks = loadTasks();
      console.log('Loaded tasks from localStorage:', loadedTasks);
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0 || tasks.length === 0) { // 初期化時も含めて保存
      try {
        saveTasks(tasks);
        console.log('Saved tasks to localStorage:', tasks);
      } catch (error) {
        console.error('Failed to save tasks:', error);
      }
    }
  }, [tasks]);

  // 上部フォームからのタスク追加
  const handleFormSubmit = (taskData: { name: string; start: string; end: string }) => {
    const newTask: Task = {
      id: generateId(),
      name: taskData.name,
      startTime: new Date(taskData.start),
      endTime: new Date(taskData.end),
    };
    setTasks(prev => [...prev, newTask]);
    setAddCounter(c => c + 1);
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
  };

  const endEdit = () => {
    setEditingTask(null);
  }

  const handleDelete = (id: string) => {
    if (editingTask?.id === id) {
      setEditingTask(null);
    }
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // ドラッグやインライン編集による更新
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleTimelineClick = (startTime: string, endTime: string) => {
    const dateStr = toDateInputString(currentDate);
    const newTask: Task = {
      id: generateId(),
      name: '新規タスク',
      startTime: new Date(`${dateStr}T${startTime}`),
      endTime: new Date(`${dateStr}T${endTime}`),
    };
    setTasks(prev => [...prev, newTask]);
    setEditingTask(newTask);
  };

  const handleCopyVersion = () => {
    const versionString = `v${version}`;
    navigator.clipboard.writeText(versionString).then(() => {
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 1500);
    });
  };

  return (
    <div className="app-container">
      {/* ヘッダー */}
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            NowTask
            <span style={{ fontSize: 14, color: '#888' }}>
              v{version}
              <button onClick={handleCopyVersion} style={{ marginLeft: 4, padding: '2px 4px', fontSize: 10 }}>
                {copyStatus}
              </button>
            </span>
          </h1>
          <input
            type="date"
            value={toDateInputString(currentDate)}
            onChange={e => setCurrentDate(new Date(e.target.value))}
            style={{ padding: 8 }}
          />
        </div>
        <TaskForm
          key={`new-${addCounter}`}
          onSubmit={handleFormSubmit}
        />
      </header>

      {/* メインコンテンツ */}
      <main className="app-main">
        {/* タスク一覧サイドバー */}
        <aside className="app-sidebar">
          <TaskList
            tasks={tasks}
            currentDate={currentDate}
            onEdit={startEdit}
            onDelete={handleDelete}
            editingTaskId={editingTask?.id || null}
          />
        </aside>

        {/* タイムライン */}
        <section className="app-timeline">
          <Timeline
            tasks={tasks}
            currentDate={currentDate}
            editingTaskId={editingTask?.id || null}
            onEdit={startEdit}
            onEndEdit={endEdit}
            onDelete={handleDelete}
            onTaskUpdate={handleTaskUpdate}
            onTimelineClick={handleTimelineClick}
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>今日一日を、直感的に。</p>
      </footer>
    </div>
  );
}; 