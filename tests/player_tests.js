

// create player


describe('JavaScript addition operator', function () {
    it('adds two numbers together', function () {
        expect(1 + 2).toEqual(3);
    });
});



describe('Player Tests', function() {
	it('create player', function() {
		
		var ps = new Players();
		
		var player = ps.createPlayer( "bob", 101 );
		
		expect( player.name ).toEqual("bob");
		expect ( player.player_id ).toEqual( 101 );		
		expect ( player.pos.x ).toEqual( 0 );		
		expect ( player.pos.y ).toEqual( 0 );		
		expect ( player.room ).toEqual( 0 );				
	});
	
	
	it('retrieve player', function() {
		
		var ps = new Players();
		
		var player1 = ps.createPlayer( "bob1", 101 );
		
		var player2 = ps.createPlayer( "bob2", 102 );
		
		var getPlayer2 = ps.getPlayerById( 102 );
		
		expect( getPlayer2.name ).toEqual("bob2");
		expect ( getPlayer2.player_id ).toEqual( 102 );		
		expect ( getPlayer2.pos.x ).toEqual( 0 );		
		expect ( getPlayer2.pos.y ).toEqual( 0 );		
		expect ( getPlayer2.room ).toEqual( 0 );				
	});
	
	it('retrieve player names', function() {
		
		var ps = new Players();
		
		var player1 = ps.createPlayer( "bob1", 101 );		
		var player2 = ps.createPlayer( "bob2", 102 );
		
		var playerNames = ps.getAllPlayerNames();
		
		expect( playerNames[0] ).toEqual("bob1");
		expect( playerNames[1] ).toEqual("bob2");
	});
	
	it('remove player', function() {
		
		var ps = new Players();
		
		var player = ps.createPlayer( "bob", 101 );		
		
		var getPlayer = ps.getPlayerById( 101 );
		
		expect( getPlayer.name ).toEqual("bob");
		
		ps.removePlayerById( 101 );
		
		getPlayer = ps.getPlayerById( 101 );
		expect( getPlayer ).toEqual( null );		
	});	
	
	
	
});