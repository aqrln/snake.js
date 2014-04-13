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

		this.update = function (isHead, param, chunks, callback) {
			var pos = this.getPosition();

			if (isHead) {
				var velocity = param;

				this.x += velocity * Math.cos(this.angle);
				this.y += velocity * Math.sin(this.angle);

				if (this.x >= W || this.x < 0 || this.y >= H || this.y < 0) {
					callback('collision');
				}

				for (var i = 0; i < chunks.length - 3; i++) {
					if (Math.abs(this.x - chunks[i].x) < 3 && Math.abs(this.y - chunks[i].y) < 3) {
						callback('collision');
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


	var Game = function () {
		this.chunks = [];
		this.velocity = 2;

		for (var i = 0; i < 50; i++) {
			this.chunks.push(new SnakeChunk(W / 2, H / 2 - 3*i, -Math.PI / 2));
		}

		this.draw = function () {
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0, 0, W, H);

			this.chunks.forEach(function (chunk) {
				chunk.draw();
			});
		}

		this.update = function () {
			var pos = this.chunks[this.chunks.length - 1].update(
				true, this.velocity, this.chunks, function (message) {
					switch (message) {
						case 'collision':
							switchState(new Menu());
							break;
					}
				});
			for (var i = this.chunks.length - 2; i >= 0; i--) {
				pos = this.chunks[i].update(false, pos);
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