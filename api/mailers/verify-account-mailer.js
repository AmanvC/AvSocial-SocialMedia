const nodeMailer = require("../config/nodemailer");

module.exports.sendConfirmationEmail = async (
  firstName,
  lastName,
  email,
  confirmationCode
) => {
  try {
    await nodeMailer.transporter.sendMail({
      from: `"AvSocial" <${process.env.GOOGLE_SMTP_USER}>`,
      to: email,
      subject: "AvSocial - Email Verification",
      html: `
      <!DOCTYPE html>
      <html>
        <body
          style="
            background-color: #f2f2f2;
            font-family: Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #555;
            padding: 20px;
            margin: 0;
          "
        >
          <table
            style="
              margin: 0 auto;
              width: 100%;
              max-width: 600px;
              background-color: #fff;
              border-collapse: collapse;
            "
          >
            <tr style="border-radius: 10px;">
              <td
                style="
                  padding: 20px;
                  text-align: left;
                  vertical-align: top;
                  border: 1px solid #ddd;
                "
              >
                <h1
                  style="
                    font-size: 3em;
                    line-height: 1.2;
                    color: #333;
                    margin: 30px 0;
                    text-align: center;
                  "
                >
                Welcome to <span style="color: rgb(158, 64, 64);">AvSocial</span>
                </h1>
                <h2 style="margin-top: 0; margin-bottom: 30px; text-align: center; font-size: 2em">Hello ${
                  firstName + " " + lastName
                }</h2>
                <p style="margin-top: 0; margin-bottom: 30px; text-align: center">
                    Thank you for signing up at AvSocial. Please verify your email by clicking on the following link.
                </p>
                <a style="text-decoration: none; color: white; margin: 20px 10px; cursor: pointer" href="${
                  process.env.CLIENT_URL
                }/api/v1/users/verify/user-email/${confirmationCode}">
                <button style="border: none;
                    padding: 10px;
                    background-color: rgb(158, 64, 64);
                    border-radius: 5px;
                    letter-spacing: 1px;
                    width: 100px;
                    font-size: 1em; 
                    font-weight: 600; 
                    color: white;
                    cursor: pointer;">Verify</button></a>
              </td>
            </tr>
          </table>
        </body>
      </html>
      
        `,
    });
  } catch (err) {
    console.log("Error in sending confirmation email: ", err);
  }
};
