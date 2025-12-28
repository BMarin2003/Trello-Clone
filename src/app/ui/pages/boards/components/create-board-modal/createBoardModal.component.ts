import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BoardColors} from '../../../../../domain/models/board.model';

@Component({
  selector: 'app-create-board-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './createBoardModal.component.html'
})
export class CreateBoardModalComponent {

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ title: string; color: BoardColors }>();

  form: FormGroup;

  colors: BoardColors[] = ['sky', 'yellow', 'green', 'red', 'violet'];

  colorMap: Record<BoardColors, string> = {
    sky: 'bg-sky-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    violet: 'bg-violet-500'
  };

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      color: ['sky', [Validators.required]]
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
