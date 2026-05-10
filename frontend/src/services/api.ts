import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

// objet "adminService" qui regroupe tous les appels API de l'admin
export const adminService = {
  // Récupérer les KPIs globaux (avec filtres de dates optionnels)
  getKpis: async (dateDebut?: string, dateFin?: string) => {
    try {
      // On construit l'URL avec les paramètres si les dates existent
      let url = '/admin/kpis';
      // if (dateDebut && dateFin) {
      //   url += `?date_debut=${dateDebut}&date_fin=${dateFin}`;
      // }
      
      const response = await api.get(url);
      console.log("DEBUG API KPIS :", response.data);
      return response.data; // Retourne { total_avis, note_moyenne, ... }
    } catch (error) {
      console.error("Erreur lors de la récupération des KPIs:", error);
      return { total_avis: 0, note_moyenne: 0, taux_satisfaction: 0, avis_negatifs: 0 };
    }
  },

  getTousLesAvis: async () => {
    try {
      const response = await api.get('/admin/commentaires');
      return response.data; 
    } catch (error) {
      console.error("Erreur API:", error);
      return [];
    }
  },

  getAvisNegatifs: async () => {
    try {
      const response = await api.get('/admin/avis-negatifs');
      return response.data;
    } catch (error) {
      console.error("Erreur API:", error);
      return [];
    }
  },

  getAnalyseServices: async () => {
    const response = await api.get('/admin/analyse-services');
    return response.data;
  },
  
  getAnalyseMotifs: async () => {
    const response = await api.get('/admin/analyse-motifs');
    return response.data;
  },

  exporterPDF: async () => {
    const response = await api.get('/admin/export-avis');
    return response.data;
  }
};

