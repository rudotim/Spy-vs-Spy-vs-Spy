
// Constructor
var Player = function()
{
	this.id = "gobblygook"
}

Player.prototype.constructor = Player;

// class properties
Player.prototype.name = "no_name";

if ( ! (typeof module === 'undefined') )
{
	console.log('Player exported');
	module.exports = Player;
}
else
	console.log('Not Exported');
