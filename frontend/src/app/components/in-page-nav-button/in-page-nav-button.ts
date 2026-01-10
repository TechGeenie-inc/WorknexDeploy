import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export interface InPageNavButtonOption {
  icon?: any;
  label: string;
}

@Component({
  selector: 'app-in-page-nav-button',
  imports: [LucideAngularModule],
  templateUrl: './in-page-nav-button.html',
  styleUrl: './in-page-nav-button.scss'
})
export class InPageNavButton implements AfterViewInit {
  @Input() options: InPageNavButtonOption[] = []; /*Lista das opcoes */
  @Input() selectedIndex = 0; /*indice inicial*/
  animate: boolean = false; /*Para iniciar sem animação, mas ser alterado dps*/
  @Output() selectionChange = new EventEmitter<number>(); /*Passa a seleção pro elemento pai */

  ngAfterViewInit() {
    setTimeout(() => this.animate = true, 0)
  }

  select(index: number) {
    this.selectedIndex = index;
    this.selectionChange.emit(index);
  }

}
