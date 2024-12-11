import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfotravelComponent } from './infotravel.component';

describe('InfotravelComponent', () => {
  let component: InfotravelComponent;
  let fixture: ComponentFixture<InfotravelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfotravelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfotravelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
