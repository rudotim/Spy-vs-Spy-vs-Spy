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
		//this.animations.add("rotate");
		console.log('coin()');
		this.animations.add('run_right', [spy_def.stand_right, spy_def.run_right], 6, true, false);

		game.add.existing(this);		
	};
	
	Spy.prototype = Object.create(Phaser.Particle.prototype);
	Spy.prototype.constructor = Spy;
	
	var action;
	Spy.prototype.setAction = function(action)
	{
		this.action = 'run_right';
		
		// stop other actions
		
		// 
		this.animations.play( action );
		console.log('playing[' + action + ']');
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
			console.error("no handler for action[" + this.action + "]");
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