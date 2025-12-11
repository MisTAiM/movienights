# MovieNights Ultimate 🎬

A premium movie, TV show, anime, and live TV streaming discovery app built with React 18 + Vite.

## Features

- 🎬 **Movies** - Browse and discover movies from TMDB
- 📺 **TV Shows** - Explore TV series with episode selection
- 🎌 **Anime** - AniList integration for anime content
- 📡 **Live TV** - 90+ live channels (News, Sports, Entertainment, Movies, Kids, Documentary)
- 📚 **Collection** - Save your favorites
- 📋 **Watchlists** - Organize what to watch next
- 📊 **Stats** - Track your viewing history
- 🌙 **Dark/Light Theme** - Toggle between themes
- 🖼️ **Picture-in-Picture** - Floating video player
- 🎯 **Achievements** - Unlock achievements as you use the app

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🚀 Deploy to GitHub Pages

### Step-by-Step Instructions (GitHub Desktop)

#### 1. Extract and Prepare the Project
- Extract the `movienights-ultimate.zip` to a folder on your computer
- Open the folder - you should see `package.json`, `src/`, etc.

#### 2. Update the Base URL (IMPORTANT!)
- Open `vite.config.js` in a text editor (Notepad, VS Code, etc.)
- Find this line: `base: '/movienights-ultimate/',`
- Change `movienights-ultimate` to match your GitHub repository name
- Example: If your repo is `my-streaming-app`, change it to: `base: '/my-streaming-app/',`
- Save the file

#### 3. Create a GitHub Repository
- Go to [github.com](https://github.com) and sign in
- Click the **+** button (top right) → **New Repository**
- Name it (e.g., `movienights-ultimate`)
- Make it **Public** (required for free GitHub Pages)
- **DON'T** check any boxes (no README, no .gitignore)
- Click **Create repository**

#### 4. Push Code with GitHub Desktop
- Open **GitHub Desktop**
- Click **File** → **Add Local Repository**
- Browse to your extracted `movienights-ultimate` folder
- If it says "This directory does not appear to be a Git repository":
  - Click **create a repository** link
  - Keep defaults and click **Create Repository**
- Click **Publish repository** button (top right)
- Uncheck "Keep this code private" to make it public
- Click **Publish Repository**

#### 5. Enable GitHub Pages
- Go to your repository on github.com
- Click **Settings** (gear icon tab at top)
- Scroll down and click **Pages** (left sidebar)
- Under "Build and deployment" section:
  - **Source**: Select **GitHub Actions**
- That's it! The deploy workflow will run automatically.

#### 6. Wait for Deployment
- Click the **Actions** tab in your repository
- You'll see "Deploy to GitHub Pages" running
- Wait 1-2 minutes for it to complete (green checkmark)

#### 7. Access Your Site! 🎉
Your site will be live at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

Example: `https://johndoe.github.io/movienights-ultimate/`

You can find the exact URL in **Settings** → **Pages** after deployment.

---

## Troubleshooting

### Site shows 404 or blank page
1. Make sure `base` in `vite.config.js` **exactly** matches your repository name (case-sensitive!)
2. Check that GitHub Pages source is set to "GitHub Actions"
3. Wait 2-3 minutes and hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

### Workflow failed (red X in Actions)
1. Go to **Actions** tab
2. Click the failed workflow
3. Look at the error message
4. Common fixes:
   - Delete `package-lock.json` and push again
   - Make sure all files were uploaded

### Live TV not loading
- Some channels may be geo-restricted
- Click **"Open External"** button to watch in a new tab
- Try disabling ad-blockers if streams don't play

### Changes not showing up
- After making changes, in GitHub Desktop:
  1. Write a summary (e.g., "Update config")
  2. Click **Commit to main**
  3. Click **Push origin**
- Wait for the workflow to rebuild (1-2 min)

---

## Optional: Add TMDB API Key

For better movie/TV data, get a free API key:

1. Go to https://www.themoviedb.org/settings/api
2. Create free account and request API key
3. Create a `.env` file in your project:
```env
VITE_TMDB_KEY=your_api_key_here
```

---

## Tech Stack

- ⚛️ React 18
- ⚡ Vite 5
- 🎨 CSS3 with CSS Variables
- 📡 TMDB API & AniList GraphQL
- 🎬 Multiple streaming embed sources

## License

MIT License - Feel free to use and modify!
