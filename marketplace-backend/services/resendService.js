import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail({ name, email, company, message }) {
  return resend.emails.send({
    from: "contato@techgeenie.com.br",
    to: "atendimento@techgeenie.com.br",
    reply_to: email,
    subject: "Novo contato do marketplace",
    html: `
      <h2>Novo contato</h2>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Empresa:</strong> ${company || "-"}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${message}</p>
    `
  });
}