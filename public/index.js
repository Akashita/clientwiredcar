/*


var soap = require('strong-soap').soap;
var url = 'http://127.0.0.1:8000/?wsdl';


soap.createClient(url, function(err, client) {
    client.get_electric_cars({}, function(err, result) {
        console.log(result.get_electric_carsResult);
    });
});
*/


const rest_api_url = "https://restwiredcar.herokuapp.com/traveltime";
const timeWithoutStop = 150;
const distance = 500;
const autonomy = 150;
const reloadTime = 30;

jQuery(function(){
    $.ajax({
        url: rest_api_url + "/" + distance + "/" + timeWithoutStop + "/" + autonomy + "/" + reloadTime,
        contentType: "application/json",
        dataType: "json",
        success: function(data){
            console.log(data);        
        }
    });
});