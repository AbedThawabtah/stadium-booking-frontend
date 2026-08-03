import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavComponent } from '../../../shared/components/admin-nav/admin-nav';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserSummary } from '../../../core/models/admin.model';

type RoleFilter = 'ALL' | 'CUSTOMER' | 'STADIUM_OWNER' | 'ADMIN';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss'
})
export class UserManagementComponent implements OnInit {

  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  users = signal<UserSummary[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  togglingId = signal<number | null>(null);

  roleFilter = signal<RoleFilter>('ALL');
  searchTerm = signal('');

  currentUserId = this.authService.currentUser()?.userId;

  filteredUsers = computed(() => {
    let list = this.users();

    const role = this.roleFilter();
    if (role !== 'ALL') {
      list = list.filter(u => u.role === role);
    }

    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      list = list.filter(u =>
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data) => { this.users.set(data); this.loading.set(false); },
      error: () => {
        this.errorMessage.set('تعذر تحميل المستخدمين');
        this.loading.set(false);
      }
    });
  }

  setRoleFilter(role: RoleFilter): void {
    this.roleFilter.set(role);
  }

  toggleStatus(user: UserSummary): void {
    this.togglingId.set(user.id);
    this.adminService.toggleUserStatus(user.id).subscribe({
      next: (updated) => {
        this.togglingId.set(null);
        this.users.update(list =>
          list.map(u => (u.id === updated.id ? updated : u))
        );
      },
      error: () => { this.togglingId.set(null); }
    });
  }

  roleLabel(role: string): string {
    switch (role) {
      case 'CUSTOMER': return 'عميل';
      case 'STADIUM_OWNER': return 'صاحب ملعب';
      case 'ADMIN': return 'أدمن';
      default: return role;
    }
  }
}