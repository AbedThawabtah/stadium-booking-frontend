import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StadiumBrowse } from './stadium-browse';

describe('StadiumBrowse', () => {
  let component: StadiumBrowse;
  let fixture: ComponentFixture<StadiumBrowse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StadiumBrowse],
    }).compileComponents();

    fixture = TestBed.createComponent(StadiumBrowse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
