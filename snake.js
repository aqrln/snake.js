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


	var Game = function () {
		this.x = W / 2;
		this.y = H / 2;
		this.angle = Math.PI / 2;
		this.velocity = 1;

		this.draw = function () {
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0, 0, W, H);

			ctx.fillStyle = '#000000';
			ctx.beginPath();
			ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
			ctx.fill();
			ctx.closePath();
		}

		this.update = function () {
			this.x += this.velocity * Math.cos(this.angle);
			this.y += this.velocity * Math.sin(this.angle);

			if (this.x >= W || this.x < 0 || this.y >= H || this.y < 0) {
				switchState(new Menu());
			}
		}

		this.mouseDown = function (event) {
		}

		this.keyDown = function (event) {
			switch (event.keyCode) {
				case KEY_LEFT:
					this.angle -= Math.PI / 8;
					break;
				case KEY_RIGHT:
					this.angle += Math.PI / 8;
					break;
			}
		}
	};


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
	};


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