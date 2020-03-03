



let GameOptions = function( gameLogic, phaserGame )
{
	let optionwindow = {};
	
	let _gameLogic = gameLogic;
	let _phaser = phaserGame;
	
	let modal;
	
	let tween = null;
	let popup;
	
	let startButton;
	
	// color picker
	let bmd;
	let colorWheel;
	let sprite;
	let spyColor;
	
	let spyModel;
	let spyBitmap;
		
	_initModal = function()
	{
		console.log('initting modal...');
		console.log(_phaser);
			
		let bg_width = 640;
		let bg_height = 400;
		
	    //  You can drag the pop-up window around
	    popup = _phaser.add.sprite(_phaser.world.centerX - (bg_width/2), _phaser.world.centerY - (bg_height/2), 'choosePlayerBG');
	    popup.alpha = 1;
	    popup.inputEnabled = true;

		tooltip = _phaser.make.bitmapData(64, 64);
		sprite = _phaser.add.sprite(0, 0, tooltip);

		let wheel_width = 150, wheel_height = 150;
	    colorWheel = _phaser.add.sprite(0, 0, 'colorWheel');
	    colorWheel.width = wheel_width;
	    colorWheel.height = wheel_height;
	    colorWheel.inputEnabled = true;
	    colorWheel.events.onInputDown.add(_choosePlayer, this);
	    	    
		bmd = _phaser.make.bitmapData(wheel_width, wheel_height);
		bmd.draw( colorWheel );
		bmd.update();

		colorWheel.x = 490 - (wheel_width/2);
		colorWheel.y = 175 - (wheel_height/2);
		
		popup.addChild( colorWheel );
		
		
		
		
	    startButton = _phaser.add.sprite(colorWheel.x, colorWheel.y+200, 'startButton');
	    startButton.width = 190;
	    startButton.height = 74;
	    startButton.inputEnabled = true;
	    startButton.events.onInputDown.add(_clickStart, this);
		popup.addChild( startButton );
				
		let spyPosX = 210 - (150/2);
		//let spyPosX = 100;
	    spyModel = _phaser.make.sprite(spyPosX, 100, 'spyWhite');
	    spyModel.scale.set(5);
	    popup.addChild( spyModel );
	    
		// spy bitmap
		spyBitmap = _phaser.make.bitmapData(); // bitmapData( 24, 37 );
		spyBitmap.load( 'spyWhite' );
		spyBitmap.add( spyModel );		
		
	    //  Position the close button to the top-right of the popup sprite (minus 8px for spacing)
	    let pw = (popup.width) - 46;
	    let ph = 10; //(popup.height) - 10;

	    //  And click the close button to close it down again
	    let closeButton = _phaser.make.sprite(pw, -ph, 'closeButton');
	    closeButton.inputEnabled = true;
	    closeButton.input.priorityID = 1;
	    closeButton.input.useHandCursor = true;
	    closeButton.events.onInputDown.add(_hideWindow, this);

	    //  Add the "close button" to the popup window image
	    popup.addChild(closeButton);

	    //  Hide it awaiting a click
	    popup.scale.set(0.1);
	    popup.visible = false;
	};
	
	let tooltip;

	_updateTooltip = function(pointer, x, y) 
	{
		let px = parseInt(x - popup.x - 490 + 75, 10);
		let py = parseInt(y - popup.y - 175 + 75, 10);
		//let py = y - popup.y - 175 + 75;
		
		//console.log('pointer(', x, y, ') colorWheel(', colorWheel.x, ', ', colorWheel.y, ') popup(', popup.x, ', ', popup.y, ')' );
		//console.log('px/py(', px, py, ')');
		
		if (px >= 0 && px <= bmd.width && py >= 0 && py <= bmd.height)
		{
			spyColor = bmd.getPixelRGB(px, py);

			tooltip.fill(0, 0, 0);
			tooltip.rect(1, 1, 62, 62, spyColor.rgba);
		
			sprite.x = x;
			sprite.y = y;
			sprite.visible = true;
		}
	};
	
	_choosePlayer = function()
	{		
		console.log('color chosen> %o', spyColor);
		
		let playerConfig = {
				'color' : spyColor
		};
		
		_gameLogic.invokeChoosePlayer( 0, playerConfig, _playerChosen );
	}
	
	_playerChosen = function( playerIndex, modalPlayerConfig, success )
	{
		console.log('_playerChosen : success?> ' + success );
		console.log('_playerChosen : modalPlayerConfig?> ' + modalPlayerConfig );
		
		if ( success == true )
		{
			// show successfully reserved player
		    // replaceRGB: function (sourceR, sourceG, sourceB, sourceA, destR, destG, destB, destA, region) {

			spyBitmap.load( 'spyWhite' );
			spyBitmap.add( spyModel );

			spyBitmap.replaceRGB(255, 255, 255, 255, spyColor.r, spyColor.g, spyColor.b, 255);
			spyBitmap.update();
			
			// enable 'Im ready' button
			
		}
	};
	
	_clickStart = function()
	{
		_gameLogic.playerIsReady();
	};
	
	_startCountdown = function( startCount, x, y )
	{
	   //let item = modal.getModalItem("modalOptions", 5);
	    //item.x = x;
	    //item.y = y;
	    //let index = Number(item.text);

	    _clickStart();
		//gameControl.triggerStartGame();
	    //modal.hideModal("modalOptions");
	    
	    /*
	    _countDown(_updateCountdown, startCount, x, y, function () {
		       modal.hideModal("modalOptions");
		       _gameLogic.startIt();
		  });
		  */		
	};
	
	_countDown = function(fn, startCount, x, y, endFn) {
	    var endFn = endFn || function(){};

	    let _timer = _phaser.time.create(false);
	    _timer.start();
	    _timer.onComplete.add(endFn);
	    _timer.repeat(Phaser.Timer.SECOND, startCount, fn, this, startCount, x, y);
	    window.console.log("adding timer", _phaser);
	};

	_updateCountdown = function( startCount, x, y ) {
		/*
	    let item = modal.getModalItem("modalOptions", 5);
	    
	    if ( item.text == "Start" )
	    	item.text = startCount;
	    
	    let index = Number(item.text);

	    window.console.log("index: ", index, item);

	    item.setText(String(index - 1));
	    item.update();
	    item.x = x;
	    item.y = y;
	    */
	};
	
	_drawWindow = function()
	{	
	    popup.visible = true;

	    //modal.showModal("modalOptions");
	    if ((tween !== null && tween.isRunning) || popup.scale.x === 1)
	    {
	        return;
	    }
	    
	    //  Create a tween that will pop-open the window, but only if it's not already tweening or open
	    tween = _phaser.add.tween(popup.scale).to( { x: 1.0, y: 1.0 }, 1000, Phaser.Easing.Elastic.Out, true);
	    
		_phaser.input.addMoveCallback(_updateTooltip, this);	     
	};
	
	_hideWindow = function()
	{
	    if (tween && tween.isRunning || popup.scale.x === 0.1)
	    {
	        return;
	    }

	    //  Create a tween that will close the window, but only if it's not already tweening or closed
	    tween = _phaser.add.tween(popup.scale).to( { x: 0.1, y: 0.1 }, 500, Phaser.Easing.Elastic.In, true);
	    
	    popup.visible = false;
		sprite.visible = false;


		_phaser.input.deleteMoveCallback(_updateTooltip, this);	     
	}
	
	optionwindow.show = function()
	{
		console.log( 'showing' );
				
		_drawWindow(); 
	};
	
	optionwindow.hide = function()
	{
		console.log('hiding modal');
		
		_hideWindow();
		
		//modal.hideModal("modalOptions");
	};
	
	_initModal();
		
	return optionwindow;
};





