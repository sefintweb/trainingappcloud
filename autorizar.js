var client_id = "72863";
var client_secret = "ca47ee35232ee86a2e401da340323e42055456ea";
var token_access = "4864c7a2c49c87fe06d716b9a038e5611165fe23";
var token_ipdate = "2f653a055b001a4e86282e45c0de71b2302971e3 ";

function autorizar(client_id, client_secret, token_access) {

    url = "https://www.strava.com/oauth/token?client_id=" + client_id + "&client_secret=" + client_secret + "&code=" + token + "&grant_type=authorization_code";
    var resp = fetchApi(url);
    console.log(resp);
    if (resp != null) {
        alert("Cargando datos del atleta");
    }

}

function fetchApi(url, method, info = "") {
    fetch(url, {
            mode: 'non-cors',
            method: method,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        })
        .then(
            data => data,


        ).then(
            response => response,

        );


    let datos = {
        'data': data,
        'response': response,
    };
    return datos;

}

function getActivities(token_access) {
    url = "https://www.strava.com/api/v3/athlete/activities?access_token=" + token_access;
    fetchApi(url, "GET");
}

autorizar(client_id, client_secret);