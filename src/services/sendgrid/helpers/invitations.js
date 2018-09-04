module.exports = {
  myTalents () {
    return this.receiver.role === 'talent' ? 'my-agents' : 'my-talents'
  }
}
