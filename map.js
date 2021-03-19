mapboxgl.accessToken =
  'pk.eyJ1Ijoic2FtZiIsImEiOiJjaWZ3bGhtdjgzMnN1dWdrcnEwZTVieG91In0.DkCY-91coDahKvpH7Z26dw';

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

let dataUrl =
  'https://json-loewen-sundown-towns.pantheonsite.io/sundown/database/geojson.php';

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    countries: 'us',
    mapboxgl,
  })
);

var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');

map.on('load', function () {
  var legendEl = document.getElementById('legend');
  legendEl.addEventListener('click', function (e) {
    var value = e.target.innerHTML;
    filterMarkers(value);
  });

  map.addSource('towns-data', {
    type: 'geojson',
    data: dataUrl,
  });

  map.addLayer(
    {
      id: 'towns',
      type: 'circle',
      source: 'towns-data',
      // filter: ['has', 'confirmed'],
      paint: {
        'circle-color': [
          'case',
          ['has', 'confirmed'],
          [
            'step',
            ['get', 'confirmed'],
            'hsl(0, 0%, 82%)',
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
          ],
          '#990000',
        ],
        'circle-radius': 6,
        'circle-stroke-width': 1,
        'circle-stroke-color': [
          'case',
          ['has', 'confirmed'],
          [
            'step',
            ['get', 'confirmed'],
            'hsl(0, 0%, 47%)',
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
          ],
          ['!=', ['get', 'confirmed'], null],
          'hsl(160, 100%, 65%)',
          '#990000',
        ],
        'circle-opacity': 0.75,
      },
    },
    'settlement-subdivision-label'
  );

  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  var confirmedDescription = {
    0: 'Don\'t know',
    1: 'Unlikely',
    2: 'Possible',
    3: 'Probable',
    4: 'Surely',
    8: 'Unlikely/Always Biracial',
    9: 'Black Town or Township'
  };

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

  map.on('mouseenter', 'towns', function (e) {
    map.getCanvas().style.cursor = 'pointer';
    var coordinates = e.features[0].geometry.coordinates.slice();
    var features = map.queryRenderedFeatures(e.point);
    var id = features[0].id;
    var name = features[0].properties.name;
    var state = features[0].properties.state;
    var confirmed = features[0].properties.confirmed || 10;

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

  map.on('mouseleave', 'towns', function () {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

  map.on('click', 'towns', function (e) {
    var features = map.queryRenderedFeatures(e.point);
    var id = features[0].id;
    window.open(`https://sundown.tougaloo.edu/sundowntownsshow.php?id=${id}`);
  });

  function filterMarkers(status) {
    // if clear is clicked, remove filter, otherwise filter by status
    if (status === 'Clear filter') {
      return map.setFilter('towns', null); 
    }

    var statusInt = Object.keys(confirmedDescription).find((key) => confirmedDescription[key] === status);
    if (statusInt >= 0 && statusInt < 10) {
      map.setFilter('towns', ['==', ['get', 'confirmed'], parseInt(statusInt)]);
    }
  }
});
