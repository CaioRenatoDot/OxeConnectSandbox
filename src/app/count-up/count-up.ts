import { Directive, ElementRef, effect, inject, input } from '@angular/core';
import { animate } from 'motion';

// Anima um número de 0 (ou do valor anterior) até o valor atual: <strong [appCountUp]="total"></strong>
@Directive({ selector: '[appCountUp]' })
export class CountUp {
  readonly appCountUp = input.required<number>();
  readonly duration = input(1.2);

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private current = 0;

  constructor() {
    effect((onCleanup) => {
      const target = this.appCountUp();
      const controls = animate(this.current, target, {
        duration: this.duration(),
        ease: 'easeOut',
        onUpdate: (value) => {
          this.current = value;
          this.element.textContent = Math.round(value).toLocaleString('pt-BR');
        },
      });
      onCleanup(() => controls.stop());
    });
  }
}
