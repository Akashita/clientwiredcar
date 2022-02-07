
const rest_api_url = "https://restwiredcar.herokuapp.com/traveltime";
const soap_middleware_url = "/api/get-cars";
const getpath_middleware_url = "/api/get-path";
const getlocality_middleware_url = "/api/get-locality";



jQuery(function(){
    /*REST API ############################################*/
    const timeWithoutStop = 150;
    const distance = 500;
    const autonomy = 150;
    const reloadTime = 30;
    $.ajax({
        url: rest_api_url + "/" + distance + "/" + timeWithoutStop + "/" + autonomy + "/" + reloadTime,
        contentType: "application/json",
        dataType: "json",
        success: function(data){
        }
    });


    /*SOAP API ############################################*/

    fillFormResult("#searchCar", "#carResult", getpath_middleware_url);

    /*DEPARTURE ###########################################*/

    fillFormResult("#searchDeparture", "#departureResult", getlocality_middleware_url);

    /*ARRIVAL #############################################*/

    fillFormResult("#searchArrival", "#arrivalResult", getlocality_middleware_url);


    /*MAP #############################################*/

    var map;

    $('#submitCar').on('click', function(e){
        if(! $('#map').hasClass('active')){
            //Get node API
            $.ajax({
                url: getpath_middleware_url,
                contentType: "application/json",
                dataType: "json",
                success: function(data){
                    showMap(data['features'][0]);       
                },
                error: function(data){
                    console.log("ERROR" + data);
                }
            });

            
        }
    });

});



// #############################################################
//                  Functions
// #############################################################
function showMap(geojson){
    $( "#map" ).animate({
        height: "100vh",
      }, 300, function() {
        $('#map').addClass('active');

        map = L.map('map', {
            /*args*/
        });


        var pathLayer = L.geoJSON(geojson).addTo(map);
        map.fitBounds(pathLayer.getBounds());


        //Center the map on the path
        //map.fitBounds(geojson.getBounds());

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);


        L.scrollWheelZoom = false;
    
      });
      $( "html" ).animate({
        scrollTop: window.innerHeight,
      }, 300, function() {
        // Animation complete.
      });
}


function fillFormResult(searchId, resultId, middlewareUrl){
    $(searchId).on('keyup paste', function(e){
        var search_text = $(searchId).val();
        $.ajax({
            url: middlewareUrl,
            contentType: "application/json",
            dataType: "json",
            data: {
                text: search_text
            },
            success: function(data){
                if(data != false){
                    $(resultId).html("");
                    if(data.length == 0){
                        $(resultId).html("<div class=\"result\">No results</div>");
                    } else {
                        data.forEach(car => {
                            $(resultId).append("<div class=\"result\">" + car['name'] + "</div>");
                        });
                    }
                } else {
                    $(resultId).html("<div class=\"result\">Query issue</div>");
                }
                
            }
        });
    });
}
