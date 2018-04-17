var game = new Phaser.Game(832, 624, Phaser.AUTO, 'gameWrapper', { preload: preload, create: create, update: update });

var bodyPieceWidth,
	leftKey,
	rightKey,
	upKey,
	downKey,
	direction = "",
	apple,
	directionTaken = false,
	score = -1,
	body = new Array(),
	timeStep = 50,			// timeStep is milliseconds. change timeStep to scale difficulty
	lastStep = 0,
	scoreText;

//TODO::Timer
//TODO::Add time block
//TODO::snake faster over time
//TODO::slow down snake block
//TODO::cut tail block (points per block cut)
//TODO::Score multiplier from the time survived.
//TODO::Turn input buffer size of 2 (sometimes when moving fast the second input doesn't take because step has already been taken)
/*TODO::Make a number matrix of the possible positions the body parts can have and maintain a list of occupied slots
and use the unoccupied slots as range for randoms.
*/

//TODO::Ajax functions to feed the score to database

function preload() {

    // set background color to blue
	game.stage.backgroundColor = "#31a2f2";

	// load in sprites
	game.load.crossOrigin = 'anonymous';
    game.load.image('body', 'matopala.png');
    game.load.image('apple', 'omena.png');
}

function create()
{
	// store the body sprite width for later calculations
	bodyPieceWidth = game.cache.getImage('body').width;

    //  Set-up the physics bodies
    game.physics.startSystem(Phaser.Physics.ARCADE);

	// write score text
	scoreText = game.add.text(5, 5, score);

	// create the apple and enable physics for collisions
    apple = game.add.sprite(-50, -50, 'apple');
	game.physics.enable(apple, Phaser.Physics.ARCADE);

	// randomize apple position and create the first body part
	appleHit();

	// place the head in center of the game canvas
	body[0].x = game.width / 2 - bodyPieceWidth/2;
	body[0].y = game.height / 2;

    setInput();
}

function update() {

	collisionsCollection();

	// check the body length so game over doesn't crash the game.
	if (body.length > 0)
    	checkBoundaries();

    takeTimeStep();
}

function setInput()
{
	// Register the keys.
	leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
	rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
	upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
	downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);

    // Stop the following keys from propagating up to the browser
    game.input.keyboard.addKeyCapture([
        Phaser.Keyboard.LEFT,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.UP,
        Phaser.Keyboard.DOWN,
    ]);

	// add event listeners to keys to call the functions when they're pressed
	leftKey.onDown.add(input, this);
	rightKey.onDown.add(input, this);
	upKey.onDown.add(input, this);
	downKey.onDown.add(input, this);
}

function input()
{
	// check if direction has already been taken in this timestep.
	if (directionTaken === false)
	{
		// event gets passed to input function from the event listener assigns
		// in setInput function. Event is a key event and has a .code inside it.
		// using event.code we can get switch case the input.
		switch (event.code) {
			case "ArrowUp":
			// check that we arent trying to make 180 in one move
			// also check that the key pressed isn't the same as the way
			// we're going, so we don't waste a move on a non-move.
			if (direction != "down" && direction != "up")
		    {
		        direction = "up";
		        directionTaken = true;
		    }
				break;
			case "ArrowDown":
			if (direction != "up" && direction != "down")
			{
				direction = "down";
				directionTaken = true;
			}
				break;
			case "ArrowLeft":
			if (direction != "right" && direction != "left")
			{
				direction = "left";
				directionTaken = true;
			}
				break;
			case "ArrowRight":
			if (direction != "left" && direction != "right")
			{
				direction = "right";
				directionTaken = true;
			}
				break;
		}
	}
}

function move()
{
	// store the position of the first body element BECAUSE: if there is only
	// one body part, we can't first splice the array, and then tell the program
	// to move to this spot plus the bodyPieceWidth towards that direction, it would
	// cause a call on a element in array that does not exists.

	// take the last element in body array and place it to an variable.
	// remove the last part from the array and then splice it to first.

	// only move if direction is set.
	if (direction.length > 0)
	{
		var headX = body[0].x, headY = body[0].y; // save position of the old head before the splice

		var liikkuvaOsa = body[body.length-1]; // save the tail
		body.splice(body.length-1,1); // remove the tail from array
		body.splice(0,0, liikkuvaOsa); // place the tail as 0th elemnent in the array
	}

	// move the old tail piece (currently body[0] after the splicing)
	// towards the currently selected position
	switch (direction)
	{
		case 'left':
			body[0].x = headX - bodyPieceWidth;
			body[0].y = headY;
			break;
		case 'right':
			body[0].x = headX + bodyPieceWidth;
			body[0].y = headY;
			break;
		case 'up':
			body[0].x = headX;
			body[0].y = headY - bodyPieceWidth;
			break;
		case 'down':
			body[0].x = headX;
			body[0].y = headY + bodyPieceWidth;
			break;
	}
}

// this is a Timestep.
// Inside the time step the snake moves 1 width of it's part.
// you can only change the heading of the snake once per timestep.
function takeTimeStep()
{
    if (game.time.now > lastStep+timeStep)
    {
        lastStep = game.time.now;
		move();
        directionTaken = false;
    }
}

function addBodyPiece()
{
	// make a new body part
    var bodyPart = game.add.sprite(-10,-10, 'body');

	// move the image origin to its center
    bodyPart.anchor.setTo(0.5);

	// add the physics for collisions
	game.physics.enable(bodyPart, Phaser.Physics.ARCADE);

	body.push(bodyPart);
}

// possible game collisions
function collisionsCollection()
{
	// enable game physics
    game.physics.arcade.collide(apple, body[0], appleHit);
    game.physics.arcade.collide(body[0], body, bodyHit);
}

// Game boundaries, move snake to the opposite end of the map if boundary is exceeded.
function checkBoundaries()
{
    if (body[0].y < 0)
        body[0].y = game.height - bodyPieceWidth /2;
    if (body[0].y > game.height)
        body[0].y = 0 + bodyPieceWidth /2;
    if (body[0].x < 0)
        body[0].x = game.width - bodyPieceWidth /2;
    if (body[0].x > game.width)
        body[0].x = 0 + bodyPieceWidth /2;
}

function appleHit()
{
    // add score and update text
    score += 1;
	scoreText.setText(score);

	// generate new position for the apple. Maximum random value is games width (or height) divided by the bodyPieceWidth
	// this way we create an imaginary grid on canvas that matches the possible positions of the snake body parts.
	// these positions are then multiplied by the bodyPieceWidth after which we remove a bodyPieceWidth once to make
	// the positions match properly.
	var applePosX = game.rnd.integerInRange(1, game.width/bodyPieceWidth);
	var applePosY = game.rnd.integerInRange(1, game.height/bodyPieceWidth);

    // reposition apple
    apple.x = (applePosX*bodyPieceWidth-bodyPieceWidth);
    apple.y = (applePosY*bodyPieceWidth-bodyPieceWidth);

	// add bodypiece
    addBodyPiece();

}

function bodyHit()
{
	gameOver();
}

function gameOver()
{
	// set highscore
	// setHighscore(); Removed 17.4 as of no database connection excists

	// reset our variables
	direction = "";
	directionTaken = false;
	score = -1;
	body.splice(0, body.length);
	lastStep = 0;

	// restart the game
	this.game.state.restart();
}

function setHighscore()
{
	// ajaxi kutsuu php tiedostoa

    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    }

    xmlhttp.open("GET", "setHighscore.php?score=" + score);
    xmlhttp.send();

    return false;


}
