import { Component, Input } from '@angular/core';
import { BigCardListItem } from "../big-card-list-item/big-card-list-item";

export interface ListItem {
  title: string;
  title2: string;
  subtitle: string;
  subtitle2: string;
}

@Component({
  selector: 'app-big-card',
  imports: [BigCardListItem],
  templateUrl: './big-card.html',
  styleUrl: './big-card.scss'
})
export class BigCard {
  @Input() title: string = "";
  @Input() subtitle: string = "";
  @Input() items: ListItem[] = [];
}
