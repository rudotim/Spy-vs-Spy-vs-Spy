

const NO_MOVEMENT=0, RUN_RIGHT=1, RUN_DOWN=2, RUN_LEFT=3, RUN_UP=4;

let GameLoop = new Phaser.Class({

	Extends: Phaser.Scene,

	initialize:

		function GameLoop ()
		{
			Phaser.Scene.call(this, { key: 'game_loop' });

			// the status of our movement
			this.moving = NO_MOVEMENT;
		},


	init: function (data)
	{
		this.eventCenter = EventDispatcher.getInstance();
		this.addListeners();

		this.gameControl = data.gameControl;

		this.players = this.gameControl.players;
		this.myPlayer = this.players.find( p => p.id === this.gameControl.player.id );
	},

	destroy : function()
	{
		console.log("Destroying game loop plugin");
		this.removeListeners();
	},

	addListeners : function()
	{
		// clear out any previous listeners
		this.removeListeners();

		this.eventCenter.on('on_player_state_update', this.onUpdatePlayerState, this);
	},

	removeListeners : function()
	{
		this.eventCenter.removeListener('on_player_update_options');
	},

	preload: function ()
	{
		// load all spy sprite data for our default model
		this.load.atlas('spies', 'img/spritesheet.png', 'img/sprites.json');

		this.load.image("room","img/demoroom.png");

		const url = '/js/client/game/phaser/plugins/joystick.js';
		this.load.plugin('rexvirtualjoystickplugin', url, true);
	},

	create: function ()
	{
		// todo: load level data according to game options
		//console.log("game map> %o", this.gameControl.game.options.gameMap );

		this.add.sprite(0, 0, "room").setOrigin(0, 0);

		// make copies of our default model for each player.
		// color the models and configure the animation frames.
		this.processPlayers( this.players );

		this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
			x: 200,
			y: this.cameras.main.displayHeight - 125,
			radius: 100,
			base: this.add.circle(0, 0, 100, 0x888888),
			thumb: this.add.circle(0, 0, 50, 0xcccccc),
			// dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
			// forceMin: 16,
			// enable: true
		}).on('update', this.dumpJoyStickState, this);

		this.text = this.add.text(0, 0);
		this.dumpJoyStickState.call( this );
	},


	update: function()
	{
		let update = true;
		if (this.moving === RUN_RIGHT)
		{
			this.myPlayer.spy.x += 2;
		}
		else if (this.moving === RUN_LEFT )
		{
			this.myPlayer.spy.x -= 2;
		}
		else if (this.moving === RUN_UP )
		{
			this.myPlayer.spy.y -= 2;
		}
		else if (this.moving === RUN_DOWN )
		{
			this.myPlayer.spy.y += 2;
		}
		else
			update = false;

		if ( update === true )
			this.updatePlayerState( this.myPlayer.spy.x, this.myPlayer.spy.y, this.moving, "run_right" );
	},


	getPlayerAtlastName : function( playerId )
	{
		return "pAtlas_" + playerId;
	},

	getPlayerTextureName : function ( playerId )
	{
		return "pTex_" + playerId;
	},

	getPlayerAnimationKey : function ( playerId, animationName )
	{
		return "pAnim_" + playerId + animationName;
	},

	/**
	 * Process each player to prep their image data for specific colorization and animation.
	 * @param players - a list of all the players in this game
	 */
	processPlayers : function( players )
	{
		players.forEach( player =>
		{
			console.log('player> %o', player );

			this.colorPlayerSpriteSheets( player.id, player );

			this.addAnimationsToSpriteSheets( player.id );

			this.placePlayerStartingLocation( player );
		});
	},

	placePlayerStartingLocation : function( player )
	{
		// todo: add logic to move players to new locations/rooms

		// draw players in their starting locations.
		let spy = this.add.sprite(350, 230, this.getPlayerAtlastName( player.id ));

		player.spy = spy;

		// // associate the player objects with their game sprites.
		// // keep a simple reference to our own sprite.
		if ( player.id === this.myPlayer.id )
		{
			//this.myPlayer.spy = spy;
			console.log('my spy> %o', this.myPlayer );
		}
	},

	/**
	 * Called when any other player has updated their position or state
	 * @param playerUpdateData
	 */
	onUpdatePlayerState : function( playerUpdateData )
	{
		const player = this.players.find( p => p.id === playerUpdateData.id );

		if ( player !== undefined )
		{
			//console.log( "onUpdatePlayer> %o", playerUpdateData );
			player.spy.x = playerUpdateData.x;
			player.spy.y = playerUpdateData.y;
			player.spy.endFrame = playerUpdateData.endFrame;

			// if moving, play left/right/up/down animation
			if ( player.spy.moving !== RUN_LEFT && playerUpdateData.moving === RUN_LEFT )
			{
				player.spy.play( this.getPlayerAnimationKey( player.id, "run_left") );
			}
			else if ( player.spy.moving !== RUN_RIGHT && playerUpdateData.moving === RUN_RIGHT )
			{
				player.spy.play( this.getPlayerAnimationKey( player.id, "run_right") );
			}
			else if ( playerUpdateData.moving === NO_MOVEMENT )
			{
				// if not moving, show still frame
				player.spy.anims.stop(null, true);
				console.log("done moving, showing frame: %o", player.spy.endFrame );
				player.spy.setFrame( player.spy.endFrame );
			}

			player.spy.moving = playerUpdateData.moving;
		}
	},

	/**
	 * Update our player's position or state and send that data to the other players
	 * @param x
	 * @param y
	 * @param moving
	 * @param frame
	 */
	updatePlayerState : function( x, y, moving, frame )
	{
		this.gameControl.player.x = x;
		this.gameControl.player.y = y;
		this.gameControl.player.moving = moving;
		this.gameControl.player.endFrame = frame;
		this.gameControl.sendPlayerStateUpdate( this.gameControl.player.id, x, y, moving, frame );
	},

	/**
	 * Create sprite sheets with the correct player color
	 * @param playerId - the id of the current player for whom we're creating sprite sheets
	 * @param player - a single participating player
	 */
	colorPlayerSpriteSheets : function( playerId, player )
	{
		// start with the same texture frames as our default model
		let frameData = this.textures.list.spies;

		// duplicate the defualt model onto a new canvas with a new name
		let copiedFrameData = this.copyTextureFromImage( frameData, this.getPlayerTextureName(playerId) );

		// perform a color swap on the new canvas to color the textures the way we need them
		let redbmd = this.updateTextureColor( copiedFrameData, 0xFFFFFF, player.game.color );

		// add our new colored textures to a new atlas
		this.textures.addAtlas( this.getPlayerAtlastName(playerId), redbmd.canvas, this.cache.json.get('spies'));
	},

	/**
	 * Add animation specific to the textures from the specified atlas
	 * @param playerId - the id of the current player for whom we're creating animations
	 */
	addAnimationsToSpriteSheets : function( playerId )
	{
		const atlasName = this.getPlayerAtlastName( playerId );

		const data = {
			"anims": [
				{
					"key": this.getPlayerAnimationKey( playerId, "run_right" ),
					"type": "frame",
					"frameRate" : 12,
					"repeat" : -1,
					"frames": [
						{
							"key": atlasName,
							"frame": "wspy_rstand",
							"duration": 0,
							"visible": false
						},
						{
							"key": atlasName,
							"frame": "wspy_rrun",
							"duration": 0,
							"visible": false
						},
					]
				},
				{
					"key": this.getPlayerAnimationKey( playerId, "run_left" ),
					"type": "frame",
					"frameRate" : 12,
					"repeat" : -1,
					"frames": [
						{
							"key": atlasName,
							"frame": "wspy_lstand",
							"duration": 0,
							"visible": false
						},
						{
							"key": atlasName,
							"frame": "wspy_lrun",
							"duration": 0,
							"visible": false
						},
					]
				},
			]
		};

		this.anims.fromJSON(data);
	},

	/**
	 * Copy the texture from an image onto a new canvas
	 * @param srcTextureKey - the text identifier of the source image
	 * @param destTextureKey - the text identifier of the new destination imigae
	 * @returns the newly created canvas containing a copy of the source texture
	 */
	copyTextureFromImage : function( srcTextureKey, destTextureKey )
	{
		let spySrc = this.textures.get(srcTextureKey).getSourceImage();

		return this.textures.createCanvas(destTextureKey, spySrc.width, spySrc.height).draw(0, 0, spySrc);
	},

	/**
	 * Replace all occurances of the color 'replaceColor' within 'texture' with the color 'newColor'
	 * @param texture the texture containing white pixels
	 * @param replaceColor the color being replaced
	 * @param newColor the new color being added
	 */
	updateTextureColor : function( texture, replaceColor, newColor )
	{
		let pixels = texture.getPixels( 0, 0, texture.width, texture.height );

		let pixel;
		for ( let row = 0; row < pixels.length; row++ )
		{
			for ( let col = 0; col < pixels[row].length; col++ )
			{
				pixel = pixels[row][col];

				// look for white
				if ( pixel.color === replaceColor )
				{
					texture.setPixel( pixel.x, pixel.y, newColor.r, newColor.g, newColor.b );
				}
			}
		}

		return texture.refresh();
	},

	dumpJoyStickState: function ()
	{
		let cursorKeys = this.joyStick.createCursorKeys();
		let s = 'Key down: ';
		for (let name in cursorKeys)
		{
			if (cursorKeys[name].isDown)
			{
				s += name + ' ';

				if ( name === "right" )
				{
					if ( this.moving !== RUN_RIGHT )
						this.myPlayer.spy.play( this.getPlayerAnimationKey( this.myPlayer.id, "run_right") );

					this.moving = RUN_RIGHT;
				}
				else if ( name === "left" )
				{
					if ( this.moving !== RUN_LEFT )
						this.myPlayer.spy.play( this.getPlayerAnimationKey( this.myPlayer.id, "run_left") );

					this.moving = RUN_LEFT;
				}
			}
			else
			{
				if ( name === "right")
				{
					if (this.moving === RUN_RIGHT)
					{
						this.myPlayer.spy.anims.stop(null, true);
						this.myPlayer.spy.setFrame( "wspy_rstand" );
						this.moving = NO_MOVEMENT;
						this.updatePlayerState( this.myPlayer.spy.x, this.myPlayer.spy.y, this.moving, "wspy_rstand" );
					}
				}
				else if ( name === "left")
				{
					if (this.moving === RUN_LEFT)
					{
						this.myPlayer.spy.anims.stop(null, true);
						this.myPlayer.spy.setFrame( "wspy_lstand" );
						this.moving = NO_MOVEMENT;
						this.updatePlayerState( this.myPlayer.spy.x, this.myPlayer.spy.y, this.moving, "wspy_lstand" );
					}
				}
			}
		}
		s += '\n';
		s += ('Force: ' + Math.floor(this.joyStick.force * 100) / 100 + '\n');
		s += ('Angle: ' + Math.floor(this.joyStick.angle * 100) / 100 + '\n');
		this.text.setText(s);
	}

});