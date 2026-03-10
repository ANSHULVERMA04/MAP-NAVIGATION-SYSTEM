
const map = L.map('mapid').setView([28.6139, 77.2090], 13);


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap contributors',
}).addTo(map);


const control = L.Routing.control({
  waypoints: [
    L.latLng(28.6139, 77.2090), 
    L.latLng(28.5355, 77.3910)   
  ],
  routeWhileDragging: true,
  show: false
}).addTo(map);


control.on('routesfound', function(e) {
  const routes = e.routes;
  const summary = routes[0].summary;

  const distanceInKm = (summary.totalDistance / 1000).toFixed(2); 
  const timeInMin = (summary.totalTime / 60).toFixed(2); 

  const infoBox = `
    <b>Route Details</b><br>
    📍 Distance: ${distanceInKm} km<br>
    🕒 Estimated Time: ${timeInMin} mins
  `;

  const midPoint = routes[0].coordinates[Math.floor(routes[0].coordinates.length / 2)];

  L.popup()
    .setLatLng(midPoint)
    .setContent(infoBox)
    .openOn(map);
});



L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap contributors',
}).addTo(map);




control.on('routesfound', function(e) {
  const routes = e.routes;
  const summary = routes[0].summary;

  const distanceInKm = (summary.totalDistance / 1000).toFixed(2); // convert meters to KM
  const timeInMin = (summary.totalTime / 60).toFixed(2); // convert seconds to minutes

  const infoBox = `
    <b>Route Details</b><br>
    📍 Distance: ${distanceInKm} km<br>
    🕒 Estimated Time: ${timeInMin} mins
  `;


  const midPoint = routes[0].coordinates[Math.floor(routes[0].coordinates.length / 2)];
  L.popup()
    .setLatLng(midPoint)
    .setContent(infoBox)
    .openOn(map);
});

const landmarks = [
  {
    name: "India Gate",
    lat: 28.6129,
    lng: 77.2295,
    description: "War memorial located in New Delhi.",
  },
  {
    name: "Red Fort",
    lat: 28.6562,
    lng: 77.2410,
    description: "Historic fort built in the 17th century.",
  },
  {
    name: "Akshardham Temple",
    lat: 28.6127,
    lng: 77.2773,
    description: "Hindu temple showcasing traditional architecture.",
  },
  {
    name: "Qutub Minar",
    lat: 28.5245,
    lng: 77.1855,
    description: "Tallest brick minaret in the world."
  }
];


landmarks.forEach(lm => {
  L.marker([lm.lat, lm.lng])
    .addTo(map)
    .bindPopup(`<b>${lm.name}</b><br>${lm.description}`);
});
