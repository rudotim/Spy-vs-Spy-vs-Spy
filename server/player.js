

var Player = function( name, isLeader ) 
{
	this.name = name;
	this.id = -1;
	this.pos = { x : 0, y : 0 };
	this.room = -1;
	this.isLeader = isLeader;
	
	this.player_def = {};
};

Player.prototype.constructor = Player;

if ( ! (typeof module === 'undefined') )
{
	console.log('Player exported');
	module.exports = Player;
}
else
	console.log('Not Exported');