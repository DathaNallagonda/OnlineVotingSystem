# GitHub Pages Deployment Setup

## ✅ What's Already Done

1. **Code Pushed to GitHub**: Your project is now at https://github.com/DathaNallagonda/onlinevotingsystem
2. **GitHub Actions Workflow**: Auto-deployment workflow is configured in `.github/workflows/deploy.yml`
3. **Vite Configuration**: Base path is correctly set for GitHub Pages deployment

## 🚀 Next Steps to Make GitHub Pages Live

### Step 1: Configure Repository Secrets (IMPORTANT)

Your project uses Supabase for authentication/voting. Add these secrets to make it work:

1. Go to: **GitHub Repo → Settings → Secrets and variables → Actions**
2. Click **"New repository secret"** and add these three:

| Secret Name | Value |
|------------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase public/anon key |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID |

**Where to find these values:**
- Go to your Supabase project dashboard
- Settings → API → Project URL and anon key

### Step 2: Enable GitHub Pages

1. Go to: **GitHub Repo → Settings → Pages**
2. Under "Build and deployment":
   - **Source**: Select `GitHub Actions`
   - Leave other settings as default
3. Click **Save**

### Step 3: Trigger Initial Deployment

The workflow will automatically trigger when you push to `master`. You can also manually trigger it:

1. Go to: **GitHub Repo → Actions tab**
2. Select **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"** → **"Run workflow"** button

### Step 4: View Your Live Site

Once the workflow completes (check Actions tab for green checkmark):

**Your site URL**: `https://datathnallagonda.github.io/onlinevotingsystem/`

Click this link to open your project in a browser!

## 📊 Monitor Deployment

- **Actions Tab**: Shows workflow runs, build logs, and any errors
- **Deployments Tab**: Shows deployment history and live URL
- **Pages Settings**: Shows your site status and URL

## 🔧 Troubleshooting

### Workflow shows red ❌
- Check the Actions tab for error logs
- Most likely: Missing Supabase secrets
- See Step 1 above to add secrets

### Site shows 404 or blank page
- Verify all Supabase secrets are correct
- Check that GitHub Pages source is set to "GitHub Actions"
- Hard refresh browser (Ctrl+F5) to clear cache

### Need to rebuild manually
- Go to Actions → Deploy to GitHub Pages → Run workflow

## 📝 Build Information

- **Build Tool**: Vite
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`

