# Geo Distance — Backend

The backend is a FastAPI service that geocodes cities and countries with OpenStreetMap Nominatim and calculates the great-circle distance between their coordinates using the Haversine formula.

## Requirements

- Python 3.10 or newer
- Internet access for Nominatim geocoding

## Install and run

From this directory, create and activate a virtual environment, then install the dependencies:

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Start the development server:

```bash
uvicorn main:app --reload
```

The API is available at `http://localhost:8000`. Interactive documentation is at `http://localhost:8000/docs`.

## Endpoints

### `GET /health`

Returns `{"status":"ok"}` when the API is running.

### `POST /distance`

Request body:

```json
{
  "locationA": "London, United Kingdom",
  "locationB": "Paris, France"
}
```

Successful response:

```json
{
  "distance": 343.56,
  "coordsA": [51.5072, -0.1276],
  "coordsB": [48.8589, 2.3200],
  "nameA": "London, Greater London, England, United Kingdom",
  "nameB": "Paris, Ile-de-France, France"
}
```

Coordinates and display names depend on the result returned by Nominatim. Invalid or unrecognized locations return an HTTP error with a readable detail message.

## Configuration and usage notes

- No geocoding API key is required.
- The API allows the Angular development origins `http://localhost:4200` and `http://127.0.0.1:4200` through CORS. Update `allow_origins` in `main.py` if the frontend is hosted elsewhere.
- The endpoint waits between its two geocoding requests to respect Nominatim's public service rate limit. The public service is intended for limited use; read and follow the [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/).
- Distances are great-circle distances in kilometers, not driving distances or travel times.
