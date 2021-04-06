mapboxgl.accessToken = 'pk.eyJ1IjoiamxvZXdlbiIsImEiOiJja2xndmR4bTQ1NXcxMnZ1aXNqaWo4ZHpyIn0.8dx0t2m15JltIuCf25x7FA';
  
const dataUrl = 'https://json-loewen-sundown-towns.pantheonsite.io/sundown/database/geojson.php?';

const confirmedDescription = {
  0: 'Don\'t know',
  1: 'Unlikely',
  2: 'Possible',
  3: 'Probable',
  4: 'Surely',
  8: 'Unlikely/Always Biracial',
  9: 'Black Town or Township'
};

function fetchCleanData(url) {
  return fetch(url)
    .then((response) => response.text())
    .then((text) => {
      // This is necessary because some API responses include 
      // munged up database warnings
      const cleanResponse = text.slice(text.indexOf('{'));
      return JSON.parse(cleanResponse);
    });
}

function filterMarkers(status) {
  // if clear is clicked, remove filter, otherwise filter by status
  if (status === 'Clear filter') {
    return map.setFilter('sundown-towns', null);
  }

  const statusInt = Object.keys(confirmedDescription).find((key) => confirmedDescription[key] === status);
  if (statusInt >= 0 && statusInt < 10) {
    map.setFilter('sundown-towns', ['==', ['get', 'confirmed'], parseInt(statusInt)]);
  }
}

const legendEl = document.getElementById('legend');
legendEl.addEventListener('click', function (e) {
  const value = e.target.innerHTML;
  filterMarkers(value);
});

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/jloewen/cklgvceam6dr117rz6clq3pf1',
  center: [-96.829, 38.826],
  zoom: 4.3,
  pitchWithRotate: false,
  dragRotate: false,
  maxBounds: [
    [-135.78125, 22.367113562651262],
    [-66.17187499999999, 50.90303283111257],
  ],
});

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    countries: 'us',
    mapboxgl: mapboxgl,
  })
);

map.addControl(
  new mapboxgl.NavigationControl(),
  'top-left'
);

map.on('load', async function () {
  
  /*~*~ Data Fetching ~*~*/
  const townData = await fetchCleanData(dataUrl);
  map.addSource('towns-data', {
    type: 'geojson',
    data: townData,
  });

  /*~*~ Style Layers ~*~*/
  map.addLayer({
    id: 'sundown-towns',
    type: 'circle',
    source: 'towns-data',
    paint: {
      'circle-color': [
        'match',
        ['get', 'confirmed'],
        1, '#545454',
        2, '#ffc6c6',
        3, '#ff5e5e',
        4, '#c20d0d',
        8, '#545454',
        9, '#000000',
        /* default */ '#d1d1d1'
      ],
      'circle-radius': 6,
      'circle-stroke-width': 1,
      'circle-stroke-color': [
        'match',
        ['get', 'confirmed'],
        1, 'hsl(0, 28%, 10%)',
        2, 'hsl(0, 100%, 62%)',
        3, 'hsl(0, 100%, 44%)',
        4, 'hsl(0, 88%, 20%)',
        8, 'hsl(0, 0%, 9%)',
        9, '#000000',
        /* default */ '#990000'
      ],
      'circle-opacity': 0.75,
    },
  });

  map.addLayer(
    {
      id: 'towns-showcase',
      type: 'symbol',
      source: 'towns-data',
      filter: [
        'all',
        [
          'match',
          ['get', 'showcase'],
          [1],
          true,
          false
        ]
      ],
      'layout': {
        'icon-image': 'flag',
        'icon-size': 0.3
    },
    }
  );


  /*~*~ Map Interactions ~*~*/
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  function handleHover(layer) {
    // this pattern might seem weird, but it lets us reuse this 
    // hover function with different targeted layers, isn't javascript fun?
    return function(e) {
      map.getCanvas().style.cursor = 'pointer';
      const coordinates = e.features[0].geometry.coordinates.slice();
      const features = map.queryRenderedFeatures(e.point, { layers: [layer] });
      const name = features[0].properties.name;
      const state = features[0].properties.state;
      const confirmed = features[0].properties.confirmed || 0;

      popup
        .setLngLat(coordinates)
        .setHTML(
          name +
          ', ' +
          state +
          '<br>' +
          `Confirmed: ${confirmedDescription[confirmed]}` +
          '<br><br>Click for more information'
        )
        .addTo(map);
    }
  }

  function handleClick(layer) {
    return function(e) {
      const features = map.queryRenderedFeatures(e.point, { layers: [layer] });
      const id = features[0].id;
      window.open(`https://sundown.tougaloo.edu/sundowntownsshow.php?id=${id}`);
    }
  }
  
  map.on('mouseenter', 'sundown-towns', handleHover('sundown-towns'));   // towns NOT featured with flags
  map.on('click', 'sundown-towns', handleClick('sundown-towns'));
  
  map.on('mouseenter', 'towns-showcase', handleHover('towns-showcase')); // towns featured with flags
  map.on('click', 'towns-showcase', handleClick('towns-showcase'));

  map.on('mouseleave', 'sundown-towns', function () {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

  map.on('mouseleave', 'towns-showcase', function () {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });
});
