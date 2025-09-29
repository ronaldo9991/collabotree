# 🐘 PostgreSQL Setup for CollaboTree

## Option 1: Supabase (Recommended - Free & Easy)

1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Go to Settings → Database
4. Copy the connection string (looks like: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`)
5. Update your `.env` file with the DATABASE_URL

## Option 2: Local PostgreSQL

### Install PostgreSQL:
```bash
# macOS
brew install postgresql
brew services start postgresql

# Create database
createdb collabotree
```

### Update .env:
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/collabotree
```

## Option 3: Docker PostgreSQL

```bash
docker run --name collabotree-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=collabotree \
  -p 5432:5432 \
  -d postgres:15
```

## After Setting Up Database:

1. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

2. Push schema to database:
   ```bash
   npx prisma db push
   ```

3. Seed the database:
   ```bash
   npm run seed
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## Test Accounts:
- Admin: admin@collabotree.com / admin123
- Student: alice@student.com / student123
- Buyer: charlie@buyer.com / buyer123
