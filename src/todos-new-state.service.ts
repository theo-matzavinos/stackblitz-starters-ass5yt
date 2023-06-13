import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { map, Observable, switchMap, tap } from 'rxjs';
import { ReadonlyDeep } from 'type-fest';
import { ApiService, Todo } from './api.service';
import { AsyncStatus } from './async-status';

type TodosNewState = ReadonlyDeep<{
  todos: Todo[];
  selectedIds: number[];
  loadingStatus: AsyncStatus;
  loadingError?: string;
}>;

const initialState: TodosNewState = {
  loadingStatus: AsyncStatus.Init,
  todos: [],
  selectedIds: [],
};

export type TodoViewModel = ReadonlyDeep<Todo & { isSelected: boolean }>;

export type TodosNewViewModel = ReadonlyDeep<{
  todos: TodoViewModel[];
  loadingStatus: AsyncStatus;
  loadingError?: string;
  search: string | null;
}>;

@Injectable()
export class TodosNewStateService {
  viewModel$: Observable<TodosNewState>;

  private componentStore = new ComponentStore(initialState);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private search$ = inject(ActivatedRoute).queryParamMap.pipe(
    map((queryParamMap) => queryParamMap.get('search'))
  );

  constructor() {
    this.viewModel$ = this.componentStore.state$;

    this.loadTodos(this.search$);
  }

  searchTodos(search?: string) {
    this.router.navigate([], { queryParams: { search } });
  }

  toggleTodoIsSelected = this.componentStore.updater<TodoViewModel>(
    (state, todo) => {
      if (todo.isSelected) {
        return {
          ...state,
          selectedIds: state.selectedIds.filter((todoId) => todoId !== todo.id),
        };
      }

      return {
        ...state,
        selectedIds: [...state.selectedIds, todo.id],
      };
    }
  );

  reset = this.componentStore.effect<void>((input$) =>
    input$.pipe(
      tap(() => {
        this.componentStore.setState(initialState);
        this.searchTodos();
      })
    )
  );

  private loadTodos = this.componentStore.effect<string | null>((search$) =>
    search$.pipe(
      tap(() => {
        this.componentStore.setState((state) => ({
          ...state,
          loadingError: undefined,
          loadingStatus: AsyncStatus.Pending,
        }));

        // this.componentStore.patchState({
        //   loadingError: undefined,
        //   loadingStatus: AsyncStatus.Pending,
        // });
      }),
      switchMap(search => this.apiService.searchTodos)
    )
  );
}
