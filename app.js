const express = require('express');
const app = express();
module.exports = app;

app.use(express.static(__dirname + '/public'));
app.use('/bs', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/jq', express.static(__dirname + '/node_modules/jquery/dist'));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    next();
});

app.use('/api/get-cars',(req,res) => {
    var soap = require('strong-soap').soap;
    var url = 'https://soapwiredcar.herokuapp.com/soapapi?wsdl';

    /*
    soap.createClient(url, function(err, client) {
        client.get_electric_cars({}, function(err, result) {
            console.log(result.get_electric_carsResult);
        });
       client.echo({str:"ergiue", cnt : 5}, function(err, result){
              console.log(result.echoResult);
       });
    });
    */
    var obj = [{"id":1,"name":"Tesla","range":200},{"id":2,"name":"BMW","range":300}];

    res.send(JSON.stringify(obj));
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});



//https://restwiredcar.herokuapp.com/traveltime/1500/500/150/30













/*
const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = process.env.PORT || 5000


app.use(express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));


app.get('/', (req, res) => {        //get requests to the root ("/") will route here
    res.sendFile('index.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser
                                                        //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`); 
});


var soap = require('strong-soap').soap;
var url = 'http://127.0.0.1:8000/?wsdl';


soap.createClient(url, function(err, client) {
    client.get_electric_cars({}, function(err, result) {
        console.log(result.get_electric_carsResult);
    });
});
*/