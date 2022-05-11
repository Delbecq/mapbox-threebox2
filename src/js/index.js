import { Threebox } from "threebox-plugin";
import "../../dist/mapbox-gl.css";
//- Built-in sunlight through 'realSunlight' that sets the scene and map lights based on 'setSunlight'
//- Built-in shadows through 'castShadow' and 'tb.setBuildingShadows'

let mapConfig = {
  NYC: {
    origin: [-74.044514, 40.689259, 39],
    center: [-74.0137, 40.70346, 0],
    zoom: 16.2,
    pitch: 60,
    bearing: -10,
    scale: 44,
    timezone: "America/New_York"
  }
};
var config = {
  accessToken:
    "pk.eyJ1IjoiYWtzaGF5c3NoZXR0eSIsImEiOiJja3dwNDM0bnowOTM0MnZwM2xrYjhhczBlIn0.4-WjWGJlT4EFoSUpTF8W1g"
};

if (!config)
  console.error(
    "Config not set! Make a copy of 'config_template.js', add in your access token, and save the file as 'config.js'."
  );

mapboxgl.accessToken = config.accessToken;

let point = mapConfig.NYC;
let hour = document.getElementById("hour");

let styles = {
  day: "streets-v11",
  night: "dark-v10"
};
let selectedStyle = styles.day;

var map = new mapboxgl.Map({
  style: "mapbox://styles/mapbox/" + selectedStyle, //'mapbox://styles/mapbox/streets-v11',
  center: point.center,
  zoom: point.zoom,
  pitch: point.pitch,
  bearing: point.bearing,
  container: "map",
  antialias: true,
  hash: true
});

window.tb = new Threebox(map, map.getCanvas().getContext("webgl"), {
  realSunlight: true
});

let date = new Date(2021, 11, 6, 15, 3);
let time = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
let timeInput = document.getElementById("time");
timeInput.value = time;
timeInput.oninput = () => {
  time = +timeInput.value;
  date.setHours(Math.floor(time / 3600));
  date.setMinutes(Math.floor(time / 60) % 60);
  date.setSeconds(time % 60);
  map.triggerRepaint();
};

function dateToTimezone(date = new Date(), timezone) {
  let tzTime = date.toLocaleString("en-US", { timeZone: timezone });
  return new Date(tzTime);
}

map.addControl(new mapboxgl.NavigationControl());

// let stats;
// import Stats from 'https://threejs.org/examples/jsm/libs/stats.module.js';
// function animate() {
// 	requestAnimationFrame(animate);
// 	stats.update();
// }

map.on("style.load", () => {
  //// stats
  // stats = new Stats();
  // map.getContainer().appendChild(stats.dom);
  // animate();

  if (map.getLayer("building")) {
    map.removeLayer("building");
  }
  if (map.getSource("composite")) {
    map.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": "#ddd",
          "fill-extrusion-height": ["number", ["get", "height"], 5],
          "fill-extrusion-base": ["number", ["get", "min_height"], 0],
          "fill-extrusion-opacity": 1
        }
      },
      "road-label"
    );
  }

  tb.setBuildingShadows({
    layerId: "building-shadows",
    buildingsLayerId: "3d-buildings",
    minAltitude: 0.1
  });
});

map.on("render", () => {
  tb.setSunlight(date);
  let dateTZ = dateToTimezone(date, point.timezone);
  hour.innerHTML = "Sunlight on date/time: " + dateTZ.toLocaleString();
  changeStyleWithDaylight(date, point.center);
});

let loaded = false;
map.on("idle", () => {
  if (!loaded) {
    map.flyTo({
      center: point.center,
      zoom: point.zoom,
      pitch: point.pitch,
      bearing: point.bearing
    });
    loaded = true;
  }
});

function changeStyleWithDaylight(date, origin) {
  let sunTimes = tb.getSunTimes(date, origin);
  if (date >= sunTimes.sunriseEnd && date <= sunTimes.sunsetStart) {
    if (selectedStyle != styles.day) {
      console.log("it's day");
      tb.setStyle("mapbox://styles/mapbox/" + styles.day);
      selectedStyle = styles.day;
    }
  } else {
    if (selectedStyle != styles.night) {
      console.log("it's night");
      tb.setStyle("mapbox://styles/mapbox/" + styles.night);
      selectedStyle = styles.night;
    }
  }
}
