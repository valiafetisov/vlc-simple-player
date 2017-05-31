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
    if (typeof filePath !== 'string') throwError('please provide path to a file')
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
  },
  get: function (endpoint, cb) {
    request.get('http://:' + vlc.getPassword() + '@localhost:8080' + endpoint, function (err, res, json) {
      if (err) throwError('error accessing web interface')
      try {
        var data = JSON.parse(json)
      } catch (error) {
        throwError(error)
      }
      if (cb) cb(data)
    })
  }
}

process.on('SIGINT', function () {
  if (vlc.quit) vlc.quit()
  process.exit()
})

function setupStatusRequests (interval = 1000) {
  return setInterval(function () {
    vlc.get('/requests/status.json', function (status) {
      if (vlc.callbacks.statuschange) vlc.callbacks.statuschange(status)
    })
  }, interval)
}

function throwError (error) {
  vlc.quit()
  throw new Error('VLC: ' + error.toString())
}

module.exports = vlc
