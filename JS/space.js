document.addEventListener("DOMContentLoaded", function(event) { 
  const debounce = _.debounce;


  document.addEventListener("mousemove", parallax);
  function parallax(e) {
    this.querySelectorAll('.layer').forEach(layer => {
      const speed = layer.getAttribute('data-speed');
      
      const x = (window.innerWidth - e.pageX * speed)/200;
      const y = (window.innerHeight - e.pageY * speed)/200;
      
      layer.style.transform = `translateX(${x}px) translateY(${y}px)`;
    })
  }

/**
 * Create an animated star background using canvas
 */
class Stars {
  constructor(el, options) {
    this.canvas = el;
    this.ctx = this.canvas.getContext('2d');
    // TODO: this needs some work
    this.options = Object.assign({
      stars: 200,
      colorRange: [0,60,240],
      speed: 2,
      onlyDraw: false,
      density: 800
    }, options);
    this.move = true;
    this.skipFrame = false;
    this.options.densityStars = this.options.stars;
    this.stars = [];

    this.start();
  }

  start() {
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.autoDensity();
    this.addStars();
    this.draw();
    
    window.addEventListener('resize', debounce(e => {
      this.restart();
    }, 100));
  }
  
  restart() {
    window.cancelAnimationFrame(this.drawFrame);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.stars.length = 0;
    this.autoDensity();
    this.addStars();
    this.draw();
  }

  addStars() {
    for (var i = 0; i < this.options.densityStars; i++) {
      let x = Math.random() * this.canvas.offsetWidth,
          y = Math.random() * this.canvas.offsetHeight,
          radius = Math.random() * 2,
          hue = this.options.colorRange[getRandom(0, this.options.colorRange.length - 1)],
          sat = getRandom(50, 100),
          alpha = Math.max(Math.random(), 0.05),
          speed = Math.random() * .5;

      this.stars.push(new Star(this.canvas, {
        x: x,
        y: y,
        hue: hue,
        sat: sat,
        radius: radius,
        speed: speed,
        alpha: alpha,
        speed: this.options.speed
      }));
    }
  }

  autoDensity() {
    /* calc area */
    let area = this.canvas.width * this.canvas.height / 1000;

    /* calc number of particles based on density area */
    let numberParticles = area * this.options.stars / this.options.density;

    /* add or remove X particles */
    let missingParticles = this.options.stars - numberParticles;

    if (missingParticles < 0) this.options.densityStars = this.options.stars + Math.abs(missingParticles);
    else this.options.densityStars = this.options.stars - Math.abs(missingParticles);
    console.log(area, this.options.densityStars);
}

  draw() {
    // also skip every other frame, will still run at ~30 frames a second
    if ((this.move && !this.skipFrame) || this.options.onlyDraw) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const length = this.stars.length;
      for (let i = 0; i < length; i++) {
        const star = this.stars[i];
        star.move();
        star.draw();
      }
    }

    this.skipFrame = !this.skipFrame;
    if(!this.options.onlyDraw) this.drawFrame = window.requestAnimationFrame(() => { this.draw(); });
  }
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}		

class Star {
  constructor(canvas, options) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d');
    this.options = options;
    this.radius = this.options.radius;
    this.speed = this.options.speed;
    this.x = this.rx = this.options.x;
    this.y = this.ry = this.options.y;
    this.setVelocity();
  }

  setVelocity() {
    this.vx = 0;
    const alpha = this.options.alpha;
    if(alpha > 0 && alpha < .4) this.vy = -.1;
    else if(alpha >= .4 && alpha < .7) this.vy = -.3;
    else this.vy = -.5;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.rx, this.ry, this.radius, 0, 360);
    this.ctx.fillStyle = `hsla(${this.options.hue}, ${this.options.sat}%, 88%, ${this.options.alpha})`;
    this.ctx.fill();
  }

  move() {
    const p = this,
            ms = this.speed / 2,
            newPosition = {
                xLeft: 0,
                xRight: p.canvas.width,
                yTop: 0,
                yBottom: p.canvas.height
            };
        
        p.x += p.vx * ms;
        p.y += p.vy * ms;

        /* change particle velocity if it is out of canvas */
        if (p.y + p.radius <= 0) {
            p.y = p.canvas.height;
        }

        p.rx = Math.round(p.x);
        p.ry = Math.round(p.y);
  }
}

///

new Stars(document.getElementsByTagName('canvas')[0]);
});

