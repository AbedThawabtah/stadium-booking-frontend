import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
  },
  {
  path: 'stadiums',
  loadComponent: () => import('./features/public/stadium-browse/stadium-browse').then(m => m.StadiumBrowseComponent)
},
{
  path: 'stadiums/:id',
  loadComponent: () => import('./features/public/stadium-detail/stadium-detail').then(m => m.StadiumDetailComponent)
},
{
  path: 'customer/my-reservations',
  canActivate: [roleGuard],
  data: { roles: ['CUSTOMER'] },
  loadComponent: () => import('./features/customer/my-reservations/my-reservations').then(m => m.MyReservationsComponent)
},
{
  path: 'owner/my-stadiums',
  canActivate: [roleGuard],
  data: { roles: ['STADIUM_OWNER'] },
  loadComponent: () => import('./features/owner/my-stadiums/my-stadiums').then(m => m.MyStadiumsComponent)
},
{
  path: 'owner/stadiums/new',
  canActivate: [roleGuard],
  data: { roles: ['STADIUM_OWNER'] },
  loadComponent: () => import('./features/owner/stadium-form/stadium-form').then(m => m.StadiumFormComponent)
},
{
  path: 'owner/stadiums/:id/edit',
  canActivate: [roleGuard],
  data: { roles: ['STADIUM_OWNER'] },
  loadComponent: () => import('./features/owner/stadium-form/stadium-form').then(m => m.StadiumFormComponent)
},
{
  path: 'owner/stadiums/:id/manage',
  canActivate: [roleGuard],
  data: { roles: ['STADIUM_OWNER'] },
  loadComponent: () => import('./features/owner/stadium-manage/stadium-manage').then(m => m.StadiumManageComponent)
},
{
  path: 'admin/dashboard',
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] },
  loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.DashboardComponent)
},
{
  path: 'admin/stadiums',
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] },
  loadComponent: () => import('./features/admin/stadium-approval/stadium-approval').then(m => m.StadiumApprovalComponent)
},
{
  path: 'admin/users',
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] },
  loadComponent: () => import('./features/admin/user-management/user-management').then(m => m.UserManagementComponent)
},
{
  path: 'admin/reviews',
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] },
  loadComponent: () => import('./features/admin/review-moderation/review-moderation').then(m => m.ReviewModerationComponent)
},
{
  path: 'admin/activity-logs',
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] },
  loadComponent: () => import('./features/admin/activity-log/activity-log').then(m => m.ActivityLogComponent)
},

];