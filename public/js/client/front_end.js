




const toFrontEnd = (function()
{
	const frontEnd = {};

	/**
	 * Initialization logic when the main HTML page loads
	 */
	frontEnd.loadThingsUp = function()
	{
		configureListeners();

		loadCachedUser();
	};

	/**
	 * Configure keyboard and other event listeners on HTML components
	 */
	function configureListeners()
	{
		$('#playerName').keypress(function(event)
		{
			let keycode = (event.keyCode ? event.keyCode : event.which);
			if ( keycode === 13 )
			{
				createPlayer();
			}
		});
	}

	function verifyName( newName )
	{
		return (newName !== undefined
			&& newName.trim() !== '');
	}

	/**
	 * See if there was already a username chosen and stored by this web browser.
	 * If there is, we'll attempt to use that to connect with the server.
	 */
	function loadCachedUser()
	{
		let cachedPlayerData = $.cookie("playerData");

		console.log("found cached player data> " + cachedPlayerData);
		if ( cachedPlayerData !== undefined )
		{
			// todo: pass player id to reconnect?
			if ( chatControl.verifyPlayerConnection( cachedPlayerData.id ) )
				proceedToLobby();
			else
			{
				console.log("You are not connected");
				showNameCollectionUI();
			}
		}
	}

	/**
	 * Cover the entire page and only show a UI designed to get the user to give us a username.
	 */
	function showNameCollectionUI()
	{
		$('#intro-div').show();
		$('#user-ui-div').hide();
	}

	/**
	 * Hide the name collection UI and show the chatroom UI.
	 */
	function proceedToLobby()
	{
		chatControl.listGames();

		$('#intro-div').hide();
		$('#user-ui-div').show();
	}

	/**
	 * Create a player on the server with the username provided by the user
	 */
	frontEnd.createPlayer = function()
	{
		createPlayerFromName( $('#playerName').val() );
	};

	function createPlayerFromName( newName )
	{
		// if name is present, send it to back end to be verified and created
		if ( verifyName( newName ) )
		{
			chatControl.createPlayer(newName).then( (data) =>
			{
				// save name in cookie
				$.cookie('playerData', data);

				// proceed to main game screen
				proceedToLobby();

			}).catch( errorText =>
			{
				showNameInputError( errorText );
			});
		}
		else
		{
			alert("Uhh yeah that name sucks");
		}
	}

	/**
	 * Show duh usah dat dey iz a dumdum
	 * @param errorText
	 */
	function showNameInputError( errorText )
	{
		$("#playerNameLabel").html( errorText ).show();
	}

	frontEnd.toggleSidenav = function()
	{
		document.body.classList.toggle('sidenav-active');
		document.body.classList.toggle('noscroll');
	};

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
})();
