import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncStatus } from './async-status';

@Component({
  selector: 'app-add-todo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule],
  styles: [],
  template: `
    <form (ngSubmit)="addTodo.emit(title)">
      <label>
        Title
        <input type="text" name="title" [(ngModel)]="title" required />
      </label>
      <button [disabled]="addStatus === '${AsyncStatus.Pending}'">Add</button>
    </form>
  `,
})
export class AddTodoComponent implements OnChanges {
  @Input({ required: true }) addStatus!: AsyncStatus;

  @Output() addTodo = new EventEmitter<string>();

  title = '';

  ngOnChanges() {
    if (this.addStatus === AsyncStatus.Success) {
      this.title = '';
    }
  }
}
