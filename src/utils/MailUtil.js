const mailer = require('nodemailer');

const sendingMail = async(to, subject, html) =>{

    const transporter = mailer.createTransport({
        service : "gmail",
        auth:{
            user: "blix543@gmail.com",
            pass : "pefm fryi unzr opdl"
        }
    })

    const mailOptions = {
        from: "blix543@gmail.com",
        to:to,
        subject: subject,
        html:html
    }

    const mailResponse = await transporter.sendMail(mailOptions);
    // console.log(mailResponse);
    return mailResponse
}

module.exports ={
    sendingMail
}

// sendingMail("mahektandel1711@gmail.com","Test Mail","this is test mail")


