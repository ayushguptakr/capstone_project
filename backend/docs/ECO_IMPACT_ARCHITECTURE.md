# Eco-Impact Quantification Engine & Sustainability Analytics

## Architecture Overview

- **Controllers**: Handle HTTP, validation, and delegate to services.
- **Services**: Business logic (EcoImpactEngine, ranking, trust score, analytics, recommendations).
- **Repositories**: Data access (EcoImpactLog, SustainabilityScore, Task, RegionalImpactCoefficient).
- **Utils**: Formulas, image hash, errors.
- **Validators**: Input validation for eco-impact and analytics endpoints.

## 1. Eco-Impact Quantification Engine

**Module**: `services/EcoImpactEngine.js`

- Converts approved eco-task submissions into:
  - **CO₂ reduced** (kg), **water saved** (L), **waste diverted** (kg), **energy saved** (kWh).
- Uses **impact coefficients** from:
  1. Task `impact_model` (if set),
  2. Else `RegionalImpactCoefficient` (region + category),
  3. Else defaults to 0.
- **PSI** (Personal Sustainability Index):
  - `PSI contribution = Impact Value × Consistency Multiplier × Difficulty Weight`
  - Stored per action in `eco_impact_logs`; can be summed per student/school.
- **Task schema addition** (see `models/Task.js`):
  - `impact_model`: `{ co2_per_unit, water_per_unit, waste_per_unit, energy_per_unit, impact_weight, unit_label }`
  - `category`, `difficulty` (1–5).

**Collections**:
- `eco_impact_logs`: submission, task, student, school, className, co2Reduced, waterSaved, wasteDiverted, energySaved, impactValue, psiContribution, etc.

**Aggregation** (MongoDB pipelines in `repositories/ecoImpactLogRepository.js`):
- By student, by school, by class (school + className), by campaign (campaignId).
- Monthly trend, category-wise impact.

---

## 2. Dynamic Sustainability Ranking

**Formula**:
`Adjusted Score = (Impact Score × Consistency Index × Time Recency Factor) / School Population Normalizer`

- **Impact Score**: Time-weighted sum of `impactValue` (recent actions weigh more; half-life 30 days).
- **Consistency Index**: From participation frequency in window.
- **Time Recency Factor**: Exponential decay by action date.
- **School Population Normalizer**: `1 + log10(1 + studentCount)` so small schools don’t dominate.

**Endpoints**:
- `GET /api/leaderboard/student` – student ranking by adjusted score.
- `GET /api/leaderboard/class` – class ranking.
- `GET /api/leaderboard/school` – school ranking.

**Collection**: `sustainability_scores` (cached per student, class, school); refreshed on verification and via `POST /api/eco-impact/refresh-ranking/:studentId`.

---

## 3. Hybrid AI + Teacher Verification Layer

**Module**: `services/trustScoreService.js`

- **Duplicate image**: SHA-256 hash of image; if same hash exists for same student → deduct from trust score.
- **Timestamp anomaly**: `submittedAt` too far in future or older than 7 days → flag.
- **Geo-tag**: If geo required, invalid or missing lat/lng → deduct.
- **submission_trust_score** (0–100) and **flagForReview** stored on `Submission`.
- If `trust_score < threshold` (default 60) → `flagForReview = true`; teacher sees these first in verification queue.

**Collections**: `trust_scores` (optional audit log per submission).

---

## 4. Sustainability Analytics Dashboard

**Endpoints** (under `GET /api/analytics/sustainability/`):

- `totals` – Total CO₂, water, waste, energy (optional school, date range).
- `monthly-trend` – Monthly aggregates for graphs.
- `category-impact` – Impact by task category.
- `green-rating` – School Green Rating (A/B/C/D) from per-capita impact thresholds.
- `dashboard` – Combined payload (totals, monthlyTrend, categoryImpact, greenRatings).

---

## 5. Adaptive Eco-Task Recommendation Engine

**Module**: `services/recommendationEngine.js`

- **Weak category**: Lowest impact category for the student → recommend tasks in that category.
- **Local focus**: School’s top category from aggregate impact.
- **Ranking**: Recommended tasks by impact improvement potential (weak category + local focus + difficulty/points).

**Endpoints**:
- `GET /api/recommendations/tasks` – Recommended tasks for current student.
- `GET /api/recommendations/weak-category` – Student’s weak category.

---

## 6. Database Modifications

**Extended models**:
- **User**: `className`, `greenCredits`, role `sponsor`.
- **Task**: `impact_model`, `category`, `difficulty`.
- **Submission**: `submittedAt`, `imageHash`, `geoTag`, `submission_trust_score`, `flagForReview`.

**New collections**:
- `eco_impact_logs`
- `sustainability_scores`
- `trust_scores`
- `regional_impact_coefficients`

---

## 7. Green Credits (Bonus)

- **Award**: On approval, impact is converted to Green Credits and added to `User.greenCredits`.
- **Conversion** (see `utils/formulas.js`): per kg CO₂, per L water, per kg waste, per kWh energy.
- **Endpoints**:
  - `GET /api/green-credits/balance` – Current balance.
  - `POST /api/green-credits/redeem` – Body `{ amount, reason }`.
  - `GET /api/green-credits/report` – Sustainability report data (for certificates / PDF export).

---

## 8. API Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/eco-impact/student/:studentId | Student impact logs |
| GET | /api/eco-impact/aggregate/student | Aggregate by student |
| GET | /api/eco-impact/aggregate/school | Aggregate by school |
| GET | /api/eco-impact/aggregate/class | Aggregate by class (query: school) |
| POST | /api/eco-impact/refresh-ranking/:studentId | Refresh sustainability score |
| GET | /api/leaderboard/student | Sustainability student leaderboard |
| GET | /api/leaderboard/class | Class leaderboard |
| GET | /api/leaderboard/school | School leaderboard |
| GET | /api/analytics/sustainability/totals | Totals |
| GET | /api/analytics/sustainability/monthly-trend | Monthly trend |
| GET | /api/analytics/sustainability/category-impact | Category impact |
| GET | /api/analytics/sustainability/green-rating | School green rating |
| GET | /api/analytics/sustainability/dashboard | Full dashboard |
| GET | /api/recommendations/tasks | Recommended tasks |
| GET | /api/recommendations/weak-category | Weak category |
| GET | /api/green-credits/balance | Green credits balance |
| POST | /api/green-credits/redeem | Redeem credits |
| GET | /api/green-credits/report | Sustainability report data |

---

## 9. Unit Tests

- `tests/formulas.test.js` – PSI, time decay, difficulty, normalizer, adjusted score, green credits.
- `tests/trustScoreService.test.js` – Timestamp anomaly and geo validation (no DB).

Run: `npm test`
