# TRUS.AI MVP

Transparent Responsible Unified System for AI in Banking – hackathon MVP.

## High-Level Architecture

- **Frontend**: Next.js prototype with basic styling, implementing loan explanation, consent controls, and audit viewer.
- **Backend**: Node.js (Express) API exposing loan scoring, consent management, and hash-chain-backed audit logging.
- **Database**: MongoDB for customers, loan applications, consent flags, and the append-only audit log (hash chain).
- **AI & Explainability**:
  - Kaggle Loan Prediction dataset for model training and seeding demo data.
  - Logistic regression (or similar) trained offline; SHAP values precomputed for explanations.
  - HuggingFace inference API to convert feature-level rationale into user-friendly narratives.
- **Governance**: Audit log entries chained via SHA-256 (`prevHash` + payload hash) persisted in MongoDB.

## Repository Layout

- `backend/` – Express service, Mongo models, HuggingFace integration, hash-chain audit helpers.
- `frontend/` – Next.js app with dashboard flows.
- `notebooks/` – Data prep and model training notebooks.
- `data/` – Raw Kaggle dataset, processed artifacts, and seed JSON payloads.

## Key MVP Flows

1. **Loan Denial Explanation**
   - Score application via backend API.
   - Return numerical factors + natural-language summary.
2. **Dynamic Consent Toggle**
   - View and update consent categories per customer.
   - Persist updates and append audit entries.
3. **Audit Trail Viewer**
   - Paginated log with integrity marker (hash chain verification).

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB running locally on `mongodb://localhost:27017/trus-ai`
- (Optional) HuggingFace API token for production-grade summaries

### Environment

Create `backend/.env` with values (defaults shown):

```bash
MONGODB_URI=mongodb://localhost:27017/trus-ai
PORT=4000
HUGGINGFACE_API_URL=https://api-inference.huggingface.co/models/facebook/bart-large-cnn
HUGGINGFACE_API_TOKEN=demo-token
```

Use `demo-token` to enable the rule-based fallback if you do not have an API key.

### Setup

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

Backend launches on `http://localhost:4000`, frontend on `http://localhost:3000`.

## Demo Script

1. **Loan Decision Studio**
   - Navigate to `/applications`.
   - Pick a sample scenario (approved / denied / manual review).
   - Submit to view probability, top feature impacts, and explanation narrative.
   - Result stored in `loan_applications` and audit entry appended.
2. **Dynamic Consent Center**
   - Go to `/consent`.
   - Switch between demo customers, toggle a consent flag.
   - Observe success toast; action emits `CONSENT_UPDATED` in audit log.
3. **Immutable Audit Trail**
   - Open `/audit`.
   - Filter by customer or loan application ID from earlier steps.
   - Integrity badge shows hash-chain verification; table reveals payloads.

## Data & Model Artifacts

- Kaggle dataset: `data/raw/` (download `loan-train.csv`, `loan-test.csv` per notebook instructions).
- Notebook `notebooks/loan_model.ipynb` cleans data, trains simple logistic model, computes SHAP, and exports to `data/artifacts/loan_model.json`.
- Current repo ships with a precomputed `loan_model.json` so the demo works without running the notebook.

## Testing & Builds

- Backend: `npm run build` (TypeScript compile).
- Frontend: `npm run lint`, `npm run build`.

## Pitch Talking Points

- **Transparency**: Customer-friendly narratives derived from feature weights + HuggingFace summarization.
- **Control**: Live consent toggles with audit-trail feedback loop.
- **Accountability**: Mongo-backed hash chain, integrity badge, regulator-ready evidence.

## Future Enhancements

- Replace heuristic logistic weights with full SHAP export from notebook pipeline.
- Add role-based auth and judge dashboards.
- Bundle with Docker compose for one-command spin-up.


