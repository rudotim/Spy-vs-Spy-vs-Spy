
var Room = function( roomJson )
{
	this.roomJson = roomJson;
	this.doors = [];
	this.actors = [];
	this.id = undefined;
	
	this.parseJson( roomJson );
}

Room.prototype.constructor = Room;

Room.prototype.parseJson = function( roomJson )
{
	var doorJson = roomJson.doors;
	
	// set id of room
	this.id = roomJson.id;
	
	var rect;
	var tpto;
	var d = doorJson.length;
	while ( d-- )
	{
		//console.log('door> %o', doorJson[d]);
		
		tpto = doorJson[d].teleports_to;
		
		//console.log('tpto> %o', tpto );		
		
		rect = new Phaser.Rectangle( doorJson[d].bounds.x, doorJson[d].bounds.y, doorJson[d].bounds.width, doorJson[d].bounds.height );	
		
		// now create callback for checking this rectangle's collision
		var door_callback = (function( bounds ) {
			var recty = rect;
			var door = doorJson[d];
			
			return function( bounds ) { 
				
				if ( Phaser.Rectangle.intersects(bounds, recty) )
				{
					console.log('teleport to> %o', door.teleports_to);
					return door;
				}
				return false;
			};
		})();
		
		this.doors.push( door_callback );
	}	
}

Room.prototype.checkDoors = function( spyBounds )
{
	var d = this.doors.length;
	var door;
	// check each door
	while ( d-- )
	{
		door = this.doors[d]( spyBounds );
		
		if ( door ) return door;
	}
	
	return false;
}

if ( ! (typeof module === 'undefined') )
{
	console.log('Room exported');
	module.exports = Room;
}
else
	console.log('Not Exported');
