# Geo Distance — Frontend

The frontend is a standalone Angular application. It lets users enter two cities or countries, sends them to the Python API, and displays the straight-line distance and locations on an interactive Leaflet map.

## Requirements

- Node.js 20.11.1 or newer
- npm
- The [Python backend](../backend/README.md) running at `http://localhost:8000`

## Install and run

From this directory:

```bash
npm install
npm start
```

Open `http://localhost:4200` in a browser. The Angular development server is configured to allow requests from this origin in the backend.

To create a production build:

```bash
npm run build
```

Build output is written to `dist/geo-distance/`.

## Deploy to Vercel

Set the Vercel project's **Root Directory** to `frontend`. The included
`vercel.json` runs the production build and publishes Angular's browser output
from `dist/geo-distance`. If the project root is set to the repository
root, Vercel will not use this frontend configuration; change the root directory
to `frontend` and redeploy.

## Using the app

Enter a city or country in each field, for example `London, United Kingdom` and `Paris, France`, then select **Calculate distance**. The result is shown in kilometers and the map marks both locations. Use the swap control to reverse the locations.

The app calculates great-circle distance. It does not calculate driving distance or travel time.

## API connection

The frontend currently sends a `POST` request to `http://localhost:8000/distance`.
That address is only reachable from your own computer, so distance searches on a
deployed site also need a publicly reachable backend URL and matching CORS
configuration. This does not prevent the page itself from loading.

The map uses OpenStreetMap tiles through Leaflet. Keep the map attribution visible when changing the map setup.
