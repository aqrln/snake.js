(function () {

	var FPS = 30;
	var W = 600;
	var H = 600;

	var KEY_UP = 38;
	var KEY_DOWN = 40;
	var KEY_LEFT = 37;
	var KEY_RIGHT = 39;

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var state;


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

		this.update = function (isHead, param, chunks, collisionCallback) {
			var pos = this.getPosition();

			if (isHead) {
				var velocity = param;

				this.x += velocity * Math.cos(this.angle);
				this.y += velocity * Math.sin(this.angle);

				if (this.x >= W || this.x < 0 || this.y >= H || this.y < 0) {
					collisionCallback();
				}

				for (var i = 0; i < chunks.length - 3; i++) {
					if (Math.abs(this.x - chunks[i].x) < 3 && Math.abs(this.y - chunks[i].y) < 3) {
						collisionCallback();
					}
				}
			} else {
				var newPos = param;
				this.setPosition(newPos)
			}

			return pos;
		}

		this.draw = function () {
			ctx.fillStyle = '#000000';
			ctx.beginPath();
			ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
			ctx.fill();
			ctx.closePath();
		}
	}


	var Food = function () {
		var generateCoordinate = function (maximum) {
			return Math.floor(Math.random() * maximum);
		}

		var foodRadius = 5;

		this.newPosition = function () {
			this.x = generateCoordinate(W);
			this.y = generateCoordinate(H);
		}

		this.update = function (snakeHead, eatenCallback) {
			if (Math.abs(snakeHead.x - this.x) < foodRadius &&
				Math.abs(snakeHead.y - this.y) < foodRadius) {
				this.newPosition();
			}
			eatenCallback();
		}

		this.draw = function () {
			ctx.fillStyle = '#ff0000';
			ctx.beginPath();
			ctx.arc(this.x, this.y, foodRadius, 0, Math.PI * 2);
			ctx.fill();
			ctx.closePath();
		}

		this.newPosition();
	}


	var Game = function () {
		this.chunks = [];
		this.food = [];
		this.velocity = 2;
		this.points = 0;

		for (var i = 0; i < 50; i++) {
			this.chunks.push(new SnakeChunk(W / 2, H / 2 - 3*i, -Math.PI / 2));
		}

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
		}

		this.update = function () {
			var pos = this.chunks[this.chunks.length - 1].update(
				true, this.velocity, this.chunks, function () {
					switchState(new Menu());
				});
			for (var i = this.chunks.length - 2; i >= 0; i--) {
				pos = this.chunks[i].update(false, pos);
			}

			var self = this;
			for (var i = 0; i < this.food.length; i++) {
				this.food[i].update(this.chunks[this.chunks.length - 1], function () {
					self.points++;
				});
			}
		}

		this.mouseDown = function (event) {
		}

		this.keyDown = function (event) {
			switch (event.keyCode) {
				case KEY_LEFT:
					this.chunks[this.chunks.length - 1].angle -= Math.PI / 8;
					break;
				case KEY_RIGHT:
					this.chunks[this.chunks.length - 1].angle += Math.PI / 8;
					break;
			}
		}
	}


	var Menu = function () {

		this.draw = function() {
			ctx.fillStyle = 'rgb(200, 173, 18)';
			ctx.fillRect(0, 0, W, H);

			ctx.fillStyle = 'rgb(0, 0, 0)';
			ctx.beginPath();
			ctx.moveTo(W / 2 - 50, H / 2 - 50);
			ctx.lineTo(W / 2 - 50, H / 2 + 50);
			ctx.lineTo(W / 2 + 50, H / 2);
			ctx.fill();
			ctx.closePath();
		}

		this.update = function () {
		}

		this.mouseDown = function (event) {
			switchState(new Game());
		}

		this.keyDown = function (event) {
			switchState(new Game());
		}
	}


	function switchState(newState) {
		state = newState;
		canvas.onmousedown = state.mouseDown;
		document.body.onkeydown = function (event) {
			state.keyDown(event);
			return false;
		}
	}

	switchState(new Menu());

	window.setInterval(function() {
		state.update();
		state.draw();
	}, 1000 / FPS);

})();