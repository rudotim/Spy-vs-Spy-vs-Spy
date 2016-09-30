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

function createId( gameData )
{
	var uid = gameData.uid;
	
	if ( uid == null )
		uid = 0;
	else
		uid++;
	
	gameData.uid = uid;
	
	return gameData.name + '_' + uid;
}

function createPlayer( playerName, gameData )
{
	var newPlayer = {};
	
	newPlayer.name = playerName;
	newPlayer.player_id = createId( gameData );
	
	console.log( 'player [' + playerName + '] has id {' + newPlayer.player_id + '}');
	return newPlayer;
}

function replacePlayerByIndex( player, index, players )
{
	players[index] = player;
	/*
	for ( var p=0; p<players.length; p++ )
	{
		if ( players[p].player_id == player.player_id )
		{
			return p;
		}
	}
	*/
}

function getPlayerIndex( player, players )
{
	for ( var p=0; p<players.length; p++ )
	{
		if ( players[p].player_id == player.player_id )
		{
			console.log( 'get> player [' + players[p].name + '] has id {' + players[p].player_id + '}');
			return p;
		}
	}
}

function removePlayer( player, players )
{
	for ( var p=0; p<players.length; p++ )
	{
		if ( players[p].player_id == player.player_id )
		{
			players.remove(p);
			return;
		}
	}
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

		socket.on('player_attr_updated', function( player )
		{
			console.log('server[player_attr_updated]> got player: ' + player.name );
			var newPlayer = player;
			
			if ( player.stub == true )
			{
				console.log('found stub, first time player update for [' + player.name + ']');
				newPlayer = createPlayer( player.name, gameData );
				serverPlayers.push( newPlayer );
			}
			else
			{
				var oldPlayerIndex = getPlayerIndex( player, serverPlayers );
				console.log('old player index: ' + oldPlayerIndex );
				replacePlayerByIndex( player, oldPlayerIndex, serverPlayers );
			}
			
			chat.emit('player_attr_updated', serverPlayers, newPlayer);
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
			chat.emit('player_left', serverPlayers, player);
			//socket.broadcast.to(gameData.name).emit('player_left', data);
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
