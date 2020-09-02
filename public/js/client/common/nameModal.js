
var playerName = undefined;

function getPlayer()
{
	return this.playerName;
}

function openModal( modal )
{
	let deferred = new $.Deferred();

	modal.style.display = "block";

	// bind a custom event to return the player's name when 'modalClosed' is triggered
	$( modal ).bind('modalClosed', function( event, cancelled )
	{
		if ( cancelled )
		{
			// don't affect the player name if the user hits cancel
			deferred.reject(undefined);
			modal.style.display = "none";
			return;
		}

		const newName = $('#playerName').val();

		// if name is present, send it to back end to be verified and created
		if ( newName !== undefined
			&& newName.trim() !== '' )
		{
			chatControl.createPlayer(newName).then( function(err)
			{
				modal.style.display = "none";

				deferred.resolve( $('#playerName').val() );
			}).catch(errorText =>
			{
				// something went wrong on backend during user creation.
				// most likely it's 'username already exists'.
				console.error(errorText);
			});
		}
	});

	// no matter what, unbind our custom event
	deferred.always(function()
	{
		$( modal ).unbind( 'modalClosed' );
	});

	return deferred;
}

function closeModal( modal, cancelled )
{
	$( modal ).trigger('modalClosed', [cancelled] );
}

function joinLobby()
{
	// if the user has no username, show the modal to request it
	if ( getPlayer() === undefined )
	{
		createPlayer().then( function(value)
		{
			console.log("done create player> " + value);
		});
	}
}


function createPlayer()
{
	let modal = document.getElementById('modalGetName');

	let deferred = openModal( modal );

	let promise = deferred.promise();

	const that = this;
	promise.done(function( newName )
	{
		// success!  set our local player name which is a result of the 'createPlayer' function
		that.playerName = newName;
	});

	// failure.  either username exists or user hit cancel
	promise.fail(function()
	{
		// user hit cancel
	});

	return promise;
}