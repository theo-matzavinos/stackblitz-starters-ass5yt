import { Injectable } from '@angular/core';
import { map, tap, timer } from 'rxjs';

export type Todo = {
  id: number;
  title: string;
};

let todos: Todo[] = Array.from({ length: 3 }, (_, id) => ({
  id,
  title: `Todo ${id}`,
}));

@Injectable({ providedIn: 'root' })
export class ApiService {
  getTodos(search?: string | null) {
    if (!search) {
      return timer(1000).pipe(map(() => todos));
    }

    const regex = new RegExp(search, 'i');

    return timer(1000).pipe(
      map(() => todos.filter((todo) => regex.test(todo.title)))
    );
  }

  addTodo(title: string) {
    return timer(1000).pipe(
      map(() => ({ id: todos.length, title })),
      tap((todo) => {
        todos = [...todos, todo];
      })
    );
  }
}
