import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyStadiums } from './my-stadiums';

describe('MyStadiums', () => {
  let component: MyStadiums;
  let fixture: ComponentFixture<MyStadiums>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyStadiums],
    }).compileComponents();

    fixture = TestBed.createComponent(MyStadiums);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
