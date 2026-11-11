const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.logoUrl =
      process.env.EMAIL_LOGO_URL &&
      process.env.EMAIL_LOGO_URL.toLowerCase() !== 'none'
        ? process.env.EMAIL_LOGO_URL
        : undefined;
    this.from = process.env.EMAIL_FROM || 'BookTheVibe <no-reply@example.com>';
  }

  newTransport() {
    const port = Number(process.env.EMAIL_PORT);
    if (!process.env.EMAIL_HOST || !port) {
      throw new Error('EMAIL_HOST and a valid EMAIL_PORT must be set in config.env');
    }

    const username = process.env.EMAIL_USERNAME;
    const password = process.env.EMAIL_PASSWORD;
    if (Boolean(username) !== Boolean(password)) {
      throw new Error('Set both EMAIL_USERNAME and EMAIL_PASSWORD, or leave both empty.');
    }

    const options = {
      host: process.env.EMAIL_HOST,
      port,
      secure: process.env.EMAIL_SECURE === 'true' || port === 465
    };
    if (username) options.auth = { user: username, pass: password };

    return nodemailer.createTransport(options);
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
      logoUrl: this.logoUrl
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html)
    };

    if (process.env.POSTMARK_SERVER_TOKEN) {
      await this.sendWithPostmarkApi(mailOptions);
      return;
    }

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWithPostmarkApi(mailOptions) {
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': process.env.POSTMARK_SERVER_TOKEN
      },
      body: JSON.stringify({
        From: mailOptions.from,
        To: mailOptions.to,
        Subject: mailOptions.subject,
        HtmlBody: mailOptions.html,
        TextBody: mailOptions.text,
        MessageStream: process.env.POSTMARK_MESSAGE_STREAM || 'outbound'
      })
    });

    const result = await response.json().catch(() => null);
    if (!response.ok || !result || result.ErrorCode !== 0) {
      const message = result && result.Message ? result.Message : response.statusText;
      throw new Error(`Postmark API request failed (${response.status}): ${message}`);
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to BookTheVibe!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
