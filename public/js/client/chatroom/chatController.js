
//import * as frontEnd from '../front_end.js';

const ChatController = function( frontEnd )
{
	const clientRequest = {};
	const LOBBY = "/";
	const _toServerHttp = toServerHttp();

	// your player object
	let _player;

	// communication socket to server
	let _socket;

	// the name of the chat room that you're currently in
	let currentRoomName;

	// the encapsulation of logic calls to receive data from the server
	let _toClient;

	// the encapsulation of logic calls to send data to the server
	let _toServer;

	// the current chatroom that we're in
	let _chatroom;

	// the game controller
	let _gameControl;

	// -------------------------------------------------------
	// Lobby Config
	// -------------------------------------------------------

	/**
	 * Create a new player on the server with the supplied name
	 * @param newPlayerName name of the new player
	 */
	clientRequest.createPlayer = function( newPlayerName )
	{
		return _toServerHttp.createPlayer( newPlayerName )
			.then(newPlayer =>
			{
				console.log("Created player [" + newPlayer.name + "] with id: %o", newPlayer.id);

				// upon sucessful creation of a new player, save a reference
				// to the player id and dump the player into the default room (lobby)
				// _player = {
				// 	name : newPlayerName,
				// 	id : data.playerId
				// };
				_player = newPlayer;

				this.joinRoom( LOBBY );

				return newPlayer;
			})
			.catch(error =>
			{
				const errText = error.responseJSON['error'];

				console.log("Bzzp - error: %o", errText);

				throw( errText );
			});
	};

	/**
	 * Join a new chat room.  Joining a new room automatically causes the user to leave their old room.
	 * @param newRoomName
	 * @returns {*}
	 */
	clientRequest.joinRoom = function( newRoomName )
	{
		// add '/' if it was missing
		if ( currentRoomName === undefined )
		{
			console.log('Joining room: lobby');
			_socket = io(newRoomName);

			_toClient = fromChatServerSocket( _socket, clientRequest );

			_toServer = toChatServerSocket( _socket );

			_toServer.joinRoom( _player.id, newRoomName, _socket );
		}
		else
		{
			console.log('Player %o joining room: ', _player.id, newRoomName);

			// leave old room
			_toServer.leaveRoom( _player.id, currentRoomName, _socket );

			// join new room
			_toServer.joinRoom( _player.id, newRoomName, _socket );
		}

		// Issue: _chatroom is created new each time. so it can't have the gameStarted flag.  boyoyoyng!

		// todo: create game instance so that we can locally add players and stuff
		_chatroom = addChatRoom( newRoomName, _player );

		// list players to find out who is here
		_toServer.getRoomStatus( newRoomName, _socket );

		currentRoomName = newRoomName;

		return _socket;
	};


	clientRequest.verifyPlayerConnection = function( playerId )
	{
		// todo: verify playerId exists on server

		return ( _player !== undefined && _toServer !== undefined );
	};

	// TODO: unit test this
	function addChatRoom( roomName, player )
	{
		return {
			name : roomName,
			players : [ player ]
		};
	}

	// TODO: unit test this
	function addPlayer( playerId, playerName )
	{
		_chatroom.players.push(
			{
				name : playerName,
				id : playerId
			}
		);

		return _chatroom.players;
	}

	// TODO: unit test this
	function removePlayer( chatroom, playerId )
	{
		const playerIndex = chatroom.players.findIndex( (player) => player.id === playerId );

		if ( playerIndex !== -1 )
			chatroom.players.splice(playerIndex, 1);

		return chatroom;
	}

	/**
	 * Called when a new player has joined the room we're in.
	 * @param playerId
	 * @param playerName
	 * @param chatRoomName
	 */
	clientRequest.onPlayerJoinedChatRoom = function( playerId, playerName, chatRoomName )
	{
		// add player to local storage
		const newPlayers = addPlayer( playerId, playerName );

		frontEnd.updatePlayerListUI( newPlayers );

		if ( _gameControl )
			_gameControl.onPlayerJoinedChatRoom( playerId, playerName, chatRoomName );
	};

	/**
	 * Called when some other player in our room has left.
	 * @param playerId
	 * @param playerName
	 * @param chatRoomName
	 */
	clientRequest.onPlayerLeftChatRoom = function( playerId, playerName, chatRoomName )
	{
		// const playerIndex = _chatroom.players.findIndex( (player) => player.id === playerId );
		//
		// if ( playerIndex !== -1 )
		// 	_chatroom.players.splice(playerIndex, 1);

		_chatroom = removePlayer( _chatroom, playerId );

		frontEnd.updatePlayerListUI( _chatroom.players );

		if ( _gameControl )
			_gameControl.onPlayerLeftChatRoom( playerId, playerName, chatRoomName );
	};

	// /**
	//  * Called when a new person has just joined a room.  They will have no idea who
	//  * is in the room unless they receive a complete list from the server.  This
	//  * message is sent only to the one user and not to anyone else.
	//  * @param players
	//  */
	// clientRequest.onListPlayers = function( players )
	// {
	// 	console.log("onListPlayers> %o", players );
	//
	// 	_chatroom.players = players;
	//
	// 	frontEnd.updatePlayerListUI( players );
	// };


	/**
	 * Called when a person list the available chat rooms
	 * @param roomList
	 */
	clientRequest.onListRooms = function( roomList )
	{
		console.log("onListRooms> %o", roomList );

		//_chatroom.players = players;

		frontEnd.updateRoomListUI( roomList );
	};


	/**
	 * Called when a new person has just joined a room.  This callback gives the new
	 * user the basic information they need to know about what is happening in this room.
	 *
	 * @param players
	 * @param gameStarted
	 */
	clientRequest.onReceiveRoomStatus = function( players, gameStarted )
	{
		console.log("onReceiveRoomStatus players> %o", players );
		console.log("onReceiveRoomStatus gameStarted> %o", gameStarted );

		_chatroom.players = players;
		_chatroom.gameStarted = gameStarted;

		frontEnd.updatePlayerListUI( players );

		if ( _chatroom.gameStarted === true )
		{
			// the game has already started!  start it for the new guy!
			//this.onStartGame();
		}
	};

	/**
	 * Called when a user sends chat text.
	 * @param message text content to send to the other users in the room
	 */
	clientRequest.sendChat = function( message )
	{
		_toServer.sendChat( currentRoomName, message, _socket );
	};

	/**
	 * List any on-going chat rooms which you can join
	 */
	clientRequest.listGames = function()
	{
		_toServer.listChatRooms( _socket );
	};

	// -------------------------------------------------------
	// Game Play Setup
	// -------------------------------------------------------

	/**
	 * Called when you wish to start the game.
	 * todo: this should only work if you're the leader.
	 */
	clientRequest.triggerStartGame = function()
	{
		let gameOptions = {
			defaultPlayerColor : Phaser.Display.Color.HexStringToColor( "0xFF0000" ),
			gameMap : "level1"
		};

		_toServer.startGame( currentRoomName, gameOptions, _socket );
	};

	/**
	 * Called when the leader of a chat room has initiated the start of the game
	 */
	clientRequest.onStartGame = function( game )
	{
		if ( _gameControl === undefined )
		{
			_gameControl = GameController(_socket, frontEnd, game, _player);
			_gameControl.onStartGame();
		}
		else
			console.log("GAME CONTROL WAS ALREADY DEFINED - NOT REDEFINING");
	};

	return clientRequest;
};

const chatControl = ChatController( toFrontEnd );
