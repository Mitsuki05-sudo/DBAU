import { useEffect, useState } from 'react';
import AvisTable, { type AvisData } from '../components/dashboard/AvisTable';
import { adminService } from '../services/api';

export default function AvisNegatifs() {
  const [avis, setAvis] = useState<AvisData[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const fetchAvis = async () => {
      try {
        const dataBdd = await adminService.getAvisNegatifs();
        
        // On transforme les données de la base de données pour notre tableau
        // (On vérifie si dataBdd est bien un tableau, sinon on renvoie un tableau vide)
        const donneesFormatees: AvisData[] = Array.isArray(dataBdd) ? dataBdd.map((item: any) => ({
          id: item.id.toString(),
          date: new Date(item.date_soumission).toLocaleString('fr-FR'),
          service: item.services_nom || item.services || 'Non spécifié',
          motif: item.motifs || 'Non spécifié',
          note: item.note_globale,
          commentaire: item.commentaire || 'Aucun commentaire',
          statut: (item.traite ? 'Traité' : 'Non traité') as 'Traité' | 'Non traité',
        })) : [];

        setAvis(donneesFormatees);
      } catch (error) {
        console.error("Erreur Backend :", error);
      } finally {
        setChargement(false);
      }
    };

    fetchAvis();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: '#1E293B', marginBottom: '4px', fontWeight: 'bold' }}>Avis Négatifs</h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Gestion des avis nécessitant une attention particulière (Note ≤ 2).</p>
      </div>

      {chargement ? (
        <p>Chargement des avis depuis la base de données...</p>
      ) : (
        <AvisTable titre="Derniers avis négatifs signalés" donnees={avis} />
      )}
    </div>
  );
}