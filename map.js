mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FtZiIsImEiOiJjaWZ3bGhtdjgzMnN1dWdrcnEwZTVieG91In0.DkCY-91coDahKvpH7Z26dw";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/samf/ckfguixbm2aee19ppd5s2d36l",
  center: [-99.829, 38.826],
  zoom: 3.8,
  pitchWithRotate: false,
  dragRotate: false,
  maxBounds: [
    [-130.78125, 22.367113562651262],
    [-61.17187499999999, 50.90303283111257],
  ],
});

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    countries: "us",
    mapboxgl: mapboxgl,
  })
);

map.on("load", function () {
  map.addSource("towns-data", {
    type: "geojson",
    data: "./towns.geojson"
  });

  map.addLayer({
    id: "towns",
    type: "circle",
    source: "towns-data",
    paint: {
      "circle-color": "#990000",
      "circle-radius": 6,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
      "circle-opacity": 0.75
    },
  }, 'settlement-subdivision-label' );

  map.on("click", "towns", function (e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var features = map.queryRenderedFeatures(e.point);
    console.log(features[0]);
    var id = features[0].id;
    var name = features[0].properties.name;
    var state = features[0].properties.state;

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(name + ", " + state + `<br><a href='https://sundown.tougaloo.edu/sundowntownsshow.php?id=${id}'>Click here for more</a>`)
      .addTo(map);
    // window.open(`https://sundown.tougaloo.edu/sundowntownsshow.php?id=${id}`);
  });

  map.on('mousemove', 'towns', function(e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['towns'] });
    if (!features.length) {
      map.getCanvas().style.cursor = '';
      map.setPaintProperty('towns', 'circle-radius', 6);
      return
    }

    map.setPaintProperty('towns', 'circle-radius', ['match', ['get', 'name'], features[0].properties.name, 10, 6]);
  });

  map.on("mouseenter", "towns", function () {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "towns", function () {
    map.getCanvas().style.cursor = "";
  });
});
