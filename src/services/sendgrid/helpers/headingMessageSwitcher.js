module.exports = {
  headingMessage () {
    switch (this.messageType) {
      case 'bookingCreate':
        return 'You are booked in'
      case 'bookingModified':
        return 'Your offer modified'
      case 'bookingAccepted':
        return 'Your offer accepted'
      case 'bookingDeclined':
        return 'Your offer was declined'
      case 'invitationCreate':
        return 'You have been invited'
      default:
        return ''
    }
  }
}
