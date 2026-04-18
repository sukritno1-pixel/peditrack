# PediTrack - Memory Map

## Project Overview
PediTrack is a Pediatric Patient Record Keeping Progressive Web App (PWA) designed for a single-doctor private practice in India. It complies with India's DPDPA 2023 regulations by storing data securely and requiring patient consent (handled offline by the doctor).

## Architecture
- **Frontend**: React + Vite
- **PWA Capabilities**: `vite-plugin-pwa` (offline caching, home screen install on iOS 26 Safari)
- **Styling**: Custom CSS variables in `src/index.css` (Bright pediatric theme: Coral, Teal, Golden Yellow)
- **Backend & Auth**: Supabase Free Tier (500MB DB, 1GB Storage)
- **OCR**: Tesseract.js (Client-side text extraction from images)
- **Hosting**: Vercel (Hobby plan)
- **Version Control**: GitHub

## Database Schema (Supabase)
The database uses Row Level Security (RLS) so the doctor only sees their own patients.
- `patients`: Core patient info (name, DOB, gender, guardian info, allergies, blood group)
- `visits`: Individual visit records (complaint, diagnosis, prescription, vitals, remarks)
- `visit_images`: Metadata for images uploaded during visits (includes extracted `ocr_text`)
- `growth_records`: Separate table to track weight/height/HC for plotting on charts

## File Structure & Responsibilities
- `vite.config.js`: Vite and PWA config. Configures Workbox for offline font caching.
- `src/main.jsx`: React root.
- `src/App.jsx`: Main routing logic and Auth/Toast context providers.
- `src/lib/supabase.js`: Supabase client initialization and all DB/Storage CRUD functions.
- `src/lib/ocr.js`: Tesseract.js initialization and text extraction logic.
- `src/utils/formatters.js`: Helpers for age calculation, dates, phone numbers, etc.
- `src/index.css`: Complete design system (colors, buttons, cards, animations).

### Components (`src/components/`)
- `Layout.jsx`: App shell, header, and mobile bottom navigation.
- `LoginPage.jsx`: Sign in / Sign up screen with animated pediatric background.
- `Dashboard.jsx`: Stats overview, recent patients, quick actions.
- `PatientList.jsx`: Searchable list of all patients.
- `PatientForm.jsx`: Create/Edit patient details.
- `PatientProfile.jsx`: Patient hub. Shows timeline of visits, info, and image gallery.
- `VisitForm.jsx`: Record a visit. Includes vitals input and Image Upload + OCR extraction.
- `VisitSummary.jsx`: Auto-generated summary of all previous visits for a patient.
- `ImageGallery.jsx`: View all images uploaded for a patient across all visits.

## Deployment Steps
1. Create a project in Supabase.
2. Run the SQL schema (found in the original Implementation Plan artifact) in Supabase SQL editor.
3. Create a public storage bucket named `patient-images`.
4. Get Supabase URL and Anon Key and add them to `.env`.
5. Push to GitHub.
6. Connect GitHub repo to Vercel for auto-deployment.
7. To install on iPhone 17: Open Vercel URL in Safari -> Share -> Add to Home Screen.

## Current Status (Phase 1 MVP Complete)
The Phase 1 MVP is fully coded. The project builds successfully. 

## Next Steps for Future Agents
1. **Growth Charts**: Integrate `react-chartjs-2` to plot the `growth_records` data on WHO/IAP percentiles.
2. **AI Summaries**: Currently `VisitSummary.jsx` is template-based. Can be upgraded to use the Gemini API.
3. **Vaccination Tracker**: Add a new table and component for the Indian Immunization Schedule.
