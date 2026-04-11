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
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employee/my-results');
      // res.data = { results: employee.aiResults, employee }
      // employee.aiResults = { skillAnalysis: {...}, hrPredictions: {...}, analyzedAt }
      setResults(res.data.results);
      console.log('[Results] aiResults reçu:', res.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setMsg('');
    try {
      const res = await api.post('/employee/analyze');
      console.log('[Analyze] réponse:', res.data);
      setMsg('Analyse terminée !');
      await load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Analyse échouée.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return (
    <div className="layout"><Sidebar /><main className="main">Chargement...</main></div>
  );

  // Structure en base :
  // results.skillAnalysis  = réponse brute FastAPI /analyze  = { skillAnalysis: { matching_skills, missing_skills, readiness_level, estimated_upskilling_months } }
  // results.hrPredictions  = réponse brute FastAPI /predict  = { hrPredictions: { predictions: { promotion_readiness, skill_growth_trajectory, attrition_risk }, insights: [] } }

  const sk = results?.skillAnalysis?.skillAnalysis;   // objet avec readiness_level, etc.
  const hrRoot = results?.hrPredictions?.hrPredictions; // objet avec predictions + insights
  const hrPred = hrRoot?.predictions;
  const hrInsights = hrRoot?.insights || [];

  return (
    <div className="layout">
      <Sidebar />
      <main className="main" style={{ padding: '30px', background: '#f9fafb', minHeight: '100vh' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#111827', margin: 0 }}>Tableau de bord IA</h1>
          <button className="btn btn-primary btn-sm" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? 'Analyse en cours...' : '🔄 Relancer l\'analyse'}
          </button>
        </div>

        {msg && (
          <div className={`alert ${msg.includes('échouée') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: 16 }}>
            {msg}
          </div>
        )}

        {!results ? (
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
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: 20 }}>

              {/* Prédictions de Carrière */}
              <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '20px' }}>Prédictions de Carrière</h3>
                {hrPred ? (
                  <>
                    <GaugeBar value={hrPred.promotion_readiness?.score} label="Préparation Promotion" color="primary" />
                    <GaugeBar value={hrPred.skill_growth_trajectory?.score} label="Croissance Compétences" color="success" />
                    <GaugeBar value={hrPred.attrition_risk?.probability} label="Risque de départ" color="danger" />
                    <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
                      Statut promotion : <strong>{hrPred.promotion_readiness?.status}</strong> ·
                      Risque : <strong>{hrPred.attrition_risk?.level}</strong> ·
                      Croissance : <strong>{hrPred.skill_growth_trajectory?.status}</strong>
                    </div>
                  </>
                ) : (
                  <div style={{ color: '#9ca3af', fontSize: 14 }}>Données non disponibles</div>
                )}
              </div>

              {/* Analyse des Compétences */}
              <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '20px' }}>Analyse des Compétences</h3>
                {sk ? (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ margin: '0 0 6px' }}><strong>Niveau :</strong> {sk.readiness_level}</p>
                      <p style={{ margin: 0 }}><strong>Mise à niveau estimée :</strong> {sk.estimated_upskilling_months} mois</p>
                    </div>

                    {sk.matching_skills?.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>✅ Compétences acquises</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {sk.matching_skills.map(s => (
                            <span key={s} className="badge badge-approved" style={{ fontSize: 11 }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {sk.missing_skills?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>❌ Compétences manquantes</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {sk.missing_skills.map(s => (
                            <span key={s} className="badge badge-denied" style={{ fontSize: 11 }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ color: '#9ca3af', fontSize: 14 }}>Données non disponibles</div>
                )}

                {hrInsights.length > 0 && (
                  <div style={{ marginTop: 16, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>💡 Recommandations</div>
                    {hrInsights.map((ins, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#4b5563', padding: '6px 10px', background: '#f9fafb', borderRadius: 6, marginBottom: 4 }}>
                        • {ins}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {results.analyzedAt && (
              <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'right' }}>
                Dernière analyse : {new Date(results.analyzedAt).toLocaleString()}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}