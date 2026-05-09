import { useState, useEffect, useCallback } from 'react';

type NoteKey =
  | 'note_accueil'
  | 'note_temps_attente'
  | 'note_amabilite'
  | 'note_clarte'
  | 'note_proprete'
  | 'note_globale';

interface Motif {
  id: number;
  libelle: string;
  service_id: number;
  service_code: string;
  service_nom: string;
}

interface Notes {
  note_accueil: number;
  note_temps_attente: number;
  note_amabilite: number;
  note_clarte: number;
  note_proprete: number;
  note_globale: number;
}

interface AvisPayload {
  session_id: string;
  note_accueil: number;
  note_temps_attente: number;
  note_amabilite: number;
  note_clarte: number;
  note_proprete: number;
  note_globale: number;
  commentaire?: string;
  motifs: number[];
}

const CRITERES: { key: NoteKey; label: string; icone: string }[] = [
  { key: 'note_accueil', label: 'Accueil et prise en charge', icone: 'bi-person-check-fill' },
  { key: 'note_temps_attente', label: "Temps d'attente", icone: 'bi-clock-fill' },
  { key: 'note_amabilite', label: 'Amabilité du personnel', icone: 'bi-emoji-smile-fill' },
  { key: 'note_clarte', label: 'Clarté des informations', icone: 'bi-info-circle-fill' },
  { key: 'note_proprete', label: 'Propreté des lieux', icone: 'bi-building-check' },
  { key: 'note_globale', label: 'Satisfaction globale', icone: 'bi-trophy-fill' },
];

const NOTES_DEFAUT: Notes = {
  note_accueil: 3,
  note_temps_attente: 3,
  note_amabilite: 3,
  note_clarte: 3,
  note_proprete: 3,
  note_globale: 3,
};

const STYLE_CARTE: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: '14px',
  boxShadow: '0 2px 16px rgba(27, 107, 58, 0.08)',
  padding: '28px',
  marginBottom: '16px',
};

interface ServicesEvaluesAujourdhui {
  date: string;
  serviceIds: number[];
}

function obtenirDateDuJour(): string {
  return new Date().toISOString().slice(0, 10);
}

function lireServicesEvaluesAujourdhui(): number[] {
  try {
    const raw = localStorage.getItem('sgec_services_evalues');
    if (!raw) return [];
    const parsed: ServicesEvaluesAujourdhui = JSON.parse(raw);
    if (parsed.date !== obtenirDateDuJour()) {
      localStorage.removeItem('sgec_services_evalues');
      return [];
    }
    return parsed.serviceIds;
  } catch {
    return [];
  }
}

function enregistrerServiceEvalue(serviceId: number): void {
  const existants = lireServicesEvaluesAujourdhui();
  if (existants.includes(serviceId)) return;
  const mise_a_jour: ServicesEvaluesAujourdhui = {
    date: obtenirDateDuJour(),
    serviceIds: [...existants, serviceId],
  };
  localStorage.setItem('sgec_services_evalues', JSON.stringify(mise_a_jour));
}

function initialiserSessionId(): string {
  const existant = localStorage.getItem('sgec_session_id');
  if (existant) return existant;
  const nouveau = crypto.randomUUID();
  localStorage.setItem('sgec_session_id', nouveau);
  return nouveau;
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

  const chargerMotifs = useCallback(async () => {
    setChargementMotifs(true);
    setErreurMotifs(false);
    try {
      const reponse = await fetch('http://localhost:3000/api/feedback/motifs');
      if (!reponse.ok) throw new Error();
      const donnees: Motif[] = await reponse.json();
      setMotifs(donnees);
    } catch {
      setErreurMotifs(true);
    } finally {
      setChargementMotifs(false);
    }
  }, []);

  const syncAvisEnAttente = useCallback(async () => {
    const pendingJson = localStorage.getItem('sgec_pending_avis');
    if (!pendingJson) return;
    try {
      const payload: AvisPayload = JSON.parse(pendingJson);
      const reponse = await fetch('http://localhost:3000/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (reponse.ok) {
        localStorage.removeItem('sgec_pending_avis');
        localStorage.setItem('sgec_sync_status', 'synced');
        setSynchronise(true);
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    const verifierEtCharger = async () => {
      try {
        const reponseSession = await fetch(
          `http://localhost:3000/api/feedback/check-session/${sessionId}`
        );
        if (reponseSession.ok) {
          const { serviceIdsDejaEvalues } = await reponseSession.json();
          if (Array.isArray(serviceIdsDejaEvalues) && serviceIdsDejaEvalues.length > 0) {
            const stockage: ServicesEvaluesAujourdhui = {
              date: obtenirDateDuJour(),
              serviceIds: serviceIdsDejaEvalues,
            };
            localStorage.setItem('sgec_services_evalues', JSON.stringify(stockage));
          }
        }
      } catch {
      }
      await chargerMotifs();
    };

    verifierEtCharger();
  }, [sessionId, chargerMotifs]);

  useEffect(() => {
    const gererRetourConnexion = () => {
      setEnLigne(true);
      syncAvisEnAttente();
    };
    const gererPerteConnexion = () => setEnLigne(false);

    window.addEventListener('online', gererRetourConnexion);
    window.addEventListener('offline', gererPerteConnexion);

    return () => {
      window.removeEventListener('online', gererRetourConnexion);
      window.removeEventListener('offline', gererPerteConnexion);
    };
  }, [syncAvisEnAttente]);

  useEffect(() => {
    if (soumis && enLigne && localStorage.getItem('sgec_pending_avis')) {
      syncAvisEnAttente();
    }
  }, [soumis, enLigne, syncAvisEnAttente]);

  useEffect(() => {
    if (motifSelectionne === null) {
      setServiceDejaEvalue(false);
      return;
    }
    const motifTrouve = motifs.find((m) => m.id === motifSelectionne);
    if (!motifTrouve) return;
    const servicesEvalues = lireServicesEvaluesAujourdhui();
    setServiceDejaEvalue(servicesEvalues.includes(motifTrouve.service_id));
  }, [motifSelectionne, motifs]);

  const soumettreAvis = async () => {
    if (motifSelectionne === null) {
      setMotifErreur(true);
      return;
    }

    const motifTrouve = motifs.find((m) => m.id === motifSelectionne);
    if (motifTrouve) {
      const servicesEvalues = lireServicesEvaluesAujourdhui();
      if (servicesEvalues.includes(motifTrouve.service_id)) {
        setServiceDejaEvalue(true);
        return;
      }
    }

    setEnvoi(true);
    setErreurEnvoi(false);

    const payload: AvisPayload = {
      session_id: sessionId,
      ...notes,
      commentaire: commentaire.trim() || undefined,
      motifs: [motifSelectionne],
    };

    if (!navigator.onLine) {
      localStorage.setItem('sgec_pending_avis', JSON.stringify(payload));
      localStorage.setItem('sgec_sync_status', 'pending');
      if (motifTrouve) enregistrerServiceEvalue(motifTrouve.service_id);
      setSoumis(true);
      setSynchronise(false);
      setEnvoi(false);
      return;
    }

    try {
      const reponse = await fetch('http://localhost:3000/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (reponse.ok) {
        localStorage.setItem('sgec_sync_status', 'synced');
        if (motifTrouve) enregistrerServiceEvalue(motifTrouve.service_id);
        setSoumis(true);
        setSynchronise(true);
      } else if (reponse.status === 409) {
        if (motifTrouve) enregistrerServiceEvalue(motifTrouve.service_id);
        setServiceDejaEvalue(true);
      } else {
        setErreurEnvoi(true);
      }
    } catch {
      setErreurEnvoi(true);
    } finally {
      setEnvoi(false);
    }
  };

  const mettreAJourNote = (key: NoteKey, valeur: number) => {
    setNotes((prev) => ({ ...prev, [key]: valeur }));
  };

  const mettreAJourHover = (key: NoteKey, valeur: number) => {
    setHoverNotes((prev) => ({ ...prev, [key]: valeur }));
  };

  const effacerHover = (key: NoteKey) => {
    setHoverNotes((prev) => {
      const copie = { ...prev };
      delete copie[key];
      return copie;
    });
  };

  const servicesUniques = motifs.reduce<{ service_id: number; service_nom: string }[]>(
    (acc, motif) => {
      if (!acc.find((s) => s.service_id === motif.service_id)) {
        acc.push({ service_id: motif.service_id, service_nom: motif.service_nom });
      }
      return acc;
    },
    []
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7F5' }}>
      <header
        style={{
          background: '#1B6B3A',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/1/13/Coat_of_arms_of_Benin.svg"
            alt="Armoiries du Bénin"
            style={{ height: '56px', width: 'auto', flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(9px, 2.2vw, 12px)',
                fontWeight: 700,
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                lineHeight: 1.3,
              }}
            >
              Direction des Bourses<br />et Aides Universitaires
            </div>
            <div style={{ display: 'flex', width: '100%', height: '3px', margin: '3px 0' }}>
              <div style={{ flex: 1, background: '#4ADE80' }} />
              <div style={{ flex: 1, background: '#FCD34D' }} />
              <div style={{ flex: 1, background: '#F87171' }} />
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(8px, 1.9vw, 11px)',
                color: 'rgba(255,255,255,0.80)',
                lineHeight: 1.3,
              }}
            >
              Ministère de l'Enseignement<br />Supérieur et de la Recherche Scientifique
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
            background: 'rgba(0,0,0,0.18)',
            borderRadius: '20px',
            padding: '5px 10px',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: enLigne ? '#4ADE80' : '#F87171',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: '#FFFFFF',
              fontSize: 'clamp(10px, 2.5vw, 12px)',
              fontFamily: "'Inter', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            {enLigne ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>
      </header>

      {soumis ? (
        <div style={{ maxWidth: '520px', margin: '60px auto', padding: '0 16px' }}>
          <div style={{ ...STYLE_CARTE, padding: '48px', textAlign: 'center' }}>
            <i
              className="bi bi-check-circle-fill"
              style={{ fontSize: '72px', color: '#1B6B3A', display: 'block', marginBottom: '20px' }}
            />
            <h1
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '28px',
                fontWeight: 700,
                color: '#1A2E1F',
                marginBottom: '12px',
              }}
            >
              Merci pour votre avis !
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: '#5A7262' }}>
              Votre retour a bien été enregistré. Il contribuera à l'amélioration de nos services.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                marginTop: '20px',
                fontFamily: "'Inter', sans-serif",
                background: synchronise ? '#EBF2EE' : '#FFF7ED',
                color: synchronise ? '#1B6B3A' : '#92400E',
              }}
            >
              <i className={synchronise ? 'bi bi-cloud-check-fill' : 'bi bi-clock-history'} />
              {synchronise
                ? 'Synchronisé'
                : 'En attente de synchronisation — vos données seront envoyées dès que vous serez connecté'}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px 48px' }}>
          <div style={STYLE_CARTE}>
            <i
              className="bi bi-chat-heart-fill"
              style={{ fontSize: '32px', color: '#F5A623', display: 'block', marginBottom: '12px' }}
            />
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '22px',
                fontWeight: 700,
                color: '#1A2E1F',
                marginBottom: '8px',
              }}
            >
              Votre avis compte
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', color: '#5A7262' }}>
              Partagez votre expérience et aidez-nous à améliorer la qualité de nos services.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#EBF2EE',
                padding: '6px 12px',
                borderRadius: '8px',
                marginTop: '12px',
                width: 'fit-content',
              }}
            >
              <i className="bi bi-shield-check" style={{ fontSize: '14px', color: '#1B6B3A' }} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  color: '#1B6B3A',
                }}
              >
                Aucune donnée personnelle collectée
              </span>
            </div>
          </div>

          <div style={STYLE_CARTE}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#1A2E1F',
                marginBottom: '8px',
              }}
            >
              <i className="bi bi-clipboard2-check" style={{ color: '#1B6B3A', fontSize: '16px' }} />
              Motif de votre visite
            </label>

            {chargementMotifs && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  className="spinner-border spinner-border-sm"
                  style={{ color: '#1B6B3A' }}
                />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    color: '#5A7262',
                  }}
                >
                  Chargement des motifs...
                </span>
              </div>
            )}

            {erreurMotifs && !chargementMotifs && (
              <div className="alert alert-warning d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-exclamation-triangle" />
                <span>Impossible de charger les motifs.</span>
                <button
                  type="button"
                  className="btn btn-sm btn-warning ms-auto"
                  onClick={chargerMotifs}
                >
                  Réessayer
                </button>
              </div>
            )}

            {!chargementMotifs && !erreurMotifs && (
              <>
                <select
                  className={`form-select${motifErreur ? ' is-invalid' : ''}`}
                  value={motifSelectionne ?? ''}
                  onChange={(e) => {
                    setMotifSelectionne(parseInt(e.target.value));
                    setMotifErreur(false);
                  }}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <option value="" disabled>
                    -- Sélectionnez un motif --
                  </option>
                  {servicesUniques.map((service) => (
                    <optgroup key={service.service_id} label={service.service_nom}>
                      {motifs
                        .filter((m) => m.service_id === service.service_id)
                        .map((motif) => (
                          <option key={motif.id} value={motif.id}>
                            {motif.libelle}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                {motifErreur && (
                  <div className="invalid-feedback">Veuillez sélectionner un motif de visite.</div>
                )}
              </>
            )}
          </div>

          <div style={STYLE_CARTE}>
            <div style={{ marginBottom: '4px' }}>
              <h3
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1A2E1F',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}
              >
                <i className="bi bi-star-half" style={{ color: '#1B6B3A' }} />
                Évaluez votre expérience
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  color: '#5A7262',
                }}
              >
                (1 étoile = très insatisfait · 5 étoiles = très satisfait)
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px',
                marginTop: '16px',
              }}
            >
              {CRITERES.map(({ key, label, icone }) => {
                const valeurAffichee = hoverNotes[key] ?? notes[key];
                return (
                  <div
                    key={key}
                    style={{
                      background: '#F4F7F5',
                      borderRadius: '10px',
                      padding: '16px',
                      border: '1px solid #E2EDE6',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <i
                        className={icone}
                        style={{ color: '#1B6B3A', fontSize: '18px', flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '14px',
                          color: '#1A2E1F',
                          fontWeight: 500,
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    <div
                      style={{ display: 'flex', gap: '4px', marginTop: '10px' }}
                    >
                      {[1, 2, 3, 4, 5].map((index) => (
                        <button
                          key={index}
                          type="button"
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '2px',
                            cursor: 'pointer',
                            fontSize: '28px',
                            color: valeurAffichee >= index ? '#F5A623' : '#C8D8CB',
                            transition: 'color 0.12s ease',
                            lineHeight: 1,
                          }}
                          onMouseEnter={() => mettreAJourHover(key, index)}
                          onMouseLeave={() => effacerHover(key)}
                          onClick={() => mettreAJourNote(key, index)}
                        >
                          <i
                            className={valeurAffichee >= index ? 'bi bi-star-fill' : 'bi bi-star'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={STYLE_CARTE}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#1A2E1F',
                marginBottom: '8px',
              }}
            >
              <i className="bi bi-pencil-square" style={{ color: '#1B6B3A' }} />
              Commentaire (facultatif)
            </label>
            <textarea
              className="form-control"
              rows={4}
              maxLength={800}
              placeholder="Décrivez votre expérience en détail... (facultatif)"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              style={{
                fontFamily: "'Inter', sans-serif",
                resize: 'vertical',
                borderColor: '#D1E5D8',
              }}
            />
            <div
              style={{
                textAlign: 'right',
                fontSize: '12px',
                marginTop: '6px',
                fontFamily: "'Inter', sans-serif",
                color: commentaire.length > 750 ? '#DC2626' : '#5A7262',
              }}
            >
              {commentaire.length} / 800 caractères
            </div>
          </div>

          <button
            type="button"
            disabled={envoi || serviceDejaEvalue}
            onClick={soumettreAvis}
            style={{
              width: '100%',
              padding: '14px',
              background: '#1B6B3A',
              color: '#FFFFFF',
              borderRadius: '10px',
              border: 'none',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '16px',
              fontWeight: 600,
              cursor: envoi || serviceDejaEvalue ? 'not-allowed' : 'pointer',
              opacity: envoi || serviceDejaEvalue ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!envoi && !serviceDejaEvalue) (e.currentTarget as HTMLButtonElement).style.background = '#145230';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#1B6B3A';
            }}
          >
            {envoi ? (
              <>
                <span className="spinner-border spinner-border-sm text-white" />
                Envoi en cours...
              </>
            ) : (
              <>
                <i className="bi bi-send-fill" />
                Envoyer mon avis
              </>
            )}
          </button>

          {serviceDejaEvalue && (
            <div
              className="alert d-flex align-items-start gap-3"
              role="alert"
              style={{
                marginTop: '12px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                background: '#FFF7ED',
                border: '1px solid #FCD34D',
                borderRadius: '10px',
                color: '#92400E',
                padding: '14px 16px',
              }}
            >
              <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Avis déjà enregistré</strong>
                Vous avez déjà soumis un avis pour ce service aujourd'hui. Vous pouvez sélectionner un autre service si vous avez effectué une autre démarche.
              </div>
            </div>
          )}

          {erreurEnvoi && (
            <div
              className="alert alert-danger d-flex align-items-center gap-2"
              role="alert"
              style={{ marginTop: '12px', fontFamily: "'Inter', sans-serif", fontSize: '14px' }}
            >
              <i className="bi bi-wifi-off" />
              Erreur de connexion. Vérifiez votre réseau et réessayez.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
