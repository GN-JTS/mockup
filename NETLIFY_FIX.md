# Netlify 404 Error Fix - Step by Step

## Current Status

✅ `_redirects` file exists in `public/` and is copied to `dist/`
✅ `netlify.toml` has redirect configuration
✅ React Router uses `BrowserRouter` correctly

## The Problem

Netlify is returning 404 for routes like `/requirements`, `/appointments`, etc. because it doesn't know these are client-side routes.

## Solution: Configure Netlify Dashboard

### Method 1: Use Netlify Dashboard (Most Reliable)

1. **Go to Netlify Dashboard**

   - Open your site in Netlify
   - Click on your site name

2. **Navigate to Site Settings**

   - Click **Site settings** (gear icon) in the top menu
   - Or go to: `https://app.netlify.com/sites/YOUR-SITE-NAME/configuration/deploys`

3. **Go to Redirects Section**

   - Click **Build & deploy** in the left sidebar
   - Scroll down to **Redirects and rewrites**
   - Click **Add redirect rule**

4. **Add Redirect Rule**

   - **From**: `/*`
   - **To**: `/index.html`
   - **Status**: Select `200` (IMPORTANT: Not 301 or 302!)
   - **Force**: Leave unchecked
   - Click **Save**

5. **Verify the Rule**

   - You should see the rule in the list:
     ```
     /* → /index.html (200)
     ```

6. **Redeploy**
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Clear cache and deploy site**
   - Wait for deployment to complete

### Method 2: Verify Files Are Deployed

1. **Check Deployed Files**

   - After deployment, go to **Deploys** tab
   - Click on the latest deploy
   - Click **Browse published files**
   - Verify `_redirects` file exists in the root

2. **Check File Content**
   - The `_redirects` file should contain exactly:
     ```
     /*    /index.html   200
     ```
   - No extra spaces, no comments

### Method 3: Test Locally First

Before deploying, test that the build works:

```bash
npm run build
# Check that dist/_redirects exists
ls -la dist/_redirects
# Should show: /*    /index.html   200
```

## Common Issues & Fixes

### Issue 1: Redirect Rule Not Showing in Dashboard

**Fix**: Manually add it in the dashboard (Method 1 above)

### Issue 2: Still Getting 404 After Adding Rule

**Fix**:

- Make sure status is `200` (not 301/302)
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check Netlify deploy logs for errors

### Issue 3: Redirect Works But Shows Wrong Content

**Fix**:

- Verify React Router routes are correct
- Check browser console for JavaScript errors
- Ensure all routes are defined in `src/routes/index.tsx`

### Issue 4: File Not in Deploy

**Fix**:

- Ensure `public/_redirects` exists
- Rebuild: `npm run build`
- Check `dist/_redirects` exists
- Redeploy to Netlify

## Verification Checklist

After configuration, verify:

- [ ] Redirect rule added in Netlify dashboard (status 200)
- [ ] `_redirects` file in `dist/` folder
- [ ] `netlify.toml` has redirect configuration
- [ ] Site redeployed with cache cleared
- [ ] Browser cache cleared
- [ ] Test URL: `https://your-site.netlify.app/requirements` works
- [ ] Test URL: `https://your-site.netlify.app/appointments` works
- [ ] Browser refresh on any route works (no 404)

## Quick Test Commands

```bash
# 1. Build and verify
npm run build
cat dist/_redirects

# 2. Check file is correct
# Should output: /*    /index.html   200

# 3. Deploy to Netlify
# (Use Netlify CLI or Git push)
```

## Still Not Working?

If redirects still don't work after following all steps:

1. **Check Netlify Deploy Logs**

   - Look for any errors about redirects
   - Check if `_redirects` file is mentioned

2. **Try Alternative: HashRouter** (Temporary)

   - Change `BrowserRouter` to `HashRouter` in `src/routes/index.tsx`
   - URLs will have `#` (e.g., `/requirements` becomes `/#/requirements`)
   - This is a workaround, not a permanent solution

3. **Contact Support**
   - Share your site URL
   - Share Netlify deploy logs
   - Mention you're using React Router v6 with SPA redirects

## Expected Behavior After Fix

✅ Direct URL access: `https://your-site.netlify.app/requirements` → Loads correctly
✅ Browser refresh: Refresh on any route → No 404 error
✅ Navigation: Clicking sidebar links → Smooth navigation, no page reload
✅ All routes work: Every route in your app should be accessible
