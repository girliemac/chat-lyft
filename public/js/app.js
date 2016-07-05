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

  var channel = 'chat-demo';

  var keysCache = {};
  
  var pubnub = PUBNUB.init({
    subscribe_key: 'sub-c-00ac33a4-3e28-11e6-971e-02ee2ddab7fe',
    publish_key: 'pub-c-1a5f74ed-f634-47eb-a1b9-53d98390c644'
  });


  function displayOutput(message) {
    if(!message) return;
    if(typeof(message.text) === 'undefined') return;

    console.log(message);

    var html = '';

    if ('userid' in message ) {

      //html = '<p><img src="'+ message.userid.avatar +'" class="avatar"><strong>' +  keysCache[message.userid].username + '</strong><br><span>' + message.text + '</span></p>';

      //output.innerHTML = html + output.innerHTML;

    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/user/' + message.userid, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          var res = JSON.parse(xhr.responseText);

          keysCache[message.userid] = {
            // 'publicKey': res.publicKey,
            // 'username': res.username,
            // 'displayName': res.displayName,
            // 'avatar': res.avatar_url,
            'id': res.id
          }
          displayOutput(message);
        }
      };
      xhr.send(null); 
    }
  }

  function getHistory() {
    pubnub.history({
      channel  : channel,
      count    : 30,
      callback : function(messages) {
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

    pubnub.publish({
      channel: channel,
      message: { 
        text: safeText, 
        userid: user.id 
      },
      callback: function() {
        if (safeText.toLowerCase().indexOf('/lyft') > -1) {
          console.log(safeText.toLowerCase());
          var query = safeText.replace('/lyft ', '').split(' ').join('+');
          
          hailLyft(query);
        }
        input.value = '';
      }
    });
  }

  // Lyft API --- TO DO
  function hailLyft(q) {
    console.log(q);
    var url = '';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
      var json = JSON.parse(xhr.response);
      //
      // get a car
    };
    xhr.onerror = function(e) {
      console.log(e);
    };
    xhr.send();
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