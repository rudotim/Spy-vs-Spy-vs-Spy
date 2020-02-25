
const Game = require('./game.js');
const Player = require('./player.js');

module.exports = function ()
{
	const gameIds = [];
	const allGames = {};

	const playerIds = [];
	const allPlayers = {};

	const roomIds = [];
	const allRooms = {};

    let GameManager = function()
    {
    	alert('game manager constructor?');
    };

	//GameManager.prototype.constructor = GameManager;

	GameManager.findRoomByName = function( roomName )
	{
		for ( let k = 0; k < roomIds.length; k++ )
		{
			if ( allRooms[ roomIds[k] ].name === roomName )
				return allRooms[ roomIds[k] ];
		}

		return null;
	};

	GameManager.createPlayer = function( newPlayerName )
	{
		const player = new Player( newPlayerName );

		return _addNewPlayer( player );
	};

	GameManager.createGame = function( gameName, playerId )
	{
		let game = new Game();

		game.setName( gameName );
		game.setLeader( playerId );

		return _addNewGame( game );
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

	const _addNewPlayer = function( newPlayer )
	{
		playerIds.push( newPlayer.id );
		allPlayers[ newPlayer.id ] = newPlayer;

		return newPlayer;
	};

	const _addNewGame = function( newGame )
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
