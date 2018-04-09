
var Room = function( roomJson )
{
	this.roomJson = roomJson;
	this.doors = [];
	this.actors = [];
	
	this.parseJson( roomJson );
}

Room.prototype.constructor = Room;

Room.prototype.parseJson = function( roomJson )
{
	var doorJson = roomJson.doors;
	
	var rect;
	var tpto;
	var d = doorJson.length;
	while ( d-- )
	{
		console.log('door> %o', doorJson[d]);
		
		tpto = doorJson[d].teleports_to;
		
		console.log('tpto> %o', tpto );		
		
		rect = new Phaser.Rectangle( doorJson[d].bounds.x, doorJson[d].bounds.y, doorJson[d].bounds.width, doorJson[d].bounds.height );	
		
		// now create callback for checking this rectangle's collision		
		//this.doors.push(
		
		var door_callback = (function( bounds ) {
			var recty = rect;
			var door = doorJson[d];
			
			console.log('door_callback()');
			
			return function( bounds ) { 
				
				if ( Phaser.Rectangle.intersects(bounds, recty) )
				{
					console.log('teleport to> %o', door.teleports_to);
				}
				//console.log('rect> %o', recty);
				//console.log('tpto room> %o', door.teleports_to );
				//console.log('bounds> %o', bounds );
			};
		})();
		
		this.doors.push( door_callback );
	}	
}

Room.prototype.checkDoors = function( spyBounds )
{
	var d = this.doors.length;
	while ( d-- )
	{
		//console.log('checking bounds> %o', spyBounds );
		
		this.doors[d]( spyBounds );
		// check each door
		//if ( Phaser.Rectangle.intersects(spyBounds, doors[d].bounds ) )
		//{
			// if so, break out and call move to room with door id
			
		//}
		
	}
	
}

if ( ! (typeof module === 'undefined') )
{
	console.log('Room exported');
	module.exports = Room;
}
else
	console.log('Not Exported');
