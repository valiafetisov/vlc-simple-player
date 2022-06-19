var request = require('request')
var spawn = require('child_process').spawn
var crypto = require('crypto')
var getVlcСommand = require('vlc-command')

var defaultArguments = [
  '--fullscreen',
  '--loop',
  '--no-video-title'
]

var players = []

class vlc {
  constructor (filePath, options) {
    if (typeof filePath !== 'string') this._throwError('please provide path to a file')

    if (options != null && options.password != null) {
      this._password = options.password
    } else {
      this._password = crypto.randomBytes(48).toString('hex')
    }

    if (options != null && options.port != null) {
      this._port = options.port.toString()
    } else {
      this._port = 8080 + players.length
    }

    if (options != null && options.arguments != null) {
      this._arguments = options.arguments
    } else {
      this._arguments = defaultArguments
    }

    this._callbacks = {}

    var args = [].concat(this._arguments, [
      '--extraintf', 'http',
      '--http-password', this._password,
      '--http-port', this._port,
      filePath
    ])

    getVlcСommand((err, vlcPath) => {
      if (err) this._throwError(err)

      this.process = spawn(vlcPath, args)

      this._setupStatusRequests()

      this.process.on('close', (code) => {
        this.process.exit()
      })

      this.process.stderr.on('data', (data) => {
        if (this._callbacks.error) this._callbacks.error(data.toString())
      })
    })

    players.push(this)
  }

  on (what, cb) {
    if (typeof cb !== 'function') {
      this._throwError(`please provide a callback function for the '${what}' event`)
    }
    this._callbacks[what] = cb
  }

  request (endpoint, cb) {
    if (typeof endpoint !== 'string') this._throwError('please provide a path to vlc.request')
    if (typeof cb !== 'function') this._throwError('please provide a callback function to vlc.request')
    var url = 'http://:' + this.getPassword() + '@localhost:' + this._port + endpoint
    request.get(url, function (err, res, json) {
      if (err) return cb(err)
      try {
        var data = JSON.parse(json)
      } catch (error) {
        cb(error, json)
      }
      cb(null, data)
    })
  }

  _setupStatusRequests (interval = 300) {
    this._interval = setInterval(() => {
      if (typeof this._callbacks.statuschange !== 'function') return
      this.request('/requests/status.json', (error, status) => {
        if (error) this._callbacks.statuschange(error, status)
        if (typeof status === 'undefined' || status.time == null) {
          return this._callbacks.statuschange('unexpected HTTP request error')
        }
        if (this._previousTime === status.time) return
        if (this._callbacks.statuschange) this._callbacks.statuschange(error, status)
        this._previousTime = status.time
      })
    }, interval)
  }

  getPassword () {
    return this._password
  }

  quit () {
    if (this.process) this.process.kill('SIGKILL')
  }

  _throwError (error) {
    this.quit()
    throw new Error('VLC: ' + error.toString())
  }
}

process.on('SIGINT', function () {
  players.forEach(player => player.quit())
  process.exit()
})

module.exports = vlc
