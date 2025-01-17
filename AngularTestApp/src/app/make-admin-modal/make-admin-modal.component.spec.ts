import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeAdminModalComponent } from './make-admin-modal.component';

describe('MakeAdminModalComponent', () => {
  let component: MakeAdminModalComponent;
  let fixture: ComponentFixture<MakeAdminModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakeAdminModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MakeAdminModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
