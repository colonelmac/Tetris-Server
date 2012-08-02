var WebSocket = require('faye-websocket'),
	sockets   = [],
	http	  = require('http'), 
	server    = http.createServer();

Array.prototype.remove = function (item) {
	var len = this.length;

	for(var i = 0; i < len; i++) {
	    if(this[i] === item) {
	        return this.slice(0, i).concat(this.slice(i + 1, len));
	    }
	}

	return this;
};

function broadcast (msg, c) {
	for (var i = 0; i < sockets.length; i++) {
		var s = sockets[i];
		s.send(JSON.stringify({
			content   : c,
			message	  : msg,
			broadcast : true
		}));
	}
}

// Client is upgrading from HTTP to WebSockets
server.addListener('upgrade', function (request, socket, head) {
	var ws = new WebSocket(request, socket, head);

	sockets.push(ws);

	ws.onmessage = function (e) {
		var msg = JSON.parse(e.data); 

		if(msg.broadcast) {
			broadcast(msg.message, msg.content);
		}
		else { 
			ws.send(JSON.stringify({
				content   : 'text',
				message   : 'Well, hello there program...',
				broadcast : false 
			}));
		}
	};

	ws.onopen = function (e) {
		console.log('Connection opened!')
	};

	ws.onclose = function (e) {
		console.log('Connection closed!');
		
		for(var i = 0; i < sockets.length; i++) {
			var s = sockets[i];

			if (s === ws) {
				sockets = sockets.remove(s);
				break;
			}
		}
	};
});

server.listen(3000);