import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StadiumApproval } from './stadium-approval';

describe('StadiumApproval', () => {
  let component: StadiumApproval;
  let fixture: ComponentFixture<StadiumApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StadiumApproval],
    }).compileComponents();

    fixture = TestBed.createComponent(StadiumApproval);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
