
export enum Section {
  HOME = 'home',
  EVENTS = 'events',
  MENU = 'menu',
  RESERVATIONS = 'reservations',
  PROJECTS = 'projects', 
  CAREERS = 'careers',
  CMR = 'cmr',
  LEGAL = 'legal',
  PRIVACY = 'privacy',
  COOKIES = 'cookies'
}

export interface MenuItem {
  id?: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  tags?: string[];
  available: boolean; // Novo campo para control de stock
  // Novos campos para viños
  winery?: string;
  winemaker?: string;
  grapes?: string;
  region?: string | null;
  glassPrice?: number | null;
  bottlePrice?: number | null;
  wineType?: string;
}

export type EventCategory = 'Exposición' | 'Zona dos viños' | 'Cata' | '[·] de encontro' | 'Concerto' | 'Arte escénica' | 'Humor' | 'Palabra dita e escrita';

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  image: string;
  category: EventCategory;

  dateStart?: string;
  dateEnd?: string | null;
  timezone?: string;
  locationName?: string | null;
  isPublished?: boolean;
  imageUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  observations?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface ProjectProposal {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  discipline: string;
  description: string;
  bio: string;
  socials: string;
  hasFile: boolean; // Simulating file upload state
  fileBase64?: string;
  createdAt: string;
  status: 'new' | 'read';
}
