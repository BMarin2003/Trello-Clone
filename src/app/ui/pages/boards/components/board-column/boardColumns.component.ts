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
import { Colors } from '../../../../../domain/models/board.model';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CdkDragHandle],
  template: `
    <div
      class="w-72 shrink-0 max-h-full flex flex-col rounded-xl shadow-sm border border-[#E9EEF2] relative transition-colors duration-300"
      [ngClass]="getColumnColorClass()"
    >
      <div
        cdkDragHandle
        class="p-3 flex items-center justify-between cursor-grab active:cursor-grabbing group relative"
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
          class="font-semibold text-gray-700 text-sm pl-2 cursor-pointer hover:bg-black/5 rounded px-1 -ml-1 transition-colors flex-1 py-1 mr-2 truncate"
        >
          {{ column.title }}
        </h2>
        }

        <div class="relative">
          <button
            (click)="toggleMenu($event)"
            class="p-1 text-gray-500 hover:bg-black/10 rounded cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            [class.opacity-100]="isMenuOpen()"
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

          @if (isMenuOpen()) {
          <div
            class="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50 p-2 animate-in fade-in zoom-in-95 duration-200"
            (click)="$event.stopPropagation()"
          >
            <div class="mb-3">
              <span
                class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2 px-1"
                >Color</span
              >
              <div class="grid grid-cols-6 gap-1">
                @for (color of colors; track color) {
                <button
                  (click)="updateColor(color)"
                  class="w-6 h-6 rounded-full hover:scale-110 transition-transform ring-1 ring-gray-200"
                  [class]="colorMap[color]"
                  [title]="color"
                ></button>
                }
              </div>
            </div>

            <div class="border-t border-gray-100 my-1"></div>

            <button
              (click)="requestDelete()"
              class="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-2"
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
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              Eliminar lista
            </button>
          </div>

          <!-- Backdrop for closing menu -->
          <div class="fixed inset-0 z-40" (click)="toggleMenu($event)"></div>
          }
        </div>
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
  @Output() onDelete = new EventEmitter<string>();

  private updateColumn = inject(UpdateColumnAction);

  isMenuOpen = signal(false);
  colors: Colors[] = [
    'sky',
    'yellow',
    'green',
    'red',
    'violet',
    'gray',
    'white',
  ];

  colorMap: Record<Colors, string> = {
    sky: 'bg-sky-500',
    yellow: 'bg-amber-500',
    green: 'bg-emerald-500',
    red: 'bg-rose-500',
    violet: 'bg-violet-500',
    gray: 'bg-slate-500',
    white: '',
  };

  bgMap: Record<Colors, string> = {
    sky: 'bg-sky-200',
    yellow: 'bg-amber-200',
    green: 'bg-emerald-200',
    red: 'bg-rose-200',
    violet: 'bg-violet-200',
    gray: 'bg-slate-200',
    white: 'bg-white',
  };

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen.update((v) => !v);
  }

  updateColor(color: Colors) {
    this.updateColumn.execute(this.column.id, { color }).subscribe();
    this.column = { ...this.column, color };
  }

  requestDelete() {
    this.onDelete.emit(this.column.id);
    this.isMenuOpen.set(false);
  }

  getColumnColorClass(): string {
    return this.column.color ? this.bgMap[this.column.color] : 'bg-[#F1F2F4]';
  }

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
