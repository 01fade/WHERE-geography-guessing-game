var app = {};

app.init = function() {
  var socket;
  var name;
  var start = function() {
    // connect to socket server
    socket = io.connect();
    // listen for global server message
    socket.on('global message', function(data) {
      $('#server-message').html(data);
    });
    name = prompt("Please enter your name", "Harry Potter");
    attachEvents();
  };

  var attachEvents = function() {
    // when submit
    $('#js-btn-send').on('click', function() {
      // Store input value in var char_msg
      var chat_msg = $('#js-ipt-text').val();
      console.log('Sending: ' + chat_msg);
      // emit a marker to server
      socket.emit('marker', {
        name: name,
        msg: chat_msg
      });
      // Reset input field
      $('#js-ipt-text').val('');
    });

    // listen for server messages
    socket.on('from clients', function(res) {
      console.log(res);
      var tplToCompile = $('#tpl-chat-item').html();
      var compiled = _.template(tplToCompile)({
        timestamp: _.now(),
        data: res
      });
      $('#chat-container').prepend(compiled);

    });
  };
  start();
};

app.init();
