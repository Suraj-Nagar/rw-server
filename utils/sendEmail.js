import nodemailer from "nodemailer";
export const sendEmail=async ({to,subject,html}) => {
   
    const transporter=nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
  },
    });
    await transporter.sendMail({
        from:`"Room Wallah"<${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    })
}