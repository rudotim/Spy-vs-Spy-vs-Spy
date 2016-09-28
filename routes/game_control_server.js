var express = require('express');
var router = express.Router();

var activeGameList = [];

/* GET users listing. */
router.get('/list_games', function(req, res, next) {
	res.json( getStubGameList() );
});

router.post('/room/create', function(req, res, next) 
{
	var gameData = req.body;
	
	if ( ! createRoom( gameData, req.app.get('io') ) )
	{
		// room is set up already, just join it
		console.log('room exists already, joining...');
		
		// something went wrong, return error
		//res.status(500).send( gameData.error );		
		//console.log('DID U SEE THIS?  BECASE YOU SHOULDNT HAVE!!!!!');
	}	
		
	// attach chat channel to client gameData object
	res.json( gameData );
});


router.post('/room/join', function(req, res, next) 
{
	var gameData = req.body;
			
	if ( ! createRoom( gameData, req.app.get('io') ) )
	{
		// room is set up already, just join it
		console.log('room exists already, joining...');
	}	

	// attach chat channel to client gameData object
	res.json( gameData );
});







function getStubGameList()
{
	var gameList = 
	
		[
		 {
			name : 'Tim\'s Game',
			max_players : 5,
			max_duration : 1,
			map : 'lobby'
		 },
		 {
				name : 'Satan\'s Broom Closet',
				max_players : 3,
				max_duration : 2,
				map : 'closet'
		 }
		]
	;
	
	return gameList;
}


function gameExists( name )
{
	for (var i=0; i<activeGameList.length; i++)
	{
		console.log('searching game entries [' + activeGameList[i].name + ']');
		if ( activeGameList[i].name == name )
		{
			console.log('--> found duplicate [' + name + ']');
			return true;
		}
	}
	
	console.log('game [' + name + '] does not exist');
	return false;
}

function createRoom( gameData, IO )
{
	// attach IO
	var chatChannel = gameData.name + 'chat';
	var dataChannel = gameData.name + 'data';

	gameData.chatchannel = chatChannel;
	gameData.datachannel = dataChannel;

	// check if it already exists
	if ( gameExists(gameData.name) )
	{
		//gameData.error = 'game [' + gameData.name + '] already exists, joining';
		//return false;
		return false;
	}
	
	attachIO( chatChannel, dataChannel, gameData, IO );
	
	// submit game in active game list
	activeGameList.push( gameData );
		
	return true;
}

function attachIO( chatChannel, dataChannel, gameData, IO )
{
	var urlid = '/' + gameData.name;

	console.log('attachingIO> joining ' + urlid + '/[' + chatChannel + ']');
	
	// create sockets, pass back chat names
	var chat = IO.of( urlid ).on('connection', function (socket) 
	{
	    console.log('server> CONNECTED TO SERVER');
	    
	    // join chat room
	    socket.join( gameData.name );
	    
	    // join data channel	    
		socket.on(dataChannel, function(data)
		{
			//console.log('server[' + dataChannel + ']> got data: ' + data);
			socket.broadcast.to( gameData.name ).emit( dataChannel, data );
		});

		socket.on(chatChannel, function(data)
		{
			console.log('server[' + chatChannel + ']> got data: ' + data);
			socket.broadcast.to( gameData.name ).emit( chatChannel, data );
		});
			
		socket.on('start_game', function(data)
		{
			console.log('server received request to start game');
			chat.emit('start_game', data);
		});
	});
}






module.exports = router;

