import { invoke } from "@tauri-apps/api/core";
import { NoteMeta, FileMeta } from "../types";

export async function checkVaultExists(): Promise<boolean> {
  try {
    return await invoke("check_vault_exists");
  } catch (err) {
    console.error("Failed to check vault:", err);
    return false;
  }
}

export async function setupVault(password: string): Promise<boolean> {
  return await invoke("setup_vault", { password });
}

export async function unlockVault(password: string): Promise<boolean> {
  return await invoke("unlock", { password });
}

export async function createNote(title: string, content: string): Promise<string> {
  return await invoke("create_note", { title, content });
}

export async function loadNote(id: string): Promise<string> {
  return await invoke("load_note", { id });
}

export async function listNotes(): Promise<NoteMeta[]> {
  return await invoke("list_notes");
}

export async function getNoteMeta(id: string): Promise<NoteMeta> {
  return await invoke("get_note_meta", { id });
}

export async function updateNote(
  id: string,
  title: string,
  content: string
): Promise<void> {
  await invoke("update_note", { id, title, content });
}

export async function deleteNote(id: string): Promise<void> {
  await invoke("delete_note", { id });
}

export async function saveVaultFile(filename: string, fileData: Uint8Array): Promise<string> {
  return await invoke("save_vault_file", { 
    filename,
    file_data: Array.from(fileData)
  });
}

export async function loadFile(id: string): Promise<Uint8Array> {
  const data = await invoke<number[]>("load_file", { id });
  return new Uint8Array(data);
}

export async function listFiles(): Promise<FileMeta[]> {
  return await invoke("list_files");
}

export async function getFileMeta(id: string): Promise<FileMeta> {
  return await invoke("get_file_meta", { id });
}

export async function deleteFile(id: string): Promise<void> {
  await invoke("delete_file", { id });
}