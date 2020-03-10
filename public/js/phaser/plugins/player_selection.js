
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
			this.graphics;
			this.show_tooltip;
			this.wheel;
		},

	preload: function ()
	{
		this.load.image('spyWhite', 'img/spy0.png');
	},

	create: function ()
	{
		//this.cameras.main.centerOn(0, 0);

		this.text1 = this.add.text(10, 10, '', { fill: '#00ff00' });
		this.text2 = this.add.text(500, 10, '', { fill: '#00ff00' });

		//this.add.sprite(Phaser.Math.Between(0, 800), 300, 'mech');
		this.input.mouse.disableContextMenu();


		const spy = this.add.image( this.cameras.main.centerX, this.cameras.main.centerY, "spyWhite" );

		//spy.scale.set(5);

		// this.input.once('pointerdown', function (event)
		// {
		// 	console.log('From PlayerSelection to GameLoop');
		//
		// 	this.scene.start('game_loop');
		//
		// }, this);

		let colors = Phaser.Display.Color.HSVColorWheel(1, 1);

		this.graphics = this.add.graphics(0, 0);
		this.graphics.fillStyle(0x2200ff,0.4);
		this.graphics.fillRect(0,0,300,300);

		const that = this;
		let innerRadius = 50, outerRadius = 150;

		const w = 150; //this.cameras.main.centerX;
		const h = 150; //this.cameras.main.centerY;
		colors.forEach(function (item, i)
		{
			let a = DegToRad(i);
			let cosA = Math.cos(a);
			let sinA = Math.sin(a);

			that.graphics
				.lineStyle(3, item.color)
				.lineBetween(
					w + (innerRadius * cosA),  // x1
					h + (innerRadius * sinA),  // y1
					w + (outerRadius * cosA),  // x2
					h + (outerRadius * sinA)   // y2
				)

			// that.graphics
			// 	.lineStyle(3, item.color)
			// 	.lineBetween(
			// 		400 + (r0 * cosA),
			// 		300 + (r0 * sinA),
			// 		400 + (r1 * cosA),
			// 		300 + (r1 * sinA)
			// 	)
		});

		this.graphics.generateTexture('hudbar', 300, 300);
		this.graphics.destroy();

		this.wheel = this.add.image( this.cameras.main.centerX, this.cameras.main.centerY, 'hudbar' ).setInteractive();

//		this.color_tooltip = this.make.graphics({x : 0, y : 0, add : false});

		// this.graphic2=this.make.graphics({x: 0, y: 0, add: false});
		// this.graphic2.fillStyle(0x2200ff,0.4);
		// this.graphic2.fillRect(0,0,400,400);
		// this.graphic2.generateTexture('wheel',400,400);

//		this.wheel = this.add.sprite(0,0,'wheel').setInteractive();

		this.wheel.on('pointerdown', function (pointer)
		{
			this.show_tooltip = true;
		}, this );

		this.wheel.on('pointerup', function (pointer)
		{
			this.show_tooltip = false;
		}, this );


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

		if ( this.show_tooltip === true )
		{
			this.updateTooltip( pointer.worldX, pointer.worldY );
		}
	},

	updateTooltip : function(x, y)
	{
		const color = this.textures.getPixel(x - 250, y - 150, 'hudbar');

		console.log('color> ', color);


		// let px = parseInt(x - popup.x - 490 + 75, 10);
		// let py = parseInt(y - popup.y - 175 + 75, 10);
		// //let py = y - popup.y - 175 + 75;
		//
		// //console.log('pointer(', x, y, ') colorWheel(', colorWheel.x, ', ', colorWheel.y, ') popup(', popup.x, ', ', popup.y, ')' );
		// //console.log('px/py(', px, py, ')');
		//
		// if (px >= 0 && px <= bmd.width && py >= 0 && py <= bmd.height)
		// {
		// 	spyColor = bmd.getPixelRGB(px, py);
		//
		// 	tooltip.fill(0, 0, 0);
		// 	tooltip.rect(1, 1, 62, 62, spyColor.rgba);
		//
		// 	sprite.x = x;
		// 	sprite.y = y;
		// 	sprite.visible = true;
		// }
	}

});