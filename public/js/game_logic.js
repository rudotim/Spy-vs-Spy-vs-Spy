


var GameLogic = function()
{
	var _gameOptions;

	var ctrl =
	{};
	
	// holds local copy of game data
	var _gameData = {};
	
	var _gameControl = {};
	
	// holds all players in game room
	var _local_players = {			
	};
	
	// holds our local player 
	var _player = {};
	var _my_spy;

	var _roomData = {};
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
			_roomData = jd;
		});

		req.fail(function(jqXHR, textStatus)
		{
			alert("Request failed: " + textStatus);
		});
	};

		
	function _moveToRoom( roomId )
	{
		roomScene.frameName = roomId;					
	}
	
	function testButtonPress()
	{
		_moveToRoom("room0");
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

		phaserGame.load.image('button_test', 'img/button_right_blue.png');

		phaserGame.load.image('startButton', 'img/buttonStart.png');
		//phaserGame.load.image('button_test', 'img/button_right_blue.png');
		
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
		roomScene = phaserGame.add.sprite(0, 0, 'lobby', 'room1');

		_drawRoomCollisions(phaserGame);

		phaserGame.input.mouse.capture = true;
		
		var testButton = phaserGame.add.button(phaserGame.world.centerX - 300, 225, 'button_test', testButtonPress, this, 2, 1, 0);
		testButton.scale.setTo(0.25, 0.25);
				
		// This function is called after the preload function
		// Here we set up the game, display sprites, etc.
		//_my_spy = new Spy(phaserGame, 250, 200, white_spy_def, gameControl);				
		
		//players.push(_my_spy);

		joystick.init(630, 330, 80, 60, 40, "#AA3300", "#cccccc");
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
		if ( joystick.setVelocity( _my_spy, 0, 4 ) )		
			_gameControl.sendPosUpdate( _my_spy );
		
		joystick.update();
		
		// if players are in our room, update their position
		/*
		var p = 0;
		var key = '';
		for ( p = 0; p<gameData.players.keys.length; p++ )
		{
			key = gameData.players.keys[p];

			if ( _my_spy.player_id == key )
				continue;
		}
		*/
		
	}

	
	// on each update:
	// 
	// check if spy has violated any boundaries (triggers, hard perimeter)
	// 
	
	function render()
	{
		phaserGame.debug.text("(x: " + phaserGame.input.mousePointer.x + ", y: " + phaserGame.input.mousePointer.y + ")", 0, 50);
	}

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
		
		phaserGame = new Phaser.Game(800, 400, Phaser.AUTO, 'game_div',
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
		
	
	ctrl.onPreGameComplete = function( gameData, _player )
	{
		console.log('onPreGameComplete');
		
		_gameOptions.hide();		

		// add players
		console.log( gameData );
		//console.log( gameData.players );
		console.log('--- now you ---');
		console.log( _player );
		
		var spy;
		
		var p = 0;
		var key = '';
		for ( p = 0; p<gameData.players.keys.length; p++ )
		{
			key = gameData.players.keys[p];
			console.log('key> ' + key );
			console.log(gameData.players.player_data[key]);

			console.log('player_def> ' + gameData.players.player_data[key].player_def );
			
			spy = createSpy( key, 250, 200, gameData.players.player_data[key].player_def );
			
			if ( gameData.players.player_data[key].player_id == _player.player_id )
			{
				console.log('found you!> ' + _player.player_id );
				_my_spy = spy;
			}
			
			// save each player locally
			_local_players[key] = spy;			
		}
				
		_startGame( gameData, _player );
	};	
	
	_startGame = function( gameData, _player )
	{
		console.log( 'startGame...');

		_gameData = gameData;
		
		// so now we have all the players and their initial positions
		
		// update our character's data
		
		// now reflect those changes in our game if necessary
		
		
		
		// find our player and our starting room
		console.log( _gameData );
				
		_moveToRoom( "room0" );
		// TODO: begin timer
		// zero scores
		// play level music
		// move player to starting room, location
	};
	
	ctrl.invokeChoosePlayer = function( playerIndex, modalPlayerConfig, playerChosenCallback )
	{
		console.log( 'choosen player');
		console.log( playerIndex );
		
		_gameControl.choosePlayer( _player, modalPlayerConfig, playerChosenCallback );
	};
	
	ctrl.onChoosePlayer = function()
	{
		
	};
	
	ctrl.updatePlayerPos = function( spyPos )
	{
		console.log('updatePlayerPos');
		console.log( spyPos );
		
		_local_players[ spyPos.player_id ].setPos( spyPos );			
	};
	
	return ctrl;
};

