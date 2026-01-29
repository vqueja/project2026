import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dividends } from './reits';

describe('Dividends', () => {
  let component: Dividends;
  let fixture: ComponentFixture<Dividends>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dividends]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Dividends);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
