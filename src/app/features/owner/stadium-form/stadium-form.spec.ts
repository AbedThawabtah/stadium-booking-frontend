import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StadiumForm } from './stadium-form';

describe('StadiumForm', () => {
  let component: StadiumForm;
  let fixture: ComponentFixture<StadiumForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StadiumForm],
    }).compileComponents();

    fixture = TestBed.createComponent(StadiumForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
