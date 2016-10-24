/* Breakout game.
   Jack Lawrence-Jones, October 2016
   Based on https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript
*/

// Get DOM elements
var canvas = document.getElementById("game_canvas");
var leftButton = document.getElementById("left");
var rightButton = document.getElementById("right");

// Canvas context
var ctx = canvas.getContext("2d");

// Game settings
var settings = {
	ball: {
		start_x: canvas.width/2,
		start_y: canvas.height/2,
		radius: 10,
		speed: 2,
		vary_speed: true,
		vary_direction:true
	},
	bat: {
		height: 10,
		width:75,
		start_x: (canvas.width-75)/2,
		start_y: canvas.height - 30,
		speed: 7
	},
	bricks: {
		rows: 3,
		columns: 5,
		width: 75, 
		height: 20,
		padding: 10,
		field_offset_top: 30,
		field_offset_left: 30
	},
	lives: 3
}


// Game state /////////////////////////////////////////////////////
var score = 0;
var lives = settings.lives;

var rightPressed = false;
var leftPressed = false;

var ball = {
	x: settings.ball.start_x,
	y: settings.ball.start_y,
	radius: settings.ball.radius,
	dx: settings.ball.speed,
	dy: settings.ball.speed
};

ball.accelerate = function(d) {
	if (ball.dy < 0) { // travelling up
		ball.dy -= d;
	} else if (ball.dy > 0) { // travelling down
		ball.dy += d;
	}

	if (ball.dx < 0) { // travelling left
		ball.dx -= d;
	} else if (ball.dx > 0) { // travelling right
		ball.dx += d;
	}

}

var bat = {
	height: settings.bat.height,
	width: settings.bat.width,
	x: settings.bat.start_x,
	y: settings.bat.start_y,
	dx: settings.bat.speed
};

var bricks = [];

// Initialise game //////////////////////////////////////////////////
// 1. Add event listeners
//    i. left/right keys
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

//    ii. left/right buttons
leftButton.addEventListener("mousedown", buttonDownHandler);
leftButton.addEventListener("mouseup", buttonUpHandler);
rightButton.addEventListener("mousedown", buttonDownHandler);
rightButton.addEventListener("mouseup", buttonUpHandler);

// 2. Initialise bricks 
for (let col = 0; col < settings.bricks.columns; col++) {
	bricks[col] = [];
	
	for (let row = 0; row < settings.bricks.rows; row++) {
		let brickX = settings.bricks.field_offset_left + col*(settings.bricks.width + settings.bricks.padding);
		let brickY = settings.bricks.field_offset_top + row*(settings.bricks.height + settings.bricks.padding);
		bricks[col][row] = {
			x: brickX, 
			y: brickY,
			health:1
		};
	}
}

// Game loop /////////////////////////////////////////////////////////
draw();


// Functions ///////////////////////////////////////////////////////

// Main game loop function
function draw() {
	// Clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw everything
	drawBricks();
	drawBall();
	drawBat();
	drawScore();
	drawLives();


	// Collision detection
	// 1. left/right canvas edge ball collision detection
	if(ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
		ball.dx = -ball.dx;
	}


	if (ball.y < ball.radius) {
		// 2. ball is touching top edge of canvas
		ball.dy = -ball.dy;
	} else if (ball.y + ball.radius > bat.y 
		&& ball.x + ball.radius > bat.x 
		&& ball.x - ball.radius < bat.x + bat.width) {
		// 3. ball is touching the bat

		// increase speed
		if(settings.ball.vary_speed) {
			ball.accelerate(0.25);
		} 

		// reverse direction
		ball.dy = -ball.dy;

		// change direction/speed based on zones
		if (ball.x < bat.x + bat.width/3) {
			// left third
			ball.dx -= 1;

		} else if (ball.x < bat.x + 2 * (bat.width/3)) {
			// middle third

		} else {
			// right third
			ball.dx += 1;
		}


	} else if (ball.y > canvas.height - ball.radius) {
		// 4. ball is touching bottom edge of canvas
		if (lives <= 0) {
			alert("GAME OVER");
			window.location.reload();
		} else {
			lives -= 1;
			// reset game
			ball.x = canvas.width/2

		}
	}

	// 5. Ball touching a brick
	brick_collision_detection();


	// Movement
	// 1. Move the ball
	ball.x += ball.dx;
	ball.y += ball.dy;

	// 2. Move the bat
	if(rightPressed && bat.x < canvas.width - bat.width) {
		bat.x += bat.dx;
	} else if (leftPressed && bat.x > 0) {
		bat.x -= bat.dx;
	}

	// Next frame
	requestAnimationFrame(draw);
}



 // Drawing functions ///////////////////////////////////////////////
function drawBricks() {
	for (let col = 0; col < settings.bricks.columns; col++) {
		for (let row = 0; row < settings.bricks.rows; row++) {
			let b = bricks[col][row];

			if (b.health > 0) {
				// otherwise brick has already been destroyed
				ctx.beginPath();
				ctx.rect(b.x,b.y,settings.bricks.width,settings.bricks.height);
				ctx.fillStyle = "#0095DD";
				ctx.fill();
				ctx.closePath();
			}
		}
	}
}


function drawBall() {
	ctx.beginPath();
	ctx.arc(ball.x,ball.y,ball.radius, 0, Math.PI*2,false);
	ctx.fillStyle = "blue";
	ctx.fill();
	ctx.closePath();

}


function drawBat() {
	ctx.beginPath();
	ctx.rect(bat.x,bat.y,bat.width,bat.height);
	ctx.fillStyle = "black";
	ctx.fill();
	ctx.closePath();
}


function drawScore() {
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}


// Brick collision detection ///////////////////////////////////////
function brick_collision_detection() {
	for (let col = 0; col < settings.bricks.columns; col++) {
		for (let row = 0; row < settings.bricks.rows; row++) {
			let b = bricks[col][row];

			if(b.health > 0) {
				if (ball.x > b.x 
					&& ball.x < b.x + settings.bricks.width 
					&& ball.y < b.y + settings.bricks.height 
					&& ball.y > b.y) {
					ball.dy = -ball.dy;
					b.health -= 1;
					score += 1;

					if (score >= settings.bricks.rows * settings.bricks.columns) {
						alert("You win!");
						window.location.reload();
					}
				}
			}
		}
	}
}

// Event Handlers
function keyDownHandler(e) {
	if (e.keyCode == 39) {
		rightPressed = true;
	} else if(e.keyCode == 37) {
		leftPressed = true;
	}
}

function keyUpHandler(e) {
	if (e.keyCode == 39) {
		rightPressed = false;
	} else if(e.keyCode == 37) {
		leftPressed = false;
	}
}

function buttonDownHandler(e) {
	if (e.target == rightButton) {
		rightPressed = true;
	} else if(e.target == leftButton) {
		leftPressed = true;
	}
}

function buttonUpHandler(e) {
	if (e.target == rightButton) {
		rightPressed = false;
	} else if(e.target == leftButton) {
		leftPressed = false;
	}
}
