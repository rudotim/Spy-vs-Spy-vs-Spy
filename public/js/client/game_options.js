

var GameOptions = function( gameLogic, phaserGame )
{
	var optionwindow = {};
	
	var _gameLogic = gameLogic;
	var _phaser = phaserGame;
	
	var modal;
	
	var tween = null;
	var popup;
		
	_initModal = function()
	{
		console.log('initting modal...');
		console.log(_phaser);
				
	    //  You can drag the pop-up window around
	    popup = _phaser.add.sprite(_phaser.world.centerX, _phaser.world.centerY, 'choosePlayerBG');
	    popup.alpha = 1;
	    popup.anchor.set(0.5);
	    popup.inputEnabled = true;
	    popup.input.enableDrag();

	    //  Position the close button to the top-right of the popup sprite (minus 8px for spacing)
	    var pw = (popup.width / 2) - 45;
	    var ph = (popup.height / 2) - 8;

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





