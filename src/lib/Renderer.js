/**
 * Basic renderer. Connects itself to the game instance.
 * @param {Game} game Game instance
 */

class Renderer {
  game = undefined

  constructor(game) {
    this.game = game
    this.game.renderer = this
  }

  update() {
    console.error('You should implement `update` method for your renderer')
  }

  start() {
    console.error('You should implement `start` method for your renderer')
  }

  pause() {
    console.error('You should implement `pause` method for your renderer')
  }

  resume() {
    console.error('You should implement `resume` method for your renderer')
  }

  over() {
    console.error('You should implement `over` method for your renderer')
  }
}

export default Renderer
