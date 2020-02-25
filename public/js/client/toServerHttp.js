




const toServerHttp = function( )
{
	let clientRequest = {};

	// We are going to use createPlayer as our first call for new connections.
	// It will have to be an endpoint which will then establish a socket.
	// The immediate problem is the return value.  Can we return a promise or something?

	/**
	 * Request to create a new player.  This adds the player to the active players on the backend server.
	 */
	clientRequest.createPlayer = function( playerName )
	{
		console.log('requesting to create player');

		const clientData =
			{
				"playerName" : playerName
			};

		return new Promise((resolve, reject) => $.ajax(
			{
				type: 'post',
				url: '/player/create',
				data: JSON.stringify( clientData ),
				contentType: "application/json",
				success: function ( data )
				{
					if ( data != null )
					{
						//data.socket = _onJoinLobbySuccess();

						resolve( data );
					}
					else
					{
						reject( "Null data received attempting to create player" );
					}
				},
				error : function( error )
				{
					//console.error('ERROR> %o', err );
					reject( error );
				}
			}));
	};

	const _onJoinLobbySuccess = function()
	{
		const urlid = '/';

		console.log('client joining ' + urlid + '');

		// initialize socket to server and establish communication callback channels
		const socket = io( urlid );

		//socket.emit( 'test', "client joined the lobby!" );

		// _socket.on('connection', function(msg)
		// {
		// 	console.log('CONNECTED TO SERVER');
		// });

		// get game list

		// tell server we have joined the room
		//socket.emit( 'player_joined', player );

		// redraw UI with our name in the list
		//_updateRoomListUI( gameInstance.players );

		//console.log('ok, you\'ve joined room [' + gameInstance.game_id + ']');

		return socket;
	};

	return clientRequest;
};



