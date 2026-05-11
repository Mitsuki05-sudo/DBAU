import { useEffect, useState } from 'react';
import { MessageSquare, Star, Smile, Frown, Download, X } from 'lucide-react';
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
  
        // Mapping précis selon ton JSON backend
        setDonneesServices((Array.isArray(dataServices) ? dataServices : []).map(item => ({
          service: item.nom || "Inconnu", // On utilise 'nom'
          note: Number(item.note_moyenne) || 0 // On utilise 'note_moyenne'
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
          alert(`Simulation : Génération du PDF pour le service [${serviceExport}] en cours...\n`);
          await adminService.exporterPDF(); 
          setModalExportOuvert(false);
        } catch (error) {
          alert("Erreur lors de l'exportation.");
        }
      };

  return (
    <div>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1>Vue d'ensemble</h1>
          <p>Aperçu global des évaluations de la DBAU.</p>
        </div>
        <button onClick={() => setModalExportOuvert(true)} style={{ backgroundColor: '#10B981', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
          <Download size={18} /> Exporter en PDF
        </button>
      </div>

      {chargement ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Chargement...</div>
      ) : (
        <>
          <div className="kpi-grid">
            <KpiCard titre="Total avis" valeur={kpis.total_avis.toString()} tendance="Période actuelle" estPositif={true} icone={<MessageSquare color="#4318FF" size={28} />} couleurFond="#F4F7FE" />
            <KpiCard titre="Note moyenne" valeur={`${kpis.note_moyenne.toFixed(1)} / 5`} tendance="Période actuelle" estPositif={true} icone={<Star color="white" size={28} fill="white" />} couleurFond="#4318FF" />
            <KpiCard titre="Satisfaction" valeur={`${kpis.taux_satisfaction}%`} tendance="Période actuelle" estPositif={true} icone={<Smile color="#10B981" size={28} />} couleurFond="#ECFDF5" />
            <KpiCard titre="Avis négatifs" valeur={kpis.avis_negatifs.toString()} tendance="À traiter" estPositif={false} icone={<Frown color="#EF4444" size={28} />} couleurFond="#FEF2F2" />
          </div>

          <div className="charts-grid">
            {/* GRAPHIQUE BARRES */}
            <div className="chart-card" style={{ height: '350px' }}>
              <h2 className="chart-title">Satisfaction par Service</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={donneesServices} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  {/* On cache les ticks en bas avec tick={false} */}
                  <XAxis dataKey="service" tick={false} axisLine={false} /> 
                  <YAxis domain={[0, 5]} tickLine={false} axisLine={false} />
                  {/* Le Tooltip affiche les infos au survol */}
                  <TooltipBar 
                    cursor={{fill: '#F8FAFC'}} 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} 
                  />
                  <Bar dataKey="note" fill="#4318FF" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* GRAPHIQUE DONUT */}
            <div className="chart-card" style={{ height: '350px' }}>
               <h2 className="chart-title">Répartition par Motif</h2>
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie 
                      data={donneesMotifs} 
                      dataKey="total" 
                      nameKey="motif" 
                      innerRadius={80} 
                      outerRadius={110}
                    >
                      {donneesMotifs.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COULEURS[index % COULEURS.length]} />
                      ))}
                    </Pie>
                    <TooltipPie />
                    <Legend />
                 </PieChart>
               </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
      
      {modalExportOuvert && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>Exporter un Rapport PDF</h2>
              <button 
                onClick={() => setModalExportOuvert(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '50%', backgroundColor: '#F1F5F9' }}
              >
                <X size={20} color="#64748B"/>
              </button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#475569', fontWeight: 500 }}>Sélectionnez le type de rapport :</label>
              <select 
                value={serviceExport} 
                onChange={(e) => setServiceExport(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', color: '#1E293B' }}
              >
                <option value="Tous">Rapport Global (Tous les services)</option>
                <option value="SAUA">Service des Bourses (SAUA)</option>
                <option value="SAF">Service Financier (SAF)</option>
                <option value="SA">Service Administratif (SA)</option>
                <option value="SIS">Service Informatique (SIS)</option>
              </select>
            </div>

            <button 
              onClick={genererPDF} 
              style={{ width: '100%', backgroundColor: '#10B981', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'background-color 0.3s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
            >
              <Download size={18} /> Télécharger le PDF
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
}