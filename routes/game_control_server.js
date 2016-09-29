var express = require('express');
var router = express.Router();

var activeGameList = [];

var serverPlayers = [];


/* GET users listing. */
router.get('/list_games', function(req, res, next)
{
	res.json(getStubGameList());
});

router.post('/room/create', function(req, res, next)
{
	var gameData = req.body;

	if (!createRoom(gameData, req.app.get('io')))
	{
		// room is set up already, just join it
		console.log('create> room exists already, joining...');

		// something went wrong, return error
		// res.status(500).send( gameData.error );
		// console.log('DID U SEE THIS? BECASE YOU SHOULDNT HAVE!!!!!');
	}

	// attach chat channel to client gameData object
	res.json(gameData);
});

router.post('/room/join', function(req, res, next)
{
	var gameData = req.body;

	if (!createRoom(gameData, req.app.get('io')))
	{
		// room is set up already, just join it
		console.log('join> room exists already, joining...');
	}

	// attach chat channel to client gameData object
	res.json(gameData);
});

function getStubGameList()
{
	var gameList =

	[
	{
		name : 'Tim\'s Game',
		max_players : 5,
		max_duration : 1,
		map : 'lobby'
	},
	{
		name : 'Satan\'s Broom Closet',
		max_players : 3,
		max_duration : 2,
		map : 'closet'
	} ];

	return gameList;
}

function gameExists(name)
{
	for (var i = 0; i < activeGameList.length; i++)
	{
		console.log('searching game entries [' + activeGameList[i].name + ']');
		if (activeGameList[i].name == name)
		{
			console.log('--> found duplicate [' + name + ']');
			return true;
		}
	}

	console.log('game [' + name + '] does not exist');
	return false;
}

function createRoom(gameData, IO)
{
	// attach IO
	var chatChannel = gameData.name + 'chat';
	var dataChannel = gameData.name + 'data';

	gameData.chatchannel = chatChannel;
	gameData.datachannel = dataChannel;

	// check if it already exists
	if (gameExists(gameData.name))
	{
		// gameData.error = 'game [' + gameData.name + '] already exists,
		// joining';
		// return false;
		return false;
	}

	attachIO(chatChannel, dataChannel, gameData, IO);

	// submit game in active game list
	activeGameList.push(gameData);

	return true;
}

function attachIO(chatChannel, dataChannel, gameData, IO)
{
	var urlid = '/' + gameData.name;

	console.log('attachingIO> joining ' + urlid + '/[' + chatChannel + ']');

	// create sockets, pass back chat names
	var chat = IO.of(urlid).on('connection', function(socket)
	{
		console.log('server> CONNECTED TO SERVER');

		// join chat room
		socket.join(gameData.name);

		socket.on('player_entered', function( player )
		{
			serverPlayers.push( player );
			
			console.log('server[player_entered]> got player: ' + player);
			//socket.broadcast.to(gameData.name).emit('player_entered', player);
			chat.emit('player_entered', serverPlayers);
			//socket.emit('player_entered', player);
		});

		socket.on('player_left', function( player )
		{
			for ( var p=0; p < serverPlayers.length; p++)
			{
				if ( serverPlayers[p].name == player.name )
				{
					serverPlayers = serverPlayers.splice(p, 1);
					break;
				}
			}
			
			console.log('server[player_left]> got data: ' + player);
			//socket.broadcast.to(gameData.name).emit('player_left', data);
			socket.emit('player_left', serverPlayers);
		});

		socket.on('player_attr_updated', function(data)
		{
			console.log('server[player_attr_updated]> got data: ' + data);
			socket.broadcast.to(gameData.name).emit('player_attr_updated', data);
			//socket.emit('player_updated', data);
		});
		
		// join data channel
		socket.on(dataChannel, function(data)
		{
			// console.log('server[' + dataChannel + ']> got data: ' + data);
			socket.broadcast.to(gameData.name).emit(dataChannel, data);
		});

		socket.on(chatChannel, function(data)
		{
			console.log('server[' + chatChannel + ']> got data: ' + data);
			socket.broadcast.to(gameData.name).emit(chatChannel, data);
		});

		socket.on('start_game', function(data)
		{
			console.log('server received request to start game');
			chat.emit('start_game', data);
		});
	});
}

module.exports = router;
