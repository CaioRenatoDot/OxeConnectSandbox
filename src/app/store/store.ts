import { Injectable, computed, effect, signal } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  icon: string;
  stock: number;
}

export interface CartItem {
  productId: number;
  quantity: number;
}

const PRODUCTS_KEY = 'store.products';
const CART_KEY = 'store.cart';

const SEED: Product[] = [
  { id: 1, name: 'Fone Bluetooth', description: 'Som limpo e bateria de 30h.', price: 199.9, icon: 'headphones', stock: 10 },
  { id: 2, name: 'Smartwatch', description: 'Monitore sua saúde e notificações.', price: 349.0, icon: 'watch', stock: 5 },
  { id: 3, name: 'Notebook', description: 'Leve, rápido e com SSD de 512GB.', price: 3899.0, icon: 'laptop', stock: 3 },
  { id: 4, name: 'Câmera', description: 'Fotos em 4K para todos os momentos.', price: 1599.9, icon: 'photo_camera', stock: 4 },
  { id: 5, name: 'Teclado Mecânico', description: 'Switches táteis e RGB.', price: 289.5, icon: 'keyboard', stock: 8 },
  { id: 6, name: 'Mouse Gamer', description: 'Sensor de alta precisão 16000 DPI.', price: 149.9, icon: 'mouse', stock: 12 },
  { id: 7, name: 'Feijão', description: 'Grãos bons e baratos.', price: 5.9, icon: 'grain', stock: 4 },
];

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Estoque e carrinho persistidos no localStorage, simulando um banco de dados. */
@Injectable({ providedIn: 'root' })
export class Store {
  readonly products = signal<Product[]>(load(PRODUCTS_KEY, SEED));
  readonly cart = signal<CartItem[]>(load(CART_KEY, []));

  readonly cartLines = computed(() =>
    this.cart().map((item) => ({
      ...item,
      product: this.products().find((p) => p.id === item.productId)!,
    })),
  );
  readonly cartCount = computed(() => this.cart().reduce((sum, i) => sum + i.quantity, 0));
  readonly total = computed(() =>
    this.cartLines().reduce((sum, l) => sum + l.product.price * l.quantity, 0),
  );

  constructor() {
    effect(() => localStorage.setItem(PRODUCTS_KEY, JSON.stringify(this.products())));
    effect(() => localStorage.setItem(CART_KEY, JSON.stringify(this.cart())));
  }

  /** Tira 1 unidade do estoque e coloca no carrinho. */
  add(productId: number): boolean {
    const product = this.products().find((p) => p.id === productId);
    if (!product || product.stock <= 0) return false;

    this.changeStock(productId, -1);
    this.cart.update((items) =>
      items.some((i) => i.productId === productId)
        ? items.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i))
        : [...items, { productId, quantity: 1 }],
    );
    return true;
  }

  /** Tira 1 unidade do carrinho e devolve ao estoque. */
  decrease(productId: number): void {
    const item = this.cart().find((i) => i.productId === productId);
    if (!item) return;

    this.changeStock(productId, 1);
    this.cart.update((items) =>
      item.quantity > 1
        ? items.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i))
        : items.filter((i) => i.productId !== productId),
    );
  }

  /** Remove o item inteiro do carrinho, devolvendo tudo ao estoque. */
  remove(productId: number): void {
    const item = this.cart().find((i) => i.productId === productId);
    if (!item) return;

    this.changeStock(productId, item.quantity);
    this.cart.update((items) => items.filter((i) => i.productId !== productId));
  }

  clearCart(): void {
    for (const item of this.cart()) this.changeStock(item.productId, item.quantity);
    this.cart.set([]);
  }

  private changeStock(productId: number, delta: number): void {
    this.products.update((list) =>
      list.map((p) => (p.id === productId ? { ...p, stock: p.stock + delta } : p)),
    );
  }
}
