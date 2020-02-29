




const toServerSocket = function( socket )
{
	console.log("Creating new server socket");

	let clientRequest = {};

	/**
	 * Join or create a room with name
	 */
	clientRequest.joinRoom = function( playerId, roomName, socketRoom )
	{
		console.log('Player %o attempting to join game %o', playerId, roomName );

		const data = {
			playerId : playerId,
			roomName : roomName
		};

		socketRoom.emit( 'join_room', data );
	};

	clientRequest.leaveRoom = function( playerId, roomName, socketRoom )
	{
		console.log('Player %o attempting to leave room %o', playerId, roomName );

		const data = {
			playerId : playerId,
			roomName : roomName
		};

		socketRoom.emit( 'leave_room', data );
	};

	clientRequest.listPlayersInRoom = function( roomName, socketRoom )
	{
		console.log('Listing players in room %o', roomName );

		const data = {
			roomName : roomName
		};

		socketRoom.emit( 'list_players', data );
	};

	// const _onJoinRoomSuccess = function( gameInstance, player )
	// {
	// 	var urlid = '/' + gameInstance.name;
	//
	// 	console.log('client joining ' + urlid + '/[' + gameInstance.datachannel + ']');
	//
	// 	// initialize socket to server and establish communication callback channels
	// 	socket = io( urlid );
	//
	// 	socket.on('connection', function(msg)
	// 	{
	// 		console.log('CONNECTED TO SERVER');
	// 	});
	//
	// 	// tell server we have joined the room
	// 	socket.emit( 'player_joined', player );
	//
	// 	// redraw UI with our name in the list
	// 	_updateRoomListUI( gameInstance.players );
	//
	// 	console.log('ok, you\'ve joined room [' + gameInstance.game_id + ']');
	// };


	clientRequest.sendPlayerJoined = function( player )
	{
		socket.emit('player_joined', player );
	};

	/**
	 * Tell backend that one of our properties has updated.
	 */
	_updatePlayerOnServer = function( player )
	{
        socket.emit('player_attr_updated', player );
	};
	
	
	
	// -------------------------------------------------------
	// Lobby Config
	// -------------------------------------------------------



	// /**
	//  * Join or create a room with name
	//  */
	// clientRequest.joinRoom = function( playerObj, roomName )
	// {
	// 	console.log('attempting to join game [' + roomName + ']');
	//
	// 	const clientData =
	// 		{
	// 			"gameName" : roomName,
	// 			"playerObj" : playerObj
	// 		};
	//
	// 	$.ajax(
	// 		{
	// 			type: 'post',
	// 			url: '/room/join/',
	// 			data: JSON.stringify( clientData ),
	// 			contentType: "application/json",
	// 			success: function ( data )
	// 			{
	// 				if ( data != null )
	// 				{
	// 					// ok so now a game was created on the server for us
	// 					_onJoinRoomSuccess( data.gameInstance, data.playerName );
	// 				}
	// 				else
	// 				{
	// 					console.error("failed to find game with name [" + roomName + "]");
	// 				}
	// 			},
	// 			error : function( err )
	// 			{
	// 				console.error('ERROR> %o', err );
	// 			}
	// 		});
	// };

    /**
     * Pop-up the options (player selection) modal window
     */
    clientRequest.showGameOptions = function()
    {
        _gameLogic.showGameOptions();
    };

	
	// -------------------------------------------------------
	// Game Play Setup
	// -------------------------------------------------------

	

	
	clientRequest.triggerPlayerIsReady = function( player )
	{
		socket.emit( 'player_is_ready', player );	
	};

	clientRequest.triggerPlayerLoadedMap = function( player )
	{
		socket.emit( 'player_has_loaded_map', player );	
	};

	clientRequest.triggerStartPreGame = function()
	{
		socket.emit( 'start_pre_game', null );	
	};

	clientRequest.triggerStartGame = function()
	{
		socket.emit( 'start_game', _gameInstance.game_id );	
	};
	
	clientRequest.choosePlayer = function( player, playerIndex, playerConfig, playerChosenCallback )
	{
		var clientData = {
				player : player,
				playerConfig : playerConfig,
				gameId : _gameInstance.game_id
		};

		$.ajax({
			type : 'post',
			url : '/player/choose/',
			data : JSON.stringify(clientData),
			contentType : "application/json",
			success : function(data) {
				
				console.log(data);				
				playerChosenCallback( playerIndex, playerConfig, data.success );
			},
			error : function(err) {
				console.error('ERROR! ' + err.responseText);
				console.error(err);
				
				//playerChosenCallback( playerIndex, false );
			}
		});
	};
	

	
	// -------------------------------------------------------
	// Game Play
	// -------------------------------------------------------

	
	
	clientRequest.sendPlayerEnteredRoom = function( player, teleports_to )
	{
		socket.emit('player_entered_room', player, teleports_to );
	};
	
	clientRequest.sendPlayerLeftRoom = function( player, roomId )
	{
		socket.emit('player_left_room', player, roomId );
	};
	
	clientRequest.sendChat = function( msg )
	{
		socket.emit('on_chat', msg);
	};
	
	clientRequest.sendPosUpdate = function( spy )
	{
		if ( spy === undefined )
			return;
		
		socket.emit('on_data', spy.getPos() );
	};

	clientRequest.sendStopUpdate = function( spy )
	{
		var pos = spy.getPos();
		pos.extra = 'stop';

		socket.emit( 'on_data', pos );
	};
		
	return clientRequest;
};



