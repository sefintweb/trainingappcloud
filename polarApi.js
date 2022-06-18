var cliente = "cde9f694-b2ab-443e-b7de-294506cb39ca";
var secret = "9d9f0459-7361-45b8-967a-c72ec21ba9e3";

var puerto = window.location.port;
var protocol = window.location.protocol;
var dominio = window.location.host;
if (dominio == "localhost") {
    dominio = dominio + "/trainingappcloud"
}

var redirectUri = "http://" + dominio

console.log(redirectUri);

var urlbase = "https://www.polaraccesslink.com/"


// redireccion la app a la pagina de authorizacion de strava
function getAuthRedirectPolar() {

    // window.location.href = "=" + client_id + "&redirect_uri=" + redirectUri + "&response_type=code&scope=activity:read_all";

    window.location.href = "https://flow.polar.com/oauth2/authorization?response_type=code&client_id=cde9f694-b2ab-443e-b7de-294506cb39ca&redirect_uri=" + redirectUri;
}



// obetener el token de acceso
function getTokenAccessPolar() {

    let auth_token = sessionStorage.getItem('auth_token');
    /* const url = 'https://www.strava.com/oauth/token?client_id=' + client_id + '&client_secret=' + client_secret + '&code=' + auth_token + '&grant_type=authorization_code';*/

    const url = 'https://polarremote.com/v2/oauth2/token';

    var autorizar = btoa(cliente + ":" + secret);
    fetch(url, {
            method: 'post',
            // mode: 'no-cors',
            headers: {
                'Accept': 'application/json;charset=UTF-8',
                'Content-Type': '',
                'Authorization': 'Basic' + autorizar,
            }

        }).then(res => res.json())
        .then(function(res) {
            sessionStorage.setItem('access_token', res.access_token)
            sessionStorage.setItem('type_token', res.type_token) // para obtener las consultas de la api
            sessionStorage.setItem('datosiniciales', JSON.stringify(res))
            window.location.href = "http://" + dominio

        })
        .catch(function(error) {

            $.notify("Ha ocurrido un error al obtener acceso de token " + error, "error");

        });
}

function login(num = "") {

    let auth_token = sessionStorage.getItem('auth_token');

    if (auth_token == "" || auth_token == null || auth_token == undefined) {
        getAuthRedirect(num);
    }



}

function imagenSport(sport) {
    var imagen = "";
    if (sport == "Ride") {
        imagen = "imagenes/deportes/1.png";
    }
    if (sport == "Run") {
        imagen = "imagenes/deportes/2.png";
    }
    if (sport == "Workout") {
        imagen = "imagenes/deportes/3.png";
    }
    if (sport == "Yoga") {
        imagen = "imagenes/deportes/4.png";
    }
    return imagen;

}

function getEntrenosPolar() {

    $("#actividades").empty();


    var access_token = sessionStorage.getItem('access_token')
        // alert(access_token)
    const url = "https://www.strava.com/api/v3/athlete/activities?page=1&per_page=18&access_token=" + access_token;

    fetch(url, {
        method: 'get',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    }).then(res => res.json()).then(function(res) {

        var entrenos = res;

        if (entrenos == "" || entrenos == null) {
            $.notify("Sin entrenos registrados", "info")
        } else {

            // $("#activividades").empty();

            entrenos.forEach(entreno => {
                var id = entreno.id;
                var distancia = entreno.distance / 1000;
                distancia = distancia.toFixed(2)
                var tiempo = entreno.elapsed_time / 60;
                tiempo = tiempo.toFixed(2)
                var vel = entreno.average_speed * 3.6;
                vel = vel.toFixed(2)
                var tipo = entreno.type;
                var img = imagenSport(tipo)
                let fecha = entreno.start_date;
                let potencia = entreno.average_watts;
                let fcmedia = entreno.average_heartrate;
                let fcmax = entreno.max_heartrate;

                if (fecha != null && fecha != "") {
                    fecha = fecha.substr(0, 10);
                    fecha = moment(fecha, 'YYYY-MM-DD').format('DD/MM/YYYY');

                }

                if (potencia == null) {
                    potencia = 0;
                }
                let filaActividad = `<div class="card card-sport  col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                            
                                                <div class="alert-success card-header card-header-activity">
                                                  <center><img src="` + img + `" class="imgSport"/><b>` + tipo + `</b></center>
                                                  <center><b>` + fecha + `</b></center>
                                                  <button type="button" class="btn btn-sm btn-light " style="float: right" onclick="getEntrenoId(` + id + `)">
                                                         Ver
                                                  </button>                                                 
                                                                                                    
                                                </div>
                                                             
                                               <center><div class="card-body">
                                                <b>` + entreno.name + `</b><br>
                                                <b>` + distancia + `</b>km
                                                <b>` + tiempo + `</b>min 
                                                <b>` + vel + `</b>km/h 
                                                <b>` + potencia + `</b>w 
                                                <b>Fcmedia:</b>` + fcmedia + ` bpm<b> Fcmax:</b>` + fcmax + ` bpm

                                                </div></center>
                
                </div><hr>`;
                $("#actividades").append(filaActividad)
            });

        }


    }).catch(function(error) {

        $.notify("Ha ocurrido un error al obtener entrenos de strava " + error, "error");
    });


}

function getEntrenoIdPolar(Id) {
    var access_token = sessionStorage.getItem('access_token')

    $("#actividad").empty();
    var url = "https://www.strava.com/api/v3/activities/" + Id + "?access_token=" + access_token;;

    fetch(url, {
        method: 'get',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },

    }).then(res => res.json()).then(function(resp) {

        var entreno = resp;

        var name = entreno.name;
        var type = entreno.type;
        var imgSport = imagenSport(type);
        var description = entreno.description;
        if (description == null) {
            description = "Sin descripcion";
        }
        var fecha = entreno.start_date_local;
        var hora;

        var distancia = entreno.distance / 1000;
        distancia = distancia.toFixed(2)

        var tiempototal = entreno.elapsed_time / 60;
        tiempototal = tiempototal.toFixed(2)

        var tiempomovi = entreno.moving_time / 60;
        tiempomovi = tiempomovi.toFixed(2)


        var velmedia = entreno.average_speed * 3.6;
        velmedia = velmedia.toFixed(2)

        var velmax = entreno.max_speed * 3.6;
        velmax = velmax.toFixed(2)

        var calories = entreno.calories;
        let potencia = entreno.average_watts;
        potencia = potencia.toFixed(0);
        let fcmedia = entreno.average_heartrate;
        fcmedia = fcmedia.toFixed(0)
        let fcmax = entreno.max_heartrate;
        fcmax = fcmax.toFixed(0)

        let elev_max = entreno.elev_high;
        let elev_min = entreno.elev_low;
        let total_elev = entreno.total_elevation_gain;
        if (elev_max == null) {
            elev_max = 0;
        }
        if (elev_min == null) {
            elev_min = 0;
        }
        if (total_elev == null) {
            total_elev = 0;
        }

        if (potencia == null) {
            potencia = 0;
        }


        if (fecha != null && fecha != "") {
            fecha = fecha.substr(0, 10);
            hora = fecha.substr(12, 20);
            console.log(hora)
            fecha = moment(fecha, 'YYYY-MM-DD').format('DD/MM/YYYY');

        }

        var laps = entreno.laps;
        var lapsDiv = "";
        if (laps != null) {


            lapsDiv += `
                    <table style="border-radius:4px; font-size:10px; text-align:center" class="table  table-hover">
                    <thead class="thead-dark">
                        <th>Vuelta</th>
                        <th>Tiempo Total</th>
                        <th>Tiempo Movi</th>
                        <th>Distancia</th>
                        <th>Vel Media</th>
                        <th>Vel Max</th>
                        <th>Fc Media</th>
                        <th>Fc Max</th>
                        <th>Pot Media</th>
                    </thead><tbody id="tablelaps">`;

            laps.forEach((data, indice) => {
                let name = data.name;
                let tiempototal = data.elapsed_time;
                tiempototal = tiempototal / 60;
                tiempototal = tiempototal.toFixed(2);

                let tiempomovi = data.moving_time;
                tiempomovi = tiempomovi / 60;
                tiempomovi = tiempomovi.toFixed(1)

                let distance = data.distance;
                if (distance != null) {
                    distance = distance / 1000;
                    distance = distance.toFixed(2)
                } else {
                    distance = 0;
                }

                let velmedia = data.average_speed * 3.6;
                velmedia = velmedia.toFixed(1);

                let velmax = data.max_speed * 3.6;
                velmax = velmax.toFixed(2);

                let fcmedia = data.average_heartrate;
                fcmedia = fcmedia.toFixed(0);

                let fcmax = data.max_heartrate;
                fcmax = fcmax.toFixed(0);

                let potencia = data.average_watts;
                if (potencia != null) {
                    potencia = potencia.toFixed(2);
                } else {
                    potencia = 0;
                }



                lapsDiv += `<tr>
                    <td>` + name + `</td>
                    <td>` + tiempototal + `</td>
                    <td>` + tiempomovi + `</td>
                    <td>` + distance + `</td>
                    <td>` + velmedia + `</td>
                    <td>` + velmax + `</td>
                     <td>` + fcmedia + `</td>
                     <td>` + fcmax + `</td>
                     <td>` + potencia + `</td>          
                </tr>`;



            });

            lapsDiv += `</tbody></table>`;

        } else {
            var lapsDiv = "<div></div>";

        }


        var entrenoFila = `<div class="card col-xs-12 col-sm-12 col-md-12 col-lg-12" style="font-size:12px">
                            <div class="card-header">
                                <div class="row col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                    <div class=" col-xs-12 col-sm-12 col-md-3 col-lg-3">
                                        <img src="` + imgSport + `" class="imgSportId"/>
                                    </div>
                                    <div class=" col-xs-12 col-sm-12 col-md-9 col-lg-9">
                                        <h2>` + name + `</h2><br>
                                        <b>` + description + `</b>
                                    </div>
                                </div>
                            </div>
            
            <div class="card-body">
                <div class="row col-xs-12 col-sm-12 col-md-12 col-lg-12">
                    <div class=" col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        <b>Fecha:</b> ` + fecha + `<br>
                        <b>Hora: </b>` + hora + `
                    </div>
                    <div class=" col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        <b>Distancia: </b>` + distancia + ` km<br>
                    </div>
                    <div class=" col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        <b>Tiempo Total:</b> ` + tiempototal + ` min<br>
                        <b>Tiempo Movi:</b> ` + tiempomovi + ` min<br>
                    </div>                    
                </div>
                <br>

                <div class="row col-xs-12 col-sm-12 col-md-12 col-lg-12">
                    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        <b>Vel Media:</b> ` + velmedia + ` km/h<br>
                        <b>Vel Maxima:</b> ` + velmax + ` km/h
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        <b>Fc media:</b> ` + fcmedia + ` bpm<br>
                        <b>Fc Maxima:</b> ` + fcmax + ` bpm<br>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4">
                       <b>Potencia: </b>` + potencia + ` w<br>
                        <b>Cadencia:</b> <br>
                    </div>           
                </div>
                <br>
                <div class="row col-xs-12 col-sm-12 col-md-12 col-lg-12">
                    <div class=" col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        <b>Calorias: </b>` + calories + ` kcal<br>
                        <b>Total Elev:</b> ` + total_elev + `m
                    
                    </div>
                    <div class=" col-xs-12 col-sm-12 col-md-4 col-lg-4">
                       <b> Elev Max:</b> ` + elev_max + `m<br>
                        <b>Elev min:</b> ` + elev_min + `m<br>
                    </div>
                  
                </div>
                <br>
                <center><b> VUELTAS</b></center>
                <div class="col-xs-12 col-sm-12 col-lg-12 col-md-12">
                    ` + lapsDiv + `
                </div>
               
            </div> 
        
        </div>`;

        $("#actividad").append(entrenoFila);

    }).catch(function(error) {
        $.notify("Ha ocurrido un error al obtener el entreno" + error, "error")
    })


}


function logout() {

    var token = sessionStorage.getItem('access_token')

    let url = "https://www.strava.com/oauth/deauthorize?access_token=" + token;
    fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },


        }).then(res => res.json())
        .then(function(res) {

            $("#login").show();
            $("#logout").hide();
            $("#entrenos").hide()
            $("#perfil").hide()
            sessionStorage.clear();
            $.notify("Sesion finalizada", "success")


        }).catch(function(error) {
            alert(error);
            $.notify("Ha ocurrido un error al desautorizar aplicacion" + error, "error");
        });

    $("#home").click();



}

$(function() {

})