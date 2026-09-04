import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored icon creator
function createColoredIcon(color, emoji) {
  return L.divIcon({
    className: '',
    html: `<div style="
      background: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="transform: rotate(45deg); font-size: 14px; display: block; text-align: center; line-height: 28px;">${emoji}</span>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

function getRiskColor(riskLevel) {
  switch (riskLevel) {
    case 'CRITICAL': return '#8B0000';
    case 'HIGH': return '#C0392B';
    case 'MODERATE': return '#E67E22';
    case 'LOW': return '#27AE60';
    default: return '#555';
  }
}

function FitBounds({ sites }) {
  const map = useMap();
  useEffect(() => {
    if (sites && sites.length > 0) {
      const bounds = sites.map(s => [s.lat, s.lng]);
      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, []);
  return null;
}

const HERITAGE_SITES = [
  {
    id: 'ahmedabad-walled-city',
    name: 'Ahmedabad Walled City',
    lat: 23.0225,
    lng: 72.5714,
    emoji: '🕌',
    subtitle: 'UNESCO World Heritage City',
  },
  {
    id: 'modhera-sun-temple',
    name: 'Modhera Sun Temple',
    lat: 23.5858,
    lng: 72.1322,
    emoji: '☀️',
    subtitle: 'Solanki Architecture (1026 CE)',
  },
];

export default function HeritageMap({ siteData = {}, height = 400 }) {
  const center = [23.3, 72.35];

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        aria-label="Heritage sites map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <FitBounds sites={HERITAGE_SITES} />

        {HERITAGE_SITES.map(site => {
          const data = siteData[site.id] || {};
          const riskLevel = data.riskLevel || 'MODERATE';
          const color = getRiskColor(riskLevel);

          return (
            <Marker
              key={site.id}
              position={[site.lat, site.lng]}
              icon={createColoredIcon(color, site.emoji)}
            >
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                    {site.emoji} {site.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
                    {site.subtitle}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#888' }}>Health Score</div>
                      <div style={{ fontWeight: 700, color: color, fontSize: 16 }}>
                        {data.healthScore || '—'}{data.healthScore ? '/100' : ''}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#888' }}>Risk Level</div>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '2px 8px',
                        background: `${color}20`,
                        color,
                        borderRadius: 4,
                        display: 'inline-block',
                        marginTop: 2,
                      }}>
                        {riskLevel}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#888' }}>Visitors</div>
                      <div style={{ fontWeight: 600 }}>{data.visitors || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#888' }}>Capacity</div>
                      <div style={{ fontWeight: 600 }}>{data.occupancy ? `${data.occupancy}%` : '—'}</div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
