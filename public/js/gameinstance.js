/**
 * New node file
 */


var GameInstance = function()
{
	var game = {};

	var name;
	var map = 'lobby';
	var max_players = 5;
	var max_duration = 1;
	var password = '';

	game.createNew = function( gameName )
	{
		this.name = gameName;
		this.map = 'lobba';
		
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