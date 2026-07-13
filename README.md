# Project Rosé Website

The official website for [Project Rosé](https://projectrose.cafe), a revival project for Nintendo TVii and Miiverse.

## 🚀 Quick Start

```sh
npm install -g http-server
http-server . -p 4321 -c-1
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

## 🏗️ Project Structure

```
├── index.html          # Homepage
├── services.html       # Services page
├── 404.html            # Error page
├── assets/
│   ├── css/style.css   # All styles
│   └── js/main.js      # Interactivity
├── api/status.js       # Status endpoint (Vercel serverless)
├── img/                # Images
├── fonts/              # Fonts
├── favicons/           # Favicons
└── vercel.json         # Deployment config
```

## ✏️ Making Changes

### Staff / Team Members
Staff data is inlined in `index.html`. Each `.staff-card` div has the member's name, role, image, flag, and action links.

### Adding Pages
Create a new `.html` file in the root and link it from the navbar in each existing page.

## 🚢 Deployment

The site is deployed via **Vercel**. Any push to the `main` branch automatically triggers a production deployment.
