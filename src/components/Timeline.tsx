import React, { useEffect, useRef, useState } from 'react';
import { Task } from '../types/Task';
import { TaskItem, DragAction } from './TaskItem';

interface TimelineProps {
  tasks: Task[];
  currentDate: Date;
  editingTaskId: string | null;
  onEdit: (task: Task) => void;
  onEndEdit: () => void;
  onDelete: (id: string) => void;
  onTaskUpdate: (task: Task) => void;
  onTimelineClick: (startTime: string, endTime: string) => void;
}

const HOUR_HEIGHT = 60;
const MINUTE_INTERVAL = 15; // 15分単位でスナップ

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const isoToMinutes = (isoString: string) => {
  const d = new Date(isoString);
  return d.getHours() * 60 + d.getMinutes();
};

const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

export const Timeline: React.FC<TimelineProps> = ({ tasks, currentDate, editingTaskId, onEdit, onEndEdit, onDelete, onTaskUpdate, onTimelineClick }) => {
  const [now, setNow] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ task: Task; action: DragAction; startY: number, originalStart: number, originalEnd: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000); // 1秒間隔で更新
    return () => clearInterval(timer);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, task: Task, action: DragAction) => {
    e.preventDefault();
    setDragging({
      task,
      action,
      startY: e.clientY,
      originalStart: isoToMinutes(task.startTime.toISOString()),
      originalEnd: isoToMinutes(task.endTime.toISOString())
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !timelineRef.current) return;
    const { task, action, startY, originalStart, originalEnd } = dragging;

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const totalMinutes = (e.clientY - timelineRect.top) / (HOUR_HEIGHT * 24) * (24 * 60);
    const snapMinutes = Math.round(totalMinutes / MINUTE_INTERVAL) * MINUTE_INTERVAL;

    let newStart = originalStart;
    let newEnd = originalEnd;

    const diff = (e.clientY - startY) / (HOUR_HEIGHT * 24) * (24 * 60);
    const snapDiff = Math.round(diff / MINUTE_INTERVAL) * MINUTE_INTERVAL;

    if (action === 'move') {
      newStart = originalStart + snapDiff;
      newEnd = originalEnd + snapDiff;
    } else if (action === 'resize-bottom') {
      newEnd = originalEnd + snapDiff;
      // 終了時刻が開始時刻を追い越さないように制御
      if (newEnd < newStart + MINUTE_INTERVAL) {
        newEnd = newStart + MINUTE_INTERVAL;
      }
    } else if (action === 'resize-top') {
      newStart = originalStart + snapDiff;
      // 開始時刻が終了時刻を追い越さないように制御
      if (newStart > newEnd - MINUTE_INTERVAL) {
        newStart = newEnd - MINUTE_INTERVAL;
      }
    }

    newStart = Math.max(0, Math.min(24 * 60 - MINUTE_INTERVAL, newStart));
    newEnd = Math.max(MINUTE_INTERVAL, Math.min(24 * 60, newEnd));

    const originalStartDate = new Date(task.startTime);
    const newStartDate = new Date(originalStartDate);
    newStartDate.setHours(Math.floor(newStart / 60), newStart % 60);

    const newEndDate = new Date(originalStartDate);
    newEndDate.setHours(Math.floor(newEnd / 60), newEnd % 60);

    onTaskUpdate({
      ...task,
      startTime: newStartDate,
      endTime: newEndDate,
    });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== timelineRef.current || !timelineRef.current) {
      return;
    }
    const rect = timelineRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const totalMinutes = (y / (HOUR_HEIGHT * 24)) * (24 * 60);
    const startMinute = Math.floor(totalMinutes / MINUTE_INTERVAL) * MINUTE_INTERVAL;
    const endMinute = startMinute + 60;

    if (endMinute > 24 * 60) return;

    onTimelineClick(minutesToTime(startMinute), minutesToTime(endMinute));
  };

  const selectedDateStart = new Date(currentDate);
  selectedDateStart.setHours(0, 0, 0, 0);
  const selectedDateEnd = new Date(currentDate);
  selectedDateEnd.setHours(23, 59, 59, 999);

  const visibleTasks = tasks.filter(t => {
    const taskStart = new Date(t.startTime); // 'start' -> 'startTime'
    const taskEnd = new Date(t.endTime);   // 'end' -> 'endTime'
    return taskStart < selectedDateEnd && taskEnd > selectedDateStart;
  });

  const nowMinutes = timeToMinutes(`${now.getHours()}:${now.getMinutes()}`);
  const nowTop = (nowMinutes / (24 * 60)) * (HOUR_HEIGHT * 24);
  
  // 今日かどうかの判定をより正確に
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDay = new Date(currentDate);
  selectedDay.setHours(0, 0, 0, 0);
  const isToday = today.getTime() === selectedDay.getTime();
  
  // デバッグログ（開発時のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log('Timeline Debug:', {
      now: now.toLocaleTimeString(),
      nowMinutes,
      nowTop,
      isToday,
      selectedDate: currentDate.toDateString(),
      today: today.toDateString()
    });
  }

  return (
    <div style={{ display: 'flex' }} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* 時間軸 */}
      <div style={{ marginRight: 10, paddingTop: 10 }}>
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} style={{ height: HOUR_HEIGHT, textAlign: 'right', color: '#888', fontSize: 12 }}>
            {i}:00
          </div>
        ))}
      </div>

      {/* タイムライン本体 */}
      <div
        ref={timelineRef}
        onMouseMove={handleMouseMove}
        onClick={handleTimelineClick}
        style={{
          position: 'relative',
          flex: 1,
          background: '#f6f6f6',
          borderRadius: 8,
          height: HOUR_HEIGHT * 24, // 24時間分の高さ
        }}
      >
        {/* 現在時刻ライン (今日の日付が選択されている場合のみ表示) */}
        {isToday && (
          <>
            {/* 現在時刻ライン */}
            <div style={{ 
              position: 'absolute', 
              left: 0, 
              right: 0, 
              top: nowTop, 
              height: 2, 
              background: 'red', 
              zIndex: 100,
              boxShadow: '0 0 4px rgba(255, 0, 0, 0.5)',
              pointerEvents: 'none'
            }} />
            {/* 現在時刻ラベル */}
            <div style={{
              position: 'absolute',
              left: '5px',
              top: nowTop - 10,
              backgroundColor: 'red',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 'bold',
              zIndex: 101,
              pointerEvents: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </>
        )}
        {visibleTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            isEditing={task.id === editingTaskId}
            currentDate={currentDate}
            onEdit={onEdit}
            onEndEdit={onEndEdit}
            onDelete={onDelete}
            onTaskUpdate={onTaskUpdate}
            onMouseDown={handleMouseDown}
            hourHeight={HOUR_HEIGHT}
          />
        ))}
      </div>
    </div>
  );
}; 