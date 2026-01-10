import { Component } from '@angular/core';
import { Eye, LucideAngularModule, Settings, Shield, User } from 'lucide-angular';

@Component({
  selector: 'app-config-acess-levels',
  imports: [LucideAngularModule],
  templateUrl: './config-access-levels.html',
  styleUrl: './config-access-levels.scss'
})
export class ConfigAccessLevels {
  readonly Shield = Shield;
  readonly User = User;
  readonly Eye = Eye;
  readonly Settings = Settings;
}
