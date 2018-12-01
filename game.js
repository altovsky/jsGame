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
    
    return this.left < actor.right && this.right > actor.left && this.top < actor.bottom && this.bottom > actor.top;
  }

}


class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    actors.some((actor) => {
      if (actor.type === 'player') {
        this.player = actor;
        return true;
      }
    })
    this.status = null;
    this.height = this.grid.length;
    this.width = this.grid.reduce((maxLength, element) => {
      return maxLength < element.length ? element.length: maxLength;
    }, 0);
    this.finishDelay = 1;
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }

  actorAt(actor) {
    if (!(actor) || (!(actor instanceof Actor))) {
      throw new Error('Не передан аргумент или передан не объект Actor')
    }
    return this.actors.find((element) => {
      return actor.isIntersect(element);
    })
  }

  obstacleAt(place, size) {
    if (!(place instanceof Vector && size instanceof Vector)) {
      throw new Error('Переданы аргументы, которые не являются объектами Vector');
    }

    let check = new Actor(place, size);
    if (check.bottom > this.height) {
      return 'lava';
    } else if (check.top < 0 || check.left < 0 || check.right > this.width) {
      return 'wall';
    } else {
      for (let y = Math.floor(check.top); y < check.bottom; ++y) {
        for (let x = Math.floor(check.left); x < check.right; ++x) {
          if (this.grid[y][x] !== undefined) {
            return this.grid[y][x];
          }
        }
      }
    }
  }

  removeActor(actor) {
    this.actors.forEach((element, index) => {
      if (actor === element) {
        this.actors.splice(index, 1);
      }
    })
  }

  noMoreActors(actorType) {
    return (!(this.actors.some((element) => {
      return element.type === actorType;
    })))
  }

  playerTouched(objectType, actor) {
    if (this.status !== null) {
      return;
    }

    if (objectType === 'lava' || objectType === 'fireball') {
      this.status = 'lost';
    } else if (objectType === 'coin') {
      this.removeActor(actor);
      if (this.noMoreActors(objectType)) {
        this.status = 'won';
      }
    } 
  }
}
