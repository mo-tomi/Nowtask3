import { Task } from '../types/Task';

// package.jsonからバージョンを直接取得
const APP_VERSION = '0.9.9';

/**
 * タスクデータをマイグレーションする
 * 古いデータ構造を新しい構造に変換する
 */
const migrateTask = (task: any): Task => {
  // バージョン1: startTime/endTimeが文字列で保存されている場合
  if (typeof task.startTime === 'string' || typeof task.endTime === 'string') {
    return {
      ...task,
      startTime: new Date(task.startTime),
      endTime: new Date(task.endTime),
      version: APP_VERSION,
    };
  }

  // バージョンが古い、または存在しない場合もDateオブジェクトに変換
  if (!task.version) {
    return {
      ...task,
      startTime: new Date(task.startTime),
      endTime: new Date(task.endTime),
      version: APP_VERSION,
    };
  }
  
  // 最新バージョンの場合はそのまま返す
  return {
    ...task,
    version: APP_VERSION,
  };
};


export const saveTasks = (tasks: Task[]) => {
  try {
    const tasksWithVersion = tasks.map(task => ({ ...task, version: APP_VERSION }));
    const data = JSON.stringify(tasksWithVersion);
    localStorage.setItem('tasks', data);
  } catch (error) {
    console.error("Could not save tasks to localStorage", error);
  }
};

export const loadTasks = (): Task[] => {
  const data = localStorage.getItem('tasks');
  console.log('Raw localStorage data:', data);
  
  if (!data) {
    console.log('No tasks found in localStorage');
    return [];
  }

  try {
    const tasks: unknown[] = JSON.parse(data);
    console.log('Parsed tasks from localStorage:', tasks);

    if (!Array.isArray(tasks)) {
      console.warn('Stored tasks are not in an array format.');
      return [];
    }
    
    const validTasks = tasks.map((task: any) => {
      // 古いデータ形式（start/end）を新しい形式（startTime/endTime）に変換
      if (task.start) task.startTime = task.start;
      if (task.end) task.endTime = task.end;

      const startTime = new Date(task.startTime);
      const endTime = new Date(task.endTime);

      // データ構造と日時の有効性を厳密にチェック
      if (
        task.id && typeof task.id === 'string' &&
        task.name && typeof task.name === 'string' &&
        startTime && !isNaN(startTime.getTime()) &&
        endTime && !isNaN(endTime.getTime()) &&
        startTime < endTime
      ) {
        return {
          id: task.id,
          name: task.name,
          startTime,
          endTime,
          version: APP_VERSION, // 読み込み時に最新バージョンを付与
        } as Task;
      }
      return null; // 無効なデータはnullとしてマーク
    });

    // nullを取り除き、有効なタスクのみを返す
    const finalTasks = validTasks.filter((task): task is Task => task !== null);
    console.log('Final valid tasks:', finalTasks);
    return finalTasks;

  } catch (error) {
    console.error("Failed to load or parse tasks from localStorage. Clearing corrupted data.", error);
    localStorage.removeItem('tasks'); // 破損したデータを削除
    return [];
  }
}; 