import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService, Todo } from './api.service';

@Component({
  selector: 'app-todos-new',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
  providers: [],
  styles: [],
  template: ``,
})
export default class TodosNewComponent {
  todos: Todo[] = [];

  private apiService = inject(ApiService);
  private router = inject(Router);
  private subscription = new Subscription();

  ngOnInit() {
    const subscription = this.apiService.getTodos().subscribe((todos) => {
      this.todos = todos;
    });

    this.subscription.add(subscription);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
