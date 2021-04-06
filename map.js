mapboxgl.accessToken =
  'pk.eyJ1Ijoic2FtZiIsImEiOiJjaWZ3bGhtdjgzMnN1dWdrcnEwZTVieG91In0.DkCY-91coDahKvpH7Z26dw';

const dataUrl =
  'https://json-loewen-sundown-towns.pantheonsite.io/sundown/database/geojson.php';

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
  style: 'mapbox://styles/samf/ckfguixbm2aee19ppd5s2d36l',
  center: [-96.829, 38.826],
  zoom: 4.3,
  pitchWithRotate: false,
  dragRotate: false,
  maxBounds: [
    [-135.78125, 22.367113562651262],
    [-61.17187499999999, 50.90303283111257],
  ],
});

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    countries: 'us',
    mapboxgl,
  })
);

map.addControl(
  new mapboxgl.NavigationControl(), 
  'top-left'
);

map.on('load', async function () {

  const townData = await fetchCleanData(dataUrl); 

  map.addSource('towns-data', {
    type: 'geojson',
    data: townData
  });

  map.addLayer(
    {
      id: 'sundown-towns',
      type: 'circle',
      source: 'towns-data',
      paint: {
        'circle-color': [
          'match',
          ['get', 'confirmed'],
          1,
          '#545454',
          2,
          '#ffc6c6',
          3,
          '#ff5e5e',
          4,
          '#c20d0d',
          8,
          '#545454',
          9,
          '#000000',
          /* default */'#d1d1d1'
        ],
        'circle-radius': 6,
        'circle-stroke-width': 1,
        'circle-stroke-color': [
          'match',
          ['get', 'confirmed'],
          1,
          'hsl(0, 28%, 10%)',
          2,
          'hsl(0, 100%, 62%)',
          3,
          'hsl(0, 100%, 44%)',
          4,
          'hsl(0, 88%, 20%)',
          8,
          'hsl(0, 0%, 9%)',
          9,
          '#000000',
          /* default */ '#990000'
        ],
        'circle-opacity': 0.75,
      },
    },
    'settlement-subdivision-label'
  );

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  // map.on('mousemove', 'towns', function(e) {
  //   var features = map.queryRenderedFeatures(e.point, { layers: ['towns'] });
  //   if (!features.length) {
  //     map.getCanvas().style.cursor = '';
  //     map.setPaintProperty('towns', 'circle-radius', 6);
  //     return
  //   }

  //   map.setPaintProperty('towns', 'circle-radius', ['match', ['get', 'name'], features[0].properties.name, 10, 6]);
  // });

  // display only features with the 'name' property 'USA'

  map.on('mouseenter', 'sundown-towns', function (e) {
    map.getCanvas().style.cursor = 'pointer';
    const coordinates = e.features[0].geometry.coordinates.slice();
    const features = map.queryRenderedFeatures(e.point, { layers: ['sundown-towns'] });
    const id = features[0].id;
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
  });

  map.on('mouseleave', 'sundown-towns', function () {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

  map.on('click', 'sundown-towns', function (e) {
    const features = map.queryRenderedFeatures(e.point, { layers: ['sundown-towns'] });
    const id = features[0].id;
    window.open(`https://sundown.tougaloo.edu/sundowntownsshow.php?id=${id}`);
  });
});
