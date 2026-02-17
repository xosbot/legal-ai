# LOOPHOLES.CLAIMS — Repository Overview & Development Plan

## Overview

This repository is a React/TypeScript single-page application called **LOOPHOLES.CLAIMS**, an AI-powered legal defense tool for Indian criminal law. It analyzes FIR (First Information Report) documents against statutes (BNS 2023, NDPS Act 1985, Family Courts Act 1984) using Google Gemini AI to identify legal loopholes for defense lawyers. Loopholes are categorized into three types:

- **Lucrative** — potential for immediate bail or FIR quashing
- **Legit** — technically sound arguments based on precedents
- **Unseen** — subtle procedural errors overlooked by general practitioners

The application operates on a credit-based model (1500 LexCoins per analysis) with an admin dashboard for billing management.

---

## Technology Stack

| Category | Technology |
|---|---|
| Frontend | React 19.2.4, TypeScript 5.8.2, Vite 6.2.0, Tailwind CSS (CDN) |
| AI | Google Gemini (`@google/genai` v1.41.0) — `gemini-3-flash-preview` + TTS |
| Utilities | jsPDF 2.5.1, Web Audio API, LocalStorage |
| Backend | None (pure frontend SPA) |
| Tests | None |

---

## File Structure

```
/
├── App.tsx                   # Main orchestrator, state, routing (22.6 KB)
├── index.tsx                 # React entry point
├── index.html                # Template with matrix-style CSS, CDN assets
├── types.ts                  # TypeScript interfaces
├── vite.config.ts            # Vite config, API key injection
├── services/
│   └── geminiService.ts      # All Gemini AI calls (analyze, chat, TTS, lookup)
├── components/               # 12 React components
│   ├── AnalysisPanel.tsx     # Loophole display, PDF export, TTS playback
│   ├── ChatInterface.tsx     # Per-suspect AI chat
│   ├── AdminDashboard.tsx    # Admin terminal UI (cosmetic only)
│   ├── CoinStore.tsx         # Credit purchase (fake payments)
│   ├── PublicAccess.tsx      # Login portal (mock OAuth)
│   ├── AdminLogin.tsx        # Admin auth (hardcoded password)
│   ├── GoogleLogin.tsx       # Google OAuth (not integrated)
│   ├── SuspectManager.tsx    # Defendant profile management
│   ├── FileUpload.tsx        # PDF/image FIR upload
│   ├── Header.tsx            # Navigation bar
│   ├── ProfileSettings.tsx   # User profile
│   └── NotificationSystem.tsx# Toast alerts
└── constants/
    ├── statutes_vault.ts     # 6 statute references (4 are placeholder stubs)
    ├── ndps_act.ts           # NDPS Act 1985 (partial)
    └── family_court_act.ts   # Family Courts Act 1984 (partial)
```

---

## Application Flow

```
Landing → PublicAccess (mock login) → User Dashboard
  ├── SuspectManager → select defendant
  ├── FileUpload → upload FIR (PDF/image)
  ├── Statute Vault → select legal references
  ├── [Analyze] → geminiService.analyzeFIR() → AnalysisPanel
  │                                            └── TTS playback, PDF export
  └── ChatInterface → per-suspect follow-up questions

Admin Dashboard → AdminLogin (password: aibot123) → AdminDashboard (cosmetic terminal)
```

---

## Current Gaps and Issues

### Critical Security Issues

1. **Hardcoded admin password** — `AdminLogin.tsx:15` checks `pass === 'aibot123'` in plaintext client-side code
2. **API key in frontend bundle** — `vite.config.ts` injects `GEMINI_API_KEY` via `define:{}`, visible in browser DevTools
3. **Mock authentication** — `PublicAccess.tsx` uses fake hardcoded users; any visitor can log in as anyone
4. **Payment gateway credentials in localStorage** — `App.tsx` persists `AdminConfig` with live `apiKey` fields to localStorage
5. **Fake payment processing** — `CoinStore.tsx:34` uses a 2-second `setTimeout`; credits are given for free

### Technical Bugs

6. **Audio decoding bug** — `geminiService.ts:224` uses `new Int16Array(data.buffer)` which loses byte offset when `data` is a typed array view; correct form is `new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2)`
7. **LocalStorage quota** — base64-encoded FIR PDFs (2–5 MB each) stored in localStorage will silently fail at the 5–10 MB browser quota

### Feature Gaps

8. **PDF export incomplete** — `AnalysisPanel.tsx:75–82` only exports title + suspect name; all loopholes/strategies ignored
9. **Lawyer verification is a no-op** — `App.tsx:115` sets a boolean with no validation; anyone can self-verify
10. **Admin dashboard is cosmetic** — all metrics are `Math.floor(Math.random() * 1000000)`; no real data
11. **No tests** — zero test coverage, no test framework configured
12. **Statutes vault incomplete** — BNS 2023 is a single-sentence stub; BNSS 2023, BSA 2023 not included
13. **No backend** — all state is device-local; no multi-device sync, no audit trail

---

## Development Plan

### Phase 0 — Critical Security Fixes _(Must complete before any deployment)_

| Item | File(s) | Change |
|------|---------|--------|
| 0.1 Remove hardcoded password | `components/AdminLogin.tsx` | Use `VITE_ADMIN_PASSWORD_HASH` env var + Web Crypto SHA-256 comparison. Long-term: backend `/api/admin/login` JWT endpoint. |
| 0.2 Real Google OAuth | `components/PublicAccess.tsx`, `components/GoogleLogin.tsx` | Load Google Identity Services SDK; replace `setTimeout` mock with `google.accounts.id.initialize`; decode real credential JWT for user profile. |
| 0.3 Move Gemini API key server-side | `vite.config.ts`, `services/geminiService.ts` | Create proxy server (`/api/gemini-proxy`); remove `define:` block from vite config; replace all `new GoogleGenAI(...)` calls with `fetch('/api/...')`. |
| 0.4 Remove credentials from localStorage | `App.tsx`, `components/AdminDashboard.tsx` | Strip `apiKey` and `walletAddress` from `AdminConfig` client state and localStorage. |
| 0.5 Stop persisting FIR files | `App.tsx` | Remove localStorage read/write for `firFile` and `lawBookFile`. Session-only is acceptable and safer. |

**Verification**: `npm run build` output contains neither `aibot123` nor the Gemini API key literal. DevTools Network shows all AI calls going to `/api/` not `generativelanguage.googleapis.com`.

---

### Phase 1 — Backend Infrastructure _(Foundation for all subsequent phases)_

**New server structure** (Node.js / Express / TypeScript):

```
/server/
  index.ts
  middleware/auth.ts          — JWT verification
  middleware/rateLimit.ts     — Per-user throttle
  routes/auth.ts              — POST /api/auth/google
  routes/gemini.ts            — POST /api/analyze, /api/chat, /api/lookup
  routes/payments.ts          — POST /api/payments/initiate, /api/payments/webhook
  routes/users.ts             — GET/PUT /api/users/profile, credits
  db/schema.sql               — PostgreSQL tables
  db/client.ts                — DB connection
```

**PostgreSQL tables**: `users`, `credits`, `transactions`, `cases`, `suspects`, `analyses`, `chat_messages`

**Key implementations**:
- **Auth**: `POST /api/auth/google` verifies Google ID token via tokeninfo endpoint, returns 24h JWT stored in `sessionStorage`
- **Gemini proxy**: Credit deduction done atomically in DB transaction (prevents race condition where two simultaneous browser tabs could each trigger a free analysis)
- **Payments**: Razorpay integration — server creates Order, frontend loads Razorpay checkout, webhook confirms payment before crediting balance

**Frontend changes**: `services/geminiService.ts` (all API calls rerouted), `App.tsx` (replace localStorage reads with API calls)

**Verification**: Upload a real FIR, trigger analysis, verify credit deduction in DB, confirm result persisted in `analyses` table. Make a UPI payment; verify credits only added after webhook fires.

---

### Phase 2 — Feature Completion and Bug Fixes

| Item | File(s) | Change |
|------|---------|--------|
| 2.1 Complete PDF export | `components/AnalysisPanel.tsx` | Add `jspdf-autotable`; render all loopholes, strategies, prosecution gaps, counsel instructions. Add report UUID + timestamp. |
| 2.2 Fix audio decode bug | `services/geminiService.ts:224` | `new Int16Array(data.buffer)` → `new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2)`. Add error boundary around playback. |
| 2.3 Lawyer verification | `components/CoinStore.tsx`, `App.tsx`, `types.ts` | New `VerificationModal` collects Bar Council enrollment number + certificate upload. Backend sets `verificationStatus: 'pending'` until admin approves. |
| 2.4 Functional admin dashboard | `components/AdminDashboard.tsx` | Replace random numbers with real data from admin API endpoints. Keep terminal visual style. |

**Verification**: Exported PDF contains all loopholes. TTS plays without console errors.

---

### Phase 3 — Legal Content Expansion _(Parallel with Phase 2)_

| New File | Content |
|----------|---------|
| `constants/bnss_2023.ts` | BNSS 2023 Ch. V (Arrest), Ch. XII (FIR — S.173), Ch. XXIX (Bail SS.478–499) |
| `constants/bns_2023.ts` | Bharatiya Nyaya Sanhita 2023 — substantive offence definitions replacing IPC |
| `constants/bsa_2023.ts` | Bharatiya Sakshya Adhiniyam 2023 — evidence admissibility challenges |
| `constants/prompt_templates.ts` | 25 High Court jurisdiction contexts for jurisdiction-aware prompting |

Additionally: dynamic statute management (admin uploads PDFs → server extracts text → stored in DB → served via `GET /api/statutes`).

**Verification**: Select BNSS 2023 from vault; run analysis; AI cites Section 173 BNSS 2023 rather than old Section 154 CrPC.

---

### Phase 4 — Testing and Quality

**Setup** (add to `package.json`): `vitest`, `@testing-library/react`, `@testing-library/user-event`, `msw`

**Test files**:
- `tests/services/geminiService.test.ts` — `decodeBase64`, `decodeAudioData` (validates the buffer offset fix), schema validation
- `tests/components/AdminLogin.test.tsx` — wrong/correct password, no hardcoded string assertions
- `tests/components/CoinStore.test.tsx` — purchase flow with MSW mock, webhook confirmation gate
- `tests/components/AnalysisPanel.test.tsx` — loophole rendering, PDF export call, TTS trigger
- `tests/components/ChatInterface.test.tsx` — message persistence, error state, Enter-to-send

**Monitoring**: `@sentry/react` with source map upload; React `<ErrorBoundary>` around analysis flow.

**Verification**: `npm test` passes. Intentionally break `decodeAudioData`; confirm unit test catches it.

---

### Phase 5 — Scale and Enterprise _(After Phase 1 complete)_

| Item | Key Files | Description |
|------|-----------|-------------|
| 5.1 Multi-device case sync | `components/CaseManager.tsx`, `server/routes/cases.ts` | Cases (FIR + suspects + analyses + chat) as DB entities; sidebar list; cross-device access |
| 5.2 Audit trail | `server/routes/audit.ts`, `audit_log` DB table | Log every analysis, upload, credit purchase; per-case timeline view |
| 5.3 Subscription tiers | `types.ts`, `CoinStore.tsx`, `server/routes/payments.ts` | Solo (pay-per-use), Counsel (₹2,999/mo), Chambers (₹24,999/yr) via Razorpay Subscriptions |
| 5.4 Firm accounts | `components/FirmDashboard.tsx`, `server/routes/firms.ts` | Invite team members, shared credit pool, RBAC (admin / senior_counsel / junior_counsel) |
| 5.5 Public API | `server/routes/api-keys.ts`, OpenAPI docs | API key management for integrations with SpotDraft, Leegality, etc.; Swagger UI |

---

## Phase Sequencing

```
Phase 0 (Security)    — Must complete before any deployment
Phase 4 (Test setup)  — Can start immediately alongside Phase 0

Phase 1 (Backend)     — Requires 0.3 (proxy) as foundation
                        Order: 1.1 server → 1.2 auth → 1.3 Gemini → 1.4 payments

Phase 2 (Features)    — 2.1, 2.2 independent (start now)
                        2.3, 2.4 require Phase 1

Phase 3 (Content)     — 3.1–3.3 independent (start now)
                        3.4, 3.5 require Phase 1

Phase 5 (Enterprise)  — All require Phase 1 complete
                        Order: 5.1 → 5.2 → 5.3 → 5.4 → 5.5
```

---

## Summary: Current vs. Target State

| Dimension | Current | Target |
|---|---|---|
| Authentication | Fake mock users | Real Google OAuth + JWT server verification |
| Admin security | Hardcoded `aibot123` | Hashed credentials, RBAC, audit log |
| API key | Embedded in frontend bundle | Server-side only |
| Payments | 2-second fake delay, free credits | Razorpay with webhook verification |
| Data persistence | localStorage, single device | PostgreSQL, multi-device sync |
| Statutes vault | 6 items (4 are stubs) | BNS/BNSS/BSA/NDPS, 50+ items |
| Test coverage | 0% | 60%+ on critical paths |
| Error monitoring | `console.error` only | Sentry with source maps |
| PDF export | Title + name only | Full structured legal report |
| Audio TTS | Likely broken (buffer offset bug) | Fixed with error boundary |
| Business model | Credits given for free | Verified payment flow, subscription tiers |
| Team support | None | Firm accounts, role-based access |
