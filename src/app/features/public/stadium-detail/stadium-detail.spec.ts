import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StadiumDetail } from './stadium-detail';

describe('StadiumDetail', () => {
  let component: StadiumDetail;
  let fixture: ComponentFixture<StadiumDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StadiumDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(StadiumDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
