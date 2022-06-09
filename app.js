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
        .then(function(res) {
            sessionStorage.setItem('access_token', res.access_token) // para obtener las consultas de la api
            sessionStorage.setItem('datosiniciales', JSON.stringify(res))
            window.location.href = "http://" + dominio

        })
        .catch(function(error) {

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
                let filaActividad = `<div class="card card-sport alert-info  col-xs-12 col-sm-12 col-md-2 col-lg-2">
                                            
                                                <div class="alert-success card-header card-header-activity  ">
                                                  <center> <b>` + tipo + `</b><img src="` + img + `" class="imgSport"/><br>
                                                  <b>Lunes 01/01/2022</b>
                                                  <button type="button" class="btn-sm btn-info "                 data-toggle="modal" data-target="#exampleModal"        onclick="getEntrenoId(` + id + `)">
                                                         Ver
                                                     </button>                                                 
                                                  </center>                                                   
                                                </div>
                                                             
                                               <center><div class="card-body">
                                                <b>` + entreno.name + `</b><br>
                                                <b>` + distancia + `</b>km<br>
                                                <b>` + tiempo + `</b>min<br> 
                                                <b>` + vel + `</b>km/h<br>                
                                                </div></center>
                
                </div>`;
                $("#actividades").append(filaActividad)
            });

        }


    }).catch(function(error) {

        $.notify("Ha ocurrido un error al obtener entrenos de strava " + error, "error");
    });


}

function getEntrenoId(Id) {
    var access_token = sessionStorage.getItem('access_token')
    var url = "https://www.strava.com/api/v3/activities/" + Id + "?access_token=" + access_token;;

    fetch(url, {
        method: 'get',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },

    }).then(res => res.json()).then(function(resp) {



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
            alert("Ha ocurrido un error al desautorizar aplicacion" + error, "error");
        });

    $("#home").click();



}