import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminNavComponent } from '../../../shared/components/admin-nav/admin-nav';
import { AdminService } from '../../../core/services/admin.service';
import { ActivityLog } from '../../../core/models/admin.model';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule, AdminNavComponent],
  templateUrl: './activity-log.html',
  styleUrl: './activity-log.scss'
})
export class ActivityLogComponent implements OnInit {

  private adminService = inject(AdminService);

  logs = signal<ActivityLog[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.adminService.getAllActivityLogs().subscribe({
      next: (data) => {
        const sorted = [...data].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.logs.set(sorted);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('تعذر تحميل سجل النشاطات');
        this.loading.set(false);
      }
    });
  }
}