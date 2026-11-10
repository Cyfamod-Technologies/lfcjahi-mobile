export type Tab = 'Home' | 'Messages' | 'Prayers' | 'Saved' | 'Connect';
export type Service = 'All' | 'Sunday' | 'Midweek';
export interface Message {
  id: string;
  title: string;
  pastor: string;
  service: string;
  date: string;
  audioUrl: string;
  image: number;
  url: string;
}
export interface Intercession {
  id: string;
  prayer: string;
  reference: string;
  scripture: string;
}
export interface PrayerGuide {
  id: string;
  title: string;
  date: string;
  intercessions: Intercession[];
}
