"""API for geocoding locations and calculating the distance between them."""

import math
import time
from typing import Annotated

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Geo Distance API", description="Calculate the distance between two cities or countries.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"


class LocationRequest(BaseModel):
    locationA: Annotated[str, Field(min_length=1, max_length=150)]
    locationB: Annotated[str, Field(min_length=1, max_length=150)]


def get_coordinates(location: str) -> tuple[float, float, str]:
    """Return the latitude, longitude, and display name of the matched location."""
    try:
        response = requests.get(
            NOMINATIM_URL,
            params={"q": location.strip(), "format": "jsonv2", "limit": 1},
            headers={"User-Agent": "GeoDistanta/1.0 (educational distance calculator)"},
            timeout=10,
        )
        response.raise_for_status()
        results = response.json()
    except (requests.RequestException, ValueError) as exc:
        raise HTTPException(
            status_code=503,
            detail="The location service is temporarily unavailable. Please try again.",
        ) from exc

    if not results:
        raise HTTPException(status_code=404, detail=f"Location '{location}' was not found.")

    result = results[0]
    return float(result["lat"]), float(result["lon"]), result.get("display_name", location)


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance in kilometers."""
    earth_radius_km = 6371.0088
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    value = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    return earth_radius_km * 2 * math.atan2(math.sqrt(value), math.sqrt(1 - value))


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/distance")
def calculate_distance(request: LocationRequest) -> dict[str, object]:
    lat1, lon1, name_a = get_coordinates(request.locationA)
    # Nominatim public service policy allows at most one request per second.
    time.sleep(1)
    lat2, lon2, name_b = get_coordinates(request.locationB)
    distance = haversine(lat1, lon1, lat2, lon2)
    return {
        "distance": round(distance, 2),
        "coordsA": [lat1, lon1],
        "coordsB": [lat2, lon2],
        "nameA": name_a,
        "nameB": name_b,
    }
