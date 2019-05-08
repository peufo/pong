$(()=>{

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var raf

	//Initialisation de la carte

	//Bord
	var BORDER_WIDTH = 5
	ctx.lineWidth = BORDER_WIDTH
	ctx.beginPath()
	ctx.moveTo(BORDER_WIDTH / 2, 0)
	ctx.lineTo(BORDER_WIDTH / 2, canvas.height)
	ctx.moveTo(canvas.width - BORDER_WIDTH / 2, 0)
	ctx.lineTo(canvas.width - BORDER_WIDTH / 2, canvas.height)
	ctx.stroke()



	//Initialisation des composants

	//Balls
	var balls = []
	var nBalls = 1
	var nbTour = 1
	for (var i = 1; i <= nBalls; i++) {
		//var alpha = ((Math.PI * 2) / nBalls) * i * nbTour 
		var alpha = i * 1.2 * (Math.PI * 2) / nBalls - 0.50
		var speed = 6

		balls.push(new Ball(canvas.width/2 + 150, canvas.height/2, speed, alpha, 5, `black`))
	}



	
	function Ball(x, y, speed, alpha, radius, color){
	  this.x = x
	  this.y = y
	  this.speed = speed
	  this.alpha = alpha
	  this.radius = radius
	  this.color = color
	  this.calcvx = () => {
	  	this.vx = this.speed * Math.sin(this.alpha + Math.PI / 2)
	  	return this.vx
	  }
	  this.calcvy = () => {
	  	this.vy = this.speed * Math.cos(this.alpha + Math.PI / 2)
	  	return this.vy
	  }
	  this.calcvx()
	  this.calcvy()
	  
	  this.draw = () => {
	  	
	  	//Ball
	    ctx.beginPath();
	    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
	    ctx.closePath();
	    ctx.fillStyle = this.color;
	    ctx.fill();
		
	  }

	  this.rebond = (surface) => {

	  	this.alpha = this.alpha + Math.PI - 2 * (this.alpha - surface)
		this.calcvx()
		this.calcvy()

	  }

	  	this.move = () => {

	  		this.x += this.vx
			this.y += this.vy

			//Bord
			if (this.x + this.radius + BORDER_WIDTH > canvas.width || this.x - this.radius - BORDER_WIDTH < 0) {
			 this.rebond(0)
			}

			//Fond
			if (pods.length == 1 && this.y - this.radius < 0) this.rebond(Math.PI / 2)
	
			//Pod
			pods.forEach((pod, i) => {

				var distance = ((pod.x - this.x)**2 + (pod.y - this.y)**2)**0.5	
				

				if (distance - this.radius <= pod.radius) {
					
					var angle = Math.PI / 2 - Math.asin((pod.y - this.y) / distance)
					console.log(i, distance - this.radius, angle)
					console.log('BOOM')
					//if (Math.abs(angle - this.alpha) > Math.PI / 2) { //Anti double rebonds
						if (this.x >= pod.x) {
							if (this.y >= pod.y) this.rebond(1.5 * Math.PI - angle)
							else this.rebond(0.5 * Math.PI - angle)
						}else{
							if (this.y >= pod.y) this.rebond(1.5 * Math.PI + angle)
							else this.rebond(1.5 * Math.PI + angle)
						}					
					//}
					console.log(i, distance - this.radius, angle)
				}else{}
			})
	  	}
	}

	//Pod
	var pods = [new Pod(0, canvas.width / 2, 0, 0.5), new Pod(1, canvas.width / 2, canvas.height, 0.5)]

	function Pod(player, x, y, accel, radius, angle) {
		
		this.player = player || 0
		this.x = x || canvas.width / 2
		this.y = y || 0
		this.radius = radius || 50
		this.angle = angle || Math.PI
		this.speed = 0
		this.accel = accel || 0.2
		this.width = this.radius * Math.sin(this.angle)
		this.top = this.radius * Math.cos(this.angle)
		this.height = this.radius - this.top

		this.draw = () => {
			var vertical = 1.5 * Math.PI
			ctx.beginPath()
			ctx.arc(this.x, this.y, this.radius, vertical - this.angle, vertical + this.angle)
			ctx.stroke()

			ctx.beginPath()
			ctx.moveTo(this.x - this.width, this.y)
			ctx.lineTo(this.x + this.width, this.y)
			ctx.stroke()

		}


		this.move = () => {


			if (this.player == 0) {
				this.pressLeft = KEY_LEFT
				this.pressRight = KEY_RIGHT
			}else if (this.player == 1) {
				this.pressLeft = KEY_A
				this.pressRight = KEY_D
			}

			if (this.x - this.width < BORDER_WIDTH ){
				//Tape a gauche
				this.speed = -this.speed

			}else if (this.x + this.width > canvas.width - BORDER_WIDTH) {
				//Tape à droite
				this.speed = -this.speed

			}else if (this.speed.toFixed(2) != 0 && ((!this.pressLeft && !this.pressRight) || (this.pressLeft && this.pressRight))){
				//Ralenti
				if (this.speed < 0) this.speed += this.accel
				else if (this.speed > 0) this.speed -= this.accel
			}else if (this.pressRight) {
				if (this.speed >= 0) this.speed += this.accel		//Accélère
				if (this.speed < 0) this.speed += 2 * this.accel	//Freine
			}else if (this.pressLeft) {
				if (this.speed <= 0) this.speed -= this.accel 		//Accélère
				if (this.speed > 0) this.speed -= 2 * this.accel 	//Freine
			}	

			//Déplacement
			this.x += this.speed
		}

	}

	function draw() {

		//Initialisation
		ctx.clearRect(BORDER_WIDTH, 0, canvas.width - 2 * BORDER_WIDTH, canvas.height)
		
		//Pod
		pods.forEach(pod => {
			pod.draw()
			pod.move()
		})

		//Balls
		balls.forEach((ball, i) => {
			if (ball.y - ball.radius > canvas.height) {
				//balls.splice(i, 1)
				//console.log('Une vie en moins !')
			}else{
				ball.draw()
				ball.move()					
			}
		})





		raf = window.requestAnimationFrame(draw)
	}

	raf = window.requestAnimationFrame(draw)

	/*
	canvas.addEventListener('mouseover', function(e){
		raf = window.requestAnimationFrame(draw)
	})

	canvas.addEventListener('mouseout', function(e){
		window.cancelAnimationFrame(raf)
	})
	*/

	var KEY_LEFT = false
	var KEY_RIGHT = false
	var KEY_A = false
	var KEY_D = false

	$('body').keydown(function(e){
		switch (e.key) {
			case 'ArrowLeft':
				KEY_LEFT = true
				break
			case 'ArrowRight':
				KEY_RIGHT = true
				break
			case 'a':
				KEY_A = true
				break
			case 'd':
				KEY_D = true
				break
		}			
	})

	$('body').keyup(function(e){
		switch (e.key) {
			case 'ArrowLeft':
				KEY_LEFT = false
				break
			case 'ArrowRight':
				KEY_RIGHT = false
				break
			case 'a':
				KEY_A = false
				break
			case 'd':
				KEY_D = false
				break
		}			
	})

	balls.forEach(ball => ball.draw)

})