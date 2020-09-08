

let GameLogic = function( gameControl, player )
{
	let _gameOptions;

	let ctrl = {};
		
	// holds local copy of game data
	let _gameInstance = {};
	
	const _gameControl = gameControl;

	// Game Control
	// ------------------------------------------
	let gameHasStarted = false;

	// Game Play
	// ------------------------------------------

	// holds all Spies in game
	let _all_spies = {			
	};
	
	// things we need to keep track of
	// gameInst  :	_gameInstance
	// our player:	  _player
	//   map data:     _roomData
	// current room:   _currentRoom
	
	// holds our local player 
	let _player;
	
	// our local Spy object
	let _my_spy;
	
	// the room we're currently in
	let _currentRoom;
	
	// Phaser object holding the room images
	let _roomData;
		
	let roomScene;
	
	// Phaser
	// ------------------------------------------	
	let phaserGame;

	// User Input
	// ------------------------------------------
	let buttonDown = false;
	let joystick;

	// Game UI
	// ------------------------------------------
	let BORDER_TOP = 157;
	let BORDER_BOTTOM = 275;
	let BORDER_LEFT = 18;
	let BORDER_RIGHT = 548;
	let TRIANGLE_LEFT = 152;
	let TRIANGLE_RIGHT = 396;

	let GAME_HEIGHT = (BORDER_BOTTOM - BORDER_TOP);

	let NOTHING = -1;
	let STOP = 0;
	let RIGHT = 1;
	let LEFT = 2;
	let TOP = 3;
	let BOTTOM = 4;

	const _drawRoomCollisions = function()
	{
		console.log('drawing room collisions');

		let graphics = this.add.graphics(0, 0);

		graphics.beginPath();
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
		graphics.closePath();
		graphics.strokePath();
	};

	const _loadLevel = function(levelJsonFile)
	{
		console.log('loading file [' + levelJsonFile + ']');

		let jsonData = undefined;
		const that=this;
		
		$.ajax(
		{
			url : levelJsonFile,
			async : false
		})
		.done(function(data) {
			jsonData = data;
						
			let json = 'data/' + jsonData.asset_json_file;
			let img = 'data/' + jsonData.asset_image_file;

			// read game data from JSON file
			that.load.atlas('room_atlas', img, json, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
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
		// doesn't work in 3.2
		//this.scale.scaleMode = Phaser.ScaleManager.RESIZE;

		// This function will be executed at the beginning
		// That's where we load the images and sounds
		// game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		// game.scale.pageAlignHorizontally = true;
		// game.scale.pageAlignVertically = true;

		// doesn't work in 3.2
		//this.stage.backgroundColor = '#eee';

		// load entire spy vs spy sheet
		//this.load.atlasJSONHash('spies', 'img/spritesheet.png', 'img/sprites.json');

		// synchronus loading of JSON data
		_roomData = _loadLevel.call(this, 'data/level_lobby.json');

		//this.load.plugin('DialogModalPlugin', './js/client/dialog_plugin.js');
		//this.load.plugin('BasePlugin', './js/phaser/plugins/TimDialog.js');
		// this.load.scenePlugin({
		//     key: 'BasePlugin',
		//     url: './js/phaser/plugins/TimDialog.js',
		//     sceneKey: 'BasePlugin'
		// });

		this.load.image('startButton', 'img/buttonStart.png');
		this.load.image('closeButton', 'img/closeButton.png');
		this.load.image("colorWheel","img/colorWheel.png");

		this.load.image("modalBG","img/modalBG.png");
		this.load.image("choosePlayerBG","img/choose_player_bg.png");

		// spies
		this.load.image('spyWhite', 'img/spy0.png');
		this.load.image('spyRed', 'img/spy0Red.png');
		this.load.image('spyGreen', 'img/spy0Green.png');
		this.load.image('spyCyan', 'img/spy0Cyan.png');

		//const url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js';
		const url = './js/phaser/plugins/joystick.js';
		this.load.plugin('rexvirtualjoystickplugin', url, true);

		this.load.scenePlugin({
			key: 'player_selection',
			url: './js/phaser/plugins/player_selection.js',
			sceneKey: 'player_selection'
		});

		//this.load.scenePlugin('player_selection', './js/phaser/plugins/player_selection.js');
		//this.load.scenePlugin('game_loop', './js/phaser/plugins/game_loop.js');
	}

	function create()
	{		
		// TODO: draw the first room for the current player
		let startingRoom = "room0";
//		roomScene = this.add.sprite(0, 0, 'room_atlas', startingRoom );
//		roomScene.setOrigin(0);

		this.sys.install('player_selection');

		_drawRoomCollisions.call( this );

		this.input.mouse.capture = true;

		this.cursors = this.input.keyboard.createCursorKeys();

		this.scale.startFullscreen();

		//this.sys.install('BasePlugin');
		// this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
		// 	x: 400,
		// 	y: 300,
		// 	radius: 100,
		// 	base: this.add.circle(0, 0, 100, 0x888888),
		// 	thumb: this.add.circle(0, 0, 50, 0xcccccc),
		// 	// dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
		// 	// forceMin: 16,
		// 	// enable: true
		// }).on('update', dumpJoyStickState, this);
		//
		// this.text = this.add.text(0, 0);
		// dumpJoyStickState.call( this );

		// x, y, baseDiameter, stickDiameter, limit, baseColor, stickColor) {
//		joystick.init(phaserGame.width-80, phaserGame.height-90, 80, 60, 40, "#AA3300", "#cccccc");
//		joystick.start();

//		this.stage.backgroundColor = '#4d4d4d';
//		this.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

		// this.sys.install('DialogModalPlugin');
		// console.log(this.sys.dialogModal);
		// this.sys.dialogModal.init();
		// this.sys.dialogModal.setText('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', true);

		// ctrl is our 'game_logic::this' variable  (probably better way to pass this in)
		//_gameOptions = new GameOptions( ctrl, this );
		//_gameOptions.show( );
	}

	// function dumpJoyStickState()
	// {
	// 	var cursorKeys = this.joyStick.createCursorKeys();
	// 	var s = 'Key down: ';
	// 	for (var name in cursorKeys) {
	// 		if (cursorKeys[name].isDown) {
	// 			s += name + ' ';
	// 		}
	// 	}
	// 	s += '\n';
	// 	s += ('Force: ' + Math.floor(this.joyStick.force * 100) / 100 + '\n');
	// 	s += ('Angle: ' + Math.floor(this.joyStick.angle * 100) / 100 + '\n');
	// 	this.text.setText(s);
	// }

	function createSpy( id, posX, posY, playerConfig )
	{
		return new Spy(phaserGame, id, posX, posY, playerConfig, _gameControl);				
	}

	function update()
	{
		// if there was joystick usage, get movement direction
//		let movement = joystick.setVelocity( _my_spy, 0, 4 );
		let movement = 0;
		
		// if no joystick usage, check keyboard
	    if ( movement === 0 )
	    	{
	    		if (this.cursors.right.isDown)
	    			movement = 1;
	    		else if (this.cursors.down.isDown)
	    			movement = 2;
	    		else if (this.cursors.left.isDown)
	    			movement = 3;
	    		else if (this.cursors.up.isDown)
	    			movement = 4;
	    	}

	    if ( _currentRoom !== undefined )
	    {
		    Object.keys(_all_spies).forEach(function(key) 
		    	{		    		
		    		if ( _all_spies[key]._room_id === _currentRoom.id )
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
		if ( movement !== 0 )
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
			}
			
			// check for collisions and boundaries
			checkCollisions( _my_spy, movement );
			
			// send to remote players
			_gameControl.sendPosUpdate( _my_spy );
			
			
			// check if we've collided with any interactable objects
			checkItemInterations( _my_spy );
		}
		
//		joystick.update();
	}

	function render()
	{
		this.debug.text("(x: " + this.input.mousePointer.x + ", y: " + this.input.mousePointer.y + ")", 0, 50);
	}

	function checkItemInterations( spy )
	{
		let door;
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

			let top_border = BORDER_TOP;
			// If we're in left triangle... 
			if ( spy.box.x <= TRIANGLE_LEFT )
			{									
				let max_vert_dist = (spy.box.x - BORDER_LEFT);
				top_border = (BORDER_BOTTOM - max_vert_dist);

				//console.log('t_border: ' + top_border + ' max(' + max_vert_dist + ') y: ' + spy.y + '   box(' + spy.box.x + ', ' + spy.box.y + ')');				
			}
			// right triangle
			else if ( spy.box.x >= TRIANGLE_RIGHT )
			{
				let max_vert_dist = (BORDER_RIGHT - spy.box.x);				
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
			
			let left_border = 0;
			
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
				
			let right_border = 0;
			
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
	}

	// -------------------------------------------------------
	// Game Play Config
	// -------------------------------------------------------
	
	ctrl.getPlayer = function()
	{
		return _player;
	};

	ctrl.setPlayerName = function( newName )
	{
		_player.name = newName;
	};

	ctrl.onStartGame = function()
	{
		// inflate game_div
		//$('#game_div').toggleClass('fullscreen');
		
		let gameWidth = window.innerWidth; // * window.devicePixelRatio;
		let gameHeight = window.innerHeight; // * window.devicePixelRatio;

		//gameWidth = window.innerWidth * window.devicePixelRatio;
		//gameHeight = window.innerHeight * window.devicePixelRatio;

		const scaleRatio = window.devicePixelRatio / 3;

		console.log('scale rario> ', scaleRatio);

		console.log("width/height: ", gameWidth, gameHeight);

		const config = {
			type: Phaser.AUTO,
			scale: {
				mode: Phaser.Scale.FIT,
				parent: 'game_div',
				autoCenter: Phaser.Scale.CENTER_BOTH,
				width: 800,
				height: 600
			},
			// physics: {
			// 	default: 'arcade',
			// 	arcade: {
			// 		gravity: { y: 300 },
			// 		debug: false
			// 	}
			// },
//			scene : [ PlayerSelection, GameLoop ]
			// scene: {
			// 	preload : preload,
			// 	create : create,
			// 	update : update,
			// 	render : render
			// }
		};

		phaserGame = new Phaser.Game(config);

		phaserGame.scene.add('player_selection', PlayerSelection, true, {"gameControl": _gameControl});
		phaserGame.scene.add('game_loop', GameLoop, false, {"gameControl": _gameControl});

		gameHasStarted = true;
	};

	ctrl.gameHasStarted = function()
	{
		return gameHasStarted;
	};

	ctrl.showGameOptions = function()
	{
		// draw gray rectangle on top of viewport
		_gameOptions.show();		
	};
		
	ctrl.invokeChoosePlayer = function( playerIndex, playerConfig, playerChosenCallback )
	{
		_gameControl.choosePlayer( _player, playerIndex, playerConfig, playerChosenCallback );
	};

	ctrl.onChoosePlayer = function( player_id, player_config )
	{
		console.log('onChoosePlayer');
	
		//spy.setVisibility( false );
		
		// when it's us
		if ( player_id === _player.id )
		{
			if ( _my_spy !== undefined )
				_my_spy.destroySprite();
			
			_my_spy = createSpy( player_id, 250, 200, player_config );
		}
		else
		// when it's someone else
		{
			if ( _all_spies[ player_id ] !== undefined )
				_all_spies[ player_id ].destroySprite();

			_all_spies[ player_id ] = createSpy( player_id, 200, 125, player_config );
		}	
	};
	
	ctrl.playerIsReady = function()
	{
		console.log( 'player is ready> %o', _player );

		_gameControl.triggerPlayerIsReady( _player );
	};

	ctrl.onPlayerReady = function( player_id )
	{
		console.log('player> %o is ready', player_id);
	};

	ctrl.onGameLoading = function( game_loading_pct )
	{
		console.log('game loaded pct> %o', game_loading_pct);
	};
	
	ctrl.onLoadMapData = function( gameInstance )
	{
		_gameInstance = gameInstance;
		
		let roomId;
		// parse everything
		let r = _gameInstance.jsonMapData.rooms.length;
		while ( r-- )
		{
			roomId = _gameInstance.jsonMapData.rooms[r].id;
			_gameInstance.rooms[roomId] = new Room(_gameInstance.jsonMapData.rooms[r]);
		}			
		
		// let server know we've loaded everything
		_gameControl.triggerPlayerLoadedMap( _player );
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
		if ( player.id !== _my_spy._player_id )
		{
			console.log('we will stop drawing player ', player.id);
			_all_spies[ player.id ].setRoom( roomId );
		}		
	};

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
		if ( player.id === _my_spy._player_id )
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

