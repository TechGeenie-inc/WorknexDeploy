import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

/* ---------------- CONTACT FORM ---------------- */

app.post("/contact", async (req, res) => {
  try {
    const { name, email, company, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await resend.emails.send({
      from: "contato@techgeenie.com.br",
      to: "atendimento@techgeenie.com.br",
      reply_to: email,
      subject: "Novo contato do marketplace",
      html: `
        <h3>Novo contato</h3>
        <p><b>Nome:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Empresa:</b> ${company || "-"}</p>
        <p>${message}</p>
      `
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Email failed" });
  }
});

/* ---------------- CHECKOUT REQUEST ---------------- */

app.post("/checkout/request", async (req, res) => {
  try {
    const { appId, plan, method, customer } = req.body;

    if (
      !appId ||
      !plan ||
      !method ||
      !customer?.name ||
      !customer?.email ||
      !customer?.cpfCnpj
    ) {
      return res.status(400).json({ error: "Missing fields" });
    }

    /* email to your team */

    await resend.emails.send({
      from: "contato@techgeenie.com.br",
      to: "atendimento@techgeenie.com.br",
      subject: `Novo pedido (${method.toUpperCase()})`,
      html: `
        <h2>Novo pedido do marketplace</h2>

        <p><b>Aplicação:</b> ${appId}</p>
        <p><b>Plano:</b> ${plan}</p>
        <p><b>Método de pagamento:</b> ${method}</p>

        <hr/>

        <p><b>Nome:</b> ${customer.name}</p>
        <p><b>Email:</b> ${customer.email}</p>
        <p><b>CPF/CNPJ:</b> ${customer.cpfCnpj}</p>
        <p><b>Telefone:</b> ${customer.phone || "-"}</p>
        <p><b>Empresa:</b> ${customer.company || "-"}</p>
        <p><b>Observações:</b> ${customer.notes || "-"}</p>
      `
    });

    /* confirmation email to customer */

    await resend.emails.send({
      from: "contato@techgeenie.com.br",
      to: customer.email,
      subject: "Recebemos seu pedido - Worknex",
      html: `
        <h2>Pedido recebido</h2>

        <p>Olá ${customer.name},</p>

        <p>
        Recebemos seu pedido para a aplicação <b>${appId}</b> no plano <b>${plan}</b>.
        </p>

        <p>
        Em breve enviaremos as instruções de pagamento via <b>${method.toUpperCase()}</b>.
        </p>

        <p>Obrigado por escolher a Worknex.</p>
      `
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout request failed" });
  }
});

/* ---------------- SERVER ---------------- */

app.listen(3001, () => {
  console.log("API running on port 3001");
});