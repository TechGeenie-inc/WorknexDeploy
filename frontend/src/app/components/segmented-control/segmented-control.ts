import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-segmented-control',
  imports: [],
  templateUrl: './segmented-control.html',
  styleUrl: './segmented-control.scss'
})
export class SegmentedControl {
  @Input() options: string[] = []; /*Recebe o Texto dos botões*/
  @Input() selectedIndex = 0; /*Indice da opção selecionada inicialmente, se não for especificada sempre vai ser a primeira (0)*/
  @Output() selectionChange = new EventEmitter<number>(); /*Envia o indice escolhido ao componente pai*/
  @Input() isGiant = false;

  select(index: number) { /*Método que é chamado ao clicar do botão, definindo o novo index e "publicando" com o eventemiiter*/
    this.selectedIndex = index;
    this.selectionChange.emit(index);
  }
}
