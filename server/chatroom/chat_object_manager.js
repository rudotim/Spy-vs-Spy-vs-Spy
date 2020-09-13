
const Player = require('./player.js');
const ChatRoom = require('./chatroom.js');

module.exports = function ()
{
	const playerIds = [];
	const allPlayers = {};

	const roomIds = [];
	const allRooms = {};

    const ChatManager = function()
    {
    	console.log('Chat manager constructor');

    	// Create the default lobby chat room
	    createChatRoom( "/" );
    };

	ChatManager.prototype.constructor = ChatManager;

	/**
	 * Retrieve the room object associated with roomName.
	 * @param roomName
	 * @returns {*} return the room object. If one did not exist, create it and return it.
	 */
	ChatManager.getOrCreateRoomByName = function( roomName )
	{
		let room = this.findRoomByName( roomName );

		if ( room === undefined )
			room = createChatRoom( roomName );

		return room;
	};


	/**
	 * Retrieve all the chat rooms currently available on the server
	 * @returns {*} return an array of room objects
	 */
	ChatManager.getAllRooms = function()
	{
		const rooms = [];
		let roomData;
		for ( let k = 0; k < roomIds.length; k++ )
		{
			roomData =
				{
					"name" : allRooms[ roomIds[k] ].name,
					"created_by" : "bob"
				};

			rooms.push( roomData );
		}

		return rooms;
	};

	/**
	 * Retrieve the room object associated with roomName.
	 * @param roomName
	 * @returns {*} return the room object. If one did not exist, return undefined.
	 */
	ChatManager.findRoomByName = function( roomName )
	{
		for ( let k = 0; k < roomIds.length; k++ )
		{
			if ( allRooms[ roomIds[k] ].name === roomName )
				return allRooms[ roomIds[k] ];
		}

		return undefined;
	};

	/**
	 * Create a new player object based on the new player's name.
	 * @param newPlayerName
	 * @returns {*}
	 */
	ChatManager.createPlayer = function( newPlayerName )
	{
		const player = new Player( newPlayerName );

		return _storePlayer( player );
	};

	/**
	 * Permanently remove all tracers of a player from the game server
	 * @param playerId - the id of the player beingi removed
	 */
	ChatManager.deletePlayer = function( playerId )
	{
		const playerIndex = playerIds.findIndex( i => i.id === playerId );

		if ( playerIndex !== undefined )
			playerIds.splice(playerIndex, 1);
		else
			console.error("Unable to find player with id %o to remove", playerId );

		allPlayers[ playerId ] = undefined;
	};

	/**
	 * Add a player to a room.
	 * @param player
	 * @param room
	 */
	ChatManager.addPlayerToRoom = function( player, room )
	{
		const playerIndex = room.players.findIndex( i => i.id === player.id );

		if ( playerIndex === -1 )
			room.players.push( player );
		else
			console.error("addPlayer> Player with id %o already existed in room %o", player.id, room.name );
	};

	/**
	 * Remove a player from a room
	 * @param player
	 * @param room
	 */
	ChatManager.removePlayerFromRoom = function( player, room )
	{
		// create new array that does not include our target player
		room.players = room.players.filter(
				function(value, index, arr)
				{
					return value.id !== player.id;
				});
	};

	/**
	 * Retrieve all players associated with the room with name roomName
	 * @param roomName name of room for which we're requesting a player list
	 * @returns {Array} list of players
	 */
	ChatManager.findPlayersInRoom = function( roomName )
	{
		const room = this.findRoomByName( roomName );

		if ( room === undefined )
			console.error("Failed to find room with name ", roomName);
		else
			return room.players;
	};

	/**
	 * Create a new chat room based on the new chat room's name
	 * @param roomName
	 * @returns {*} the newly created chat room object
	 */
	function createChatRoom( roomName )
	{
		return _storeRoom( new ChatRoom( roomName ) );
	}

	/**
	 * Store a chat room object
	 * @param chatroom
	 * @returns {*} the stored chat room object
	 * @private
	 */
	function _storeRoom( chatroom )
	{
		console.log("Chat room %o created", chatroom.name);
		roomIds.push( chatroom.id );
		allRooms[ chatroom.id ] = chatroom;

		return chatroom;
	}

	/**
	 * Store a player object.
	 * @param newPlayer
	 * @returns {*} the stored player object
	 * @private
	 */
	const _storePlayer = function( newPlayer )
	{
		playerIds.push( newPlayer.id );
		allPlayers[ newPlayer.id ] = newPlayer;

		return newPlayer;
	};

	/**
	 * Find a player object by the corresponding player id
	 * @param playerId
	 * @returns {*} the player object
	 */
	ChatManager.findPlayerById = function( playerId )
	{
		return allPlayers[ playerId ];
	};

	/**
	 * Find a player object by the corresponding player name
	 * @param playerName
	 * @returns {*} the player object
	 */
	ChatManager.findPlayerByName = function( playerName )
	{
		for (let key in allPlayers)
		{
			if ( allPlayers[key] && allPlayers[key].name === playerName )
				return allPlayers[key];
		}
		return undefined;
	};

	return ChatManager;
}();
