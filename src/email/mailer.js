import nodemailer from "nodemailer";

// 传输配置对象、连接 url 或传输插件实例
const transport = {
  // host: 'smtp.ethereal.email',
  // 邮件服务 支持的列表：https://nodemailer.com/smtp/well-known/
  service: "163",
  // SMTP 端口
  port: 465,
  // 使用了 SSL
  secureConnection: true,
  auth: {
    user: "fedtop@163.com",
    // 不是邮箱密码，是你设置的smtp授权码
    pass: "AZIOCYXHWEIELSQI",
  },
};

// 定义邮件内容
const data = {
  // 发送者 邮件地址
  from: '"Noah.Wong" <fedtop@163.com>',
  // 逗号隔开的接收人列表
  to: "'dear sh' <2018365419@qq.com>,'每日邮件' <wangrongding@qq.com>",
  // to: "'测试邮件' <wangrongding@qq.com>",
  // 邮件标题
  subject: `想和你一起看世界:第${parseInt(
    (new Date() - new Date("2020-08-19")) / 1000 / 60 / 60 / 24
  )}期`,
  // 发送的html内容
  html: content,
  // 发送text或者html格式
  // text: 'Hello world?', // plain text body
};

function sendCallBack(error, info) {
  if (error) {
    return console.log("error", error);
  }
  console.log("Message sent: %s", info.messageId);
  console.log(info);
}

// 创建发邮件的实例
const transporter = nodemailer.createTransport(transport);

// 使用定义的传输对象发送邮件
transporter.sendMail(data, sendCallBack);

// // 使用定义的传输对象发送邮件
// transporter.sendMail(data, (error, info) => {
//   if (error) {
//     return console.log("error", error);
//   }
//   console.log("Message sent: %s", info.messageId);
//   console.log(info);
// });
