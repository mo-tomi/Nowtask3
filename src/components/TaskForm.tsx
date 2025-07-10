import React, { useState } from 'react';

interface TaskFormProps {
  onSubmit: (data: { name: string; start: string; end: string }) => void;
}

const toDateTimeLocalString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [start, setStart] = useState(toDateTimeLocalString(new Date()));
  const [end, setEnd] = useState(toDateTimeLocalString(new Date(Date.now() + 60 * 60 * 1000)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !start || !end || start >= end) {
      alert('入力内容が正しくありません。');
      return;
    }
    onSubmit({ name, start, end });
    // リセット
    setName('');
    setStart(toDateTimeLocalString(new Date()));
    setEnd(toDateTimeLocalString(new Date(Date.now() + 60 * 60 * 1000)));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        type="text"
        placeholder="新しいタスクを追加"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        style={{ padding: 8, fontSize: 16 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required />
        <span>〜</span>
        <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} required />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" style={{ flex: 1, padding: 8 }}>追加</button>
      </div>
    </form>
  );
}; 