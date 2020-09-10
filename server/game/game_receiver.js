
module.exports = function (io, gameLogic, gameManager)
{
	const ServerReceiver = function()
	{
	};

	ServerReceiver.configureSockets = function( socket )
	{
		// -------------------------------------------------------
		// Game Prep
		// -------------------------------------------------------

		/**
		 * Received when a player chooses pre-game options like character color.
		 */
		socket.on('player_update_options', function( data )
		{
			gameLogic.playerUpdateOptions( socket, data.roomName, data.player );
		});

		/**
		 * Received when a player has indicated they are done choosing
		 * options and are ready to start.
		 */
		socket.on('player_is_ready', function( player )
		{
			gameLogic.playerIsReady( player, socket );
		});

		// todo: verify we need this after refactoring
		socket.on('player_has_loaded_map', function( player )
		{
			gameLogic.playerHasFinishedLoadingResources( player );
		});

		// -------------------------------------------------------
		// Game Play
		// -------------------------------------------------------

		/**
		 * Received when a player moves their character or changes state
		 */
		socket.on('player_state_update', function( playerStateData )
		{
			gameLogic.playerStateUpdate( socket, playerStateData );
		});

		// socket.on('player_entered_room', function(player, teleports_to)
		// {
		// 	chat.emit('on_player_entered_room', player, teleports_to );
		// });
		//
		// socket.on('player_left_room', function(player, roomId)
		// {
		// 	chat.emit('on_player_left_room', player, roomId );
		// });
	};

	return ServerReceiver;
};
