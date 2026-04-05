import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Bhandara, UserProfile } from "@/types";

const BHANDARAS_KEY = "bhandara_events_v2";
const USER_KEY = "bhandara_user_v2";

const SAMPLE_BHANDARAS: Bhandara[] = [
  {
    id: "1",
    title: "Guru Nanak Jayanti Langar",
    date: "2026-04-15",
    time: "10:00 AM",
    address: "Gurudwara Bangla Sahib, Connaught Place, New Delhi",
    description: "Annual langar seva on Guru Nanak Jayanti. Free food for all. All are welcome regardless of religion.",
    organizer: "Seva Committee",
    lat: 28.6274,
    lng: 77.2090,
    category: "gurudwara",
    expectedAttendees: 2000,
    status: "upcoming",
    createdBy: "9999999999",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Ram Navami Bhandara",
    date: "2026-04-06",
    time: "12:00 PM",
    address: "Birla Mandir, Mandir Marg, New Delhi",
    description: "Free prasad distribution and bhandara on Ram Navami. Puri-sabzi and halwa prasad.",
    organizer: "Shri Ram Seva Dal",
    lat: 28.6327,
    lng: 77.2006,
    category: "temple",
    expectedAttendees: 800,
    status: "upcoming",
    createdBy: "9999999999",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Hanuman Jayanti Community Meal",
    date: "2026-04-08",
    time: "8:00 AM",
    address: "Hanuman Mandir, Connaught Place, New Delhi",
    description: "Prasad distribution and community meal for all devotees. Boondi ladoo prasad.",
    organizer: "Mandir Trust",
    lat: 28.6318,
    lng: 77.2175,
    category: "temple",
    expectedAttendees: 500,
    status: "upcoming",
    createdBy: "9999999999",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Friday Langar — Masjid Community Kitchen",
    date: "2026-04-10",
    time: "1:00 PM",
    address: "Jama Masjid, Chandni Chowk, Old Delhi",
    description: "Weekly community langar after Friday prayers. Dal, roti, and biryani served to all.",
    organizer: "Community Kitchen Trust",
    lat: 28.6507,
    lng: 77.2334,
    category: "community",
    expectedAttendees: 1200,
    status: "upcoming",
    createdBy: "9999999999",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Navratri Bhandara",
    date: "2026-04-20",
    time: "6:00 PM",
    address: "Chhatarpur Mandir, Mehrauli, New Delhi",
    description: "Special navratri saatvik bhandara. Halwa puri and kheer prasad for all devotees.",
    organizer: "Chhatarpur Mandir Samiti",
    lat: 28.4969,
    lng: 77.1721,
    category: "temple",
    expectedAttendees: 3000,
    status: "upcoming",
    createdBy: "9999999999",
    createdAt: new Date().toISOString(),
  },
];

interface AppContextType {
  user: UserProfile | null;
  isLoading: boolean;
  bhandaras: Bhandara[];
  login: (phone: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  addBhandara: (b: Omit<Bhandara, "id" | "createdAt" | "createdBy">) => void;
  updateBhandara: (id: string, updates: Partial<Bhandara>) => void;
  deleteBhandara: (id: string) => void;
  getMyBhandaras: () => Bhandara[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bhandaras, setBhandaras] = useState<Bhandara[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [userData, bhandaraData] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(BHANDARAS_KEY),
        ]);
        if (userData) setUser(JSON.parse(userData));
        setBhandaras(bhandaraData ? JSON.parse(bhandaraData) : SAMPLE_BHANDARAS);
      } catch {
        setBhandaras(SAMPLE_BHANDARAS);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const login = useCallback(async (phone: string, name: string) => {
    const profile: UserProfile = { phone, name, createdAt: new Date().toISOString() };
    setUser(profile);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  }, []);

  const saveBhandaras = useCallback(async (updated: Bhandara[]) => {
    setBhandaras(updated);
    await AsyncStorage.setItem(BHANDARAS_KEY, JSON.stringify(updated));
  }, []);

  const addBhandara = useCallback(
    (b: Omit<Bhandara, "id" | "createdAt" | "createdBy">) => {
      const newB: Bhandara = {
        ...b,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        createdBy: user?.phone ?? "unknown",
        createdAt: new Date().toISOString(),
      };
      saveBhandaras([newB, ...bhandaras]);
    },
    [bhandaras, saveBhandaras, user]
  );

  const updateBhandara = useCallback(
    (id: string, updates: Partial<Bhandara>) => {
      saveBhandaras(bhandaras.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    },
    [bhandaras, saveBhandaras]
  );

  const deleteBhandara = useCallback(
    (id: string) => {
      saveBhandaras(bhandaras.filter((b) => b.id !== id));
    },
    [bhandaras, saveBhandaras]
  );

  const getMyBhandaras = useCallback(
    () => bhandaras.filter((b) => b.createdBy === user?.phone),
    [bhandaras, user]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        bhandaras,
        login,
        logout,
        addBhandara,
        updateBhandara,
        deleteBhandara,
        getMyBhandaras,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
