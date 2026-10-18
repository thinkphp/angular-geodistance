import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

interface DistanceResult {
  distance: number;
  coordsA: [number, number];
  coordsB: [number, number];
  nameA: string;
  nameB: string;
}

const API_URL = 'https://angular-geodistance-j1xx.vercel.app';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapElement') mapElement!: ElementRef<HTMLDivElement>;

  locationA = '';
  locationB = '';
  loading = false;
  error = '';
  result: DistanceResult | null = null;
  private map?: L.Map;
  private markers?: L.LayerGroup;

  ngAfterViewInit(): void {
    this.map = L.map(this.mapElement.nativeElement, { zoomControl: false, scrollWheelZoom: false }).setView([25, 10], 2);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);
    this.markers = L.layerGroup().addTo(this.map);
  }

  async calculateDistance(): Promise<void> {
    const from = this.locationA.trim();
    const to = this.locationB.trim();
    if (!from || !to) {
      this.error = 'Enter both locations to calculate the distance.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.result = null;
    try {
      const response = await fetch(`${API_URL}/distance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationA: from, locationB: to }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const detail = typeof data === 'object' && data !== null && 'detail' in data ? String(data.detail) : '';
        throw new Error(detail || 'Could not find one of those locations. Check the spelling and try again.');
      }
      this.result = data as DistanceResult;
      this.updateMap(this.result);
    } catch (error: unknown) {
      this.error = error instanceof TypeError
        ? 'Could not connect to the server. Start the Python API and try again.'
        : error instanceof Error ? error.message : 'Something went wrong. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  private updateMap(result: DistanceResult): void {
    if (!this.map || !this.markers) return;
    this.markers.clearLayers();
    const from = L.latLng(result.coordsA[0], result.coordsA[1]);
    const to = L.latLng(result.coordsB[0], result.coordsB[1]);
    const marker = (letter: string, color: string) => L.divIcon({
      className: 'map-pin-wrap',
      html: `<span class="map-pin" style="--pin-color:${color}"><b>${letter}</b></span>`,
      iconSize: [34, 42],
      iconAnchor: [17, 37],
    });
    L.marker(from, { icon: marker('A', '#d9682a') }).bindPopup(result.nameA).addTo(this.markers);
    L.marker(to, { icon: marker('B', '#e99a62') }).bindPopup(result.nameB).addTo(this.markers);
    L.polyline([from, to], { color: '#df702f', weight: 2.5, dashArray: '7 8', opacity: 0.9 }).addTo(this.markers);
    this.map.fitBounds(L.latLngBounds(from, to).pad(0.35), { maxZoom: 6, animate: true });
    setTimeout(() => this.map?.invalidateSize(), 50);
  }

  swapLocations(): void {
    [this.locationA, this.locationB] = [this.locationB, this.locationA];
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
