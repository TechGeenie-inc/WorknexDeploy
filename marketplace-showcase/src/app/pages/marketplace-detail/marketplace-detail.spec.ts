import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceDetail } from './marketplace-detail';

describe('MarketplaceDetail', () => {
  let component: MarketplaceDetail;
  let fixture: ComponentFixture<MarketplaceDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketplaceDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplaceDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
