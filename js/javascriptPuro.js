var CLIENT_ID = '38773755456-cqal421svi9p01s5n52llmvg2rapmdpq.apps.googleusercontent.com';
var API_KEY = 'AIzaSyC7wxIYtZtQvFuJYHsdqBf6qOyOuSBYTAs';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";

var authorizeButton = $("authorize_button").attr('id');
var signoutButton = document.getElementById('signout_button');
var body = document.getElementById('body');
var selectColores = document.getElementById('color');
var modal = document.getElementById('modalEvents');
var eventos = [];
var colores = new Array();
var colorEvent;
var textColorEvent;
var accion = 0;
/**
*  On load, called to load the auth2 library and API client library.
*/
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/**
*  Initializes the API client library and sets up sign-in state
*  listeners.
*/
function initClient() {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function (response) {
        console.log(response);
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    }, function(error) {
      appendPre(JSON.stringify(error, null, 2));
    });
}

function getColors() {
    gapi.client.calendar.colors.get({
      "prettyPrint": true,
      "alt": "json"
    }).then(function(response) {
        var colors = response.result.event;
        for(var color in colors){
            colores.push({id: color, color: colors[color].background,colorFont: colors[color].foreground});
            var opt = document.createElement('option');
            opt.setAttribute("id", "opcion"+color);
            opt.setAttribute("color", colors[color].background);
            opt.value = color;
            var span = document.createElement('span');
            span.setAttribute("id", "span"+color);
            selectColores.appendChild(opt);
            document.getElementById("opcion"+color).style.backgroundColor = colors[color].background;
        }

    },
    function(err) { 
        console.error("Execute error", err);
    });
}

document.getElementById("color").addEventListener("change", function() {
  console.log(document.getElementById("opcion"+this.value).getAttribute("color"));
  document.getElementById("color").style.backgroundColor = document.getElementById("opcion"+this.value).getAttribute("color");
});

/**
*  Called when the signed in status changes, to update the UI
*  appropriately. After a sign-in, the API is called.
*/
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      //authorizeButton.style.display = 'none';
      $("authorize_button").hide();
      //signoutButton.style.display = 'inline-block';
      $("signoutButton").show();
      getColors();
      listUpcomingEvents();
    } else {
      // authorizeButton.style.display = 'inline-block';
      // signoutButton.style.display = 'none';
      $("authorize_button").show();
      $("signoutButton").hide();
      //signoutButton.style.display = 'inline-block';
    }
}

/**
*  Sign in the user upon button click.
*/
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
*  Sign out the user upon button click.
*/
function handleSignoutClick(event) {
    //Disconnecting and revoking scopes
    gapi.auth2.getAuthInstance().disconnect();
    //gapi.auth2.getAuthInstance().signOut();
    //var auth2 = gapi.auth2.getAuthInstance();
    // auth2.signOut().then(function () {
    //   console.log('User signed out.');
    // });
}

/**
* Append a pre element to the body containing the given message
* as its text node. Used to display the results of the API call.
*
* @param {string} message Text to be placed in pre element.
*/
function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}

  /**
   * Print the summary and start datetime/date of the next ten events in
   * the authorized user's calendar. If no events are found an
   * appropriate message is printed.
   */
function listUpcomingEvents() {
    gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'orderBy': 'startTime'
    }).then(function(response) {
        var events = response.result.items;
        console.log(events);
        eventos = [];
        if (events.length > 0) {
            events.forEach(obj => {
                colorEvent = "";
                for(var color in colores){
                    if (colores[color].id == obj.colorId ) {
                        colorEvent = colores[color].color;
                        textColorEvent = "#FFFFFF";
                    }
                }
                eventos.push({id: obj.id, title: obj.summary, description:obj.description,location:obj.location, start: obj.start.dateTime, end: obj.end.dateTime, color: colorEvent, textColor: textColorEvent});
            })
            //console.log(eventos);
            $('#calendar').fullCalendar({
                header: {
                    language: 'es',
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,basicWeek,basicDay',
                },
                timeZone: 'UTC',
                timeFormat: 'h:mm a',
                editable: true,
                eventLimit: true, // allow "more" link when too many events
                selectable: true,
                selectHelper: true,
                select: function(start, end) {
                    document.getElementById("start").value = moment(start).format('YYYY-MM-DD');
                    document.getElementById("hrastart").value = moment(start).format('HH:mm:ss');
                    document.getElementById("end").value = moment(end).format('YYYY-MM-DD');
                    document.getElementById("hraend").value = moment(end).format('HH:mm:ss');
                    document.getElementById("btnGuardar").style.display = "inline-block";
                    document.getElementById("btnActualizar").style.display = "none";
                    document.getElementById("btnEliminar").style.display = "none";
                    mostrarModal();
                },
                eventRender: function(event, element) {
                    element.bind('click', function() {
                        document.getElementById("id").value = event.id;
                        document.getElementById("title").value = event.title;
                        document.getElementById("descripcion").value = event.description;
                        document.getElementById("direccion").value = event.location;
                        document.getElementById("color").value = event.color;
                        document.getElementById("start").value = moment(event.start).format('YYYY-MM-DD');
                        document.getElementById("hrastart").value = moment(event.start).format('HH:mm:ss');
                        document.getElementById("end").value = moment(event.end).format('YYYY-MM-DD');
                        document.getElementById("hraend").value = moment(event.end).format('HH:mm:ss');
                        document.getElementById("btnGuardar").style.display = "none";
                        document.getElementById("btnActualizar").style.display = "inline-block";
                        document.getElementById("btnEliminar").style.display = "inline-block";
                        mostrarModal();
                    });
                },
                // eventDrop: function(event, delta, revertFunc) { // si changement de position
                //     edit(event);
                // },
                // eventResize: function(event,dayDelta,minuteDelta,revertFunc) { // si changement de longueur
                //     edit(event);
                // },
                events:eventos,
            });
        }
    });
}

function refrescarCalendario(){
    
}

function updateEvent(event){
    var idevento = document.getElementById("id").value;
    var titulo = document.getElementById("title").value;
    var descripcion = document.getElementById("descripcion").value;
    var inicio = document.getElementById("start").value +" "+ document.getElementById("hrastart").value;
    var fin = document.getElementById("end").value + " " + document.getElementById("hraend").value;
    var color= document.getElementById("color").value;
    var direccion= document.getElementById("direccion").value;
    var timeZone = moment.tz.guess();
    var start = moment(inicio).tz(timeZone).format();
    var end = moment(fin).tz(timeZone).format();
    //var calendario=document.getElementById("calendario").value;
    return gapi.client.calendar.events.update(
    {
        "calendarId": "fcoguihega@gmail.com",
        "eventId": idevento,
        "resource": {
            "end": {
                "dateTime": end,
                "timeZone": timeZone
            },
            "start": {
                "dateTime": start,
                "timeZone": timeZone
            },
            "summary": titulo,
            "location": direccion,
            "description": descripcion,
            "colorId": color
        }
    }).then(
    function(response) {
        console.log("Response", response);
        listUpcomingEvents();
        $('#calendar').fullCalendar('destroy');
        $('#calendar').fullCalendar('render');
    },
    function(err) { 
        console.error("Execute error", err); 
    });
}

function insertEvent(){
    var titulo=document.getElementById("title").value; 
    var descripcion=document.getElementById("descripcion").value;
    var inicio=document.getElementById("start").value +" "+ document.getElementById("hrastart").value;
    var fin=document.getElementById("end").value + " " + document.getElementById("hraend").value;
    var color=document.getElementById("color").value;
    var direccion=document.getElementById("direccion").value;
    var timeZone = moment.tz.guess();
    var start = moment(inicio).tz(timeZone).format();
    var end = moment(fin).tz(timeZone).format();
    //var calendario=document.getElementById("calendario").value;
    return gapi.client.calendar.events.insert({
        "calendarId": "fcoguihega@gmail.com",
        "resource": {
            "end": {
                "dateTime": end,
                "timeZone": timeZone
            },
            "start": {
                "dateTime": start,
                "timeZone": timeZone
            },
            "summary": titulo,
            "location": direccion,
            "description": descripcion,
            "colorId": color
        }
    }).then(function(response) {
        // Handle the results here (response.result has the parsed body).
        console.log("Response", response);
        listUpcomingEvents();
        $('#calendar').fullCalendar('destroy');
        $('#calendar').fullCalendar('render');
    },
    function(err) {
        console.error("Execute error", err);
    });
    //ocultarModal();
}

function deleteEvent() {
    var idevento = document.getElementById("id").value;
    return gapi.client.calendar.events.delete({
      "calendarId": "fcoguihega@gmail.com",
      "eventId": idevento
    }).then(
        function(response) {
        // Handle the results here (response.result has the parsed body).
            console.log("Response", response);
            listUpcomingEvents();
            $('#calendar').fullCalendar('destroy');
            $('#calendar').fullCalendar('render');
        },
        function(err) { 
            console.error("Execute error", err);
        });
  }
// function getEventId(){
//     gapi.client.calendar.events.get({
//       "calendarId": "fcoguihega@gmail.com",
//       "eventId": "37bjfdlv7arn8009l2dmulkmbi"
//     }).then(
//     function(response) {
//         // Handle the results here (response.result has the parsed body).
//         console.log("Response", response);
//     },
//     function(err) { 
//         console.error("Execute error", err); 
//     });
// }

function mostrarModal(){
    body.classList.add("modal-open");
    modal.style.display = "block";
    modal.classList.add("fade");
    modal.classList.add("in");
}

function ocultarModal(){
    body.classList.remove("modal-open");
    modal.style.display = "none";
    modal.classList.remove("fade");
    modal.classList.remove("in");
    limpiarModal();
}

function limpiarModal(){
    document.getElementById("id").value = "";
    document.getElementById("title").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("direccion").value = "";
    document.getElementById("color").value = "";
    document.getElementById("start").value = "";
    document.getElementById("hrastart").value = "";
    document.getElementById("end").value = "";
    document.getElementById("hraend").value = "";
}