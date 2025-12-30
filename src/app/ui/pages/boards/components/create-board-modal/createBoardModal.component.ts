import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Colors } from '../../../../../domain/models/board.model';

@Component({
  selector: 'app-create-board-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './createBoardModal.component.html',
})
export class CreateBoardModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ title: string; color: Colors }>();

  form: FormGroup;

  colors: Colors[] = ['sky', 'yellow', 'green', 'red', 'violet', 'gray'];

  colorMap: Record<Colors, string> = {
    sky: 'bg-sky-500',
    yellow: 'bg-amber-500',
    green: 'bg-emerald-500',
    red: 'bg-rose-500',
    violet: 'bg-violet-500',
    gray: 'bg-slate-500',
    white: 'bg-white',
  };

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      color: ['sky', [Validators.required]],
    });
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.close.emit();
    }
  }

  submit() {
    if (this.form.valid) {
      this.confirm.emit(this.form.value);
    }
  }
}
