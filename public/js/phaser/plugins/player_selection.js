
const HSVToRGB = Phaser.Display.Color.HSVToRGB;
const DegToRad = Phaser.Math.DegToRad;

var PlayerSelection = new Phaser.Class({

	Extends: Phaser.Scene,

	initialize:

		function PlayerSelection ()
		{
			Phaser.Scene.call(this, { key: 'player_selection' });

			this.text1;
			this.text2;
			this.wheel;
			this.wheelpos;
		},

	preload: function ()
	{
		this.load.image('spyWhite', 'img/spy0.png');
		this.load.image('wheel', 'img/color-ring.jpg');
	},

	create: function ()
	{
		this.text1 = this.add.text(10, 10, '', { fill: '#00ff00' });
		this.text2 = this.add.text(500, 10, '', { fill: '#00ff00' });

		this.input.mouse.disableContextMenu();

		const spy = this.add.image( this.cameras.main.centerX, this.cameras.main.centerY, "spyWhite" );
		spy.setScale( 3 );

		this.wheel = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'wheel');
		const wheelScale = 0.75;
		this.wheel.setScale( wheelScale );

		this.wheelpos = {
			x1 : this.cameras.main.centerX - (this.wheel.displayWidth/2),
			y1 : this.cameras.main.centerY - (this.wheel.displayHeight/2),
			x2 : this.cameras.main.centerX + (this.wheel.displayWidth/2),
			y2 : this.cameras.main.centerY + (this.wheel.displayHeight/2)
		};

		let graphics = this.add.graphics( { x: 0, y: 0 });

		let _this = this;

		this.input.on('pointermove', function (pointer) {

			let color = _this.textures.getPixel((pointer.x - _this.wheelpos.x1) / wheelScale, (pointer.y - _this.wheelpos.y1) / wheelScale, 'wheel');

			graphics.clear();

			if (color)
			{
				graphics.lineStyle(1, 0x000000, 1);
				graphics.strokeRect(pointer.x - 1, pointer.y - 1, 34, 34);

				graphics.fillStyle(color.color, 1);
				graphics.fillRect(pointer.x, pointer.y, 32, 32);
			}
		});

		// todo: also add in pointerout to reset tooltip
	},

	update : function()
	{
		let pointer = this.input.activePointer;

		this.text1.setText([
			'x: ' + pointer.worldX,
			'y: ' + pointer.worldY,
			'isDown: ' + pointer.isDown
		]);
	},
});