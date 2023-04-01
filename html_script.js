const image = require("./assets/location.png")

const html_script = `

<!DOCTYPE html>
<html>
<head>
	
	<title>Quick Start - Leaflet</title>

	<meta charset="utf-8" />
	<meta name="viewport" content="initial-scale=1.0">
	
	<link rel="shortcut icon" type="image/x-icon" href="docs/images/favicon.ico" />
	
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css" integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ==" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js" integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew==" crossorigin=""></script>
	<link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css" />
	<script src="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js"></script>
	<script src="lrm-graphhopper.js"></script>
	<style>
	.leaflet-container {
		background: #000;
	}
	.leaflet-control-container .leaflet-routing-container-hide {
		display: none;
	}
	.leaflet-popup-content-wrapper, .leaflet-popup.tip {
		background-color: #1b1b1b;
		color: #fff;
	  }
	html body .leaflet-control-container .leaflet-top .leaflet-control-zoom a.leaflet-control-zoom-in { background-color: #121212;  color:#ebdbb2}
	a.leaflet-control-zoom-out {background-color:#121212; color:#ebdbb2;}
	a.leaflet-bottom {background-color:#121212; color:#ebdbb2;}
	
	</style>

</head>
<body style="padding: 0; margin: 0">


<div id="mapid" style="width: 100%; height: 100vh;"></div>
<script>

	var mymap = L.map('mapid', {zoomControl:false}).setView([38.447008, 27.148676], 8);
	mymap.attributionControl.setPrefix(false)

	var greenIcon = L.icon({
		iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Turkey_road_sign_T-15.svg/2335px-Turkey_road_sign_T-15.svg.png",
		
		iconSize:     [40, 40], // size of the icon
		iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
		popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
	});
	//L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
	L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=5709a21d-f2cf-44d9-9faa-1e4965438c20', {
		maxZoom: 18,
		//id: 'mapbox/dark-v11'
	}).addTo(mymap);

	mymap.on('click', (a)=>window.ReactNativeWebView.postMessage(a.latlng.lat.toString()+','+a.latlng.lng.toString()))

</script>

</body>
</html>

`

export default html_script