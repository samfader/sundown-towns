mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FtZiIsImEiOiJjaWZ3bGhtdjgzMnN1dWdrcnEwZTVieG91In0.DkCY-91coDahKvpH7Z26dw";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/samf/ckfguixbm2aee19ppd5s2d36l",
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
  "https://json-loewen-sundown-towns.pantheonsite.io/sundown/database/geojson.php?";

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    countries: "us",
    mapboxgl: mapboxgl,
  })
);

var nav = new mapboxgl.NavigationControl();
map.addControl(nav, "top-left");

map.on("load", function () {
  var legendEl = document.getElementById("legend");
  legendEl.addEventListener("click", function (e) {
    var value = e.target.innerHTML;
    filterMarkers(value);
  });

  map.addSource("towns-data", {
    type: "geojson",
    data: dataUrl,
  });

  map.addLayer(
    {
      id: "towns",
      type: "circle",
      source: "towns-data",
      paint: {
        "circle-color": [
          "case",
          ["has", "confirmed"],
          [
            "step",
            ["get", "confirmed"],
            "hsl(0, 0%, 82%)",
            1,
            "#ffc6c6",
            2,
            "#ff9999",
            3,
            "#ff5e5e",
            4,
            "#ff2b2b",
            8,
            "hsl(0, 0%, 17%)",
            9,
            "#000000",
          ],
          "#990000",
        ],
        "circle-radius": 6,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
        "circle-opacity": 0.75,
      },
    },
    "settlement-subdivision-label"
  );

  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  var confirmedDescription = {
    0: "Don't know",
    1: "Unlikely",
    2: "Possible",
    3: "Probable",
    4: "Surely",
    8: "Always biracial",
    9: "Black Town or Township",
    undefined: "Don't know",
    null: "Don't know",
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

  map.on("mouseenter", "towns", function (e) {
    map.getCanvas().style.cursor = "pointer";
    var coordinates = e.features[0].geometry.coordinates.slice();
    var features = map.queryRenderedFeatures(e.point);
    var id = features[0].id;
    var name = features[0].properties.name;
    var state = features[0].properties.state;
    var confirmed = features[0].properties.confirmed;
    var ordinance = features[0].properties.ordinance;
    var sign = features[0].properties.sign;

    popup
      .setLngLat(coordinates)
      .setHTML(
        name +
          ", " +
          state +
          "<br>" +
          `Confirmed: ${confirmedDescription[confirmed]}` +
          "<br><br>Click for more information"
      )
      .addTo(map);
    // window.open(`https://sundown.tougaloo.edu/sundowntownsshow.php?id=${id}`);
  });

  map.on("mouseleave", "towns", function () {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });

  map.on("click", "towns", function (e) {
    var features = map.queryRenderedFeatures(e.point);
    var id = features[0].id;
    window.open(`https://sundown.tougaloo.edu/sundowntownsshow.php?id=${id}`);
  });

  function filterMarkers(status) {
    var statusInt;

    switch (status) {
      case "Don't know":
        statusInt = 0;
        break;
      case "Unlikely":
        statusInt = 1;
        break;
      case "Possible":
        statusInt = 2;
        break;
      case "Probable":
        statusInt = 3;
        break;
      case "Surely":
        statusInt = 4;
        break;
      case "Always Biracial":
        statusInt = 8;
        break;
      case "Black Town or Township":
        statusInt = 9;
        break;
      case "Clear filter":
        statusInt = 10;
        break;
    }
    
    // if clear is cliked, clear, otherwise filter
    if (statusInt == 10) {
      map.setFilter("towns", null);
    } else {
      map.setFilter("towns", ["==", ["get", "confirmed"], statusInt]);
    }
  }
});
