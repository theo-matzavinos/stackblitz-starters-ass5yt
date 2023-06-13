import { NgSwitch, NgSwitchCase } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { AddTodoComponent } from './add-todo.component';
import { AsyncStatus } from './async-status';
import { TodosListComponent } from './todos-list.component';
import { TodoViewModel } from './todos-new-state.service';
import { TodosSearchComponent } from './todos-search.component';

@Component({
  selector: 'app-todos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgSwitch,
    NgSwitchCase,
    TodosListComponent,
    TodosSearchComponent,
    AddTodoComponent,
  ],
  template: `
    <app-todos-search [search]="search" (searchChange)="searchChange.emit($event)" />
    <ng-container [ngSwitch]="loadingStatus">
      <div *ngSwitchCase="'${AsyncStatus.Pending}'">Loading...</div>
      <ng-container *ngSwitchCase="'${AsyncStatus.Success}'">
        <app-todos-list [todos]="todos" (toggleTodoIsSelected)="toggleTodoIsSelected.emit($event)" />
        <app-add-todo [addStatus]="addStatus" (addTodo)="addTodo.emit($event)" />
      </ng-container>
    </ng-container>
  `,
})
export default class TodosComponent {
  @Input({ required: true }) search?: string | null;
  @Input({ required: true }) todos!: readonly TodoViewModel[];
  @Input({ required: true }) loadingStatus!: AsyncStatus;
  @Input({ required: true }) addStatus!: AsyncStatus;

  @Output() searchChange = new EventEmitter<string | undefined | null>();
  @Output() toggleTodoIsSelected = new EventEmitter<TodoViewModel>();
  @Output() addTodo = new EventEmitter<string>();
}
