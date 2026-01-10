import { Component } from '@angular/core';
import { LucideAngularModule, LucidePackageSearch, Trash2 } from 'lucide-angular';
import { MainButton } from '../main-button/main-button';

@Component({
  selector: 'app-config-deletions',
  imports: [LucideAngularModule, MainButton],
  templateUrl: './config-deletions.html',
  styleUrl: './config-deletions.scss'
})
export class ConfigDeletions {
  readonly FileSearchCorner = LucidePackageSearch;
  readonly Trash2 = Trash2;
}
