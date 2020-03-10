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

		//this.load.image('mech', 'assets/pics/titan-mech.png');
	},

	create: function ()
	{
		this.add.sprite(0, 0, "room");

		this.input.once('pointerdown', function (event)
		{
			console.log('From PlayerSelection to GameLoop');

			this.scene.start('player_selection');

		}, this);
	}

});