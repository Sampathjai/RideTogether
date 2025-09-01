import React, { useEffect, useRef } from 'react'
import L from 'leaflet'

export default function MapView({ onLocation, members }) {
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map').setView([28.6139, 77.2090], 12); // Delhi default
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);
      mapRef.current = map;

      // Try browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition((pos) => {
          const { latitude, longitude } = pos.coords;
          onLocation(latitude, longitude);
          map.setView([latitude, longitude], 14);
        }, () => {}, { enableHighAccuracy: true });
      }
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Update markers
    const current = new Map();
    members.forEach(m => {
      if (m.lat && m.lng) {
        let marker = markersRef.current.get(m.id);
        if (!marker) {
          marker = L.marker([m.lat, m.lng], { title: m.name });
          marker.addTo(map);
          markersRef.current.set(m.id, marker);
        } else {
          marker.setLatLng([m.lat, m.lng]);
        }
        marker.bindPopup(`<b>${m.name}</b><br>${m.lat.toFixed(5)}, ${m.lng.toFixed(5)}`);
        current.set(m.id, marker);
      }
    });
    // Remove stale markers
    for (const [id, marker] of markersRef.current.entries()) {
      if (!current.has(id)) {
        map.removeLayer(marker);
        markersRef.current.delete(id);
      }
    }
  }, [members]);

  return <div id="map" className="map" />
}
