# Khak-e-Wathan QA Report — v2.5

This audit was performed against the committed ZIP snapshot supplied after the
branding and map-overlay fixes.

## Good results

- No `.env` files or obvious API-key values were found in the ZIP.
- Literal internal route/link scan found no missing application routes.
- Local `@/` import resolution scan found no missing source imports.
- TypeScript/TSX parser scan found no syntax parse errors before this patch.
- Python ML source files compile successfully.
- Representative deterministic natural-language search tests passed, including:
  - Booni + residential + max price + road
  - Balach + agricultural + no water
  - generic "Chitral" not being mistaken for Chitral City
  - explicit Chitral City
  - million/lakh conversion
  - negative road/electricity requirements
  - Reshoon → Reshun alias

## Fixes included in this package

### 1. Property data truthfulness
The old frontend mapper converted missing values into optimistic defaults:
- unknown internet → Good
- unknown terrain → Flat
- unknown slope → Low
- unknown suitability → High
- unknown main-road distance → 0 m

That could make an incomplete listing look better than the stored data and
could also affect filtering/ML input.

This patch preserves those fields as `null` when they were not supplied. The
Property Passport can now truthfully display "Not specified", and explicit
search filters no longer match unknown values.

Files:
- `types/property.ts`
- `lib/properties.ts`

### 2. ML input integrity and timeout
The ML model requires complete structured inputs. It should not receive invented
defaults for missing listing fields.

This patch:
- skips the ML estimate when required model inputs are missing,
- gives the user a distinct "More property details needed" state,
- keeps the explainable valuation available,
- adds a 6-second request timeout so a slow/offline ML service does not hold the
  property page indefinitely,
- rejects invalid non-numeric prediction responses.

Files:
- `lib/ml.ts`
- `components/MLValuationCard.tsx`

### 3. ML model-version reproducibility
The committed joblib model was serialized with scikit-learn 1.9.1, while the
requirements file previously allowed any scikit-learn version.

This patch pins:
`scikit-learn==1.9.1`

File:
- `ml/requirements.txt`

### 4. Server-side Chitral coordinate guardrail
The seller map already constrains users in the browser, but a modified request
could bypass the UI and submit coordinates outside the Chitral map area.

The create/update server actions now enforce the same generous Chitral
guardrail before saving coordinates.

File:
- `app/sell/actions.ts`

### 5. Main map control collision
The main marketplace map still had a top-left overlay in Leaflet's zoom-control
space, similar to the property-detail bug already fixed.

The map context badge now sits below the zoom controls while "Reset view"
remains top-right.

File:
- `components/map/PropertyMap.tsx`

### 6. Mobile Leaflet resize
The responsive marketplace map can be mounted while its mobile panel is hidden.
Leaflet may otherwise keep an incorrect size when the user switches from List
to Map.

A ResizeObserver now invalidates the Leaflet size when the map container
changes dimensions.

File:
- `components/map/PropertyMap.tsx`

### 7. Login branding
The login screen was the remaining page using the old plain "K" box.

It now uses the selected house/mountains/location-pin `BrandMark`.

File:
- `app/login/page.tsx`

### 8. 404 copy
Removed the "feature may still be under development" wording from the production
404 page.

File:
- `app/not-found.tsx`

### 9. README
The repository still contained the default Create Next App README.

This package replaces it with a project-specific README covering:
- product features,
- AI/ML architecture,
- synthetic-data limitations,
- setup,
- environment variables,
- ML service,
- Supabase requirements,
- routes,
- deployment checks.

File:
- `README.md`

## Repository cleanup to do manually

Your committed archive contains generated Python bytecode even though
`.gitignore` already ignores it:

```text
ml/__pycache__/__init__.cpython-314.pyc
ml/__pycache__/api.cpython-314.pyc
```

After installing this patch, remove the tracked cache with:

```bash
git rm -r ml/__pycache__
```

Three source components also appear unused in the current import graph:

```text
components/HomeSearchForm.tsx
components/LocationSection.tsx
components/VerificationPanel.tsx
```

They are not a runtime problem. You can leave them until after the build, or
remove them as cleanup once you confirm nothing depends on them.

## Important limitation of this audit

A full `npm ci` / Next.js build could not be completed inside the QA sandbox
because dependency package retrieval was unavailable/timed out. That is an
environment limitation, not a successful build result.

After copying this patch, the local build on your machine is required:

```bash
rm -rf .next
npm run lint
npm run build
```

Do not push the QA-fix commit until those commands pass, or share the exact
error output if one fails.

## Still recommended after the local build

- Production smoke test on Vercel.
- Test seller → admin → public-listing workflow with a fresh demo listing.
- Test AI search with the production OpenAI environment variables.
- Test Railway `/health` and one live property ML valuation.
- Check `/map` and a property detail page on a narrow mobile viewport.
- Add/version Supabase migrations in a future engineering pass if the repo needs
  to be reproducible from scratch.
- Optional: add a branded social-share/Open Graph image once the final public
  production URL is settled.
