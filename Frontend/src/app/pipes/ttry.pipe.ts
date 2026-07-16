import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'tryFormat', standalone: true })
export class TryFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, decimals: number = 0): string {
    if (value == null || isNaN(value)) return '₺0';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}
