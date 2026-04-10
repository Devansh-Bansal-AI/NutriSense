/**
 * NutriSense AI — Nearby Places Component
 * Google Maps integration to find healthy restaurants nearby.
 */

import { mapsService } from '../services/google-maps.js';

let currentFilter = 'healthy food';

export function renderNearbyPlaces(container) {
  container.innerHTML = `
    <div class="nearby" id="nearbyView">
      <section class="nearby-header">
        <h1 class="page-title">📍 Healthy Places Nearby</h1>
        <p class="page-subtitle">Discover healthy restaurant options near your location, powered by Google Maps.</p>
      </section>

      <!-- Filter Chips -->
      <section class="nearby-filters">
        <button class="filter-chip active" data-filter="healthy food">🥗 Healthy</button>
        <button class="filter-chip" data-filter="salad bar">🥬 Salads</button>
        <button class="filter-chip" data-filter="vegan restaurant">🌱 Vegan</button>
        <button class="filter-chip" data-filter="smoothie juice bar">🥤 Juice Bar</button>
        <button class="filter-chip" data-filter="organic restaurant">🌿 Organic</button>
        <button class="filter-chip" data-filter="poke bowl">🍣 Poke</button>
      </section>

      <!-- Map Container -->
      <section class="nearby-map-container">
        <div id="nearbyMap" class="nearby-map"></div>
      </section>

      <!-- Places List -->
      <section class="nearby-list" id="nearbyList">
        <div class="results-loading">
          <div class="loading-spinner"></div>
          <p>Finding healthy places near you...</p>
        </div>
      </section>
    </div>
  `;

  // Initialize map
  mapsService.initialize('nearbyMap');

  // Load initial results
  loadPlaces('healthy food');

  // Bind filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const filter = e.currentTarget.dataset.filter;
      currentFilter = filter;
      loadPlaces(filter);
    });
  });
}

async function loadPlaces(keyword) {
  const listContainer = document.getElementById('nearbyList');
  if (!listContainer) return;

  listContainer.innerHTML = `
    <div class="results-loading">
      <div class="loading-spinner"></div>
      <p>Searching for "${keyword}" nearby...</p>
    </div>
  `;

  try {
    const places = await mapsService.searchNearbyHealthy(keyword);
    renderPlacesList(listContainer, places);
  } catch (err) {
    listContainer.innerHTML = `
      <div class="scan-error">
        <span>⚠️</span> Could not load nearby places. Please check your connection.
      </div>
    `;
  }
}

function renderPlacesList(container, places) {
  if (!places || places.length === 0) {
    container.innerHTML = `
      <div class="scan-placeholder">
        <div class="scan-placeholder-icon">🗺️</div>
        <h3>No Results</h3>
        <p>No healthy food places found nearby. Try a different category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="places-grid">
      ${places.map((place, idx) => renderPlaceCard(place, idx)).join('')}
    </div>
  `;

  // Stagger animation
  container.querySelectorAll('.place-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.08}s`;
  });
}

function renderPlaceCard(place, index) {
  const stars = renderStars(place.rating);
  const priceSymbol = '💵'.repeat(Math.min(place.priceLevel || 1, 3));
  const statusClass = place.isOpen === true ? 'open' : place.isOpen === false ? 'closed' : 'unknown';
  const statusText = place.isOpen === true ? 'Open Now' : place.isOpen === false ? 'Closed' : 'Hours N/A';

  return `
    <div class="place-card animate-in">
      <div class="place-card-header">
        <div class="place-rank">${index + 1}</div>
        <div class="place-info">
          <h3 class="place-name">${place.icon || '🍽️'} ${escapeHtml(place.name)}</h3>
          <p class="place-address">${escapeHtml(place.address)}</p>
        </div>
        <div class="place-distance">
          <span class="distance-value">${place.distance}</span>
          <span class="distance-label">away</span>
        </div>
      </div>

      <div class="place-card-body">
        <div class="place-meta">
          <span class="place-rating">${stars} <strong>${place.rating}</strong> <span class="rating-count">(${place.totalRatings})</span></span>
          <span class="place-price">${priceSymbol}</span>
          <span class="place-status status-${statusClass}">${statusText}</span>
        </div>
        ${place.healthTags ? `
          <div class="place-tags">
            ${place.healthTags.map(tag => `<span class="place-tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
      </div>

      <div class="place-card-footer">
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.id}"
           target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary">
          🗺️ Open in Maps
        </a>
      </div>
    </div>
  `;
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
