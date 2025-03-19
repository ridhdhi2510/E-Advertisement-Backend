const mailer = require('nodemailer');

const sendingMail = async(to, subject, text) =>{

    const transporter = mailer.createTransport({
        service : "gmail",
        auth:{
            user: "living.in.era@gmail.com",
            pass : "hbgd hvct mxmn qpww"
        }
    })

    const mailOptions = {
        from: "living.in.era@gmail.com",
        to:to,
        subject: subject,
        text:text
    }

    const mailResponse = await transporter.sendMail(mailOptions);
    console.log(mailResponse);
    return mailResponse
}

module.exports ={
    sendingMail
}

// sendingMail("mahektandel1711@gmail.com","Test Mail","this is test mail")


