var express = require('express');
var router = express.Router();
//var fs = require('fs');

//var serverLogicClass = require('./server_logic.js');
//var serverLogic = new serverLogicClass();

module.exports = function (io, router) 
{
	var ServerReceiver = function() 
	{
	};
	
	var serverLogic = require('./server_logic.js')( io );

	router.post('/room/join', function(req, res, next)
	{
		var gameName = req.body.gameName;
		var player   = req.body.player;
		
		try
		{
			// name of game, player to add and IO socket channel
			res.json( serverLogic.joinRoom( gameName, player, configureSocketSubscriptions ) );
		}
		catch (err)
		{
			console.log('err> %o', err);
			res.status( err ).send({ error: 'You are already in a room, dummy' });
		}
	});
	
	router.post('/player/choose', function(req, res, next) {
		var clientData = req.body;
	
		console.log('calling choose_player> %o', clientData);
	
		var success = serverLogic.choosePlayer( 
				req.body.gameId, 
				req.body.player.id, 
				req.body.playerConfig );
	
		res.json( { 'success' : success } );
	});
	
	
	var configureSocketSubscriptions = function( gameInstance )
	{
		var urlid = '/' + gameInstance.name;
	
		console.log('attachingIO> joining ' + urlid + '/[on_data]');
	
		// create sockets, pass back chat names
		var chat = io.of(urlid).on('connection', function(socket)
		{
			console.log('server> CONNECTED TO SERVER');
	
			// join chat room
			socket.join(gameInstance.name);
	
			socket.on('disconnect', function () 
			{
				console.log('disconnected player_id=' + socket.player);
				
				// remove from server list
				serverLogic.playerHasLeft( socket.player, socket );
			});
	
			// -------------------------------------------------------
			// Lobby Config
			// -------------------------------------------------------
			
			socket.on('player_joined', function( player )
			{
				socket.player = player;
				serverLogic.playerHasJoined( player, socket );
			});
			
			socket.on('player_left', function( player )
			{
				serverLogic.playerHasLeft( player, socket );
			});
			
			socket.on('player_attr_updated', function( player )
			{
				serverLogic.playerAttributeUpdated( player, socket );
			});
			
			// -------------------------------------------------------
			// Game Play Config
			// -------------------------------------------------------			
			
			socket.on('player_is_ready', function( player )
			{
				serverLogic.playerIsReady( player, socket );		
			});
			
			socket.on('player_has_loaded_map', function( player )
			{
				serverLogic.playerHasLoadedMap( player, socket );
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

	return router;
}






///* GET users listing. */
//router.get('/list_games', function(req, res, next)
//{
//	res.json(getStubGameList());
//});
//
//function getStubGameList()
//{
//	var gameList =
//
//	[
//	{
//		name : 'Tim\'s Game',
//		max_players : 5,
//		max_duration : 1,
//		map : 'lobby'
//	},
//	{
//		name : 'Satan\'s Broom Closet',
//		max_players : 3,
//		max_duration : 2,
//		map : 'closet'
//	} ];
//
//	return gameList;
//}
//
//
//
//
//module.exports = router;
