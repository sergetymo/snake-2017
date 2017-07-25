import Game from './lib/Game.js'
import DOMRenderer from './lib/DOMRenderer.js'

let game = new Game(50, 50)
let renderer = new DOMRenderer(game, '#root')
