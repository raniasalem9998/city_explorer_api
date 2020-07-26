'use strict';

const server = require('express');
const cors = require('cors');
const { request } = require('express');
require('dotenv').config();

const app = server();
app.use(cors());

const PORT = process.env.PORT || 3000;


app.listen(PORT, ()=>{
    console.log('Server is listening to port ', PORT);
  });

  app.get('/', (request,response) => {
    response.status(200).send('This is the homepage');
    response.status(404).send('page not found');
    response.status(500).send('Internal server error');

  });

app.get('/location', (request,response) =>{
    const data = require('./data/location.json');
    let city = request.query.city;
    let locationData = new Location(city, data);
    response.send(locationData);
  });
  
function Location(city, data){
    this.search_query = city;
    this.formatted_query = data[0].display_name;
    this.latitude = data[0].lat;
    this.longitude = data[0].lon;
  }


//   ------
// this will give a new array for each location(element)
app.get('/weather', (request, response) => {
    const dataCall = require('./data/weather.json');
    let city = request.query.city;
    dataCall.data.forEach(element => {
        const date = new Date(element.valid_date);
        let time = date;
        new Weather(city, element, time.substr(0,15)
        );
    });
    response.send(Weather.all);
});

function Weather(city, data, date) {
    this.forecast = data.weather.description;
    this.time = date;
    Weather.all.push(this);
}
//will give each weather with all its properties
Weather.all = [];

