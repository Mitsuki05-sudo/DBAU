import { useState, useEffect, useCallback } from 'react';

type NoteKey = 'note_accueil' | 'note_temps_attente' | 'note_amabilite' | 'note_clarte' | 'note_proprete' | 'note_globale';

interface Motif { id: number; libelle: string; service_id: number; service_code: string; service_nom: string; }
interface Notes { note_accueil: number; note_temps_attente: number; note_amabilite: number; note_clarte: number; note_proprete: number; note_globale: number; }
interface AvisPayload { session_id: string; note_accueil: number; note_temps_attente: number; note_amabilite: number; note_clarte: number; note_proprete: number; note_globale: number; commentaire?: string; motifs: number[]; }
interface ServicesEvalues { date: string; serviceIds: number[]; }

const CRITERES: { key: NoteKey; label: string; icone: string; description: string }[] = [
  { key: 'note_accueil', label: 'Accueil', icone: 'bi-person-check-fill', description: 'Prise en charge à votre arrivée' },
  { key: 'note_temps_attente', label: 'Temps d\'attente', icone: 'bi-clock-fill', description: 'Durée avant d\'être servi' },
  { key: 'note_amabilite', label: 'Amabilité', icone: 'bi-emoji-smile-fill', description: 'Courtoisie du personnel' },
  { key: 'note_clarte', label: 'Clarté', icone: 'bi-info-circle-fill', description: 'Qualité des informations reçues' },
  { key: 'note_proprete', label: 'Propreté', icone: 'bi-building-check', description: 'État des lieux et du matériel' },
  { key: 'note_globale', label: 'Satisfaction', icone: 'bi-trophy-fill', description: 'Votre satisfaction générale' },
];

const NOTES_DEFAUT: Notes = { note_accueil: 3, note_temps_attente: 3, note_amabilite: 3, note_clarte: 3, note_proprete: 3, note_globale: 3 };

const LABELS_NOTE = ['', 'Très insatisfait', 'Insatisfait', 'Neutre', 'Satisfait', 'Très satisfait'];
const COULEURS_NOTE = ['', '#DC2626', '#F5A623', '#EAB308', '#1B6B3A', '#15803D'];

function obtenirDateDuJour(): string { return new Date().toISOString().slice(0, 10); }

function lireServicesEvalues(): number[] {
  try {
    const raw = localStorage.getItem('sgec_services_evalues');
    if (!raw) return [];
    const parsed: ServicesEvalues = JSON.parse(raw);
    if (parsed.date !== obtenirDateDuJour()) { localStorage.removeItem('sgec_services_evalues'); return []; }
    return parsed.serviceIds;
  } catch { return []; }
}

function enregistrerServiceEvalue(serviceId: number): void {
  const existants = lireServicesEvalues();
  if (existants.includes(serviceId)) return;
  localStorage.setItem('sgec_services_evalues', JSON.stringify({ date: obtenirDateDuJour(), serviceIds: [...existants, serviceId] }));
}

function initialiserSessionId(): string {
  const e = localStorage.getItem('sgec_session_id');
  if (e) return e;
  const n = crypto.randomUUID();
  localStorage.setItem('sgec_session_id', n);
  return n;
}

function EtoileInteractive({ active, survol, onClick, onEnter, onLeave, taille = 32 }: { active: boolean; survol: boolean; onClick: () => void; onEnter: () => void; onLeave: () => void; taille?: number }) {
  return (
    <button type="button" onClick={onClick} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{ background: 'none', border: 'none', padding: '3px', cursor: 'pointer', lineHeight: 1, transition: 'transform 0.15s ease', transform: survol ? 'scale(1.25)' : active ? 'scale(1.1)' : 'scale(1)' }}>
      <i className={active || survol ? 'bi bi-star-fill' : 'bi bi-star'}
        style={{ fontSize: `${taille}px`, color: active || survol ? '#F5A623' : '#D1D5DB', transition: 'color 0.15s ease, transform 0.15s ease', display: 'block' }} />
    </button>
  );
}

export default function FeedbackForm() {
  const [motifs, setMotifs] = useState<Motif[]>([]);
  const [motifSelectionne, setMotifSelectionne] = useState<number | null>(null);
  const [notes, setNotes] = useState<Notes>(NOTES_DEFAUT);
  const [hoverNotes, setHoverNotes] = useState<Partial<Record<NoteKey, number>>>({});
  const [commentaire, setCommentaire] = useState('');
  const [chargementMotifs, setChargementMotifs] = useState(true);
  const [erreurMotifs, setErreurMotifs] = useState(false);
  const [motifErreur, setMotifErreur] = useState(false);
  const [serviceDejaEvalue, setServiceDejaEvalue] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [soumis, setSoumis] = useState(false);
  const [synchronise, setSynchronise] = useState(false);
  const [enLigne, setEnLigne] = useState(navigator.onLine);
  const [erreurEnvoi, setErreurEnvoi] = useState(false);
  const [sessionId] = useState<string>(initialiserSessionId);
  const [etapeActive, setEtapeActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [carteAnimee, setCarteAnimee] = useState<number | null>(null);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const chargerMotifs = useCallback(async () => {
    setChargementMotifs(true); setErreurMotifs(false);
    try {
      const r = await fetch('http://localhost:3000/api/feedback/motifs');
      if (!r.ok) throw new Error();
      setMotifs(await r.json());
    } catch { setErreurMotifs(true); }
    finally { setChargementMotifs(false); }
  }, []);

  const syncAvisEnAttente = useCallback(async () => {
    const pj = localStorage.getItem('sgec_pending_avis');
    if (!pj) return;
    try {
      const r = await fetch('http://localhost:3000/api/feedback/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: pj });
      if (r.ok) { localStorage.removeItem('sgec_pending_avis'); localStorage.setItem('sgec_sync_status', 'synced'); setSynchronise(true); }
    } catch { }
  }, []);

  useEffect(() => {
    const verifier = async () => {
      try {
        const r = await fetch(`http://localhost:3000/api/feedback/check-session/${sessionId}`);
        if (r.ok) {
          const { serviceIdsDejaEvalues } = await r.json();
          if (Array.isArray(serviceIdsDejaEvalues) && serviceIdsDejaEvalues.length > 0) {
            localStorage.setItem('sgec_services_evalues', JSON.stringify({ date: obtenirDateDuJour(), serviceIds: serviceIdsDejaEvalues }));
          }
        }
      } catch { }
      await chargerMotifs();
    };
    verifier();
  }, [sessionId, chargerMotifs]);

  useEffect(() => {
    const online = () => { setEnLigne(true); syncAvisEnAttente(); };
    const offline = () => setEnLigne(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline); };
  }, [syncAvisEnAttente]);

  useEffect(() => {
    if (soumis && enLigne && localStorage.getItem('sgec_pending_avis')) syncAvisEnAttente();
  }, [soumis, enLigne, syncAvisEnAttente]);

  useEffect(() => {
    if (motifSelectionne === null) { setServiceDejaEvalue(false); return; }
    const m = motifs.find(x => x.id === motifSelectionne);
    if (!m) return;
    setServiceDejaEvalue(lireServicesEvalues().includes(m.service_id));
  }, [motifSelectionne, motifs]);

  const soumettreAvis = async () => {
    if (motifSelectionne === null) { setMotifErreur(true); return; }
    const m = motifs.find(x => x.id === motifSelectionne);
    if (m && lireServicesEvalues().includes(m.service_id)) { setServiceDejaEvalue(true); return; }
    setEnvoi(true); setErreurEnvoi(false);
    const payload: AvisPayload = { session_id: sessionId, ...notes, commentaire: commentaire.trim() || undefined, motifs: [motifSelectionne] };
    if (!navigator.onLine) {
      localStorage.setItem('sgec_pending_avis', JSON.stringify(payload));
      localStorage.setItem('sgec_sync_status', 'pending');
      if (m) enregistrerServiceEvalue(m.service_id);
      setSoumis(true); setSynchronise(false); setEnvoi(false); return;
    }
    try {
      const r = await fetch('http://localhost:3000/api/feedback/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (r.ok) {
        if (m) enregistrerServiceEvalue(m.service_id);
        localStorage.setItem('sgec_sync_status', 'synced');
        setSoumis(true); setSynchronise(true);
      } else if (r.status === 409) {
        if (m) enregistrerServiceEvalue(m.service_id);
        setServiceDejaEvalue(true);
      } else { setErreurEnvoi(true); }
    } catch { setErreurEnvoi(true); }
    finally { setEnvoi(false); }
  };

  const servicesUniques = motifs.reduce<{ service_id: number; service_nom: string }[]>((acc, m) => {
    if (!acc.find(s => s.service_id === m.service_id)) acc.push({ service_id: m.service_id, service_nom: m.service_nom });
    return acc;
  }, []);

  const noteGlobaleActuelle = notes.note_globale;
  const progressionFormulaire = (() => {
    let score = 0;
    if (motifSelectionne) score += 40;
    score += 40;
    if (commentaire.trim()) score += 20;
    return score;
  })();

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes checkBounce { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes ripple { 0% { transform: scale(0); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes floatUp { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-40px); opacity: 0; } }
        .carte-critere { transition: all 0.2s ease; }
        .carte-critere:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(27,107,58,0.12) !important; }
        .btn-soumettre { position: relative; overflow: hidden; }
        .btn-soumettre::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.15); opacity: 0; transition: opacity 0.2s; }
        .btn-soumettre:hover::after { opacity: 1; }
        @media print { body * { visibility: hidden !important; } }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F0FAF4 0%, #F4F7F5 50%, #EEF4FF 100%)', opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}>

        <header style={{ background: 'linear-gradient(135deg, #1B6B3A 0%, #145230 100%)', padding: '0', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(27,107,58,0.3)' }}>
          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/1/13/Coat_of_arms_of_Benin.svg" alt="" style={{ height: '48px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
              <div>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(13px,3vw,16px)', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.02em' }}>DBAU</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(9px,2vw,11px)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.3 }}>Direction des Bourses<br />et Aides Universitaires</div>
                <div style={{ display: 'flex', height: '2px', marginTop: '4px', borderRadius: '1px', overflow: 'hidden', width: '80px' }}>
                  <div style={{ flex: 1, background: '#4ADE80' }} /><div style={{ flex: 1, background: '#FCD34D' }} /><div style={{ flex: 1, background: '#F87171' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: enLigne ? '#4ADE80' : '#F87171', display: 'inline-block', boxShadow: enLigne ? '0 0 6px #4ADE80' : 'none', animation: enLigne ? 'pulse 2s infinite' : 'none' }} />
                <span style={{ color: '#fff', fontSize: '12px', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap' }}>{enLigne ? 'En ligne' : 'Hors ligne'}</span>
              </div>
            </div>
          </div>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)' }}>
            <div style={{ height: '100%', width: `${progressionFormulaire}%`, background: 'linear-gradient(90deg, #4ADE80, #F5A623)', transition: 'width 0.5s ease', borderRadius: '0 2px 2px 0' }} />
          </div>
        </header>

        {soumis ? (
          <div style={{ maxWidth: '520px', margin: '0 auto', padding: '40px 16px' }}>
            <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 8px 40px rgba(27,107,58,0.12)', padding: '48px 32px', textAlign: 'center', animation: 'fadeSlideUp 0.5s ease' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #1B6B3A, #4ADE80)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'checkBounce 0.6s ease', boxShadow: '0 8px 24px rgba(27,107,58,0.3)' }}>
                <i className="bi bi-check-lg" style={{ fontSize: '40px', color: '#fff' }} />
              </div>
              <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '26px', fontWeight: 700, color: '#1A2E1F', marginBottom: '10px' }}>Merci pour votre avis !</h2>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '15px', color: '#5A7262', marginBottom: '24px', lineHeight: 1.6 }}>Votre retour a bien été enregistré. Il contribuera directement à l'amélioration de nos services.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '20px' }}>
                {[1, 2, 3, 4, 5].map(i => <i key={i} className={i <= noteGlobaleActuelle ? 'bi bi-star-fill' : 'bi bi-star'} style={{ fontSize: '24px', color: i <= noteGlobaleActuelle ? '#F5A623' : '#E2EDE6', animation: `checkBounce 0.4s ease ${i * 0.1}s both` }} />)}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '20px', fontSize: '13px', fontFamily: "'Inter',sans-serif", background: synchronise ? '#EBF2EE' : '#FFF7ED', color: synchronise ? '#1B6B3A' : '#92400E', fontWeight: 500 }}>
                <i className={synchronise ? 'bi bi-cloud-check-fill' : 'bi bi-clock-history'} />
                {synchronise ? 'Avis synchronisé avec le serveur' : 'En attente de synchronisation — envoi automatique à la reconnexion'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px 60px' }}>

            <div style={{ background: 'linear-gradient(135deg, #1B6B3A 0%, #2D9558 100%)', borderRadius: '20px', padding: '28px', marginBottom: '20px', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(27,107,58,0.25)', animation: 'fadeSlideUp 0.4s ease' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: '-20px', right: '40px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-chat-heart-fill" style={{ fontSize: '22px', color: '#FCD34D' }} />
                  </div>
                  <div>
                    <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '20px', fontWeight: 700, margin: 0 }}>Votre avis compte</h1>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Ministère de l'Enseignement Supérieur · République du Bénin</p>
                  </div>
                </div>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.6 }}>
                  Partagez votre expérience et aidez-nous à améliorer la qualité de nos services. Votre avis est anonyme et confidentiel.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', background: 'rgba(255,255,255,0.12)', borderRadius: '8px', padding: '5px 10px' }}>
                  <i className="bi bi-shield-check" style={{ fontSize: '13px', color: '#4ADE80' }} />
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.9)' }}>Aucune donnée personnelle collectée</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '18px', boxShadow: '0 4px 20px rgba(27,107,58,0.08)', padding: '24px', marginBottom: '16px', animation: 'fadeSlideUp 0.4s ease 0.1s both' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: 700, color: '#1A2E1F', marginBottom: '12px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EBF2EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-clipboard2-check" style={{ color: '#1B6B3A', fontSize: '14px' }} />
                </span>
                Motif de votre visite <span style={{ color: '#DC2626', marginLeft: '2px' }}>*</span>
              </label>
              {chargementMotifs ? (
                <div style={{ height: '44px', borderRadius: '10px', background: 'linear-gradient(90deg,#E2EDE6 25%,#F4F7F5 50%,#E2EDE6 75%)', backgroundSize: '200%', animation: 'shimmer 1.5s infinite' }} />
              ) : erreurMotifs ? (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="bi bi-exclamation-triangle" style={{ color: '#DC2626' }} />
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#DC2626', flex: 1 }}>Impossible de charger les motifs.</span>
                  <button onClick={chargerMotifs} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: '7px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer' }}>Réessayer</button>
                </div>
              ) : (
                <>
                  <select className={`form-select${motifErreur ? ' is-invalid' : ''}`} value={motifSelectionne ?? ''}
                    onChange={e => { setMotifSelectionne(parseInt(e.target.value)); setMotifErreur(false); setServiceDejaEvalue(false); }}
                    style={{ fontFamily: "'Inter',sans-serif", borderRadius: '10px', borderColor: motifErreur ? '#DC2626' : '#E2EDE6', fontSize: '14px', padding: '10px 14px', transition: 'border-color 0.2s' }}>
                    <option value="" disabled>— Sélectionnez le motif de votre visite —</option>
                    {servicesUniques.map(s => (
                      <optgroup key={s.service_id} label={s.service_nom}>
                        {motifs.filter(m => m.service_id === s.service_id).map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  {motifErreur && <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#DC2626', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><i className="bi bi-exclamation-circle" />Veuillez sélectionner un motif de visite.</div>}
                </>
              )}
              {serviceDejaEvalue && (
                <div style={{ marginTop: '10px', background: '#FFF7ED', border: '1px solid #FCD34D', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <i className="bi bi-exclamation-circle-fill" style={{ color: '#F5A623', fontSize: '16px', flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <strong style={{ fontFamily: "'Outfit',sans-serif", fontSize: '13px', color: '#92400E', display: 'block' }}>Avis déjà enregistré</strong>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#92400E' }}>Vous avez déjà évalué ce service dans les 8 dernières heures. Vous pouvez en sélectionner un autre.</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: '#fff', borderRadius: '18px', boxShadow: '0 4px 20px rgba(27,107,58,0.08)', padding: '24px', marginBottom: '16px', animation: 'fadeSlideUp 0.4s ease 0.15s both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EBF2EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-star-half" style={{ color: '#1B6B3A', fontSize: '14px' }} />
                </span>
                <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '16px', fontWeight: 700, color: '#1A2E1F', margin: 0 }}>Évaluez votre expérience</h3>
              </div>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#5A7262', marginBottom: '18px', marginLeft: '36px' }}>Cliquez sur les étoiles pour noter chaque critère</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '12px' }}>
                {CRITERES.map(({ key, label, icone, description }, idx) => {
                  const valeurAffichee = hoverNotes[key] ?? notes[key];
                  const couleurActuelle = COULEURS_NOTE[valeurAffichee] || '#5A7262';
                  return (
                    <div key={key} className="carte-critere"
                      style={{ background: carteAnimee === idx ? 'linear-gradient(135deg, #EBF2EE, #F4F7F5)' : '#F9FAFB', borderRadius: '12px', padding: '16px', border: `1px solid ${carteAnimee === idx ? '#1B6B3A' : '#E2EDE6'}`, boxShadow: '0 2px 8px rgba(27,107,58,0.05)', transition: 'all 0.2s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${couleurActuelle}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
                          <i className={icone} style={{ fontSize: '16px', color: couleurActuelle, transition: 'color 0.3s' }} />
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', fontWeight: 600, color: '#1A2E1F' }}>{label}</div>
                          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#5A7262' }}>{description}</div>
                        </div>
                        {hoverNotes[key] !== undefined || notes[key] ? (
                          <span style={{ marginLeft: 'auto', fontFamily: "'Outfit',sans-serif", fontSize: '11px', fontWeight: 700, color: couleurActuelle, background: `${couleurActuelle}15`, borderRadius: '6px', padding: '2px 7px', whiteSpace: 'nowrap' }}>
                            {LABELS_NOTE[valeurAffichee]}
                          </span>
                        ) : null}
                      </div>
                      <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <EtoileInteractive key={i} active={(hoverNotes[key] ?? notes[key]) >= i} survol={false}
                            onClick={() => { setNotes(p => ({ ...p, [key]: i })); setCarteAnimee(idx); setTimeout(() => setCarteAnimee(null), 400); }}
                            onEnter={() => setHoverNotes(p => ({ ...p, [key]: i }))}
                            onLeave={() => setHoverNotes(p => { const c = { ...p }; delete c[key]; return c; })} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '18px', boxShadow: '0 4px 20px rgba(27,107,58,0.08)', padding: '24px', marginBottom: '16px', animation: 'fadeSlideUp 0.4s ease 0.2s both' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: 700, color: '#1A2E1F', marginBottom: '12px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EBF2EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-pencil-square" style={{ color: '#1B6B3A', fontSize: '14px' }} />
                </span>
                Commentaire <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', fontWeight: 400, color: '#5A7262', marginLeft: '4px' }}>(facultatif)</span>
              </label>
              <textarea className="form-control" rows={4} maxLength={800}
                placeholder="Décrivez votre expérience en détail… Ce que vous avez apprécié, ce qui pourrait être amélioré…"
                value={commentaire} onChange={e => setCommentaire(e.target.value)}
                style={{ fontFamily: "'Inter',sans-serif", borderRadius: '10px', borderColor: '#E2EDE6', resize: 'vertical', fontSize: '14px', lineHeight: 1.6, transition: 'border-color 0.2s' }}
                onFocus={e => (e.target.style.borderColor = '#1B6B3A')} onBlur={e => (e.target.style.borderColor = '#E2EDE6')} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#5A7262' }}>
                  {commentaire.trim() && <><i className="bi bi-check-circle-fill" style={{ color: '#1B6B3A', marginRight: '4px' }} />Commentaire ajouté</>}
                </span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: commentaire.length > 750 ? '#DC2626' : '#5A7262' }}>
                  {commentaire.length} / 800
                </span>
              </div>
            </div>

            <div style={{ animation: 'fadeSlideUp 0.4s ease 0.25s both' }}>
              <button type="button" className="btn-soumettre" disabled={envoi || serviceDejaEvalue} onClick={soumettreAvis}
                style={{ width: '100%', padding: '16px', background: serviceDejaEvalue ? '#9CA3AF' : 'linear-gradient(135deg, #1B6B3A 0%, #2D9558 100%)', color: '#FFFFFF', borderRadius: '14px', border: 'none', fontFamily: "'Outfit',sans-serif", fontSize: '17px', fontWeight: 700, cursor: envoi || serviceDejaEvalue ? 'not-allowed' : 'pointer', opacity: envoi ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: serviceDejaEvalue ? 'none' : '0 6px 20px rgba(27,107,58,0.3)', transition: 'all 0.2s ease', letterSpacing: '0.02em' }}>
                {envoi ? (<><span className="spinner-border spinner-border-sm text-white" style={{ width: '18px', height: '18px' }} />Envoi en cours…</>) : (<><i className="bi bi-send-fill" />Envoyer mon avis</>)}
              </button>
              {erreurEnvoi && (
                <div style={{ marginTop: '12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#DC2626' }}>
                  <i className="bi bi-wifi-off" />Erreur de connexion. Vérifiez votre réseau et réessayez.
                </div>
              )}
              <p style={{ textAlign: 'center', fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#9CA3AF', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <i className="bi bi-shield-lock" />Vos données sont anonymes et sécurisées · DBAU {new Date().getFullYear()}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}