# Git Guide for Quicklink

## 🔐 Sensitive Files — NEVER Push These

| File/Folder | Why sensitive | Already in `.gitignore`? |
|---|---|---|
| `.env.local` | Contains Supabase keys, Instamojo credentials | ✅ Yes |
| `.env*.local` | Any local env variants | ✅ Yes |
| `node_modules/` | Installed packages (huge, regeneratable) | ✅ Yes |
| `.next/` | Build output | ✅ Yes |

---

## 🚀 How to Git Push from Terminal

### First time (setting up the repo)

```powershell
# 1. Initialize git (if not already done)
git init

# 2. Add your GitHub remote (replace URL with yours)
git remote add origin https://github.com/YOUR_USERNAME/quicklink.git

# 3. Stage all files
git add .

# 4. Create your first commit
git commit -m "Initial commit: Quicklink SaaS platform"

# 5. Push to GitHub
git push -u origin main
```

### Every time after (normal workflow)

```powershell
# Stage all changed files
git add .

# Commit with a descriptive message
git commit -m "feat: add analytics dashboard"

# Push
git push
```

---

## 📁 What's Safe vs Sensitive

### ❌ NEVER commit:
- `.env.local` — real API keys (already in `.gitignore`)

### ✅ Safe to commit:
- `supabase.sql` — no secrets, just schema
- `.env.example` — only placeholder names, no real values
- `package.json`, `src/`, `public/` — all fine

---

## 📝 How to Add New Secrets in Future

1. **Add real value to `.env.local`** (never committed):
   ```
   MY_NEW_SECRET=actual_value_here
   ```

2. **Add placeholder to `.env.example`** (commit this instead):
   ```
   MY_NEW_SECRET=your_value_here
   ```

3. **Use in code** via `process.env.MY_NEW_SECRET`

4. **On deployment** (Vercel/Railway) — add via the hosting dashboard, not `.env.local`

---

## ✅ Pre-Push Checklist

```powershell
# Check what's being staged — .env.local should NOT appear
git status

# If .env.local accidentally appears, remove it from staging:
git rm --cached .env.local
```

> ⚠️ **Rule:** If `.env.local` or any file with real API keys shows up in `git status`, stop and do NOT commit.
