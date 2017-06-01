var VLC = require('../app.js')

var player = new VLC('examples/test.mov')

player.on('statuschange', (error, status) => {
  if (error) return console.error(error)

  console.log('timechange', status.time)

  if (status.time === 3) {
    player.request('/requests/status.json?command=pl_pause', () => {})
  }
})
