'use strict';
require('dotenv').config();
const server = require('express');
const cors = require('cors');
const { request } = require('express');
const superagent = require('superagent');
const app = server();
const pg = require('pg')
app.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);

const PORT = process.env.PORT || 3000;


app.get('/', (request, response) => {
  response.status(200).send('This is the homepage');
});

// -------------------------location-----------------------------//

app.get('/location', handleLocation);

function handleLocation(request, response) {
  let city = request.query.city;

  let APIKEY = process.env.GEOCODE_API_KEY;
  let url = `https://api.locationiq.com/v1/autocomplete.php?key=${APIKEY}&q=${city}&format=json?`;
  let selectSQL = `SELECT * FROM locations WHERE search_query = '${city}'`;

  client.query(selectSQL).then(result => {

    if (result.rowCount) {
      response.send(result);
    } else {

      return superagent.get(url).then(data => {
        let locationData = new Location(city, data.body);
        let queryvalues = [locationData.search_query, locationData.formatted_query, locationData.latitude, locationData.longitude];
        let SQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4);';

        client.query(SQL, queryvalues).then(location => {
          response.send(location)
        })

      })

    }

  })
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


//   -----------------------weather-------------------------- //

app.get('/weather', (request, response) => {
  let cityName = request.query.search_query;
  let APIKEY2 = process.env.WEATHER_API_KEY;
  // // if you wanted to use lat,lon(get them from the front end)
  // let lat = request.query.latitude;
  // let lon = request.query.longitude;
  let url2 = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${APIKEY2}`;

  // we knew the data.body.data from the api website disciption

  return superagent.get(url2).then((data) => {
    Weather.all = [];
    // or instead of putting new array put the map in const then 
    data.body.data.map(element => {
      // new date will give it with weather will give it with sec,min,hours
      const date = new Date(element.valid_date);
      let time = date.toString();
      return new Weather(cityName, element, time.substr(0, 15));
      // const weatherInfo=[];
      // new Weather (element);
      // weatherInfo.push(newWaether)
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

// another way
// function Weather (data){
//   this.forecast= data.weather.description;
//   this.time = data.vaild_date;
// }

// ------------------------trail------------------------- //

app.get('/trail', (request, response) => {
  let APIKEY3 = process.env.TRAIL_API_KEY;
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let url3 = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=50&key=${APIKEY3}`;

  return superagent.get(url3).then(data => {
    let arr = [];

      data.body.trails.map(element => {
      let trai = new Trail(element);
      array.push(trai);
      return arr;
      });

    response.send(arr);
  });

});



function Trail(data) {
  this.name = data.name;
  this.location = data.location;
  this.stars = data.stars;
  this.star_votes = data.star_votes;
  this.trail_url = data.trail_url;
  this.conditions = data.conditions;
  this.condition_date = trail.conditionDate.split(" ")[0];
  this.condition_time = trail.conditionDate.split(" ")[1];
}
// ------------------------------------------------- //

// for chaching its useless to save life data because its useless and will save alot of it.

// ----------------------movies--------------------------- //

// ------------------------------------------------- //


client.connect().then(() => {
  app.listen(PORT, () => {
    console.log('Server is listening to port ', PORT);
  });
});


app.all('*', (req, res) => {
  res.status(404).send('page not found');
  res.status(500).send('Internal server error');
});




