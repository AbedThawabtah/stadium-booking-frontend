import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StadiumService } from '../../../core/services/stadium.service';
import { MyStadium } from '../../../core/models/stadium.model';

@Component({
  selector: 'app-my-stadiums',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-stadiums.html',
  styleUrl: './my-stadiums.scss'
})
export class MyStadiumsComponent implements OnInit {

  private stadiumService = inject(StadiumService);

  stadiums = signal<MyStadium[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.stadiumService.getMyStadiums().subscribe({
      next: (data) => {
        this.stadiums.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('تعذر تحميل ملاعبك. حاول مرة أخرى.');
        this.loading.set(false);
      }
    });
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'نشط';
      case 'PENDING_APPROVAL': return 'بانتظار الموافقة';
      case 'SUSPENDED': return 'موقوف';
      default: return status;
    }
  }
}