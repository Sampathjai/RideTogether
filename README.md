# RideTogether — Web Demo (No API keys)

This is a ready-to-run **RideTogether** demo: a group ride map with real‑time friends, chat, trip codes, and SOS alerts.

- **Frontend**: React (Vite) + Leaflet map (no Google Maps key needed)
- **Backend**: Node.js + Express + Socket.IO
- **Run locally**: create/join a trip, share the code, open the site in multiple tabs or devices on the same network to see live updates.

## Quick Start

### 1) Backend
```bash
cd server
npm install
npm start
# Server runs at http://localhost:4000
```

### 2) Frontend
```bash
cd client
npm install
npm start
# App runs at http://localhost:5173
```

> If testing across devices on your LAN, replace `VITE_SERVER_URL` in `.env` (see below).

## Environment (optional)

Create `client/.env` to point the web app to a different server (e.g., your machine IP):
```
VITE_SERVER_URL=http://YOUR-LAN-IP:4000
```

## Features

- Create a trip (generates a short **code**)
- Join by code + display name
- Live location sharing (via browser geolocation)
- Map with friend markers (Leaflet/OSM)
- Group chat (Socket.IO)
- 🚨 SOS button to alert the group

## Notes

- This demo uses an **in-memory** store; data resets on server restart.
- Leaflet uses OpenStreetMap tiles (no API keys).
- For best results, allow location access in your browser.
- To simulate multiple riders, open the app in multiple tabs or browsers, or on different devices (pointing to the same server).

Enjoy the ride! 🏍️
