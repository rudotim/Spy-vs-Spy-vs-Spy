
// Constructor
let Player = function()
{
	this.id =  guid();
};

Player.prototype.constructor = Player;

// class properties
Player.prototype.name = "no_name";
Player.prototype.id   = "no_id";

// if ( ! (typeof module === 'undefined') )
// {
// 	console.log('Player exported');
// 	module.exports = Player;
// }
// else
// 	console.log('Not Exported');
