import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropietarioSalonesComponent } from './propietario-salones.component';

describe('PropietarioSalonesComponent', () => {
  let component: PropietarioSalonesComponent;
  let fixture: ComponentFixture<PropietarioSalonesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropietarioSalonesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropietarioSalonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
