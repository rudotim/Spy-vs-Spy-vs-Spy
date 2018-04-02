


var GameLogic = function()
{
	var _gameOptions;

	var ctrl =
	{};
		
	// holds local copy of game data
	var _gameInstance = {};
	
	var _gameControl = {};
	
	// holds all players in game room
	var _local_players = {			
	};
	
	// holds our local player 
	var _player = {};
	var _my_spy;

	var _roomData;
	var _currentRoom;
	
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

		var jsonData = undefined;
		
		var jqxhr = $.ajax(
		{
			url : levelJsonFile,
			async : false
		})
		.done(function(data) {
			jsonData = data;
						
			var json = 'data/' + jsonData.asset_json_file;
			var img = 'data/' + jsonData.asset_image_file;

			// read game data from JSON file
			phaserGame.load.atlas('room_atlas', img, json, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
		})
		.fail(function(data) {
			console.log( "error> $o", data );
		});
		
		return jsonData;
	}
	
		
	function _moveToRoom( roomId )
	{
		roomScene.frameName = roomId;					
	}
		
	// -------------------------------------------------------
	// -- Game Play Logic
	// -------------------------------------------------------

	

	// -------------------------------------------------------
	// -- Phaser
	// -------------------------------------------------------

	// Create our 'main' state that will contain the game
	function preload()
	{
		// set scaling
		phaserGame.scale.scaleMode = Phaser.ScaleManager.RESIZE;

		// This function will be executed at the beginning
		// That's where we load the images and sounds
		// game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		// game.scale.pageAlignHorizontally = true;
		// game.scale.pageAlignVertically = true;
		phaserGame.stage.backgroundColor = '#eee';

		// load entire spy vs spy sheet
		phaserGame.load.atlasJSONHash('spies', 'img/spritesheet.png', 'img/sprites.json');

		// synchronus loading of JSON data
		_roomData = _loadLevel('data/level_lobby.json', phaserGame);

		phaserGame.load.image('startButton', 'img/buttonStart.png');
		
		phaserGame.load.image("modalBG","img/modalBG.png");

		// spies
		phaserGame.load.image('spyWhite', 'img/spy0.png');
		phaserGame.load.image('spyRed', 'img/spy0Red.png');
		phaserGame.load.image('spyGreen', 'img/spy0Green.png');
		phaserGame.load.image('spyCyan', 'img/spy0Cyan.png');
		
		joystick = phaserGame.plugins.add(new Phaser.Plugin.VirtualJoystick(phaserGame, null));
	}

	function create()
	{		
		// TODO: draw the first room for the current player
		var startingRoom = "room1";
		roomScene = phaserGame.add.sprite(0, 0, 'room_atlas', startingRoom );

		_drawRoomCollisions(phaserGame);

		phaserGame.input.mouse.capture = true;
				
		// x, y, baseDiameter, stickDiameter, limit, baseColor, stickColor) {
		joystick.init(phaserGame.width-80, phaserGame.height-90, 80, 60, 40, "#AA3300", "#cccccc");
		joystick.start();

		// ctrl is our 'game_logic::this' variable  (probably better way to pass this in)
		_gameOptions = new GameOptions( ctrl, phaserGame );
		_gameOptions.show( );		
	}
	
	function createSpy( id, posX, posY, spy_def )
	{
		return new Spy(phaserGame, id, posX, posY, spy_def, _gameControl);				
	}

	
	
	function update()
	{
		// if there was joystick usage, get movement direction
		var movement = joystick.setVelocity( _my_spy, 0, 4 );
		
		// if no joystick usage, check keyboard
	    if ( movement == 0 )
	    	{
	    		if (phaserGame.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
	    			movement = 1;
	    		else if (phaserGame.input.keyboard.isDown(Phaser.Keyboard.DOWN))
	    			movement = 2;
	    		else if (phaserGame.input.keyboard.isDown(Phaser.Keyboard.LEFT))
	    			movement = 3;
	    		else if (phaserGame.input.keyboard.isDown(Phaser.Keyboard.UP))
	    			movement = 4;
	    	}
	    
	    // if there was movement
		// 0 = none, 1 = right, 2 = down, 3 = left, 4 = up
		if ( movement != 0 )
		{
			switch ( movement )
			{
			// right
			case 1:
				_my_spy.x += _my_spy.speed;
				break;
			// down
			case 2:
				_my_spy.y += _my_spy.speed;
				break;
			// left
			case 3:
				_my_spy.x -= _my_spy.speed;
				break;
			// up
			case 4:
				_my_spy.y -= _my_spy.speed;
				break;
			};
			
			// check for collisions and boundaries
			checkCollisions( _my_spy, movement );
			
			// send to remote players
			_gameControl.sendPosUpdate( _my_spy );
		}
		
		joystick.update();		
	}

	
	// on each update:
	// 
	// check if spy has violated any boundaries (triggers, hard perimeter)
	// 
	
	function render()
	{
		phaserGame.debug.text("(x: " + phaserGame.input.mousePointer.x + ", y: " + phaserGame.input.mousePointer.y + ")", 0, 50);
	}

	function checkItemInterations( spy )
	{
		// interact with room
		// if room is bombed, begin blowing up
		
		// door
		// if door is open, go to next room
		
		// cabinet, coat rack, painting
		// if button held, perform action: open, lift, swap items, blow up
		
		// other player
		// if button held, send punch
		/// receive punch
		
	}
	
	// 0 = none, 1 = right, 2 = down, 3 = left, 4 = up
	function checkCollisions( spy, movement )
	{
		
		switch ( movement )
		{
		// up
		case 4:

			var top_border = BORDER_TOP;
			// If we're in left triangle... 
			if ( spy.box.x <= TRIANGLE_LEFT )
			{									
				var max_vert_dist = (spy.box.x - BORDER_LEFT);
				top_border = (BORDER_BOTTOM - max_vert_dist);

				//console.log('t_border: ' + top_border + ' max(' + max_vert_dist + ') y: ' + spy.y + '   box(' + spy.box.x + ', ' + spy.box.y + ')');				
			}
			// right triangle
			else if ( spy.box.x >= TRIANGLE_RIGHT )
			{
				var max_vert_dist = (BORDER_RIGHT - spy.box.x);				
				top_border = (BORDER_BOTTOM - max_vert_dist);

				//console.log('t_border: ' + top_border + ' max(' + max_vert_dist + ') y: ' + spy.y + '   box(' + spy.box.x + ', ' + spy.box.y + ')');				
			}
			if ( (spy.box.y - spy.speed) < top_border )
				spy.y += spy.speed;

			break;

		// down
		case 2:
						
			if ( spy.box.y >= BORDER_BOTTOM )
				spy.y -= spy.speed;
			
			break;
		// left
		case 3:
			
			var left_border = 0;
			
			// If we're in our triangle... 
			if ( (spy.box.x - spy.speed) <= TRIANGLE_LEFT )
			{
				// do border check
				left_border = (spy.box.y - BORDER_TOP) - (TRIANGLE_LEFT - spy.box.x);
				
				if ( left_border <= 0 )
					spy.x += spy.speed;
				
				//console.log('l_border: ' + left_border + '  x: ' + spy.x + '   box(' + spy.box.x + ', ' + spy.box.y + ')');
			}
			//else
			//	spy.x += spy.speed;
			break;
		// right
		case 1:
				
			var right_border = 0;
			
			// If we're in our triangle... 
			if ( (spy.box.x + spy.speed) >= TRIANGLE_RIGHT )
			{
				// do border check
				right_border = (spy.box.y - BORDER_TOP) - ((spy.box.y - BORDER_TOP) - (spy.box.x - TRIANGLE_RIGHT));
				
				//console.log('r_border: ' + right_border + '  max_y(' + (spy.box.y-BORDER_TOP) + ') x: ' + spy.x + '   box(' + spy.box.x + ', ' + spy.box.y + ')');
				
				if ( right_border >= (spy.box.y - BORDER_TOP) )
					spy.x -= spy.speed;
			}
			//else
			//	spy.x -= spy.speed;
			
			break;
		default:
			console.error("We have no logic for action[" + movement + "]");
			break;
		}
		
		spy.updateBox( spy );
	};

	
	
	// -------------------------------------------------------
	// -- Public Utilities
	// -------------------------------------------------------
		
	ctrl.setPlayer = function( player )
	{
		_player = player;
	}
	
	ctrl.getPlayer = function()
	{
		return _player;
	}
	
	ctrl.setGameControl = function(gameControl)
	{
		_gameControl = gameControl;
	}
	
	ctrl.startPreGame = function()
	{
		// inflate game_div
		$('#game_div').toggleClass('fullscreen');
		
		phaserGame = new Phaser.Game(
				window.innerWidth * window.devicePixelRatio, 
				window.innerHeight * window.devicePixelRatio, 
				Phaser.AUTO, 'game_div',
		{
			preload : preload,
			create : create,
			update : update,
			render : render
		});		
		
	};	

	ctrl.showGameOptions = function()
	{
		// draw gray rectangle on top of viewport
		_gameOptions.show();		
	}
		
	
	ctrl.onPreGameComplete = function( gameInstance, _player )
	{
		console.log('onPreGameComplete');
		
		_gameOptions.hide();		

		// add players		
		var spy;
		
		var p = 0;
		var key = '';
		for ( p = 0; p<gameInstance.players.keys.length; p++ )
		{
			key = gameInstance.players.keys[p];
			console.log('key> ' + key );
			console.log(gameInstance.players.player_data[key]);

			console.log('player_def> ' + gameInstance.players.player_data[key].player_def );
			
			spy = createSpy( key, 250, 200, gameInstance.players.player_data[key].player_def );
			
			if ( gameInstance.players.player_data[key].player_id == _player.player_id )
			{
				_my_spy = spy;
			}
			
			// save each player locally
			_local_players[key] = spy;			
		}
				
		_startGame( gameInstance, _player );
	};	
	
	_startGame = function( gameInstance, _player )
	{
		console.log( 'startGame...');

		_gameInstance = gameInstance;
		
		// so now we have all the players and their initial positions
				
		// move player to starting room, location
		_moveToRoom( "room0" );
		
		// begin timer
		// zero scores
		// play level music
	};
	
	ctrl.invokeChoosePlayer = function( playerIndex, modalPlayerConfig, playerChosenCallback )
	{
		console.log( 'choosen player');
		console.log( playerIndex );
		
		_gameControl.choosePlayer( _player, modalPlayerConfig, playerChosenCallback );
	};
	
	// this is not called yet
	ctrl.onChoosePlayer = function()
	{
		console.log('onChoosePlayer');
	};
	
	ctrl.updatePlayerPos = function( spyPos )
	{
		//console.log('updatePlayerPos');
		//console.log( spyPos );
		
		_local_players[ spyPos.player_id ].setPos( spyPos );			
	};
	
	return ctrl;
};

