
var map;

// CARTE

function initMap() {
  $('butInitMap').remove()

  var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
  });

  var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
  });

  var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  })

  var baseLayers = {
    "Google Satellite": googleSat,
    "Google Streets": googleStreets,
    "Open Street Map": osm,
  };

  map = L.map('map', {
    center: [43.21959825045992, -0.04548622370199519],
    zoom: 15,
    layers: [googleSat]
  });

  L.control.layers(baseLayers).addTo(map);

  navigator.geolocation.watchPosition(updatePosition, errorUpdatingPosition)

  console.log("[map] Map initialised")
}


var marker, circle;

function updatePosition(pos) {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const accuracy = pos.coords.accuracy;

  if (marker) {
    map.removeLayer(marker);
    map.removeLayer(circle);
  }

  marker = L.marker([lat, lng]).addTo(map);
  marker.bindPopup("Your position");
  circle = L.circle([lat, lng], { radius: accuracy }).addTo(map)

  if ($('centerSelf').checked && autoCenter.checked) {
    map.flyToBounds(circle.getBounds());
  }
}

function errorUpdatingPosition(err) {
  if (err.code === 1) {
    alert("Please allow geolocation access")
  } else {
    console.log("Error getting current location. Error code: " + err.code)
  }
}

// Arduino

function onConnect_map() {
  if (!map && useGPS.checked) {
    initMap();
  }
}

function GPSUpdate(row) {
  // "GPS";fix;quality;time;date;locationlat;locationlng;speed;angle;altitude;satellites
  let res = row.split(";");
  if (res[0] == 'GPS') {
    res.shift();
    if (res[0]) {updateMap(res);}
  }
}

function updateMap(data) {
  $("fix").innerHTML = data[0];
  $("qual").innerHTML = data[1];
  $("GPStime").innerHTML = data[2];
  $("GPSdate").innerHTML = data[3];

  const lat = data[4];
  const lng = data[5];

  $("lat").innerHTML = lat;
  $("lng").innerHTML = lng;

  if (lat != 0 && lng != 0 && lat && lng) {
    var point = [lat, lng];
    var marker = L.marker(point).addTo(map);
    marker.bindPopup("GPS location at " + lat + lng);
    marker._icon.classList.add("GPSmarker");
    console.log("[map] Arduino GPS position updated")

    if ($('centerGPS').checked && autoCenter.checked) {
      map.flyTo(point);
    }
  }
}