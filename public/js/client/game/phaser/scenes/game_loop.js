

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
		// define our frames for the running aniimations
		const data = {
			"anims": [
				{
					"key": "run_right",
					"type": "frame",
					"frameRate" : 12,
					"repeat" : -1,
					"frames": [
						{
							"key": "spies",
							"frame": "wspy_rstand",
							"duration": 0,
							"visible": false
						},
						{
							"key": "spies",
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
							"key": "spies",
							"frame": "wspy_lstand",
							"duration": 0,
							"visible": false
						},
						{
							"key": "spies",
							"frame": "wspy_lrun",
							"duration": 0,
							"visible": false
						},
					]
				},
			]
		};

		this.anims.fromJSON(data);

		this.colorPlayerSpriteSheets( this.players );

		this.add.sprite(0, 0, "room").setOrigin(0, 0);

		this.add.image(150, 100, 'redSpies', 1); // 'wspy_rrun');

		this.mySpy = this.add.sprite(350, 230, 'spies');


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

	/**
	 * Create sprite sheets with the correct player colors
	 * @param players - all players participating in this game session
	 */
	colorPlayerSpriteSheets : function( players )
	{
		players.forEach( player =>
		{
			console.log('player> %o', player );
			let newAtlasName = player.id + "_";
			newAtlasName = "redSpies";

			// get all frame data coordinates
			//let frameData = this.cache.getFrameData( "spies" );
			//let frameData = this.textures.getFrame("spies");
			let frameData = this.textures.list.spies;

			let copiedFrameData = this.copyTextureFromImage( frameData, 'redSpies2' );
			// create red player bitmap data, resize it from the 'spies' atlas
			//let redbmd = this.make.bitmapData();
			//redbmd.load( "spies" );

			// color it to reflect our new player's choice
			//redbmd.replaceRGB(255, 255, 255, 255, playerConfig.color.r, playerConfig.color.g, playerConfig.color.b, 255);
			//redbmd.replaceRGB(255, 255, 255, 255, 255, 0, 0, 255);

			let redbmd = this.updateTextureColor( copiedFrameData, 0xFFFFFF, player.color );
			//let redbmd = copiedFrameData;

			// // create a new texture atlas using our new player's color
			// let atlasRedFrames = [];
			//
			// let currFrame;
			// frameData.frames.forEach( currFrame =>
			// //for ( let key in frameData.frames )
			// {
			// 	//currFrame = frameData.frames[key];
			// 	atlasRedFrames.push(
			// 		{
			// 			"filename" :  currFrame.name,
			// 			"frame" :
			// 				{
			// 					x: currFrame.x, y: currFrame.y, w: currFrame.width, h: currFrame.height
			// 				}
			// 		});
			// });
			//
			// let atlasRed = { frames: atlasRedFrames };
			//
			// console.log( "new json> %o", atlasRed );

			let jsonData = this.cache.json.get('spies');
			console.log( "jsonData> %o", jsonData );
			//this.cache.addTextureAtlas(newAtlasName, '', redbmd, atlasRed, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
			this.textures.addAtlasJSONHash(newAtlasName, redbmd.canvas, jsonData );
			//this.load.atlas(newAtlasName, redbmd.canvas, data);

		});

	},

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