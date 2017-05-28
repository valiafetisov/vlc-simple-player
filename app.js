var request = require('request')
var spawn = require('child_process').spawn
var crypto = require('crypto')

var vlcPath = '/Applications/VLC.app/Contents/MacOS/VLC'

var vlc = {
  password: crypto.randomBytes(48).toString('hex'),
  callbacks: {},
  on: function (what, cb) {
    this.callbacks[what] = cb
  },
  play: function (filePath, options) {
    if (typeof filePath !== 'string') throw 'please provide path to a file'
    if (options != null && options.password != null) this.password = options.password
    var defaultParams = ['--fullscreen', '--play-and-stop', '--extraintf', 'http', '--http-password', this.password]
    defaultParams.push(filePath)
    this.player = spawn(vlcPath, defaultParams)
    this.player.on('close', (code) => {
      process.exit()
    })
  },
  getPassword: function () {
    return this.password
  },
  quit: function () {
    if (this.player) this.player.kill('SIGKILL')
  }
}

process.on('SIGINT', function () {
  if (vlc.quit) vlc.quit()
  process.exit()
})

setInterval(function () {
  request.get('http://:' + vlc.getPassword() + '@localhost:8080/requests/status.json', function (err, res, json) {
    if (err) throw 'error accessing web interface'
    var status = JSON.parse(json)
    if (vlc.callbacks.statuschange) vlc.callbacks.statuschange(status)
  })
}, 1000)

module.exports = vlc
