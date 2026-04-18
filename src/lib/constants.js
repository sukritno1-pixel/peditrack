// ─────────────────────────────────────────────────────────────────
// WHO Growth Chart Reference Data (Boys & Girls, 0–60 months)
// Source: WHO Child Growth Standards, public domain
// Values represent weight (kg), length/height (cm), HC (cm)
// at ages 0,1,2,3,4,5,6,9,12,15,18,24,36,48,60 months
// ─────────────────────────────────────────────────────────────────

export const WHO_AGES_MONTHS = [0, 1, 2, 3, 4, 5, 6, 9, 12, 15, 18, 24, 36, 48, 60];

export const WHO_WEIGHT_BOYS = {
  p3:  [2.5, 3.4, 4.3, 5.0, 5.6, 6.1, 6.4, 7.1, 7.7, 8.2, 8.6, 9.3, 10.8, 12.1, 13.3],
  p50: [3.3, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9, 8.9, 9.6, 10.3, 10.9, 11.8, 14.3, 16.3, 18.3],
  p97: [4.4, 5.8, 7.1, 8.0, 8.7, 9.3, 9.8, 11.0, 11.9, 12.7, 13.5, 14.7, 17.7, 20.3, 22.8],
};

export const WHO_WEIGHT_GIRLS = {
  p3:  [2.4, 3.2, 4.0, 4.6, 5.1, 5.5, 5.8, 6.5, 7.0, 7.5, 7.9, 8.7, 10.2, 11.5, 12.7],
  p50: [3.2, 4.2, 5.1, 5.8, 6.4, 6.9, 7.3, 8.2, 8.9, 9.6, 10.2, 11.5, 13.9, 16.1, 18.2],
  p97: [4.2, 5.5, 6.6, 7.5, 8.2, 8.8, 9.3, 10.5, 11.5, 12.4, 13.2, 14.8, 17.7, 20.4, 23.2],
};

export const WHO_HEIGHT_BOYS = {
  p3:  [46.1, 50.8, 54.4, 57.3, 59.7, 61.7, 63.3, 67.7, 71.0, 73.9, 76.5, 81.3, 88.7, 94.9, 100.7],
  p50: [49.9, 54.7, 58.4, 61.4, 63.9, 65.9, 67.6, 72.3, 75.7, 79.1, 82.3, 87.8, 96.1, 102.9, 110.0],
  p97: [53.7, 58.6, 62.4, 65.5, 68.0, 70.1, 71.9, 76.9, 80.5, 84.2, 87.8, 94.0, 103.5, 111.0, 119.2],
};

export const WHO_HEIGHT_GIRLS = {
  p3:  [45.6, 50.0, 53.2, 55.8, 58.0, 59.9, 61.5, 65.6, 68.9, 71.9, 74.5, 79.6, 87.4, 94.1, 99.9],
  p50: [49.1, 53.7, 57.1, 59.8, 62.1, 64.0, 65.7, 70.1, 73.8, 77.1, 80.2, 86.4, 95.1, 102.7, 110.2],
  p97: [52.9, 57.6, 61.1, 63.9, 66.2, 68.2, 69.9, 74.7, 78.6, 82.3, 85.9, 93.2, 102.7, 111.3, 120.6],
};

export const WHO_HC_BOYS = {
  p3:  [31.9, 35.1, 37.4, 39.1, 40.4, 41.5, 42.4, 44.3, 45.6, 46.7, 47.5, 48.8, 50.3, 51.4, 52.2],
  p50: [34.5, 37.9, 40.3, 42.0, 43.3, 44.3, 45.2, 47.2, 46.6, 49.8, 50.8, 52.0, 53.5, 54.6, 55.4],
  p97: [37.1, 40.7, 43.1, 44.9, 46.2, 47.2, 48.0, 50.0, 51.5, 52.8, 53.9, 55.2, 56.7, 57.8, 58.6],
};

export const WHO_HC_GIRLS = {
  p3:  [31.5, 34.6, 36.8, 38.5, 39.7, 40.7, 41.5, 43.3, 44.5, 45.5, 46.3, 47.5, 49.0, 50.1, 51.0],
  p50: [33.9, 37.2, 39.5, 41.2, 42.5, 43.5, 44.4, 46.3, 47.6, 48.7, 49.6, 51.0, 52.5, 53.6, 54.5],
  p97: [36.3, 39.8, 42.2, 43.9, 45.2, 46.2, 47.2, 49.3, 50.7, 51.9, 52.9, 54.5, 56.0, 57.1, 58.0],
};

// ─────────────────────────────────────────────────────────────────
// IAP (Indian Academy of Pediatrics) Immunization Schedule 2023
// scheduled_age_weeks: age in weeks when dose is due
// ─────────────────────────────────────────────────────────────────

export const IAP_SCHEDULE = [
  // Birth
  { vaccine: 'BCG', doseNumber: 1, scheduledAgeWeeks: 0, label: 'Birth', category: 'Mandatory' },
  { vaccine: 'OPV', doseNumber: 0, scheduledAgeWeeks: 0, label: 'Birth', category: 'Mandatory' }, // OPV-0
  { vaccine: 'Hepatitis B', doseNumber: 1, scheduledAgeWeeks: 0, label: 'Birth', category: 'Mandatory' },

  // 6 Weeks
  { vaccine: 'DTwP / DTaP', doseNumber: 1, scheduledAgeWeeks: 6, label: '6 Weeks', category: 'Mandatory' },
  { vaccine: 'IPV', doseNumber: 1, scheduledAgeWeeks: 6, label: '6 Weeks', category: 'Mandatory' },
  { vaccine: 'Hib', doseNumber: 1, scheduledAgeWeeks: 6, label: '6 Weeks', category: 'Mandatory' },
  { vaccine: 'Hepatitis B', doseNumber: 2, scheduledAgeWeeks: 6, label: '6 Weeks', category: 'Mandatory' },
  { vaccine: 'OPV', doseNumber: 1, scheduledAgeWeeks: 6, label: '6 Weeks', category: 'Mandatory' },
  { vaccine: 'Rotavirus', doseNumber: 1, scheduledAgeWeeks: 6, label: '6 Weeks', category: 'Mandatory' },
  { vaccine: 'PCV', doseNumber: 1, scheduledAgeWeeks: 6, label: '6 Weeks', category: 'Mandatory' },

  // 10 Weeks
  { vaccine: 'DTwP / DTaP', doseNumber: 2, scheduledAgeWeeks: 10, label: '10 Weeks', category: 'Mandatory' },
  { vaccine: 'IPV', doseNumber: 2, scheduledAgeWeeks: 10, label: '10 Weeks', category: 'Mandatory' },
  { vaccine: 'Hib', doseNumber: 2, scheduledAgeWeeks: 10, label: '10 Weeks', category: 'Mandatory' },
  { vaccine: 'OPV', doseNumber: 2, scheduledAgeWeeks: 10, label: '10 Weeks', category: 'Mandatory' },
  { vaccine: 'Rotavirus', doseNumber: 2, scheduledAgeWeeks: 10, label: '10 Weeks', category: 'Mandatory' },
  { vaccine: 'PCV', doseNumber: 2, scheduledAgeWeeks: 10, label: '10 Weeks', category: 'Mandatory' },

  // 14 Weeks
  { vaccine: 'DTwP / DTaP', doseNumber: 3, scheduledAgeWeeks: 14, label: '14 Weeks', category: 'Mandatory' },
  { vaccine: 'IPV', doseNumber: 3, scheduledAgeWeeks: 14, label: '14 Weeks', category: 'Mandatory' },
  { vaccine: 'Hib', doseNumber: 3, scheduledAgeWeeks: 14, label: '14 Weeks', category: 'Mandatory' },
  { vaccine: 'OPV', doseNumber: 3, scheduledAgeWeeks: 14, label: '14 Weeks', category: 'Mandatory' },
  { vaccine: 'Rotavirus', doseNumber: 3, scheduledAgeWeeks: 14, label: '14 Weeks', category: 'Optional' },
  { vaccine: 'PCV', doseNumber: 3, scheduledAgeWeeks: 14, label: '14 Weeks', category: 'Mandatory' },

  // 6 Months
  { vaccine: 'Hepatitis B', doseNumber: 3, scheduledAgeWeeks: 26, label: '6 Months', category: 'Mandatory' },
  { vaccine: 'Influenza', doseNumber: 1, scheduledAgeWeeks: 26, label: '6 Months', category: 'Optional' },

  // 9 Months
  { vaccine: 'OPV', doseNumber: 4, scheduledAgeWeeks: 39, label: '9 Months', category: 'Mandatory' },
  { vaccine: 'MMR', doseNumber: 1, scheduledAgeWeeks: 39, label: '9 Months', category: 'Mandatory' },
  { vaccine: 'Typhoid Conjugate', doseNumber: 1, scheduledAgeWeeks: 39, label: '9 Months', category: 'Mandatory' },

  // 12 Months
  { vaccine: 'Hepatitis A', doseNumber: 1, scheduledAgeWeeks: 52, label: '12 Months', category: 'Mandatory' },
  { vaccine: 'PCV', doseNumber: 4, scheduledAgeWeeks: 52, label: '12 Months (Booster)', category: 'Mandatory' },
  { vaccine: 'Varicella', doseNumber: 1, scheduledAgeWeeks: 52, label: '12 Months', category: 'Mandatory' },

  // 15 Months
  { vaccine: 'MMR', doseNumber: 2, scheduledAgeWeeks: 65, label: '15 Months', category: 'Mandatory' },
  { vaccine: 'Varicella', doseNumber: 2, scheduledAgeWeeks: 65, label: '15 Months', category: 'Mandatory' },

  // 18 Months
  { vaccine: 'DTwP / DTaP', doseNumber: 4, scheduledAgeWeeks: 78, label: '18 Months (Booster 1)', category: 'Mandatory' },
  { vaccine: 'Hib', doseNumber: 4, scheduledAgeWeeks: 78, label: '18 Months (Booster 1)', category: 'Mandatory' },
  { vaccine: 'IPV', doseNumber: 4, scheduledAgeWeeks: 78, label: '18 Months (Booster 1)', category: 'Mandatory' },
  { vaccine: 'OPV', doseNumber: 5, scheduledAgeWeeks: 78, label: '18 Months (Booster 1)', category: 'Mandatory' },
  { vaccine: 'Hepatitis A', doseNumber: 2, scheduledAgeWeeks: 78, label: '18 Months', category: 'Mandatory' },

  // 2 Years
  { vaccine: 'Typhoid Conjugate', doseNumber: 2, scheduledAgeWeeks: 104, label: '2 Years (Booster)', category: 'Mandatory' },

  // 4–6 Years
  { vaccine: 'DTwP / DTaP', doseNumber: 5, scheduledAgeWeeks: 208, label: '5 Years (Booster 2)', category: 'Mandatory' },
  { vaccine: 'OPV', doseNumber: 6, scheduledAgeWeeks: 208, label: '5 Years (Booster 2)', category: 'Mandatory' },
  { vaccine: 'MMR', doseNumber: 3, scheduledAgeWeeks: 208, label: '5 Years', category: 'Optional' },
];

// Group labels in display order
export const IAP_MILESTONE_ORDER = [
  'Birth', '6 Weeks', '10 Weeks', '14 Weeks',
  '6 Months', '9 Months', '12 Months', '15 Months',
  '18 Months', '2 Years', '5 Years (Booster 2)',
];
