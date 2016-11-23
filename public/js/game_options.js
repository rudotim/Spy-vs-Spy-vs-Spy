/**
 * New node file
 */


var GameOptions = function( gameLogic, phaserGame )
{
	var ctrl = {};
	
	var _gameLogic = gameLogic;
	var _phaser = phaserGame;
	
	var modal;
		
	_initModal = function()
	{
		console.log('initting modal...');
		console.log(_phaser);
		
		modal = new gameModal( _phaser );
		
	    modal.createModal({
	        type: "modalOptions",
	        includeBackground: true,
	        modalCloseOnInput: false,
	        itemsArr: [
			{
			    type: "image",
			    content: "modalBG",
			    offsetY: -20,
			    contentScale: 1
			},
			{
	            type: "text",
	            content: "Pick Yo Damn Options!",
	            fontFamily: "Luckiest Guy",
	            fontSize: 22,
	            color: "0x1e1e1e",
	            offsetY: -50
	        }, 	        
            {
                type: "image",
                content: "startButton",
                offsetX: -80,
                offsetY: 100,
                contentScale: 0.6,
                callback: function () 
                {
                	// start countdown
                	_startCountdown(5, -82, 102);
                }
            },
			{
	            type: "text",
	            content: "Start",
	            fontFamily: "Luckiest Guy",
	            fontSize: 22,
	            color: "0x1e1e1e",
	            offsetX: -80,
	            offsetY: 102
	        }, 
        	{
                type : "text",
                content: "X",
                fontSize: 52,
                color: "0x000000",
                offsetY: -130,
                offsetX: 240,
                callback: function(){
                	modal.hideModal("modalOptions");
                }
            }	        
	        ]
	    });	
	};
	
	
	_startCountdown = function( startCount, x, y )
	{
	    var item = modal.getModalItem("modalOptions", 5);
	    item.x = x;
	    item.y = y;
	    var index = Number(item.text);

	    _gameLogic.startIt();
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
	    var item = modal.getModalItem("modalOptions", 5);
	    
	    if ( item.text == "Start" )
	    	item.text = startCount;
	    
	    var index = Number(item.text);

	    window.console.log("index: ", index, item);

	    item.setText(String(index - 1));
	    item.update();
	    item.x = x;
	    item.y = y;
	    //item.x = _phaser.width / 2 - (item.width / 2);
	    //item.y = _phaser.height / 2 - (item.height / 2);
	};
	
	_drawWindow = function()
	{	
	    modal.showModal("modalOptions");
	};
	
	ctrl.show = function()
	{
		console.log( 'showing' );
		
		// pause game
		
		
		_drawWindow(); 
	};
	
	_initModal();
		
	return ctrl;
};





