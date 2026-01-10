import { Component } from '@angular/core';
import { LucideAngularModule, Unplug } from 'lucide-angular';

@Component({
  selector: 'app-pg-404',
  imports: [LucideAngularModule],
  templateUrl: './pg-404.html',
  styleUrl: './pg-404.scss'
})
export class Pg404 {
  readonly Unplug = Unplug;

}
