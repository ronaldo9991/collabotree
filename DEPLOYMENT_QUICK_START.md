# 🚀 Collabotree Deployment Quick Start

## The Problem You Had

❌ **Two separate deployments** (Frontend + Backend)
- Hit rate limits twice as fast (you hit 100 deployments/day on backend)
- CORS configuration complexity
- 404 errors due to missing `vercel.json`

## The Solution

✅ **Single unified deployment** - Backend serves frontend
- One deployment to manage
- No CORS issues (same domain)
- Fewer rate limit hits
- Your code already supports this!

---

## 🎯 Quick Deploy (Choose One Method)

### Method 1: Automated Build Script (Easiest)

**Windows PowerShell:**
```powershell
cd collabotree-main
.\build-for-vercel.ps1
cd backend
vercel --prod
```

**Mac/Linux:**
```bash
cd collabotree-main
chmod +x build-for-vercel.sh
./build-for-vercel.sh
cd backend
vercel --prod
```

### Method 2: Manual Steps

```bash
# 1. Build frontend
cd collabotree-main/client
npm install
npm run build

# 2. Build backend
cd ../backend
npm install
npm run build

# 3. Copy frontend to backend
# Windows:
Copy-Item -Recurse -Force ..\client\dist .\dist\

# Mac/Linux:
cp -r ../client/dist ./dist/

# 4. Deploy
vercel --prod
```

---

## ⚙️ Environment Variables (Vercel Dashboard)

**Required variables for your backend project in Vercel:**

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db  # Use Vercel Postgres or Neon
JWT_ACCESS_SECRET=your-32-character-secret-key-here
JWT_REFRESH_SECRET=your-another-32-char-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CLIENT_ORIGIN=https://your-app.vercel.app  # Your backend URL (same domain now!)
```

**Optional frontend variable (if using separate API URL):**
```env
VITE_API_URL=/api  # Use relative URL for same-domain deployment
```

---

## 📊 Deployment Architecture

### Single Deployment (Recommended ✅)
```
User Request → https://your-app.vercel.app
                ├─ / → Frontend (React SPA)
                ├─ /api/* → Backend API
                ├─ /health → Health check
                └─ /socket.io → WebSocket
```

**Result:**
- Frontend URL: `https://your-app.vercel.app`
- API URL: `https://your-app.vercel.app/api`
- Same domain = No CORS needed!

### Separate Deployments (Not Recommended ❌)
```
Frontend → https://frontend.vercel.app
              ↓ (CORS required)
Backend  → https://backend.vercel.app/api
```

---

## ✅ After Deployment Checklist

1. **Test Health Endpoint:**
   ```bash
   curl https://your-app.vercel.app/health
   ```
   Expected: `{"status":"ok",...}`

2. **Test API:**
   ```bash
   curl https://your-app.vercel.app/api/services
   ```

3. **Test Frontend:**
   Visit `https://your-app.vercel.app` in browser

4. **Run Database Migrations:**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

5. **Create Admin User:**
   ```bash
   node create-admin.js
   ```

---

## 🐛 Troubleshooting

### "Resource limited - 100 deployments/day"
⏳ **Wait 2 hours** before deploying again (Vercel free tier limit)

### 404 Errors
✅ Fixed! Your `vercel.json` is now configured correctly

### CORS Errors
✅ Fixed! Single deployment = same domain = no CORS

### WebSocket Connection Errors
✅ Fixed! Updated `Chat.tsx` to use dynamic WebSocket URL

### Database Connection Errors
- Check `DATABASE_URL` is set in Vercel
- Use Vercel Postgres, Neon, or Supabase (not SQLite!)
- Ensure database is accessible from Vercel

---

## 📁 Key Files Created/Updated

| File | Purpose |
|------|---------|
| `backend/vercel.json` | Vercel routing configuration |
| `backend/api/index.js` | Serverless function handler (updated) |
| `backend/.vercelignore` | Exclude unnecessary files |
| `client/src/pages/Chat.tsx` | Dynamic WebSocket URL (updated) |
| `build-for-vercel.sh` | Automated build script (Mac/Linux) |
| `build-for-vercel.ps1` | Automated build script (Windows) |
| `SINGLE_DEPLOYMENT_GUIDE.md` | Detailed deployment guide |
| `VERCEL_BACKEND_DEPLOYMENT.md` | Backend-specific guide |

---

## 🎓 What Changed?

### Before (Broken):
- ❌ No `vercel.json` → 404 errors
- ❌ Wrong import paths in `api/index.js`
- ❌ Hardcoded localhost WebSocket URL
- ❌ Two separate deployments → double rate limits

### After (Fixed):
- ✅ `vercel.json` with proper routing
- ✅ Correct import paths using `dist/` folder
- ✅ Dynamic WebSocket URL from environment
- ✅ Single deployment option available
- ✅ All files properly configured

---

## 💡 Recommendations

1. **Use Single Deployment** (already set up!)
2. **Wait for rate limit cooldown** (2 hours) before next deploy
3. **Set up Vercel Postgres** for database
4. **Test locally first** to avoid wasting deployments:
   ```bash
   cd backend
   npm start
   # Visit http://localhost:4000
   ```
5. **Monitor deployments** - Free tier = 100/day

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Rate Limits**: https://vercel.com/docs/platform/limits
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres

---

## Next Steps

1. ⏳ Wait 2 hours for rate limit reset
2. 🔨 Run build script: `.\build-for-vercel.ps1`
3. 🚀 Deploy: `cd backend && vercel --prod`
4. ✅ Test: Visit your Vercel URL
5. 🗄️ Set up database and run migrations
6. 👤 Create admin user

**You're all set! Happy deploying! 🎉**









