"use client";

import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { addMapPlace, deleteMapPlace } from '../lib/actions';
import { useRouter } from 'next/navigation';
import { X, MapPin, MagnifyingGlass, Crosshair, Trash } from '@phosphor-icons/react';

// Fix for default marker icons in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A green icon for user's current location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


function MapClickHandler({ setNewMarkerPos, setIsAdding, setSelectedPlace, setSelectedAddress }) {
  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setNewMarkerPos({ lat, lng });
      setIsAdding(true);
      setSelectedPlace(null);
      
      if (setSelectedAddress) {
        setSelectedAddress('Đang tải địa chỉ...');
        try {
          const res = await fetch(`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&language=vi`);
          const data = await res.json();
          if (data && data.features && data.features.length > 0) {
            const f = data.features[0];
            setSelectedAddress(f.properties.full_address || `${f.properties.name}, ${f.properties.place_formatted}`);
          } else {
            setSelectedAddress('');
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setSelectedAddress('');
        }
      }
    },
  });
  return null;
}

function SearchOverlay({ onSelectResult }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const skipSearchRef = useRef(false);

  // Debounced search for suggestions as user types
  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      if (!searchQuery.trim() || searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }
      
      if (skipSearchRef.current) {
        skipSearchRef.current = false;
        return;
      }
      
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(searchQuery)}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&country=vn&language=vi&limit=5`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (data && data.features) {
          const mappedResults = data.features.map(f => ({
            place_id: f.id,
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            display_name: f.properties.full_address || `${f.properties.name}, ${f.properties.place_formatted}`
          }));
          setSearchResults(mappedResults);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Suggestion error:", err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 400); // Reduced debounce time for faster search

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]); 
    try {
      const res = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(searchQuery)}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&country=vn&language=vi&limit=1`);
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const f = data.features[0];
        handleSelectSearchResult({
          place_id: f.id,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
          display_name: f.properties.full_address || `${f.properties.name}, ${f.properties.place_formatted}`
        });
      }
    } catch (err) {
      console.error("Search submit error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    setSearchResults([]);
    skipSearchRef.current = true;
    setSearchQuery(result.display_name);
    onSelectResult(result);
  };

  return (
    <div className="absolute top-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto z-[1000] w-[calc(100%-32px)] md:w-[400px] max-w-full">
      <form onSubmit={handleSearchSubmit} className="flex gap-2 bg-card-bg/95 backdrop-blur-md p-2 rounded-xl border border-border shadow-lg">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a place (e.g. Hoan Kiem)..."
          className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
        />
        <button type="submit" disabled={isSearching} className="p-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center shrink-0">
          {isSearching ? <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></div> : <MagnifyingGlass size={20} />}
        </button>
      </form>
      
      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card-bg/95 backdrop-blur-xl border border-border rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[300px] overflow-y-auto">
          {searchResults.map((result) => (
            <button 
              type="button"
              key={result.place_id}
              onClick={() => handleSelectSearchResult(result)}
              className="text-left px-4 py-3 hover:bg-foreground/5 border-b border-border/50 last:border-0 text-sm transition-colors flex items-start gap-2"
            >
              <MapPin size={16} className="shrink-0 mt-1 text-accent" />
              <span className="line-clamp-2">{result.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || map.getZoom(), {
        animate: true,
        duration: 1.5
      });
    }
  }, [center, map, zoom]);
  return null;
}

const defaultCenter = [21.028511, 105.804817]; // Hanoi

export default function MapComponent({ places = [] }) {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newMarkerPos, setNewMarkerPos] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(places.length > 0 ? [places[0].lat, places[0].lng] : defaultCenter);
  const [selectedAddress, setSelectedAddress] = useState('');
  
  const router = useRouter();
  const formRef = useRef(null);

  // Get User Location on Mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          setMapCenter(loc); // Automatically center map to user location
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const handleLocateMe = () => {
    if (userLocation) {
      setMapCenter([...userLocation]); // Force new reference
    }
  };

  const handleSelectSearchResult = (result) => {
    const loc = [parseFloat(result.lat), parseFloat(result.lon)];
    setMapCenter([...loc]); // Force re-render for MapController
    setNewMarkerPos({ lat: loc[0], lng: loc[1] });
    setIsAdding(true);
    setSelectedAddress(result.display_name); // Fill input with full address
  };

  const handleSavePlace = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData(formRef.current);
      const data = {
        name: formData.get('name'),
        address: formData.get('address'),
        notes: formData.get('notes'),
        lat: newMarkerPos.lat,
        lng: newMarkerPos.lng
      };
      const password = formData.get('password');

      await addMapPlace(data, password);
      
      setNewMarkerPos(null);
      setIsAdding(false);
      setSelectedAddress('');
      router.refresh();
    } catch (err) {
      setErrorMsg(err.message || 'Error saving place');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlace = async (id) => {
    const password = window.prompt("Nhập mật khẩu để xóa địa điểm này (gợi ý: iloveyou):");
    if (!password) return;
    
    try {
      await deleteMapPlace(id, password);
      router.refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-border/50 z-0 flex flex-col md:block">
      
      {/* Search Bar Overlay */}
      <SearchOverlay onSelectResult={handleSelectSearchResult} />
      
      {/* Locate Me Button */}
      {userLocation && (
        <button 
          onClick={handleLocateMe}
          className="absolute bottom-6 right-6 z-[1000] p-3 bg-card-bg/95 backdrop-blur-md border border-border shadow-lg rounded-full hover:bg-foreground/10 transition-transform hover:scale-105"
          title="Go to My Location"
        >
          <Crosshair size={24} className="text-accent" />
        </button>
      )}

      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <MapController center={mapCenter} zoom={15} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
          url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
        />
        
        <MapClickHandler 
          setNewMarkerPos={setNewMarkerPos} 
          setIsAdding={setIsAdding} 
          setSelectedPlace={setSelectedPlace} 
          setSelectedAddress={setSelectedAddress}
        />

        {places.map((place) => (
          <Marker 
            key={place.id} 
            position={[place.lat, place.lng]} 
            icon={customIcon}
            eventHandlers={{
              click: () => {
                setSelectedPlace(place);
                setIsAdding(false);
                setNewMarkerPos(null);
              },
            }}
          >
            <Popup>
              <div className="text-black max-w-[200px]">
                <h3 className="font-bold text-[16px] mb-1 m-0 p-0 leading-tight">{place.name}</h3>
                <p className="text-[13px] mb-2 flex items-start gap-1 text-gray-700 m-0 p-0 leading-tight mt-1">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  {place.address}
                </p>
                {place.notes && (
                  <div className="bg-gray-100 p-2 rounded text-[13px] italic text-gray-800 break-words mt-2">
                    {place.notes}
                  </div>
                )}
                <div className="mt-3 pt-2 border-t border-gray-200/60 flex justify-end">
                  <button 
                    onClick={() => handleDeletePlace(place.id)}
                    className="text-[11px] text-red-500/70 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Trash size={12} /> Xóa
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="font-bold text-center">Bạn đang ở đây!</div>
            </Popup>
          </Marker>
        )}

        {newMarkerPos && (
          <Marker position={[newMarkerPos.lat, newMarkerPos.lng]} icon={customIcon} />
        )}
      </MapContainer>

      {/* Add Place Overlay Modal */}
      {isAdding && newMarkerPos && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 md:top-24 md:left-4 z-[1000] bg-card-bg/95 backdrop-blur-xl border border-border shadow-2xl p-6 rounded-2xl w-[90%] max-w-[320px] animate-in fade-in zoom-in-95 duration-300">
          <button 
            onClick={() => { setIsAdding(false); setNewMarkerPos(null); }}
            className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
          
          <h3 className="text-xl font-bold tracking-widest uppercase mb-4 text-foreground">Pin Location</h3>
          
          <form ref={formRef} onSubmit={handleSavePlace} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1">Place Name</label>
              <input type="text" name="name" required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent" placeholder="e.g. Delicious Pho..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1">Address</label>
              <input type="text" name="address" required defaultValue={selectedAddress} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent" placeholder="e.g. 123 Main St..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1">Notes (Optional)</label>
              <textarea name="notes" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none h-20" placeholder="Our favorite dish was..."></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-1">Password</label>
              <input type="password" name="password" required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent" placeholder="Secret password..." />
            </div>
            
            {errorMsg && <p className="text-red-500 text-xs font-medium">{errorMsg}</p>}
            
            <button type="submit" disabled={loading} className="w-full bg-foreground text-background font-bold tracking-widest uppercase rounded-lg py-3 text-sm hover:opacity-90 disabled:opacity-50 transition-all mt-2">
              {loading ? 'Saving...' : 'Save Pin'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
