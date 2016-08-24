/**
 * New node file
 */

var cvcServer =
{
	init : function(io)
	{
		console.log('socket init ready');
		
		io.on('connection', function(socket)
		{
			console.log('client socket connected');
						
			socket.on('game channel', function(data)
			{
				console.log('server[gamedata]> got data: ' + data);
				io.emit('game channel', data);
			});
			
			socket.on('position channel', function(data)
			{
				console.log('server[posdata]> got data: ' + data);
				io.emit('position channel', data);
			});
			
			socket.on('chat channel', function(data)
			{
				console.log('server[chat]> got data: ' + data);
				io.emit('chat channel', data);
			});
			
		});
	}
};

//module.exports = cvcServer;
