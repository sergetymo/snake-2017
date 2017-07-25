/**
 * Game class instance holds information about game state, objects position and
 * moving speed. Requires a proper renderer to function.
 * @param {Number} width Board width
 * @param {Number} height Board height
 */

import Snake from './Snake.js'

class Game {
  size      = {width: 52, height: 52}
  score     = 0
  level     = 1

  walls     = []
  snake     = undefined
  apple     = undefined

  timer     = undefined
  isPaused  = false
  isOver    = true

  renderer  = undefined

  constructor(width, height) {
    if (width && height) this.size = {width: width + 2, height: height + 2}
    this.walls = this.placeWalls()
  }

  /**
   * Creates walls around the border
   * @return {Array} Array of {x,y} coords objects
   */
  placeWalls() {
    let walls = []

    for(let x = 0; x < this.size.width; x++) {
      let bricks = []
      if(x === 0 || x === this.size.width - 1) {
        // Creating full-height vertical walls
        for(let y = 0; y < this.size.height; y++) {
          bricks.push({
            x: x,
            y: y
          })
        }
      } else {
        // Creating only top and bottom bricks
        bricks = [
          {x: x, y: 0},
          {x: x, y: this.size.height - 1}
        ]
      }
      walls = [...walls, ...bricks]
    }

    return walls
  }

  /**
   * Creates snake of a given size
   * @param  {Number} length Snake size
   * @return {Snake} Snake instance
   */
  placeSnake(length) {
    const snakeLength = length || 3
    const snakeWidth = 1
    const wallThickness = 1

    // Leaving some free space around snake
    const buffer = { along: 2, across: 1 }

    const directions = ['N', 'S', 'W', 'E']
    const direction = directions[Math.floor((Math.random() * directions.length))]

    let x, y, minX, minY, maxX, maxY

    if (direction === 'N' || direction === 'S') {
      if (
        this.size.height - wallThickness * 2 - snakeLength < buffer.along * 2 ||
        this.size.width - wallThickness * 2 - snakeWidth < buffer.across * 2
      ) {
        console.error('Not enough space to place snake', direction)
        return false
      }

      minX = wallThickness + buffer.across
      maxX = this.size.width - wallThickness * 2 - buffer.across

      if (direction === 'N') {
        minY = wallThickness + buffer.along
        maxY = this.size.height - wallThickness - snakeLength - buffer.along
      }
      if (direction === 'S') {
        minY = snakeLength + buffer.along
        maxY = this.size.height - wallThickness * 2 - buffer.along
      }
    }

    if (direction === 'W' || direction === 'E') {
      if (
        this.size.height - wallThickness * 2 - snakeWidth < buffer.across * 2 ||
        this.size.width - wallThickness * 2 - snakeLength < buffer.along * 2
      ) {
        console.error('Not enough space to place snake', direction)
        return false
      }

      minY = wallThickness + buffer.across
      maxY = this.size.height - wallThickness * 2 - buffer.across

      if (direction === 'W') {
        minX = wallThickness + buffer.along
        maxX = this.size.width - wallThickness - snakeLength - buffer.along
      }
      if (direction === 'E') {
        minX = snakeLength + buffer.along
        maxX = this.size.width - wallThickness * 2 - buffer.along
      }
    }

    x = Math.floor(Math.random() * (maxX - minX + 1)) + minX
    y = Math.floor(Math.random() * (maxY - minY + 1)) + minY

    return new Snake(x, y, direction, length)
  }

  /**
   * Creates random point within board's borders
   * @return {Object} An {x,y} coords object
   */
  randomPoint() {
    let minX = 1
    let maxX = this.size.width - 2
    let minY = 1
    let maxY = this.size.height - 2
    return {
      x: Math.floor(Math.random() * (maxX - minX + 1)) + minX,
      y: Math.floor(Math.random() * (maxY - minY + 1)) + minY
    }
  }

  /**
   * Creates apple object and ensures it's not colliding with environment
   * @return {Object} And {x,y} coords object
   */
  placeApple() {
    let apple
    let conflict = true

    while(conflict) {
      apple = this.randomPoint()
      if(
        (apple.x === this.snake.head.x && apple.y === this.snake.head.y) ||
        this.snake.tail.filter(p => p.x === apple.x && p.y === apple.y).length > 0
      ) {
        conflict = true
      } else {
        conflict = false
      }
    }

    return apple
  }

  /**
   * Detects if snake will crash on next tick
   * @return {Boolean}
   */
  get willCrash() {
    return (
      this.walls.filter(wall =>
        wall.x === this.snake.tongue.x && wall.y === this.snake.tongue.y
      ).length > 0 ||
      this.snake.tail.filter(chunk =>
        chunk.x === this.snake.tongue.x && chunk.y === this.snake.tongue.y
      ).length > 0
    )
  }

  /**
   * Detects if snake wil eat apple on next tick
   * @return {Boolean}
   */
  get willScore() {
    return this.snake.tongue.x === this.apple.x && this.snake.tongue.y === this.apple.y
  }

  /**
   * Calculates snake's moving speed
   * @return {Number} Milliseconds to wait until next tick
   */
  get timeout() {
    let baseTimeout = 340
    return baseTimeout - this.level * 8
  }

  /**
   * Performs game tick
   * @return {Void|Boolean}
   */
  tick() {
    let grow = false

    if(this.willCrash) {
      this.over()
      return false;
    }

    if(this.willScore) {
      grow = true
      this.score += this.level
      this.level++
      this.apple = this.placeApple()
    }

    this.snake.move(grow)

    this.renderer.update(grow)

    this.timer = setTimeout(this.tick.bind(this), this.timeout)
  }

  /**
   * Starts the game
   * @return {Void}
   */
  start() {
    this.isOver = false
    this.snake = this.placeSnake()
    this.apple = this.placeApple()

    this.renderer.start()

    this.timer = setTimeout(this.tick.bind(this), this.timeout)
  }

  /**
   * Pauses the game
   * @return {Void}
   */
  pause() {
    this.isPaused = true

    this.renderer.pause()
    clearTimeout(this.timer)
  }

  /**
   * Resumes the game
   * @return {Void}
   */
  resume() {
    this.isPaused = false

    this.renderer.resume()
    this.timer = setTimeout(this.tick.bind(this), this.timeout)
  }

  /**
   * Finishes the game
   * @return {Void}
   */
  over() {
    this.isOver = true
    this.score = 0
    this.level = 1

    this.renderer.over()
    clearTimeout(this.timer)
  }
}

export default Game
