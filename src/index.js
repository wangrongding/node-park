import http from 'http'
import express from 'express'
import { getChatGPTReply } from './chatgpt/index.js'
import chalk from 'chalk'
// import cors from 'cors'

const port = 3000
const app = express()
const httpServer = http.createServer(app)
//设置跨域访问
app.all('*', (req, res, next) => {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header('Access-Control-Allow-Origin', '*')
  //允许的header类型
  res.header('Access-Control-Allow-Headers', 'content-type')
  //跨域允许的请求方式
  res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS')
  //让options尝试请求快速结束
  if (req.method.toLowerCase() == 'options') res.send(200)
  else next()
})
// 或者用这种，解决了所有请求头和方式设置的繁琐问题,要携带cookie时，这种方式不适合
// app.use(cors());

// 随便写一个接口测试一下
app.get('/', (req, res) => {
  res.type('application/json')
  res.end(JSON.stringify({ status: 0, message: '成功~🌸' }, 'utf8'))
})
// 获取chatgpt的回复
app.get('/chatgpt', (req, res) => {
  const content = req.query.content
  console.log('🚀🚀🚀 / content:', content)
  getChatGPTReply(content).then((reply) => {
    console.log('🚀🚀🚀 / reply:', reply)
    res.type('application/json')
    res.end(JSON.stringify({ status: 0, message: '成功~🌸', data: reply }, 'utf8'))
  })
})

// 在指定端口启动服务器
httpServer.listen(port, 'localhost', () => {
  console.log(`\n  🌸 服务启动成功，地址：${chalk.blue('http://localhost:' + port)}`)
})
