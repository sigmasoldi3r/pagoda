import { Application, Sprite } from 'pixi.js'
import spr from './assets/tile32-water.png'
import { ui } from './Ui'

const size = document.body.getBoundingClientRect()
const app = new Application({
  width: size.width,
  height: size.height,
})

document.body.appendChild(app.view)

app.loader.add('spr', spr).load((loader, res) => {
  const lg = new Sprite(res.spr.texture)
  lg.x = app.renderer.width / 2
  lg.y = app.renderer.height / 2
  lg.anchor.x = 0.5
  lg.anchor.y = 0.5
  app.stage.addChild(lg)
  let rot = 0.01
  ui.on('click', () => {
    rot = -rot
  })
  app.ticker.add(() => {
    lg.rotation += rot
  })
})
