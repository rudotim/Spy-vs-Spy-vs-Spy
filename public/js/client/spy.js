/**
 * New node file
 */

/** debug stuff **/

var spy_width = 27;
var spy_height = 37;

var box_width = spy_width;
var box_height = 8;

/** end debug stuff **/


var white_spy_def = {
		stand : 'wspy_stand',
		stand_right : 'wspy_rstand',
		run_right : 'wspy_rrun',
		stand_left : 'wspy_lstand',
		run_left : 'wspy_lrun'
};

var green_spy_def = {
		stand : 'gspy_stand',
		stand_right : 'gspy_rstand',
		run_right : 'gspy_rrun',
		stand_left : 'gspy_lstand',
		run_left : 'gspy_lrun'
};

var Spy = (function() 
{
	//var speed, action;
	//var box;
	//var _roomId;
	//var _player_id;
	
	var Spy = function(phaserGame, id, x, y, spy_def, gameControl) 
	{
		this.speed = 4;
		this.action = null;
		this._player_id = id;
		this._room_id = null;
		//this.x = x;
		//this.y = y;

		Phaser.Particle.call(this, phaserGame, x, y, 'spies', spy_def.stand);
		
		// Associate specific image frames with animation sequences
		this.animations.add('run_right', [spy_def.stand_right, spy_def.run_right], 8, true, false);
		this.animations.add('run_left', [spy_def.stand_left, spy_def.run_left], 8, true, false);

		this.gameControl = gameControl;

		this.box = drawCollisionBox( phaserGame, x, y );

		phaserGame.add.existing(this);
				
		console.log('spy()');
	};
	
	function drawCollisionBox( phaserGame, x, y )
	{
		var bmd = phaserGame.add.bitmapData(spy_width, 8);

		// Draw circle
		bmd.ctx.fillStyle = '#FF0000';
	    bmd.ctx.rect(0, 0, spy_width, 8);
		bmd.ctx.fill(); 
		
		// Put BitmapData in a Sprite
		return phaserGame.add.sprite(x, y + spy_height, bmd);
	}
			
	function collideRight( box, Spy )
	{
		
		
		return false;
	}
	
	// Override Phaser's Sprite object so we can add our own logic on top
	Spy.prototype = Object.create(Phaser.Particle.prototype);
	Spy.prototype.constructor = Spy;
	
	Spy.prototype.getPos = function()
	{
		return { player_id : this._player_id, room_id : this._room_id, action : this.action, x : this.x, y : this.y };
	};

	Spy.prototype.setRoom = function( roomId )
	{
		this._room_id = roomId;
	};
	
	Spy.prototype.getRoom = function()
	{
		return this._room_id;
	};
	
	Spy.prototype.setPos = function( newPos )
	{
		this.x = newPos.x;
		this.y = newPos.y;
		
		updateBox( this );
		//if ( newPos.extra == 'stop' )
		//	this.stopMoving();
		//else
		//	this.checkAction( newPos.action );		
	};
	
	Spy.prototype.updateBox = function( Spy )
	{
		this.box.x = Spy.x;
		this.box.y = Spy.y + spy_height;
	}

	Spy.prototype.checkAction = function(action)
	{
		// check action
		// if action is not correct, call setAction
		if ( this.action != action )
			this.setAction(action);
				
		// check animation
		var anim = this.animations.getAnimation(action);
		
		// if an animation is registered and it's not playing, call setAction
		if ( anim != null && !anim.isPlaying )
			this.setAction(action);
	};
	
	Spy.prototype.setAction = function(new_action)
	{
		// stop previous action
		this.animations.stop( action );
		this.action = new_action;		
	
		this.animations.play( new_action );
		console.log('playing animation[' + new_action + ']');
		
	};
	
	// 0 = none, 1 = right, 2 = down, 3 = left, 4 = up
	Spy.prototype._updateMovement = function( movement )
	{
		
		switch ( movement )
		{
		// up
		case 4:

			var top_border = BORDER_TOP;
			// If we're in left triangle... 
			if ( box.x <= TRIANGLE_LEFT )
			{									
				var max_vert_dist = (box.x - BORDER_LEFT);
				top_border = (BORDER_BOTTOM - max_vert_dist);

				console.log('t_border: ' + top_border + ' max(' + max_vert_dist + ') y: ' + this.y + '   box(' + box.x + ', ' + box.y + ')');				
			}
			// right triangle
			else if ( box.x >= TRIANGLE_RIGHT )
			{
				var max_vert_dist = (BORDER_RIGHT - box.x);				
				top_border = (BORDER_BOTTOM - max_vert_dist);

				console.log('t_border: ' + top_border + ' max(' + max_vert_dist + ') y: ' + this.y + '   box(' + box.x + ', ' + box.y + ')');				
			}
			if ( (box.y - this.speed) > top_border )
				this.y -= this.speed;

			break;

		// down
		case 2:
						
			if ( box.y + box_height <= BORDER_BOTTOM )
				this.y += this.speed;
			
			break;
		// left
		case 3:
			
			var left_border = 0;
			
			// If we're in our triangle... 
			if ( (box.x - this.speed) <= TRIANGLE_LEFT )
			{
				// do border check
				left_border = (box.y - BORDER_TOP) - (TRIANGLE_LEFT - box.x);
				
				if ( left_border > 0 )
					this.x -= this.speed;
				
				console.log('l_border: ' + left_border + '  x: ' + this.x + '   box(' + box.x + ', ' + box.y + ')');
			}
			else
				this.x -= this.speed;
						
			break;
		// right
		case 1:
				
			var right_border = 0;
			
			// If we're in our triangle... 
			if ( (box.x + this.speed) >= TRIANGLE_RIGHT )
			{
				// do border check
				right_border = (box.y - BORDER_TOP) - ((box.y - BORDER_TOP) - (box.x - TRIANGLE_RIGHT));
				
				console.log('r_border: ' + right_border + '  max_y(' + (box.y-BORDER_TOP) + ') x: ' + this.x + '   box(' + box.x + ', ' + box.y + ')');
				
				if ( right_border < (box.y - BORDER_TOP) )
					this.x += this.speed;
			}
			else
				this.x += this.speed;
			
			break;
		default:
			console.error("We have no logic for action[" + movement + "]");
			break;
		}
		
		updateBox( this );
	};

	Spy.prototype.moveRight = function()
	{
		this.checkAction('run_right');

		this.speed = 4;
				
		this.gameControl.sendPosUpdate( this );
	};
	
	Spy.prototype.moveLeft = function()
	{
		this.checkAction('run_left');
		
		this.speed = 4;

		this.gameControl.sendPosUpdate( this );
	};

	Spy.prototype.moveUp = function()
	{
		this.checkAction('run_up');

		this.speed = 3;
				
		this.gameControl.sendPosUpdate( this );
	};
	
	Spy.prototype.moveDown = function()
	{
		this.checkAction('run_down');
		
		this.speed = 3;

		this.gameControl.sendPosUpdate( this );
	};
	
	Spy.prototype.stopMoving = function()
	{
		this.speed = 0;
		
		this.animations.stop(null, true);
	};
	
	return Spy;
}());