const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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') // this is old key
// sgMail.setApiKey('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') // this is new key

const config = require('app/config')
const mailUtil = require('./mailUtils')
const mailConfig = config.mailgun

/**
 * Send email based on passed data
 * @param {String} templateName -> Template name from utils/template excluding .mjml
 * @param {Object} templateData -> Dynamic data to be passed in template
 * @param {String} from -> Email sender
 * @param {String} to @required -> Email receiver
 * @param {String} subject -> Email subject
 * @returns undefined
 */
const send = async ({
  templateName = 'empty',
  templateData = {},
  to,
  from = 'no-reply@mixtape.com',
  subject = 'New email from Booking Bravo'
}) => {
  try {
    const html = await mailUtil.readAndRenderTemplate(templateName, templateData)
    sgMail.send({ to, from, subject, html })
      .catch(e => console.error('sgMail catch: ', e.message))
  } catch (e) {
    console.error('mailService.send: ', e.message)
  }
}

const sendTenantCode = data =>
  mailUtil
    .readAndRenderTemplate(
      'SendTenantCode',
      { inviteCode: data.inviteCode }
    )
    .then(html =>
      sgMail
        .send({
          to: data.email,
          from: 'no-reply@mixtape.com',
          subject: 'Please Complete a imixtape of ' +
            `${data.address} for ${data.companyName}`,
          html
        })
    )

// Confiramtion button
const sendWelcomeEmail = user =>
  mailUtil
    .readAndRenderTemplate('SignUp', user)
    .then(html =>
      sgMail
        .send({
          to: user.email,
          from: 'no-reply@mixtape.com',
          subject: 'Welcome to mixtape',
          html
        })
    )

const sendPasswordResetEmail = user =>
  sgMail
    .send({
      to: user.email,
      from: 'no-reply@mixtape.com',
      subject: 'Reset password',
      text: 'mixtape reset password',
      html: 'To reset password click  ' +
        `<a href="${mailConfig.frontendUrl}/reset-password?` +
        `token=${user.account.resetPasswordToken}">here</a>`
    })

const sendReminderEmail = data =>
  mailUtil
    .readAndRenderTemplate(
      'reminder',
      data
    )
    .then(html =>
      sgMail
        .send({
          to: data.email,
          from: 'no-reply@mixtape.com',
          subject: 'ACTION REQUIRED: Complete Your imixtape of ' +
            `${data.address} for ${data.companyName}`,
          html
        })
    )

const sendBookedEmail = user =>
  mailUtil
    .readAndRenderTemplate('Booked', Object.assign({}, user, {
      messageType: 'bookingCreate'
    }))
    .then(html =>
      sgMail
        .send({
          to: user.email,
          from: 'no-reply@mixtape.com',
          subject: 'Booking request received',
          html
        })
    )

const sendBookingModifiedEmail = user =>
  mailUtil
    .readAndRenderTemplate('Booked', Object.assign({}, user, {
      messageType: 'bookingModified'
    }))
    .then(html =>
      sgMail
        .send({
          to: user.email,
          from: 'no-reply@mixtape.com',
          subject: 'Review - Booking modified',
          html
        })
    )

const sendBookingAcceptedEmail = user =>
  mailUtil
    .readAndRenderTemplate('Booked', Object.assign({}, user, {
      messageType: 'bookingAccepted'
    }))
    .then(html =>
      sgMail
        .send({
          to: user.email,
          from: 'no-reply@mixtape.com',
          subject: 'Booking request accepted',
          html
        })
    )

const sendBookingRejectionEmail = user =>
  mailUtil
    .readAndRenderTemplate('Booked', Object.assign({}, user, {
      messageType: 'bookingDeclined'
    }))
    .then(html =>
      sgMail
        .send({
          to: user.email,
          from: 'no-reply@mixtape.com',
          subject: 'Booking request declined',
          html
        })
    )

const sendInvitedEmail = user =>
  mailUtil
    .readAndRenderTemplate('Booked', Object.assign({}, user, {
      messageType: 'invitationCreate'
    }))
    .then(html =>
      sgMail
        .send({
          to: user.email,
          from: 'no-reply@mixtape.com',
          subject: 'New Invitation Received',
          html
        })
    )

module.exports = {
  send,
  sendTenantCode,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendReminderEmail,
  sendBookedEmail,
  sendBookingModifiedEmail,
  sendBookingAcceptedEmail,
  sendBookingRejectionEmail,
  sendInvitedEmail
}
