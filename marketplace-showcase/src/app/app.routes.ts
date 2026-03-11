import { Routes } from "@angular/router";
import { Marketplace } from "./pages/marketplace/marketplace";
import { Home } from "./pages/home/home";
import { MarketplaceDetail } from "./pages/marketplace-detail/marketplace-detail";
import { MarketplaceCheckout } from "./pages/marketplace-checkout/marketplace-checkout";
import { Cocreation } from "./pages/cocreation/cocreation";

export const routes: Routes = [
  { path: "", component: Home, title: "Home" },
  { path: "marketplace", component: Marketplace, title: "Marketplace" },
  { path: "marketplace/:id", component: MarketplaceDetail, title: "App Details" },
  
  { path: "cocriacao", component: Cocreation, title: "Co-criação" },

  { path: "marketplace/:id/checkout", component: MarketplaceCheckout, title: "Checkout" },

  { path: "**", redirectTo: "marketplace" },
];