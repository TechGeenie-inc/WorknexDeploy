import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";

import { MARKETPLACE_APPS, type AppItem } from "../../data/marketplace-apps";

type PaymentMethod = "pix" | "boleto";

@Component({
  selector: "app-marketplace-checkout",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: "./marketplace-checkout.html",
  styleUrl: "./marketplace-checkout.scss",
})
export class MarketplaceCheckout implements OnInit {
  app?: AppItem;

  companyName = "";
  cnpj = "";
  corporateEmail = "";
  phone = "";

  fullName = "";
  cpf = "";

  selectedPlanName = "";
  selectedPlanBadge = "";

  subtotal = 0;
  discount = 0;

  sending = false;
  sent = false;
  error = "";

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) return;

    this.app = MARKETPLACE_APPS.find((a) => a.id === id);
    if (!this.app) return;

    const planFromUrl = this.route.snapshot.queryParamMap.get("plan") || "";
    const plan =
      (planFromUrl && this.app.plans?.find((p) => p.name === planFromUrl)) ||
      this.app.plans?.find((p) => p.recommended) ||
      this.app.plans?.[0];

    this.selectedPlanName = plan?.name || "Plano";
    this.selectedPlanBadge = plan?.recommended ? "Recomendado" : "";

    this.subtotal = this.parsePrice(plan?.priceLabel) ?? this.app.price;
  }

  get canContinue() {
    return !!(
      this.companyName.trim() &&
      this.cnpj.trim() &&
      this.corporateEmail.trim() &&
      this.fullName.trim() &&
      this.cpf.trim()
    );
  }

  get total() {
    return Math.max(0, this.subtotal - this.discount);
  }

  onCnpjInput(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 14);
    this.cnpj = this.formatCnpj(digits);
  }

  onCpfInput(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    this.cpf = this.formatCpf(digits);
  }

  onPhoneInput(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    this.phone = this.formatPhoneBr(digits);
  }

  async requestPayment(method: PaymentMethod) {
    if (!this.app) return;
    if (this.sending) return;
    if (!this.canContinue) return;

    this.sending = true;
    this.sent = false;
    this.error = "";
    this.cdr.detectChanges();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const payload = {
        appId: this.app.id,
        plan: this.selectedPlanName,
        method,
        customer: {
          name: this.fullName.trim(),
          email: this.corporateEmail.trim(),
          cpfCnpj: this.cpf.trim(),
          phone: this.phone.trim(),
          company: this.companyName.trim(),
          notes: `CPF: ${this.cpf.trim()} | CNPJ: ${this.cnpj.trim()}`,
        },
      };

      const res = await fetch("https://worknexdeploy-production.up.railway.app:3001/checkout/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        let msg = "Falha ao enviar pedido.";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        throw new Error(msg);
      }

      this.sent = true;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        this.error = "Tempo esgotado. Tente novamente.";
      } else {
        this.error = e instanceof Error ? e.message : "Erro ao enviar pedido.";
      }
    } finally {
      clearTimeout(timeoutId);
      this.sending = false;
      this.cdr.detectChanges();
    }
  }

  private formatCpf(d: string) {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }

  private formatCnpj(d: string) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
    if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
    if (d.length <= 12) {
      return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
    }
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  }

  private formatPhoneBr(d: string) {
    if (d.length <= 2) return d;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  private parsePrice(priceLabel?: string): number | null {
    if (!priceLabel) return null;

    const m = priceLabel.match(/R\$\s*([\d\.\,]+)/);
    if (!m) return null;

    const raw = m[1].replace(/\./g, "").replace(",", ".");
    const value = Number(raw);

    return Number.isFinite(value) ? value : null;
  }
}