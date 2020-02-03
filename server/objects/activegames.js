
var GameInstance = require('./gameinstance.js');

	var ActiveGames = function()
	{
		this.keys = [];
		this.available_games = {};
	};

	ActiveGames.prototype.constructor = ActiveGames;

	ActiveGames.prototype.addNewGame = function( newGame )
	{
		// store keys in array
		this.keys.push( newGame.game_id );
		
		// store objects associated by key
		this.available_games[ newGame.game_id ] = newGame;
	};
		
	ActiveGames.prototype.createGame = function( gameName )
	{
		var game = new GameInstance();
		
		game.setName( gameName );
		
		this.addNewGame( game );
		
		return game;
	};
	
	ActiveGames.prototype.findGameById = function( game_id )
	{
		return this.available_games[ game_id ];
	};
	
	ActiveGames.prototype.findGameByName = function( gameName )
	{
		for ( var k = 0; k < this.keys.length; k++ )
		{
			if ( this.available_games[ this.keys[k] ].name == gameName )
				return this.available_games[ this.keys[k] ];
		}
		
		return null;
	};

	ActiveGames.prototype.findPlayerByGameId = function( game_id, player_id )
	{
		var game = this.findGameById( game_id );

		var pId = game.players.player_data[player_id];
				
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
	
	ActiveGames.prototype.findPlayersByGameId = function( game_id )
	{
		var game = this.findGameById( game_id );
		
		return game.players;
	};
	
	/*
	ActiveGames.prototype.findAllPlayersExceptThisOneByGameId = function( game_id, player_id )
	{
		var game = findGameById( game_id );
		
		return game.players;
	};
	*/	

	ActiveGames.prototype.findGameByPlayerId = function( player_id )
	{
		var game, p;
		
		for ( var k = 0; k < this.keys.length; k++ )
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
	
	ActiveGames.prototype.getAllGames = function()
	{
		var names = [];
		
		for ( var k = 0; k < this.keys.length; k++ )
			names.push( this.available_games[ this.keys[k] ].game_id );
		
		return names;
	};
	
	if ( ! (typeof module === 'undefined') )
	{
		console.log('ActiveGames exported');
		module.exports = ActiveGames;
	}

//	return ActiveGames;
//}());

//module.exports = ActiveGames;