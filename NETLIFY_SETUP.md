# Netlify Deployment Configuration Guide

## Issue: 404 Errors on Route Navigation

If you're experiencing "Page not found" errors when navigating to routes in your React SPA on Netlify, follow these steps:

## Step 1: Verify Files Are Correct

✅ **Files that should exist:**

- `public/_redirects` - Contains: `/*    /index.html   200`
- `netlify.toml` - Contains build configuration
- After build, `dist/_redirects` should exist

## Step 2: Netlify Dashboard Configuration

### A. Build Settings

1. Go to your site in Netlify Dashboard
2. Navigate to **Site settings** → **Build & deploy** → **Build settings**
3. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: Select Node.js 18.x or 20.x (if available)

### B. Redirects Configuration

**Option 1: Using `_redirects` file (Recommended)**

- The `_redirects` file in `public/` will be automatically copied to `dist/` during build
- Netlify should automatically detect and use it
- No additional configuration needed in dashboard

**Option 2: Configure in Dashboard (If file doesn't work)**

1. Go to **Site settings** → **Build & deploy** → **Redirects and rewrites**
2. Click **Add redirect rule**
3. Configure:
   - **From**: `/*`
   - **To**: `/index.html`
   - **Status**: `200`
   - **Force**: Leave unchecked

### C. Environment Variables (If needed)

1. Go to **Site settings** → **Environment variables**
2. Add any required environment variables

## Step 3: Deploy Settings

1. Go to **Site settings** → **Build & deploy** → **Deploy settings**
2. Ensure:
   - **Branch to deploy**: Your main branch (usually `main` or `master`)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

## Step 4: Clear Cache and Redeploy

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for deployment to complete

## Step 5: Verify Redirects Are Working

After deployment:

1. Check **Site settings** → **Build & deploy** → **Redirects and rewrites**
2. You should see the redirect rule listed
3. Test by navigating to a route like: `https://your-site.netlify.app/requirements`
4. It should load without 404 error

## Troubleshooting

### If redirects still don't work:

1. **Check Netlify Deploy Logs**:

   - Go to **Deploys** tab
   - Click on the latest deploy
   - Check if `_redirects` file is mentioned in the logs

2. **Verify File Format**:

   - The `_redirects` file should contain exactly: `/*    /index.html   200`
   - No comments, no extra spaces
   - File should be in root of `dist/` folder

3. **Manual Redirect Rule**:

   - If `_redirects` file doesn't work, add the redirect rule manually in dashboard
   - Go to **Site settings** → **Build & deploy** → **Redirects and rewrites**
   - Add: `/*` → `/index.html` with status `200`

4. **Check Browser Console**:

   - Open browser DevTools → Console
   - Look for any routing errors
   - Check Network tab for failed requests

5. **Verify React Router**:
   - Ensure you're using `BrowserRouter` (not `HashRouter`)
   - Check that all routes are properly defined in `src/routes/index.tsx`

## Quick Fix Checklist

- [ ] `public/_redirects` exists with correct content
- [ ] `netlify.toml` is configured correctly
- [ ] Build command is `npm run build`
- [ ] Publish directory is `dist`
- [ ] Redirect rule is added in Netlify dashboard (if file doesn't work)
- [ ] Site has been redeployed after changes
- [ ] Browser cache is cleared

## Alternative: Use HashRouter (Not Recommended)

If redirects still don't work, you can switch to `HashRouter` in React Router, but this will add `#` to all URLs:

- Change `BrowserRouter` to `HashRouter` in `src/routes/index.tsx`
- URLs will be like: `https://your-site.netlify.app/#/requirements`

This is a workaround, not a solution. The redirect method is preferred.
