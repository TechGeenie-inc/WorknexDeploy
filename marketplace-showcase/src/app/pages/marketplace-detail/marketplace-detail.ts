import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MARKETPLACE_APPS, type AppItem } from '../../data/marketplace-apps';

type TabKey = 'features' | 'plans';

@Component({
  selector: 'app-marketplace-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './marketplace-detail.html',
  styleUrl: './marketplace-detail.scss',
})
export class MarketplaceDetail implements OnInit {
  app?: AppItem;
  tab: TabKey = 'features';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.app = MARKETPLACE_APPS.find(a => a.id === id);
  }

  setTab(tab: TabKey) {
    this.tab = tab;
  }

  get stars(): number[] {
    const r = this.app?.rating ?? 0;
    const full = Math.round(r);
    return Array.from({ length: 5 }, (_, i) => (i < full ? 1 : 0));
  }
}