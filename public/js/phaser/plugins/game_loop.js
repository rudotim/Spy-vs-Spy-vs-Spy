var GameLoop = new Phaser.Class({

	Extends: Phaser.Scene,

	initialize:

		function GameLoop ()
		{
			Phaser.Scene.call(this, { key: 'game_loop' });
		},

	preload: function ()
	{
		this.load.image("room","img/demoroom.png");

		const url = './js/phaser/plugins/joystick.js';
		this.load.plugin('rexvirtualjoystickplugin', url, true);
	},

	create: function ()
	{
		this.add.sprite(0, 0, "room").setOrigin(0, 0);

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

	dumpJoyStickState: function ()
	{
		let cursorKeys = this.joyStick.createCursorKeys();
		let s = 'Key down: ';
		for (let name in cursorKeys) {
			if (cursorKeys[name].isDown) {
				s += name + ' ';
			}
		}
		s += '\n';
		s += ('Force: ' + Math.floor(this.joyStick.force * 100) / 100 + '\n');
		s += ('Angle: ' + Math.floor(this.joyStick.angle * 100) / 100 + '\n');
		this.text.setText(s);
	}

});