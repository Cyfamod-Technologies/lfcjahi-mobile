export type Tab = 'Home' | 'Messages' | 'Prayers' | 'Saved';
export type Service = 'All' | 'Sunday' | 'Midweek';
export interface Message {
  id: string;
  title: string;
  pastor: string;
  service: string;
  date: string;
  audioUrl: string;
  image: number;
  imageUrl?: string;
  downloadUrl?: string;
  description?: string;
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

export interface District {
  id: string;
  name: string;
  coverageAreas: string;
  outreachPastor: string;
  outreachMinister: string;
  outreachLocation: string;
  homeCellPastors: string[];
  homeCellMinister: string;
  zones: {
    id: string;
    name: string;
    zoneMinister: string;
    cells: {
      id: string;
      name: string;
      address: string;
      minister: string;
      phone: string;
    }[];
  }[];
}
