const nodemailer = require("nodemailer");
const { generateContent } = require("./generateContent.js");
//发送请求
exports.send = async function send() {
  const content = await generateContent();

  let transporter = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    service: "163", // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
    port: 465, // SMTP 端口
    secureConnection: true, // 使用了 SSL
    auth: {
      user: "fedtop@163.com",
      // 不是邮箱密码，是你设置的smtp授权码
      pass: "xxx",
    },
  });

  let mailOptions = {
    from: '"Noah.Wong" <fedtop@163.com>', // 发送者 邮件地址
    // to: "'测试邮件' <wangrongding@qq.com>", // 逗号隔开的接收人列表
    to: "'宝贝sh' <2018365419@qq.com>,'每日邮件' <wangrongding@qq.com>", // 逗号隔开的接收人列表
    subject: `想和你一起看世界:第${parseInt(
      (new Date() - new Date("2020-08-19")) / 1000 / 60 / 60 / 24
    )}期`, // 邮件标题
    // 发送text或者html格式
    // text: 'Hello world?', // plain text body
    // 发送的html内容
    html: content,
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("error", error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log(info);
  });
};
