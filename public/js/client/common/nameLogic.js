
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
	let cachedPlayerName = $.cookie("playerName");

	console.log("found cached playername> " + cachedPlayerName);
	if ( cachedPlayerName !== undefined )
	{
		// todo: pass player id to reconnect
		if ( chatControl.verifyPlayerConnection() )
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
		chatControl.createPlayer(newName).then( () =>
		{
			// save name in cookie
			$.cookie('playerName', newName);

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

// ==============
// Automated Demo

const checkbox = document.querySelector('input');
const interval = setInterval(toggleSidenav, 1500);

document.addEventListener('mousemove', removeInterval);
document.addEventListener('click', removeInterval);

function removeInterval() {
	clearInterval(interval);
	document.removeEventListener('mousemove', removeInterval);
	document.removeEventListener('click', removeInterval);
}

