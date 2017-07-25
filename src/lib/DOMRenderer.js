/**
 * DOM renderer uses browser and DOM to display game flow, receive input and
 * show helper screens. Implements Basic Renderer's interface.
 * @param {Game}              game      Game instance
 * @param {CSSSelectorString} selector  Mount point selector
 */

import Renderer from './Renderer'

class DOMRenderer extends Renderer {
  root    = undefined
  canvas  = undefined
  splash  = undefined
  walls   = undefined

  head    = undefined
  tail    = undefined
  apple   = undefined

  config = {
    cell: {
      width: 5,
      height: 5,
    },
    canvas: {
      margin: '40px auto',
      position: 'relative',
      fontFamily: 'monospace',
      fontSize: '11px',
    },
    wall: {
      position: 'absolute',
      backgroundColor: 'grey'
    },
    snake: {
      position: 'absolute',
      backgroundColor: 'green'
    },
    apple: {
      position: 'absolute',
      backgroundColor: 'red'
    },
    score: {
      position: 'absolute'
    },
    level: {
      position: 'absolute',
      textAlign: 'right'
    },
    splash: {
      position: 'absolute',
      top: '25%',
      zIndex: 2,
      backgroundColor: 'rgba(255,255,255,.6)',
      textAlign: 'center'
    }
  }

  constructor(game, selector) {
    super(game)

    if(document && document.querySelector && document.querySelector(selector)) {
      this.root = document.querySelector(selector)
    } else {
      console.error('Can\'t mount renderer')
      return false
    }

    this.canvas = this.drawNode('canvas', null, this.game.size)
    this.walls  = this.drawNodeSequence('wall', this.game.walls)

    this.splash = this.drawNode('splash', null, {
      width: this.game.size.width,
      height: 15
    },
      'Game of Snake<br><br>' +
      'Hit ENTER to Start<br>' +
      'Hit &larr;&rarr;&uarr;&darr;to Move<br>' +
      'Hit ENTER to Pause'
    )

    this.root.appendChild(this.canvas)

    document.addEventListener('keydown', this.receiveKey.bind(this))
  }

  /**
   * Re-renders objects that was chenged during previous game tick
   * @param  {Boolean} grow Should snake grow or not
   * @return {Void}
   */
  update(grow) {
    if(grow) {
      this.apple.parentNode.removeChild(this.apple)
      this.apple = this.drawNode('apple', this.game.apple)
      this.score.innerHTML = 'Score: ' + this.game.score
      this.level.innerHTML = 'Level: ' + this.game.level
    } else {
      let tip = this.tail.pop()
      tip.parentNode.removeChild(tip)
    }

    this.tail = [this.head, ...this.tail]
    this.head = this.drawNode('snake', this.game.snake.head)
  }

  /**
   * Renders objects that are related to game start
   * @return {Void}
   */
  start() {
    this.splash.parentNode.removeChild(this.splash)
    if(this.score) this.score.parentNode.removeChild(this.score)
    if(this.level) this.level.parentNode.removeChild(this.level)

    this.head = this.drawNode('snake', this.game.snake.head)
    this.tail = this.drawNodeSequence('snake', this.game.snake.tail)
    this.apple = this.drawNode('apple', this.game.apple)

    this.score = this.drawNode('score', {
      x: 0,
      y: this.game.size.height
    }, {
      width: this.game.size.width,
      height: 4
    }, 'Score: ' + this.game.score)

    this.level = this.drawNode('level', {
      x: 0,
      y: this.game.size.height
    }, {
      width: this.game.size.width,
      height: 4
    }, 'Level: ' + this.game.level)
  }

  /**
   * Renders pause screen
   * @return {Void}
   */
  pause() {
    this.splash.innerHTML = 'Game of Snake<br><br>Paused<br><br>Hit ENTER to Resume'
    this.canvas.appendChild(this.splash)
  }

  /**
   * Removes pause screen
   * @return {Void}
   */
  resume() {
    this.splash.parentNode.removeChild(this.splash)
  }

  /**
   * Deletes snake and apple nodes, shows gameover screen
   * @return {[type]} [description]
   */
  over() {
    this.head.parentNode.removeChild(this.head)
    this.tail.map(chunk => chunk.parentNode.removeChild(chunk))
    this.apple.parentNode.removeChild(this.apple)

    this.splash.innerHTML = 'Game of Snake<br><br>Game Over<br><br>Hit ENTER to Start'
    this.canvas.appendChild(this.splash)
  }

  /**
   * Creates styled div
   * @param  {Object} style Styling rules
   * @return {HTMLDivElement}
   */
  div(style) {
    let node = document.createElement('div')

    if(style) {
      for (var prop in style) {
        node.style[prop] = style[prop];
      }
    }

    return node
  }

  /**
   * Places a node with given params onto canvas
   * @param  {String}     type    Node type to apply styles from config
   * @param  {Object}     coords  {x,y} coords object to place node to
   * @param  {Object}     size    {width,height} dimensions object to apply to node
   * @param  {DOMString}  text    Text or HTML to insert into node
   * @return {HTMLElement}
   */
  drawNode(type, coords, size, text) {
    const node = this.div(this.config[type])
    const multiplier = size || {width: 1, height: 1}

    node.style.width  = multiplier.width * this.config.cell.width + 'px'
    node.style.height = multiplier.height * this.config.cell.height + 'px'

    if(coords) {
      node.style.left = coords.x * this.config.cell.width + 'px'
      node.style.top  = coords.y * this.config.cell.height + 'px'
    }

    if(text) {
      node.innerHTML = text
    }

    if(type !== 'canvas' && this.canvas) {
      this.canvas.appendChild(node)
    }

    return node
  }

  /**
   * Places a set of nodes onto canvas
   * @param  {String} type   Node type to apply styles from config
   * @param  {Array}  source Array of {x,y} coords objects to place nodes to
   * @return {Array} Array of HTMLElements
   */
  drawNodeSequence(type, source) {
    const self = this
    const nodes = []

    source.map(coords => nodes.push(self.drawNode(type, coords)))

    return nodes
  }

  /**
   * Reacts to key press. Should be bound to renderer instance itself.
   * @param  {KeyboardEvent} event
   * @return {Void}
   */
  receiveKey(event) {
    let direction = false

    switch(event.keyCode) {
      case 37:	// left
      case 72:  // H
        direction = 'W'
        break
      case 38:	// up
      case 75:  // K
        direction = 'N'
        break
      case 39:	// right
      case 76:  // L
        direction = 'E'
        break
      case 40:	// down
      case 74:  // J
        direction = 'S'
        break
      case 13:  // Enter
        this.game.isOver
          ? this.game.start()
          : this.game.isPaused
              ? this.game.resume()
              : this.game.pause()
        break
      default:
        direction = false
        break
    }

    if (direction && !this.game.isPaused) this.game.snake.turn(direction)
  }
}

export default DOMRenderer
