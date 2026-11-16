import type { District, Message } from './types';

export const apiBaseUrl = (process.env.EXPO_PUBLIC_API_URL || 'https://api.lfcjahi.com')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');
export const siteBaseUrl = (process.env.EXPO_PUBLIC_SITE_URL || 'https://lfcjahi.com')
  .trim()
  .replace(/\/+$/, '');
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const str = (value: unknown) => (typeof value === 'string' ? value : '');
const rows = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
export function mediaUrl(value: unknown): string {
  const path = str(value).trim();
  if (!path) return '';
  try {
    const url = new URL(path, apiBaseUrl + '/');
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}
export function normalizeMessages(items: unknown[]): Message[] {
  return items
    .flatMap((value) => {
      const item = record(value);
      const audioUrl = mediaUrl(item.mediaUrl);
      if (str(item.category).toLowerCase() !== 'audio' || !audioUrl || !item.id) return [];
      const date = (str(item.mediaDate) || str(item.createdAt)).slice(0, 10);
      return [
        {
          id: String(item.id),
          title: str(item.title) || 'Untitled message',
          pastor: str(item.speaker) || 'LFC Jahi',
          service: str(item.subcategory) || 'Audio',
          date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '',
          audioUrl,
          image: 0,
          imageUrl: mediaUrl(item.thumbnailUrl) || mediaUrl(item.speakerImageUrl),
          downloadUrl:
            mediaUrl(item.downloadUrl) ||
            `${apiBaseUrl}/api/media/${encodeURIComponent(String(item.id))}/download`,
          description: str(item.description),
          url: `${siteBaseUrl}/messages/${encodeURIComponent(String(item.id))}`,
        },
      ];
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
export function normalizeDistricts(items: unknown[]): District[] {
  return items.map((value, index) => {
    const d = record(value);
    return {
      id: String(d.id ?? index),
      name: str(d.name),
      coverageAreas: str(d.coverageAreas),
      outreachPastor: str(d.outreachPastor),
      outreachMinister: str(d.outreachMinister),
      outreachLocation: str(d.outreachLocation),
      homeCellPastors: rows(d.homeCellPastors).filter((v): v is string => typeof v === 'string'),
      homeCellMinister: str(d.homeCellMinister),
      zones: rows(d.zones).map((value, zi) => {
        const z = record(value);
        return {
          id: String(z.id ?? zi),
          name: str(z.name),
          zoneMinister: str(z.zoneMinister),
          cells: rows(z.cells).map((value, ci) => {
            const c = record(value);
            return {
              id: String(c.id ?? ci),
              name: str(c.name),
              address: str(c.address),
              minister: str(c.minister),
              phone: str(c.phone),
            };
          }),
        };
      }),
    };
  });
}
export async function fetchCollection(
  path: 'media' | 'districts',
  signal?: AbortSignal,
): Promise<unknown[]> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort);
  const timer = setTimeout(abort, 15000);
  try {
    const response = await fetch(`${apiBaseUrl}/api/${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const payload: unknown = await response.json();
    const data = record(payload).data;
    if (!Array.isArray(data)) throw new Error('Unexpected server response');
    return data;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
