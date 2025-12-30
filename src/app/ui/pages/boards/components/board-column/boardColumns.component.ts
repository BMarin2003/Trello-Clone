import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnModel } from '../../../../../domain/models/column.model';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UpdateColumnAction } from '../../../../../actions/column/updateColumn.action';
import { CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CdkDragHandle],
  template: `
    <div
      class="w-72 shrink-0 max-h-full flex flex-col bg-[#F1F2F4] rounded-xl shadow-sm border border-[#E9EEF2]"
    >
      <div
        cdkDragHandle
        class="p-3 flex items-center justify-between cursor-grab active:cursor-grabbing"
      >
        @if (isEditingTitle()) {
        <input
          id="columnTitleInput"
          [formControl]="titleControl"
          (blur)="saveTitle()"
          (keydown.enter)="saveTitle()"
          (keydown.escape)="cancelEdit()"
          class="w-full px-2 py-1 text-sm font-semibold text-gray-700 bg-white rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          (click)="$event.stopPropagation()"
        />
        } @else {
        <h2
          (click)="editTitle()"
          class="font-semibold text-gray-700 text-sm pl-2 cursor-pointer hover:bg-gray-400/50 rounded px-1 -ml-1 transition-colors flex-1 py-1 mr-2 truncate"
        >
          {{ column.title }}
        </h2>
        }
        <button
          class="p-1 text-gray-500 hover:bg-gray-400/50 rounded cursor-pointer shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-2 min-h-[50px]">
        @if (!column.cards || column.cards.length === 0) {
        <div
          class="h-full flex items-center justify-center text-xs text-gray-400 italic py-4"
        >
          Sin tarjetas
        </div>
        }
      </div>

      <div class="p-3 pt-0">
        <button
          class="w-full flex items-center gap-2 text-gray-600 hover:bg-gray-200/80 p-2 rounded-lg text-sm transition-colors text-left cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Añadir tarjeta
        </button>
      </div>
    </div>
  `,
})
export class BoardColumnComponent {
  @Input({ required: true }) column!: ColumnModel;

  private updateColumn = inject(UpdateColumnAction);

  isEditingTitle = signal(false);
  titleControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  editTitle() {
    this.titleControl.setValue(this.column.title);
    this.isEditingTitle.set(true);
    setTimeout(() => {
      const input = document.getElementById(
        'columnTitleInput'
      ) as HTMLInputElement;
      input?.focus();
      input?.select();
    }, 0);
  }

  saveTitle() {
    if (this.isEditingTitle() && this.titleControl.valid) {
      this.isEditingTitle.set(false);
      const newTitle = this.titleControl.value;

      if (newTitle !== this.column.title) {
        this.column = { ...this.column, title: newTitle };
        this.updateColumn
          .execute(this.column.id, { title: newTitle })
          .subscribe();
      }
    }
  }

  cancelEdit() {
    this.isEditingTitle.set(false);
  }
}
