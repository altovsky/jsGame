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
    
    let isRightHand = this.left < actor.right, 
    	isLeftHand = this.right > actor.left,
    	isBelow = this.top < actor.bottom,
    	isAbove = this.bottom > actor.top;

    return isRightHand && isLeftHand && isBelow && isAbove;
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


class LevelParser {
  constructor(objectDictionary) {

    this.dictionary = objectDictionary;
  }

  actorFromSymbol(symb) {
    for (let position in this.dictionary) {
      if (symb === position) {
        return this.dictionary[position];
      }
    }
    return undefined;
  }

  obstacleFromSymbol(symb) {
    if (symb === 'x') {
      return 'wall';
    } else if (symb === '!') {
      return 'lava';
    } else {
      return undefined;
    }
  }

  createGrid(arr) {
    let grid = [];
    arr.forEach((element) => {
      let y = element.split('').map((element) => {
        return this.obstacleFromSymbol(element);
      })
      grid.push(y);
    })
    return grid;
  }

  createActors(arr) {
    let actors = [];
    arr.forEach((element, y) => {
      element.split('').forEach((key, x) => {
        let actorConstructor = this.actorFromSymbol(key);
        if (actorConstructor && (actorConstructor === Actor || actorConstructor.prototype instanceof Actor)) {
          actors.push(new actorConstructor(new Vector(x, y)));
        }
      })
    })
    return actors;
  }

  parse(arr) {
    return new Level(this.createGrid(arr), this.createActors(arr));
  }
}


class Fireball extends Actor {
  constructor(position = new Vector(0, 0), speed = new Vector(0, 0)) {
    super();

    this.pos = position;
    this.speed = speed;
    this.size = new Vector(1, 1);
 
  }
  
  get type() {
    return 'fireball';
  }

  getNextX(time) {
    return this.pos.x + this.speed.x * time;
  }

  getNextY(time) {
    return this.pos.y + this.speed.y * time;
  }

  getNextPosition(time = 1) {
    return new Vector(this.getNextX(time), this.getNextY(time));
  }

  handleObstacle() {
    this.speed.x = -this.speed.x;
    this.speed.y = -this.speed.y;
  }

  act(time, level) {
    let isObstacle = level.obstacleAt(this.getNextPosition(time), this.size);
    if(!isObstacle) {
      this.pos.x = this.getNextX(time);
      this.pos.y = this.getNextY(time);
    } else {
      this.handleObstacle();
    }
  }

}


class HorizontalFireball extends Fireball {
  constructor(initPosition) {
    super(initPosition);
    
    this.speed = new Vector(2, 0);
  }
}


class VerticalFireball extends Fireball {
  constructor(initPosition) {
    super(initPosition);

    this.speed = new Vector(0, 2);
  }
}


class FireRain extends Fireball {
  constructor(initPosition) {
    super(initPosition);

    this.speed = new Vector(0, 3);
    this.reset = initPosition;
  }

  handleObstacle() {
    this.pos = this.reset;
  }
}


class Coin extends Actor {
  constructor(initPosition) {
    super(initPosition);

    this.size = new Vector(0.6, 0.6);
    this.pos = this.pos.plus(new Vector(0.2, 0.1));
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random(0, 2 * Math.PI);
    this.reset = new Vector(this.pos.x, this.pos.y);
  }

  get type() {
      return 'coin';
  	}

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    let newVector = this.reset.plus(this.getSpringVector());
    return new Vector(newVector.x, newVector.y);
  }

  act(time) {
    let newPosition = this.getNextPosition(time);
    this.pos.x = newPosition.x;
    this.pos.y = newPosition.y;
  }
}


class Player extends Actor {
  constructor(initPosition) {
    super(initPosition);

    this.size = new Vector(0.8, 1.5);
    this.pos = this.pos.plus(new Vector(0, -0.5))
    this.speed = new Vector(0, 0);
  }
  
  get type() {
      return 'player';
  	}
}


//////////////////////
const schemas = [
  [
    '            ',
    '     |      ',
    '            ',
    '            ',
    '       =    ',
    '          o ',
    '        !xxx',
    ' @          ',
    'xxx!        ',
    '            '
  ],
  [
    '         v    ',
    '       v      ',
    '     v        ',
    '   o       o  ',
    '           x  ',
    '@      x      ',
    'x      o      ',
    '           o  ',
    '       o     x',
    'o      x      ',
    'x             ',
    '              '
  ]
];
const actorDict = {
  '@': Player,
  'v': FireRain,
  'o': Coin,
  '=': HorizontalFireball,
  '|': VerticalFireball, 

}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => console.log('Вы выиграли приз!'));
