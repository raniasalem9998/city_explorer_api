'use strict';

const server = require('express');
const cors = require('cors');
const { request } = require('express');
require('dotenv').config();
const superagent = require('superagent');

const app = server();
app.use(cors());


const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log('Server is listening to port ', PORT);
});

app.get('/', (request, response) => {
  response.status(200).send('This is the homepage');


});

var city;
app.get('/location', handleLocation);

function handleLocation(request, response) {
  // const data = require('./data/location.json');
   city = request.query.city;
  getData(city).then(returnData => {
    response.send(returnData);
  });



  function getData(city) {
    let APIKEY = process.env.APIKEY;
    let url = `https://api.locationiq.com/v1/autocomplete.php?key=${APIKEY}&q=${city}&format=json?`;
    return superagent.get(url).then(data => {
      let locationData = new Location(city, data.body);
      return locationData;
    })

  }
};
var loca=[];
function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
  loca.push(this.latitude)
  loca.push(this.longitude)
}


//   ------------------------------------------------- //
// app.get('/weather', (request, response) => {
//   const dataCall = require('./data/weather.json');
//   let city = request.query.city;
//   dataCall.data.forEach(element => {
//       const date = new Date(element.valid_date);
//       let time = date.toString();
//       new Weather(city, element, time.substr(0,15)
//       );
//   });
//   response.send(Weather.all);
// });


app.get('/weather', handleWeather);
function handleWeather(request, response){
  // const dataCall = require('./data/weather.json');
  Weather.all = [];
  // let city = request.query.search_query;
  getData2(city).then(returnData => {
    response.send(returnData);
  });

  function getData2(city){
    let APIKEY2 = process.env.APIKEY2;
    let lat = loca[0];
    let lon = loca[1];
    // let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city},NC&key=${APIKEY2}`;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon},NC&key=${APIKEY2}`;

      return superagent.get(url).then(data =>{
        data.map(element => {
          let time = element.valid_date;
          let newWeather = new Weather(city, element, time);
          console.log(newWeather)
          return newWeather;
        });

      });

  };
  

};

function Weather(city, data, date) {
  this.forecast = data.weather.description;
  this.time = date;
  Weather.all.push(this);
}
//will give each weather with all its properties

app.all('*', (req, res) => {
  res.status(404).send('page not found');
  res.status(500).send('Internal server error');
})



// ------------------------------------------------- //
// Note that Heroku will need to have properly named 
// environment variables setup and populated with your API
//  keys so that it can fetch live data.

