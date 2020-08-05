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
      response.send(result.rows[0]);
    } else {

      return superagent.get(url).then(data => {
        let locationData = new Location(city, data.body);
        let queryvalues = [locationData.search_query, locationData.formatted_query, locationData.latitude, locationData.longitude];
        let SQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4);';

         client.query(SQL, queryvalues).then(location => {
          // response.send(location);
          return location;
        })
        response.send(locationData);
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
  this.country_code = data[0].address.country_code.toUpperCase();
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

app.get('/trails', (request, response) => {
  let APIKEY3 = process.env.TRAIL_API_KEY;
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let url3 = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=50&key=${APIKEY3}`;

  return superagent.get(url3).then(data => {
    let arr = [];

      data.body.trails.map(element => {
      let trai = new Trail(element);
      arr.push(trai);
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
  this.condition_date = data.conditionDate.split(" ")[0];
  this.condition_time = data.conditionDate.split(" ")[1];
}


// for chaching its useless to save life data because its useless and will save alot of it.

// ----------------------movies--------------------------- //
app.get('/movies', (request, response) => {
  let APIKEY4 = process.env.MOVIE_API_KEY;
  let region = request.query.country_code;
  let url4 = `https://api.themoviedb.org/3/discover/movie?api_key=${APIKEY4}&certification_country=${region}`;
  // let url4 = 'http://api.themoviedb.org/3/discover/movie?primary_release_date.gte=2014-09-15&primary_release_date.lte=2014-10-22&api_key=44502dd5ab95f4b1c9252315f2e882c5';

  return superagent.get(url4).then(data => {
    let arr = [];

      data.body.results.map(element => {
      let movie = new Movie(element);
      arr.push(movie);
      return arr;
      });

    response.send(arr);
  });

});



function Movie(data) {
  this.title = data.title;
  this.overview = data.overview;
  this.average_votes = data.vote_average;
  this.image_url =  `https://image.tmdb.org/t/p/w500${data.poster_path}`;
  this.popularity = data.popularity;
  this.released_on = data.release_date;
}

// ----------------------YELP--------------------------- //

app.get('/yelp', (request, response) => {
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let url5 = `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lon}`;
  return superagent.get(url5).then(data => {
    let arr = [];

      data.body.businesses.map(element => {
      let res = new Restaurants(element);
      arr.push(res);
      return arr;
      });

    response.send(arr);
  });

});



function Restaurants(data) {
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.price;
  this.rating = data.rating;
  this.url = data.url;
}



client.connect().then(() => {
  app.listen(PORT, () => {
    console.log('Server is listening to port ', PORT);
  });
});


app.all('*', (req, res) => {
  res.status(404).send('page not found');
  res.status(500).send('Internal server error');
});




