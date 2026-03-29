# Feature Verification Checklist

Use this to confirm all **Eco-Impact & Sustainability** features are implemented and how to see them.

---

## 1. Implementation Status

| # | Feature | Status | Where to see it |
|---|--------|--------|-----------------|
| **1** | **Eco-Impact Quantification Engine** | ✅ | `services/EcoImpactEngine.js`, `models/EcoImpactLog.js`, `repositories/ecoImpactLogRepository.js` |
| | CO₂ / water / waste / energy conversion | ✅ | Task `impact_model` in `models/Task.js`; used in `EcoImpactEngine.computeAndLogImpact` |
| | Configurable coefficients in DB | ✅ | `models/RegionalImpactCoefficient.js`, `repositories/regionalCoefficientRepository.js` |
| | PSI formula & eco_impact_logs | ✅ | `utils/formulas.js` (computePSIContribution), logs on teacher **approve** in `teacherController.js` |
| | Student/class/school/campaign aggregation | ✅ | `ecoImpactLogRepository.js`: aggregateByStudent, aggregateBySchool, aggregateByClass, aggregateByCampaign |
| **2** | **Dynamic Sustainability Ranking** | ✅ | `services/sustainabilityRankingService.js`, `models/SustainabilityScore.js` |
| | Adjusted score formula | ✅ | `utils/formulas.js`: adjustedSustainabilityScore, timeRecencyFactor, schoolPopulationNormalizer |
| | Leaderboard APIs | ✅ | `GET /api/leaderboard/student`, `/class`, `/school` in `routes/leaderboard.js` |
| **3** | **Hybrid AI + Teacher Verification** | ✅ | `services/trustScoreService.js`, Submission fields in `models/Submission.js` |
| | Duplicate image (hash) | ✅ | `utils/imageHash.js`; used in `submissionController.submitTask` |
| | Timestamp anomaly, geo validation | ✅ | `trustScoreService.js`: hasTimestampAnomaly, geoValidationFailed |
| | submission_trust_score & flagForReview | ✅ | Set in `submissionController` after submit; teacher queue in `teacherController.getVerificationQueue` |
| **4** | **Sustainability Analytics Dashboard** | ✅ | `services/sustainabilityAnalyticsService.js`, `controllers/sustainabilityAnalyticsController.js` |
| | Totals, monthly trend, category impact | ✅ | `GET /api/analytics/sustainability/totals`, `/monthly-trend`, `/category-impact` |
| | School Green Rating (A/B/C) | ✅ | `GET /api/analytics/sustainability/green-rating` |
| | Combined dashboard | ✅ | `GET /api/analytics/sustainability/dashboard` |
| **5** | **Adaptive Eco-Task Recommendations** | ✅ | `services/recommendationEngine.js`, `controllers/recommendationController.js` |
| | Weak category, local focus, ranked tasks | ✅ | `GET /api/recommendations/tasks`, `GET /api/recommendations/weak-category` |
| **6** | **Database changes** | ✅ | Extended: `User`, `Task`, `Submission`. New: `EcoImpactLog`, `SustainabilityScore`, `TrustScore`, `RegionalImpactCoefficient` |
| **7** | **Architecture (controllers/services/repos/utils)** | ✅ | `controllers/`, `services/`, `repositories/`, `utils/`, `validators/` |
| **8** | **Green Credits (bonus)** | ✅ | `controllers/greenCreditsController.js`, `routes/greenCredits.js`, User.greenCredits; award on verify |
| **9** | **Adaptive Eco‑Game Difficulty Engine** | ✅ | `services/adaptiveDifficultyEngine.js`, `models/AdaptiveProfile.js`, `utils/adaptiveRules.js` |
| | Tracks accuracy, timings, mistake patterns, retries | ✅ | Updates in `controllers/quizController.js` (submitQuiz) and `controllers/miniGameController.js` (submitGameScore) |
| | Adjusts difficulty, hints, reward multiplier, penalty weight | ✅ | `utils/adaptiveRules.js` + returned in API responses as `adaptive` |
| | Adaptive content endpoints | ✅ | `GET /api/quizzes/adaptive`, `GET /api/mini-games/adaptive`, `GET /api/adaptive-engine/me` |

---

## 2. How to See It (Quick Checks)

### Prerequisites
- Backend running: `npm run dev` in `backend/`
- You have a user (student/teacher) and a JWT token (e.g. from login).

### A. Check routes are mounted
- Open `backend/server.js`: you should see `app.use("/api/eco-impact", ...)`, `app.use("/api/analytics/sustainability", ...)`, `app.use("/api/recommendations", ...)`, `app.use("/api/green-credits", ...)`.
- Leaderboard: same router has `router.get("/student", ...)`, `router.get("/class", ...)`, `router.get("/school", ...)` in `routes/leaderboard.js`.

### B. Call APIs (replace `YOUR_JWT` with real token)

From terminal (PowerShell):

```powershell
$token = "YOUR_JWT"
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:5000/api/leaderboard/student" -Headers $headers
Invoke-RestMethod -Uri "http://localhost:5000/api/analytics/sustainability/totals" -Headers $headers
Invoke-RestMethod -Uri "http://localhost:5000/api/analytics/sustainability/dashboard" -Headers $headers
Invoke-RestMethod -Uri "http://localhost:5000/api/green-credits/balance" -Headers $headers
Invoke-RestMethod -Uri "http://localhost:5000/api/adaptive-engine/me" -Headers $headers
Invoke-RestMethod -Uri "http://localhost:5000/api/quizzes/adaptive?category=water&limit=5" -Headers $headers
Invoke-RestMethod -Uri "http://localhost:5000/api/mini-games/adaptive?category=water&limit=5" -Headers $headers
```

For **student** only (recommendations):
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/recommendations/tasks" -Headers $headers
Invoke-RestMethod -Uri "http://localhost:5000/api/recommendations/weak-category" -Headers $headers
```

For **eco-impact** (use a real student id):
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/eco-impact/student/STUDENT_OBJECT_ID" -Headers $headers
Invoke-RestMethod -Uri "http://localhost:5000/api/eco-impact/aggregate/student" -Headers $headers
```

### C. End-to-end flow to “see” impact & trust

1. **Create a task** with impact (teacher):  
   `POST /api/tasks/create` with body including `impact_model`, e.g.  
   `{ "title": "Recycle", "description": "Recycle 1 bag", "points": 10, "impact_model": { "co2_per_unit": 2, "water_per_unit": 0, "waste_per_unit": 1, "energy_per_unit": 0, "impact_weight": 1 } }`
2. **Submit as student**:  
   `POST /api/submissions/submit` with `taskId`, `text`, optional file.  
   Response should include `trustScore` and `flagForReview`.
3. **Verify as teacher**:  
   `PUT /api/teacher/verify/:submissionId` with `{ "status": "approved", "feedback": "OK" }`.
4. Then call:
   - `GET /api/eco-impact/student/:thatStudentId` → you should see a new log with co2Reduced, etc.
   - `GET /api/leaderboard/student` → that student can appear in sustainability ranking.
   - `GET /api/green-credits/balance` (as that student) → balance may increase.

### D. Unit tests
```bash
cd backend
npm test
```
- `tests/formulas.test.js` – PSI, time decay, adjusted score, green credits.
- `tests/trustScoreService.test.js` – timestamp and geo validation logic.

---

## 3. File Map (Where Is What)

| Feature | Main files |
|--------|------------|
| Eco-Impact Engine | `services/EcoImpactEngine.js`, `models/EcoImpactLog.js`, `repositories/ecoImpactLogRepository.js` |
| Formulas (PSI, adjusted score, green credits) | `utils/formulas.js` |
| Sustainability ranking | `services/sustainabilityRankingService.js`, `models/SustainabilityScore.js`, `repositories/sustainabilityScoreRepository.js` |
| Leaderboard (sustainability) | `controllers/sustainabilityLeaderboardController.js`, routes in `routes/leaderboard.js` |
| Trust score & verification | `services/trustScoreService.js`, `utils/imageHash.js`, `models/TrustScore.js`, `controllers/submissionController.js`, `controllers/teacherController.js` |
| Analytics dashboard | `services/sustainabilityAnalyticsService.js`, `controllers/sustainabilityAnalyticsController.js`, `routes/sustainabilityAnalytics.js` |
| Recommendations | `services/recommendationEngine.js`, `controllers/recommendationController.js`, `routes/recommendations.js` |
| Green credits | `controllers/greenCreditsController.js`, `routes/greenCredits.js`, User.greenCredits, award in `teacherController.verifySubmission` |

---

Yes, **all requested features are implemented**. Use the sections above to confirm in code and via API/flow.
