import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

const API_BASE = 'https://worknexdeploy-production.up.railway.app';

@Component({
  selector: 'app-cocreation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cocreation.html',
  styleUrl: './cocreation.scss',
})
export class Cocreation {
  //

  sending = false;
  sent = false;
  error = '';

  async sendCocreation(
    jobTypeRaw: string,
    whoDoesRaw: string,
    frequencyRaw: string,
    toolsRaw: string,
    idealRaw: string
  ) {

    if (this.sending) return;

    const jobType = (jobTypeRaw ?? '').trim();
    const whoDoes = (whoDoesRaw ?? '').trim();
    const frequency = (frequencyRaw ?? '').trim();
    const tools = (toolsRaw ?? '').trim();
    const ideal = (idealRaw ?? '').trim();

    this.sent = false;
    this.error = '';

    if (!jobType || !whoDoes || !frequency || !tools) {
      this.error = 'Preencha pelo menos: tipo, quem faz, frequência e ferramentas.';
      return;
    }

    this.sending = true;

    try {
      const res = await fetch(`${API_BASE}/cocriacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobType,
          whoDoes,
          frequency,
          tools,
          ideal
        }),
      });

      if (!res.ok) {
        const msg = await this.tryReadError(res);
        throw new Error(msg || 'Erro na requisição');
      }

      this.sent = true;

    } catch (e) {

      this.error =
        e instanceof Error ? e.message : 'Erro ao enviar formulário.';

    } finally {

      this.sending = false;

    }
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