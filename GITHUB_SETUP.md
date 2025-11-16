# GitHub Repository Setup

This guide will help you create and push the Google Calendar Clone to GitHub.

## Prerequisites

- Git installed on your machine
- GitHub account

## Steps

### 1. Create a new repository on GitHub

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name it `google-calendar-clone` (or any name you prefer)
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 2. Add the remote and push

After creating the repository on GitHub, run these commands in the project directory:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/google-calendar-clone.git

# Or if using SSH:
git remote add origin git@github.com:YOUR_USERNAME/google-calendar-clone.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Verify

Visit your repository on GitHub to verify all files were pushed successfully.

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
gh repo create google-calendar-clone --public --source=. --remote=origin --push
```

## Notes

- The repository is already initialized with git
- Initial commit has been made
- All necessary files are included
- Remember to add your `.env` file to `.gitignore` (it's already there)

## Next Steps

1. Set up Google Calendar API credentials (see README.md)
2. Create a `.env` file from `.env.example`
3. Install dependencies: `npm install`
4. Run the dev server: `npm run dev`

