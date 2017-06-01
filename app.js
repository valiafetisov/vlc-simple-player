var request = require('request')
var spawn = require('child_process').spawn
var crypto = require('crypto')
var getVlcСommand = require('vlc-command')

var vlc = {
  port: 8080,
  password: crypto.randomBytes(48).toString('hex'),
  callbacks: {},
  on: function (what, cb) {
    if (typeof cb !== 'function') {
      throwError(`please provide a callback function for the '${what}' event`)
    }
    this.callbacks[what] = cb
  },
  play: function (filePath, options) {
    if (typeof filePath !== 'string') throwError('please provide path to a file')
    if (options != null && options.password != null) this.password = options.password
    if (options != null && options.port != null) this.port = options.port.toString()
    var defaultParams = [
      '--fullscreen',
      '--loop',
      '--no-video-title',
      '--extraintf', 'http',
      '--http-password', this.password,
      '--http-port', this.port,
      filePath
    ]
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
  request: function (endpoint, cb) {
    request.get('http://:' + vlc.getPassword() + '@localhost:' + vlc.port + endpoint, function (err, res, json) {
      if (err && cb) return cb(err)
      try {
        var data = JSON.parse(json)
      } catch (error) {
        if (cb) return cb(error)
      }
      if (cb) cb(null, data)
    })
  }
}

process.on('SIGINT', function () {
  if (vlc.quit) vlc.quit()
  process.exit()
})

var previousTime = null
function setupStatusRequests (interval = 300) {
  if (typeof vlc.callbacks.statuschange !== 'function') {
    throwError('please provide a callback to the statuschange event')
  }
  return setInterval(function () {
    vlc.request('/requests/status.json', function (error, status) {
      if (error) vlc.callbacks.statuschange(error)
      if (typeof status === 'undefined' || status.time == null) {
        return vlc.callbacks.statuschange('unexpected HTTP request error')
      }
      if (previousTime === status.time) return
      vlc.callbacks.statuschange(error, status)
      previousTime = status.time
    })
  }, interval)
}

function throwError (error) {
  vlc.quit()
  throw new Error('VLC: ' + error.toString())
}

module.exports = vlc
