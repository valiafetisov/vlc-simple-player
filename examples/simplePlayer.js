var vlc = require('../app.js')

vlc.play('examples/test.mov')

vlc.on('statuschange', (status) => {
  console.log('timechange', status.time)
})
