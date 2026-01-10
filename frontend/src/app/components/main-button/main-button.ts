import { Component, Input, signal } from '@angular/core';
import { LucideAngularModule, } from 'lucide-angular';

interface Ripple { /*Para fazer o array*/
  x: number;
  y: number;
  size: number;
  id: number;
}

@Component({
  selector: 'app-main-button',
  imports: [LucideAngularModule],
  templateUrl: './main-button.html',
  styleUrl: './main-button.scss'
})
export class MainButton {
  @Input() text?: string;
  @Input() icon?: any;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() isLongButton?: boolean = false;
  @Input() altButton?: boolean = false;
  /*Não precisa de Input com o método, so colocar (click)='metodo()' na instanciação no componente pai */

  private nextRippleId = 0;
  ripples = signal<Ripple[]>([]);/*Array dos ripples ativos*/
  createRipple(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect(); /*Pega as dimensões do botão*/
    const size = Math.max(rect.width, rect.height); /*Descobre qual o maior valor, altura ou largura */
    /*O maior valor é usado para a criação do ripple */
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2; /*Descobre onde o clique foi dado para spawnar o ripple */
    /*O - size/2 centraliza no lugar do clique */
    const newRipple: Ripple = { x, y, size, id: this.nextRippleId++ };
    /*Cria o Ripple */
    this.ripples.set([...this.ripples(), newRipple]);
    /*O adiciona a array, onde então é gerado la no html */
  }

  removeRipple(rippleId: number) {
    this.ripples.set(this.ripples().filter(r => r.id !== rippleId));
    /*Remove o ripple da Array, quando a animação se completa, disparado lá no html */
  }
}
