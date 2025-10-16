# Railway Deployment Checklist

## Environment Variables (Set in Railway Dashboard)
- [ ] NODE_ENV=production
- [ ] PORT=4000 (Railway sets this automatically)
- [ ] CLIENT_ORIGIN= (leave empty for single deployment)
- [ ] DATABASE_URL=postgresql://postgres:kVhwouzTbXRNokjjbkkGvowNutnToOcW@postgres-y3hg.railway.internal:5432/railway
- [ ] JWT_ACCESS_SECRET=2cd6a98804511d307944b09a9b7d167f816f85d6c65d08aab123d03a34317b4d
- [ ] JWT_REFRESH_SECRET=4f550173cb97ce4e7f25fdbe2be0114c1066b8a115848d7659d82641ef9cee16
- [ ] JWT_ACCESS_EXPIRES_IN=15m
- [ ] JWT_REFRESH_EXPIRES_IN=7d
- [ ] BCRYPT_ROUNDS=12

## Railway Service Configuration
- [ ] Main service: CollaboTree (backend + frontend)
- [ ] Database service: PostgreSQL
- [ ] Environment variables set in main service
- [ ] Database URL connected to PostgreSQL service

## Expected Behavior After Deployment
- [ ] Build completes successfully
- [ ] Server starts on Railway port
- [ ] Database tables are created automatically
- [ ] API endpoints respond correctly
- [ ] Frontend serves correctly
- [ ] Services appear in "Explore Talent" and "New Projects"

## Troubleshooting
If deployment fails:
1. Check Railway logs for specific errors
2. Verify all environment variables are set
3. Ensure PostgreSQL service is running
4. Check that database URL is correct
