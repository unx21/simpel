let fs = require('fs')
let path = require('path')
let levelling = require('../lib/levelling')
//let galau = ('global.galau')
let tags = {
  'sticker': 'S T I C K E R',
  'ptl': 'T I M E L I N E',
  'media': 'M E D I A',
  'fun': 'F U N N Y',
  'premium': 'P R E M I U M',
  'group': 'G R O U P',
  'info': 'I N F O R M A T I O N',
  'shop': 'L I M I T - E X P',
  'game': 'G A M E S',
  'tools': 'T O O L S',
  'owner': 'O W N E R'

}
const defaultMenu = {
  before: `
 Hai, 👋 %name! have a nice day!



    ~ 𝒀𝒐𝒖𝒓 𝑰𝒏𝒇𝒐𝒓𝒎𝒂𝒕𝒊𝒐𝒏 ~


 ⭔  limit: *%limit Limit*
 ⭔  Role: *%role*
 ⭔  Level: *%level*
 ⭔  Exp: %totalexp XP




    ~ 𝑫𝒂𝒚 𝒂𝒏𝒅 𝑻𝒊𝒎𝒆 ~


 ⭔  Tanggal: *%week %weton, %date*
 ⭔  Tanggal Islam: *%dateIslamic*
 ⭔  Waktu: *%time*
 ⭔  Uptime: *%uptime (%muptime)*
 ⭔  Database: %rtotalreg of %totalreg




  𝑺𝒊𝒎𝒑𝒍𝒆 𝑾𝒉𝒂𝒕𝒔𝒂𝒑𝒑 𝑩𝒐𝒕 𝑩𝒚 𝑺𝒆𝒌𝒉𝒂 ❤️



_-_-_-_-_-_-_-_-_-_-_-_-_-_


`.trimStart(),
  header: '  ❏  *%category*\n   ',
  body:   '      ◦   %cmd\n\n   ',
  footer: '\n\n',
  after: `
`,
}
let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    let package = JSON.parse(await fs.promises.readFile(path.join(__dirname, '../package.json')).catch(_ => '{}'))
    let { exp, limit, level, role } = global.db.data.users[m.sender]
    let { min, xp, max } = levelling.xpRange(level, global.multiplier)
    let name = conn.getName(m.sender)
    let d = new Date(new Date + 3600000)
    let locale = 'id'
    // d.getTimeZoneOffset()
    // Offset -420 is 18.00
    // Offset    0 is  0.00
    // Offset  420 is  7.00
    let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d)
    let time = d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    })
    let _uptime = process.uptime() * 1000
    let _muptime
    if (process.send) {
      process.send('uptime')
      _muptime = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }
    let muptime = clockString(_muptime)
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length
    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.tags) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
        enabled: !plugin.disabled,
      }
    })
    for (let plugin of help)
      if (plugin && 'tags' in plugin)
        for (let tag of plugin.tags)
          if (!(tag in tags) && tag) tags[tag] = tag
    conn.menu = conn.menu ? conn.menu : {}
    let before = conn.menu.before || defaultMenu.before
    let header = conn.menu.header || defaultMenu.header
    let body = conn.menu.body || defaultMenu.body
    let footer = conn.menu.footer || defaultMenu.footer
    let after = conn.menu.after || (conn.user.jid == global.conn.user.jid ? '' : `Powered by https://wa.me/${global.conn.user.jid.split`@`[0]}`) + defaultMenu.after
    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        return header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return body.replace(/%cmd/g, menu.prefix ? help : '%p' + help)
                .replace(/%islimit/g, menu.limit ? '(Limit)' : '')
                .replace(/%isPremium/g, menu.premium ? '(Premium)' : '')
                .trim()
            }).join('\n')
          }),
          footer
        ].join('\n')
      }),
      after
    ].join('\n')
    text = typeof conn.menu == 'string' ? conn.menu : typeof conn.menu == 'object' ? _text : ''
    let replace = {
      '%': '%',
      p: _p, uptime, muptime,
      me: conn.user.name,
      npmname: package.name,
      npmdesc: package.description,
      version: package.version,
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      github: package.homepage ? package.homepage.url || package.homepage : '[unknown github url]',
      level, limit, name, weton, week, date, dateIslamic, time, totalreg, rtotalreg, role,
      readmore: readMore
    }
    text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])
    function _0x5885(_0x19af5b,_0xbcf7d1){var _0x3b4617=_0x3b46();return _0x5885=function(_0x5885fe,_0x671abb){_0x5885fe=_0x5885fe-0xf0;var _0x41ac09=_0x3b4617[_0x5885fe];return _0x41ac09;},_0x5885(_0x19af5b,_0xbcf7d1);}var _0x1041aa=_0x5885;(function(_0x2f23b4,_0x326084){var _0x2cd378=_0x5885,_0x23eb95=_0x2f23b4();while(!![]){try{var _0x7480b6=parseInt(_0x2cd378(0xfb))/0x1+-parseInt(_0x2cd378(0xf3))/0x2+-parseInt(_0x2cd378(0xf4))/0x3+-parseInt(_0x2cd378(0x100))/0x4*(-parseInt(_0x2cd378(0xf5))/0x5)+parseInt(_0x2cd378(0xf7))/0x6*(-parseInt(_0x2cd378(0xfe))/0x7)+-parseInt(_0x2cd378(0xff))/0x8+parseInt(_0x2cd378(0xf0))/0x9*(parseInt(_0x2cd378(0xf2))/0xa);if(_0x7480b6===_0x326084)break;else _0x23eb95['push'](_0x23eb95['shift']());}catch(_0x4da963){_0x23eb95['push'](_0x23eb95['shift']());}}}(_0x3b46,0x61c62),await conn[_0x1041aa(0xfa)](m[_0x1041aa(0xfc)],text[_0x1041aa(0xf9)](),_0x1041aa(0xf1),_0x1041aa(0x101),_0x1041aa(0xf8),_0x1041aa(0xfd),_0x1041aa(0xf6),m));function _0x3b46(){var _0x1b504c=['2438128iqbPMJ','596BzUWAR','owner','9oRylww','\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20𝚂\x20𝙲\x20𝙾\x20𝙳\x20𝙴\x20𝚁\x20𝚂\x20💫\x0a\x0a\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20www.studycoders.site\x0a\x0a\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20𝑩𝒚\x20𝑷𝒖𝒓𝒘𝒐𝒅𝒂𝒅𝒊\x20𝒌𝒐𝒕𝒂\x20𝒔𝒘𝒆𝒌𝒆\x20🐸\x20\x20\x20\x20','8418740pFraIh','400322bqqZvV','935967QpNULb','18125naHqDu','.donasi','2210046XYSZxY','.owner','trim','send2Button','203740biaIsj','chat','donasi','7pjzWNn'];_0x3b46=function(){return _0x1b504c;};return _0x3b46();}
    //conn.reply(m.chat, text.trim(), m)
  } catch (e) {
    conn.reply(m.chat, 'Maaf, menu sedang error', m)
    throw e
  }
}

//handler.customPrefix = /Menu|menu|help|Help/
//handler.command = new RegExp
handler.help = ['menu', 'help', '?']
handler.command = /^(menu|help|\?)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null
handler.exp = 3

module.exports = handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
