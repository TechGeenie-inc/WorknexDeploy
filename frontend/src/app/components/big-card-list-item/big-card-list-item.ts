import { DecimalPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-big-card-list-item',
  imports: [DecimalPipe],
  templateUrl: './big-card-list-item.html',
  styleUrl: './big-card-list-item.scss'
})
export class BigCardListItem implements OnInit {
  @Input() title: string = ''; // exemplo: "Equipe Frontend"
  @Input() title2: string = ''; // exemplo: "2 membros"
  @Input() subtitle: string = ''; // exemplo: "Desenvolvimento de Landing Page"
  @Input() subtitle2: string = '';  // exemplo: "24/03/2024"

  subtitleLimit = 40;
  title2Number: number = 0;

  ngOnInit(): void {
    if (this.title2.charAt(0) == "+" || this.title2.charAt(0) == "-") {
      this.title2Number = this.parseToNumber(this.title2)
    }
  }

  get truncatedSubtitle(): string {
    if (!this.subtitle || this.subtitle.length <= this.subtitleLimit) {
      return this.subtitle;
    }
    return `${this.subtitle.slice(0, this.subtitleLimit).trimEnd()}...`;
  }

  private parseToNumber(value: string): number {
    if (!value) return 0;
    let cleaned = value.replace(/[^0-9.,-]/g, '');
    cleaned = cleaned.replace(/[+-]/g, '');
    if (cleaned.includes(',')) {
      cleaned = cleaned.replace(/\./g, '');
      cleaned = cleaned.replace(',', '.');
    }
    const result = Number(cleaned);
    return isNaN(result) ? 0 : result;
  }
}
