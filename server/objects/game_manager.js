
let Game = require('./game.js');

	let GameManager = function()
	{
		this.keys = [];
		this.available_games = {};
	};

	GameManager.prototype.constructor = GameManager;

	GameManager.prototype.addNewGame = function(newGame )
	{
		// store keys in array
		this.keys.push( newGame.game_id );
		
		// store objects associated by key
		this.available_games[ newGame.game_id ] = newGame;
	};
		
	GameManager.prototype.createGame = function(gameName )
	{
        let game = new Game();
		
		game.setName( gameName );
		
		this.addNewGame( game );
		
		return game;
	};
	
	GameManager.prototype.findGameById = function(game_id )
	{
		return this.available_games[ game_id ];
	};
	
	GameManager.prototype.findGameByName = function(gameName )
	{
		for ( let k = 0; k < this.keys.length; k++ )
		{
			if ( this.available_games[ this.keys[k] ].name === gameName )
				return this.available_games[ this.keys[k] ];
		}
		
		return null;
	};

	GameManager.prototype.findPlayerByGameId = function(game_id, player_id )
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
		//return this.available_games[ game_id ];
	};
	
	GameManager.prototype.findPlayersByGameId = function(game_id )
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

	GameManager.prototype.findGameByPlayerId = function(player_id )
	{
        let game, p;
		
		for ( let k = 0; k < this.keys.length; k++ )
		{
			game = this.available_games[ this.keys[k] ];

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
	
	GameManager.prototype.getAllGames = function()
	{
		let names = [];
		
		for ( let k = 0; k < this.keys.length; k++ )
			names.push( this.available_games[ this.keys[k] ].game_id );
		
		return names;
	};
	
	if ( ! (typeof module === 'undefined') )
	{
		console.log('Game_manager exported');
		module.exports = GameManager;
	}

//	return Game_manager;
//}());

//module.exports = Game_manager;