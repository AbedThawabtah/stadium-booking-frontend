import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StadiumManage } from './stadium-manage';

describe('StadiumManage', () => {
  let component: StadiumManage;
  let fixture: ComponentFixture<StadiumManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StadiumManage],
    }).compileComponents();

    fixture = TestBed.createComponent(StadiumManage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
