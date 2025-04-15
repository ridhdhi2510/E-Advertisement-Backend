const mailer = require('nodemailer');

const sendingMail = async(to, subject, html) =>{

    const transporter = mailer.createTransport({
        service : "gmail",
        auth:{
            user: "living.in.era@gmail.com",
            pass : "drgd ocrk ajgh ktss"
        }
    })

    const mailOptions = {
        from: "living.in.era@gmail.com",
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


