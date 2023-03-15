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
  public async sendCode(to: string, key: number): Promise<MessageStatus> {
    try {
      const message = await new Promise((res, rej) => {
        this.transporter.sendMail(
          {
            from: process.env.MAIL_LOGIN,
            to,
            subject: 'Активация аккаунта Boostspace.',
            text: '',
            html: `${key}`,
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
