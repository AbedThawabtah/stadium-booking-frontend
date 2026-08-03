import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminNavComponent } from '../../../shared/components/admin-nav/admin-nav';
import { AdminService } from '../../../core/services/admin.service';
import { Stadium } from '../../../core/models/stadium.model';
import { ErrorResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-stadium-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './stadium-approval.html',
  styleUrl: './stadium-approval.scss'
})
export class StadiumApprovalComponent implements OnInit {

  private adminService = inject(AdminService);

  pendingStadiums = signal<Stadium[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  actionInProgress = signal<number | null>(null);

  // أداة سريعة للتعامل مع ملعب معروف الـ ID (لإيقاف/إعادة تفعيل، بسبب غياب endpoint لقائمة كل الملاعب)
  quickStadiumId = signal<number | null>(null);
  quickActionMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  quickActionLoading = signal(false);

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading.set(true);
    this.adminService.getPendingStadiums().subscribe({
      next: (data) => { this.pendingStadiums.set(data); this.loading.set(false); },
      error: () => {
        this.errorMessage.set('تعذر تحميل الملاعب المعلّقة');
        this.loading.set(false);
      }
    });
  }

  approve(id: number): void {
    this.actionInProgress.set(id);
    this.adminService.approveStadium(id).subscribe({
      next: () => {
        this.actionInProgress.set(null);
        this.pendingStadiums.update(list => list.filter(s => s.id !== id));
      },
      error: () => { this.actionInProgress.set(null); }
    });
  }

  suspend(id: number): void {
    this.actionInProgress.set(id);
    this.adminService.suspendStadium(id).subscribe({
      next: () => {
        this.actionInProgress.set(null);
        this.pendingStadiums.update(list => list.filter(s => s.id !== id));
      },
      error: () => { this.actionInProgress.set(null); }
    });
  }

  runQuickAction(action: 'suspend' | 'reactivate' | 'approve'): void {
    const id = this.quickStadiumId();
    if (!id) return;

    this.quickActionLoading.set(true);
    this.quickActionMessage.set(null);

    const request$ = action === 'suspend'
      ? this.adminService.suspendStadium(id)
      : action === 'reactivate'
        ? this.adminService.reactivateStadium(id)
        : this.adminService.approveStadium(id);

    request$.subscribe({
      next: (stadium) => {
        this.quickActionLoading.set(false);
        this.quickActionMessage.set({
          type: 'success',
          text: `تم تحديث حالة "${stadium.name}" بنجاح`
        });
      },
      error: (err: HttpErrorResponse) => {
        this.quickActionLoading.set(false);
        const body = err.error as ErrorResponse;
        this.quickActionMessage.set({
          type: 'error',
          text: body?.message ?? 'تعذر تنفيذ العملية. تأكد من رقم الملعب.'
        });
      }
    });
  }
}