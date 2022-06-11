const client_id = "72863";
const client_secret = "ca47ee35232ee86a2e401da340323e42055456ea";

const port = window.location.port;
const protocol = window.location.protocol;
var dominio = window.location.host;
if (dominio == "localhost") {
    dominio = dominio + "/trainingappcloud"
}

const redirectUri = "http://" + dominio

console.log(redirectUri);

// redireccion la app a la pagina de authorizacion de strava
function getAuthRedirect() {

    window.location.href = "https://www.strava.com/oauth/authorize?client_id=" + client_id + "&redirect_uri=" + redirectUri + "&response_type=code&scope=activity:read_all";

}



// obetener el token de acceso
function getTokenAccess() {

    let auth_token = sessionStorage.getItem('auth_token');
    const url = 'https://www.strava.com/oauth/token?client_id=' + client_id + '&client_secret=' + client_secret + '&code=' + auth_token + '&grant_type=authorization_code';

    fetch(url, {
        method: 'post',
        // mode: 'no-cors',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }

    }).then(res => res.json())
        .then(function (res) {
            sessionStorage.setItem('access_token', res.access_token) // para obtener las consultas de la api
            sessionStorage.setItem('datosiniciales', JSON.stringify(res))
            window.location.href = "http://" + dominio

        })
        .catch(function (error) {

            $.notify("Ha ocurrido un error al obtener acceso de token " + error, "error");

        });
}

function login() {

    let auth_token = sessionStorage.getItem('auth_token');

    if (auth_token == "" || auth_token == null || auth_token == undefined) {
        getAuthRedirect();
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

function getEntrenos() {

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
    }).then(res => res.json()).then(function (res) {

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

                if(potencia==null){
                    potencia=0;
                }
                let filaActividad = `<div class="card card-sport alert-info  col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                            
                                                <div class="alert-success card-header card-header-activity">
                                                  <center><img src="` + img + `" class="imgSport"/><b>` + tipo + `</b></center>
                                                  <center><b>`+ fecha + `</b></center>
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
                                                <b>Fcmedia:</b>`+ fcmedia + ` bpm<b> Fcmax:</b>` + fcmax + ` bpm

                                                </div></center>
                
                </div><hr>`;
                $("#actividades").append(filaActividad)
            });

        }


    }).catch(function (error) {

        $.notify("Ha ocurrido un error al obtener entrenos de strava " + error, "error");
    });


}

function getEntrenoId(Id) {
    var access_token = sessionStorage.getItem('access_token')

    $("#actividad").empty();
    var url = "https://www.strava.com/api/v3/activities/" + Id + "?access_token=" + access_token;;

    fetch(url, {
        method: 'get',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },

    }).then(res => res.json()).then(function (resp) {

        var entreno = resp;

        var name = entreno.name;
        var type = entreno.type;
        var imgSport = imagenSport(type);
        var description = entreno.description;
        if(description==null){
            description="Sin descripcion";
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
        let fcmedia = entreno.average_heartrate;
        let fcmax = entreno.max_heartrate;
        
        let elev_max = entreno.elev_high;
        let elev_min =entreno.elev_low;
        if(elev_max==null){
            elev_max=0;
        }
        if(elev_min==null){
            elev_min=0;
        }

        if(potencia==null){
            potencia=0;
        }

        
        if (fecha != null && fecha != "") {
            fecha = fecha.substr(0, 10);
            hora =fecha.substr(12,20);
            console.log(hora)
            fecha = moment(fecha, 'YYYY-MM-DD').format('DD/MM/YYYY');
            
        }

        var entrenoFila=`<div class="card alert-info col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <div class="card-header alert-primary">
                <div class="row col-xs-12 col-sm-12 col-md-12 col-lg-12">
                    <div class=" col-xs-12 col-sm-12 col-md-3 col-lg-3">
                        <img src="`+imgSport+`" class="imgSportId"/>
                    </div>
                    <div class=" col-xs-12 col-sm-12 col-md-9 col-lg-9">
                        <h2>`+name+`</h2><br>
                        <b>`+description+`</b>
                    </div>
                </div>
            </div>
            
            <div class="card-body alert-success">
                <div class="row col-xs-12 col-sm-12 col-md-12 col-lg-12">
                    <div class=" col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        Fecha: `+fecha+`<br>
                        Hora: `+hora+`
                    </div>
                    <div class=" col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        Distancia: `+distancia+` km<br>
                    </div>
                    <div class=" col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        Tiempo Total: `+tiempototal+` min<br>
                        Tiempo Movi: `+tiempomovi+` min<br>
                    </div>                    
                </div>
                <br>

                <div class="row col-xs-12 col-sm-12 col-md-12 col-lg-12">
                    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        Vel Media: `+velmedia+` km/h<br>
                        Vel Maxima: `+velmax+` km/h
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        Fc media: `+fcmedia+` bpm<br>
                        Fc Maxima: `+fcmax+` bpm<br>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        Potencia: `+potencia+` w<br>
                        Cadencia: <br>
                    </div>           
                </div>
                <br>
                <div class="row col-xs-12 col-sm-12 col-md-12 col-lg-12">
                    <div class=" col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        Calorias: `+calories+` kcal<br>
                    
                    </div>
                    <div class=" col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        Elev Max: `+elev_max+`m<br>
                        Elev min: `+elev_min+`m<br>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4">
                        <button class="btn btn-sm btn-success" style="min-width: 150px; margin-bottom:10px">Laps Personales</button><br>
                        <button class="btn btn-sm btn-info" style="min-width: 150px">Laps Strava</button>
                    </div>           
                </div> 
            </div> 
        
        </div>`

        $("#actividad").append(entrenoFila);

    }).catch(function (error) {
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
        .then(function (res) {

            $("#login").show();
            $("#logout").hide();
            $("#entrenos").hide()
            $("#perfil").hide()
            sessionStorage.clear();
            $.notify("Sesion finalizada", "success")


        }).catch(function (error) {
            alert("Ha ocurrido un error al desautorizar aplicacion" + error, "error");
        });

    $("#home").click();



}