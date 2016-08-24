/**
 * New node file
 */

function getPlayerStub( name )
{
	var bob = {
		name : name,
		pos : { x : 30, y : 45, room : 108 }
	};
	
	return bob;
}



function testRoute()
{
	$.ajax({
	    type: 'get',
	    url: '/cvc/list_games',
	    success: function (data) {
	        // use data
	    	console.log( data );
	    },
	    error : function(data)
	    {
	    	console.log('ERROR!');
	    	console.log(data);
	    }
	});
}

var Client = function()
{
	var myClient = {};

	var socket = io(); // .connect('http://localhost:3000');

	socket.on('game channel', function(msg)
	{
		console.log('got game data[' + msg + ']');
	});

	socket.on('position channel', function(msg)
	{
		console.log('got pos data[' + msg + ']');
	});

	socket.on('chat channel', function(msg)
	{
		console.log('got chat[' + msg + ']');
	});

	myClient.sendSocketData = function(channel, data)
	{
		console.log('sending ' + channel + ' message');
		// socket.emit('chat message', msg);
		socket.emit(channel, data);
	};

	myClient.startGame = function(data)
	{		
		console.log('starting game with data: ' + data);
	
		socket.emit('chat channel', "player " + data.name + " has joined the game.");
	};

	myClient.createServerRoom = function( gameData )
	{		
		console.log('creating server room [' + gameData.name + ']');
	
		socket.emit('cvc', gameData );
	};
	
	return myClient;
};

/*
 * var Client = (function () { var myClient = {}; var privateMethod = function () {
 *  }; myClient.publicMethod = function () {
 *  }; myClient.anotherPublicMethod = function () {
 *  }; return myClient; // returns the Object with public methods })();
 *  // usage Client.publicMethod();
 */