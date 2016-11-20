var express = require('express');
var router = express.Router();

var activeGameList = [];

var serverPlayers = [];


/* GET users listing. */
router.get('/list_games', function(req, res, next)
{
	res.json(getStubGameList());
});


router.post('/room/join', function(req, res, next)
{
	var gameData = req.body;

	var newGameData = createRoom(gameData, req.app.get('io'));
	
	// attach chat channel to client gameData object
	res.json(newGameData);
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

function findGameByName(name)
{
	for (var i = 0; i < activeGameList.length; i++)
	{
		console.log('finding game by name [' + activeGameList[i].name + ']');
		if (activeGameList[i].name == name)
			return activeGameList[i];
	}

	return null;
}

function gameExists(name)
{
	return findGameByName( name ) != null;
}

function createRoom(gameData, IO)
{
	// attach IO
	var chatChannel = gameData.name + 'chat';
	var dataChannel = gameData.name + 'data';

	gameData.chatchannel = chatChannel;
	gameData.datachannel = dataChannel;

	// check if it already exists
	var storedGame = findGameByName( gameData.name );
	if ( storedGame != null )
	{
		// add ourself
		
		// send message to other listeners that game data has changed
		
		// return data to ourself
		return storedGame;
	}

	attachIO(chatChannel, dataChannel, gameData, IO);

	// submit game in active game list
	activeGameList.push(gameData);

	return gameData;
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
	removePlayerById( player.player_id, players );
}

function removePlayerById( player_id, players )
{
	for ( var p=0; p<players.length; p++ )
	{
		if ( players[p].player_id == player_id )
		{
			console.log('removing player(' + player_id + ')[' + players[p].name + ']');
			players.splice( p, 1 );
			return;
		}
	}
}

function playerHasLeft( player )
{
	for ( var p=0; p < serverPlayers.length; p++)
	{
		if ( serverPlayers[p].name == player.name )
		{
			serverPlayers = serverPlayers.splice(p, 1);
			break;
		}
	}
	
	console.log('server[player_left]> got data : ' + player);
	chat.emit('player_left', serverPlayers, player);	
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

		socket.on('disconnect', function () 
		{
			//io.emit('user disconnected');
			console.log('disconnected player_id=' + socket.player_id);
			
			// remove from server list
			// TODO:  Make test cases for these remove/add player utilities
			removePlayerById( socket.player_id, serverPlayers );
		});
		 
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
			
			// TODO:  Move this player_id set logic to somewhere more appropriate
			socket.player_id = newPlayer.player_id;
			
			chat.emit('player_attr_updated', serverPlayers, newPlayer);
		});

		socket.on('player_left', function( player )
		{
			playerHasLeft( player );
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

		socket.on('start_new_game', function( gameData )
		{
			console.log('server received request to start game');
			
			// TODO:  randomize start locations between players			

			chat.emit('start_new_game', gameData);
		});
	});
}

module.exports = router;
