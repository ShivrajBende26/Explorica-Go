/* eslint-disable */
export const displayMap = locations => {
  const mapElement = document.getElementById('map');
  const accessToken = document.body.dataset.mapboxToken;
  if (!accessToken) {
    mapElement.textContent = 'The map is unavailable until a Mapbox token is configured.';
    return;
  }
  if (!window.mapboxgl) {
    mapElement.textContent = 'The map could not be loaded. Please try again later.';
    return;
  }
  if (!locations.length) {
    mapElement.textContent = 'No map locations are available for this tour yet.';
    return;
  }

  mapboxgl.accessToken = accessToken;

  var map = new mapboxgl.Map({
    container: 'map',
    style:
      document.body.dataset.mapboxStyle ||
      'mapbox://styles/mapbox/streets-v12',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 10,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    const popupContent = document.createElement('p');
    popupContent.textContent = `Day ${loc.day}: ${loc.description}`;
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setDOMContent(popupContent)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
