import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BriefResultComponent } from './brief-result.component';

describe('BriefResultComponent', () => {
  let component: BriefResultComponent;
  let fixture: ComponentFixture<BriefResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BriefResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BriefResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
