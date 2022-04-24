let fs = require('fs')
let chalk = require('chalk')

global.owner = ['62887436568613']
global.mods = []
global.prems = []

global.APIs = {
  // name: 'https://website'
  sekhaAPI: 'https://yourclown.eu.org',
  sekhaAPIs: 'https://sekha.tech'
}

global.APIKeys = { // APIKey Here
  // 'https://website': 'apikey'
  'https://yourclown.eu.org': 'apirey',
  'https://sekha.tech': 'apirey'
}

// Sticker WM

const spack = fs.readFileSync("lib/exif.json")
const stickerpack = JSON.parse(spack)
if (stickerpack.spackname == '') {
  var sticker_name = 'Sticker by'
  var sticker_author = 'ランダムボット'
} else {
  var sticker_name = stickerpack.spackname
  var sticker_author = stickerpack.sauthor
}

const file_exif = "lib/exif.json"
fs.watchFile(file_exif, () => {
  fs.unwatchFile(file_exif)
  console.log(chalk.redBright("Update 'exif.json'"))
  delete require.cache[file_exif]
  require('./lib/exif.json')
})

global.packname = sticker_name
global.author = sticker_author

global.wait = 'please wait'
global.multiplier = 69
//global.cecan = 'https://sekha.me/api/wallpaper/ukhty?apikey='

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  delete require.cache[file]
  require(file)
})
