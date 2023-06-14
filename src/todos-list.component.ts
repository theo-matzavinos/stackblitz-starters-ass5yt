import { NgFor } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { TodoViewModel } from './todos.component';

@Component({
  selector: 'app-todos-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgFor],
  styles: [],
  template: `
    <ul>
      <li *ngFor="let todo of todos; trackBy: trackTodo">
        <label>
          <input type="checkbox" [checked]="todo.isSelected" (change)="toggleTodoIsSelected.emit(todo)" />
          {{ todo.title }}
        </label>
      </li>
    </ul>
  `,
})
export class TodosListComponent {
  @Input({ required: true }) todos!: readonly TodoViewModel[];

  @Output() toggleTodoIsSelected = new EventEmitter<TodoViewModel>();

  trackTodo(_index: number, todo: TodoViewModel) {
    return todo.id;
  }
}
