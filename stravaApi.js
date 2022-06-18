var client_id = "72863";
var client_secret = "ca47ee35232ee86a2e401da340323e42055456ea";

var port = window.location.port;
var protocol = window.location.protocol;
var dominio = window.location.host;
if (dominio == "localhost") {
    dominio = dominio + "/trainingappcloud"
}

var redirectUri = "http://" + dominio

console.log(redirectUri);




// redireccion la app a la pagina de authorizacion de strava
function getAuthRedirect() {

    window.location.href = "https://www.strava.com/oauth/authorize?client_id=" + client_id + "&redirect_uri=" + redirectUri + "&response_type=code&scope=activity:write,read_all";

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
    const url = "https://www.strava.com/api/v3/athlete/activities?page=1&per_page=30&access_token=" + access_token;

    fetch(url, {
        method: 'get',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    }).then(res => res.json()).then(function (res) {

        sessionStorage.setItem('entrenos',res)
        var entrenos = res;

        if (entrenos == "" || entrenos == null) {
            $.notify("Sin entrenos registrados", "info")
        } else {

            // $("#activividades").empty();

            entrenos.forEach(entreno => {
                var id = entreno.id;
                var distancia = entreno.distance / 1000;
                if(distancia!=null){
                    distancia = distancia.toFixed(2)
                }else{
                    distancia=0;
                }
               
                var tiempo = entreno.elapsed_time / 60;
                if(tiempo==null){
                    tiempo=0;
                }else{
                    tiempo = tiempo.toFixed(2)
                }
                
                var vel = entreno.average_speed * 3.6;
                if(vel==null){
                    vel=0;
                }else{
                    vel = vel.toFixed(2)
                }
                
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
                if(fcmax==null){
                    fcmedia=0;
                }

                if(fcmax==null){
                    fcmax=0;
                }
                let filaActividad = `<div class="card card-sport  col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                            
                                                <div class="alert-success card-header card-header-activity">
                                                  <center><img src="` + img + `" class="imgSport img-circle"/><b>` + tipo + `</b></center>
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
        sessionStorage.setItem('entrenamiento', resp)
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
        if (distancia == null) {
            distancia = 0;
        } else {
            distancia = distancia.toFixed(2)
        }

        var tiempototal = entreno.elapsed_time / 60;
        if (tiempototal == null) {
            tiempototal = 0;
        } else {
            tiempototal = tiempototal.toFixed(2)
        }

        var tiempomovi = entreno.moving_time / 60;
        if (tiempomovi == null) {
            tiempomovi = 0;
        } else {
            tiempomovi = tiempomovi.toFixed(2)
        }



        var velmedia = entreno.average_speed * 3.6;
        if (velmedia == null) {
            velmedia = 0;
        } else {
            velmedia = velmedia.toFixed(2)
        }


        var velmax = entreno.max_speed * 3.6;
        if (velmax == null) {
            velmax = 0;
        } else {
            velmax = velmax.toFixed(2)
        }


        var calories = entreno.calories;
        if (calories == null) {
            calories = 0
        }

        let potencia = entreno.average_watts;
        if (potencia == null) {
            potencia = 0;
        } else {
            potencia = potencia.toFixed(0);
        }


        let fcmedia = entreno.average_heartrate;
        if (fcmedia == null) {
            fcmedia = 0;
        } else {
            fcmedia = fcmedia.toFixed(0)
        }

        let fcmax = entreno.max_heartrate;
        if(fcmax==null){
            fcmax=0;
        }else{
            fcmax= fcmax.toFixed(0)
        }
      

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

        if (fecha != null && fecha != "") {
            fechacorta = fecha.substr(0, 10);
            hora = fecha.substr(12, 18);
            console.log(hora)
            fecha = moment(fechacorta, 'YYYY-MM-DD').format('DD/MM/YYYY');

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
            if (laps != null) {

            }
            laps.forEach((data, indice) => {

                let name = data.name;
                let tiempototal = data.elapsed_time;
                if (tiempototal != null) {

                    tiempototal = tiempototal / 60;
                    tiempototal = tiempototal.toFixed(2);
                }
                else {
                    tiempototal = 0;
                }


                let tiempomovi = data.moving_time;
                if (tiempomovi != null) {
                    tiempomovi = tiempomovi / 60;
                    tiempomovi = tiempomovi.toFixed(1)

                }
                else {
                    tiempomovi = 0;
                }


                let distance = data.distance;
                if (distance != null) {
                    distance = distance / 1000;
                    distance = distance.toFixed(2)
                } else {
                    distance = 0;
                }

                let velmedia = data.average_speed * 3.6;

                if (velmedia != null) {
                    velmedia = velmedia.toFixed(1);
                } else {
                    velmedia = 0;
                }


                let velmax = data.max_speed * 3.6;
                if (velmax != null) {
                    velmax = velmax.toFixed(1);
                } else {
                    velmax = 0;
                }

                let fcmedia = data.average_heartrate;

                if (fcmedia != null) {
                    fcmedia = fcmedia.toFixed(0);
                } else {
                    fcmedia = 0;
                }


                let fcmax = data.max_heartrate;

                if (fcmax != null) {
                    fcmax = fcmax.toFixed(0);
                } else {
                    fcmax = 0;
                }

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
                        <b>Hora:</b>${hora}
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
        console.log(entrenoFila)

        /*  $("#actividad").append(entrenoFila); */
        document.getElementById('actividad').innerHTML = entrenoFila;

    }).catch(function (error) {
        $.notify("Ha ocurrido un error al obtener el entreno" + error, "error")
    })


}



function crearActividadStrava() {

    let name = document.getElementById('name').value;
    let type = document.getElementById('type').value;   
    let fecha = document.getElementById('fecha').value;

    alert("fecha "+fecha)
   // fecha=moment(fecha,'YYYY-MM-DD').format('DD/MM/YYYY-MM-DD HH:mm:ss')
    let elapsed_time = document.getElementById('elapsed_time').value;
    let horas=elapsed_time.substr(0,2);
    let minutos=elapsed_time.substr(3,5)
 
    minutos=parseInt(minutos)*60;
    horas=parseInt(horas)*3600;
    elapsed_time=horas+minutos;
    
    potencia=document.getElementById('potencia').value; 
    let distance = document.getElementById('distance').value;
    distance=distance*1000;

    let fcmedia=document.getElementById('average_heartrate').value;
    let fcmax=document.getElementById('max_heartrate').value;
   
    
    let description = document.getElementById('description').value;
    
    var access_token= sessionStorage.getItem('access_token');
    var url="https://www.strava.com/api/v3/activities?access_token=" + access_token;
    fetch(url, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain,*/*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'name': name,
            'type': type,
            'elapsed_time': elapsed_time ,
            'start_date_local': fecha,
            'description':description,
            'distance': distance,
            'average_watts':potencia,
            'average_heartrate':fcmedia,

        }),
    }).then(resp => resp.json()).then(function(res) {
        
        if(res!=null && res!=undefined) {
            $.notify("Se ha creado la actividad con exito","success");
        }
    }).catch(function(error) {
        $.notify("Ha ocurrido un error al crear la actividad", "error");
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
            window.location.href=location.host;


        }).catch(function (error) {
            $.notify("Ha ocurrido un error al desautorizar aplicacion" + error, "error");
        });

    $("#home").click();

}

