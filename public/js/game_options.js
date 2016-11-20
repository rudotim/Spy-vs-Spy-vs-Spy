/**
 * New node file
 */


var GameOptions = function( gameLogic, phaserGame )
{
	var ctrl = {};
	
	var _gameLogic = gameLogic;
	var _phaser = phaserGame;
	
	console.log( _phaser );
	var modal;
		
	_initModal = function()
	{
		console.log('initting modal...');
		
		modal = new gameModal( _phaser );
		
	    modal.createModal({
	        type: "modal1",
	        includeBackground: true,
	        modalCloseOnInput: true,
	        itemsArr: [{
	            type: "graphics",
	            graphicColor: "0xffffff",
	            graphicWidth: 300,
	            graphicHeight: 300,
	            graphicRadius: 40
	        }, {
	            type: "text",
	            content: "The white behind me\nis a [Phaser.Graphic]",
	            fontFamily: "Luckiest Guy",
	            fontSize: 22,
	            color: "0x1e1e1e",
	            offsetY: -50
	        }, ]
	    });	
	};
	
	_drawWindow = function()
	{
	
	    //modal = new gameModal(game);
	    modal.showModal("modal1");
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





