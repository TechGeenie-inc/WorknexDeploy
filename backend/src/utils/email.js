// import nodemailer from "nodemailer";
// import dotenv from 'dotenv';

// dotenv.config();

// export const emailClient = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     },
// });

// export function enviarEmail(to, subject, html, attachments = []) {
//     return emailClient.sendMail({
//         from: `Sistema trampoWork <${process.env.EMAIL_USER}>`,
//         to,
//         subject,
//         html,
//         attachments
//     });
// }

import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarEmail(to, subject, html) {
    try {
        const result = await resend.emails.send({
            from: "Worknex <falecom@worknex.tech>",
            to,
            subject,
            html,
        });

        console.log("Email enviado:", result);
        return result;
        
    } catch (error) {
        console.error("Erro enviando email:", error);
        throw error;
    }
}
