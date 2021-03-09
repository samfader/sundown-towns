mapboxgl.accessToken =
  "pk.eyJ1IjoiamxvZXdlbiIsImEiOiJja2xndmR4bTQ1NXcxMnZ1aXNqaWo4ZHpyIn0.8dx0t2m15JltIuCf25x7FA";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/jloewen/cklgvceam6dr117rz6clq3pf1",
  center: [-96.829, 38.826],
  zoom: 4.3,
  pitchWithRotate: false,
  dragRotate: false,
  maxBounds: [
    [-135.78125, 22.367113562651262],
    [-66.17187499999999, 50.90303283111257],
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
      // filter: [
      //   "all",
      //   [
      //     "match",
      //     ["get", "showcase"],
      //     [0],
      //     true,
      //     false
      //   ]
      // ],
      paint: {
        "circle-color": [
          "case",
          ['!=', ['get', 'confirmed'], null],
          [
              "interpolate",
              ["linear"],
              ["get", "confirmed"],
              0,
              "#d1d1d1",
              1,
              "#545454",
              2,
              "#ffc6c6",
              3,
              "#ff5e5e",
              4,
              "#c20d0d",
              8,
              "#545454",
              9,
              "#000000"
          ],
          [
              "match",
              ["get", "confirmed"],
              ["0", "1", "2", "3", "4", "8", "9"],
              false,
              true
          ],
          "hsl(0, 0%, 82%)",
          "hsl(0, 100%, 57%)"
      ],
        "circle-radius": 6,
        "circle-stroke-width": 1,
        "circle-stroke-color": [
          "case",
          ['!=', ['get', 'confirmed'], null],
          [
              "interpolate",
              ["linear"],
              ["get", "confirmed"],
              0,
              "hsl(0, 0%, 47%)",
              1,
              "hsl(0, 28%, 10%)",
              2,
              "hsl(0, 100%, 62%)",
              3,
              "hsl(0, 100%, 44%)",
              4,
              "hsl(0, 88%, 20%)",
              8,
              "hsl(0, 0%, 9%)",
              9,
              "#000000",
          ],
          [
              "match",
              ["get", "confirmed"],
              ["0", "1", "2", "3", "4", "8", "9"],
              false,
              true
          ],
          "hsl(0, 0%, 47%)",
          "hsl(0, 100%, 57%)"
      ],
        "circle-opacity": 0.75,
      },
    }
  );

  map.addLayer(
    {
      id: "towns-showcase",
      type: "symbol",
      source: "towns-data",
      filter: [
        "all",
        [
          "match",
          ["get", "showcase"],
          [1],
          true,
          false
        ]
      ],
      "layout": {
        "icon-image": "flag",
        "icon-size": 0.3
    },
    }
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

  // these are the towns that are NOT featured with flags
  map.on("mouseenter", "towns", function (e) {
    map.getCanvas().style.cursor = "pointer";
    var coordinates = e.features[0].geometry.coordinates.slice();
    var features = map.queryRenderedFeatures(e.point);
    // var id = features[0].id;
    var name = features[0].properties.name;
    var state = features[0].properties.state;
    var confirmed = features[0].properties.confirmed;
    // var ordinance = features[0].properties.ordinance;
    // var sign = features[0].properties.sign;

    popup
      .setLngLat(coordinates)
      .setHTML(
        name +
          ", " +
          state +
          "<br>" +
          `Sundown? ${confirmedDescription[confirmed]}` +
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

  // these are the towns that are featured with flags
  map.on("mouseenter", "towns-showcase", function (e) {
    map.getCanvas().style.cursor = "pointer";
    var coordinates = e.features[0].geometry.coordinates.slice();
    var features = map.queryRenderedFeatures(e.point);
    // var id = features[0].id;
    var name = features[0].properties.name;
    var state = features[0].properties.state;
    var confirmed = features[0].properties.confirmed;
    // var ordinance = features[0].properties.ordinance;
    // var sign = features[0].properties.sign;

    popup
      .setLngLat(coordinates)
      .setHTML(
        name +
          ", " +
          state +
          "<br>" +
          `Sundown? ${confirmedDescription[confirmed]}` +
          "<br><br>Click for more information"
      )
      .addTo(map);
    // window.open(`https://sundown.tougaloo.edu/sundowntownsshow.php?id=${id}`);
  });

  map.on("mouseleave", "towns-showcase", function () {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });

  map.on("click", "towns-showcase", function (e) {
    var features = map.queryRenderedFeatures(e.point);
    var id = features[0].id;
    window.open(`https://sundown.tougaloo.edu/sundowntownsshow.php?id=${id}`);
  });

  function filterMarkers(status) {
    console.log("status is ", status);
    var statusInt;

    switch (status) {
      case "Don't know":
        statusInt = 0;
        break;
      case "Unlikely/Always Biracial":
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
      case "Black Town":
        statusInt = 9;
        break;
      case "Clear filter":
        statusInt = 10;
        break;
    }

    // if clear is cliked, clear, otherwise filter
    if (statusInt == 10) {
      map.setLayoutProperty('towns-showcase', 'visibility', 'visible');
      map.setFilter("towns", null);
    } else {
      map.setLayoutProperty('towns-showcase', 'visibility', 'none');
      map.setFilter("towns", ["==", ["get", "confirmed"], statusInt]);
    }
  }
});
