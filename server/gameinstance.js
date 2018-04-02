/**
 * New node file
 */


	function GameInstance()
	{
		this.game_id = -1;
		this.players = [];
		
		this.name = '';
		this.map = '';
		
		this.options = {};
	}
	
	function setGameId( game_id )
	{
		this.game_id = game_id;
	}

	function setPlayers( players )
	{
		this.players = players;
	}
	
	function setName( name )
	{
		this.name = name;
	}
	
	function setMap( map )
	{
		this.map = map;
	}
	
	function setOptions( newOptions )
	{
		this.options = newOptions;
	}

