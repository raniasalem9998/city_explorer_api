'use strict';

const server = require('express');
const cors = require('cors');
const { request } = require('express');
require('dotenv').config();
const superagent = require('superagent');

const app = server();
app.use(cors());


const PORT = process.env.PORT || 3000;


app.get('/', (request, response) => {
  response.status(200).send('This is the homepage');


});


app.get('/location', handleLocation);

function handleLocation(request, response) {
  let city = request.query.city;
  getData(city).then(returnData => {
    response.send(returnData);
  });



  function getData(city) {
    let APIKEY = process.env.GEOCODE_API_KEY;
    let url = `https://api.locationiq.com/v1/autocomplete.php?key=${APIKEY}&q=${city}&format=json?`;
    return superagent.get(url).then(data => {
      let locationData = new Location(city, data.body);
      return locationData;
    })

  }
};
var loca = [];
function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
  loca.push(this.latitude)
  loca.push(this.longitude)
}


//   ------------------------------------------------- //

app.get('/weather', (request, response) => {
  // const dataCall = require('./data/weather.json');
  let cityName = request.query.search_query;
  let APIKEY2 = process.env.WEATHER_API_KEY;
  // let lat = loca[0];
  // let lon = loca[1];
  let url2 = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${APIKEY2}`;

  return superagent.get(url2).then((data) => {
    Weather.all = [];
    data.body.data.map(element => {
        const date = new Date(element.valid_date);
        let time = date.toString();
       return new Weather(cityName, element, time.substr(0,15));
    });
    response.send(Weather.all);
  });

});

function Weather(city, data, date) {
  this.search_query = city;
  this.forecast = data.weather.description;
  this.time = date;
  Weather.all.push(this);
}


app.listen(PORT, () => {
  console.log('Server is listening to port ', PORT);
});

//will give each weather with all its properties

app.all('*', (req, res) => {
  res.status(404).send('page not found');
  res.status(500).send('Internal server error');
});

// ------------------------------------------------- //
// Note that Heroku will need to have properly named 
// environment variables setup and populated with your API
//  keys so that it can fetch live data.

