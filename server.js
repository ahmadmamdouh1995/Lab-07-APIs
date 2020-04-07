'use stric';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT;
const app = express();
app.use(cors());

app.get('/', (request, response) => {
    response.send('Home Page!');
});
// app.get('/bad', (request, response) => {
//     throw new Error('oh nooo!');
// });

app.get('/location', locationHand);
app.get('/weather', weatherHand);
app.get('/trails', trialhand);
app.use('*', notFoundHandler);
app.use(errorHandler);



function locationHand(request, response) {
    const city = request.query.city;
    superagent(`https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`)
        .then((res) => {
            const geoData = res.body;
            const locationData = new Location(city, geoData);
            response.status(200).json(locationData);
        })
        .catch((error) => errorHandler(error, request, response));

};


function Location(city, geoData) {
    this.search_query = city;
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
}

function weatherHand(request, response) {
    superagent(`https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${process.env.WEATHER_API_KEY}`)
        .then((weatherData) => {
            console.log(weatherData);


            const weatherSum = weatherData.body.data.map((day) => {
                return new Weather(day);
            });
            response.status(200).json(weatherSum);
        })
        .catch((error) => errorHandler(error, request, response));
}

function Weather(day) {
    // this.search_query = weather;
    this.forecast = day.weather.description;
    this.time = new Date(day.valid_date).toDateString();
}

function trialhand(request, response) {
    // request.query.latitude;
    // const lan = 39.9787;
    // const long =-105.2755 ;
    // const long = request.query.longitude;
    //  console.log(lan);
    // console.log(long);
    superagent(`https://www.hikingproject.com/data/get-trails?lat=${request.query.latitude}&lon=${request.query.longitude}&maxDistance=1000&key=${process.env.TRAILS_API_KEY}`)
        .then((trailData) => {
            console.log(trailData);

            const trailSum = trailData.body.trails.map((trail) => {
                return new Trails(trail);
            });
            response.status(200).json(trailSum);
        })
        .catch((error) => errorHandler(error, request, response));
}

function Trails(trail) {
    this.name = trail.name;
    this.summary = trail.summary;
    this.location = trail.location;
    // this.lon = trail.longitude;
    // this.lat = trail.latitude;

}

function notFoundHandler(request, response) {
    response.status(404).send('NOT FOUND!!');
}
function errorHandler(error, request, response) {
    response.status(500).send(error);
}

app.listen(PORT, () => console.log(`the server is up and running on ${PORT}`));
