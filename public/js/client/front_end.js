




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
		
		let p=serverPlayers.length;
		while( p-- )
		{
			console.log("setting player> ", serverPlayers[p].name );
			$('#player_list ul').append(
					$('<li>').append(
							$('<span>').attr('class', 'list-group-item player_list_entry').append( serverPlayers[p].name )
						));
		}
	};
	
	return frontEnd;
};

