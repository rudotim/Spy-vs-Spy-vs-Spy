

//(function(exports) {
	var Players = function() 
	{
		this.keys = [];
		this.player_data = {};
	};

	Players.prototype.constructor = Players;

	Players.prototype.addPlayer = function( newPlayer )
	{
		// store keys in array
		this.keys.push( newPlayer.player_id );
		
		// store objects associated by key
		this.player_data[ newPlayer.player_id ] = newPlayer;
	};
	
	Players.prototype.getPlayerById = function( player_id )
	{
		// access object via key id
		return this.player_data[ player_id ];
	};
	
	Players.prototype.createPlayer = function( player_name, player_id, isleader )
	{
		var player = { };
		
		player.name = player_name;
		player.player_id = player_id;
		player.pos = { x : 0, y: 0 };
		player.room = 0;
		player.isleader = isleader;
		player.player_def = null;
		
		// inventory
		// animation
		
		
		this.addPlayer( player );
		
		return player;
	};
	
	Players.prototype.removePlayerById = function( player_id )
	{
		this.player_data[ player_id ] = null;
		for ( var k = 0; k < this.keys.length; k++ )
		{
			if ( this.keys[k] == player_id )
			{
				this.keys.splice(k, 1);
				return;
			}
		}
	}   
		
	Players.prototype.getAllPlayerNames = function()
	{
		var names = [];
		
		for ( var k = 0; k < this.keys.length; k++ )
			names.push( this.player_data[ this.keys[k] ].name );
		
		return names;
	};
	
	if ( ! (typeof module === 'undefined') )
	{
		console.log('Players exported');
		module.exports = Players;
	}
	else
		console.log('Not Exported');
//	return Players;
	// if exports is not supplied, we're calling this from the browser
	// if it IS supplied, we're calling this from the server
//}( typeof exports === 'undefined' ? this.players = {} : exports));

//module.exports = Players;

//module.exports = Players;