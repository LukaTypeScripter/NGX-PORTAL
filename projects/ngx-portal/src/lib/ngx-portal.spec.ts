import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxPortal } from './ngx-portal';

describe('NgxPortal', () => {
  let component: NgxPortal;
  let fixture: ComponentFixture<NgxPortal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxPortal],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxPortal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
