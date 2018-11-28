'use strict';

class Vector {
  constructor(coordinateX = 0, coordinateY = 0) {
    this.x = coordinateX;
    this.y = coordinateY;
  }

  plus(vector) {
    if (vector instanceof Vector) {
      return new Vector(this.x + vector.x, this.y + vector.y);
    } else {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
  }
  
  times(multiplier) {
    return new Vector(this.x * multiplier, this.y * multiplier);
  }
}


class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
      if (!(pos instanceof Vector && size instanceof Vector && speed instanceof Vector))  {
        throw new Error('Передать можно только объект типа Vector');
      }

      this.pos = pos;
      this.size = size;
      this.speed = speed;
  }

  act() {

  }

  get type() {
    return 'actor';
  }

  get left() {
    return this.pos.x;
  }

  get top() {
    return this.pos.y;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }

  isIntersect(actor) {
    if (!(Actor.prototype.isPrototypeOf(actor))) {
      throw new Error('Передать можно только объект типа Actor');
    }

    if (Object.is(this, actor)) {
      return false;
    }
    
    return this.left < actor.right && this.right > actor.left && this.top < actor.bottom && this.bottom > actor.top ? true: false;
  }

}

