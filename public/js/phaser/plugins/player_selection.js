
const HSVToRGB = Phaser.Display.Color.HSVToRGB;
const DegToRad = Phaser.Math.DegToRad;

class Button extends Phaser.GameObjects.Sprite {
	onInputOver = () => {};
	onInputOut = () => {};
	onInputUp = () => {};

	constructor(scene, x, y, texture, actionOnClick = () => {}, overFrame, outFrame, downFrame) {
		super(scene, x, y, texture);
		scene.add.existing(this);

		this.setFrame(outFrame)
			.setInteractive()

			.on('pointerover', () => {
				this.onInputOver();
				this.setFrame(overFrame)
			})
			.on('pointerdown', () => {
				actionOnClick();
				this.setFrame(downFrame)
			})
			.on('pointerup', () => {
				this.onInputUp();
				this.setFrame(overFrame)
			})
			.on('pointerout', () => {
				this.onInputOut();
				this.setFrame(outFrame)
			})
	}
}


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
			this.mycolor;
		},

	preload: function ()
	{
		this.load.image('spyWhite', 'img/spy0.png');
		this.load.image('wheel', 'img/color-ring.jpg');


		this.load.spritesheet('button', 'https://examples.phaser.io/assets/buttons/button_sprite_sheet.png', { frameWidth: 193, frameHeight: 71 });
		this.load.atlas('buttonAtlas', 'https://examples.phaser.io/assets/buttons/button_texture_atlas.png', 'https://examples.phaser.io/assets/buttons/button_texture_atlas.json')
	},

	create: function ()
	{
		this.text1 = this.add.text(10, 10, '', { fill: '#00ff00' });
		this.text2 = this.add.text(500, 10, '', { fill: '#00ff00' });

		this.input.mouse.disableContextMenu();

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

		let texture = this.copyTextureFromImage( 'spyWhite', 'spyDynamic' );

		const spy = this.add.image( this.cameras.main.centerX, this.cameras.main.centerY, "spyDynamic" );
		spy.setScale( 3 );

		let _this = this;

		this.input.on('pointermove', function (pointer) {

			_this.mycolor = _this.textures.getPixel((pointer.x - _this.wheelpos.x1) / wheelScale, (pointer.y - _this.wheelpos.y1) / wheelScale, 'wheel');

			graphics.clear();

			if (_this.mycolor)
			{
				graphics.lineStyle(1, 0x000000, 1);
				graphics.strokeRect(pointer.x - 1, pointer.y - 1, 34, 34);

				graphics.fillStyle(_this.mycolor.color, 1);
				graphics.fillRect(pointer.x, pointer.y, 32, 32);
			}
		});

		this.input.on('pointerup', function(pointer)
		{
			if (_this.mycolor)
			{
				// replace all white pixels on our spy with the color chosen by the user
				_this.updateTextureColor( texture, 0xFFFFFF, _this.mycolor );
			}
		});

		const actionOnClick = () => {
			// exit out of this scene with our new color
			this.scene.start('game_loop');
		};

		let btn1 = new Button(this, this.cameras.main.displayWidth - 200, this.cameras.main.displayHeight - 80, 'button', actionOnClick, 2, 1, 0);
		btn1.onInputOut = () => {
			console.log('Btn1: onInputOut')
		};
		btn1.setOrigin(0);

		// todo: also add in pointerout to reset tooltip
	},

	/**
	 * Make a copy of the texture identified by srcTextureKey and store it on a new canvas identified by destTextureKey
	 * @param srcTextureKey
	 * @param destTextureKey
	 * @returns {*}
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

		texture.refresh();
	},

	// replaceColor : function( img )
	// {
	// 	let spySrc = this.textures.get('spyWhite').getSourceImage();
	//
	// 	let texture = this.textures.createCanvas('tmpspy', spySrc.width, spySrc.height).draw(0, 0, spySrc);
	//
	// 	console.log('tex> ', texture);
	// 	let pixels = texture.getPixels( 0, 0, texture.width, texture.height );
	//
	// 	const white = 0xFFFFFF;
	// 	const color = 0xFF0000;
	//
	// 	let pixel;
	// 	for ( let row = 0; row < pixels.length; row++ )
	// 	{
	// 		for ( let col = 0; col < pixels[row].length; col++ )
	// 		{
	// 			pixel = pixels[row][col];
	//
	// 			if ( pixel.color === white )
	// 			{
	// 				texture.setPixel( pixel.x, pixel.y, 255, 0, 0 );
	// 			}
	// 		}
	// 	}
	//
	// 	texture.refresh();
	//
	// 	let tmp = this.add.image( 50, 200, 'tmpspy' );
	// 	tmp.setScale( 3 );
	// },

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