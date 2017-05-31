var request = require('request')
var spawn = require('child_process').spawn
var crypto = require('crypto')
var getVlcСommand = require('vlc-command')

var vlc = {
  password: crypto.randomBytes(48).toString('hex'),
  callbacks: {},
  on: function (what, cb) {
    this.callbacks[what] = cb
  },
  play: function (filePath, options) {
    if (typeof filePath !== 'string') throw new Error('please provide path to a file')
    if (options != null && options.password != null) this.password = options.password
    var defaultParams = ['--fullscreen', '--loop', '--no-video-title', '--extraintf', 'http', '--http-password', this.password]
    defaultParams.push(filePath)
    getVlcСommand(function (err, vlcPath) {
      if (err) return console.error(err)
      vlc.player = spawn(vlcPath, defaultParams)
      setupStatusRequests()
      vlc.player.on('close', (code) => {
        process.exit()
      })
      vlc.player.stderr.on('data', (data) => {
        if (vlc.callbacks.error) vlc.callbacks.error(data.toString())
      })
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

function setupStatusRequests (interval = 1000) {
  return setInterval(function () {
    request.get('http://:' + vlc.getPassword() + '@localhost:8080/requests/status.json', function (err, res, json) {
      if (err) throw new Error('error accessing web interface')
      var status = JSON.parse(json)
      if (vlc.callbacks.statuschange) vlc.callbacks.statuschange(status)
    })
  }, interval)
}

module.exports = vlc
