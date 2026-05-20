export interface NoteMeta {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
}

export interface FileMeta {
  id: string;
  filename: string;
  size: number;
  created_at: number;
  updated_at: number;
}