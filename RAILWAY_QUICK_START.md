# Railway Deployment - Quick Start

## ✅ Pre-Deployment Checklist

- [x] Railway configuration fixed (`nixpacks.toml`)
- [x] TypeScript errors resolved
- [x] Build test passed locally
- [x] Documentation created

## 🚀 Deploy Now (5 Steps)

### Step 1: Test Locally (Optional but Recommended)

```bash
cd collabotree-main/backend
node test-railway-build.js
```

Expected: ✅ `RAILWAY BUILD TEST - SUCCESS!`

### Step 2: Push to Git

```bash
git add .
git commit -m "Fix Railway deployment configuration"
git push origin main
```

### Step 3: Configure Railway

1. **Create Project**: [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. **Set Root Directory**: Settings → Build → Root Directory: `collabotree-main/backend`
3. **Add Database**: + New → Database → PostgreSQL

### Step 4: Set Environment Variables

Railway Dashboard → Your Service → Variables:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_ACCESS_SECRET=<generate-with-command-below>
JWT_REFRESH_SECRET=<generate-with-command-below>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CLIENT_ORIGIN=
PORT=${{PORT}}
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Deploy & Monitor

Railway will automatically deploy. Watch the logs for:
- ✅ Setup (Node.js 18)
- ✅ Install (Backend deps)
- ✅ Build (Frontend → Backend → Prisma → TypeScript)
- ✅ Start (node dist/server.js)

## 🎯 What You'll Get

After deployment:

| Resource | URL |
|----------|-----|
| **Frontend** | `https://your-app.up.railway.app/` |
| **API** | `https://your-app.up.railway.app/api/` |
| **Health Check** | `https://your-app.up.railway.app/health` |

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Run `node test-railway-build.js` locally |
| Database errors | Check `DATABASE_URL=${{Postgres.DATABASE_URL}}` |
| 404 on frontend | Verify root directory is `collabotree-main/backend` |
| TypeScript errors | All fixed! If new ones: check imports |

## 📚 Full Documentation

- **Complete Guide**: See `RAILWAY_DEPLOYMENT_GUIDE.md`
- **Fix Summary**: See `RAILWAY_FIX_SUMMARY.md`

## 💡 Important Notes

✅ **What's Working:**
- Nixpacks build configuration
- TypeScript compilation
- Frontend + Backend together
- Database migrations
- Local build testing

⚠️ **Remember:**
- Root directory must be `collabotree-main/backend`
- Only one config file: `nixpacks.toml`
- PostgreSQL must be in same Railway project
- Generate strong JWT secrets (don't use defaults)

## 🎉 You're Ready!

All configuration is done. Just follow the 5 steps above to deploy!

---

Need help? Check `RAILWAY_DEPLOYMENT_GUIDE.md` for detailed instructions and troubleshooting.






