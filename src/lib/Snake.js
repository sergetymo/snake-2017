/**
 * Snake class instance holds information about snake and modifies it
 * @param {Number}  x           X coord to place snake head to
 * @param {Number}  y           Y coord to place snake head to
 * @param {String}  direction   Starting direction, either N(orth), S(outh), W(est) or E(ast)
 * @param {Number}  length      Starting snake size
 */

class Snake {
  length = 3
  direction = 'N'
  head = {}
  tail = []

  constructor(x, y, direction, length) {
    this.head = {x: x, y: y}

    direction && /^[NESW]$/.test(direction)
      ? this.direction = direction
      : null

    length && length > this.length
      ? this.length = length
      : null

    this.tail = this.placeTail()
  }

  /**
   * Creates an array of points that represents snake tail
   * @return {Array} Array of {x,y} coords objects
   */
  placeTail() {
    let tail = []

    if (this.head.x && this.head.y) {
      for (let l = 1; l < this.length; l++) {
        switch(this.direction) {
          case 'N':
            tail.push({
              x: this.head.x,
              y: this.head.y + l
            })
            break
          case 'S':
            tail.push({
              x: this.head.x,
              y: this.head.y - l
            })
            break
          case 'W':
            tail.push({
              x: this.head.x + l,
              y: this.head.y
            })
            break
          case 'E':
            tail.push({
              x: this.head.x - l,
              y: this.head.y
            })
            break
        }
      }
    } else {
      console.error('Can\t place tail, no head specified')
      return false
    }

    return tail
  }

  /**
   * Changes snake's facing direction
   * @param  {String} direction Direction letter, either N, S, W or E
   * @return {Void}
   */
  turn(direction = '') {
    if(/^[NESW]$/.test(direction)) {
      this.direction = direction
    } else {
      console.error('Wrong direction: ', direction);
      return false
    }
  }

  /**
   * Moves snake in direction
   * @param  {Boolean} grow Should snake grow or not
   * @return {Void}
   */
  move(grow = false) {
    if(grow) {
      this.tail = [this.head, ...this.tail]
    } else {
      this.tail = [this.head, ...this.tail.slice(0, -1)]
    }

    this.head = this.tongue
  }

  /**
   * Calculates coords of point on which snake is now facing
   * @return {Object} {x,y} coords object
   */
  get tongue() {
    let tongue

    switch(this.direction) {
      case 'N':
        tongue = {
          x: this.head.x,
          y: this.head.y - 1
        }
        break
      case 'S':
        tongue = {
          x: this.head.x,
          y: this.head.y + 1
        }
        break
      case 'W':
        tongue = {
          x: this.head.x - 1,
          y: this.head.y
        }
        break
      case 'E':
        tongue = {
          x: this.head.x + 1,
          y: this.head.y
        }
        break
      default:
        console.error('Can\t calculate tongue coordinates, wrong direction')
        tongue = false
        break
    }

    return tongue
  }
}

export default Snake
