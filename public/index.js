
const rest_api_url = "https://restwiredcar.herokuapp.com/traveltime";
const soap_middleware_url = "/api/get-cars";
const getpath_middleware_url = "/api/get-path";
const getlocality_middleware_url = "/api/get-locality";

var currentMap = undefined;


jQuery(function(){
    /*SOAP API ############################################*/

    fillFormResult("#searchCar", "#carResult", soap_middleware_url);

    /*DEPARTURE ###########################################*/

    fillFormResult("#searchDeparture", "#departureResult", getlocality_middleware_url);

    /*ARRIVAL #############################################*/

    fillFormResult("#searchArrival", "#arrivalResult", getlocality_middleware_url);

    //debugShowMap();

    /*MAP #############################################*/

    $('#submitForm').on('click', function(e){
        var carProps = $('#searchCar').attr('data-props');
        var departureProps = $('#searchDeparture').attr('data-props');
        var arrivalProps = $('#searchArrival').attr('data-props');

        if(!carProps){
            showToast("Error", "Please select a car", false);
        }
        if(!departureProps){
            showToast("Error", "Please select a departure", false);
        }
        if(!arrivalProps){
            showToast("Error", "Please select an arrival", false);
        }
        if(carProps && departureProps && arrivalProps){
            $("#submitForm").find('svg').hide("fast", function(){
                $("#submitForm").prop('disable',true);
                $("#submitForm").find('div').show("fast");
            });
            carProps = JSON.parse(carProps);
            departureProps = JSON.parse(departureProps);
            arrivalProps = JSON.parse(arrivalProps);
            $.ajax({
                method: 'POST',
                url: getpath_middleware_url,
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify({"departureProps": departureProps, "arrivalProps": arrivalProps, "carAutonomy": carProps.autonomy}),
                success: function(data){
                    $('.card').css('opacity', '0');

                    showMap(data[0]['features'][0], data[1]);
                },
                error: function(data){
                    showToast("Query issues", data.responseText, false);
                    clearForm();
                }
            });
        }
    });

    $('.resultContainer').on('click', '.result', function(){
        var props = $(this).attr('data-props');
        var name = $(this).text();
        $(this).parent().prev().val(name);
        $(this).parent().prev().attr('data-props', props);
    });

    $('.search-bar').on('focus', function(e){
        $(this).next().fadeIn('fast');
    });

    $('.search-bar').on('focusout', function(e){
        $(this).next().fadeOut('fast');
    });

});

function debugShowMap(){
    $( "#map" ).animate({
        height: "100vh",
      }, 300, function() {
        if(currentMap == undefined){
            currentMap = L.map('map', {
                /*args*/
            });
        }
      $( "html" ).animate({
        scrollTop: window.innerHeight,
      }, 300, function() {
        // Animation complete.
      });
    });
}

// #############################################################
//                  Functions
// #############################################################
function showMap(geojson, bornes){
    $( "main" ).animate({
        height: "100vh",
      }, 300, function() {
        if(currentMap == undefined){
            currentMap = L.map('map', {
                gestureHandling: true,
            });
        } else {
            currentMap.eachLayer(function(layer){
                currentMap.removeLayer(layer);
            });
            $('.card').css('opaicty', '0');
        }
        //#################  JOURNEY CARD GENERATION #######################

        var jcard = $('#journeyCard');
        jcard.find('#journeyDeparture').html("<b>Departure :</b> " + $('#searchDeparture').val());
        jcard.find('#journeyArrival').html("<b>Arrival : </b>" + $('#searchArrival').val());

        //#################  REST API #######################

        var timeWithoutStop = parseInt(geojson.properties.summary.duration); //In seconds
        var stops = bornes.length;
        var reloadTime = parseInt(JSON.parse($('#searchCar').attr('data-props')).chargingtime) //In seconds
        $.ajax({
            url: rest_api_url + "/" + stops + "/" + timeWithoutStop  + "/" + reloadTime,
            contentType: "application/json",
            dataType: "json",
            success: function(data){
                $('#journeyTime').html("<b>Travel time (with stops) : </b>" + data.traveltime);
                jcard.animate({
                    opacity: "1",
                    }, 300);

                    //#################  CAR CARD GENERATION #######################
                    var cCard = $('#carCard');

                    var img = cCard.find('.card-img-top');

                    img.on('load',function(){
                        $('#carCard').animate({
                            opacity: "1",
                            }, 300);
                    });

                    var carProps = JSON.parse($('#searchCar').attr('data-props'));
                    cCard.find('#carModel').html("<b>Model : </b>" + carProps.model);
                    cCard.find('#carAutonomy').html("<b>Autonomy : </b>" + carProps.autonomy + " km");
                    cCard.find('#carChargingTime').html("<b>Charging time : </b>" + carProps.chargingtime/60 + " min");
                    cCard.find('.card-img-top').attr('src', carProps.img);   
                    
                    clearForm();
            },
            error: function(data){
                showToast("Query issues", data, false);
            }
        });

        var pathLayer = L.geoJSON(geojson).addTo(currentMap);
        currentMap.fitBounds(pathLayer.getBounds());

        var startIcon = L.icon({
            iconUrl: 'assets/startMarker.png',
            iconAnchor: [33, 55],
            popupAnchor: [0, -50],

        });

        var endIcon = L.icon({
            iconUrl: 'assets/endMarker.png',
            iconAnchor: [24, 48],
            popupAnchor: [0, -50],
        });

        L.marker(geojson.geometry.coordinates[0].reverse(), {icon: startIcon}).addTo(currentMap)
            .bindPopup("<b>Starting point of the trip</b>, please remember to <b>fully charge</b> your battery before leaving");

        L.marker(geojson.geometry.coordinates[geojson.geometry.coordinates.length-1].reverse(), {icon: endIcon}).addTo(currentMap)            
            .bindPopup("<b>Ending point of the trip</b>");


        var electricalIcon = L.icon({
            iconUrl: 'assets/electricalMarker.png',
            iconAnchor: [24, 55],
            popupAnchor: [0, -60],
        });


        bornes.forEach(borne => {
            var borneName = borne.fields.ad_station;
            var bornePrise = borne.fields.type_prise;
            var borneHoraire = borne.fields.accessibilite;
            var borneAcces = borne.fields.acces_recharge;
            var borneHtmlContent= `
            <b>Charging station</b> <br> <br>`
            + `<b>Address : </b> ` + borneName + `<br>` 
            + `<b>Plug type : </b> ` + bornePrise + `<br>`
            + `<b>Timetable : </b>` + borneHoraire + `<br>`
            + `<b>Access : </b>` + borneAcces + `<br>`;

            L.marker(borne.geometry.coordinates.reverse(), {icon: electricalIcon}).addTo(currentMap)
                .bindPopup(borneHtmlContent);
        });



        //Center the map on the path
        //map.fitBounds(geojson.getBounds());

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(currentMap);
    
      });
      $( "html" ).animate({
        scrollTop: window.innerHeight,
      }, 300, function() {
        // Animation complete.
      });
}

function clearForm(){
    $("#submitForm").find('div').hide("fast", function(){
        $("#submitForm").find('svg').show("fast");
        $("#submitForm").prop('disable',false);
    });
    $('#searchCar').val("");
    $('#searchCar').attr('data-props', "");
    $('#searchDeparture').val("");
    $('#searchDeparture').attr('data-props', "");
    $('#searchArrival').val("");
    $('#searchArrival').attr('data-props', "");
    $('.resultContainer').empty();
}

var timer;

function fillFormResult(searchId, resultId, middlewareUrl){
    $(searchId).on('keyup paste', function(e){
        clearTimeout(timer);
        timer = setTimeout(function(){
            var search_text = $(searchId).val();
            if(search_text){
                $.ajax({
                    type: 'POST',
                    url: middlewareUrl,
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify({"search_text": search_text}),
                    success: function(data){
                        if(data != false){
                            $(resultId).html("");
                            if(data.length == 0){
                                $(resultId).html("<div class=\"result\">No results</div>");
                            } else {
                                data.forEach(element => {
                                    $(resultId).append("<div data-props=\'"+JSON.stringify(element['props'])+"\'class=\"result\">" + element['name'] + "</div>");
                                });
                            }
                        } else {
                            showToast("Query issues", "No result found, please enter your search again ...", true);
                        }
                    },
                    error: function(data){
                        showToast("Error", "Query issue on : " + middlewareUrl, false);
                        console.log(data);
                    }
                });
            } else {
                $(resultId).html("");
            }
        }, 250);
    });
}


function showToast(title, message, isSuccess= true){
   var toast = $(`<div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <strong id="toast_title" class="me-auto"></strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body"></div>
                 </div>`);

    toast.find('#toast_title').html(title);
    toast.find('.toast-body').html(message);
    if(!isSuccess){
        toast.find('.toast-header').addClass('bg-danger');
        toast.find('.toast-header').addClass('text-white');

    } else {
        toast.find('.toast-header').removeClass('bg-danger');
        toast.find('.toast-header').addClass('text-secondary');
    }


    $(".toast-container").prepend(toast);
    toast.toast("show");
    toast.on('hidden.bs.toast', function () {
        toast.remove();
    });
}
