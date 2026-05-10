import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeAdminProps {
  targetUrl?: string;
}

export default function QRCodeAdmin({
  targetUrl = (import.meta.env.VITE_APP_URL as string) || 'http://localhost:5173',
}: QRCodeAdminProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [erreurQR, setErreurQR] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    setErreurQR(false);
    QRCode.toCanvas(canvasRef.current, targetUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#1B6B3A',
        light: '#FFFFFF',
      },
    }).catch(() => setErreurQR(true));
  }, [targetUrl]);

  const telechargerPNG = () => {
    const dataUrl = canvasRef.current?.toDataURL('image/png');
    if (!dataUrl) return;
    const lien = document.createElement('a');
    lien.href = dataUrl;
    lien.download = 'qrcode-formulaire-dbau.png';
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .qr-print-zone, .qr-print-zone * { visibility: visible !important; }
          .qr-print-zone {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            padding: 40px;
            background: white;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px 16px' }}>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            boxShadow: '0 2px 16px rgba(27, 107, 58, 0.08)',
            padding: '32px',
          }}
        >
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '20px',
              fontWeight: 700,
              color: '#1A2E1F',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <i className="bi bi-qr-code-scan" style={{ color: '#1B6B3A', fontSize: '22px' }} />
            QR Code du formulaire visiteur
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#5A7262',
              marginBottom: '24px',
            }}
          >
            Affichez ce code dans vos locaux pour permettre aux visiteurs d'accéder au formulaire
            d'avis.
          </p>

          {erreurQR ? (
            <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
              <i className="bi bi-exclamation-triangle-fill" />
              Impossible de générer le QR Code. Vérifiez l'URL cible.
            </div>
          ) : (
            <div
              className="qr-print-zone"
              style={{
                background: '#FFFFFF',
                border: '3px solid #1B6B3A',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                margin: '0 auto',
                width: 'fit-content',
              }}
            >
              <canvas ref={canvasRef} />
              <p
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#1B6B3A',
                  letterSpacing: '3px',
                  marginTop: '8px',
                  marginBottom: 0,
                }}
              >
                DBAU
              </p>
            </div>
          )}

          {/* Bandeau URL */}
          <div
            style={{
              background: '#EBF2EE',
              padding: '8px 16px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#1B6B3A',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              wordBreak: 'break-all',
            }}
          >
            <i className="bi bi-link-45deg" style={{ flexShrink: 0 }} />
            {targetUrl}
          </div>

          {/* Boutons */}
          <div className="no-print" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                flex: 1,
                border: '2px solid #1B6B3A',
                color: '#1B6B3A',
                background: 'transparent',
                padding: '10px 20px',
                borderRadius: '8px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#EBF2EE';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <i className="bi bi-printer" />
              Imprimer
            </button>
            <button
              type="button"
              onClick={telechargerPNG}
              style={{
                flex: 1,
                border: 'none',
                color: '#FFFFFF',
                background: '#1B6B3A',
                padding: '10px 20px',
                borderRadius: '8px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#145230';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#1B6B3A';
              }}
            >
              <i className="bi bi-download" />
              Télécharger PNG
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
