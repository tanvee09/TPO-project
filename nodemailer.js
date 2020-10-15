var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tpodept@gmail.com',
    pass: 'tpodept@2020'
  }
});

var mailOptions = {
  from: 'tpodept@gmail.com',
  to: 'ravisha7feb@gmail.com, vidhi11@somaiya.edu, balharatanvee@gmail.com', //Tanvee get the receiver's email ids here
  subject: 'Sending Email using Node.js',
  text: 'This way we can send automated email through the server. We just need to get the email data from the database! Good to go!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});