import { Component, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDrawerMode, MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DateAdapter, provideCalendar } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { Boxes, Building2, Calendar, ChartColumn, ChartNoAxesCombined, ClipboardCheck, LogOut, LucideAngularModule, Menu, Receipt, Settings, User, Users } from "lucide-angular";
import { Toast } from './components/popUps/toast/toast';
import { AuthService } from './services/auth-service';
import { ConfigService } from './services/config-service';
import { ConfigVisualService } from './services/config-visual-service';
import { PermissionService } from './services/permission-service';
import { ToastService } from './services/toast-service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

const DESKTOP_BREAKPOINT = 1024;

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    LucideAngularModule,
    Toast
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [
    provideCalendar({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
})
export class App implements OnInit {
  protected readonly title = signal('Worknex');
  private service = inject(AuthService)
  private configService = inject(ConfigService);
  perm = inject(PermissionService);
  private toast = inject(ToastService);
  private configVisualService = inject(ConfigVisualService);

  nomeUsuario: string = '';
  nomeEmpresa: string = '';
  sidebarOpen = true;
  mode: MatDrawerMode = 'side';

  private router = inject(Router);
  isLoginPage = false;

  constructor() {
    this.getUserName();
    this.getBusinessName();
  }

  ngOnInit(): void {
    this.updateResponsiveState();

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.isLoginPage = this.router.url.startsWith('/login');
    });

    this.isLoginPage = this.router.url.startsWith('/login');

    this.configVisualService.getVisualConfig().subscribe({
      next: (colors) => {
        this.configVisualService.applyColors(colors);
      },
      error: (err) => console.error('Erro ao carregar visual', err)
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.updateResponsiveState();
  }

  private updateResponsiveState() {
    const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
    this.sidebarOpen = isDesktop;
    this.mode = isDesktop ? 'side' : 'over';
  }

  readonly ChartColumn = ChartColumn;
  readonly Boxes = Boxes;
  readonly User = User;
  readonly Users = Users;
  readonly Building2 = Building2;
  readonly Calendar = Calendar;
  readonly ClipboardCheck = ClipboardCheck;
  readonly Receipt = Receipt;
  readonly ChartNoAxesCombined = ChartNoAxesCombined;
  readonly Settings = Settings;
  readonly LogOut = LogOut;
  readonly Menu = Menu;

  getUserName() {
    this.service.getLoggedUser().subscribe({
      next: usuario => {
        this.nomeUsuario = usuario.nome!;
      },
      error: err => {
        if (err.status !== 401) {
          this.toast.show(`Erro ao conseguir nome de usuário: ${err.error?.erro}`);
        }
      }
    });
  }

  getBusinessName() {
    this.configService.config$.subscribe({
      next: (config) => {
        this.nomeEmpresa = config?.nomeDaEmpresa ?? 'Sua Empresa';
      },
      error: err => {
        this.toast.show(`Erro ao conseguir nome da empresa: ${err.error?.erro}`);
      }
    })
  }

  logout() {
    this.service.logout();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
