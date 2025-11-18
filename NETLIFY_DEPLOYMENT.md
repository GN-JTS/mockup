# Netlify Deployment Setup

This repository includes a GitHub Actions workflow that automatically deploys the application to Netlify on every push to the `main` branch.

## Prerequisites

Before the workflow can successfully deploy, you need to configure the following GitHub repository secrets:

### Required Secrets

1. **NETLIFY_AUTH_TOKEN**
   - Your Netlify personal access token
   - How to get it:
     1. Log in to [Netlify](https://app.netlify.com)
     2. Go to User Settings → Applications → Personal access tokens
     3. Click "New access token"
     4. Give it a descriptive name (e.g., "GitHub Actions Deploy")
     5. Copy the generated token

2. **NETLIFY_SITE_ID**
   - Your Netlify site's unique identifier
   - How to get it:
     1. Log in to [Netlify](https://app.netlify.com)
     2. Go to your site's settings
     3. Navigate to Site details → Site information
     4. Copy the "Site ID" (also called "API ID")

### Adding Secrets to GitHub

1. Go to your GitHub repository
2. Click on "Settings"
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each secret:
   - Name: `NETLIFY_AUTH_TOKEN`, Value: [your token]
   - Name: `NETLIFY_SITE_ID`, Value: [your site ID]

## How the Workflow Works

The workflow (`.github/workflows/netlify-deploy.yml`) performs the following steps:

1. **Checkout code**: Clones the repository
2. **Setup Node.js**: Installs Node.js v22 with npm caching
3. **Install dependencies**: Runs `npm ci` for clean dependency installation
4. **Build project**: Runs `npm run build` to create production build in `dist/` folder
5. **Deploy to Netlify**: Uses the Netlify GitHub Action to deploy the `dist/` folder

## Deployment Trigger

The workflow is triggered automatically on:
- Every push to the `main` branch

## Monitoring Deployments

You can monitor deployment status in:
- GitHub Actions tab in your repository
- Netlify dashboard under your site's deploys section

## Manual Deployment

If you need to manually trigger a deployment:
1. Make any change to your repository
2. Commit and push to the `main` branch
3. The workflow will run automatically

## Troubleshooting

### Deployment fails with "Unauthorized"
- Check that `NETLIFY_AUTH_TOKEN` is correctly set
- Verify the token hasn't expired
- Ensure the token has the necessary permissions

### Deployment fails with "Site not found"
- Verify `NETLIFY_SITE_ID` is correct
- Check that the site exists in your Netlify account
- Ensure the token has access to this site

### Build fails
- Check the GitHub Actions logs for specific error messages
- Test the build locally with `npm run build`
- Ensure all dependencies are correctly listed in `package.json`
