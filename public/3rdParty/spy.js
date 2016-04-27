/**
 * New node file
 */


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
	
	var Spy = function(game, x, y, spy_def) 
	{
		Phaser.Particle.call(this, game, x, y, 'spies', spy_def.stand);

		// Associate specific image frames with animation sequences
		this.animations.add('run_right', [spy_def.stand_right, spy_def.run_right], 6, true, false);
		this.animations.add('run_left', [spy_def.stand_left, spy_def.run_left], 6, true, false);

		game.add.existing(this);		
		console.log('spy()');
	};
	
	// Override Phaser's Sprite object so we can add our own logic on top
	Spy.prototype = Object.create(Phaser.Particle.prototype);
	Spy.prototype.constructor = Spy;
	
	var action;
	Spy.prototype.setAction = function(new_action)
	{
		// stop previous action
		this.animations.stop( action );
		this.action = new_action;		
	
		this.animations.play( new_action );
		console.log('playing animation[' + new_action + ']');
	};
	
	Spy.prototype.updateMovement = function()
	{
		switch ( this.action )
		{
		case 'run_right':
			this.x += 5;
			if (this.x > 800) 
				this.x = -50;
			break;
		default:
			console.error("We have no logic for action[" + this.action + "]");
			break;
		}

	};
	

	/*
	CoinParticle.prototype.onEmit = function() {
		this.animations.stop("rotate", true);
		this.animations.play("rotate", 60, true);
		this.animations.getAnimation('rotate').frame = Math.floor(Math.random()
				* this.animations.getAnimation('rotate').frameTotal);
	}
	*/
	return Spy;
}());