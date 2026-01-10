import { Component, Input } from '@angular/core';
import { TrendingDown, TrendingUp } from 'lucide-angular';
import { SmallCard } from '../small-card/small-card';

@Component({
  selector: 'app-fluxo-card',
  imports: [SmallCard],
  templateUrl: './fluxo-card.html',
  styleUrl: './fluxo-card.scss'
})
export class FluxoCard {
  @Input() title: string = "";
  @Input() saldo: string = "";

  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;


}
