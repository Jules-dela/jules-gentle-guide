import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxAccessTokenInputProps {
  onTokenSubmit: (token: string) => void;
}

const MapboxAccessTokenInput: React.FC<MapboxAccessTokenInputProps> = ({ onTokenSubmit }) => {
  const [token, setToken] = useState('');

  return (
    <div className="flex flex-col items-center justify-center h-[600px] bg-gradient-to-br from-navy via-navy-light to-navy p-8">
      <div className="max-w-md w-full space-y-4 bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
        <h3 className="text-xl font-semibold text-white">Mapbox Token Required</h3>
        <p className="text-white/80 text-sm">
          To display the interactive globe, please enter your Mapbox public token.
          Get one for free at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
        </p>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="pk.eyJ1..."
          className="w-full px-4 py-2 rounded-md bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        <button
          onClick={() => token && onTokenSubmit(token)}
          disabled={!token}
          className="w-full px-4 py-2 bg-white text-navy font-medium rounded-md hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Load Map
        </button>
      </div>
    </div>
  );
};

export const WorldMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: { name: 'globe' },
        zoom: 1.5,
        center: [8, 47], // Centered on Switzerland
        pitch: 0,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Disable scroll zoom for smoother experience
      map.current.scrollZoom.disable();

      // Add atmosphere and fog effects
      map.current.on('style.load', () => {
        map.current?.setFog({
          color: 'rgb(25, 50, 70)',
          'high-color': 'rgb(15, 30, 50)',
          'horizon-blend': 0.1,
        });
      });

      // Rotation animation settings
      const secondsPerRevolution = 120;
      const maxSpinZoom = 5;
      const slowSpinZoom = 3;
      let userInteracting = false;

      // Spin globe function
      function spinGlobe() {
        if (!map.current) return;
        
        const zoom = map.current.getZoom();
        if (!userInteracting && zoom < maxSpinZoom) {
          let distancePerSecond = 360 / secondsPerRevolution;
          if (zoom > slowSpinZoom) {
            const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
            distancePerSecond *= zoomDif;
          }
          const center = map.current.getCenter();
          center.lng -= distancePerSecond;
          map.current.easeTo({ center, duration: 1000, easing: (n) => n });
        }
      }

      // Event listeners for interaction
      map.current.on('mousedown', () => {
        userInteracting = true;
      });
      
      map.current.on('dragstart', () => {
        userInteracting = true;
      });
      
      map.current.on('mouseup', () => {
        userInteracting = false;
        spinGlobe();
      });
      
      map.current.on('touchend', () => {
        userInteracting = false;
        spinGlobe();
      });

      map.current.on('moveend', () => {
        spinGlobe();
      });

      // Start the globe spinning
      spinGlobe();

      // Cleanup
      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setShowTokenInput(true);
    }
  }, [mapboxToken]);

  const handleTokenSubmit = (token: string) => {
    setMapboxToken(token);
    setShowTokenInput(false);
  };

  if (showTokenInput) {
    return <MapboxAccessTokenInput onTokenSubmit={handleTokenSubmit} />;
  }

  return (
    <section id="global-reach" className="py-20 bg-gradient-to-br from-navy via-navy-light to-navy relative overflow-hidden">
      <div className="container">
        <div className="mb-12 text-center space-y-2">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Global Reach, Local Expertise
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Connecting international students with quality housing in Lausanne
          </p>
        </div>
        
        <div className="relative h-[600px] rounded-2xl overflow-hidden">
          {/* Map container */}
          <div ref={mapContainer} className="absolute inset-0 rounded-2xl" />
          
          {/* Gradient overlay for better card visibility */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-navy/20" />
          
          {/* Floating statistic cards */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Card 1 - Top Left */}
            <div className="absolute top-8 left-8 lg:top-16 lg:left-16 pointer-events-auto animate-fade-in">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 lg:p-8 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  Under 5 Days
                </div>
                <div className="text-white/80 text-sm lg:text-base">
                  Average Placement Time
                </div>
              </div>
            </div>

            {/* Card 2 - Top Right */}
            <div className="absolute top-8 right-8 lg:top-16 lg:right-16 pointer-events-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 lg:p-8 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  98%
                </div>
                <div className="text-white/80 text-sm lg:text-base">
                  Student Satisfaction
                </div>
              </div>
            </div>

            {/* Card 3 - Bottom Center */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:bottom-16 pointer-events-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 lg:p-8 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  3 Universities
                </div>
                <div className="text-white/80 text-sm lg:text-base">
                  EHL, EPFL, UNIL
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
