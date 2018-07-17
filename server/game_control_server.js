var express = require('express');
var router = express.Router();
var fs = require('fs');

var activeGamesClass = require('./activegames.js');
var activeGames = new activeGamesClass();

router.post('/room/join', function(req, res, next)
{
	var clientData = req.body;

	var gameName = clientData.gameName;
	var player = clientData.player;
	
	if ( typeof player.isLeader == 'undefined' )
	{
		var newGameData = createRoom(gameName, player, req.app.get('io'));
		// attach chat channel to client gameInstance object
		res.json(newGameData);
	}
	else 
		res.status(500).send({ error: 'You are already in a room, dummy!' });	
});

var default_spy_def = {
		stand : 'wspy_stand',
		stand_right : 'wspy_rstand',
		run_right : 'wspy_rrun',
		stand_left : 'wspy_lstand',
		run_left : 'wspy_lrun'
};

var green_spy_def = {
		stand : 'gspy_stand',
		stand_right : 'gspy_rstand',
		run_right : 'gspy_rrun',
		stand_left : 'gspy_lstand',
		run_left : 'gspy_lrun'
};

var once = true;

router.post('/player/choose', function(req, res, next) {
	var clientData = req.body;

	/**
		var clientData = {
				player : player,
				playerConfig : playerConfig,
				gameId : _gameInstance.game_id
		};
	 */
	
	console.log('calling choose_player> %o', clientData);

	var success = true;

	// - player reservering the config
	// - the config being reserver
	// - the game instance id
	
	
	// find the other players in the game
	var players = activeGames.findPlayersByGameId( clientData.gameId );
	var current_player;
		
	console.log('verifying that player X\'s config doesn\'t match anyone elses');
	var p = players.length;
	while ( p-- )
	{
		// skip checking the player in question
		if ( players[p].id == clientData.player.id )
		{
			current_player = players[p];
			continue;
		}

		// if they haven't chosen a color yet...
		if ( players[p].player_def == undefined )
			continue;
		
		// compare colors so we don't have 2 players with the same color
		if ( players[p].player_def.color == clientData.playerConfig.color )
		{
			success = false;
			break;
		}
	}
	
	if ( success == true )
	{
		console.log('success - reserving player config');
				
		// set server player property
		current_player.player_def = clientData.playerConfig;
		
		var IO = req.app.get('io');
		
		var game = activeGames.findGameById( clientData.gameId );
		
		console.log('game name> %o', game.name);
		
		// send message to everybody that this player is now off the market
		IO.of( '/' + game.name ).emit('on_chosen_player', clientData.player.id, current_player.player_def );
	}
	else
	{
		console.log('error - player already reserved');
	}
	
	res.json( { 'success' : success } );
});


function createRoom(gameName, player, IO)
{	
	// check if it already exists
	var gameInstance = activeGames.findGameByName( gameName );
	var newPlayer;
	var isLeader = false;
	
	// if it doesn't, create it
	if ( gameInstance == null )
	{
		// submit game in active game list
		gameInstance = activeGames.createGame( gameName );
				
		attachIO( gameInstance, IO );
		
		console.log( gameInstance );

		isLeader = true;
	}
	
	// create and add ourself
	var newPlayer = gameInstance.createPlayer( player.name, isLeader );
		
	// return data to ourself
	return {
		"gameInstance"	: gameInstance,
		"player" 		: newPlayer
	};
}


function playerHasLeft( player, socket )
{
	console.log('playerHasLeft> %o', player );

	// find game associated with player
	var gameInstance = activeGames.findGameByPlayerId( player.id );
	
	gameInstance.removePlayerById( player.id );
	
	console.log('server[player_left]> got data : ' + player.name);
	socket.broadcast.to(gameInstance.name).emit('on_player_left', gameInstance.players, player);
}

function playerHasJoined( player, socket )
{
	console.log('playerHasJoined> %o', player );

	// find game associated with player
	var gameInstance = activeGames.findGameByPlayerId( player.id );
	var serverPlayers = gameInstance.players;
	
	socket.broadcast.to(gameInstance.name).emit('on_player_joined', serverPlayers, player);
}

function playerAttributeUpdated( player, socket )
{
	console.log('playerAttributeUpdated> %o', player );
	
	// find game associated with player
	var gameInstance = activeGames.findGameByPlayerId( player.id );
	
	//gameInstance.players.removePlayerById( player.id );
	
	console.log('server[player_attr_updated]> got data : ' + player.name);
	socket.broadcast.to(gameInstance.name).emit('on_player_attr_updated', gameInstance.players, player);
}

function loadMapData( levelName )
{
	// load map data on server
	return JSON.parse(fs.readFileSync('public/data/level_' + levelName + '.json', 'utf8'));
}

function setStartingLocation( gameInstance, player, chat )
{
	// find game associated with player
	var gameInstance = activeGames.findGameByPlayerId( player.id );

	console.log( 'setting stating location for player ', player.id );
	var room = gameInstance.getStartingLocation( player.id );
	
	// starting location sends us to a room and the physical center
	var teleports_to = {	
	  	"room" : room.id,
	  	"pos" : { 
	  		"x" : 200, 
	  		"y" : 200 
	  	}
	}
		  	
	chat.emit('on_player_entered_room', player, teleports_to);	
}

function setStartingLocations( gameInstance, socket )
{
	var room;
	var data;  
	var p = gameInstance.players.length;
	while ( p-- )
	{
		console.log('playerIter> %o', gameInstance.players[p] );
		setStartingLocation( gameInstance, gameInstance.players[p], socket );		
	}
}

function attachIO(gameInstance, IO)
{
	var urlid = '/' + gameInstance.name;

	console.log('attachingIO> joining ' + urlid + '/[on_data]');

	// create sockets, pass back chat names
	var chat = IO.of(urlid).on('connection', function(socket)
	{
		console.log('server> CONNECTED TO SERVER');

		// join chat room
		socket.join(gameInstance.name);

		socket.on('disconnect', function () 
		{
			console.log('disconnected player_id=' + socket.player);
			
			// remove from server list
			playerHasLeft( socket.player, socket );
		});

		// -------------------------------------------------------
		// Lobby Config
		// -------------------------------------------------------
		
		socket.on('player_joined', function( player )
		{
			socket.player = player;
			playerHasJoined( player, socket );
		});
		
		socket.on('player_left', function( player )
		{
			playerHasLeft( player, socket );
		});
		
		socket.on('player_attr_updated', function( player )
		{
			playerAttributeUpdated( player, socket );
			
			// TODO: Implement this?  It's just for lobby name changes
		});

		
		// -------------------------------------------------------
		// Game Play Config
		// -------------------------------------------------------
			
		
		socket.on('player_is_ready', function( player )
		{
			var gameInstance = activeGames.findGameByPlayerId( player.id );

			socket.broadcast.to(gameInstance.name).emit('on_player_is_ready', player);

			// TODO: add something to remember who clicked start
			
			// keep track of players loaded to provide feedback to waiting players as to who is the slow poke
			if ( ++gameInstance.players_loaded >= gameInstance.players.length )
			{
				var levelName = "lobby";
				
				gameInstance.setMapData( loadMapData( levelName ) );

				chat.emit('on_load_map', gameInstance);					
			}			
		});
		
		socket.on('player_has_loaded_map', function( player )
		{
			var gameInstance = activeGames.findGameByPlayerId( player.id );
			
			// keep track of players loaded to provide feedback to waiting players as to who is the slow poke
			if ( gameInstance.verifyMapsLoaded(player) === true )
			{
				console.log('setting starting locations...');
				// this will call 'on_player_entered_room'
				setStartingLocations( gameInstance, chat );
				
				// now start it!
				chat.emit('on_start_game', gameInstance );
			}
		});

		socket.on('start_pre_game', function()
		{
			console.log('server received request to start the pre-game');				
			chat.emit('on_start_pre_game', null );
		});
		
		socket.on('start_game', function( game_id )
		{
			console.log('server received request to start the game');
		});
		
		// -------------------------------------------------------
		// Game Play
		// -------------------------------------------------------

		// join data channel
		socket.on('on_data', function( spyPos )
		{
			socket.broadcast.to(gameInstance.name).emit('on_data', spyPos);
		});

		socket.on('on_chat', function(data)
		{
			socket.broadcast.to(gameInstance.name).emit('on_chat', data);
		});
		
		socket.on('player_entered_room', function(player, teleports_to)
		{
			chat.emit('on_player_entered_room', player, teleports_to );
		});		

		socket.on('player_left_room', function(player, roomId)
		{
			chat.emit('on_player_left_room', player, roomId );
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
