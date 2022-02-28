const express = require('express');
const axios = require('axios');
const turf = require('@turf/turf');
const { json } = require('express');
const app = express();
module.exports = app;

app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use('/bs', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/jq', express.static(__dirname + '/node_modules/jquery/dist'));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    next();
});

app.post('/api/get-cars',(req,res) => {
    if(req.body != null && req.body.search_text){
        var text = req.body.search_text;
        var soap = require('strong-soap').soap;
        var url = 'https://soapwiredcar.herokuapp.com/soapapi?wsdl';
        try {
            soap.createClient(url, function(err, client) {
                client.getCars({str:text}, function(err, result){
                    var cars = [];
                    JSON.parse(result.getCarsResult).forEach(element => {
                        cars.push({name: element.model, props: element});
                    });
                    res.send(cars);
                });
            });
        } catch (error) {
            res.send(false);
        }
    } else {
        res.send(false);
    }
});

app.post('/api/get-path',(req,res) => {
    if(Object.keys(req.body).length === 0 && req.body.constructor === Object){
        res.status(400).send(false);
    } else {
        var coordArray = [req.body.departureProps, req.body.arrivalProps];

        const delta = 20; //delta of kilometers to keep a margin of error
        var carAutonomy = req.body.carAutonomy - delta;

        var dataRoute = {"coordinates": coordArray};
        const urlRoute = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
        const configRoute = {
            headers: {
                Authorization:  "5b3ce3597851110001cf6248118c93613b444126b3434702f7925bed",
                Accept: "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
                'Content-Type': "application/json; charset=utf-8",
    
            }
        }
        axios.post(urlRoute, dataRoute, configRoute).then(async function(response) {
            var line = response.data['features'][0];
            var it = Math.floor(turf.length(line, 'kilometers') / carAutonomy);

            const radius = 50;
            const urlBornes = "https://opendata.reseaux-energies.fr/api/records/1.0/search/";
            const configBornes = {
                headers: {
                    Authorization:  "e80cbbd8b5b39d95eaeb95bad16178e7e6da64f17ee430bc6608c538",
                    Accept: "application/json, charset=utf-8"
                }
            }

            var bornes = [];
            var bornesCoords = [];

            for(var i = 1; i <= it; i++){
                var point = turf.along(line, i * carAutonomy, 'kilometers');
                const dataBornes = {
                    params: {
                        dataset: "bornes-irve",
                        'geofilter.distance': point.geometry.coordinates[1] + "," + point.geometry.coordinates[0] + "," + radius*1000,
                    }
                };
                try{
                    await axios.get(urlBornes, dataBornes, configBornes).then(response => {
                        var shortestBorneFeature = response.data.records[0];
                        var shortestBorneCoords = shortestBorneFeature.geometry.coordinates;

                        response.data.records.forEach(function(record){
                            if(turf.distance(record.geometry.coordinates, point, 'kilometers') < turf.distance(shortestBorneCoords, point, 'kilometers')){
                                shortestBorneFeature = record;
                                shortestBorneCoords = shortestBorneFeature.geometry.coordinates;
                            }
                        });
                        bornes.push(shortestBorneFeature);
                        bornesCoords.push(shortestBorneCoords);
                    }).catch(error => {
                        console.log(error);
                    });
                } catch(error){
                    console.log(error);
                }

            }
            dataRoute = {"coordinates": [coordArray[0]].concat(bornesCoords).concat([coordArray[1]])};
            axios.post(urlRoute, dataRoute, configRoute).then(response => {
                res.send(JSON.stringify([response.data, bornes]));
            }).catch(error => {
                console.log(error);
                res.status(400).send(false);
            });
        }).catch(error => {   
            console.log(error);     
            res.status(400).send(false);
        });
    }

});


app.post('/api/get-locality',(req,res) => {

    if(req.body != null && req.body.search_text){
        var text = req.body.search_text;
        const url = "https://api.openrouteservice.org/geocode/search";
        const data = {
            params: {
                api_key: "5b3ce3597851110001cf6248118c93613b444126b3434702f7925bed",
                text: text,
                layers: "address,locality"
            }
        }
        axios.get(url, data).then(response => {
            var response_data = [];
            response.data.features.forEach(feature => {
                locality = {
                    "name": feature.properties.label,
                    "props": feature.geometry.coordinates,
                }
                response_data.push(locality);
            });
            res.send(JSON.stringify(response_data));
        }).catch(error => {  
            console.log(error);
            res.send(false);      
        });
    } else {
        res.send(false);
    }

});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
