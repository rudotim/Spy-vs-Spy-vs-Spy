var white_spy;
var roomScene;
var game; // = new Phaser.Game(800, 600);
var players = [];

var buttonDown = false;

/**
 * New node file
 */

// Create our 'main' state that will contain the game
function preload()
{
	// This function will be executed at the beginning
	// That's where we load the images and sounds
	// game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	// game.scale.pageAlignHorizontally = true;
	// game.scale.pageAlignVertically = true;
	game.stage.backgroundColor = '#eee';

	// load entire spy vs spy sheet
	game.load.atlasJSONHash('spies', 'img/spritesheet.png', 'img/sprites.json');

	game.load.atlas('lobby', 'data/asset-rooms-lobby2.png', 'data/asset-rooms-lobby2.json',
			Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

	game.load.image('button_left', 'img/button_left_blue.png');
	game.load.image('button_right', 'img/button_right_blue.png');
	game.load.image('button_top', 'img/button_right_blue.png');
	game.load.image('button_bottom', 'img/button_right_blue.png');
	game.load.image('button_test', 'img/button_right_blue.png');

	// game.load.image('room0', 'img/demoroom.png');

}



function create()
{

	roomScene = game.add.sprite(0, 0, 'lobby', 'room1');

	drawRoomCollisions(game);
		
	game.input.mouse.capture = true;

	var topButton = game.add.button(game.world.centerX - 35, 300 - 70, 'button_top', function()
			{
			}, this, 2, 1, 0);
	topButton.scale.setTo(0.25, 0.25);
	topButton.onInputDown.add(buttonDownTop, this);
	topButton.onInputUp.add(buttonUpTop, this);

	var lbutton = game.add.button(game.world.centerX - 95, 300, 'button_left', function()
	{
	}, this, 2, 1, 0);
	lbutton.scale.setTo(0.25, 0.25);
	lbutton.onInputDown.add(buttonDownLeft, this);
	lbutton.onInputUp.add(buttonUpLeft, this);
	
	var rbutton = game.add.button(game.world.centerX + 25, 300, 'button_right', function()
	{
	}, this, 2, 1, 0);
	rbutton.scale.setTo(0.25, 0.25);
	rbutton.onInputDown.add(buttonDownRight, this);
	rbutton.onInputUp.add(buttonUpRight, this);

	var botButton = game.add.button(game.world.centerX - 35, 300 + 70, 'button_bottom', function()
			{
			}, this, 2, 1, 0);
	botButton.scale.setTo(0.25, 0.25);
	botButton.onInputDown.add(buttonDownBottom, this);
	botButton.onInputUp.add(buttonUpBottom, this);

	
	var testButton = game.add.button(game.world.centerX - 300, 225, 'button_test', testButtonPress, this, 2, 1, 0);
	testButton.scale.setTo(0.25, 0.25);
	// testButton.onInputDown.add(buttonDownLeft, this);
	// testButton.onInputUp.add(buttonUpLeft, this);

	// this.fireKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
	// this.fireKey.onDown.add(<function that sets isPressed true> , this);
	// this.fireKey.onUp.add(<function that sets isPressed false> , this);

	// This function is called after the preload function
	// Here we set up the game, display sprites, etc.
	white_spy = new Spy(game, 250, 200, white_spy_def, gameControl);
	players.push(white_spy);
	
	//var sprite = drawball(white_spy, game);

	// white_spy = new Spy(game.add.sprite(0, 0, 'spies', 'wspy_stand'));
	// green_spy = game.add.sprite(0, 50, 'spies', 'gspy_stand');

	// white_spy.animations.add('wspy_rrun', ['wspy_rstand', 'wspy_rrun'],
	// 6, true, false);
	// green_spy.animations.add('gspy_rrun', ['gspy_rstand', 'gspy_rrun'],
	// 6, true, false);

	// white_spy.animations.play('run');
	// green_spy.animations.play('gspy_rrun');

	// white_spy.setAction('run_right');
}

function update()
{
	// This function is called 60 times per second
	// It contains the game's logic
	/*
	 * green_spy.x += 2; if (green_spy.x > 800) { green_spy.x = -50; }
	 */

	switch (buttonDown)
	{
	case STOP:
		white_spy.stopMoving();
		white_spy.updateMovement();
		gameControl.sendStopUpdate(white_spy);
		buttonDown = NOTHING;
		break;
	case LEFT:
		white_spy.moveLeft();
		white_spy.updateMovement();
		break;
	case RIGHT:
		white_spy.moveRight();
		white_spy.updateMovement();
		break;
	case TOP:
		white_spy.moveUp();
		white_spy.updateMovement();
		break;
	case BOTTOM:
		white_spy.moveDown();
		white_spy.updateMovement();
		break;
	case NOTHING:
		break;
	}
	;
}

function render()
{
	game.debug.text("(x: " + game.input.mousePointer.x + ", y: " + game.input.mousePointer.y + ")", 0, 50);
	// game.input.mousePointer.x;

}

function changeScene(toRoom)
{
	roomScene.frameName = toRoom;
}

function testButtonPress()
{
	changeScene("room0");
}

function buttonDownLeft()
{
	// white_spy.moveLeft();
	buttonDown = LEFT;
}

function buttonUpLeft()
{
	// white_spy.stopMoving();
	buttonDown = STOP;
}

function buttonDownTop()
{
	buttonDown = TOP;
}

function buttonUpTop()
{
	buttonDown = STOP;
}

function buttonDownBottom()
{
	buttonDown = BOTTOM;
}

function buttonUpBottom()
{
	buttonDown = STOP;
}

var BORDER_TOP = 157;
var BORDER_BOTTOM = 275;
var BORDER_LEFT = 18;
var BORDER_RIGHT = 548;
var TRIANGLE_LEFT = 152;
var TRIANGLE_RIGHT = 396;

var GAME_HEIGHT = (BORDER_BOTTOM - BORDER_TOP);

function drawRoomCollisions(game)
{
	console.log('drawing room collisions');

	var graphics = game.add.graphics(0, 0);

	// set a fill and line style
	graphics.lineStyle(3, 0x33FF00);

	// start at bottom left corner
	graphics.moveTo(18, BORDER_BOTTOM);

	// move to top left
	graphics.lineTo(TRIANGLE_LEFT, BORDER_TOP);

	// move to top right
	graphics.lineTo(TRIANGLE_RIGHT, BORDER_TOP);

	// bottom right
	graphics.lineTo(548, BORDER_BOTTOM);

	// and back to beginning
	graphics.lineTo(18, BORDER_BOTTOM);
	
	
	// show 45 degree angle
	graphics.lineStyle(3, 0x3300FF);
	graphics.moveTo(18, 274);
	graphics.lineTo(218, 74);
	
}


var NOTHING = -1;
var STOP = 0;
var RIGHT = 1;
var LEFT = 2;
var TOP = 3;
var BOTTOM = 4;

function buttonDownRight()
{
	buttonDown = RIGHT;
	// white_spy.moveRight();
}

function buttonUpRight()
{
	buttonDown = STOP;
	// white_spy.stopMoving();
}

function startGame(socket)
{
	// game.state.add('main', mainState, true);
	game = new Phaser.Game(800, 400, Phaser.AUTO, 'game_div',
	{
		preload : preload,
		create : create,
		update : update,
		render : render
	});

}

// Initialize Phaser, and create a 400px by 490px game
// var game = new Phaser.Game(400, 490);

// Add and start the 'main' state to start the game
// game.state.add('main', mainState, true);

