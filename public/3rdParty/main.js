var white_spy, green_spy;

//var wspy = new Spy();

/**
 * New node file
 */
// Create our 'main' state that will contain the game
var mainState = {
	preload : function() {
		// This function will be executed at the beginning
		// That's where we load the images and sounds
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
		game.stage.backgroundColor = '#eee';

		// load entire spy vs spy sheet
		game.load.atlasJSONHash('spies', 'img/spritesheet.png',
				'img/sprites.json');
		
		game.load.image('button_left', 'img/button_left_blue.png');
		game.load.image('button_right', 'img/button_right_blue.png');
	},

	create : function() {
		
		//var btn = game.add.sprite(50, 50, 'button_right');
		//btn.scale.setTo(0.25, 0.25);

		lbutton = game.add.button(game.world.centerX - 95, 300, 'button_left', move_left, this, 2, 1, 0);
		lbutton.scale.setTo(0.25, 0.25);

		rbutton = game.add.button(game.world.centerX + 25, 300, 'button_right', move_right, this, 2, 1, 0);
		rbutton.scale.setTo(0.25, 0.25);
		
		// This function is called after the preload function
		// Here we set up the game, display sprites, etc.
		white_spy = new Spy(game, 0, 0, white_spy_def);
		//white_spy = new Spy(game.add.sprite(0, 0, 'spies', 'wspy_stand'));
		green_spy = game.add.sprite(0, 50, 'spies', 'gspy_stand');
		
		//white_spy.animations.add('wspy_rrun', ['wspy_rstand', 'wspy_rrun'], 6, true, false);
		green_spy.animations.add('gspy_rrun', ['gspy_rstand', 'gspy_rrun'], 6, true, false);
		
		//white_spy.animations.play('run');
		green_spy.animations.play('gspy_rrun');
		
		white_spy.setAction('run_right');
	},

	update : function() {
		// This function is called 60 times per second
		// It contains the game's logic
		green_spy.x += 2;
		if (green_spy.x > 800) {
			green_spy.x = -50;
		}
		
		white_spy.updateMovement();
		
	},
};

function move_left () {
	console.log('left');
}

function move_right () {
	console.log('right');
}

// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(400, 490);

// Add and start the 'main' state to start the game
game.state.add('main', mainState, true);