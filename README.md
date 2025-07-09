# NowTask MVP

「今日一日を、直感的に。」

NowTaskは、個人が今日一日のタスクを単一のタイムライン上で直感的に管理できるWebアプリケーションです。

---

## 主な機能
- タスクの追加（タスク名・開始時刻・終了時刻）
- タスクの編集・削除
- 今日のタイムライン上に1カラムでタスクを表示
- 現在時刻ラインをリアルタイムで表示
- データはlocalStorageに自動保存（サーバー・ログイン不要）

---

## セットアップ方法

1. **リポジトリをクローン**
   ```bash
   git clone <このリポジトリのURL>
   cd Nowtask3
   ```
2. **依存パッケージをインストール**
   ```bash
   npm install
   ```
3. **開発サーバーを起動**
   ```bash
   npm run dev
   ```
4. **ブラウザでアクセス**
   - 通常は `http://localhost:5173` などにアクセス

---

## ディレクトリ構成

```
Nowtask3/
├─ src/
│  ├─ App.tsx              # アプリ本体
│  ├─ components/
│  │    ├─ TaskForm.tsx    # タスク追加・編集フォーム
│  │    ├─ TaskItem.tsx    # タスク1件の表示・編集
│  │    └─ Timeline.tsx    # タイムライン表示
│  ├─ types/
│  │    └─ Task.ts         # タスク型定義
│  ├─ utils/
│  │    └─ storage.ts      # localStorage操作
│  └─ index.tsx            # エントリポイント
├─ index.html
├─ package.json
├─ tsconfig.json
└─ README.md
```

---

## ライセンス
MIT License

---

## 開発者
- TOMIさん
- もぎゅちさん

---

ご意見・ご要望はIssueまたはPull Requestでお知らせください。 