export type Task = {
  id: string; // 一意なID
  name: string; // タスク名
  start: string; // 開始時刻（ISO文字列）
  end: string;   // 終了時刻（ISO文字列）
}; 