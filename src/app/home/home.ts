import { Component, ElementRef, afterNextRender, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Toast } from '../toast/toast';
import { animate, hover, stagger } from 'motion';
import { Product, Store } from '../store/store';

@Component({
  imports: [
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatListModule,
    MatDividerModule,
  ],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  private readonly toast = inject(Toast);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly store = inject(Store);

  constructor() {
    // Roda só no browser, depois que o DOM foi renderizado (equivale ao useEffect(..., []))
    afterNextRender(() => {
      const cards = this.host.nativeElement.querySelectorAll<HTMLElement>('.product');

      // Entrada em sequência com spring
      animate(
        cards,
        { opacity: [0, 1], y: [40, 0], scale: [0.9, 1] },
        { type: 'spring', stiffness: 260, damping: 20, delay: stagger(0.08) },
      );

      // Hover: equivale ao whileHover do Framer Motion
      hover(cards, (card) => {
        animate(card, { y: -8, scale: 1.02 }, { type: 'spring', stiffness: 400, damping: 15 });

        // Função retornada roda ao sair do hover
        return () => animate(card, { y: 0, scale: 1 }, { type: 'spring', stiffness: 400, damping: 15 });
      });
    });
  }

  protected addToCart(product: Product): void {
    const added = this.store.add(product.id);
    if (!added) {
      this.toast.error(`${product.name} sem estoque`);
      return;
    }
    this.toast.success(`${product.name} adicionado ao carrinho`);

    // "Pulo" no ícone do carrinho a cada produto adicionado
    const cartIcon = this.host.nativeElement.querySelector('.cart-icon');
    if (cartIcon) {
      animate(cartIcon, { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] }, { duration: 0.4 });
    }
  }
}
