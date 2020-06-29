

# Spy vs Spy vs Spy

This is a web port of the classic Nintendo game Spy vs Spy with additional multiplayer support.
This port uses Socket.io for communication, PhaserJS for the game library and NodeJS for back-end logic.

My brother and I used to love playing this game growing up.  Now my nephew loves it.  Since it's only two player,
this project was born.

## Usage

To start the server, make sure you have NodeJS installed and it's in your path:

`node bin/startServer`

Open web browser to:

`http://localhost:3000`


## Game Play Procedures

### Chat/Game Rooms

In order to manage players and ensure they get into the right room/game, I created a
chat room system.  A new player initially viewing the web UI can enter a name for themselves
and get put into the 'general chat' room.  From there, players can use it as a springboard
to create and form their own private rooms where they can play with each other.

To do this with the current software, open the web UI, type your name in the input box and
hit either 'Create Server Room' or 'Join'.
At the moment, all players joining or creating will ultimately be in the same room.  Once
your players have all joined the room, someone clicks 'Trigger Start' and the game starts.

### Choosing Characters

The character selection screen is the first UI users will encounter.  Choose your preferred color by clicking
on any area of the color wheel.  If other players choose colors, their character's player icon will be updated
to reflect their choice.

Once all characters have been chosen and the players have hit the "Ready" button, play begins!

### Game Play

The game doesn't do much at the moment.  I gutted a lot of working logic because I decided to redesign the
core structure.  The original version was cowboy coded in the heat of passion and had no thoughts of
reusability or testing.

### Winning

Can't win right now.  But if you've downloaded this and tried it to any degree, you're a winner in my book :)


## Things to do:

- completely define game object structures and interactions
- re-add player movement
- re-add map loading
- re-add movement animation
- re-add movement room transitions
- add much better movement boundaries and collisions
- add object interaction logic

## Nice to have:

- make the lobby UI a LOT nicer
- force landscape mode on mobile
- scrolling support on player selection when num players overflows the viewable area

## Tools

TexturePacker?

