"use client";

import { useState, useRef, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { addMapPlace, deleteMapPlace } from '../lib/actions';
import { useRouter } from 'next/navigation';
import { X, MapPin, MagnifyingGlass, Crosshair, Trash } from '@phosphor-icons/react';

function SearchOverlay({ onSelectResult, userLocation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const skipSearchRef = useRef(false);

  const doMapboxSearch = async (query, signal) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) throw new Error('Missing Mapbox Token');
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=vn&autocomplete=true&limit=5`;
    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`Mapbox API Error: ${res.status}`);
    }
    return await res.json();
  };

  // Debounced search for suggestions as user types
  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      
      if (skipSearchRef.current) {
        skipSearchRef.current = false;
        return;
      }
      
      setIsSearching(true);
      try {
        const data = await doMapboxSearch(searchQuery, controller.signal);
        
        if (data && data.features) {
          const mappedResults = data.features.map(f => ({
            place_id: f.id,
            display_name: f.place_name,
            lat: f.center[1],
            lon: f.center[0]
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
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, userLocation]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]); 
    
    try {
      const data = await doMapboxSearch(searchQuery);
      if (data && data.features && data.features.length > 0) {
        const f = data.features[0];
        handleSelectSearchResult({
          place_id: f.id,
          display_name: f.place_name,
          lat: f.center[1],
          lon: f.center[0]
        });
      } else {
        alert("Place not found. Please try another keyword.");
      }
    } catch (err) {
      console.error("Search submit error:", err);
      alert(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    setSearchResults([]);
    skipSearchRef.current = true;
    setSearchQuery(result.display_name);
    
    if (result.lat && result.lon) {
      onSelectResult(result);
    } else {
      alert("Cannot get coordinates for this place.");
    }
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

const defaultCenter = [21.028511, 105.804817]; // Hanoi [lat, lng]

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
  const mapRef = useRef(null);

  // Get User Location on Mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          setMapCenter(loc);
          flyToLocation(loc);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);
  
  const flyToLocation = (loc, zoom = 15) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [loc[1], loc[0]], // [lng, lat]
        zoom: zoom,
        duration: 1500
      });
    }
  };

  const handleLocateMe = () => {
    if (userLocation) {
      setMapCenter([...userLocation]);
      flyToLocation(userLocation);
    }
  };

  const handleSelectSearchResult = (result) => {
    const loc = [parseFloat(result.lat), parseFloat(result.lon)];
    setMapCenter([...loc]);
    flyToLocation(loc);
    setNewMarkerPos({ lat: loc[0], lng: loc[1] });
    setIsAdding(true);
    setSelectedAddress(result.display_name); // Fill input with full address
    setSelectedPlace(null);
  };
  
  const handleMapClick = async (e) => {
    const { lng, lat } = e.lngLat;
    setNewMarkerPos({ lat, lng });
    setIsAdding(true);
    setSelectedPlace(null);
    
    if (setSelectedAddress) {
      setSelectedAddress('Loading address...');
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address,poi,place`);
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
          setSelectedAddress(data.features[0].place_name);
        } else {
          setSelectedAddress('');
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        setSelectedAddress('');
      }
    }
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
      await addMapPlace(data);
      
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
    if (window.confirm("Are you sure you want to delete this place?")) {
      try {
        await deleteMapPlace(id);
        setSelectedPlace(null); // Close popup
        router.refresh();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-border/50 z-0 flex flex-col md:block">
      
      {/* Search Bar Overlay */}
      <SearchOverlay onSelectResult={handleSelectSearchResult} userLocation={userLocation} />
      
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

      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: mapCenter[1],
          latitude: mapCenter[0],
          zoom: 13
        }}
        style={{width: '100%', height: '100%'}}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onClick={handleMapClick}
      >
        {places.map((place) => (
          <Marker 
            key={place.id} 
            longitude={place.lng} 
            latitude={place.lat} 
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedPlace(place);
              setIsAdding(false);
              setNewMarkerPos(null);
            }}
          >
            <div className="text-accent hover:text-accent/80 cursor-pointer drop-shadow-md transition-transform hover:scale-110">
              <MapPin size={36} weight="fill" />
            </div>
          </Marker>
        ))}

        {selectedPlace && (
          <Popup
            longitude={selectedPlace.lng}
            latitude={selectedPlace.lat}
            anchor="bottom"
            onClose={() => setSelectedPlace(null)}
            closeOnClick={false}
            offset={[0, -40]}
            className="z-50 custom-popup"
            closeButton={false}
          >
            <div className="bg-card-bg/95 backdrop-blur-xl border border-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl w-[280px] p-5 flex flex-col overflow-hidden relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedPlace(null); }}
                className="absolute top-3 right-3 text-foreground/40 hover:text-foreground transition-all p-1.5 rounded-full hover:bg-foreground/5"
              >
                <X size={16} weight="bold" />
              </button>
              
              <h3 className="font-bold text-lg mb-2 text-foreground pr-8 leading-tight tracking-tight">{selectedPlace.name}</h3>
              
              <p className="text-sm mb-4 flex items-start gap-2 text-foreground/70 leading-relaxed">
                <MapPin size={16} className="mt-0.5 shrink-0 text-accent" weight="fill" />
                <span className="line-clamp-2">{selectedPlace.address}</span>
              </p>
              
              {selectedPlace.notes && (
                <div className="bg-foreground/5 border border-border/50 p-3.5 rounded-xl text-sm text-foreground/80 break-words mb-4 shadow-inner">
                  {selectedPlace.notes}
                </div>
              )}
              
              <div className="pt-3 border-t border-border/40 flex justify-end mt-auto">
                <button 
                  onClick={() => handleDeletePlace(selectedPlace.id)}
                  className="text-xs text-red-500/80 hover:text-red-600 font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all px-3 py-1.5 rounded-lg hover:bg-red-500/10 active:scale-95"
                >
                  <Trash size={14} weight="bold" /> Delete
                </button>
              </div>
            </div>
            <style>{`
              .custom-popup .mapboxgl-popup-content {
                padding: 0;
                background: transparent;
                box-shadow: none;
                border-radius: 16px;
              }
              .custom-popup .mapboxgl-popup-tip {
                display: none;
              }
            `}</style>
          </Popup>
        )}

        {userLocation && (
          <Marker longitude={userLocation[1]} latitude={userLocation[0]} anchor="center">
            <div className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-white shadow-lg"></span>
            </div>
          </Marker>
        )}

        {newMarkerPos && (
          <Marker longitude={newMarkerPos.lng} latitude={newMarkerPos.lat} anchor="bottom">
            <div className="text-red-500 drop-shadow-md animate-bounce">
              <MapPin size={36} weight="fill" />
            </div>
          </Marker>
        )}
      </Map>

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
