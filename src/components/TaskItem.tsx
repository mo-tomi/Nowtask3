import React, { useState, useEffect } from 'react';
import { Task } from '../types/Task';

export type DragAction = 'move' | 'resize-top' | 'resize-bottom';

interface TaskItemProps {
  task: Task;
  isEditing: boolean;
  currentDate: Date;
  onEdit: (task: Task) => void;
  onEndEdit: () => void;
  onDelete: (id: string) => void;
  onTaskUpdate: (task: Task) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>, task: Task, action: DragAction) => void;
  hourHeight: number;
  isoToMinutes: (iso: string) => number;
}

const toDateTimeLocalString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const TaskItem: React.FC<TaskItemProps> = ({ task, isEditing, currentDate, onEdit, onEndEdit, onDelete, onTaskUpdate, onMouseDown, hourHeight }) => {
  
  const [editData, setEditData] = useState({ name: '', start: '', end: '' });

  useEffect(() => {
    // isEditingがtrueになった瞬間にのみ、フォームのデータを初期化する
    if (isEditing) {
      setEditData({
        name: task.name,
        start: toDateTimeLocalString(task.startTime),
        end: toDateTimeLocalString(task.endTime),
      });
    }
  }, [isEditing, task]); // taskも依存配列に追加

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData.name.trim() || !editData.start || !editData.end || editData.start >= editData.end) {
      alert('入力内容が正しくありません。終了日時は開始日時より後に設定してください。');
      return;
    }
    const updatedTask: Task = {
      ...task,
      name: editData.name.trim(),
      startTime: new Date(editData.start),
      endTime: new Date(editData.end),
    };
    onTaskUpdate(updatedTask);
    onEndEdit();
  };

  const dayStart = new Date(currentDate);
  dayStart.setHours(0, 0, 0, 0);

  const startMillis = task.startTime.getTime();
  const endMillis = task.endTime.getTime();
  const dayStartMillis = dayStart.getTime();

  const startMinutes = (startMillis - dayStartMillis) / 60000;
  const endMinutes = (endMillis - dayStartMillis) / 60000;

  const displayStartMinutes = Math.max(0, startMinutes);
  const displayEndMinutes = Math.min(24 * 60, endMinutes);

  if (displayStartMinutes >= displayEndMinutes) {
    return null; // この日には表示されないタスク
  }

  const top = (displayStartMinutes / (24 * 60)) * (hourHeight * 24);
  const height = ((displayEndMinutes - displayStartMinutes) / (24 * 60)) * (hourHeight * 24);

  return (
    <div
      onMouseDown={(e) => !isEditing && onMouseDown(e, task, 'move')}
      style={{
        position: 'absolute', top, left: 5, right: 5,
        height: isEditing ? 'auto' : height,
        minHeight: 40, // 最小高さを設定
        background: isEditing ? '#fff' : 'rgba(180, 210, 255, 0.8)',
        border: isEditing ? '2px solid #36f' : '1px solid #6a92d4',
        borderRadius: 4, padding: '4px 6px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        fontSize: 12, userSelect: 'none',
        zIndex: isEditing ? 30 : 20,
        cursor: isEditing ? 'default' : 'move',
        boxShadow: isEditing ? '0 0 8px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      {isEditing ? (
        // --- 編集モード ---
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            type="text"
            value={editData.name}
            onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
            style={{ fontWeight: 'bold', width: '100%' }}
            autoFocus
          />
          <label style={{ fontSize: 10, color: '#666' }}>開始</label>
          <input
            type="datetime-local"
            value={editData.start}
            onChange={e => setEditData(prev => ({ ...prev, start: e.target.value }))}
          />
          <label style={{ fontSize: 10, color: '#666' }}>終了</label>
          <input
            type="datetime-local"
            value={editData.end}
            onChange={e => setEditData(prev => ({ ...prev, end: e.target.value }))}
          />
          <div style={{ display: 'flex', gap: 4, marginTop: 'auto' }}>
            <button type="submit" style={{ flex: 1 }}>保存</button>
            <button type="button" onClick={onEndEdit}>キャンセル</button>
          </div>
        </form>
      ) : (
        // --- 表示モード ---
        <>
          <div onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, task, 'resize-top'); }} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, cursor: 'n-resize', zIndex: 21 }} />
          
          <div style={{ fontWeight: 'bold', pointerEvents: 'none' }}>{task.name}</div>
          <div style={{ color: '#333', pointerEvents: 'none' }}>
            {formatTime(task.startTime)} - {formatTime(task.endTime)}
          </div>

          <div style={{ position: 'absolute', bottom: 2, right: 2, display: 'flex', gap: 4, zIndex: 22 }}>
            <button onMouseDown={e => e.stopPropagation()} onClick={() => onEdit(task)} style={{ fontSize: 10, padding: 2 }}>編集</button>
            <button onMouseDown={e => e.stopPropagation()} onClick={() => onDelete(task.id)} style={{ fontSize: 10, padding: 2, color: 'red' }}>削除</button>
          </div>

          <div onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, task, 'resize-bottom'); }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 5, cursor: 's-resize', zIndex: 21 }} />
        </>
      )}
    </div>
  );
}; 