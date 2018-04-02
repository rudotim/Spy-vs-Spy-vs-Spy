/**
 * New node file
 */

	var GameInstance = function()
	{
		this.game_id = guid();
		this.players = [];
		
		this.name = '';
		this.jsonMapData;
		
		this.chatchannel = '';
		this.datachannel = '';
		
		this.options = {};
	}

	GameInstance.prototype.constructor = GameInstance;

	GameInstance.prototype.setGameId = function( game_id )
	{
		this.game_id = game_id;
	}

	GameInstance.prototype.setPlayers = function( players )
	{
		this.players = players;
	}

	GameInstance.prototype.setName = function( name )
	{
		this.name = name;
	}

	GameInstance.prototype.getStartingLocation = function( player_id )
	{
		return null;
	}

	GameInstance.prototype.setMapData = function( jsonMapData )
	{
		this.jsonMapData = jsonMapData;
	}
	
	GameInstance.prototype.setOptions = function( newOptions )
	{
		this.options = newOptions;
	}
	
	GameInstance.prototype.setChatChannel = function( channel )
	{
		this.chatchannel = channel;
	}
	
	GameInstance.prototype.setDataChannel = function( channel )
	{
		this.datachannel = channel;
	}

	function guid() {
		  function s4() {
		    return Math.floor((1 + Math.random()) * 0x10000)
		      .toString(16)
		      .substring(1);
		  }
		  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		}
	
	if ( ! (typeof module === 'undefined') )
	{
		console.log('GameInstance exported');
		module.exports = GameInstance;
	}
	else
		console.log('Not Exported');
