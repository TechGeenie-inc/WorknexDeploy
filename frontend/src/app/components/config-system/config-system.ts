import { Component } from '@angular/core';
import { LucideAngularModule, Settings } from 'lucide-angular';
import { SliderButton } from '../slider-button/slider-button';

@Component({
  selector: 'app-config-system',
  imports: [LucideAngularModule, SliderButton],
  templateUrl: './config-system.html',
  styleUrl: './config-system.scss'
})
export class ConfigSystem {
  readonly Settings = Settings;
}
