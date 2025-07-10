import React from 'react';
import { Task } from '../types/Task';

interface TaskListProps {
  tasks: Task[];
  currentDate: Date;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  editingTaskId: string | null;
}

const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatDate = (date: Date) => date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });

export const TaskList: React.FC<TaskListProps> = ({ tasks, currentDate, onEdit, onDelete, editingTaskId }) => {
  // 選択された日付のタスクをフィルタリング
  const selectedDateStart = new Date(currentDate);
  selectedDateStart.setHours(0, 0, 0, 0);
  const selectedDateEnd = new Date(currentDate);
  selectedDateEnd.setHours(23, 59, 59, 999);

  const visibleTasks = tasks.filter(t => {
    const taskStart = new Date(t.startTime);
    const taskEnd = new Date(t.endTime);
    return taskStart < selectedDateEnd && taskEnd > selectedDateStart;
  });

  // 開始時刻順にソート
  const sortedTasks = visibleTasks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const isToday = new Date().toDateString() === currentDate.toDateString();
  const now = new Date();

  // タスクの状態を判定
  const getTaskStatus = (task: Task) => {
    if (!isToday) return 'scheduled';
    if (now < task.startTime) return 'upcoming';
    if (now > task.endTime) return 'completed';
    return 'current';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return '#ff6b6b';
      case 'upcoming': return '#4ecdc4';
      case 'completed': return '#95a5a6';
      default: return '#3498db';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'current': return '実行中';
      case 'upcoming': return '予定';
      case 'completed': return '完了';
      default: return '予定';
    }
  };

  return (
    <div style={{ 
      height: '100%', 
      overflowY: 'auto', 
      padding: '16px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px'
    }}>
      <h3 style={{ 
        margin: '0 0 16px 0', 
        fontSize: '18px', 
        color: '#2c3e50',
        borderBottom: '2px solid #3498db',
        paddingBottom: '8px'
      }}>
        タスク一覧 ({sortedTasks.length}件)
      </h3>
      
      {sortedTasks.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: '#7f8c8d', 
          padding: '32px 16px',
          fontSize: '14px'
        }}>
          この日にはタスクがありません
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sortedTasks.map(task => {
            const status = getTaskStatus(task);
            const isEditing = task.id === editingTaskId;
            
            return (
              <div
                key={task.id}
                style={{
                  backgroundColor: isEditing ? '#fff3cd' : '#ffffff',
                  border: isEditing ? '2px solid #ffc107' : '1px solid #e9ecef',
                  borderRadius: '6px',
                  padding: '12px',
                  boxShadow: isEditing ? '0 2px 8px rgba(255, 193, 7, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => !isEditing && onEdit(task)}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: '14px',
                      color: '#2c3e50',
                      marginBottom: '4px',
                      lineHeight: '1.3'
                    }}>
                      {task.name}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6c757d',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>
                        {formatTime(task.startTime)} - {formatTime(task.endTime)}
                      </span>
                      {/* 日付が跨ぐ場合の表示 */}
                      {task.startTime.toDateString() !== task.endTime.toDateString() && (
                        <span style={{ fontSize: '10px', color: '#dc3545' }}>
                          ({formatDate(task.startTime)} - {formatDate(task.endTime)})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px'
                  }}>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      backgroundColor: getStatusColor(status),
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {getStatusText(status)}
                    </span>
                    
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(task);
                        }}
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          border: '1px solid #6c757d',
                          backgroundColor: 'transparent',
                          color: '#6c757d',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        編集
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`「${task.name}」を削除しますか？`)) {
                            onDelete(task.id);
                          }
                        }}
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          border: '1px solid #dc3545',
                          backgroundColor: 'transparent',
                          color: '#dc3545',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 進行度バー（今日のタスクのみ） */}
                {isToday && status !== 'scheduled' && (
                  <div style={{ 
                    marginTop: '8px',
                    height: '4px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: getStatusColor(status),
                        width: status === 'completed' ? '100%' : 
                               status === 'current' ? 
                               `${Math.min(100, Math.max(0, ((now.getTime() - task.startTime.getTime()) / (task.endTime.getTime() - task.startTime.getTime())) * 100))}%` : 
                               '0%',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}; 