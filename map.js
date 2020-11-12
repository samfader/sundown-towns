mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FtZiIsImEiOiJjaWZ3bGhtdjgzMnN1dWdrcnEwZTVieG91In0.DkCY-91coDahKvpH7Z26dw";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/samf/ckfguixbm2aee19ppd5s2d36l",
  center: [-99.829, 38.826],
  zoom: 3.8,
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
    data: "./towns.geojson",
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "towns-data",
    filter: ["has", "point_count"],
    paint: {
      // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
      // with three steps to implement three types of circles:
      //   * Blue, 20px circles when point count is less than 100
      //   * Yellow, 30px circles when point count is between 100 and 750
      //   * Pink, 40px circles when point count is greater than or equal to 750
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#51bbd6",
        100,
        "#f1f075",
        750,
        "#f28cb1",
      ],
      "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "towns-data",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  });

  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "towns-data",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 4,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });

  map.on("click", "clusters", function (e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    var clusterId = features[0].properties.cluster_id;
    map
      .getSource("towns-data")
      .getClusterExpansionZoom(clusterId, function (err, zoom) {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
  });

  map.on("click", "unclustered-point", function (e) {
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

  map.on("mouseenter", "clusters", function () {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", function () {
    map.getCanvas().style.cursor = "";
  });

  map.on("mouseenter", "unclustered-point", function () {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "unclustered-point", function () {
    map.getCanvas().style.cursor = "";
  });
});
