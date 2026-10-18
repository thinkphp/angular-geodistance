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

## Using the app

Enter a city or country in each field, for example `London, United Kingdom` and `Paris, France`, then select **Calculate distance**. The result is shown in kilometers and the map marks both locations. Use the swap control to reverse the locations.

The app calculates great-circle distance. It does not calculate driving distance or travel time.

## API connection

The frontend sends a `POST` request to `http://localhost:8000/distance`. If the API runs at another address, update the `fetch` URL in `src/app/app.component.ts` and allow the frontend origin in the backend's CORS configuration.

The map uses OpenStreetMap tiles through Leaflet. Keep the map attribution visible when changing the map setup.
