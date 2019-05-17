$(()=>{

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var raf


	//Initialisation des composants
	var OY = canvas.height

	//Balls
	var balls = []
	var nBalls = 2
	var nbTour = 1
	for (var i = 1; i <= nBalls; i++) {
		var alpha = i
		var radius = i * 20
		var speed = i * 50

		balls.push(new Ball(i, canvas.width/2 - 150 + 100 * i, canvas.height/2 - 120 + 80 * i, speed, alpha, 20, `black`))

	}

	//Create controle
	balls.forEach((ball, i) => {
		$('#content').append(`
		  	<div>
			  	${i}. PosX<input id="posx${i}" type="number" value="${ball.x}" step="5">
			  	PosY<input id="posy${i}" type="number" value="${ball.y}" step="5">
			  	Speed<input id="speed${i}" type="number" value="${ball.speed}" step="5">
			  	Alpha<input id="alpha${i}" type="number" value="${ball.alpha}" step="0.05">	
		  	</div>
		`)
	})
	
	function Ball(index, x, y, speed, alpha, radius, color){
	  	this.index = index
	  	this.x = x
	  	this.y = y
	  	this.speed = speed
	  	this.alpha = alpha
	  	this.radius = radius
	  	this.color = color
	  	this.calcvx = () => {
	  		this.vx = this.speed * Math.cos(this.alpha)
	  		return this.vx
	  	}
	  	this.calcvy = () => {
	  		this.vy = this.speed * Math.sin(this.alpha)
	  		return this.vy
	  	}
	  	this.calcvx()
	  	this.calcvy()
	  
	  	this.draw = () => {
	  	
		  	//Ball
		    ctx.beginPath();
		    ctx.arc(this.x, OY-this.y, this.radius, 0, Math.PI * 2, true)
		    ctx.closePath()
		    ctx.fillStyle = this.color
		    ctx.fill()

		    //Ball future
		    var offsetX = this.radius * Math.cos(this.alpha + Math.PI / 2)
		    var offsetY = this.radius * Math.sin(this.alpha + Math.PI / 2)
		    ctx.beginPath();
		    ctx.setLineDash([3, 5])
		    ctx.arc(this.x + this.vx, OY-(this.y + this.vy), this.radius, 0, Math.PI * 2, true)
		    ctx.moveTo(this.x + offsetX, OY-(this.y + offsetY))
		    ctx.lineTo(this.x + this.vx + offsetX, OY-(this.y + this.vy + offsetY))
		    ctx.moveTo(this.x - offsetX, OY-(this.y - offsetY))
		    ctx.lineTo(this.x + this.vx - offsetX, OY-(this.y + this.vy - offsetY))		    
		    ctx.closePath()
		    ctx.stroke()


		}

		this.rebond = (surface) => {

			this.alpha = this.alpha + Math.PI - 2 * (this.alpha - surface)
			this.calcvx()
			this.calcvy()

		}

	  	this.move = () => {

	  		this.x += this.vx
			this.y += this.vy

	  	}
	}

	function draw() {

		//Initialisation
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		//Balls
		balls.forEach((ball, i) => {
			if (ball.y - ball.radius > canvas.height) {
				//balls.splice(i, 1)
				//console.log('Une vie en moins !')
			}else{
				ball.x = Number($(`#posx${i}`).val())
				ball.y = Number($(`#posy${i}`).val())
				ball.speed = Number($(`#speed${i}`).val())
				ball.alpha = Number($(`#alpha${i}`).val())
				ball.calcvx()
				ball.calcvy()

				ball.draw()				
			}
		})


		//Contact
		var contact = calcContact(balls[0], balls[1])
		if (contact) {
			//Intersection
			ctx.setLineDash([3, 0])
			ctx.beginPath();
			ctx.arc(contact.x, OY-contact.y, balls[0].radius, 0, Math.PI * 2, true)
			ctx.arc(contact.x, OY-contact.y, balls[1].radius, 0, Math.PI * 2, true)
			ctx.closePath()
			ctx.stroke()

			//Distance de l'intersection
			var a = getDistance(balls[0], contact)
			var b = getDistance(balls[1], contact)

			//Distance d'une ball au moment ou l'autre est à l'intersection
			var ratio = balls[0].speed / balls[1].speed
			a.d2 = b.d * ratio
			b.d2 = a.d / ratio

			//Position des balls
			a.x = balls[0].x + a.d2 * Math.cos(balls[0].alpha)
			a.y = balls[0].y + a.d2 * Math.sin(balls[0].alpha)
			b.x = balls[1].x + b.d2 * Math.cos(balls[1].alpha)
			b.y = balls[1].y + b.d2 * Math.sin(balls[1].alpha)

			//dessin
			ctx.setLineDash([3, 5])
			ctx.beginPath();
			ctx.arc(a.x, OY-a.y, balls[0].radius, 0, Math.PI * 2, true)
			ctx.closePath()
			ctx.stroke()

			ctx.beginPath();
			ctx.arc(b.x, OY-b.y, balls[1].radius, 0, Math.PI * 2, true)
			ctx.closePath()
			ctx.stroke()	

		}

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


	balls.forEach(ball => ball.draw)


	var calcContact = (ballA, ballB) => {
		//Intersection
		// y = tan(angleA)x+YA-tan(angleA)XA
		// y = tan(angleB)x+YB-tan(angleB)XB

		// tan(angleA)x+YA-tan(angleA)XA = tan(angleB)x+YB-tan(angleB)XB
		// x(tan(angleA) - tan(angleB)) = YB - tan(angleB)XB - YA + tan(angleA)XA
		// x = (YB - tan(angleB)XB - YA + tan(angleA)XA) / (tan(angleA) - tan(angleB))
		// y = tan(angleA)ix+YA-tan(angleA)XA

		var x = (ballB.y - Math.tan(ballB.alpha) * ballB.x + Math.tan(ballA.alpha) * ballA.x - ballA.y) / (Math.tan(ballA.alpha) - Math.tan(ballB.alpha))
		var y = Math.tan(ballA.alpha) * x + ballA.y - Math.tan(ballA.alpha) * ballA.x

		//test direction
		var point = {x: x, y: y}

		var converge = getDirection(ballA, point) && getDirection(ballB, point)

		return converge ? point : undefined

	}

	var getDistance = (pA, pB) => {
		var dx = pB.x - pA.x
		var dy = pB.y - pA.y
		return {dx: dx, dy: dy, d: (dx**2 + dy**2)**0.5}	
	}

	var getDirection = (ball, point) => {
		var direction = false
		var {dx, dy} = getDistance(ball, point)

		if (ball.alpha < 0.5 * Math.PI) {
			if (dx >= 0 && dy >= 0) direction = true
		}else if (ball.alpha < 1 * Math.PI) {
			if (dx < 0 && dy >= 0) direction = true
		}else if (ball.alpha < 1.5 * Math.PI) {
			if (dx < 0 && dy < 0) direction = true
		}else {
			if (dx >= 0 && dy < 0) direction = true
		}
		return direction
	}

	var calcDistances = (ballA, ballB) => {
		var nPeriode = 100
		var pasxA = (ballA.speed / nPeriode) * Math.cos(ballA.alpha)
		var pasyA = (ballA.speed / nPeriode) * Math.sin(ballA.alpha)
		var pasxB = (ballB.speed / nPeriode) * Math.cos(ballB.alpha)
		var pasyB = (ballB.speed / nPeriode) * Math.sin(ballB.alpha)
		var distances = []
		var rayons = []
		var impact = false
		for (var i = 0; i < nPeriode; i++) {
			rayons[i] = ballA.radius + ballB.radius
			distances[i] = calcDistance(ballA.x + i * pasxA, ballA.y + i * pasyA, ballB.x + i * pasxB, ballB.y + i * pasyB)
			if (distances[i] > distances[i-1]) break
			if (distances[i] < rayons[i]) {
				impact = true
				break
			}	
		}

		var trace1 = {
			name: 'Distances',
			y: distances,
			type: 'scatter'
		}

		var trace2 = {
			name: 'Bord de la ball',
			y: rayons,
			type: 'scatter'
		}

		var display = {
			xaxis: {
				title: 'Time'
			},
			yaxis: {
				title: 'Distance'
			}
		}

		Plotly.newPlot('chart', [trace1, trace2], display)
		if (impact) console.log('impact')

	}

	var calcDistance = (x1, y1, x2, y2) => {
		return ((x1 - x2)**2 + (y1 - y2)**2)**0.5
	}

	$('input').on('click keyup', function(){
		calcDistances(balls[0], balls[1])
	})

})