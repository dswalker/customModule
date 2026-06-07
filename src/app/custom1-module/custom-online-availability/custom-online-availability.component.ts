import {Component, DestroyRef, inject, Input, OnInit} from '@angular/core';
import {MatButton, MatButtonModule} from "@angular/material/button";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Observable, tap} from "rxjs";

@Component({
  selector: 'custom-custom-online-availability',
  standalone: true,
  imports: [
MatButtonModule
  ],
  templateUrl: './custom-online-availability.component.html',
  styleUrl: './custom-online-availability.component.scss'
})
export class CustomOnlineAvailabilityComponent implements OnInit{
  @Input() private hostComponent!: any;
  destoryRef = inject(DestroyRef);

  ngOnInit() {
    console.log(this.hostComponent);
    (this.hostComponent.viewModel$ as Observable<any>).pipe(tap((vm) => {
      vm.onlineLinks.push(
        {source: 'link', type: 'test', url: 'https://proxy.bc.edu/login?url=https://muse.jhu.edu/article/947945'});
    }), takeUntilDestroyed(this.destoryRef)).subscribe();
  }


}
