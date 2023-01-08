const nodeMailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

const sendEmail = async (option) => {
  const transporter = nodeMailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  // point to the template folder
  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve("./backend/emailTemplate/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./backend/emailTemplate/"),
  };

  // use a template file with nodemailer
  transporter.use("compile", hbs(handlebarOptions));

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: option.email,
    subject: option.subject,
    // text: option.message,
    template: "otp",
    context: {
      name: option.name,
      company: "PaddleBoat Co.",
      link: "https://www.padboat.com",
    },
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
