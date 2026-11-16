import type { Message } from '../types';
export function localAudio(_filename: string): string | undefined {
  return undefined;
}
export async function downloadAudio(
  message: Message,
  onProgress: (percent: number | null) => void,
  signal: AbortSignal,
): Promise<string | null> {
  onProgress(null);
  const response = await fetch(message.downloadUrl || message.audioUrl, { signal });
  if (!response.ok) throw new Error('Download failed');
  const blob = await response.blob();
  if (!blob.size) throw new Error('Empty audio file');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${message.title.replace(/[^a-z0-9 -]/gi, '').slice(0, 100) || 'message'}.mp3`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return null;
}
