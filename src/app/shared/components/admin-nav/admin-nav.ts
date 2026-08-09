import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-nav.html',
  styleUrl: './admin-nav.scss'
})
export class AdminNavComponent implements OnInit {

  private adminService = inject(AdminService);

  // شارات "بحاجة انتباه" بجانب تبويبَي الملاعب والتقييمات. هذا المكوّن مشترك
  // ومستقل عن كل صفحة، فنجلب العدّادين من /admin/dashboard (نفس المصدر الذي
  // تعرضه صفحة الداشبورد) بدل تكرار جلب قوائم pending كاملة فقط لعدّها —
  // لا منطق أعمال جديد هنا، فقط عرض عددين موجودين أصلاً في DashboardStats.
  pendingStadiumsCount = signal(0);
  pendingReviewsCount = signal(0);

  ngOnInit(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.pendingStadiumsCount.set(stats.pendingStadiums);
        this.pendingReviewsCount.set(stats.pendingReviews);
      },
      // الشارات ثانوية بحتة — فشل صامت هنا يجب ألا يكسر شريط التنقّل نفسه
      error: () => {}
    });
  }
}
