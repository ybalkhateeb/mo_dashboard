# مشروع لوحة تحكم العمارة | Building Project Dashboard

لوحة تحكم تفاعلية لمشروع إنشاء عمارة سكنية تجارية - الخيار (أ)

An interactive dashboard for a mixed-use building project - Option (A)

## 🚀 Quick Deploy to Netlify

### Option 1: Deploy with Git (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account
   - Select your repository
   - Build settings will be auto-detected:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
   - Click "Deploy site"

### Option 2: Manual Deploy (Drag & Drop)

1. **Build the project locally:**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag the `dist` folder to the deploy area

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
building-dashboard/
├── public/
│   └── favicon.svg          # Site icon
├── src/
│   ├── App.jsx              # Main dashboard component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles + Tailwind
├── index.html               # HTML template
├── package.json             # Dependencies & scripts
├── vite.config.js           # Vite bundler config
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
└── README.md                # This file
```

## 🛠 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Recharts** - Charts & visualizations
- **Lucide React** - Icons

## 📊 Features

- **Interactive Site Plan** - Visual layout with streets, building, parking
- **Floor Plans** - Detailed layouts for each floor
- **Financial Analysis** - Income projections, ROI, payback period
- **Unit Management** - Commercial and residential unit details
- **Income Simulator** - Adjust variables to see financial impact
- **10-Year Projections** - Long-term financial forecasting

## 🌐 Netlify Configuration

A `netlify.toml` file is included for automatic configuration:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 📝 License

Private project - All rights reserved

---

Built with ❤️ for real estate investment analysis
