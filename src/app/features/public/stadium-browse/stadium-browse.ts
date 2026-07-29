import { Component, OnInit, signal, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, switchMap, tap } from 'rxjs';
import { StadiumService } from '../../../core/services/stadium.service';
import { Stadium } from '../../../core/models/stadium.model';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating';

type FilterKey = 'keyword' | 'city' | 'sportType' | 'minPrice' | 'maxPrice';
type SportIcon = 'soccer' | 'basketball' | 'volleyball' | 'tennis' | 'generic';

interface ActiveFilterChip {
  key: FilterKey;
  label: string;
}

@Component({
  selector: 'app-stadium-browse',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StarRatingComponent],
  templateUrl: './stadium-browse.html',
  styleUrl: './stadium-browse.scss'
})
export class StadiumBrowseComponent implements OnInit {

  private fb = inject(FormBuilder);
  private stadiumService = inject(StadiumService);
  private router = inject(Router);

  stadiums = signal<Stadium[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = 9;

  filterForm = this.fb.group({
    keyword: [''],
    city: [''],
    sportType: [''],
    minPrice: [null as number | null],
    maxPrice: [null as number | null],
    sort: ['createdAt,desc']
  });

  private search$ = new Subject<void>();

  // --- UI-only state (لا يؤثر على منطق البحث/الفلترة الفعلي) ---
  filtersExpanded = signal(false);
  scrolled = signal(false);
  private formSnapshot = signal(this.filterForm.getRawValue());

  private static readonly SORT_LABELS: Record<string, string> = {
    'createdAt,desc': 'الأحدث',
    'pricePerHour,asc': 'السعر: من الأقل للأعلى',
    'pricePerHour,desc': 'السعر: من الأعلى للأقل',
    'averageRating,desc': 'الأعلى تقييمًا'
  };

  sortLabel = computed(() => {
    const sort = this.formSnapshot().sort;
    return StadiumBrowseComponent.SORT_LABELS[sort ?? ''] ?? StadiumBrowseComponent.SORT_LABELS['createdAt,desc'];
  });

  activeFilterChips = computed<ActiveFilterChip[]>(() => {
    const v = this.formSnapshot();
    const chips: ActiveFilterChip[] = [];

    if (v.keyword) chips.push({ key: 'keyword', label: `الكلمة: ${v.keyword}` });
    if (v.city) chips.push({ key: 'city', label: `المدينة: ${v.city}` });
    if (v.sportType) chips.push({ key: 'sportType', label: `الرياضة: ${v.sportType}` });
    if (v.minPrice != null) chips.push({ key: 'minPrice', label: `أعلى من ${v.minPrice} ₪` });
    if (v.maxPrice != null) chips.push({ key: 'maxPrice', label: `أقل من ${v.maxPrice} ₪` });

    return chips;
  });

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(400),
        tap(() => this.loading.set(true)),
        switchMap(() => {
          const raw = this.filterForm.getRawValue();
          return this.stadiumService.search({
            keyword: raw.keyword || undefined,
            city: raw.city || undefined,
            sportType: raw.sportType || undefined,
            minPrice: raw.minPrice ?? undefined,
            maxPrice: raw.maxPrice ?? undefined,
            sort: raw.sort || undefined,
            page: this.currentPage(),
            size: this.pageSize
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.stadiums.set(res.content);
          this.totalPages.set(res.page.totalPages);
          this.totalElements.set(res.page.totalElements);
          this.loading.set(false);
          this.errorMessage.set(null);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('تعذر تحميل الملاعب. حاول مرة أخرى.');
        }
      });

    // فحص أول مرة
    this.triggerSearch();

    // أي تغيير بالفلاتر يرجع للصفحة الأولى ويعيد البحث
    this.filterForm.valueChanges.subscribe(() => {
      this.formSnapshot.set(this.filterForm.getRawValue());
      this.currentPage.set(0);
      this.triggerSearch();
    });
  }

  triggerSearch(): void {
    this.search$.next();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.triggerSearch();
  }

  viewStadium(id: number): void {
    this.router.navigate(['/stadiums', id]);
  }

  clearFilters(): void {
    this.filterForm.reset({
      keyword: '',
      city: '',
      sportType: '',
      minPrice: null,
      maxPrice: null,
      sort: 'createdAt,desc'
    });
  }

  // إزالة فلتر واحد فقط (من شريحة الفلاتر النشطة) عبر نفس الفورم كنترول،
  // فيمر بنفس مسار valueChanges -> triggerSearch الموجود أصلاً.
  removeFilter(key: FilterKey): void {
    const resetValue = key === 'minPrice' || key === 'maxPrice' ? null : '';
    this.filterForm.get(key)?.setValue(resetValue);
  }

  toggleFiltersExpanded(): void {
    this.filtersExpanded.update(v => !v);
  }

  // تخمين أيقونة مناسبة من نص نوع الرياضة الحر القادم من الباك اند (عرض فقط).
  sportIcon(sportType: string | null | undefined): SportIcon {
    const value = (sportType || '').toLowerCase();

    if (value.includes('سلة') || value.includes('basket')) return 'basketball';
    if (value.includes('طائرة') || value.includes('volley')) return 'volleyball';
    if (value.includes('تنس') || value.includes('tennis') || value.includes('بادل') || value.includes('padel')) return 'tennis';
    if (value.includes('قدم') || value.includes('football') || value.includes('soccer')) return 'soccer';

    return 'generic';
  }

  // نطاق صفحات مختصر للعرض فقط (1 2 3 … 8 9 10) — يستخدم نفس currentPage/totalPages
  // ونفس goToPage() دون أي تغيير على منطق التنقل الفعلي.
  pageItems = computed<(number | 'ellipsis')[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i);
    }

    const items: (number | 'ellipsis')[] = [0];

    if (current > 2) items.push('ellipsis');

    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);
    for (let i = start; i <= end; i++) items.push(i);

    if (current < total - 3) items.push('ellipsis');

    items.push(total - 1);
    return items;
  });
}