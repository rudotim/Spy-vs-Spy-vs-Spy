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
				modalPlayerConfig : modalPlayerConfig,
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
		
		// TODO: compare player configs for conflicting properties
	}
	
	if ( success == true )
	{
		console.log('success - reserving player config');
				
		// set server player property
		if ( once == true )
			current_player.player_def = default_spy_def;
		else
			current_player.player_def = green_spy_def;
		
		once = false;
		
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

function loadMapData( gameInstance, levelName, chat )
{
	// load map data on server
	var jsonMapData = JSON.parse(fs.readFileSync('public/data/level_' + levelName + '.json', 'utf8'));

	gameInstance.setMapData( jsonMapData );
	
	chat.emit('on_load_map', jsonMapData);	

	console.log('loaded data> %o', jsonMapData);
}

function setStartingLocation( gameInstance, player, chat )
{
	// find game associated with player
	var gameInstance = activeGames.findGameByPlayerId( player.id );

	var room = gameInstance.getStartingLocation( player.id );
	
	data = {
		"room" : room,
		"player" : player
	};
	
	// now let everyone know
	chat.emit('on_player_entered_room', data);	
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
		
		/*
		room = gameInstance.getStartingLocation( gameInstance.players[p].id );
		
		data = {
			"room" : room,
			"player" : gameInstance.players[p]
		};
		
		// now let everyone know
		chatSocket.emit('on_player_entered_room', data);
		*/
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
		// Game Config
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
			
			// TODO: this needs work
		});

		socket.on('player_is_ready', function( player )
		{
			var gameInstance = activeGames.findGameByPlayerId( player.id );

			socket.broadcast.to(gameInstance.name).emit('on_player_is_ready', player);

			// keep track of players loaded to provide feedback to waiting players as to who is the slow poke
			if ( ++gameInstance.players_loaded >= gameInstance.players.length )
			{
				var levelName = "lobby";
				loadMapData( gameInstance, levelName, chat );
				
				// this will call 'on_player_entered_room'
				setStartingLocations( gameInstance, chat );
				
				// now start it!
				chat.emit('on_start_game', gameInstance );
			}			
			else
				console.log('nope, it\'s not');
				
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

		socket.on('start_pre_game', function()
		{
			console.log('server received request to start the pre-game');
				
			var levelName = "lobby";
			
			// load map data on server
			var jsonMapData = JSON.parse(fs.readFileSync('public/data/level_' + levelName + '.json', 'utf8'));

			gameInstance.setMapData( jsonMapData );
			
			console.log('loaded data> %o', jsonMapData);
			
			chat.emit('on_start_pre_game', null );
		});
		
		socket.on('start_game', function( game_id )
		{
			console.log('server received request to start the game');
				
			console.log('current players> %o', gameInstance.players );
			
			/*
			chat.emit('on_start_game', gameInstance );
			
			// TODO:  Sort out this race condition start crap. 
			// pre_game, start_game, player_entered... fix it
			
			var data;  
			var p = gameInstance.players.length;
			while ( p-- )
			{
				console.log('playerIter> %o', gameInstance.players[p] );
				room = gameInstance.getStartingLocation( gameInstance.players[p].id );
				
				data = {
					"room" : room,
					"player" : gameInstance.players[p]
				};
				
				// now let everyone know
				chat.emit('on_player_entered_room', data);
			}
			*/
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
