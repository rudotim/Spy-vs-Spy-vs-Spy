

const toChatServerSocket = function( socket )
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

	clientRequest.listChatRooms = function( socketRoom )
	{
		console.log('Listing chat rooms...' );

		socketRoom.emit( 'list_rooms' );
	};

	clientRequest.listPlayersInRoom = function( roomName, socketRoom )
	{
		console.log('Listing players in room %o', roomName );

		const data = {
			roomName : roomName
		};

		socketRoom.emit( 'list_players', data );
	};

	clientRequest.getRoomStatus = function( roomName, socketRoom )
	{
		console.log('Requesting status for room %o', roomName );

		const data = {
			roomName : roomName
		};

		socketRoom.emit( 'get_room_status', data );
	};

	/**
	 * Called when a user sends chat text.
	 * @param roomName name of room the user is in
	 * @param message text content to send to the other users in the room
	 * @param socketRoom socket
	 */
	clientRequest.sendChat = function( roomName, message, socketRoom )
	{
		const data =
			{
				"roomName" : roomName,
				"message" : message
			};

		console.log("sending chat data> ", data);

		socketRoom.emit('on_chat', data);
	};


	clientRequest.startGame = function( roomName, socketRoom )
	{
		const data =
			{
				"roomName" : roomName,
			};

		socketRoom.emit('start_game', data);
	};

	return clientRequest;
};



