// 监听 nginx.conf 文件变化，自动重启 nginx
import chokidar from 'chokidar'
import { exec } from 'child_process'

const watcher = chokidar.watch('/opt/homebrew/etc/nginx/nginx.conf', {
  // ignored: /(^|[\/\\])\../, // 忽略以 . 开头的文件
  // persistent: true, // 持续监听
  // cwd: '.', // 表示当前目录
  // depth: 0, // 只监听当前目录不包括子目录
})

console.log('🤖🤖🤖 正在检测 nginx.conf 文件变化')
watcher.on('change', (path) => {
  console.log(`File ${path} has been changed`)
  // 重启 nginx
  exec('nginx -s reload', (error, stdout, stderr) => {
    if (error) {
      console.log('请检查 nginx.conf 文件是否有语法错误，或者 nginx 是否已经启动')
      console.error(`exec error: ${error}`)
      return
    }
    console.log(`nginx 重启成功`)
  })
})

// https://zhuanlan.zhihu.com/p/300008644

// import fs from 'fs'
// import { exec } from 'child_process'
// import crypto from 'crypto'

// const nginxConfPath = '/opt/homebrew/etc/nginx/nginx.conf'
// const nginxConf = fs.readFileSync(nginxConfPath, 'utf8')

// // 生成 hash 值
// const hash = md5(nginxConf)

// function md5(str) {
//   return crypto.createHash('md5').update(str).digest('hex')
// }

// console.log('🤖🤖🤖 正在检测 nginx.conf 文件变化')

// fs.watchFile(nginxConfPath, (curr, prev) => {
//   curr = fs.readFileSync(nginxConfPath, 'utf8')
//   if (md5(curr) !== hash) {
//     exec('nginx -s reload', (err, stdout, stderr) => {
//       if (err) {
//         console.log('请检查 nginx.conf 文件是否有语法错误，或者 nginx 是否已经启动')
//         console.log(err)
//         return
//       }
//       console.log('nginx reload success')
//     })
//   }
// })
