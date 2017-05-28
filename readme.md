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
  - `options` – object with additional options
    - `{password: 'string'}` will set a custom password for the HTTP interface (instead of random)
- `vlc.quit()` – stops the movie and close player (via SIGKILL)
- `vlc.getPassword()` – returns a string of a random generated password for the HTTP interface
