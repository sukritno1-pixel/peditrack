import { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getGrowthRecords } from '../lib/supabase';
import {
  WHO_AGES_MONTHS,
  WHO_WEIGHT_BOYS, WHO_WEIGHT_GIRLS,
  WHO_HEIGHT_BOYS, WHO_HEIGHT_GIRLS,
  WHO_HC_BOYS, WHO_HC_GIRLS,
} from '../lib/constants';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

// Build a WHO percentile dataset (dashed band line)
function whoDataset(label, data, color, yAxisID = 'yLeft') {
  return {
    label,
    data,
    borderColor: color,
    borderWidth: 1,
    borderDash: [5, 4],
    pointRadius: 0,
    fill: false,
    tension: 0.4,
    yAxisID,
  };
}

// Map patient's growth records age in months to WHO age buckets
function ageInMonths(dobString, recordDate) {
  const dob = new Date(dobString);
  const rec = new Date(recordDate);
  const ms = rec - dob;
  return Math.max(0, ms / (1000 * 60 * 60 * 24 * 30.44));
}

const CHART_TABS = ['Weight', 'Height', 'Head Circumference'];

export default function GrowthCharts({ patient }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Weight');

  useEffect(() => {
    if (!patient?.id) return;
    setLoading(true);
    getGrowthRecords(patient.id)
      .then(data => setRecords(data || []))
      .finally(() => setLoading(false));
  }, [patient?.id]);

  const gender = patient?.gender?.toLowerCase(); // 'male' or 'female'
  const isBoy = gender === 'male';

  // Sorted patient data points
  const sorted = [...records].sort((a, b) => new Date(a.measurement_date) - new Date(b.measurement_date));
  const patientAges = sorted.map(r => parseFloat(ageInMonths(patient.date_of_birth, r.measurement_date).toFixed(1)));

  // WHO reference sets
  const whoWeight = isBoy ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;
  const whoHeight = isBoy ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS;
  const whoHC     = isBoy ? WHO_HC_BOYS    : WHO_HC_GIRLS;

  // Colours from PediTrack design system
  const coral  = '#E8593C';
  const teal   = '#1D9E75';
  const gold   = '#EF9F27';
  const whoGray3  = 'rgba(136,135,128,0.55)';
  const whoGray50 = 'rgba(136,135,128,0.85)';
  const whoGray97 = 'rgba(136,135,128,0.55)';

  // Shared chart config builder
  function buildChartData(patientValues, whoRef, patientColor, yLabel, yAxisID = 'y') {
    return {
      datasets: [
        // WHO bands
        whoDataset('3rd %ile', WHO_AGES_MONTHS.map((_, i) => ({ x: WHO_AGES_MONTHS[i], y: whoRef.p3[i] })),  whoGray3,  yAxisID),
        whoDataset('50th %ile', WHO_AGES_MONTHS.map((_, i) => ({ x: WHO_AGES_MONTHS[i], y: whoRef.p50[i] })), whoGray50, yAxisID),
        whoDataset('97th %ile', WHO_AGES_MONTHS.map((_, i) => ({ x: WHO_AGES_MONTHS[i], y: whoRef.p97[i] })), whoGray97, yAxisID),
        // Patient data
        {
          label: 'Patient',
          data: patientAges.map((age, i) => ({ x: age, y: patientValues[i] })),
          borderColor: patientColor,
          backgroundColor: patientColor + '22',
          borderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: patientColor,
          fill: false,
          tension: 0.3,
          yAxisID,
        },
      ],
    };
  }

  function buildOptions(yLabel, min, max) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            font: { size: 11, family: "'DM Sans', sans-serif" },
            color: '#888780',
            usePointStyle: true,
            pointStyleWidth: 14,
            filter: item => item.text !== 'Patient' ? item.borderDash = [5, 4] && true : true,
          },
        },
        tooltip: {
          callbacks: {
            title: items => `Age: ${items[0].parsed.x} months`,
            label: item => `${item.dataset.label}: ${item.parsed.y.toFixed(1)} ${yLabel === 'kg' ? 'kg' : 'cm'}`,
          },
          backgroundColor: '#fff',
          titleColor: '#2C2C2A',
          bodyColor: '#5F5E5A',
          borderColor: '#D3D1C7',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Age (months)', color: '#888780', font: { size: 11 } },
          min: 0,
          max: 62,
          ticks: { color: '#888780', font: { size: 10 } },
          grid: { color: '#F1EFE8' },
        },
        y: {
          title: { display: true, text: yLabel, color: '#888780', font: { size: 11 } },
          min,
          max,
          ticks: { color: '#888780', font: { size: 10 } },
          grid: { color: '#F1EFE8' },
        },
      },
    };
  }

  const weightValues = sorted.map(r => r.weight_kg);
  const heightValues = sorted.map(r => r.height_cm);
  const hcValues     = sorted.map(r => r.head_circumference_cm);

  const charts = {
    'Weight':            { data: buildChartData(weightValues, whoWeight, coral,  'kg'),   options: buildOptions('kg', 2, 26) },
    'Height':            { data: buildChartData(heightValues, whoHeight, teal,   'cm'),   options: buildOptions('cm', 44, 125) },
    'Head Circumference':{ data: buildChartData(hcValues,     whoHC,     gold,   'cm'),   options: buildOptions('cm', 30, 60) },
  };

  if (loading) return (
    <div className="growth-loading">
      <div className="growth-spinner" />
      <p>Loading growth data…</p>
    </div>
  );

  if (records.length === 0) return (
    <div className="growth-empty">
      <span className="growth-empty-icon">📏</span>
      <p>No growth records yet.</p>
      <p className="growth-empty-sub">Add vitals during a visit to start tracking growth.</p>
    </div>
  );

  const active = charts[activeTab];

  return (
    <div className="growth-charts-container">
      {/* WHO reference note */}
      <p className="growth-who-note">
        Dashed lines show WHO {isBoy ? 'boys' : 'girls'} percentile bands (3rd · 50th · 97th).
      </p>

      {/* Metric tabs */}
      <div className="growth-tabs">
        {CHART_TABS.map(tab => (
          <button
            key={tab}
            className={`growth-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'Weight' && '⚖️ '}
            {tab === 'Height' && '📏 '}
            {tab === 'Head Circumference' && '🧠 '}
            {tab}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="growth-chart-wrapper">
        <Line data={active.data} options={active.options} />
      </div>

      {/* Data table */}
      <div className="growth-table-wrapper">
        <table className="growth-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Age (mo)</th>
              <th>Weight (kg)</th>
              <th>Height (cm)</th>
              <th>HC (cm)</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={r.id}>
                <td>{new Date(r.measurement_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>{patientAges[i].toFixed(1)}</td>
                <td>{r.weight_kg ?? '—'}</td>
                <td>{r.height_cm ?? '—'}</td>
                <td>{r.head_circumference_cm ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
