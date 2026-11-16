import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import type { Message } from '../types';
import { downloadAudio, localAudio } from '../downloads/storage';
const key = 'lfc-downloads-v1';
export interface DownloadedMessage {
  message: Message;
  filename: string;
}
function valid(value: unknown): value is DownloadedMessage[] {
  return (
    Array.isArray(value) &&
    value.every(
      (v) =>
        v &&
        typeof v.filename === 'string' &&
        !/[\\/]/.test(v.filename) &&
        v.message &&
        ['id', 'title', 'pastor', 'service', 'date', 'audioUrl', 'url'].every(
          (k) => typeof v.message[k] === 'string',
        ) &&
        typeof v.message.image === 'number',
    )
  );
}
export function useDownloads() {
  const [records, setRecords] = useState<DownloadedMessage[]>([]);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<{ id: string; progress: number | null } | null>(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    let mounted = true;
    void AsyncStorage.getItem(key)
      .then((raw) => {
        const data: unknown = raw ? JSON.parse(raw) : [];
        if (mounted && valid(data)) setRecords(data.filter((r) => !!localAudio(r.filename)));
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
      pending.current?.abort();
    };
  }, []);
  const source = useCallback(
    (message: Message) => {
      const r = records.find((r) => r.message.id === message.id);
      return (r && localAudio(r.filename)) || message.audioUrl;
    },
    [records],
  );
  async function download(message: Message) {
    if (!ready) return;
    const existing = records.find((r) => r.message.id === message.id);
    if (existing && localAudio(existing.filename)) {
      Alert.alert('Already downloaded', 'This message is available offline in Saved.');
      return;
    }
    if (pending.current) {
      Alert.alert(
        'Download in progress',
        'Please wait for the current message to finish downloading.',
      );
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setActive({ id: message.id, progress: 0 });
    try {
      const filename = await downloadAudio(
        message,
        (progress) => {
          if (!controller.signal.aborted) setActive({ id: message.id, progress });
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (filename) {
        const updated = [
          ...records.filter((r) => r.message.id !== message.id),
          { message, filename },
        ];
        await AsyncStorage.setItem(key, JSON.stringify(updated));
        setRecords(updated);
      }
      Alert.alert(
        'Download successful',
        Platform.OS === 'web'
          ? 'The audio file has been sent to your browser’s downloads.'
          : 'Saved on this device. Find it in Saved and listen offline.',
      );
    } catch {
      if (!controller.signal.aborted)
        Alert.alert(
          'Download failed',
          'Check your connection and available storage, then try again.',
        );
    } finally {
      pending.current = null;
      if (!controller.signal.aborted) setActive(null);
    }
  }
  return { records, ready, active, download, source };
}
