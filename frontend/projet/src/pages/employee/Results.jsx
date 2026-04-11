import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../utils/api';

function GaugeBar({ value, label, color }) {
  const barColor = color === 'danger' ? '#ef4444' : color === 'success' ? '#22c55e' : '#3b82f6';
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);
  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 'bold' }}>{safeValue}%</span>
      </div>
      <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px' }}>
        <div style={{ width: `${safeValue}%`, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 1s' }} />
      </div>
    </div>
  );
}

export default function EmployeeResults() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/employee/my-results');
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalyzeMsg('');
    try {
      await api.post('/employee/analyze');
      setAnalyzeMsg('Analyse terminée !');
      setLoading(true);
      await load();
    } catch (err) {
      setAnalyzeMsg(err.response?.data?.message || 'Analyse échouée.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="layout"><Sidebar /><main className="main">Chargement...</main></div>;

  const results = data?.results;

  // Le backend sauvegarde la réponse brute du FastAPI.
  // FastAPI /analyze retourne { skillAnalysis: {...} }
  // FastAPI /predict retourne { hrPredictions: {...} }
  // Donc en base : aiResults.skillAnalysis = { skillAnalysis: {...} }
  //                aiResults.hrPredictions = { hrPredictions: {...} }
  // On gère les deux cas (avec ou sans double imbrication) pour être robuste.
  const rawSk = results?.skillAnalysis;
  const rawHr = results?.hrPredictions;
  const sk = rawSk?.skillAnalysis ?? rawSk;
  const hr = rawHr?.hrPredictions ?? rawHr;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main" style={{ padding: '30px', background: '#f9fafb', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#111827', margin: 0 }}>Tableau de bord IA</h1>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? 'Analyse en cours...' : '🔄 Relancer l\'analyse'}
          </button>
        </div>

        {analyzeMsg && (
          <div className={`alert ${analyzeMsg.includes('échouée') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: 16 }}>
            {analyzeMsg}
          </div>
        )}

        {!sk ? (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Aucune analyse disponible</div>
            <div style={{ color: 'var(--gray-500)', marginBottom: 20, fontSize: 14 }}>
              Complétez votre profil puis lancez l'analyse pour voir vos résultats.
            </div>
            <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? 'Analyse en cours...' : 'Lancer l\'analyse'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Colonne Gauche : Carrière */}
            <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '20px' }}>Prédictions de Carrière</h3>
              {hr?.predictions ? (
                <>
                  <GaugeBar value={hr.predictions.promotion_readiness?.score} label="Préparation Promotion" color="primary" />
                  <GaugeBar value={hr.predictions.skill_growth_trajectory?.score} label="Croissance Compétences" color="success" />
                  <GaugeBar value={hr.predictions.attrition_risk?.probability} label="Risque de départ" color="danger" />
                  <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
                    Statut promotion : <strong>{hr.predictions.promotion_readiness?.status}</strong> ·
                    Risque : <strong>{hr.predictions.attrition_risk?.level}</strong>
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--gray-400)', fontSize: 14 }}>Données de prédiction non disponibles</div>
              )}
            </div>

            {/* Colonne Droite : Compétences + Insights */}
            <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '20px' }}>Analyse des Compétences</h3>
              <div style={{ marginBottom: '15px' }}>
                <p><strong>Niveau :</strong> {sk.readiness_level ?? '—'}</p>
                <p><strong>Mise à niveau estimée :</strong> {sk.estimated_upskilling_months ?? '—'} mois</p>
              </div>

              {sk.missing_skills?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <strong style={{ fontSize: 13 }}>Compétences manquantes :</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    {sk.missing_skills.map(s => (
                      <span key={s} className="badge badge-denied" style={{ fontSize: 11 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {sk.matching_skills?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <strong style={{ fontSize: 13 }}>Compétences acquises :</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    {sk.matching_skills.map(s => (
                      <span key={s} className="badge badge-approved" style={{ fontSize: 11 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {hr?.insights?.length > 0 && (
                <div>
                  <strong style={{ fontSize: 13 }}>Recommandations :</strong>
                  <ul style={{ marginTop: '10px', fontSize: '14px', color: '#4b5563', paddingLeft: 0, listStyle: 'none' }}>
                    {hr.insights.map((ins, i) => (
                      <li key={i} style={{ marginBottom: '6px', padding: '6px 10px', background: '#f9fafb', borderRadius: 6 }}>• {ins}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {results?.analyzedAt && (
              <div style={{ gridColumn: '1 / -1', fontSize: 12, color: '#9ca3af', textAlign: 'right' }}>
                Dernière analyse : {new Date(results.analyzedAt).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}