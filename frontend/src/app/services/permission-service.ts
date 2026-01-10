import { Injectable } from '@angular/core';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private permissions: any = null;

  constructor(private auth: AuthService) {
    this.auth.loggedUser$.subscribe((user) => {
      this.permissions = user?.permissions || {};
    });
  }

  can(module: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean {
    if (!this.permissions) return false;
    return this.permissions?.[module]?.[action] === true;
  }

  canViewModule(module: string) {
    return this.can(module, 'view');
  }
}
