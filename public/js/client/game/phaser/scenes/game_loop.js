

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

	preload: function ()
	{
		// load all spy sprite data
		this.load.atlas('spies', 'img/spritesheet.png', 'img/sprites.json');


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
		this.add.sprite(0, 0, "room").setOrigin(0, 0);

		this.add.image(150, 100, 'spies', 'wspy_stand');


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