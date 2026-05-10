import { create } from 'zustand';

// On définit le format de notre mémoire
interface DateState {
  dateDebut: string;
  dateFin: string;
  setDates: (debut: string, fin: string) => void;
}

// On récupère la date d'aujourd'hui et celle d'il y a 30 jours par défaut
const today = new Date().toISOString().split('T')[0];
const lastMonth = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];

export const useDateStore = create<DateState>((set) => ({
  dateDebut: lastMonth,
  dateFin: today,
  
  // Fonction pour mettre à jour les dates
  setDates: (debut, fin) => set({ dateDebut: debut, dateFin: fin }),
}));