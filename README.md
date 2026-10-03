# Khak-e-Wathan

**Property discovery for Chitral.**

Khak-e-Wathan is a hackathon prototype for exploring and listing property across
Chitral, Pakistan. It combines structured property information, map-based
discovery, seller/admin workflows, explainable valuation, an ML valuation demo,
and natural-language property search.

> **Demo note:** Property data, valuation baselines, and the ML training dataset
> used in this project are synthetic/demo data. They should not be treated as
> verified market prices, legal parcel information, or professional appraisals.

## What the platform does

### Buyers
- Browse active property listings.
- Search using normal filters or natural-language requests.
- Explore listings on an interactive Chitral map.
- Open a Property Passport with consistent details about access, utilities,
  terrain, suitability, verification checks, photos, and approximate location.
- View an explainable demo valuation range.
- View a second ML valuation when all required structured inputs are available.

### Sellers
- Create a private draft.
- Mark an approximate location within the Chitral map area.
- Upload property photos.
- Review the listing before submitting it.
- Track draft, pending, active, and rejected listings from the dashboard.
- Edit rejected/draft listings and resubmit them.

### Admins
- Review pending listings.
- Inspect listing details and seller-uploaded photos.
- Update verification checks.
- Approve or reject listings with review notes.

## AI and ML

Khak-e-Wathan uses AI in two distinct places:

1. **Natural-language search**
   - An LLM interprets a buyer's request and converts it into validated search
     filters.
   - The actual results still come from the application's property listings.
   - A deterministic local parser is available as a fallback if the LLM call is
     unavailable.

2. **ML valuation**
   - A Random Forest model predicts a demo property value from structured land
     characteristics.
   - The model was trained on a **synthetic Chitral-style dataset**, not verified
     historical market transactions.
   - The UI keeps this separate from the explainable rule-based valuation.

The goal is to demonstrate useful AI-assisted workflows while keeping search
results grounded in actual listings and keeping valuation limitations visible.

## Tech stack

### Web application
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Storage, and Row Level Security
- Leaflet / React Leaflet
- OpenStreetMap tiles
- OpenAI Responses API for natural-language search

### ML service
- Python
- pandas
- scikit-learn
- joblib
- FastAPI
- Uvicorn

### Deployment
- Frontend: Vercel
- ML API: Railway
- Database/Auth/Storage: Supabase

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage |
| `/properties` | Browse and search listings |
| `/properties/[id]` | Property Passport / listing detail |
| `/map` | Map-based property discovery |
| `/login` | Sign in / create account |
| `/dashboard` | Seller dashboard |
| `/sell` | Create listing |
| `/sell/photos` | Upload listing photos |
| `/sell/review` | Final seller review |
| `/sell/edit/[id]` | Edit draft/rejected listing |
| `/admin` | Admin moderation queue |
| `/admin/properties/[id]` | Admin listing review |

## Local development

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Create `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

ML_API_URL=http://127.0.0.1:8000

OPENAI_API_KEY=your_openai_api_key
OPENAI_SEARCH_MODEL=gpt-6-luna
```

Do not commit `.env.local` or API secrets.

### 3. Start the Next.js app

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Running the ML service locally

From the project root:

```bash
python -m venv ml/.venv
```

Activate it on Windows:

```bash
source ml/.venv/Scripts/activate
```

Install dependencies:

```bash
pip install -r ml/requirements.txt
```

Run the API:

```bash
uvicorn ml.api:app --reload --port 8000
```

Useful endpoint:

```text
GET /health
```

The committed model is under `ml/models/`.

## Supabase requirements

The app expects Supabase tables for:

- `locations`
- `profiles`
- `properties`
- `property_images`
- `property_verifications`

It also relies on Row Level Security and privileged RPC/functions for seller
submission and admin moderation.

The current hackathon repository does **not** include database migration files,
so a fresh clone still needs the matching Supabase schema/policies/functions to
be configured separately.

For a production-quality continuation of the project, the next database
engineering step should be to version the Supabase schema and RLS policies as
migrations.

## Property location

Map coordinates represent an **approximate listing location**.

The Chitral map limits are a generous product/UX guardrail. They are **not** an
official district boundary, cadastral boundary, survey, or legal parcel map.

## Valuation disclaimer

The explainable valuation baselines and the ML training data are synthetic demo
inputs created for the hackathon.

Valuation output is for product demonstration only and is not:
- a professional appraisal,
- verified Chitral market evidence,
- legal advice,
- or a guarantee of sale value.

## Production checks

Before deploying a final build:

```bash
npm run lint
npm run build
```

Then smoke-test:

1. Homepage and navigation.
2. Property search and filters.
3. Natural-language search.
4. `/map` on desktop and mobile.
5. Property detail and valuation.
6. Sign up / sign in / sign out.
7. Seller create → photos → review → submit.
8. Admin verification → approve/reject.
9. Public visibility after approval.
10. Railway `/health` and ML prediction availability.

## Repository hygiene

Generated caches and secrets should not be committed:

```text
node_modules/
.next/
.env*
ml/.venv/
**/__pycache__/
*.pyc
*.tsbuildinfo
```

## Brand

**Khak-e-Wathan**  
Property discovery for Chitral.

The house, mountain, and location-pin mark represents property discovery rooted
in Chitral's landscape.
