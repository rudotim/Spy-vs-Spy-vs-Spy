
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

			this.text1 = undefined;
			//this.text2 = undefined;
			this.wheel = undefined;
			this.wheelpos = undefined;
			this.mycolor = undefined;

			this.gameControl = undefined;

			// keep track of player names, color, status
			this.players = [];
		},

	init: function (data)
	{
		console.log('player_selection init', data);

		this.gameControl = data.gameControl;

		console.log("configuring event callback> ");

		this.eventCenter = EventDispatcher.getInstance();
		this.addListeners();

		this.players = this.gameControl.players;

		this.prepPlayers( this.players );
	},

	stop : function()
	{
		this.cleanup();
	},

	destroy : function()
	{
		this.cleanup();
	},

	cleanup : function()
	{
		console.log("Destroying player selection plugin");
		this.removeListeners();
	},

	addListeners : function()
	{
		// clear out any previous listeners
		this.removeListeners();

		this.eventCenter.on('on_player_joined', this.onPlayerJoined, this);
		this.eventCenter.on('on_player_left', this.onPlayerLeft, this);
		this.eventCenter.on('on_list_players', this.onListPlayers, this);
		this.eventCenter.on('on_player_update_options', this.onPlayerUpdateOptions, this);
	},

	removeListeners : function()
	{
		this.eventCenter.removeListener('on_player_joined');
		this.eventCenter.removeListener('on_player_left');
		this.eventCenter.removeListener('on_list_players');
		this.eventCenter.removeListener('on_player_update_options');
	},


	/**
	 * Initialize all player data to defaults
	 * @param players
	 */
	prepPlayers: function( players )
	{
		players.forEach( player =>
		{
			player.color = Phaser.Display.Color.HexStringToColor( "0xFFFFFF" );
			player.ready = false;
			player.text = undefined;

			console.log("player prepped> ", player );
		});
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

		this.input.mouse.disableContextMenu();

		const centerOffsetX = -125;
		const centerOffsetY = +50;
		this.wheel = this.add.image(this.cameras.main.centerX + centerOffsetX, this.cameras.main.centerY + centerOffsetY, 'wheel');
		const wheelScale = 0.75;
		this.wheel.setScale( wheelScale );

		this.wheelpos = {
			x1 : this.cameras.main.centerX - (this.wheel.displayWidth/2) + centerOffsetX,
			y1 : this.cameras.main.centerY - (this.wheel.displayHeight/2) + centerOffsetY,
			x2 : this.cameras.main.centerX + (this.wheel.displayWidth/2) + centerOffsetX,
			y2 : this.cameras.main.centerY + (this.wheel.displayHeight/2) + centerOffsetY
		};

		let graphics = this.add.graphics( { x: 0, y: 0 });

		// copy texture from 'spyWhite' to a new one 'spyDynamic'
		let texture = this.copyTextureFromImage( 'spyWhite', 'spyDynamic' );

		const spy = this.add.image( this.cameras.main.centerX + centerOffsetX, this.cameras.main.centerY + centerOffsetY, "spyDynamic" );
		spy.setScale( 3 );

		let _this = this;

		this.drawPlayerStatus( this.players );

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

				// send this to the other players
				_this.sendPlayerUpdateOptions( _this.mycolor, false );
			}
		});

		const actionOnClick = () =>
		{
			// todo: better way to transition between scenes?
			this.cleanup();
			this.scene.stop('player_selection');

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

	sendPlayerUpdateOptions : function( color, ready )
	{
		this.gameControl.player.color = color;
		this.gameControl.player.ready = ready;
		this.gameControl.sendPlayerUpdateOptions( this.gameControl.player );
	},

	onPlayerUpdateOptions : function( playerOptions )
	{
		// find player with 'id', change spy color to 'color'
		const player = this.players.find( p => p.id === playerOptions.id );

		if ( player )
		{
			player.color = playerOptions.color;
			player.ready = playerOptions.ready;
		}

		this.drawPlayerStatus( this.players );
	},

	onPlayerJoined : function( playerId, playerName )
	{
		console.log('onPlayerJoined> name: ', playerName, ' id: ', playerId );

		this.drawPlayerStatus( this.players );
	},

	onPlayerLeft : function( playerId, playerName )
	{
		console.log('onPlayerLeft> name: ', playerName, ' id: ', playerId );

		// todo: review players in the const copy and remove the one that doens't belong
		this.drawPlayerStatus( this.players );
	},

	onListPlayers : function( players )
	{
		console.log('onListPlayers> ', players);
	},

	erasePlayers : function()
	{
		// todo: remove a player from the list
	},

	drawPlayerStatus : function( players )
	{
		let x = 560;
		let y = 130;
		let rowHeight = 50;

		// todo: need to clear and redraw if someone has left or joined

		//console.log("drawing " + players.len() + " players...");

		// draw text
		let playerCount=0;
		players.forEach( player =>
		{
			console.log("drawing player(%o)> %o", (playerCount++), player);

			if ( player.text === undefined )
				player.text = this.add.text(x, y, player.name);

			// todo: update player color

			if ( player.image === undefined )
			{
				// copy texture from 'spyWhite' to a new one 'spyDynamic'
				player.texture = this.copyTextureFromImage( 'spyWhite', 'spy_' + player.id );

				player.image = this.add.image( x - 35, y, 'spy_' + player.id );
				player.image.setScale( 1.5 );
			}
			else
			{
				this.updateTextureColor( player.texture, 0xFFFFFF, player.color );
			}

			y += rowHeight;
		});
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