

var GameOptions = function( gameLogic, phaserGame )
{
	var optionwindow = {};
	
	var _gameLogic = gameLogic;
	var _phaser = phaserGame;
	
	var modal;
	
	var tween = null;
	var popup;
	
	// color picker
	var bmd;
	var colorWheel;
	var sprite;
		
	_initModal = function()
	{
		console.log('initting modal...');
		console.log(_phaser);
			
		var bg_width = 640;
		var bg_height = 400;
		
	    //  You can drag the pop-up window around
	    popup = _phaser.add.sprite(_phaser.world.centerX - (bg_width/2), _phaser.world.centerY - (bg_height/2), 'choosePlayerBG');
	    popup.alpha = 1;
//	    popup.anchor.set(0.5);
	    popup.inputEnabled = true;
//	    popup.input.enableDrag();

	    /*
	bmd = game.make.bitmapData(800, 600);
	bmd.draw('wheel', -200, -100);
	bmd.update();
	bmd.addToWorld();

	tooltip = game.make.bitmapData(64, 64);
	sprite = game.add.sprite(0, 0, tooltip);

	game.input.addMoveCallback(updateTooltip, this);	     
	     */
		tooltip = _phaser.make.bitmapData(64, 64);
		sprite = _phaser.add.sprite(0, 0, tooltip);

		//_phaser.input.addMoveCallback(_updateTooltip, this);	     
		
		var wheel_width = 150, wheel_height = 150;
	    //colorWheel = _phaser.add.sprite(490 - (wheel_width/2), 175 - (wheel_height/2), 'colorWheel');
	    colorWheel = _phaser.add.sprite(0, 0, 'colorWheel');
	    colorWheel.width = wheel_width;
	    colorWheel.height = wheel_height;
	    //colorWheel.scale.set(0.3);
	    	    
		bmd = _phaser.make.bitmapData(150, 150);
		bmd.draw( colorWheel );
		bmd.update();
		//bmd.addToWorld();

		colorWheel.x = 490 - (wheel_width/2);
		colorWheel.y = 175 - (wheel_height/2);
		
		//bmd.add( colorWheel );
		popup.addChild( colorWheel );
		//popup.addChild( bmd );
		
	    var spyModel = _phaser.make.sprite(190, 190, 'spyWhite');
	    //spyModel.scale.set(5);
	    popup.addChild( spyModel );

	    //  Position the close button to the top-right of the popup sprite (minus 8px for spacing)
	    var pw = (popup.width) - 46;
	    var ph = 10; //(popup.height) - 10;

	    //  And click the close button to close it down again
	    var closeButton = _phaser.make.sprite(pw, -ph, 'closeButton');
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
	
	var tooltip;
	var sprite;
	
	_updateTooltip = function(pointer, x, y) 
	{
		var px = x - popup.x - 490 + 75;
		var py = y - popup.y - 175 + 75;
		
		//console.log('pointer(', x, y, ') colorWheel(', colorWheel.x, ', ', colorWheel.y, ') popup(', popup.x, ', ', popup.y, ')' );
		//console.log('px/py(', px, py, ')');
		
		if (px >= 0 && px <= bmd.width && py >= 0 && py <= bmd.height)
		{
			var color = bmd.getPixelRGB(px, py);

			tooltip.fill(0, 0, 0);
			tooltip.rect(1, 1, 62, 62, color.rgba);
		
			sprite.x = x;
			sprite.y = y;
			sprite.visible = true;
		}
	};
	
	_playerChosen = function( playerIndex, modalPlayerConfig, success )
	{
		console.log('_playerChosen : success?> ' + success );
		console.log('_playerChosen : modalPlayerConfig?> ' + modalPlayerConfig );
		
		// TODO:  show visual about player X having reserved a player config
		if ( success == true )
		{
			console.log('doing modal thing');
			
			// access object via key and draw box around it
			// value, type, index, id
			var mItem = modal.getModalItem( "modalOptions", playerIndex );
			mItem.scale.setTo( 2.5 );
			/*
			mItem = modal.getModalItem( "modalOptions", 7 );
			//mItem.tint = 0x00ff00;
			mItem.scale.setTo(0.5,0.5);
			
			mItem = modal.getModalItem( "modalOptions", 8 );
			//mItem.tint = 0x0000ff;
			mItem.scale.setTo(0.5,0.5);
			
			mItem = modal.getModalItem( "modalOptions", 9 );
			//mItem.tint = 0x0000ff;
			mItem.scale.setTo(0.5,0.5);
			*/

			//mItem.graphicOpacity = 0.3;
			//mItem.contentScale = 1;
			
			//console.log('mItem> %o', mItem);
			//modal.updateModalValue( "spyWhite", "modalOptions", 3, null );
			//modal.updateModalValue( modalPlayerConfig, "modalOptions", 3, null );
		}
	};
	
	_clickStart = function()
	{
		_gameLogic.playerIsReady();
	};
	
	_startCountdown = function( startCount, x, y )
	{
	   //var item = modal.getModalItem("modalOptions", 5);
	    //item.x = x;
	    //item.y = y;
	    //var index = Number(item.text);

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

	    var _timer = _phaser.time.create(false);
	    _timer.start();
	    _timer.onComplete.add(endFn);
	    _timer.repeat(Phaser.Timer.SECOND, startCount, fn, this, startCount, x, y);
	    window.console.log("adding timer", _phaser);
	};

	_updateCountdown = function( startCount, x, y ) {
		/*
	    var item = modal.getModalItem("modalOptions", 5);
	    
	    if ( item.text == "Start" )
	    	item.text = startCount;
	    
	    var index = Number(item.text);

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
	    tween = _phaser.add.tween(popup.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
	    
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





