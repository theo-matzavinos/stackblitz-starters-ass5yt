import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todos-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule],
  template: `
      <label>
        Search
        <input type="search" [ngModel]="search" (ngModelChange)="searchChange.emit($event)" />
      </label>
  `,
})
export class TodosSearchComponent {
  @Input({ required: true }) search?: string | null;

  @Output() searchChange = new EventEmitter<string | undefined | null>();
}
