/*
    A Snake game in JavaScript
    Author: Alex Orlenko (@aqrln)
*/

(function () {

    // Some constants that configure the game
    var FPS = 30;
    var W = 600;
    var H = 600;

    var SNAKE_CHUNK_RADIUS = 3;
    var COLLISION_SENSIBILITY_RADIUS = 3;
    var UNCOLLIDABLE_SNAKE_HEAD_LENGTH = 3;
    var FOOD_RADIUS = 5;
    var INITIAL_SNAKE_LENGTH = 30;
    var SNAKE_CHUNK_GAP = 3;
    var INITIAL_VELOCITY = 2;
    var ANGULAR_SPEED = Math.PI * 1.5;
    var NEW_CHUNKS_PER_DINNER = 3;
    var FOOD_INCREASE_STEP = 5;
    var VELOCITY_INCREASE = 0.3;

    var KEY_LEFT = 37;
    var KEY_RIGHT = 39;

    // HTML5 canvas instance and its 2D graphics context
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    // Current game state
    // (that means, whether it is being played or we see menu or someting)
    var state;

    // Game state prototype
    var GameState = {
        update: function () {},
        draw: function () {},
        mouseDown: function () {},
        keyDown: function () {},
        keyUp: function () {}
    };

    /*
        A snake is 'quantized' into small circular pieces that I call chunks
        The constructor takes three arguments: the x coordinate, the y
        coordinate and the angle that specifies the direction
    */
    var SnakeChunk = function (x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;

        this.getPosition = function () {
            return {
                x: this.x,
                y: this.y,
                angle: this.angle
            };
        }

        this.setPosition = function (newPos) {
            this.x = newPos.x;
            this.y = newPos.y;
            this.angle = newPos.angle;
        }

        /*
          The 'isHead' argument, that means if the chunk is the head of a snake,
          is one that tells the update function which of two behaivour scenarios
          it should obey. The next argument's meaning is solely depended on
          previous: if the chunk is a head, 'param' is the snake's velocity; if it
          is not, then it is the previous chunk's position and direction.
          The 'chunks' argument is a list of all chunks, required for collision
          detection, and if a collision has been detected, 'collisionCallback'
          will be called.
        */
        this.update = function (isHead, param, chunks, collisionCallback) {
            // Save the old 'context' (position and direction) to pass it
            // to the next chunk
            var pos = this.getPosition();

            if (isHead) {
                // If it is a head, then it's not a tail. But what is more
                // important, 'param' is the snake's velocity
                var velocity = param;

                // Here we add the velocity vector to the position vector
                // but since we don't have any Vector class and work only with
                // projections, it looks like this
                this.x += velocity * Math.cos(this.angle);
                this.y += velocity * Math.sin(this.angle);

                // Check if the snake has smashed its cranium by a sudden
                // collision with a wall
                if (this.x >= W || this.x < 0 || this.y >= H || this.y < 0) {
                    collisionCallback();
                }

                // Good snakes don't eat themselves, too.
                // Also, we ignore the first UNCOLLIDABLE_SNAKE_HEAD_LENGTH chunks
                // in order not to end the game because of innocent direction change
                for (var i = 0; i < chunks.length - UNCOLLIDABLE_SNAKE_HEAD_LENGTH; i++) {
                    if (Math.abs(this.x - chunks[i].x) < COLLISION_SENSIBILITY_RADIUS &&
                        Math.abs(this.y - chunks[i].y) < COLLISION_SENSIBILITY_RADIUS) {
                        collisionCallback();
                    }
                }
            } else {
                // But if it is a middle or a tail chunk, that all that is
                // needed is to acquire the previous chunk's position
                var newPos = param;
                this.setPosition(newPos)
            }

            return pos;
        }

        this.draw = function () {
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.x, this.y, SNAKE_CHUNK_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }
    }


    /*
        This class describes appetizing, palatable, yummy red circles
    */
    var Food = function () {
        var generateCoordinate = function (maximum) {
            return Math.floor(Math.random() * maximum);
        }

        this.newPosition = function () {
            this.x = generateCoordinate(W);
            this.y = generateCoordinate(H);
        }

        /*
            Straightforwardly simple. Take the snake head, check for collision
            with the self, and probably invoke the corresponding callback
        */
        this.update = function (snakeHead, eatenCallback) {
            if (Math.abs(snakeHead.x - this.x) < FOOD_RADIUS &&
                Math.abs(snakeHead.y - this.y) < FOOD_RADIUS) {
                this.newPosition();
                eatenCallback();
            }
        }

        this.draw = function () {
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(this.x, this.y, FOOD_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }

        // Generate a random position
        this.newPosition();
    }


    /*
        The game class, and the first GameState so far
    */
    var Game = function () {
        this.chunks = [];
        this.food = [];
        this.velocity = INITIAL_VELOCITY;
        this.points = 0; // player's score

        this.isTurningLeft = false;
        this.isTurningRight = false;

        // Create a snake...
        for (var i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
            this.chunks.push(new SnakeChunk(W / 2, H / 2 - SNAKE_CHUNK_GAP*i, -Math.PI / 2));
        }

        // ...and what it's supposed to eat
        this.food.push(new Food());

        this.draw = function () {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, W, H);

            this.chunks.forEach(function (chunk) {
                chunk.draw();
            });

            this.food.forEach(function (foodItem) {
                foodItem.draw();
            });

            ctx.font = '30px sans-serif';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'right';
            ctx.fillText(this.points, W, 0);
        }

        this.update = function () {
            // If the left or right key is being pressed, turn the snake head
            if (this.isTurningLeft) {
                this.chunks[this.chunks.length - 1].angle -= ANGULAR_SPEED / FPS;
            }
            if (this.isTurningRight) {
                this.chunks[this.chunks.length - 1].angle += ANGULAR_SPEED / FPS;
            }

            var self = this;

            // Update the head and get its previous position
            var pos = this.chunks[this.chunks.length - 1].update(
                true, this.velocity, this.chunks, function () {
                    switchState(new GameOver(self.points));
                });
            // Now update the rest of chunks, passing them new positions
            for (var i = this.chunks.length - 2; i >= 0; i--) {
                pos = this.chunks[i].update(false, pos);
            }

            // Update the food
            for (var i = 0; i < this.food.length; i++) {
                this.food[i].update(this.chunks[this.chunks.length - 1], function () {
                    // If something has been eaten, increase the score...
                    self.points++;
                    // ...and enlarge the snake
                    for (var j = 0; j < NEW_CHUNKS_PER_DINNER; j++) {
                        self.chunks.unshift(new SnakeChunk(
                            self.chunks[0].x, self.chunks[0].y, self.chunks[0].angle));
                    }
                    // Now, if it has been enough successful eatings, populate
                    // the game field with a new Food instance
                    if (self.points % FOOD_INCREASE_STEP == 0) {
                        self.food.push(new Food());
                    }
                    // And, finally, increase the velocity
                    self.velocity += VELOCITY_INCREASE;
                });
            }
        }

        this.keyDown = function (event) {
            switch (event.keyCode) {
                case KEY_LEFT:
                    this.isTurningLeft = true;
                    break;
                case KEY_RIGHT:
                    this.isTurningRight = true;
                    break;
            }
        }

        this.keyUp = function (event) {
            switch (event.keyCode) {
                case KEY_LEFT:
                    this.isTurningLeft = false;
                    break;
                case KEY_RIGHT:
                    this.isTurningRight = false;
                    break;
            }
        }
    }
    Game.prototype = GameState;


    // The menu state
    var Menu = function () {
        this.draw = function() {
            ctx.fillStyle = 'rgba(225, 245, 220, 0.05)';
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.beginPath();
            ctx.moveTo(W / 2 - 50, H / 2 + 50);
            ctx.lineTo(W / 2 - 50, H / 2 + 150);
            ctx.lineTo(W / 2 + 50, H / 2 + 100);
            ctx.fill();
            ctx.closePath();

            ctx.font = '100px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('Snake.js', W / 2, 120, W);
            ctx.font = '24px sans-serif';
            ctx.fillText('Use the left and right arrow keys to control the snake', W / 2, 240, W);
        }

        this.mouseDown = function (event) {
            switchState(new Game());
        }

        this.keyDown = function (event) {
            switchState(new Game());
        }
    }
    Menu.prototype = GameState;


    // The 'Game over' state
    var GameOver = function (score) {
        this.prototype = GameState;

        this.score = score;

        this.draw = function() {
            ctx.fillStyle = 'rgba(225, 245, 220, 0.05)'
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.font = '72px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('Your score: ' + this.score, W / 2, 200, W);
            ctx.font = '24px sans-serif';
            ctx.fillText('Press any key to try again', W / 2, 320, W);
        }

        this.mouseDown = function (event) {
            switchState(new Game());
        }

        this.keyDown = function (event) {
            switchState(new Game());
        }
    }
    GameOver.prototype = GameState;


    // This function switches game states
    function switchState(newState) {
        state = newState;
        canvas.onmousedown = state.mouseDown;
        document.body.onkeydown = function (event) {
            state.keyDown(event);
            return false;
        }
        document.body.onkeyup = function (event) {
            state.keyUp(event);
            return false;
        }
    }

    switchState(new Menu());

    // Main game loop
    window.setInterval(function() {
        state.update();
        state.draw();
    }, 1000 / FPS);

})();