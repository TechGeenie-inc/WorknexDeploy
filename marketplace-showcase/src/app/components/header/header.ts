import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

type NavItem = { label: string; path: string; exact?: boolean };

const NAV: NavItem[] = [
  { label: "Marketplace", path: "/marketplace", exact: true },
  { label: "Soluções", path: "/solucoes" },
  { label: "Como Funciona", path: "/como-funciona" },
  { label: "Co-criação", path: "/co-criacao" },
];

@Component({
  selector: "app-header",
  standalone: true,
  imports: [RouterModule],
  templateUrl: "./header.html",
  styleUrl: "./header.scss",
})
export class HeaderComponent {
  nav = NAV;
}