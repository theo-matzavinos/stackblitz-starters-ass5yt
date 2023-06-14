import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  catchError,
  defer,
  EMPTY,
  map,
  mergeMap,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { ReadonlyDeep } from 'type-fest';
import { ApiService, Todo } from './api.service';
import { AsyncStatus } from './async-status';
import { TodoViewModel } from './todos.component';

type TodosNewState = ReadonlyDeep<{
  todos: Todo[];
  selectedIds: number[];
  loadingStatus: AsyncStatus;
  loadingError?: string;
  addStatus: AsyncStatus;
  addError?: string;
}>;

const initialState: TodosNewState = {
  addStatus: AsyncStatus.Init,
  loadingStatus: AsyncStatus.Init,
  todos: [],
  selectedIds: [],
};


export type TodosNewViewModel = ReadonlyDeep<{
  todos: TodoViewModel[];
  loadingStatus: AsyncStatus;
  loadingError?: string;
  addStatus: AsyncStatus;
  addError?: string;
  search: string | null;
}>;

@Injectable()
export class TodosNewStateService {
  viewModel$: Observable<TodosNewViewModel>;

  private componentStore = new ComponentStore(initialState);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private search$ = inject(ActivatedRoute).queryParamMap.pipe(
    map((queryParamMap) => queryParamMap.get('search'))
  );
  private todos$ = this.componentStore.select((state) => state.todos);
  private selectedIds$ = this.componentStore.select(
    (state) => state.selectedIds
  );
  private todoViewModels$ = this.componentStore.select(
    this.todos$,
    this.selectedIds$,
    (todos, selectedIds) =>
      todos.map((todo) => {
        if (selectedIds.includes(todo.id)) {
          return {
            ...todo,
            isSelected: true,
          };
        }

        return todo;
      })
  );

  constructor() {
    this.viewModel$ = this.componentStore.select({
      todos: this.todoViewModels$,
      loadingStatus: this.componentStore.select((state) => state.loadingStatus),
      loadingError: this.componentStore.select((state) => state.loadingError),
      addStatus: this.componentStore.select((state) => state.addStatus),
      addError: this.componentStore.select((state) => state.addError),
      search: this.search$,
    });

    this.loadTodos(this.search$);
  }

  searchTodos(search?: string | null | undefined) {
    this.router.navigate([], {
      queryParams: { search: search?.trim() || undefined },
    });
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

  addTodo = this.componentStore.effect<string>((title$) =>
    title$.pipe(
      tap(() => {
        this.componentStore.patchState({
          addError: undefined,
          addStatus: AsyncStatus.Pending,
        });
      }),
      mergeMap((title) =>
        this.apiService.addTodo(title).pipe(
          tap((todo) => {
            this.componentStore.setState((state) => ({
              ...state,
              todos: [...state.todos, todo],
              addStatus: AsyncStatus.Success,
            }));
          }),
          catchError((error: HttpErrorResponse) => {
            this.componentStore.patchState({
              addError: error.message,
              addStatus: AsyncStatus.Error,
            });

            return EMPTY;
          })
        )
      )
    )
  );

  private loadTodos = this.componentStore.effect<string | null>((search$) =>
    search$.pipe(
      tap(() => {
        this.componentStore.patchState({
          loadingError: undefined,
          loadingStatus: AsyncStatus.Pending,
        });
      }),
      switchMap((search) =>
        this.apiService.getTodos(search).pipe(
          tapResponse(
            (todos) => {
              this.componentStore.patchState({
                todos,
                loadingStatus: AsyncStatus.Success,
              });
            },
            (error: HttpErrorResponse) => {
              this.componentStore.patchState({
                loadingError: error.message,
                loadingStatus: AsyncStatus.Error,
              });
            }
          )
        )
      )
    )
  );
}

@Injectable()
export class TodosNewStateServiceV2 {
  viewModel$: Observable<TodosNewViewModel>;

  private componentStore = new ComponentStore(initialState);
  private apiService = inject(ApiService);
  private router = inject(Router);

  constructor() {
    const search$ = inject(ActivatedRoute).queryParamMap.pipe(
      map((queryParamMap) => queryParamMap.get('search'))
    );
    const todos$ = this.componentStore.select((state) => state.todos);
    const selectedIds$ = this.componentStore.select(
      (state) => state.selectedIds
    );
    const todoViewModels$ = this.componentStore.select(
      todos$,
      selectedIds$,
      (todos, selectedIds) =>
        todos.map((todo) => {
          if (selectedIds.includes(todo.id)) {
            return {
              ...todo,
              isSelected: true,
            };
          }

          return todo;
        })
    );
    this.viewModel$ = this.componentStore.select({
      todos: todoViewModels$,
      loadingStatus: this.componentStore.select((state) => state.loadingStatus),
      loadingError: this.componentStore.select((state) => state.loadingError),
      addStatus: this.componentStore.select((state) => state.addStatus),
      addError: this.componentStore.select((state) => state.addError),
      search: search$,
    });

    this.componentStore.effect<string | null>((search$) =>
      search$.pipe(
        tap(() => {
          this.componentStore.patchState({
            loadingError: undefined,
            loadingStatus: AsyncStatus.Pending,
          });
        }),
        switchMap((search) =>
          this.apiService.getTodos(search).pipe(
            tapResponse(
              (todos) => {
                this.componentStore.patchState({
                  todos,
                  loadingStatus: AsyncStatus.Success,
                });
              },
              (error: HttpErrorResponse) => {
                this.componentStore.patchState({
                  loadingError: error.message,
                  loadingStatus: AsyncStatus.Error,
                });
              }
            )
          )
        )
      )
    )(search$);
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

  addTodo = this.componentStore.effect<string>((title$) =>
    title$.pipe(
      tap(() => {
        this.componentStore.patchState({
          addError: undefined,
          addStatus: AsyncStatus.Pending,
        });
      }),
      mergeMap((title) =>
        this.apiService.addTodo(title).pipe(
          tap((todo) => {
            this.componentStore.setState((state) => ({
              ...state,
              todos: [...state.todos, todo],
              addStatus: AsyncStatus.Success,
            }));
          }),
          catchError((error: HttpErrorResponse) => {
            this.componentStore.patchState({
              addError: error.message,
              addStatus: AsyncStatus.Error,
            });

            return EMPTY;
          })
        )
      )
    )
  );
}

@Injectable()
export class TodosNewStateServiceV3 {
  viewModel$ = defer(() => {
    const todos$ = this.componentStore.select((state) => state.todos);
    const selectedIds$ = this.componentStore.select(
      (state) => state.selectedIds
    );
    const todoViewModels$ = this.componentStore.select(
      todos$,
      selectedIds$,
      (todos, selectedIds) =>
        todos.map((todo) => {
          if (selectedIds.includes(todo.id)) {
            return {
              ...todo,
              isSelected: true,
            };
          }

          return todo;
        })
    );

    return this.componentStore.select({
      todos: todoViewModels$,
      loadingStatus: this.componentStore.select((state) => state.loadingStatus),
      loadingError: this.componentStore.select((state) => state.loadingError),
      addStatus: this.componentStore.select((state) => state.addStatus),
      addError: this.componentStore.select((state) => state.addError),
      search: this.search$,
    });
  });

  private componentStore = new ComponentStore(initialState);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private search$ = inject(ActivatedRoute).queryParamMap.pipe(
    map((queryParamMap) => queryParamMap.get('search'))
  );

  constructor() {
    this.componentStore.effect<string | null>((search$) =>
      search$.pipe(
        tap(() => {
          this.componentStore.patchState({
            loadingError: undefined,
            loadingStatus: AsyncStatus.Pending,
          });
        }),
        switchMap((search) =>
          this.apiService.getTodos(search).pipe(
            tapResponse(
              (todos) => {
                this.componentStore.patchState({
                  todos,
                  loadingStatus: AsyncStatus.Success,
                });
              },
              (error: HttpErrorResponse) => {
                this.componentStore.patchState({
                  loadingError: error.message,
                  loadingStatus: AsyncStatus.Error,
                });
              }
            )
          )
        )
      )
    )(this.search$);
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

  addTodo = this.componentStore.effect<string>((title$) =>
    title$.pipe(
      tap(() => {
        this.componentStore.patchState({
          addError: undefined,
          addStatus: AsyncStatus.Pending,
        });
      }),
      mergeMap((title) =>
        this.apiService.addTodo(title).pipe(
          tap((todo) => {
            this.componentStore.setState((state) => ({
              ...state,
              todos: [...state.todos, todo],
              addStatus: AsyncStatus.Success,
            }));
          }),
          catchError((error: HttpErrorResponse) => {
            this.componentStore.patchState({
              addError: error.message,
              addStatus: AsyncStatus.Error,
            });

            return EMPTY;
          })
        )
      )
    )
  );
}
