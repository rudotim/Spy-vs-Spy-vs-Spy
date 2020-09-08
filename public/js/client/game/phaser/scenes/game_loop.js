

const NO_MOVEMENT=0, RUN_RIGHT=1, RUN_DOWN=2, RUN_LEFT=3, RUN_UP=4;

let GameLoop = new Phaser.Class({

	Extends: Phaser.Scene,

	initialize:

		function GameLoop ()
		{

			Phaser.Scene.call(this, { key: 'game_loop' });

			this.mySpy = undefined;
			this.moving = NO_MOVEMENT;
		},


	init: function (data)
	{
		console.log('game_loop init', data);

		this.gameControl = data.gameControl;

		this.players = this.gameControl.players;

		//this.prepPlayers( this.players );
	},

	preload: function ()
	{
		// load all spy sprite data
		this.load.atlas('spies', 'img/spritesheet.png', 'img/sprites.json');

		// load the json only
		this.load.json('spySprite', 'img/sprites.json');



		this.load.image("room","img/demoroom.png");

		const url = '/js/client/game/phaser/plugins/joystick.js';
		this.load.plugin('rexvirtualjoystickplugin', url, true);
	},

	create: function ()
	{
		this.processPlayers( this.players );

		this.add.sprite(0, 0, "room").setOrigin(0, 0);

		this.mySpy = this.add.sprite(350, 230, this.getPlayerAtlastName( this.players[0].id ));


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
		if (this.moving === RUN_RIGHT)
		{
			this.mySpy.x += 2;
		}
		else if (this.moving === RUN_LEFT )
		{
			this.mySpy.x -= 2;
		}
	},


	getPlayerAtlastName : function( playerId )
	{
		return "player_" + playerId + "_atlas";
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

			const newAtlasName = this.getPlayerAtlastName( player.id );

			this.colorPlayerSpriteSheets( newAtlasName, player );

			this.addAnimationsToSpriteSheets( newAtlasName );
		});
	},

	/**
	 * Create sprite sheets with the correct player color
	 * @param atlasName - the name of the atlas which will contain the new texture copies
	 * @param player - a single participating player
	 */
	colorPlayerSpriteSheets : function( atlasName, player )
	{
		// start with the same texture frames as our default model
		let frameData = this.textures.list.spies;

		// duplicate the defualt model onto a new canvas with a new name
		let copiedFrameData = this.copyTextureFromImage( frameData, atlasName + "_canvas" );

		// perform a color swap on the new canvas to color the textures the way we need them
		let redbmd = this.updateTextureColor( copiedFrameData, 0xFFFFFF, player.color );

		// add our new colored textures to a new atlas
		this.textures.addAtlas(atlasName, redbmd.canvas, this.cache.json.get('spies'));
	},

	/**
	 * Add animation specific to the textures from the specified atlas
	 * @param atlasName - the name of the atlas containing the textures to be animated
	 */
	addAnimationsToSpriteSheets : function( atlasName )
	{
		const data = {
			"anims": [
				{
					"key": "run_right",
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
					"key": "run_left",
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
						this.mySpy.play( "run_right" );

					this.moving = RUN_RIGHT;
				}
				else if ( name === "left" )
				{
					if ( this.moving !== RUN_LEFT )
						this.mySpy.play( "run_left" );

					this.moving = RUN_LEFT;
				}
			}
			else
			{
				if ( name === "right")
				{
					if (this.moving === RUN_RIGHT)
					{
						this.mySpy.setFrame( "wspy_rstand" );
						this.mySpy.anims.stop(null, true);
						this.moving = NO_MOVEMENT;
					}
				}
				else if ( name === "left")
				{
					if (this.moving === RUN_LEFT)
					{
						this.moving = NO_MOVEMENT;
						this.mySpy.anims.stop(null, true);
						this.mySpy.setFrame( "wspy_lstand" );
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