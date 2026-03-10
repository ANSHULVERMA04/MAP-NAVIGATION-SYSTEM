const map = L.map('mapid').setView([28.6139, 77.2090], 13);


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const landmarks = [
  { name: "India Gate", lat: 28.6129, lng: 77.2295, description: "War memorial located in New Delhi." },
  { name: "Red Fort", lat: 28.6562, lng: 77.2410, description: "Historic fort built in the 17th century." },
  { name: "Akshardham Temple", lat: 28.6127, lng: 77.2773, description: "Hindu temple showcasing traditional architecture." },
  { name: "Qutub Minar", lat: 28.5245, lng: 77.1855, description: "Tallest brick minaret in the world." }
];

landmarks.forEach(lm => {
  const marker = L.marker([lm.lat, lm.lng]).addTo(map);
  
  const popupContent = `
    <b>${lm.name}</b><br>
    ${lm.description}<br>
    <button onclick="selectDestination('${lm.lat}', '${lm.lng}', '${lm.name}')">Go Here</button>
  `;
  
  marker.bindPopup(popupContent);
});


async function getCoordinates(address) {
  const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
  if (res.data.length > 0) {
    return {
      lat: parseFloat(res.data[0].lat),
      lng: parseFloat(res.data[0].lon)
    };
  } else {
    throw new Error("Address not found");
  }
}

function selectDestination(lat, lng, name) {
  const destInput = document.getElementById('destination');
  destInput.value = `${lat},${lng}`;
  alert(`Destination set to ${name}.\nClick "Get Routes" to navigate.`);
}


const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjUxNGVhZjk3N2FiZDQ2MGI4N2E3OGQxOThkYjRjODkwIiwiaCI6Im11cm11cjY0In0='; 

async function getRoutes() {
  const srcText = document.getElementById('source').value;
  const destText = document.getElementById('destination').value;

  const src = await getCoordinates(srcText);
  const dest = await getCoordinates(destText);

  const orsUrl = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

  const response = await axios.post(orsUrl, {
    coordinates: [[src.lng, src.lat], [dest.lng, dest.lat]]
  }, {
    headers: {
      'Authorization': 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjUxNGVhZjk3N2FiZDQ2MGI4N2E3OGQxOThkYjRjODkwIiwiaCI6Im11cm11cjY0In0=',
      'Content-Type': 'application/json'
    }
  });

  const route = response.data;

  // Draw the route on the map
  if (window.routeLine) {
    map.removeLayer(window.routeLine);
  }


  window.routeLine = L.geoJSON(route, {
    style: { color: 'blue', weight: 5 }
  }).addTo(map);

  // Zoom to route bounds
  const bounds = L.geoJSON(route).getBounds();
  map.fitBounds(bounds);

  // Get distance and duration
  const summary = route.features[0].properties.summary;
  const distanceInKm = (summary.distance / 1000).toFixed(2);
  const timeInMin = (summary.duration / 60).toFixed(2);

  document.getElementById('results').innerHTML = `
    <h3>Route Details</h3>
    📍 <b>Distance:</b> ${distanceInKm} km<br>
    🕒 <b>Estimated Time:</b> ${timeInMin} mins
  `;
}
let userMarker = null;
let userPath = [];
let polyline = null;

function startLiveTracking() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.watchPosition(position => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    // Add current position to path
    userPath.push([lat, lng]);

    // If first time, create the marker
    if (!userMarker) {
      userMarker = L.marker([lat, lng], { icon: L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      }) }).addTo(map).bindPopup("You are here").openPopup();
    } else {
      userMarker.setLatLng([lat, lng]);
    }

    // Draw path
    if (polyline) {
      map.removeLayer(polyline);
    }
    polyline = L.polyline(userPath, { color: 'red' }).addTo(map);

    // Center map on user
    map.setView([lat, lng]);
  }, err => {
    alert("Unable to retrieve location: " + err.message);
  }, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 100000
  });
}

// 👉 Paste your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyA5SdgcSSB_oG73RcH1oKq3_XiRUDKc5H0",
  authDomain: "your-app.firebaseapp.com",
  databaseURL: "https://your-app.firebaseio.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:62762795445:web:c3c6f30cc2965563cf59fc"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();



// View Live Location of Friend
function viewLocation() {
  const friendId = prompt("Enter your friend's username (e.g. anshul123):");

  db.ref("locations/" + friendId).on("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;

    const { lat, lng } = data;
    if (!liveMarker) {
      liveMarker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })
      }).addTo(map).bindPopup("Friend's Live Location").openPopup();
    } else {
      liveMarker.setLatLng([lat, lng]);
    }

    map.setView([lat, lng]);
  });
}

const userId = generateRandomId();
const shareURL = `${window.location.origin}?track=${userId}`;
L.marker([lat, lng])
  .addTo(map)
  .bindPopup(`<b>Your Live Location</b><br><a href="${shareURL}" target="_blank">📤 Share this link</a>`)
  .openPopup();


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let myMarker = null;

function startSharing() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      
      if (!myMarker) {
        myMarker = L.marker([lat, lng])
          .addTo(map)
          .bindPopup("📍 You are here")
          .openPopup();
      }
      
      else {
        myMarker.setLatLng([lat, lng]);
      }

      
      map.setView([lat, lng], 15);
    },
    (err) => {
      alert("Location error: " + err.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 100000
    }
  );
}

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

     
      const userMarker = L.marker([lat, lng]).addTo(map)
        .bindPopup("📍 You are here")
        .openPopup();

      
      map.setView([lat, lng], 15);
    },
    (err) => {
      alert("Location error: " + err.message);
    }
  );
} else {
  alert("Geolocation is not supported by your browser.");
}