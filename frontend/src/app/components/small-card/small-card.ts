import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-small-card',
  imports: [LucideAngularModule, NgClass,
  ],
  templateUrl: './small-card.html',
  styleUrls: ['./small-card.scss'],
})
export class SmallCard {
  @Input() title: string = '';
  @Input() mainText: string = '';
  @Input() subtitle: string = '';
  @Input() color?: string;
  @Input() icon?: any;
  @Input() selected = false;
}
