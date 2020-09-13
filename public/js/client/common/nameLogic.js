
var playerName = undefined;

function getPlayer()
{
	return this.playerName;
}

function verifyName( newName )
{
	return (newName !== undefined
		&& newName.trim() !== '');
}

function loadCachedUser()
{
	let cachedPlayerData = $.cookie("playerData");

	console.log("found cached player data> " + cachedPlayerData);
	if ( cachedPlayerData !== undefined )
	{
		// todo: pass player id to reconnect
		if ( chatControl.verifyPlayerConnection( cachedPlayerData.id ) )
			proceedToLobby();
		else
		{
			console.log("You are not connected");
			showNameCollectionUI();
		}
	}
}

function showNameCollectionUI()
{
	$('#intro-div').show();
	$('#user-ui-div').hide();
}

function proceedToLobby()
{
	chatControl.listGames();

	$('#intro-div').hide();
	$('#user-ui-div').show();
}

function createPlayer()
{
	createPlayerFromName( $('#playerName').val() );
}

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
			console.error( errorText );
		});
	}
	else
	{
		console.error("Something wrong with name");

		// todo: show visual error on input text box
	}
}


function toggleSidenav() {
	document.body.classList.toggle('sidenav-active');
	document.body.classList.toggle('noscroll');
}


