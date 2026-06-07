import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'custom-custom-form-control',
  standalone: true,
  imports: [],
  templateUrl: './custom-form-control.component.html',
  styleUrl: './custom-form-control.component.scss'
})
export class CustomFormControlComponent implements OnInit{

  @Input() private hostComponent!: any;

  ngOnInit() {
    console.log(this.hostComponent);
    // this.hostComponent.form.
  }

}
