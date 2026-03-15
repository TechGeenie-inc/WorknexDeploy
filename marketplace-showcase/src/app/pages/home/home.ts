import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

const API_BASE = 'https://worknexdeploy-production.up.railway.app';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private faqSyncing = false;

  sending = false;
  sent = false;
  error = '';

  onFaqToggle(ev: Event) {
    if (this.faqSyncing) return;

    const active = ev.target as HTMLDetailsElement;
    if (!active.open) return;

    const all = Array.from(document.querySelectorAll<HTMLDetailsElement>('details.faqItem'));

    this.faqSyncing = true;
    for (const el of all) {
      if (el !== active) el.open = false;
    }
    queueMicrotask(() => (this.faqSyncing = false));
  }

  async sendContact(nameRaw: string, emailRaw: string, companyRaw: string, messageRaw: string) {
    console.log(nameRaw, emailRaw, companyRaw,messageRaw)
    if (this.sending) return;

    const name = (nameRaw ?? '').trim();
    const email = (emailRaw ?? '').trim();
    const company = (companyRaw ?? '').trim();
    const message = (messageRaw ?? '').trim();

    this.sent = false;
    this.error = '';

    if (!name || !email || !message) {
      this.error = 'Preencha nome, email e mensagem.';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.error = 'Email inválido.';
      return;
    }

    this.sending = true;

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, message }),
      });

      if (!res.ok) {
        const msg = await this.tryReadError(res);
        throw new Error(msg || 'Request failed');
      }

      this.sent = true;
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Erro ao enviar mensagem.';
    } finally {
      this.sending = false;
    }
  }

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private async tryReadError(res: Response) {
    try {
      const data = await res.json();
      if (data && typeof data.error === 'string') return data.error;
      return '';
    } catch {
      return '';
    }
  }
}