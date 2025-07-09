import React from 'react';
import { Task } from '../types/Task';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete }) => {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 4, padding: 8, marginBottom: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontWeight: 'bold' }}>{task.name}</div>
        <div style={{ fontSize: 12, color: '#666' }}>{formatTime(task.start)} - {formatTime(task.end)}</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onEdit(task)}>編集</button>
        <button onClick={() => onDelete(task.id)} style={{ color: 'red' }}>削除</button>
      </div>
    </div>
  );
}; 