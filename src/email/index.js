const nodemailer = require("nodemailer");
const { axios } = require("./request");

// 生成邮件内容
async function generateContent() {
  console.log(
    `想和你一起看世界=================:第${parseInt(
      (new Date() - new Date("2020-08-19")) / 1000 / 60 / 60 / 24
    )}期`
  );
  //获取每日Bing壁纸
  let bgInfo = await axios.get(
    "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1"
  );
  console.log(bgInfo.images[0].copyright);
  //获取天气
  let weather = await axios.get(
    `http://wthrcdn.etouch.cn/weather_mini?city=${encodeURI("昌平")}`
  );
  let weatherInfo = weather.data;
  console.log(weatherInfo.city);
  //每日一句
  // let sentence = await axios.get(`https://chp.shadiao.app/api.php`);
  let sentence = await axios.get(`https://api.shadiao.app/chp`);
  console.log(sentence.data.text);

  return `
    <style>
    .container {
        background-color: rgb(165, 115, 140);
        background: url("http://cn.bing.com${
          bgInfo.images[0].url
        }") center no-repeat;
        background-size: 100%;
        width: 960px;
        height: 540px;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        align-items: center;
        color: white;
    }
    .title {
        font-size: 22px;
        margin-top: 50px;
    }
    .description {
        color: white;
    }
    .content {
        background: rgba(255, 255, 255, 0.5);
        margin: 0 auto;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        padding: 20px;
        box-sizing: border-box;
    }
    .content>p {
        text-align: left;
        font-size: 12px;
        color: white;
        width: 100%;
        margin: 5px auto;
        padding: 0;
    }
    </style>
    <div class="container">
        <div class="title">陪你一起看世界:第${parseInt(
          (new Date() - new Date("2020-08-19")) / 1000 / 60 / 60 / 24
        )}期</div>
        <a class="description" target="_blank"
        href="${bgInfo.images[0].copyrightlink}">${bgInfo.images[0].copyright}
        </a>
        <div class="content">
            <p style="display: flex;">
                <img src="https://assets.fedtop.com/picbed/202108251051012.gif"
                style="width: 50px;height:35px;" alt="" />
                <span>😘今天是:  ${new Date().toLocaleDateString()}  ${new Date().toLocaleString(
    "default",
    { weekday: "long" }
  )}  是我们在一起的第: ${parseInt(
    (new Date() - new Date("2020-08-19")) / 1000 / 60 / 60 / 24
  )}天~🥰🎈🎈🎈，今天天气:  ${weatherInfo.forecast[0].type} 最${
    weatherInfo.forecast[0].high
  } 最${weatherInfo.forecast[0].low},今天的风向是:${
    weatherInfo.forecast[0].fengxiang
  }
                当前室外温度为：${weatherInfo.wendu}℃<br>${
    weatherInfo.ganmao
  }。❤❤❤
                </span>
            </p>
            <p></p>
            <p>${sentence.data.text}</p>
        </div>
    </div>
`;
}
//发送请求
async function send() {
  const content = await generateContent();
  let transporter = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
    service: "163",
    port: 465, // SMTP 端口
    secureConnection: true, // 使用了 SSL
    auth: {
      user: "xxx@163.com",
      // 不是邮箱密码，是你设置的smtp授权码
      pass: "xxx",
    },
  });

  let mailOptions = {
    from: '"Noah.Wong" <xxx@163.com>', // 发送者 邮件地址
    // to: "'测试邮件' <bbbbb@qq.com>", // 逗号隔开的接收人列表
    to: "'宝贝sh' <xxxxx@qq.com>,'每日邮件' <bbbbb@qq.com>", // 逗号隔开的接收人列表
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
}
send();
