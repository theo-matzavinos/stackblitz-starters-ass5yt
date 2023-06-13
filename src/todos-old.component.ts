import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, map, Subscription, switchMap, tap } from 'rxjs';
import { ApiService, Todo } from './api.service';
import { AsyncStatus } from './async-status';
import { TodoViewModel } from './todos-new-state.service';
import TodosComponent from './todos.component';

@Component({
  selector: 'app-todos-old',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TodosComponent],
  template: `
    <app-todos
      [search]="search"
      [todos]="todoViewModels"
      [loadingStatus]="loadingStatus"
      [addStatus]="addStatus"
      (searchChange)="searchTodos($event)"
      (toggleTodoIsSelected)="toggleTodoIsSelected($event)"
      (addTodo)="addTodo($event)"
    />
  `,
})
export default class TodosOldComponent implements OnInit, OnDestroy {
  todoViewModels: TodoViewModel[] = [];
  search?: string | null;
  loadingStatus: AsyncStatus = AsyncStatus.Init;
  loadingError?: string;
  addStatus: AsyncStatus = AsyncStatus.Init;
  addError?: string;

  private apiService = inject(ApiService);
  private search$ = inject(ActivatedRoute).queryParamMap.pipe(
    map((queryParamMap) => queryParamMap.get('search'))
  );
  private todos: Todo[] = [];
  private selectedIds: number[] = [];
  private router = inject(Router);
  private subscription = new Subscription();

  toggleTodoIsSelected(todo: TodoViewModel) {
    if (todo.isSelected) {
      this.selectedIds = this.selectedIds.filter(
        (todoId) => todoId !== todo.id
      );
    } else {
      this.selectedIds = [...this.selectedIds, todo.id];
    }
  }

  searchTodos(search: string | undefined | null) {
    this.router.navigate([], {
      queryParams: { search: search?.trim() || undefined },
    });
  }

  addTodo(title: string) {
    this.addError = undefined;
    this.addStatus = AsyncStatus.Pending;

    this.subscription.add(
      this.apiService
        .addTodo(title)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.addError = error.message;
            this.addStatus = AsyncStatus.Error;

            return EMPTY;
          })
        )
        .subscribe((todo) => {
          this.todos = [...this.todos, todo];
          this.todoViewModels = [...this.todoViewModels, todo];
          this.addStatus = AsyncStatus.Success;
        })
    );
  }

  ngOnInit(): void {
    this.subscription.add(
      this.search$
        .pipe(
          tap((search) => {
            this.search = search;
            this.loadingStatus = AsyncStatus.Pending;
          }),
          switchMap((search) =>
            this.apiService.getTodos(search).pipe(
              catchError((error: HttpErrorResponse) => {
                this.loadingError = error.message;
                this.loadingStatus = AsyncStatus.Error;

                return EMPTY;
              })
            )
          )
        )
        .subscribe((todos) => {
          this.loadingStatus = AsyncStatus.Success;
          this.todos = todos;
          this.createTodoViewModels();
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private createTodoViewModels() {
    this.todoViewModels = this.todos.map((todo) => {
      if (this.selectedIds.includes(todo.id)) {
        return {
          ...todo,
          isSelected: true,
        };
      }

      return todo;
    });
  }
}
