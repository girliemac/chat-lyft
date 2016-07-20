(function() {

  if (typeof(user) === 'undefined') {
    return;
  } 

  var output = document.getElementById('output'), 
      input = document.getElementById('input'), 
      avatar = document.getElementById('avatar'),
      presence = document.getElementById('presence'),
      action = document.getElementById('action'),
      send = document.getElementById('send');

  var location = getCurrentLocation();
  var lat;
  var lng;

  var channel = 'lyft-chat';
  
  var pubnub = PUBNUB.init({
    subscribe_key: 'sub-c-00ac33a4-3e28-11e6-971e-02ee2ddab7fe',
    publish_key: 'pub-c-1a5f74ed-f634-47eb-a1b9-53d98390c644'
  });


  function displayOutput(message) {
    if(!message) return;
    if(typeof(message.text) === 'undefined') return;

    console.log(message);

    var content = '<p><strong>' +  message.userid+ ': </strong>';

    if (message.text) {
      content += '<span>' + message.text + '</span></p>';
    }
    if (message.image) {
      content += '<img src="' + message.image + '">'
    }

    output.innerHTML = content + output.innerHTML;
  }

  function getHistory() {
    pubnub.history({
      channel: channel,
      count: 30,
      callback: function(messages) {
        messages[0].forEach(function(m){ 
          displayOutput(m);
        });
      }
    });
  }

  pubnub.subscribe({
    channel: channel,
    restore: true,
    connect: getHistory,
    disconnect: function(res){
      console.log('disconnect called');
    },
    reconnect: function(res){
      console.log('reconnecting to pubnub');
    },
    callback: function(m) {
      displayOutput(m);
    },
    presence: function(m){
      if(m.occupancy === 1) {
        presence.textContent = m.occupancy + ' person online';
      } else {
        presence.textContent = m.occupancy + ' people online';
      }
      if((m.action === 'join') || (m.action === 'timeout') || (m.action === 'leave')){
        var status = (m.action === 'join') ? 'joined' : 'left';
        action.textContent = m.uuid + ' ' + status +' room';
        action.classList.add(m.action);
        action.classList.add('poof');
        action.addEventListener('animationend', function(){action.className='';}, false);
      }
    }
  });

  function post() {
    var safeText = input.value.replace(/\&/g, '&amp;').replace( /</g,  '&lt;').replace(/>/g,  '&gt;');
    console.log(safeText);

    pubnub.publish({
      channel: channel,
      message: { 
        text: safeText, 
        userid: user.id 
      },
      callback: function() {
        var q = safeText.toLowerCase();
        
        if (q.indexOf('/lyft eta') > -1) {
          showEta();
        }
        else if (q.indexOf('/lyft') > -1) {
          showDrivers();
        }
        input.value = '';
      }
    });
  }

  function getCurrentLocation() {
    console.log('Getting your location...');
    if ('geolocation' in navigator) {
     navigator.geolocation.getCurrentPosition(function(position) {
        console.log(position.coords.latitude, position.coords.longitude );
        lat = position.coords.latitude;
        lng = position.coords.longitude;
     });
    }
  }

  function fetchJson(url, callback) {
    var auth = 'Bearer '+user.accessToken;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', auth);

    xhr.onload = function() {
      console.log(xhr.status);
      if(xhr.status !== 200) return;

      var json = JSON.parse(xhr.response);
      console.log(json);
      callback(json);
      
    };
    xhr.onerror = function(e) {
      console.log(e);
    };
    xhr.send();
  }

  // Lyft APIs

  function showDrivers() {
    var api = 'https://api.lyft.com/v1/drivers';
    var params = 'lat='+lat+'&lng='+lng;
    var url = api+'?'+params;

    fetchJson(url, function(json){
      var results = json.nearby_drivers;

      var arr = [];
      arr[0] = lat + ',' + lng; // current user location

      // To Do - show all Lyft types (e.g. Line)
      results.forEach(function(t){ 
        if(t.ride_type === 'lyft') {
          t.drivers.forEach(function(d){
            arr.push(d.locations[0].lat + ',' + d.locations[0].lng);
          });
          var mapUrl = getDriversMapUrl(arr);
          publishLyftStatus('Nearby Lyft drivers...', mapUrl);
        }
      });
    });
  }

  function getDriversMapUrl(array) {
    // https://maps.google.com/maps/api/staticmap
    // ?center=Brooklyn+Bridge,New+York,NY&zoom=13&size=600x300
    // &maptype=roadmap&markers=color:blue%7Clabel:S%7C40.702147,-74.015794
    // &markers=color:green%7Clabel:G%7C40.711614,-74.012318
    // &markers=color:red%7Clabel:C%7C40.718217,-73.998284

    return 'https://maps.google.com/maps/api/staticmap?zoom=15&size=560x300&center='+array[0]+'&markers=label:1%7C'+array[1]+'&markers=label:1%7C'+array[1]+'&markers=label:2%7C'+array[2]+'&markers=label:3%7C'+array[3]+'&markers=label:4%7C'+array[4]+'&markers=label:5%7C'+array[5];
  }

  function showEta() {
    var api = 'https://api.lyft.com/v1/eta';
    var params = 'lat='+lat+'&lng='+lng;
    var url = api+'?'+params;

    fetchJson(url, function(json){
      var results = json.eta_estimates;

      var text = 'ETA for: ';

      results.forEach(function(d){ 
        text += d.display_name + ' = ' + ~~d.eta_seconds/60 + ' min. ';
      });
      publishLyftStatus(text);
    });
  }

  function publishLyftStatus(text, image) {
    pubnub.publish({
      channel: channel,
      message: {
        userid: 'Lyft Bot',
        text: text,
        image: image
      }
    });
  }

  input.addEventListener('keyup', function(e) {
    if(input.value === '') return;
    (e.keyCode || e.charCode) === 13 && post();
  }, false);

  send.addEventListener('click', function(e) {
    if(input.value === '') return;
    post();
  }, false);


})();