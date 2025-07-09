import React, { useState } from 'react';
import { Task } from '../types/Task';

// props型定義
interface TaskFormProps {
  initialTask?: Task;
  onSubmit: (task: Omit<Task, 'id'>) => void;
  onCancel?: () => void;
}

const getTimeString = (date: Date) => date.toISOString().slice(0, 16);

export const TaskForm: React.FC<TaskFormProps> = ({ initialTask, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialTask?.name || '');
  const [start, setStart] = useState(initialTask?.start || getTimeString(new Date()));
  const [end, setEnd] = useState(initialTask?.end || getTimeString(new Date(Date.now() + 60 * 60 * 1000)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (start >= end) return;
    onSubmit({ name, start, end });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label>
        タスク名
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </label>
      <label>
        開始時刻
        <input
          type="datetime-local"
          value={start}
          onChange={e => setStart(e.target.value)}
          required
        />
      </label>
      <label>
        終了時刻
        <input
          type="datetime-local"
          value={end}
          onChange={e => setEnd(e.target.value)}
          required
        />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit">{initialTask ? '更新' : '追加'}</button>
        {onCancel && <button type="button" onClick={onCancel}>キャンセル</button>}
      </div>
    </form>
  );
}; 