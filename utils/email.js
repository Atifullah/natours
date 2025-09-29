const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g. smtp.gmail.com
    port: process.env.EMAIL_PORT, // e.g. 587
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USERNAME, // your email
      pass: process.env.EMAIL_PASSWORD, // your app password
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Natours Support <support@natours.io>', // 👈 change this to your project name/email
    to: options.email, // receiver
    subject: options.subject, // Subject line
    text: options.message, // plain text body
    // html: "<b>Hello</b>" // optional: HTML body
  };

  // 3) Send the email
  await transporter.sendMail(mailOptions).catch((err) => {
    console.error('Email sending failed:', err);
    throw err;
  });
};

module.exports = sendEmail;
