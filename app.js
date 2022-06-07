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

function verMenu() {

    $("#entrenos").addClass('verMenu');
    $("#perfil").addClass('verMenu');
    $("#logout").addClass('verMenu');
    $("#login").hide();
}

// inicializar los datos 
function inicializar(res) {

    sessionStorage.setItem('access_token', res.access_token) // para obtener las consultas de la api
    sessionStorage.setItem('datosiniciales', JSON.stringify(res))

    window.location.href = "http://" + dominio

}

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
        .then(res => inicializar(res))
        .catch(function(error) {

            $.notify("Ha ocurrido un error al obtener acceso de token " + error, "error");

        });
}

function getEntrenos() {

    var access_token = sessionStorage.getItem('access_token')
        // alert(access_token)
    const url = "https://www.strava.com/api/v3/athlete/activities?access_token=" + access_token;

    fetch(url, {
        method: 'get',
    }).then(function(res) {
        var actividades = res.json();

        var nroAct = actividades.length;
        for (let i = 0; i < nroAct; i++) {
            let entreno = JSON.parse(actividades[i]);
            console.log(entreno);
            let filaActividad = `<div><b>Nombre</b>` + entreno.name + `</div><br>`;
            $("#actividades").append(filaActividad)

        }
    }).catch(function(error) {

        $.notify("Ha ocurrido un error al obtener entrenos de strava " + error, "error");
    });


}

function mostrarActividades(res) {

    console.log(actividades)



}

function logout() {

    var token = sessionStorage.getItem('access_token')

    let url = "https://www.strava.com/oauth/deauthorize"
    fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'access_token': token
            })

        }).then(function(res) {
            alert("Aplicacion desautorizada" + sucess);
        })
        .then(res => inicializar(res)).catch(function(error) {

            alert("Ha ocurrido un error al desautorizar aplicacion" + error, "error");
        });
}