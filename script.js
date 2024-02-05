// Immutable data variables
let airportsData;
let flightsData;
let combinedFlights = [];

// Mutable variables
let flightsFiltered = [];
let airportsFiltered = [{ timestamp: "" }];

// Options used for rendering the filtered list
const filterValues = {
  source_airport: "any",
  destination_airport: "any",
  airline: "any",
  aircraft: "any",
};
const airportFilterValues = { city: "any", name: "any" };

async function loadData() {
  const airportsResponse = await fetch("./externalData/A2_Airports.json");
  airportsData = await airportsResponse.json();

  const flightsResponse = await fetch("./externalData/A2_Flights.json");
  flightsData = await flightsResponse.json();
}

async function combineData() {
  await loadData();

  flightsData.forEach((flight) => {
    combinedFlights.push({
      source_airport: findAirportById(flight.source_airport_id),
      destination_airport: findAirportById(flight.destination_airport_id),
      codeshare: flight.codeshare,
      aircraft: flight.aircraft,
      airline: {
        code: flight.airline,
        name: flight.airline_name,
        country: flight.airline_country,
      },
    });
  });
  buildDropdownLists();
}

function findAirportById(airportId) {
  let found_airport;

  airportsData.forEach((airport) => {
    if (airport.id === airportId) {
      found_airport = airport;
    }
  });
  return found_airport;
}

//////////////////////// DOM Manipulation /////////////////////////////

// Flight constants
const sourceAirportDropdown = document.getElementById(
  "filterSourceAirportSelect"
);
const destinationAirportDropdown = document.getElementById(
  "filterDestinationAirportSelect"
);
const airlineDropdown = document.getElementById("filterAirlineSelect");
const aircraftDropdown = document.getElementById("filterAircraftSelect");
const resultsCount = document.getElementById("results-count");
const flightsTableBody = document.getElementById("flights-table-body");

// Airport constants
const airportDataDropdown = document.getElementById("filterCitySelect");
const airportsTableBody = document.getElementById("airports-table-body");
const airportSearch = document.getElementById("filterSearchTermInput");

const airportDropdownListSet = new Set();
const airlineDropdownListSet = new Set();
const aircraftDropdownListSet = new Set();

let airportDropdownListArray;
let airlineDropdownListArray;
let aircraftDropdownListArray;

function buildDropdownLists() {
  airportsData.forEach((airport) => {
    airportDropdownListSet.add(airport.name);
    airportDropdownListArray = Array.from(airportDropdownListSet);
    airportDropdownListArray.sort();
  });

  // Removing duplicates in the lists
  combinedFlights.forEach((flight) => {
    airlineDropdownListSet.add(flight.airline.name);

    if (flight.aircraft.length === 1) {
      aircraftDropdownListSet.add(flight.aircraft[0]);
    } else {
      flight.aircraft.forEach((aircraft) =>
        aircraftDropdownListSet.add(aircraft)
      );
    }

    airlineDropdownListArray = Array.from(airlineDropdownListSet);
    aircraftDropdownListArray = Array.from(aircraftDropdownListSet);

    // Sort lists alphabetically
    airlineDropdownListArray.sort();
    aircraftDropdownListArray.sort();
  });

  createElements();
}

// Loop through the array and create HTML elements
function createElements() {
  // Flight data section
  populateSelect(sourceAirportDropdown, airportDropdownListArray);
  populateSelect(destinationAirportDropdown, airportDropdownListArray);
  populateSelect(airlineDropdown, airlineDropdownListArray);
  populateSelect(aircraftDropdown, aircraftDropdownListArray);

  // Airport data section
  populateSelect(airportDataDropdown, airportDropdownListArray);
  filterList(filterValues);
  filterList(airportFilterValues);
}

function filterList(filterValues) {
  if (filterValues.hasOwnProperty("city")) {
    airportsFiltered = airportsData.filter((airport) => {
      if ((filterValues.city === "any") & (filterValues.name === "any")) {
        return true;
      } else if (filterValues.city === "any" && filterValues.name !== "any") {
        return airport.name.toLowerCase().includes(filterValues.name, 0);
      }
      return airport.name === filterValues.city;
    });
    airportsFiltered.timestamp = `t-stamp:${new Date().getTime()}`;

    airportsTableBody.innerHTML = "";
    flightsTableBody.innerHTML = "";
    if (airportsFiltered.length === 0)
      airportsTableBody.innerHTML = "No Airport found.";
    console.log(airportsFiltered);
    renderList();
    return;
  }

  flightsFiltered = combinedFlights.filter((flight) => {
    // Check if the flight matches all filter values
    return Object.entries(filterValues).every(([filterKey, filterValue]) => {
      if (filterValue === "any") {
        return true; // Don't filter if 'any' is selected
      }
      return Object.values(flight[filterKey]).includes(filterValue);
    });
  });
  resultsCount.innerText = `Results: ${flightsFiltered.length}`;
  flightsTableBody.innerHTML = "";
  airportsTableBody.innerHTML = "";
  if (flightsFiltered.length === 0)
    flightsTableBody.innerHTML = "No flights found.";
  renderList();
}

function renderList() {
  flightsFiltered.forEach((flight) => {
    const { source_airport, destination_airport, airline, aircraft } = flight;

    const distance = calculateDistance(
      source_airport.latitude,
      source_airport.longitude,
      destination_airport.latitude,
      destination_airport.longitude
    );

    // Flight
    const flightTableRow = document.createElement("tr");
    const sourceAirportCell = flightTableRow.insertCell(0);
    const destinationAirportCell = flightTableRow.insertCell(1);
    const airlineCell = flightTableRow.insertCell(2);
    const aircraftCell = flightTableRow.insertCell(3);
    const distanceCell = flightTableRow.insertCell(4);

    flightsTableBody.appendChild(flightTableRow);
    sourceAirportCell.innerText = source_airport.name;
    destinationAirportCell.innerText = destination_airport.name;
    airlineCell.innerText = airline.name;

    aircraft.forEach((aircraft) => {
      const aircraftName = document.createElement("p");
      aircraftName.innerText = aircraft;
      aircraftCell.appendChild(aircraftName);
    });

    distanceCell.innerText = distance.toFixed(2);
  });

  airportsFiltered.forEach((airport) => {
    const {
      id,
      name,
      city,
      country,
      iata,
      latitude,
      longitude,
      altitude,
      timezone,
    } = airport;

    // Airport
    const airportTableRow = document.createElement("tr");
    const airportIdCell = airportTableRow.insertCell(0);
    const airportNameCell = airportTableRow.insertCell(1);
    const airportCityCell = airportTableRow.insertCell(2);
    const airportCountryCell = airportTableRow.insertCell(3);
    const airportIataCell = airportTableRow.insertCell(4);
    const airportLatitudeCell = airportTableRow.insertCell(5);
    const airportLongitudeCell = airportTableRow.insertCell(6);
    const airportAltitudeCell = airportTableRow.insertCell(7);
    const airportTimezoneCell = airportTableRow.insertCell(8);

    airportsTableBody.appendChild(airportTableRow);
    airportIdCell.innerText = id;
    airportNameCell.innerText = name;
    airportCityCell.innerText = city;
    airportCountryCell.innerText = country;
    airportIataCell.innerText = iata;
    airportLatitudeCell.innerText = latitude;
    airportLongitudeCell.innerText = longitude;
    airportAltitudeCell.innerText = altitude;
    airportTimezoneCell.innerText = timezone;
  });
}

function populateSelect(dropdownId, options) {
  dropdownId.addEventListener("change", () => {
    const key = dropdownId.name.slice(7); // This grabs the part of the string from the element to use as key
    if (key === "city") {
      // means we're in airport data
      airportFilterValues[key] = dropdownId.value;
      filterList(airportFilterValues);
    }

    if (
      key === "source_airport" ||
      key === "destination_airport" ||
      key === "airline" ||
      key === "aircraft"
    ) {
      filterValues[key] = dropdownId.value;
    }
    filterList(filterValues);
  });

  options.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText;
    option.text = optionText;
    dropdownId.appendChild(option);
  });
}

function filterSearch(search) {
  return airportsData.filter((airport) => {
    return airport.name.toLowerCase().includes(search, 0);
  });
}

let search = "";
// For searching the input field by typing
airportSearch.addEventListener("input", (e) => {
  search = e.target.value;
  airportFilterValues.name = search;
  filterList(airportFilterValues);
});

// Calculate distance between airports using - Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance;
}

async function findMinMaxAverage() {
  await combineData();
  const results = {
    minFlights: undefined,
    maxFlights: undefined,
    averageFlights: undefined,
  };

  // Use an array to reverse the flights and remove duplicate pairs
  const pairs = [];
  combinedFlights.forEach((flight) => {
    pairs.push([flight.source_airport.name, flight.destination_airport.name]);
  });

  // Tally the flights per flight pair
  const flightsTally = {};
  pairs.forEach((pair) => {
    if (
      !flightsTally.hasOwnProperty(pair) &&
      !flightsTally.hasOwnProperty(pair.reverse())
    ) {
      flightsTally[pair] = 0;
    }
    flightsTally[pair]++;
  });

  // Find min flights
  function findMin(callback) {
    // Pull the highest number of flights out
    const mostFlights = Object.values(callback())[0];
    let leastFlights;
    for (const pair in flightsTally) {
      if (flightsTally[pair] < mostFlights) {
        leastFlights = flightsTally[pair];
      }
    }
    return leastFlights;
  }

  // Find average flights
  function findAverage() {
    let numOfFlights = [];
    for (const pair in flightsTally) {
      numOfFlights.push(flightsTally[pair]);
    }
    return Math.round(
      numOfFlights.reduce((a, c) => a + c) / numOfFlights.length
    );
  }

  // Find the most flights
  function findMax() {
    let mostNumberOfFlights = 0;
    for (const pair in flightsTally) {
      if (flightsTally[pair] > mostNumberOfFlights) {
        mostNumberOfFlights = flightsTally[pair];
      }
    }

    // Find the Airports the match the flight count
    let mostFlights = {};
    for (const pair2 in flightsTally) {
      if (flightsTally[pair2] === mostNumberOfFlights) {
        mostFlights[pair2] = mostNumberOfFlights;
      }
    }
    return mostFlights;
  }

  results.minFlights = findMin(findMax);
  results.maxFlights = findMax();
  results.averageFlights = findAverage();

  return results;
}

findMinMaxAverage();
