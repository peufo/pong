
$(()=>{

	let canvas = document.getElementById('canvas')
	let ctx = canvas.getContext('2d')
	let raf

	//Initialisation de la carte
	let OY = canvas.height

	//Bord
	let BORDER_WIDTH = 5
	ctx.lineWidth = BORDER_WIDTH
	ctx.beginPath()
	ctx.moveTo(BORDER_WIDTH / 2, 0)
	ctx.lineTo(BORDER_WIDTH / 2, canvas.height)
	ctx.moveTo(canvas.width - BORDER_WIDTH / 2, 0)
	ctx.lineTo(canvas.width - BORDER_WIDTH / 2, canvas.height)
	ctx.stroke()



	//Initialisation des composants
	let balls = []
	let pods = []
	let nbLife = 5
	let speedMax = 10
	
	function init() {

		//Balls
		balls = []
		let nBalls = 1
		let nbTour = 1
		for (let i = 1; i <= nBalls; i++) {
			//let alpha = ((Math.PI * 2) / nBalls) * i * nbTour 
			let alpha = i * 1.2 * (Math.PI * 2) / nBalls - 0.50
			let speed = 6

			let vx = speed * Math.cos(alpha)
			let vy = speed * Math.sin(alpha)

			balls.push(new Ball(canvas.width/2 + 150, canvas.height/2, 0, 0, 10, `black`))
		}
		
		//Pod
		pods = []
		pods = [
			new Pod(0, canvas.width / 2, 70),
			new Pod(1, canvas.width / 2, canvas.height - 70)
		]

	}
	
	function Ball(x, y, vx, vy, radius, color){
		this.x = x
		this.y = y
		this.vx = vx
		this.vy = vy
		this.radius = radius
		this.color = color
		this.mass = 1
		
		this.draw = () => {
			
			//Ball
			ctx.beginPath()
			ctx.arc(this.x, OY-this.y, this.radius, 0, Math.PI * 2, true)
			ctx.closePath()
			ctx.fillStyle = this.color
			ctx.fill()

		}

	  	this.move = () => {

	  		this.x += this.vx
			this.y += this.vy

			//Bord
			if (this.x - this.radius - BORDER_WIDTH < 0) {
				this.vx = - this.vx
			}else if (this.x + this.radius + BORDER_WIDTH > canvas.width){
				this.vx = - this.vx
			}
			//Fond
			//if (pods.length == 1 && this.y - this.radius < 0) this.rebond(Math.PI / 2)
			
			//Pod
			pods.forEach((pod, i) => {
				let {d, dx, dy, a} = getDistance(pod, this)	
			
				if (d - this.radius <= pod.radius) {

					resolveCollision(this, pod)
					this.checkSpeed()
					//this.rebond(a)
				}

				if (pod.vx > speedMax) pod.vx = speedMax
				else if (pod.vx < -speedMax) pod.vx = -speedMax
				if (pod.vy > speedMax) pod.vy = speedMax
				else if (pod.vy < -speedMax) pod.vy = -speedMax

			})
		  }
		  
		  this.checkSpeed = () => {
			let speed = (this.vx**2 + this.vy**2) ** 0.5
			if (speed > speedMax) {
				this.vx = this.vx * (speedMax / speed)
				this.vy = this.vy * (speedMax / speed)
			}
		  }
	}

	function Pod(player, x, y, accel, radius, angle) {
		
		this.player = player || 0
		this.x = x || canvas.width / 2
		this.y = y || 0
		this.radius = radius || 40
		this.angle = angle || Math.PI
		this.mass = 5
		this.life = nbLife
		this.vx = 0
		this.vy = 0
		this.accel = accel || 2
		this.width = this.radius * Math.sin(this.angle)
		this.top = this.radius * Math.cos(this.angle)
		this.height = this.radius - this.top

		this.draw = () => {
			let vertical = 1.5 * Math.PI
			//POD
			ctx.beginPath()
			ctx.arc(this.x, OY - this.y, this.radius, vertical - this.angle, vertical + this.angle)
			ctx.stroke()
			
			let lifePas = this.radius / nbLife
			for (let i = 0; i < this.life - 1; i++) {
				ctx.beginPath()
				ctx.arc(this.x, OY - this.y, this.radius - (i + 1) * lifePas , vertical - this.angle, vertical + this.angle)
				ctx.stroke()
			}

		}

		this.move = () => {

			if (this.player == 0) {
				this.pressLeft = KEY_LEFT
				this.pressRight = KEY_RIGHT
				this.pressUp = KEY_UP
				this.pressDown = KEY_DOWN
			}else if (this.player == 1) {
				this.pressLeft = KEY_A
				this.pressRight = KEY_D
				this.pressUp = KEY_W
				this.pressDown = KEY_S
			}

			// Axe X
			if (this.x - this.width < BORDER_WIDTH + this.radius){//Tape a gauche
				this.vx = Math.abs(this.vx)
			}else if (this.x + this.width > canvas.width - BORDER_WIDTH - this.radius) {//Tape à droite
				this.vx = - Math.abs(this.vx)
			}else{
				// Commande axe X
				if (this.vx.toFixed(2) != 0 && ((!this.pressLeft && !this.pressRight) || (this.pressLeft && this.pressRight))){
					if (this.vx < 0) this.vx += this.accel		//Ralenti
					else if (this.vx > 0) this.vx -= this.accel
				}else if (this.pressRight) {
					if (this.vx >= 0) this.vx += this.accel		//Accélère
					if (this.vx < 0) this.vx += 2 * this.accel	//Freine
				}else if (this.pressLeft) {
					if (this.vx <= 0) this.vx -= this.accel 	//Accélère
					if (this.vx > 0) this.vx -= 2 * this.accel 	//Freine
				}
			}			

			//Axe Y
			if (this.y < 0 + this.radius) {//Tape en bas
				this.vy = Math.abs(this.vy)
			}else if (this.y > canvas.height - this.radius) {//Tape en haut
				this.vy = - Math.abs(this.vy)
			}else{
				// Commande axe Y
				if (this.vy.toFixed(2) != 0 && ((!this.pressUp && !this.pressDown) || (this.pressUp && this.pressDown))){
					if (this.vy < 0) this.vy += this.accel		//Ralenti
					else if (this.vy > 0) this.vy -= this.accel
				}else if (this.pressUp) {
					if (this.vy >= 0) this.vy += this.accel		//Accélère
					if (this.vy < 0) this.vy += 2 * this.accel	//Freine
				}else if (this.pressDown) {
					if (this.vy <= 0) this.vy -= this.accel 	//Accélère
					if (this.vy > 0) this.vy -= 2 * this.accel 	//Freine
				}
			}			

			
			//Arrondi
			if (Math.abs(this.vx) < this.accel) this.vx = 0
			if (Math.abs(this.vy) < this.accel) this.vy = 0

			//Déplacement
			this.x += this.vx
			this.y += this.vy

		}

	}

	function getDistance(pA, pB) {
		const dx = pB.x - pA.x
		const dy = pB.y - pA.y

		let angle = Math.atan(dy / dx)

		if (dx < 0 && 0 < dy) angle = 0.5 * Math.PI - angle
		else if (dx < 0 && dy < 0) angle += Math.PI
		else if (0 < dx && dy < 0) angle = 1.5 * Math.PI - angle

		return {dx, dy, d: (dx**2 + dy**2)**0.5, a: angle}	
	}


	function draw() {

		let win = ''

		//Initialisation
		ctx.clearRect(BORDER_WIDTH, 0, canvas.width - 2 * BORDER_WIDTH, canvas.height)
		
		//Pod
		pods.forEach(pod => {
			pod.draw()
			pod.move()
		})

		let { d } = getDistance(pods[0], pods[1])	
		if (d - pods[0].radius - pods[1].radius <= 0) {
			resolveCollision(pods[0], pods[1])
		}

		//Balls
		balls.forEach(ball => {
			if (ball.y - ball.radius > canvas.height) {
				relocation(0)
				pods[1].life--
				if(pods[1].life == 0) win = 'Le joueur du bas gagne !'
			}else if(ball.y + ball.radius < 0) {
				relocation(0)
				pods[0].life--
				if(pods[0].life == 0) win = 'Le joueur du haut gagne !'
			}else{
				ball.draw()
				ball.move()		
			}
		})

		/*
		if (win) {
			alert(win)
			init()
		}*/
		raf = window.requestAnimationFrame(draw)
	}

	
	
	$('#reset').click(function(){
		init()
	})

	function relocation(index) {
		balls[index].x = canvas.width / 2
		balls[index].y = canvas.height / 2
		balls[index].vx = 0
		balls[index].vy = 0
	}

	/*
	canvas.addEventListener('mouseover', function(e){
		raf = window.requestAnimationFrame(draw)
	})

	canvas.addEventListener('mouseout', function(e){
		window.cancelAnimationFrame(raf)
	})
	*/

	let KEY_LEFT = false
	let KEY_RIGHT = false
	let KEY_UP = false
	let KEY_DOWN = false
	let KEY_A = false
	let KEY_D = false
	let KEY_W = false
	let KEY_S = false

	$('body').keydown(function(e){
		switch (e.key) {
			case 'ArrowLeft':
				KEY_LEFT = true
				break
			case 'ArrowRight':
				KEY_RIGHT = true
				break
			case 'ArrowUp':
				KEY_UP = true
				break
			case 'ArrowDown':
				KEY_DOWN = true
				break
			case 'a':
				KEY_A = true
				break
			case 'd':
				KEY_D = true
				break
			case 'w':
				KEY_W = true
				break
			case 's':
				KEY_S = true
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
			case 'ArrowUp':
				KEY_UP = false
				break
			case 'ArrowDown':
				KEY_DOWN = false
				break
			case 'a':
				KEY_A = false
				break
			case 'd':
				KEY_D = false
				break
			case 'w':
				KEY_W = false
				break
			case 's':
				KEY_S = false
				break
		}			
	})

	init()
	raf = window.requestAnimationFrame(draw) //start

})