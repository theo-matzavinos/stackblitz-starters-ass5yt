import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { defer } from 'rxjs';
import { TodosNewStateService, TodoViewModel } from './todos-new-state.service';
import TodosComponent from './todos.component';

@Component({
  selector: 'app-todos-new',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, AsyncPipe, TodosComponent],
  providers: [TodosNewStateService],
  template: `
    <app-todos
      *ngIf="viewModel$ | async as viewModel"
      [search]="viewModel.search"
      [todos]="viewModel.todos"
      [loadingStatus]="viewModel.loadingStatus"
      [addStatus]="viewModel.addStatus"
      (searchChange)="searchTodos($event)"
      (toggleTodoIsSelected)="toggleTodoIsSelected($event)"
      (addTodo)="addTodo($event)"
    />
  `,
})
export default class TodosNewComponent {
  viewModel$ = defer(() => this.todosNewStateService.viewModel$);

  private todosNewStateService = inject(TodosNewStateService);

  // constructor() {
  //   this.viewModel$ = this.todosNewStateService.viewModel$;
  // }

  toggleTodoIsSelected(todo: TodoViewModel) {
    this.todosNewStateService.toggleTodoIsSelected(todo);
  }

  searchTodos(search: string | undefined | null) {
    this.todosNewStateService.searchTodos(search);
  }

  addTodo(title: string) {
    this.todosNewStateService.addTodo(title);
  }
}
