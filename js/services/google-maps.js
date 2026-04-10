/**
 * NutriSense AI — Google Maps Service
 * Integration layer for Google Maps Places API.
 * Finds nearby healthy restaurants and food options.
 */

import { APP_CONFIG } from '../../config/app-config.js';

class GoogleMapsService {
  constructor() {
    this.map = null;
    this.placesService = null;
    this.markers = [];
    this.isLoaded = false;
    this.userLocation = null;
  }

  /**
   * Initialize the Google Maps instance.
   */
  async initialize(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return false;

    // Check if Google Maps API is loaded
    if (typeof google !== 'undefined' && google.maps) {
      this.isLoaded = true;
      await this.setupMap(container);
      return true;
    }

    // Show fallback UI
    this.showFallback(container);
    return false;
  }

  /**
   * Setup Google Map instance.
   */
  async setupMap(container) {
    const location = await this.getUserLocation();

    this.map = new google.maps.Map(container, {
      center: location,
      zoom: 14,
      styles: this.getMapStyles(),
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    this.placesService = new google.maps.places.PlacesService(this.map);

    // Add user marker
    new google.maps.Marker({
      position: location,
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#818cf8',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3
      },
      title: 'Your Location'
    });

    return this.map;
  }

  /**
   * Get user's current location.
   */
  getUserLocation() {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            resolve(this.userLocation);
          },
          () => {
            // Fallback: Default location (NYC)
            this.userLocation = { lat: 40.7128, lng: -74.0060 };
            resolve(this.userLocation);
          },
          { timeout: 5000 }
        );
      } else {
        this.userLocation = { lat: 40.7128, lng: -74.0060 };
        resolve(this.userLocation);
      }
    });
  }

  /**
   * Search for nearby healthy restaurants.
   */
  async searchNearbyHealthy(keyword = 'healthy food') {
    if (!this.isLoaded || !this.placesService) {
      return this.getMockResults();
    }

    return new Promise((resolve) => {
      const request = {
        location: this.userLocation,
        radius: APP_CONFIG.google.maps.defaultRadius,
        type: ['restaurant'],
        keyword: keyword
      };

      this.placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          this.clearMarkers();

          const places = results.slice(0, 8).map((place, idx) => {
            // Add marker
            const marker = new google.maps.Marker({
              position: place.geometry.location,
              map: this.map,
              title: place.name,
              label: {
                text: String(idx + 1),
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold'
              }
            });
            this.markers.push(marker);

            return {
              id: place.place_id,
              name: place.name,
              rating: place.rating || 0,
              totalRatings: place.user_ratings_total || 0,
              address: place.vicinity,
              priceLevel: place.price_level || 2,
              isOpen: place.opening_hours?.isOpen() ?? null,
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              },
              distance: this.calculateDistance(
                this.userLocation,
                {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }
              ),
              icon: this.getPlaceIcon(place.types)
            };
          });

          resolve(places);
        } else {
          resolve(this.getMockResults());
        }
      });
    });
  }

  /**
   * Clear existing map markers.
   */
  clearMarkers() {
    this.markers.forEach(m => m.setMap(null));
    this.markers = [];
  }

  /**
   * Calculate distance between two points (Haversine formula).
   */
  calculateDistance(from, to) {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(to.lat - from.lat);
    const dLng = this.deg2rad(to.lng - from.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.deg2rad(from.lat)) * Math.cos(this.deg2rad(to.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  getPlaceIcon(types) {
    if (types?.includes('health')) return '🥗';
    if (types?.includes('cafe')) return '☕';
    if (types?.includes('meal_delivery')) return '🚴';
    return '🍽️';
  }

  /**
   * Mock results when Google Maps API is not available.
   */
  getMockResults() {
    return [
      { id: 'mock1', name: 'Green Bowl Kitchen', rating: 4.6, totalRatings: 234, address: '123 Health St', priceLevel: 2, isOpen: true, distance: '350m', icon: '🥗', healthTags: ['Salads', 'Organic', 'Vegan options'] },
      { id: 'mock2', name: 'Vitality Juice Bar', rating: 4.8, totalRatings: 189, address: '45 Wellness Ave', priceLevel: 1, isOpen: true, distance: '520m', icon: '🥤', healthTags: ['Smoothies', 'Cold-pressed', 'Acai bowls'] },
      { id: 'mock3', name: 'Protein House Grill', rating: 4.4, totalRatings: 312, address: '78 Fitness Blvd', priceLevel: 2, isOpen: true, distance: '780m', icon: '🍗', healthTags: ['High protein', 'Grilled', 'Meal prep'] },
      { id: 'mock4', name: 'Mediterranean Oasis', rating: 4.7, totalRatings: 156, address: '92 Olive Lane', priceLevel: 3, isOpen: false, distance: '1.2km', icon: '🫒', healthTags: ['Mediterranean', 'Hummus', 'Fresh fish'] },
      { id: 'mock5', name: 'Sakura Poke & Sushi', rating: 4.5, totalRatings: 278, address: '15 Ocean Dr', priceLevel: 2, isOpen: true, distance: '1.4km', icon: '🍣', healthTags: ['Poke bowls', 'Sashimi', 'Brown rice'] },
      { id: 'mock6', name: 'Farm to Table Bistro', rating: 4.9, totalRatings: 95, address: '201 Garden St', priceLevel: 3, isOpen: true, distance: '1.8km', icon: '🥬', healthTags: ['Farm fresh', 'Seasonal', 'Organic'] }
    ];
  }

  /**
   * Show fallback UI when Maps API is not loaded.
   */
  showFallback(container) {
    container.innerHTML = `
      <div class="maps-fallback">
        <div class="maps-fallback-icon">🗺️</div>
        <h3>Map View</h3>
        <p>Add your Google Maps API key in <code>config/app-config.js</code> to see nearby restaurants on the map.</p>
        <p class="maps-note">Showing mock restaurant data below.</p>
      </div>
    `;
  }

  /**
   * Dark mode map styles.
   */
  getMapStyles() {
    return [
      { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a4a' }] },
      { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8aaa' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
      { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1f1f3a' }] },
      { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6a6a8a' }] }
    ];
  }
}

export const mapsService = new GoogleMapsService();
export default mapsService;
