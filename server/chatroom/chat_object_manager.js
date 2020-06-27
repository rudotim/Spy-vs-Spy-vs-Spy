
const Player = require('./player.js');
const ChatRoom = require('./chatroom.js');

module.exports = function ()
{
	const playerIds = [];
	const allPlayers = {};

	const roomIds = [];
	const allRooms = {};

    const GameManager = function()
    {
    	console.log('game manager constructor');

    	// Create the default lobby chat room
	    createChatRoom( "/" );
    };

	GameManager.prototype.constructor = GameManager;

	/**
	 * Retrieve the room object associated with roomName.
	 * @param roomName
	 * @returns {*} return the room object. If one did not exist, create it and return it.
	 */
	GameManager.getOrCreateRoomByName = function( roomName )
	{
		let room = this.findRoomByName( roomName );

		if ( room === undefined )
			room = createChatRoom( roomName );

		return room;
	};

	/**
	 * Retrieve the room object associated with roomName.
	 * @param roomName
	 * @returns {*} return the room object. If one did not exist, return undefined.
	 */
	GameManager.findRoomByName = function( roomName )
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
	GameManager.createPlayer = function( newPlayerName )
	{
		const player = new Player( newPlayerName );

		return _storePlayer( player );
	};

	/**
	 * Add a player to a room.
	 * @param player
	 * @param room
	 */
	GameManager.addPlayerToRoom = function( player, room )
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
	GameManager.removePlayerFromRoom = function( player, room )
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
	GameManager.findPlayersInRoom = function( roomName )
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
	GameManager.findPlayerById = function( playerId )
	{
		return allPlayers[ playerId ];
	};

	return GameManager;
}();
