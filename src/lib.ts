import { Alert, Linking, Share } from 'react-native';
export function dateLabel(date: string, weekday = false) {
  return new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(weekday ? { weekday: 'long' as const } : {}),
  });
}
export function shortDate(date: string) {
  return new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
export function time(value: number) {
  return Number.isFinite(value)
    ? Math.floor(value / 60) + ':' + String(Math.floor(value % 60)).padStart(2, '0')
    : '0:00';
}
export async function openUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Unable to open link', 'Please check your connection and try again.');
  }
}
export async function shareText(title: string, message: string) {
  try {
    await Share.share({ title, message });
  } catch {
    Alert.alert('Unable to share', 'Please try again.');
  }
}
