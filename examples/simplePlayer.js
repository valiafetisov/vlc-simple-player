var vlc = require('../app.js')

vlc.play('examples/test.mov')

vlc.on('statuschange', (error, status) => {
  if (error) return console.error(error)

  console.log('timechange', status.time)

  if (status.time === 3) {
    vlc.request('/requests/status.json?command=pl_pause')
  }
})
