import { useState, useEffect } from 'react';
import { getVisits } from '../lib/supabase';

// ─── Privacy-safe de-identification ──────────────────────────────────────────
// NEVER send: name, guardian name, phone, address, exact DOB
// SEND: age in months, gender, clinical visit data only

function deidentify(patient, visits) {
  const dob = new Date(patient.date_of_birth);
  const now = new Date();
  const ageMonths = Math.floor((now - dob) / (1000 * 60 * 60 * 24 * 30.44));

  return {
    ageMonths,
    gender: patient.gender,
    bloodGroup: patient.blood_group || 'Unknown',
    knownAllergies: patient.allergies || 'None',
    visits: visits.map(v => ({
      date: v.visit_date,
      chiefComplaint: v.chief_complaint,
      diagnosis: v.diagnosis,
      prescription: v.prescription,
      vitals: {
        weightKg: v.weight_kg,
        heightCm: v.height_cm,
        temperatureC: v.temperature_c,
        heartRateBpm: v.heart_rate_bpm,
        spo2Percent: v.spo2_percent,
      },
      remarks: v.remarks,
    })),
  };
}

// ─── Gemini API call ──────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGemini(apiKey, clinicalData) {
  const systemInstruction = `You are a clinical assistant for a pediatric private practice in India.
Your task is to generate a concise, structured clinical summary of a patient's visit history.

Rules:
- Write in professional clinical English.
- Use structured sections: "Clinical Overview", "Visit History Summary", "Patterns & Concerns", "Current Status".
- Do NOT mention any patient name, guardian name, or contact info — you will not receive any.
- Highlight recurring complaints, diagnoses, or prescriptions.
- Note any allergy considerations.
- Flag any growth concerns if vitals data suggests it.
- Keep the total response under 400 words.
- Format using markdown (bold headers, bullet points).`;

  const userMessage = `Please generate a clinical summary for this pediatric patient.

Patient profile:
- Age: ${clinicalData.ageMonths} months
- Gender: ${clinicalData.gender}
- Blood Group: ${clinicalData.bloodGroup}
- Known Allergies: ${clinicalData.knownAllergies}

Visit history (${clinicalData.visits.length} total visits):
${JSON.stringify(clinicalData.visits, null, 2)}`;

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Gemini API error');
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary generated.';
}

// ─── Simple markdown → JSX renderer ─────────────────────────────────────────

function RenderMarkdown({ text }) {
  const lines = text.split('\n');
  return (
    <div className="ai-summary-content">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        // Bold headers: **Text**
        if (line.startsWith('**') && line.endsWith('**')) {
          return <h4 key={i} className="ai-summary-h4">{line.slice(2, -2)}</h4>;
        }
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
          const content = line.slice(2);
          // inline bold
          const parts = content.split(/\*\*(.*?)\*\*/g);
          return (
            <li key={i} className="ai-summary-li">
              {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
            </li>
          );
        }
        // Regular paragraph with inline bold
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="ai-summary-p">
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
          </p>
        );
      })}
    </div>
  );
}

// ─── Template fallback (used if no API key) ───────────────────────────────────

function templateSummary(patient, visits) {
  if (!visits.length) return null;
  const latest = visits[visits.length - 1];
  const complaints = [...new Set(visits.map(v => v.chief_complaint).filter(Boolean))];
  const diagnoses  = [...new Set(visits.map(v => v.diagnosis).filter(Boolean))];
  return `**Clinical Overview**\n\nPatient with ${visits.length} recorded visit(s).\n\n**Common Complaints**\n\n${complaints.map(c => `- ${c}`).join('\n') || '- None recorded'}\n\n**Diagnoses**\n\n${diagnoses.map(d => `- ${d}`).join('\n') || '- None recorded'}\n\n**Last Visit**\n\n- Date: ${latest.visit_date}\n- Complaint: ${latest.chief_complaint || '—'}\n- Diagnosis: ${latest.diagnosis || '—'}\n- Prescription: ${latest.prescription || '—'}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VisitSummary({ patient }) {
  const [visits, setVisits]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError]   = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    if (!patient?.id) return;
    setLoading(true);
    setAiSummary(null);
    setHasGenerated(false);
    getVisits(patient.id)
      .then(data => setVisits((data || []).sort((a, b) => new Date(a.visit_date) - new Date(b.visit_date))))
      .finally(() => setLoading(false));
  }, [patient?.id]);

  async function handleGenerateSummary() {
    setAiLoading(true);
    setAiError(null);
    try {
      if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set in .env');
      const clinicalData = deidentify(patient, visits);
      const summary = await callGemini(apiKey, clinicalData);
      setAiSummary(summary);
      setHasGenerated(true);
    } catch (e) {
      setAiError(e.message || 'Failed to generate summary.');
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) return (
    <div className="growth-loading">
      <div className="growth-spinner" />
      <p>Loading visit history…</p>
    </div>
  );

  if (!visits.length) return (
    <div className="growth-empty">
      <span className="growth-empty-icon">📋</span>
      <p>No visits recorded yet.</p>
      <p className="growth-empty-sub">Record a visit to generate a clinical summary.</p>
    </div>
  );

  const fallback = templateSummary(patient, visits);

  return (
    <div className="vs-container">
      {/* Header */}
      <div className="vs-header">
        <div className="vs-header-info">
          <span className="vs-visit-count">{visits.length} visit{visits.length !== 1 ? 's' : ''} on record</span>
          <span className="vs-date-range">
            {new Date(visits[0].visit_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            {visits.length > 1 && ` → ${new Date(visits[visits.length - 1].visit_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}
          </span>
        </div>
        <button
          className="btn-primary vs-generate-btn"
          onClick={handleGenerateSummary}
          disabled={aiLoading}
        >
          {aiLoading ? (
            <>
              <span className="growth-spinner vs-btn-spinner" />
              Generating…
            </>
          ) : (
            <>{hasGenerated ? '🔄 Regenerate' : '✨ Generate'} AI Summary</>
          )}
        </button>
      </div>

      {/* Privacy note */}
      <p className="vs-privacy-note">
        🔒 Only de-identified clinical data (age, gender, symptoms, diagnoses) is sent to the AI. No names or contact info are shared.
      </p>

      {/* AI error */}
      {aiError && (
        <div className="vs-error">
          <strong>Could not generate summary:</strong> {aiError}
        </div>
      )}

      {/* AI Summary or template */}
      <div className="vs-summary-box">
        {aiSummary ? (
          <>
            <div className="vs-ai-badge">✨ AI Summary · Gemini 1.5 Flash</div>
            <RenderMarkdown text={aiSummary} />
          </>
        ) : (
          <>
            <div className="vs-ai-badge vs-template-badge">📋 Template Summary</div>
            <RenderMarkdown text={fallback} />
          </>
        )}
      </div>

      {/* Visit timeline (raw) */}
      <details className="vs-details">
        <summary className="vs-details-summary">View raw visit log ({visits.length} entries)</summary>
        <div className="vs-raw-list">
          {[...visits].reverse().map(v => (
            <div key={v.id} className="vs-raw-item">
              <div className="vs-raw-date">
                {new Date(v.visit_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div className="vs-raw-body">
                {v.chief_complaint && <p><strong>Complaint:</strong> {v.chief_complaint}</p>}
                {v.diagnosis       && <p><strong>Diagnosis:</strong> {v.diagnosis}</p>}
                {v.prescription    && <p><strong>Rx:</strong> {v.prescription}</p>}
                {v.remarks         && <p><strong>Remarks:</strong> {v.remarks}</p>}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
