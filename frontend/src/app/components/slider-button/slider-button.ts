import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-slider-button',
  imports: [],
  templateUrl: './slider-button.html',
  styleUrl: './slider-button.scss'
})
export class SliderButton {
  @Input() checked = false;
  @Input() disabled = false;
  @Output() change = new EventEmitter<boolean>();

  ready = false;

  ngAfterViewInit() {
    requestAnimationFrame(() => {
      this.ready = true;
    });
  }

  onToggle(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    event.stopPropagation();
    this.change.emit(checked); 
  }

}
