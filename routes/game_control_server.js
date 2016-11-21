var express = require('express');
var router = express.Router();

var activeGameList = [];


/* GET users listing. */
router.get('/list_games', function(req, res, next)
{
	res.json(getStubGameList());
});


router.post('/room/join', function(req, res, next)
{
	var clientData = req.body;

	var roomName = clientData.name;
	var player = clientData.player;
	
	if ( typeof player.isLeader == 'undefined' )
	{
		var newGameData = createRoom(roomName, player, req.app.get('io'));
		// attach chat channel to client gameData object
		res.json(newGameData);
	}
	else 
		res.status(500).send({ error: 'You are already in a room, dummy!' });	
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

function createRoom(roomName, player, IO)
{	
	// check if it already exists
	var gameData = findGameByName( roomName );
	var newPlayer;
	var isLeader = false;
	
	// if it doesn't, create it
	if ( gameData == null )
	{
		gameData = {};
		
		// attach IO
		var chatChannel = roomName + 'chat';
		var dataChannel = roomName + 'data';

		gameData.name = roomName;
		gameData.chatchannel = chatChannel;
		gameData.datachannel = dataChannel;
		
		attachIO(chatChannel, dataChannel, gameData, IO);

		// submit game in active game list
		activeGameList.push(gameData);
		
		// empty player array
		gameData.players = [];
		
		isLeader = true;
	}
	
	// create and add ourself
	newPlayer = createPlayer( player.name, gameData, isLeader );
	gameData.players.push( newPlayer );

	//chat.emit('player_joined', gameData.players, newPlayer);	

	// return data to ourself
	return {
		"gameData"	: gameData,
		"player" 	: newPlayer
	};
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

function createPlayer( playerName, gameData, isLeader )
{
	var newPlayer = {};
	
	newPlayer.name = playerName;
	newPlayer.player_id = createId( gameData );
	newPlayer.isLeader = isLeader;
	
	console.log( 'player [' + playerName + '](leader:' + isLeader + ') has id {' + newPlayer.player_id + '}');
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

function findGameByPlayerId( player_id )
{
	var game;
	// look through all games
	for ( var g=0; g<activeGameList.length; g++ )
	{
		game = activeGameList[g];
		
		// now loop through players in each game to find matching id
		for ( var p=0; p<game.players.length; p++ )
		{
			if ( game.players[p].player_id == player_id )
				return game;
		}
	}
	return null;
}

/*
function removePlayer( player )
{
	var gameData = player.gameData;
	var serverPlayers = gameData.players;

	removePlayerById( player.player_id, serverPlayers );
}
*/

function removePlayerById( player_id )
{
	var gameData = findGameByPlayerId( player_id );
	
	if ( gameData == null )
	{
		console.log("ERROR - GAME DATA IS NULL!");
		return;
	}
	
	var serverPlayers = gameData.players;
	
	for ( var p=0; p<serverPlayers.length; p++ )
	{
		if ( serverPlayers[p].player_id == player_id )
		{
			console.log('removing player(' + player_id + ')[' + serverPlayers[p].name + ']');
			serverPlayers.splice( p, 1 );
			return;
		}
	}
}

function playerHasLeft( player, socket )
{
	// find game associated with player
	var gameData = findGameByPlayerId( player.player_id );
	var serverPlayers = gameData.players;
	
	console.log( serverPlayers );
	
	for ( var p=0; p < serverPlayers.length; p++)
	{
		console.log('checking for player [' + player.name + '] in list entry [' + serverPlayers[p].name + ']');
		if ( serverPlayers[p].player_id == player.player_id )
		{
			serverPlayers.splice(p, 1);
			break;
		}
	}
	
	console.log('server[player_left]> got data : ' + player.name);
//	chat.emit('player_left', serverPlayers, player);
	socket.broadcast.to(gameData.name).emit('player_left', serverPlayers, player);

}

function playerHasJoined( player, socket )
{
	// find game associated with player
	var gameData = findGameByPlayerId( player.player_id );
	var serverPlayers = gameData.players;
	
	/*
	for ( var p=0; p < serverPlayers.length; p++)
	{
		if ( serverPlayers[p].name == player.name )
		{
			serverPlayers = serverPlayers.splice(p, 1);
			break;
		}
	}
	*/
	
	console.log('server[player_joined]> got data : ' + player.name);
	socket.broadcast.to(gameData.name).emit('player_joined', serverPlayers, player);
	//chat.emit('player_joined', serverPlayers, player);	
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
			console.log('disconnected player_id=' + socket.player);
			
			// remove from server list
			// TODO:  Make test cases for these remove/add player utilities
//			removePlayerById( socket.player_id );
			playerHasLeft( socket.player, socket );

		});
		 
		socket.on('player_attr_updated', function( player )
		{
			console.log('server[player_attr_updated]> got player: ' + player.name );
			var newPlayer = player;
			
			/*
			if ( player.stub == true )
			{
				console.log('found stub, first time player update for [' + player.name + ']');
				newPlayer = createPlayer( player.name, gameData );
				
				if ( serverPlayers.length == 0 )
				{
					console.log('you are the first one in - you are the leader');
					newPlayer.isLeader = true;
				}
				else
					newPlayer.isLeader = false;
				
				serverPlayers.push( newPlayer );
			}
			else
			{
				var oldPlayerIndex = getPlayerIndex( player, serverPlayers );
				console.log('old player index: ' + oldPlayerIndex );
				replacePlayerByIndex( player, oldPlayerIndex, serverPlayers );
			}
*/			
			// TODO:  Move this player_id set logic to somewhere more appropriate
			socket.player_id = newPlayer.player_id;
			
			chat.emit('player_attr_updated', serverPlayers, newPlayer);
		});

		socket.on('player_left', function( player )
		{
			playerHasLeft( player, socket );
			//socket.broadcast.to(gameData.name).emit('player_left', data);
		});

		
		socket.on('player_joined', function( player )
		{
			console.log('socket[' + socket.player_id + '] new_id=[' + player.player_id + ']');
			socket.player = player;
			playerHasJoined( player, socket );
			//socket.broadcast.to(_gameData.name).emit('player_joined', data);
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

		socket.on('start_pre_game', function( gameName )
		{
			console.log('server received request to start the pre-game');
			
			// TODO:  randomize start locations between players			
			//var gameData = 
			
			chat.emit('start_pre_game', null );
		});
	});
}

module.exports = router;
