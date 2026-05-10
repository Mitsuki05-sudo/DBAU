import './KpiCard.css';

interface KpiCardProps {
  titre: string;
  valeur: string;
  tendance: string;
  estPositif: boolean;
  icone: React.ReactNode;
  couleurFond: string;
}

export default function KpiCard({ titre, valeur, tendance, estPositif, icone, couleurFond }: KpiCardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-wrapper" style={{ backgroundColor: couleurFond }}>
        {icone}
      </div>
      <div className="kpi-info">
        <h3>{titre}</h3>
        <div className="value">{valeur}</div>
        <div className={`trend ${estPositif ? 'positive' : 'negative'}`}>
          {tendance} vs période précédente
        </div>
      </div>
    </div>
  );
}
