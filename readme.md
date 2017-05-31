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
vlc.on('statuschange', (status) => {
  console.log('current time', status.time)
})
```

## Available methods

- `vlc.play(path[, options])` – starts a VLC player in fullscreen
  - `path` – string path to the video file `./test.mov`
  - `options` – object with _additional_ options
    - `{password: String}` will set a custom password for the HTTP interface (instead of random)
    - `{port: Number}` will set a custom port for the HTTP interface (instead of random)
- `vlc.quit()` – stops the movie and close player (via SIGKILL)
- `vlc.getPassword()` – returns a string of a random generated password for the HTTP interface
- `vlc.on(eventName, callback)`
  - `eventName` – string, available options are
    - `'error'` – stderr callback with error as an argument
    - `'statuschange'` – callback with vlc status object as an argument
- `vlc.get(path, callback)` - and exposed request method to the VLC HTTP interface
  - `path` – a string, HTTP GET path. with response in JSON format. example:
    - `'/requests/status.json?command=pl_pause'` – toogle a pause
    [full list of commands and documentation](https://wiki.videolan.org/VLC_HTTP_requests/)

[Spawned process](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) is also exposed as `vlc.player`.
