class Timer {
  private id: ReturnType<typeof setInterval>
  private uptime
  private handler: () => void

  constructor(interval: number) {
    this.handler = () => {}
    this.uptime = 0

    this.id = setInterval(() => {
      const curDate = new Date()
      const curDay = curDate.getDay()
      const curHour = curDate.getHours()
      const curMin = curDate.getMinutes()

      if (curDay === 3 && curHour === 8 && curMin === 1) {
        this.handler()
      }

      this.uptime += interval
    }, interval)
  }

  getUptime() {
    return this.uptime / 1_000
  }
  stop() {
    clearInterval(this.id)
  }
  setHandler(fn: () => void) {
    this.handler = fn
  }
}

export default new Timer(45_000)
