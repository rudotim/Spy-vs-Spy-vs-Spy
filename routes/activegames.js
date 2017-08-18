

//var ActiveGames = (function() {
	var ActiveGames = function() 
	{
		this.keys = [];
		this.game_data = {};
	};

	ActiveGames.prototype.constructor = ActiveGames;

	ActiveGames.prototype.addNewGame = function( newGame )
	{
		// store keys in array
		this.keys.push( newGame.game_id );
		
		// store objects associated by key
		this.game_data[ newGame.game_id ] = newGame;
	};
		
	ActiveGames.prototype.createGame = function( game_id, players )
	{
		var game = { };
		
		game.game_id = game_id;
		game.players = players;
		
		// set IO channels
		game.chatchannel = game_id + 'chat';
		game.datachannel = game_id + 'data';
		
		this.addNewGame( game );
		
		return game;
	};
	
	ActiveGames.prototype.findGameById = function( game_id )
	{
		return this.game_data[ game_id ];
	};

	ActiveGames.prototype.findPlayerByGameId = function( game_id, player_id )
	{
		//console.log( 'findPlayerByGameId' );
		
		var game = this.game_data[ game_id ];

		//console.log('game');
		//console.log( game );
		
		var pId = game.players.player_data[player_id];
				
		//console.log('pId');
		//console.log( pId );

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
		//return this.game_data[ game_id ];
	};

	ActiveGames.prototype.findGameByPlayerId = function( player_id )
	{
		var game, p;
		
		for ( var k = 0; k < this.keys.length; k++ )
		{
			game = this.game_data[ this.keys[k] ];

			console.log('checking game \'' + this.keys[k] + '\' for players...');

			console.log('checking for player_id[' + player_id + ']');
			p = game.players.getPlayerById( player_id );
			
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
			names.push( this.game_data[ this.keys[k] ].game_id );
		
		return names;
	};
	
	if ( ! (typeof module === 'undefined') )
	{
		module.exports = ActiveGames;
	}

//	return ActiveGames;
//}());

//module.exports = ActiveGames;