# Backend Deployment Runbook

This runbook covers production deployment and runtime checks for the EcoQuest backend.

## 1) Required Environment Variables

- `PORT` (default: `5000`)
- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGINS` (comma-separated allowlist, example: `https://app.example.com,https://admin.example.com`)

### Feature/ops tuning (optional)

- `XP_PER_LEVEL` (default: `100`)
- `GAME_MIN_SECONDS` (default: `12`)
- `GAME_DAILY_XP_CAP` (default: `120`)
- `GAME_PER_GAME_DAILY_XP_CAP` (default: `40`)

## 2) Start Commands

### Production

```bash
npm install --production
npm start
```

### Development

```bash
npm install
npm run dev
```

## 3) Health and Readiness Probes

The server exposes:

- `GET /health` -> liveness + uptime + `mongoReadyState`
- `GET /ready` -> returns `200` only when Mongo is connected, otherwise `503`

Recommended probe usage:

- Liveness probe: `/health`
- Readiness probe: `/ready`

## 4) Zero-Downtime Rollout Notes

1. Deploy new version with env vars configured.
2. Wait for `/ready` to return `200`.
3. Switch traffic/load balancer to the new version.
4. Drain and stop old instances.

The app supports graceful shutdown on `SIGTERM`/`SIGINT`:

- stops accepting new HTTP connections
- closes Mongo connection

## 5) Operational Troubleshooting

- If `/ready` is `503`, verify `MONGO_URI` and DB network ACL.
- If auth fails globally, verify `JWT_SECRET` consistency across instances.
- If browser requests fail CORS, verify exact origin is in `CORS_ORIGINS`.
- Use `x-request-id` from API responses to correlate request logs.

