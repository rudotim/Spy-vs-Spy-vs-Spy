/*
 var my_spy;
 var roomScene;
 var game; // = new Phaser.Game(800, 600);
 var players = [];

 var buttonDown = false;

 var joystick;
 var levelData = {};
 */

/**
 * New node file
 */

var GameLogic = function()
{
	var ctrl =
	{};
	
	var levelData =
	{};
	var my_spy;
	var roomScene;
	var phaserGame;
	var players = [];
	var buttonDown = false;
	var joystick;

	var BORDER_TOP = 157;
	var BORDER_BOTTOM = 275;
	var BORDER_LEFT = 18;
	var BORDER_RIGHT = 548;
	var TRIANGLE_LEFT = 152;
	var TRIANGLE_RIGHT = 396;

	var GAME_HEIGHT = (BORDER_BOTTOM - BORDER_TOP);

	var NOTHING = -1;
	var STOP = 0;
	var RIGHT = 1;
	var LEFT = 2;
	var TOP = 3;
	var BOTTOM = 4;

	_drawRoomCollisions = function(phaseGame)
	{
		console.log('drawing room collisions');

		var graphics = phaserGame.add.graphics(0, 0);

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

	_loadLevel = function(levelJsonFile, phaserGame)
	{
		console.log('loading file [' + levelJsonFile + ']');

		var req = $.ajax(
		{
			type : 'GET',
			url : levelJsonFile,
			beforeSend : function(xhr)
			{
				if (xhr && xhr.overrideMimeType)
				{
					xhr.overrideMimeType('application/json;charset=utf-8');
				}
			},
			dataType : 'json'
		});

		req.done(function(jd)
		{
			console.log('successful loading of external json file');
			console.log(jd);

			var json = 'data/' + jd.asset_json_file;
			var img = 'data/' + jd.asset_image_file;

			// read game data from JSON file
			phaserGame.load.atlas('lobby', img, json, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

			// load level assets

			// game.load.atlas('lobby', 'data/asset-rooms-lobby2.png',
			// 'data/asset-rooms-lobby2.json',
			// Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

			// load in-game level connections and positions
			levelData = jd;
		});

		req.fail(function(jqXHR, textStatus)
		{
			alert("Request failed: " + textStatus);
		});
	};

	ctrl.showGameOptions = function(phaserGame)
	{

		// draw gray rectangle on top of viewport

		console.log('showing game options!');
	}

	ctrl.startNewGame = function(socket)
	{
		// game.state.add('main', mainState, true);
		phaserGame = new Phaser.Game(800, 400, Phaser.AUTO, 'game_div',
		{
			preload : preload,
			create : create,
			update : update,
			render : render
		});

	};

	// Create our 'main' state that will contain the game
	function preload()
	{
		// This function will be executed at the beginning
		// That's where we load the images and sounds
		// game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		// game.scale.pageAlignHorizontally = true;
		// game.scale.pageAlignVertically = true;
		phaserGame.stage.backgroundColor = '#eee';

		// load entire spy vs spy sheet
		phaserGame.load.atlasJSONHash('spies', 'img/spritesheet.png', 'img/sprites.json');

		// TODO: Call this from outside the Phaser stuff
		_loadLevel('data/roomdata.json', phaserGame);

		phaserGame.load.image('button_left', 'img/button_left_blue.png');
		phaserGame.load.image('button_right', 'img/button_right_blue.png');
		phaserGame.load.image('button_top', 'img/button_right_blue.png');
		phaserGame.load.image('button_bottom', 'img/button_right_blue.png');
		phaserGame.load.image('button_test', 'img/button_right_blue.png');

		// game.load.image('room0', 'img/demoroom.png');
		// joystick = new VirtualJoystick( game, null );
		joystick = phaserGame.plugins.add(new Phaser.Plugin.VirtualJoystick(phaserGame, null));
	}

	function create()
	{
		roomScene = phaserGame.add.sprite(0, 0, 'lobby', 'room1');

		_drawRoomCollisions(phaserGame);

		joystick.init(260, 330, 80, 60, 40, "#AA3300", "#cccccc");
		joystick.start();

		phaserGame.input.mouse.capture = true;

		var topButton = phaserGame.add.button(phaserGame.world.centerX - 35, 300 - 70, 'button_top', function()
		{
		}, this, 2, 1, 0);
		topButton.scale.setTo(0.25, 0.25);
		topButton.onInputDown.add(buttonDownTop, this);
		topButton.onInputUp.add(buttonUpTop, this);

		var lbutton = phaserGame.add.button(phaserGame.world.centerX - 95, 300, 'button_left', function()
		{
		}, this, 2, 1, 0);
		lbutton.scale.setTo(0.25, 0.25);
		lbutton.onInputDown.add(buttonDownLeft, this);
		lbutton.onInputUp.add(buttonUpLeft, this);

		var rbutton = phaserGame.add.button(phaserGame.world.centerX + 25, 300, 'button_right', function()
		{
		}, this, 2, 1, 0);
		rbutton.scale.setTo(0.25, 0.25);
		rbutton.onInputDown.add(buttonDownRight, this);
		rbutton.onInputUp.add(buttonUpRight, this);

		var botButton = phaserGame.add.button(phaserGame.world.centerX - 35, 300 + 70, 'button_bottom', function()
		{
		}, this, 2, 1, 0);
		botButton.scale.setTo(0.25, 0.25);
		botButton.onInputDown.add(buttonDownBottom, this);
		botButton.onInputUp.add(buttonUpBottom, this);

		var testButton = phaserGame.add.button(phaserGame.world.centerX - 300, 225, 'button_test', testButtonPress, this, 2, 1, 0);
		testButton.scale.setTo(0.25, 0.25);
		// testButton.onInputDown.add(buttonDownLeft, this);
		// testButton.onInputUp.add(buttonUpLeft, this);

		// this.fireKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
		// this.fireKey.onDown.add(<function that sets isPressed true> , this);
		// this.fireKey.onUp.add(<function that sets isPressed false> , this);

		// This function is called after the preload function
		// Here we set up the game, display sprites, etc.
		my_spy = new Spy(phaserGame, 250, 200, white_spy_def, gameControl);
		
		// set room
		
		
		players.push(my_spy);

		// var sprite = drawball(my_spy, game);

		// my_spy = new Spy(game.add.sprite(0, 0, 'spies', 'wspy_stand'));
		// green_spy = game.add.sprite(0, 50, 'spies', 'gspy_stand');

		// my_spy.animations.add('wspy_rrun', ['wspy_rstand', 'wspy_rrun'],
		// 6, true, false);
		// green_spy.animations.add('gspy_rrun', ['gspy_rstand', 'gspy_rrun'],
		// 6, true, false);

		// my_spy.animations.play('run');
		// green_spy.animations.play('gspy_rrun');

		// my_spy.setAction('run_right');
	}

	function update()
	{
		// This function is called 60 times per second
		// It contains the game's logic
		switch (buttonDown)
		{
		case STOP:
			my_spy.stopMoving();
			my_spy.updateMovement();
			gameControl.sendStopUpdate(my_spy);
			buttonDown = NOTHING;
			break;
		case LEFT:
			my_spy.moveLeft();
			my_spy.updateMovement();
			break;
		case RIGHT:
			my_spy.moveRight();
			my_spy.updateMovement();
			break;
		case TOP:
			my_spy.moveUp();
			my_spy.updateMovement();
			break;
		case BOTTOM:
			my_spy.moveDown();
			my_spy.updateMovement();
			break;
		case NOTHING:
			break;
		}
		;
	}

	function render()
	{
		phaserGame.debug.text("(x: " + phaserGame.input.mousePointer.x + ", y: " + phaserGame.input.mousePointer.y + ")", 0, 50);
		// game.input.mousePointer.x;
	}

	function changeScene( toRoom )
	{
		roomScene.frameName = toRoom;			
	}

	function testButtonPress()
	{
		changeScene("room0");
	}


	
	
	function buttonDownRight()
	{
		buttonDown = RIGHT;
	}

	function buttonUpRight()
	{
		buttonDown = STOP;
	}

	function buttonDownLeft()
	{
		buttonDown = LEFT;
	}

	function buttonUpLeft()
	{
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

	return ctrl;
};
