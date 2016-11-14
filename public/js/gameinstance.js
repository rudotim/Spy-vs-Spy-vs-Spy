/**
 * New node file
 */


var GameInstance = function()
{
	var game = {};

	var name;
	var map = 'lobbo';
	var max_players = 2;
	var max_duration = 1;
	var password = '';

	game.createNew = function( gameName )
	{
		this.name = gameName;
		this.map = 'lobbo';
		
		var g = 
		{
			name : this.name,
			map : this.map,
			max_players : this.max_players,
			max_duration : this.max_duration,
			password : this.password
		};
		
		return g;
	};
	
	return game;
};