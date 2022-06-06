const client_id = "72863";
const client_secret = "ca47ee35232ee86a2e401da340323e42055456ea";

// redireccion la app a la pagina de authorizacion de strava
function getAuthRedirect() {
    window.location.href = "https://www.strava.com/oauth/authorize?client_id=" + client_id + "&redirect_uri=http://localhost:5500/index.html&response_type=code&scope=activity:read_all";

}



// inicializar los datos 
function inicializar(res) {


    sessionStorage.setItem('access_token', res.access_token) // para obtener las consultas de la api
    sessionStorage.setItem('datosiniciales', JSON.stringify(res))


    // mostrar elementos del menu ocultos
    document.getElementById('login').style.display = "none";
    document.getElementById('logout').style.display = "block";
    document.getElementById('entrenos').style.display = "block";
    document.getElementById('perfil').style.display = "block";


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
            alert("Ha ocurrido un error al obtener acceso " + error)
        });
}

function getEntrenos() {

    let access_token = sessionStorage.getItem('access_token')

    const url = `https://www.strava.com/api/v3/athlete/activities?token_access=` + access_token;

    fetch(url, {
        method: 'post',

    }).then(function(response) {
        mostrarActividades(response);
    }).catch(function(error) {
        alert("Ha ocurrido un error al obtener entrenos de strava " + error)
    });
}

function mostrarActividades(response) {
    actividades = JSON.parse(response);
    alert(actividades);

}

function logout() {

    let token = sessionStorage.getItem('token_access')

    let url = "https://www.strava.com/oauth/deauthorize"
    fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'token_access': token
            })

        }).then(function(response) {

        })
        .then(res => inicializar(res)).catch(function(error) {
            alert("Ha ocurrido un error al desautorizar aplicacion");
        });
}