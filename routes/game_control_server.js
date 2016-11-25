var express = require('express');
var router = express.Router();

var Players = require('../public/js/players.js');
var activeGamesClass = require('./activegames.js');

var activeGames = new activeGamesClass();


router.post('/room/join', function(req, res, next)
{
	var clientData = req.body;

	var game_id = clientData.game_id;
	var player = clientData.player;
	
	if ( typeof player.isLeader == 'undefined' )
	{
		var newGameData = createRoom(game_id, player, req.app.get('io'));
		// attach chat channel to client gameData object
		res.json(newGameData);
	}
	else 
		res.status(500).send({ error: 'You are already in a room, dummy!' });	
});



function createRoom(game_id, player, IO)
{	
	// check if it already exists
	var gameData = activeGames.findGameById( game_id );
	var newPlayer;
	var isLeader = false;
	
	// if it doesn't, create it
	if ( gameData == null )
	{
		// submit game in active game list
		gameData = activeGames.createGame( game_id, new Players() );
				
		attachIO(gameData.chatchannel, gameData.datachannel, gameData, IO);
		
		console.log( gameData );

		isLeader = true;
	}
	
	// create and add ourself
	var newPlayer = gameData.players.createPlayer( player.name, createId( gameData ), isLeader );
	
	console.log( 'newPlayer:');
	console.log( newPlayer );
	
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
	
	return gameData.game_id + '_' + uid;
}



function playerHasLeft( player, socket )
{
	// find game associated with player
	var gameData = activeGames.findGameByPlayerId( player.player_id );
	
	gameData.players.removePlayerById( player.player_id );
	
	console.log('server[player_left]> got data : ' + player.name);
	socket.broadcast.to(gameData.game_id).emit('player_left', gameData.players, player);
}

function playerHasJoined( player, socket )
{
	// find game associated with player
	var gameData = activeGames.findGameByPlayerId( player.player_id );
	var serverPlayers = gameData.players;
	
	console.log('server[player_joined]> got data : ' + player.name);
	socket.broadcast.to(gameData.game_id).emit('player_joined', serverPlayers, player);
}

function attachIO(chatchannel, datachannel, gameData, IO)
{
	var urlid = '/' + gameData.game_id;

	console.log('attachingIO> joining ' + urlid + '/[' + chatchannel + ']');

	// create sockets, pass back chat names
	var chat = IO.of(urlid).on('connection', function(socket)
	{
		console.log('server> CONNECTED TO SERVER');

		// join chat room
		socket.join(gameData.game_id);

		socket.on('disconnect', function () 
		{
			console.log('disconnected player_id=' + socket.player);
			
			// remove from server list
			playerHasLeft( socket.player, socket );
		});
		 
		socket.on('player_attr_updated', function( player )
		{
			console.log('server[player_attr_updated]> got player: ' + player.name );
			var newPlayer = player;
					
			// TODO:  Move this player_id set logic to somewhere more appropriate
			socket.player_id = newPlayer.player_id;
			
			chat.emit('player_attr_updated', serverPlayers, newPlayer);
		});

		socket.on('player_left', function( player )
		{
			playerHasLeft( player, socket );
		});
		
		socket.on('player_joined', function( player )
		{
			socket.player = player;
			console.log('socket[' + socket.player.player_id + '] new_id=[' + player.player_id + ']');
			playerHasJoined( player, socket );
			//socket.broadcast.to(_gameData.name).emit('player_joined', data);
		});
		
		// join data channel
		socket.on(datachannel, function(data)
		{
			// console.log('server[' + datachannel + ']> got data: ' + data);
			socket.broadcast.to(gameData.game_id).emit(datachannel, data);
		});

		socket.on(chatchannel, function(data)
		{
			console.log('server[' + chatchannel + ']> got data: ' + data);
			socket.broadcast.to(gameData.game_id).emit(chatchannel, data);
		});

		socket.on('start_pre_game', function()
		{
			console.log('server received request to start the pre-game');
						
			chat.emit('start_pre_game', null );
		});
		
		socket.on('start_game', function( game_id )
		{
			console.log('server received request to start the game');
				
			var gameData = activeGames.findGameById( game_id );
			
			// TODO: get players, randomize their locations within the rooms
			
					
			chat.emit('start_game', gameData );
		});
	});
}








/* GET users listing. */
router.get('/list_games', function(req, res, next)
{
	res.json(getStubGameList());
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




module.exports = router;
