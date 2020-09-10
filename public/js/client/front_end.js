




const toFrontEnd = function()
{
	const frontEnd = {};

	/**
	 * Update UI list of room members
	 */
	frontEnd.updatePlayerListUI = function( serverPlayers )
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


	frontEnd.updateRoomListUI = function( roomList )
	{
		console.log("got room list: %o", roomList);
	};

	frontEnd.loadUser = function()
	{
		let cachedPlayerName = $.cookie("playerName");

		console.log("found cached playername> " + cachedPlayerName);
		if ( cachedPlayerName !== undefined )
		{
			// success

			// show lobby user list
			// show 'list games' button?
			// show chat box
			console.log("success - show chat UI and stuff");
		}
		else
		{
			console.error("Error loading cached user - return user to index.html");
		}
	};

	return frontEnd;
};
