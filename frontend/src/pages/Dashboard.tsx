import { useEffect, useState } from 'react';
import { MessageSquare, Star, Smile, Frown, Download, X, Database } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as TooltipBar, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, Tooltip as TooltipPie 
} from 'recharts';
import KpiCard from '../components/dashboard/KpiCard';
import { adminService } from '../services/api';
import { useDateStore } from '../store/useDateStore';
import './Dashboard.css';

export default function Dashboard() {
  const { dateDebut, dateFin } = useDateStore();
  
  const [kpis, setKpis] = useState({ total_avis: 0, note_moyenne: 0, taux_satisfaction: 0, avis_negatifs: 0 });
  const [donneesServices, setDonneesServices] = useState<any[]>([]);
  const [donneesMotifs, setDonneesMotifs] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [modalExportOuvert, setModalExportOuvert] = useState(false);
  const [serviceExport, setServiceExport] = useState("Tous");

  const COULEURS = ['#4318FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  useEffect(() => {
    const chargerToutesLesDonnees = async () => {
      setChargement(true);
      try {
        const [dataKpis, dataServices, dataMotifs] = await Promise.all([
          adminService.getKpis(dateDebut, dateFin),
          adminService.getAnalyseServices(),
          adminService.getAnalyseMotifs()
        ]);
  
        setKpis({
          total_avis: Number(dataKpis?.total_avis) || 0,
          note_moyenne: Number(dataKpis?.note_moyenne) || 0,
          taux_satisfaction: Number(dataKpis?.taux_satisfaction) || 0,
          avis_negatifs: Number(dataKpis?.avis_negatifs) || 0
        });
  
        setDonneesServices((Array.isArray(dataServices) ? dataServices : []).map(item => ({
          service: item.nom || "Inconnu",
          note: Number(item.note_moyenne) || 0 
        })));
  
        setDonneesMotifs((Array.isArray(dataMotifs) ? dataMotifs : [])
        .filter(item => Number(item.nombre_avis) > 0) 
        .map(item => ({
          motif: item.libelle,
          total: Number(item.nombre_avis)
        })));
        
      } catch (error) {
        console.error("Erreur Backend :", error);
      } finally {
        setChargement(false);
      }
    };
    chargerToutesLesDonnees();
  }, [dateDebut, dateFin]);

  const genererPDF = async () => {
    try {
      alert(`Simulation : Génération du PDF pour le service [${serviceExport}] en cours...`);
      await adminService.exporterPDF(); 
      setModalExportOuvert(false);
    } catch (error) {
      alert("Erreur lors de l'exportation.");
    }
  };

  return (
    <div>
      {/* --- EN-TÊTE --- */}
      <div className="dashboard-header dashboard-header-flex">
        <div>
          <h1>Vue d'ensemble</h1>
          <p>Aperçu global des évaluations de la DBAU.</p>
        </div>
        <button onClick={() => setModalExportOuvert(true)} className="btn-export">
          <Download size={18} /> Exporter en PDF
        </button>
      </div>

      {chargement ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Chargement...</div>
      ) : (
        <>
          {/* --- KPIs --- */}
          <div className="kpi-grid">
            <KpiCard titre="Total avis" valeur={kpis.total_avis.toString()} tendance="Période actuelle" estPositif={true} icone={<MessageSquare color="#4318FF" size={28} />} couleurFond="#F4F7FE" />
            <KpiCard titre="Note moyenne" valeur={`${kpis.note_moyenne.toFixed(1)} / 5`} tendance="Période actuelle" estPositif={true} icone={<Star color="white" size={28} fill="white" />} couleurFond="#4318FF" />
            <KpiCard titre="Satisfaction" valeur={`${kpis.taux_satisfaction}%`} tendance="Période actuelle" estPositif={true} icone={<Smile color="#10B981" size={28} />} couleurFond="#ECFDF5" />
            <KpiCard titre="Avis négatifs" valeur={kpis.avis_negatifs.toString()} tendance="À traiter" estPositif={false} icone={<Frown color="#EF4444" size={28} />} couleurFond="#FEF2F2" />
          </div>

          {/* --- GRAPHIQUES --- */}
          <div className="charts-grid">
            
            {/* GRAPHIQUE BARRES */}
            <div className="chart-card">
              <h2 className="chart-title">Satisfaction par Service</h2>
              {donneesServices.length === 0 ? (
                <div className="empty-chart">
                  <Database size={32} style={{opacity: 0.5, marginBottom: '8px'}} />
                  <p>Aucune donnée disponible</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={donneesServices} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="service" tick={false} axisLine={false} /> 
                    <YAxis domain={[0, 5]} tickLine={false} axisLine={false} />
                    <TooltipBar cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                    <Bar dataKey="note" fill="#4318FF" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* GRAPHIQUE DONUT */}
            <div className="chart-card">
               <h2 className="chart-title">Répartition par Motif</h2>
               {donneesMotifs.length === 0 ? (
                 <div className="empty-chart">
                   <Database size={32} style={{opacity: 0.5, marginBottom: '8px'}} />
                   <p>Aucune donnée disponible</p>
                 </div>
               ) : (
                 <ResponsiveContainer width="100%" height={250}>
                   <PieChart>
                      <Pie data={donneesMotifs} dataKey="total" nameKey="motif" innerRadius={70} outerRadius={100} stroke="none">
                        {donneesMotifs.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COULEURS[index % COULEURS.length]} />
                        ))}
                      </Pie>
                      <TooltipPie contentStyle={{borderRadius: '8px', border: 'none'}} />
                      <Legend />
                   </PieChart>
                 </ResponsiveContainer>
               )}
            </div>
          </div>
        </>
      )}
      
      {/* --- FENÊTRE MODAL (EXPORT PDF) --- */}
      {modalExportOuvert && (
        <div className="modal-overlay">
          <div className="modal-content">
            
            <div className="modal-header">
              <h2>Exporter un Rapport PDF</h2>
              <button onClick={() => setModalExportOuvert(false)} className="btn-icon">
                <X size={20} color="#64748B"/>
              </button>
            </div>
            
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#475569' }}>
              Sélectionnez le type de rapport :
            </label>
            <select 
              value={serviceExport} 
              onChange={(e) => setServiceExport(e.target.value)}
              className="modal-select"
            >
              <option value="Tous">Rapport Global (Tous les services)</option>
              <option value="SAUA">Service des Bourses (SAUA)</option>
              <option value="SAF">Service Financier (SAF)</option>
              <option value="SA">Service Administratif (SA)</option>
              <option value="SIS">Service Informatique (SIS)</option>
            </select>

            <button onClick={genererPDF} className="btn-export" style={{width: '100%', justifyContent: 'center'}}>
              <Download size={18} /> Télécharger le PDF
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
}