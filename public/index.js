
const rest_api_url = "https://restwiredcar.herokuapp.com/traveltime";
const soap_middleware_url = "/api/get-cars";


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
            console.log(data);        
        }
    });


    /*SOAP API ############################################*/
    $.ajax({
        url: soap_middleware_url,
        contentType: "application/json",
        dataType: "json",
        success: function(data){
            console.log(data);        
        }
    });


    $('#searchInput').on('keyup paste', function(e){
        var search_text = $('#searchInput').val();
        $.ajax({
            url: soap_middleware_url,
            contentType: "application/json",
            dataType: "json",
            success: function(data){
                console.log(data);
                if(data != false){
                    $('#resultContainer').html("");
                    if(data.length == 0){
                        $('#resultContainer').html("<div class=\"result\">No results</div>");
                    } else {
                        data.forEach(car => {
                            $('#resultContainer').append("<div class=\"result\">" + car['name'] + "</div>");
                        });
                    }
                } else {
                    $('#resultContainer').html("<div class=\"result\">Query issue</div>");
                }
                
            }
        });
    });


});







