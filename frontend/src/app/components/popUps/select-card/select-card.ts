import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LucideAngularModule, User } from 'lucide-angular';

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

@Component({
  selector: 'app-select-card',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './select-card.html',
  styleUrl: './select-card.scss'
})
export class SelectCard {

  readonly User = User;
  
  @Input() permissions: ModulePermissions = {
    view: false,
    create: false,
    edit: false,
    delete: false,
  };
  @Input() icon: any;
  @Input() title: string = "";
  @Input() subtitle: string = "";

  @Output() permissionsChange = new EventEmitter<ModulePermissions>();

  toggle(field: keyof ModulePermissions, checked: boolean) {
    const updated = { ...this.permissions, [field]: checked };
    this.permissionsChange.emit(updated);
  }
}
