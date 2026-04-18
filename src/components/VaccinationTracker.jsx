import { useEffect, useState, useCallback } from 'react';
import { IAP_SCHEDULE, IAP_MILESTONE_ORDER } from '../lib/constants';
import { getVaccinations, upsertVaccination } from '../lib/supabase';
import { useToast } from '../App';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function weeksFromDob(dobString, scheduledAgeWeeks) {
  const dob = new Date(dobString);
  const due = new Date(dob.getTime() + scheduledAgeWeeks * 7 * 24 * 60 * 60 * 1000);
  return due;
}

function getStatus(dueDate, administered) {
  if (administered) return 'done';
  const today = new Date();
  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 14) return 'due-soon';
  return 'upcoming';
}

const STATUS_META = {
  done:     { label: 'Given',     className: 'vs-done',     icon: '✓' },
  overdue:  { label: 'Overdue',   className: 'vs-overdue',  icon: '!' },
  'due-soon':{ label: 'Due Soon', className: 'vs-due-soon', icon: '~' },
  upcoming: { label: 'Upcoming',  className: 'vs-upcoming', icon: '·' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function VaccinationTracker({ patient, doctorId }) {
  const { showToast } = useToast();
  const [dbRecords, setDbRecords] = useState([]);   // rows from Supabase
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(null); // vaccine key being saved
  const [filter, setFilter]       = useState('all'); // all | pending | done

  // Build a lookup key: "vaccine_dose"
  const key = (vaccine, dose) => `${vaccine}__${dose}`;

  // ── Fetch existing vaccination records ──
  const fetchRecords = useCallback(async () => {
    if (!patient?.id) return;
    setLoading(true);
    try {
      const data = await getVaccinations(patient.id);
      setDbRecords(data || []);
    } catch (e) {
      showToast('Could not load vaccination records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [patient?.id]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // ── Build a map: key → db row ──
  const recordMap = {};
  dbRecords.forEach(r => {
    recordMap[key(r.vaccine_name, r.dose_number)] = r;
  });

  // ── Toggle administered ──
  async function handleToggle(scheduleItem, currentRecord) {
    const k = key(scheduleItem.vaccine, scheduleItem.doseNumber);
    setSaving(k);
    try {
      const dueDate = weeksFromDob(patient.date_of_birth, scheduleItem.scheduledAgeWeeks);
      const payload = {
        id: currentRecord?.id || undefined,
        patient_id: patient.id,
        doctor_id: doctorId,
        vaccine_name: scheduleItem.vaccine,
        scheduled_age_weeks: scheduleItem.scheduledAgeWeeks,
        dose_number: scheduleItem.doseNumber,
        administered_date: currentRecord?.administered_date
          ? null                          // toggle off → clear date
          : new Date().toISOString().slice(0, 10), // toggle on → today
        batch_number: currentRecord?.batch_number || null,
        notes: currentRecord?.notes || null,
      };
      await upsertVaccination(payload);
      await fetchRecords();
      showToast(
        payload.administered_date
          ? `${scheduleItem.vaccine} (dose ${scheduleItem.doseNumber}) marked as given.`
          : `${scheduleItem.vaccine} (dose ${scheduleItem.doseNumber}) unmarked.`,
        'success'
      );
    } catch (e) {
      showToast('Could not save vaccination record.', 'error');
    } finally {
      setSaving(null);
    }
  }

  // ── Update batch/notes inline ──
  async function handleFieldUpdate(scheduleItem, currentRecord, field, value) {
    if (!currentRecord?.administered_date) return; // only update if administered
    try {
      await upsertVaccination({ ...currentRecord, [field]: value });
      await fetchRecords();
    } catch {
      /* silent – non-critical field */
    }
  }

  // ── Group schedule by milestone label ──
  const grouped = {};
  IAP_MILESTONE_ORDER.forEach(m => { grouped[m] = []; });
  IAP_SCHEDULE.forEach(item => {
    const label = item.label.replace(' (Booster)', '').replace(' (Booster 1)', '').replace(' (Booster 2)', '');
    const bucket = IAP_MILESTONE_ORDER.find(m => m === label || item.label.startsWith(m));
    if (bucket) grouped[bucket].push(item);
  });

  // ── Stats ──
  const totalScheduled = IAP_SCHEDULE.length;
  const totalDone = IAP_SCHEDULE.filter(item => recordMap[key(item.vaccine, item.doseNumber)]?.administered_date).length;
  const totalOverdue = IAP_SCHEDULE.filter(item => {
    const rec = recordMap[key(item.vaccine, item.doseNumber)];
    if (rec?.administered_date) return false;
    const due = weeksFromDob(patient.date_of_birth, item.scheduledAgeWeeks);
    return due < new Date();
  }).length;

  if (loading) return (
    <div className="growth-loading">
      <div className="growth-spinner" />
      <p>Loading vaccination schedule…</p>
    </div>
  );

  return (
    <div className="vt-container">
      {/* Header stats */}
      <div className="vt-stats">
        <div className="vt-stat vt-stat-done">
          <span className="vt-stat-num">{totalDone}</span>
          <span className="vt-stat-label">Given</span>
        </div>
        <div className="vt-stat vt-stat-overdue">
          <span className="vt-stat-num">{totalOverdue}</span>
          <span className="vt-stat-label">Overdue</span>
        </div>
        <div className="vt-stat vt-stat-total">
          <span className="vt-stat-num">{totalScheduled - totalDone}</span>
          <span className="vt-stat-label">Remaining</span>
        </div>
        <div className="vt-progress-bar-wrap">
          <div className="vt-progress-bar" style={{ width: `${(totalDone / totalScheduled) * 100}%` }} />
        </div>
        <span className="vt-progress-label">{Math.round((totalDone / totalScheduled) * 100)}% complete</span>
      </div>

      {/* Filter tabs */}
      <div className="vt-filter-tabs">
        {['all', 'pending', 'done'].map(f => (
          <button
            key={f}
            className={`vt-filter-tab${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending / Overdue' : 'Given'}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="vt-timeline">
        {IAP_MILESTONE_ORDER.map(milestone => {
          const items = grouped[milestone] || [];
          if (!items.length) return null;

          // Compute milestone stats
          const mileDone = items.filter(item => recordMap[key(item.vaccine, item.doseNumber)]?.administered_date).length;
          const mileAll  = items.length;
          const allDone  = mileDone === mileAll;

          // Filter items
          const visible = items.filter(item => {
            const rec = recordMap[key(item.vaccine, item.doseNumber)];
            const administered = !!rec?.administered_date;
            if (filter === 'done')    return administered;
            if (filter === 'pending') return !administered;
            return true;
          });
          if (!visible.length) return null;

          return (
            <div key={milestone} className={`vt-milestone${allDone ? ' vt-milestone-done' : ''}`}>
              <div className="vt-milestone-header">
                <span className={`vt-milestone-dot${allDone ? ' done' : ''}`} />
                <span className="vt-milestone-label">{milestone}</span>
                <span className="vt-milestone-count">{mileDone}/{mileAll}</span>
              </div>

              <div className="vt-vaccine-list">
                {visible.map(item => {
                  const k = key(item.vaccine, item.doseNumber);
                  const rec = recordMap[k];
                  const administered = !!rec?.administered_date;
                  const dueDate = weeksFromDob(patient.date_of_birth, item.scheduledAgeWeeks);
                  const status = getStatus(dueDate, administered);
                  const meta = STATUS_META[status];
                  const isSavingThis = saving === k;

                  return (
                    <div key={k} className={`vt-vaccine-row ${meta.className}`}>
                      <button
                        className={`vt-checkbox${administered ? ' checked' : ''}`}
                        onClick={() => handleToggle(item, rec)}
                        disabled={!!isSavingThis}
                        aria-label={`Mark ${item.vaccine} dose ${item.doseNumber} as ${administered ? 'not given' : 'given'}`}
                      >
                        {isSavingThis ? <span className="vt-spinner" /> : administered ? '✓' : ''}
                      </button>

                      <div className="vt-vaccine-info">
                        <span className="vt-vaccine-name">{item.vaccine}</span>
                        <span className="vt-vaccine-meta">
                          Dose {item.doseNumber} · {item.category}
                        </span>
                      </div>

                      <div className="vt-vaccine-right">
                        <span className={`vt-status-badge ${meta.className}`}>{meta.label}</span>
                        <span className="vt-due-date">
                          {administered
                            ? `Given ${rec.administered_date}`
                            : `Due ${dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
                          }
                        </span>
                      </div>

                      {/* Expanded detail when administered */}
                      {administered && (
                        <div className="vt-admin-detail">
                          <input
                            className="vt-batch-input"
                            placeholder="Batch no. (optional)"
                            defaultValue={rec.batch_number || ''}
                            onBlur={e => handleFieldUpdate(item, rec, 'batch_number', e.target.value)}
                          />
                          <input
                            className="vt-batch-input"
                            placeholder="Notes (optional)"
                            defaultValue={rec.notes || ''}
                            onBlur={e => handleFieldUpdate(item, rec, 'notes', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
