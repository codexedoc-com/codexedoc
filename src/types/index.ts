export interface NoteMeta {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
}

export interface FileEntry {
  id: string;
  name: string;
  size: number;
  date: string;
  type: string;
  directory: string;
  dataUrl: string;
}

export interface FolderEntry {
  id: string;
  name: string;
  path: string;
  created: string;
}