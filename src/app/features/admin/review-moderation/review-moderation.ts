import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminNavComponent } from '../../../shared/components/admin-nav/admin-nav';
import { AdminService } from '../../../core/services/admin.service';
import { Review } from '../../../core/models/review.model';

@Component({
  selector: 'app-review-moderation',
  standalone: true,
  imports: [CommonModule, AdminNavComponent],
  templateUrl: './review-moderation.html',
  styleUrl: './review-moderation.scss'
})
export class ReviewModerationComponent implements OnInit {

  private adminService = inject(AdminService);

  pendingReviews = signal<Review[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  actionInProgress = signal<number | null>(null);

  ngOnInit(): void {
    this.adminService.getPendingReviews().subscribe({
      next: (data) => { this.pendingReviews.set(data); this.loading.set(false); },
      error: () => {
        this.errorMessage.set('تعذر تحميل التقييمات المعلّقة');
        this.loading.set(false);
      }
    });
  }

  approve(id: number): void {
    this.actionInProgress.set(id);
    this.adminService.approveReview(id).subscribe({
      next: () => {
        this.actionInProgress.set(null);
        this.pendingReviews.update(list => list.filter(r => r.id !== id));
      },
      error: () => { this.actionInProgress.set(null); }
    });
  }

  reject(id: number): void {
    this.actionInProgress.set(id);
    this.adminService.rejectReview(id).subscribe({
      next: () => {
        this.actionInProgress.set(null);
        this.pendingReviews.update(list => list.filter(r => r.id !== id));
      },
      error: () => { this.actionInProgress.set(null); }
    });
  }
}