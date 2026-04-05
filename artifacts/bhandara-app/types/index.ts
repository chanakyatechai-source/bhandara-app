export type BhandaraCategory = "langar" | "temple" | "gurudwara" | "community" | "other";
export type BhandaraStatus = "upcoming" | "ongoing" | "completed";

export interface Bhandara {
  id: string;
  title: string;
  date: string;
  time: string;
  address: string;
  description: string;
  organizer: string;
  lat: number;
  lng: number;
  category: BhandaraCategory;
  expectedAttendees: number;
  status: BhandaraStatus;
  createdBy: string;
  createdAt: string;
}

export interface UserProfile {
  phone: string;
  name: string;
  createdAt: string;
}
