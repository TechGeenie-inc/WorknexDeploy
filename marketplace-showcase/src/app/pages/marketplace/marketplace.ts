import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MARKETPLACE_APPS, type AppItem } from '../../data/marketplace-apps';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './marketplace.html',
  styleUrl: './marketplace.scss',
})
export class Marketplace {
  query = '';
  selectedCategory = 'Todos';

  apps: AppItem[] = MARKETPLACE_APPS;

  get categories(): string[] {
    return Array.from(new Set(this.apps.map(a => a.category)));
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
  }

  get filteredApps(): AppItem[] {
    const q = this.query.trim().toLowerCase();

    return this.apps.filter(a => {
      const matchesCat = this.selectedCategory === 'Todos' || a.category === this.selectedCategory;
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.desc.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.features.some(f => f.toLowerCase().includes(q));

      return matchesCat && matchesQuery;
    });
  }
}