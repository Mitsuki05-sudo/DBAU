import { Star } from 'lucide-react';
import './AvisTable.css';

// On définit à quoi ressemble une ligne de notre tableau
export interface AvisData {
  id: string;
  date: string;
  service: string;
  motif: string;
  note: number;
  commentaire: string;
  statut: 'Traité' | 'Non traité';
}

interface AvisTableProps {
  titre: string;
  donnees: AvisData[];
}

export default function AvisTable({ titre, donnees }: AvisTableProps) {
  // Fonction pour dessiner les étoiles en fonction de la note
  const renderStars = (note: number) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={16} 
            fill={star <= note ? "#F59E0B" : "transparent"} 
            color={star <= note ? "#F59E0B" : "#CBD5E1"} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="table-container">
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1E293B' }}>{titre}</h2>
      
      <table className="custom-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Service</th>
            <th>Motif de visite</th>
            <th>Note globale</th>
            <th>Commentaire</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {donnees.map((avis) => (
            <tr key={avis.id}>
              <td style={{ color: '#64748B' }}>{avis.date}</td>
              <td style={{ fontWeight: '600' }}>{avis.service}</td>
              <td>{avis.motif}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {renderStars(avis.note)}
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748B' }}>{avis.note}/5</span>
                </div>
              </td>
              <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {avis.commentaire}
              </td>
              <td>
                <span className={`status-badge ${avis.statut === 'Traité' ? 'status-traite' : 'status-non-traite'}`}>
                  {avis.statut}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}