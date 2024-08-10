export class Ball {
  #isGrab = false;
  #isSelect = false;

  #speed = {
    x: 0,
    y: 0,
  };
  #offset = {
    x: 0,
    y: 0,
  };

  #f = 0.09;
  #g = 1;
  #width = 0;
  #height = 0;

  #timer = null;

  constructor(ctx, x, y, radius, background) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.background = background;

    this.init();
  }

  init() {
    const canvas = this.ctx.canvas;
    this.#width = canvas.width - this.radius;
    this.#height = canvas.height - this.radius;

    canvas.addEventListener("mousemove", this.handleMove.bind(this));
    canvas.addEventListener("mousedown", this.handleDown.bind(this));
    canvas.addEventListener("mouseup", this.handleUp.bind(this));
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.background;
    this.ctx.fill();
    this.ctx.closePath();
  }

  handleDown(ev) {
    const { offsetX, offsetY } = ev;
    this.#isGrab = this.#isSelect;

    if (this.#speed.x === 0 && this.#speed.y === 0)
      this.#offset = {
        x: offsetX - this.x,
        y: offsetY - this.y,
      };
  }

  handleUp(ev) {
    this.#isGrab = false;
    if (!this.#timer) {
      this.#offset = {
        x: 0,
        y: 0,
      };
      this.handleDrop();
    }
  }

  handleMove(ev) {
    const { offsetX, offsetY } = ev;
    let x = Math.abs(offsetX - this.x);
    let y = Math.abs(offsetY - this.y);

    const lessRadius = Math.sqrt(x ** 2 + y ** 2) < this.radius;

    if (this.#isGrab) {
      canvas.style.cursor = "grabbing";

      this.#speed = {
        x: offsetX - this.x - this.#offset.x,
        y: offsetY - this.y - this.#offset.y,
      };

      this.x = offsetX - this.#offset.x;
      this.y = offsetY - this.#offset.y;

      return void 0;
    }

    if (lessRadius) {
      this.#isSelect = true;
      canvas.style.cursor = "grab";
    } else {
      this.#isSelect = false;
      canvas.style.cursor = "default";
    }
  }

  handleDrop() {
    if (this.#speed.x === 0 && this.#speed.y === 0) return void cancelAnimationFrame(this.#timer);

    let nextX = this.#speed.x >= 0 ? this.#speed.x - this.#f : this.#speed.x + this.#f;
    if ((nextX >= 0 && this.#speed.x >= 0) || (nextX <= 0 && this.#speed.x <= 0)) {
      if (Math.abs(nextX) <= 0.5) nextX = 0;
    } else {
      nextX = 0;
    }

    this.#speed = {
      x: nextX,
      y: this.#speed.y >= 0 ? this.#speed.y + this.#g - this.#f : this.#speed.y + this.#g + this.#f,
    };
    this.x = this.x + this.#speed.x;
    this.y = this.y + this.#speed.y;

    if (this.y >= this.#height) {
      this.y = this.#height;
      this.#speed.y = -1 * this.#speed.y * 0.75;
    }
    if (this.y <= this.radius) {
      this.y = this.radius;
      this.#speed.y *= -1;
    }
    if (this.x <= this.radius) {
      this.x = this.radius;
      this.#speed.x *= -1;
    }
    if (this.x >= this.#width) {
      this.x = this.#width;
      this.#speed.x = -1 * this.#speed.x * 0.75;
    }

    this.#timer = requestAnimationFrame(this.handleDrop.bind(this));
  }
}
