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
// {
//     "place_id": "222943963",
//     "licence": "https://locationiq.com/attribution",
//     "osm_type": "relation",
//     "osm_id": "237662",
//     "boundingbox": [
//       "47.802219",
//       "47.853569",
//       "-122.34211",
//       "-122.261618"
//     ],
//     "lat": "47.8278656",
//     "lon": "-122.3053932",
//     "display_name": "Lynnwood, Snohomish County, Washington, USA",
//     "class": "place",
//     "type": "city",
//     "importance": 0.61729106268039,
//     "icon": "https://locationiq.org/static/images/mapicons/poi_place_city.p.20.png"
//   }