




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
						resolve( data );
					}
					else
					{
						reject( "Null data received attempting to create player" );
					}
				},
				error : function( error )
				{
					reject( error );
				}
			}));
	};

	return clientRequest;
};



