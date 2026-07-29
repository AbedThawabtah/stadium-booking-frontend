import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarRatingComponent {

  rating = input<number | null>(0);
  reviewCount = input<number>(0);

  protected readonly clamped = computed(() => Math.max(0, Math.min(5, this.rating() ?? 0)));
  protected readonly hasReviews = computed(() => (this.rating() ?? 0) > 0 && this.reviewCount() > 0);
  protected readonly ariaLabel = computed(() => `التقييم: ${this.clamped().toFixed(1)} من 5`);

  // كل نجمة تاخذ 0 / 50 / 100% تعبئة حسب التقييم، مقربة لأقرب نصف نجمة
  protected readonly starFills = computed<number[]>(() => {
    const rounded = Math.round(this.clamped() * 2) / 2;
    return Array.from({ length: 5 }, (_, i) => {
      const diff = rounded - i;
      if (diff >= 1) return 100;
      if (diff <= 0) return 0;
      return 50;
    });
  });
}
