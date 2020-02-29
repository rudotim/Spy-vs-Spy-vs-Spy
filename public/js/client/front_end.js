




const toFrontEnd = function()
{
	const frontEnd = {};

	/**
	 * Update UI list of room members
	 */
	frontEnd.updateRoomListUI = function( serverPlayers )
	{
		$("#player_list ul").empty();
		
		console.log( serverPlayers );
		
		var p=serverPlayers.length;
		while( p-- )
		{
			$('#player_list ul').append(
					$('<li>').append(
							$('<span>').attr('class', 'list-group-item player_list_entry').append( serverPlayers[p].name )
						));
		}
	};
	
	const updatePlayerOnServerAttr = function( serverPlayers )
	{
		// TODO: Implement this?  Really it's just for name changes...
	};

	return frontEnd;
};

