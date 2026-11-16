import { Directory, File, Paths } from 'expo-file-system';
import type { Message } from '../types';
const folder = () => new Directory(Paths.document, 'messages');
export function localAudio(filename: string): string | undefined {
  try {
    const file = new File(folder(), filename);
    return file.exists && file.size > 0 ? file.uri : undefined;
  } catch {
    return undefined;
  }
}
export async function downloadAudio(
  message: Message,
  onProgress: (percent: number | null) => void,
  signal: AbortSignal,
): Promise<string | null> {
  const directory = folder();
  directory.create({ idempotent: true, intermediates: true });
  const extension =
    new URL(message.audioUrl).pathname.match(/\.(mp3|m4a|aac|wav|ogg)$/i)?.[1] || 'mp3';
  const filename = `message-${encodeURIComponent(message.id)}.${extension}`;
  const partial = new File(directory, filename + '.part');
  try {
    const file = await File.downloadFileAsync(message.downloadUrl || message.audioUrl, partial, {
      idempotent: true,
      signal,
      onProgress: ({ bytesWritten, totalBytes }) =>
        onProgress(
          totalBytes > 0 ? Math.min(99, Math.floor((bytesWritten / totalBytes) * 100)) : null,
        ),
    });
    if (!file.exists || file.size === 0) throw new Error('Empty audio file');
    const destination = new File(directory, filename);
    if (destination.exists) destination.delete();
    file.move(destination);
    return filename;
  } finally {
    const remaining = new File(directory, filename + '.part');
    if (remaining.exists) remaining.delete();
  }
}
