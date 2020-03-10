
const Game = require('./game.js');
const Player = require('./player.js');
const ChatRoom = require('./chatroom.js');

module.exports = function ()
{
	const gameIds = [];
	const allGames = {};

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

	GameManager.getOrCreateRoomByName = function( roomName )
	{
		let room = this.findRoomByName( roomName );

		if ( room === undefined )
			room = createChatRoom( roomName );

		return room;
	};

	GameManager.findRoomByName = function( roomName )
	{
		for ( let k = 0; k < roomIds.length; k++ )
		{
			if ( allRooms[ roomIds[k] ].name === roomName )
				return allRooms[ roomIds[k] ];
		}

		return undefined;
	};

	GameManager.createPlayer = function( newPlayerName )
	{
		const player = new Player( newPlayerName );

		// add player to default room
		//const lobby = this.getOrCreateRoomByName( "/" );

		//this.addPlayerToRoom( player, lobby );

		return _storePlayer( player );
	};


	GameManager.addPlayerToRoom = function( player, room )
	{
		const playerIndex = room.players.findIndex( i => i.id === player.id );

		if ( playerIndex === -1 )
			room.players.push( player );
		else
			console.error("addPlayer> Player with id %o already existed in room %o", player.id, room.name );
	};

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


	GameManager.createGame = function( chatroom )
	{
		const game = new Game( chatroom );

		return _storeGame( game );
	};

	GameManager.findGameByName = function( gameName )
	{
		for ( let k = 0; k < gameIds.length; k++ )
		{
			if ( allGames[ gameIds[k] ].name === gameName )
				return allGames[ gameIds[k] ];
		}

		return null;
	};

	function createChatRoom( roomName )
	{
		return _storeRoom( new ChatRoom( roomName ) );
	}

	function _storeRoom( chatroom )
	{
		console.log("Chat room %o created", chatroom.name);
		roomIds.push( chatroom.id );
		allRooms[ chatroom.id ] = chatroom;

		return chatroom;
	}

	const _storePlayer = function( newPlayer )
	{
		playerIds.push( newPlayer.id );
		allPlayers[ newPlayer.id ] = newPlayer;

		return newPlayer;
	};

	const _storeGame = function( newGame )
	{
		gameIds.push( newGame.id );
		allGames[ newGame.id ] = newGame;

		// store keys in array
		//this.keys.push( newGame.game_id );
		
		// store objects associated by key
		//allGames[ newGame.game_id ] = newGame;

		return newGame;
	};

	GameManager.findPlayerById = function( playerId )
	{
		return allPlayers[ playerId ];
	};
	
	GameManager.findGameById = function( game_id )
	{
		return allGames[ game_id ];
	};
	


	GameManager.findPlayerByGameId = function(game_id, player_id )
	{
        let game = this.findGameById( game_id );

        let pId = game.players.player_data[player_id];
				
		return pId;
		
		/*
		var p = 0;
		for ( p = 0; p<game.players.length; p++ )
		{
			if ( game.players[p].player_id == player_id )
			{
				// getPlayerById
			}
		}
		*/
		//return this.allGames[ game_id ];
	};
	
	GameManager.findPlayersByGameId = function(game_id )
	{
        let game = this.findGameById( game_id );
		
		return game.players;
	};
	
	/*
	Game_manager.prototype.findAllPlayersExceptThisOneByGameId = function( game_id, player_id )
	{
		var game = findGameById( game_id );
		
		return game.players;
	};
	*/	

	GameManager.findGameByPlayerId = function(player_id )
	{
        let game, p;
		
		for ( let k = 0; k < this.keys.length; k++ )
		{
			game = this.allGames[ this.keys[k] ];

			console.log('checking game \'' + this.keys[k] + '\' for players...');

			console.log('checking for player_id[' + player_id + ']');
			p = game.getPlayerById( player_id );
			
			if ( p != 'undefined' && p != null )
			{
				console.log('found player');
				console.log( p );
				//return p;
				return game;
			}
		}
		
		console.error('found nothing');
		return null;
	};
	
	GameManager.getAllGames = function()
	{
		let names = [];
		
		for ( let k = 0; k < this.keys.length; k++ )
			names.push( this.allGames[ this.keys[k] ].game_id );
		
		return names;
	};
	
	// if ( ! (typeof module === 'undefined') )
	// {
	// 	console.log('Game_manager exported');
	// 	module.exports = GameManager;
	// }

	return GameManager;
}();