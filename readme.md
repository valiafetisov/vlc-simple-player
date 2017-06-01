# VLC simple player

Simple module that starts VLC player via command-line together with HTTP interface enabled.
It's provide a unified API to start playing a file and to get information about current track.

## Install

```shell
npm install vlc-simple-player --save
```
(Please note you'll need VLC binary installed in your system, you can download it [here](http://www.videolan.org/vlc/#download))

## Example usage

```javascript
var vlc = require('vlc-simple-player')

// start a fullscreen player
vlc.play('./path-to-your-movie/test.mp4')

// log current track time every second
vlc.on('statuschange', (error, status) => {
  console.log('current time', status.time)
})
```

## Available methods

- `vlc.play(path[, options])` – starts a VLC player in fullscreen
  - `path` – string path to the video file `./test.mov`
  - `options` – object with _additional_ options
    - `{password: String}` will set a custom password for the HTTP interface (instead of random, which can be accessed by `vlc.getPassword()` method, btw)
    - `{port: Number}` will set a custom port for the HTTP interface (instead of default 8080)
- `vlc.on(eventName, callback)` - registers an event
  - `eventName` – a string, available options are:
    - `'error'` – stderr callback with error as an argument
    - `'statuschange'` – callback that fires every second if the movie is playing
  - `callback` – a function with error and status object as an arguments
- `vlc.request(path, callback)` - exposed request method to the VLC HTTP interface
  - `path` – a string, HTTP GET path with response in JSON format. For example:
    `vlc.request('/requests/status.json?command=pl_pause')` – toggles a pause.
    [list of HTTP requests and interface description](https://wiki.videolan.org/VLC_HTTP_requests/)
  - `callback` – a function with error and status object as an arguments
- `vlc.quit()` – stops the movie and close the player (via SIGKILL)

[Spawned process](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) is also exposed as `vlc.player`.

## Contribution

Please feel free to submit a pull request for a bug fix or new features
