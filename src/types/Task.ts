export interface Task {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  version?: string; // タスクデータのバージョン
} 