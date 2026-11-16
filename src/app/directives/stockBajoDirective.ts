import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appStockBajo]',
  standalone: true
})
export class StockBajoDirective implements OnChanges {
  @Input('appStockBajo') esStockBajo: boolean = false;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.esStockBajo) {
      this.el.nativeElement.style.backgroundColor = '#fef2f2';
      this.el.nativeElement.style.color = '#991b1b';
      this.el.nativeElement.style.fontWeight = '600';
    } else {
      this.el.nativeElement.style.backgroundColor = '';
      this.el.nativeElement.style.color = '';
      this.el.nativeElement.style.fontWeight = '';
    }
  }
}
