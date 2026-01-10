import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-big-card-list-item',
  imports: [NgClass,],
  templateUrl: './big-card-list-item.html',
  styleUrl: './big-card-list-item.scss'
})
export class BigCardListItem {
  @Input() title: string = ''; // exemplo: "Equipe Frontend"
  @Input() title2: string = ''; // exemplo: "2 membros"
  @Input() subtitle: string = ''; // exemplo: "Desenvolvimento de Landing Page"
  @Input() subtitle2: string = '';  // exemplo: "24/03/2024"

  subtitleLimit = 40;

  get truncatedSubtitle(): string {
    if (!this.subtitle || this.subtitle.length <= this.subtitleLimit) {
      return this.subtitle;
    }
    return `${this.subtitle.slice(0, this.subtitleLimit).trimEnd()}...`;
  }
}
