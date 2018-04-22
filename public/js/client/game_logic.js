
//var Room = require('room.js');

var GameLogic = function()
{
	var _gameOptions;

	var ctrl =
	{};
		
	// holds local copy of game data
	var _gameInstance = {};
	
	var _gameControl = {};
	
	// holds all Spies in game
	var _all_spies = {			
	};
	
	// things we need to keep track of
	// gameInst  :	_gameInstance
	// our player:	  _player
	//   map data:     _roomData
	// current room:   _currentRoom
	
	// holds our local player 
	var _player = {};
	
	// our local Spy object
	var _my_spy;
	
	// the room we're currently in
	var _currentRoom;
	
	// Phaser object holding the room images
	var _roomData;
		
	var roomScene;
	var phaserGame;
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
		
		$.ajax(
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
		console.log('moving to room> %o', roomId);
		
		// find room with id and set _currentRoom to it 
		_currentRoom = _gameInstance.rooms[ roomId ];
		
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
		var startingRoom = "room0";
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

	    if ( _currentRoom !== undefined )
	    {
		    Object.keys(_all_spies).forEach(function(key) 
		    	{		    		
		    		if ( _all_spies[key]._room_id == _currentRoom.id )
		    		{
		    			_all_spies[key].setVisibility( true );
		    		}
		    		else
		    		{
		    			_all_spies[key].setVisibility( false );
		    		}
		    });
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
			
			
			// check if we've collided with any interactable objects
			checkItemInterations( _my_spy );
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
		var door;
		if ( (door = _currentRoom.checkDoors( spy.box.getBounds() )) )
		{
			console.log('looks like we collided with a door> %o', door);
						
			_gameControl.sendPlayerLeftRoom( _player, _currentRoom.id );
			_gameControl.sendPlayerEnteredRoom( _player, door.teleports_to );
			
			//_moveToRoom( door.teleports_to.room );
			
			// move spy to correct position
			_my_spy.setPos( door.teleports_to.pos );
		}

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
	// Game Play Config
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
		
		var gameWidth = window.innerWidth; // * window.devicePixelRatio;
		var gameHeight = window.innerHeight; // * window.devicePixelRatio;
		
		
		
		phaserGame = new Phaser.Game(
				gameWidth, gameHeight, 
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
		
	ctrl.invokeChoosePlayer = function( playerIndex, modalPlayerConfig, playerChosenCallback )
	{
		_gameControl.choosePlayer( _player, modalPlayerConfig, playerChosenCallback );
	};

	ctrl.onChoosePlayer = function( player_id, player_config )
	{
		console.log('onChoosePlayer');
	
		var spy = createSpy( player_id, 250, 200, player_config );
		
		//spy.setVisibility( false );
		
		// when it's us
		if ( player_id == _player.id )
		{
			_my_spy = spy;
		}
		else
		{
			// when it's someone else
			_all_spies[ player_id ] = spy;
		}		
	}
	
	ctrl.playerIsReady = function()
	{
		console.log( 'player is ready> %o', _player );

		_gameControl.triggerPlayerIsReady( _player );
	};

	ctrl.onPlayerReady = function( player_id )
	{
		console.log('player> %o is ready', player_id);
	}

	ctrl.onGameLoading = function( game_loading_pct )
	{
		console.log('game loaded pct> %o', game_loading_pct);
	}
	
	ctrl.onLoadMapData = function( gameInstance )
	{
		_gameInstance = gameInstance;
		
		var roomId;
		// parse everything
		var r = _gameInstance.jsonMapData.rooms.length;
		while ( r-- )
		{
			roomId = _gameInstance.jsonMapData.rooms[r].id;
			_gameInstance.rooms[roomId] = new Room(_gameInstance.jsonMapData.rooms[r]);
		}			
		
		// let server know we've loaded everything
		_gameControl.triggerPlayerLoadedMap( _player );
	}

	ctrl.onStartGame = function( gameInstance, player )
	{
		console.log('onStartGame> %o', player );
		console.log('onStartGame gameInstance> %o', gameInstance );
		
		_gameOptions.hide();		
	};	

	
	// -------------------------------------------------------
	// Game Play
	// -------------------------------------------------------

	
	ctrl.updatePlayerPos = function( spyPos )
	{
		_all_spies[ spyPos.player_id ].setPos( spyPos );			
	};
	
	ctrl.onPlayerLeftRoom = function( player, roomId )
	{
		//console.log('onPlayerLeftRoom> %o', player.id);	
		console.log('onPlayerLeftRoom> player ', player.id, ' left room ', roomId );
				
		// if it's someone else, set their room so we'll know to stop drawing them
		if ( player.id != _my_spy._player_id )
		{
			console.log('we will stop drawing player ', player.id);
			_all_spies[ player.id ].setRoom( roomId );
		}		
	}

	ctrl.onPlayerEnteredRoom = function( player, teleports_to )
	{
		console.log('onPlayerEnteredRoom> player ', player.id, ' entered room ', teleports_to.room );
		/*
		  "teleports_to": {	
		  	"room" : "room1"
		  	"pos" : { 
		  		"x" : 100, 
		  		"y" : 235 
		  	}
		  }
		*/
		
		// if it's us
		if ( player.id == _my_spy._player_id )
		{
			//if ( _currentRoom === undefined /*|| _currentRoom.id == teleports_to.room */ )
			{
				_currentRoom = _gameInstance.rooms[ teleports_to.room ];
				
				_my_spy.setRoom( teleports_to.room );
				_moveToRoom( teleports_to.room );
				
				console.log('setting room for us(', player.id, ')> %o', teleports_to.room );
			}
		}
		else  // someone else
		{
			_all_spies[ player.id ].setRoom( teleports_to.room );
			console.log('setting room for other player(', player.id, ')> %o', teleports_to.room );
		}
	};	

	return ctrl;
};

