import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { HealthCenter, HEALTH_CENTER_TYPE_CONFIGS, MapView } from '../../types/map';

// Componente para actualizar la vista del mapa
function MapViewController({ view }: { view: MapView }) {
  const map = useMap();

  useEffect(() => {
    map.setView([view.center.lat, view.center.lng], view.zoom);
  }, [view, map]);

  return null;
}

interface InteractiveMapProps {
  centers: HealthCenter[];
  mapView: MapView;
  onCenterClick?: (center: HealthCenter) => void;
}

function InteractiveMap({
  centers,
  mapView,
  onCenterClick,
}: InteractiveMapProps) {
  // Crear iconos personalizados para cada tipo de centro
  const createCustomIcon = (type: string, color: string) => {
    // Símbolos simples para cada tipo (sin emojis)
    const symbols: Record<string, string> = {
      hospital: 'H',
      centro_salud: 'CS',
      consultorio: 'C',
      urgencias: 'U',
      farmacia: 'F',
      laboratorio: 'L',
    };

    const symbol = symbols[type] || 'M';

    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 26 16 26s16-15 16-26C32 7.163 24.837 0 16 0z" fill="${color}"/>
        <circle cx="16" cy="16" r="10" fill="white"/>
        <text x="16" y="20" font-size="10" font-weight="bold" text-anchor="middle" fill="${color}">${symbol}</text>
      </svg>
    `;

    return new Icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgIcon)}`,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42],
    });
  };

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[mapView.center.lat, mapView.center.lng] as LatLngTuple}
        zoom={mapView.zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      >
        {/* Capa de tiles de OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Controlador de vista */}
        <MapViewController view={mapView} />

        {/* Marcadores de centros */}
        {centers.map((center) => {
          const config = HEALTH_CENTER_TYPE_CONFIGS[center.type];

          return (
            <Marker
              key={center.id}
              position={[center.coordinates.lat, center.coordinates.lng] as LatLngTuple}
              icon={createCustomIcon(center.type, config.markerColor)}
              eventHandlers={{
                click: () => {
                  if (onCenterClick) {
                    onCenterClick(center);
                  }
                },
              }}
            >
              <Popup>
                <div className="p-2 min-w-[250px]">
                  {/* Header del popup */}
                  <div className="flex items-start space-x-2 mb-3 pb-2 border-b">
                    <span className="text-2xl">{config.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-gray-800 leading-tight">
                        {center.name}
                      </h3>
                      <p
                        className="text-xs font-medium mt-1"
                        style={{ color: config.color }}
                      >
                        {config.name}
                      </p>
                    </div>
                  </div>

                  {/* Información del centro */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <span className="text-gray-500 mr-2">📍</span>
                      <p className="text-gray-700 text-xs">
                        {center.address}
                        <br />
                        {center.city}, {center.postalCode}
                      </p>
                    </div>

                    {center.phone && (
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">📞</span>
                        <p className="text-gray-700 text-xs">{center.phone}</p>
                      </div>
                    )}

                    {center.schedule && (
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">🕐</span>
                        <p className="text-gray-700 text-xs">{center.schedule}</p>
                      </div>
                    )}

                    {center.emergencyService && (
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">🚨</span>
                        <p className="text-red-600 text-xs font-semibold">
                          Servicio de Urgencias
                        </p>
                      </div>
                    )}

                    {center.description && (
                      <p className="text-gray-600 text-xs mt-2 pt-2 border-t">
                        {center.description}
                      </p>
                    )}

                    {center.services && center.services.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          Servicios:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {center.services.slice(0, 3).map((service, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                            >
                              {service}
                            </span>
                          ))}
                          {center.services.length > 3 && (
                            <span className="text-xs px-2 py-0.5 text-gray-500">
                              +{center.services.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer del popup */}
                  {center.zone && (
                    <div className="mt-3 pt-2 border-t text-xs text-gray-500">
                      Zona: {center.zone}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Overlay cuando no hay centros */}
      {centers.length === 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-[1000]">
          <div className="text-center p-6">
            <p className="text-xl text-gray-600 mb-2">
              No se encontraron centros con los filtros seleccionados
            </p>
            <p className="text-sm text-gray-500">
              Intenta ajustar los filtros para ver más resultados
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default InteractiveMap;
