import nodemailer, { TransportOptions } from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

interface MessageStatus {
  sended: boolean
  err?: any
}

class MailService {
  private transporter
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      service: 'Yandex',
      auth: {
        user: process.env.MAIL_LOGIN,
        pass: process.env.MAIL_SECURE_PASS,
      },
    } as TransportOptions)
  }
  public async sendCode(to: string, code: number, name: string): Promise<MessageStatus> {
    try {
      const message = await new Promise((res, rej) => {
        this.transporter.sendMail(
          {
            from: process.env.MAIL_LOGIN,
            to,
            subject: 'Активация аккаунта Boostspace.',
            text: '',
            html: `<body
            style="
              margin: 0;
              padding: 0;
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              background-size: 100px;
              background-image: url('https://cdn.discordapp.com/attachments/410547970505703436/1086407429555769509/protruding-squares.png');
            "
          >
            <div
              style="
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px 50px;
                margin: 0;
        
                font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
              "
            >
              <div
                style="
                  margin: 0;
                  padding: 0;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                "
              >
                <h1
                  style="
                    color: #adadad;
                    font-style: italic;
                    font-size: 42px;
                    text-align: center;
                    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                  "
                >
                  Рады приветствовать тебя в своих рядах,<br />
                  товарищ ${name}!
                </h1>
                <h2
                  style="
                    color: #adadad;
                    font-style: italic;
                    font-size: 28px;
                    text-align: center;
                    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                  "
                >
                  Желаю хорошей игры, отсутствия банов и стабильного заработка :) <br />
                  Удачи!
                </h2>
                <p
                  style="
                    color: #adadad;
                    font-style: italic;
                    font-size: 24px;
                    text-align: center;
                    margin-bottom: 10px;
                    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                  "
                >
                  Твой код для активации аккаунта Boostspace:
                </p>
                <p style="width: 100%; text-align: center">
                  <span
                    style="padding: 10px 20px; color: #adadad; font-size: 32px; border-radius: 10px; border: 2px dashed #adadad"
                  >
                    ${code}
                  </span>
                </p>
              </div>
              <img
                style="width: 500px; border-radius: 50px"
                src="https://cdn.discordapp.com/attachments/410547970505703436/1086410702635409408/image.png"
                alt="logo"
              />
            </div>
          </body>`,
          },
          (err: any) => {
            if (err) {
              rej({ sended: false, err })
            } else {
              res({ sended: true })
            }
          },
        )
      })
      return message as MessageStatus
    } catch (err) {
      return { sended: false, err } as MessageStatus
    }
  }
  public async sendNewPassword(to: string, password: number): Promise<MessageStatus> {
    try {
      const message = await new Promise((res, rej) => {
        this.transporter.sendMail(
          {
            from: process.env.MAIL_LOGIN,
            to,
            subject: 'Восстановление пароля Boostspace.',
            text: '',
            html: `${password}`,
          },
          (err: any) => {
            if (err) {
              rej({ sended: false, err })
            } else {
              res({ sended: true })
            }
          },
        )
      })
      return message as MessageStatus
    } catch (err) {
      return { sended: false, err } as MessageStatus
    }
  }
}

export default new MailService()
