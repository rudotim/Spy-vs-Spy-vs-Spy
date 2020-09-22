
const Game = require('./game.js');
const Player = require('./player.js');

module.exports = function ()
{
	const gameIds = [];
	const allGames = {};

	const playerIds = [];
	const allPlayers = {};


    const GameManager = function()
    {
    	console.log('game manager constructor');
    };

	GameManager.prototype.constructor = GameManager;

	// -------------------------------------------------------
	// Game Objects
	// -------------------------------------------------------

	GameManager.createGame = function( chatroom, options )
	{
		const game = new Game( chatroom, options );

		// todo: associate new game with chatroom

		// todo: copy over each player

		return _storeGame( game );
	};

	const _storeGame = function( newGame )
	{
		gameIds.push( newGame.id );
		allGames[ newGame.id ] = newGame;

		return newGame;
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

	GameManager.findGameById = function( game_id )
	{
		return allGames[ game_id ];
	};

	GameManager.findGameByPlayerId = function(player_id )
	{
		let game, p;

		for ( let k = 0; k < this.keys.length; k++ )
		{
			game = this.allGames[ this.keys[k] ];

			console.log('checking game \'' + this.keys[k] + '\' for players...');

			console.log('checking for player_id[' + player_id + ']');
			p = game.getPlayerById( player_id );

			if ( p !== undefined && p != null )
			{
				console.log('found player');
				console.log( p );
				//return p;
				return game;
			}
		}

		console.error('found nothing');
		return undefined;
	};

	GameManager.getAllGames = function()
	{
		let names = [];

		for ( let k = 0; k < this.keys.length; k++ )
			names.push( this.allGames[ this.keys[k] ].game_id );

		return names;
	};

	// each chatroom can potentially have a reference to a game within

	// creating a game adds a reference within a chatroom

	// game is created in the /game package


	// determine:
	// sending game data to all players in room
	// forwarding player join/leave to game
	// add game reference when game starts
	// remove game reference when game ends

	// chat request for start game
	// --> create game
	// --> associate with chat room (put chatroom name in game object)
	// --> return game (with players?) as response


	// -------------------------------------------------------
	// Player Objects
	// -------------------------------------------------------

	GameManager.addPlayerToGame = function( player )
	{
		// todo: apply game properties

		// todo: add player to game
	};

	GameManager.findPlayerById = function( playerId )
	{
		return allPlayers[ playerId ];
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




	return GameManager;
}();
