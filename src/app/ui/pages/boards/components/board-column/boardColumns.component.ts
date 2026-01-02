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
import {
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Colors } from '../../../../../domain/models/board.model';
import { CreateCardAction } from '../../../../../actions/card/createCard.action';
import { CardPriority } from '../../../../../domain/models/card.model';
import { PositionHelper } from '../../../../../domain/utils/position.helper';
import { MoveCardAction } from '../../../../../actions/card/moveCard.action';
import { ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CdkDragHandle, DragDropModule],
  template: `
    <div
      class="w-72 shrink-0 max-h-full flex flex-col rounded-xl shadow-lg relative backdrop-blur-md border border-white/20"
      [ngClass]="getColumnColorClass()"
    >
      <div
        cdkDragHandle
        class="p-3 flex items-center justify-between cursor-grab active:cursor-grabbing group relative"
      >
        @if (isEditingTitle()) {
        <input
          [id]="'columnTitleInput-' + column.id"
          name="columnTitle"
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
                  class="w-6 h-6 rounded-full hover:scale-110 transition-transform ring-1 ring-gray-200 cursor-pointer"
                  [class]="colorMap[color]"
                  [title]="color"
                ></button>
                }
              </div>
            </div>
            <button
              (click)="requestDelete()"
              class="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-2 cursor-pointer"
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
          <div class="fixed inset-0 z-40" (click)="toggleMenu($event)"></div>
          }
        </div>
      </div>

      <div
        class="flex-1 overflow-y-auto overflow-x-hidden px-2 min-h-[50px] flex flex-col gap-2 pb-2"
        cdkDropList
        [cdkDropListData]="column.cards"
        (cdkDropListDropped)="drop($event)"
      >
        @if (!column.cards || column.cards.length === 0) {
        <div
          class="h-full flex items-center justify-center text-xs text-gray-500/70 italic py-4 min-h-[50px]"
        >
          Sin tarjetas
        </div>
        } @else { @for (card of column.cards; track card.id) {
        <div
          cdkDrag
          [cdkDragData]="card"
          class="bg-[#1b2838] p-2 rounded-lg shadow-md border-[2px] border-transparent hover:border-gray-200 cursor-grab active:cursor-grabbing group hover:shadow-md transition-all relative"
        >
          <div
            *cdkDragPreview
            class="box-border rounded-lg shadow-2xl bg-[#1b2838] p-2 border border-blue-400 opacity-95 rotate-3 cursor-grabbing"
          >
            <div class="flex items-start justify-between gap-2">
              <span class="text-sm text-gray-100 font-medium leading-tight">{{
                card.title
              }}</span>
            </div>
          </div>

          <div class="flex items-start justify-between gap-2">
            <span
              class="text-sm text-gray-100 font-medium leading-tight select-none"
              >{{ card.title }}</span
            >
            <button
              class="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
          </div>
        </div>
        } }
      </div>

      <div class="p-3 pt-0">
        @if (isAddingCard()) {
        <div
          class="bg-white p-2 rounded-lg border-2 border-blue-500 shadow-sm animate-in fade-in duration-150 relative z-40"
          [ngClass]="getInputBorderClass()"
          (click)="$event.stopPropagation()"
          #addCardForm
        >
          <input
            [formControl]="newCardControl"
            (keydown.enter)="saveCard()"
            (keydown.escape)="cancelAddCard()"
            placeholder="Introduce un título para esta tarjeta..."
            class="w-full text-sm focus:outline-none mb-2 text-gray-700 placeholder:text-gray-400"
            [id]="'newCardInput-' + column.id"
            name="newCardTitle"
            #newCardInput
          />
          <div class="flex items-center gap-2">
            <button
              (click)="saveCard()"
              class="text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
              [ngClass]="getButtonClass()"
            >
              Añadir tarjeta
            </button>
            <button
              (click)="cancelAddCard()"
              class="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1.5 rounded cursor-pointer transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        } @else {
        <button
          (click)="toggleAddCard()"
          class="w-full flex items-center gap-2 text-gray-700 p-2 rounded-lg text-sm transition-all text-left cursor-pointer font-medium"
          [ngClass]="getAddCardButtonClass()"
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
        }
      </div>
    </div>
  `,
})
export class BoardColumnComponent {
  @Input({ required: true }) column!: ColumnModel;
  @Input() boardColor: Colors = 'sky';
  @Output() onDelete = new EventEmitter<string>();

  private updateColumn = inject(UpdateColumnAction);
  private createCard = inject(CreateCardAction);
  private moveCard = inject(MoveCardAction);
  private elementRef = inject(ElementRef);
  @ViewChild('addCardForm') addCardForm?: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isAddingCard() && this.addCardForm) {
      const clickedInside = this.addCardForm.nativeElement.contains(
        event.target
      );
      if (!clickedInside) {
        this.cancelAddCard();
      }
    }
  }

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
    sky: 'bg-sky-300/80',
    yellow: 'bg-amber-300/80',
    green: 'bg-emerald-300/80',
    red: 'bg-rose-300/80',
    violet: 'bg-violet-300/80',
    gray: 'bg-slate-300/80',
    white: 'bg-white/80',
  };

  addCardHoverMap: Record<Colors, string> = {
    sky: 'hover:bg-sky-200/50',
    yellow: 'hover:bg-amber-200/50',
    green: 'hover:bg-emerald-200/50',
    red: 'hover:bg-rose-200/50',
    violet: 'hover:bg-violet-200/50',
    gray: 'hover:bg-slate-200/50',
    white: 'hover:bg-blue-200/50',
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

  getAddCardButtonClass(): string {
    return this.addCardHoverMap[this.boardColor] || 'hover:bg-gray-200/80';
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
        'columnTitleInput-' + this.column.id
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

  isAddingCard = signal(false);
  newCardControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  buttonColorMap: Record<
    Colors,
    { bg: string; hover: string; border: string }
  > = {
    sky: {
      bg: 'bg-sky-600',
      hover: 'hover:bg-sky-700',
      border: 'border-sky-500',
    },
    yellow: {
      bg: 'bg-amber-500',
      hover: 'hover:bg-amber-600',
      border: 'border-amber-400',
    },
    green: {
      bg: 'bg-emerald-600',
      hover: 'hover:bg-emerald-700',
      border: 'border-emerald-500',
    },
    red: {
      bg: 'bg-rose-600',
      hover: 'hover:bg-rose-700',
      border: 'border-rose-500',
    },
    violet: {
      bg: 'bg-violet-600',
      hover: 'hover:bg-violet-700',
      border: 'border-violet-500',
    },
    gray: {
      bg: 'bg-slate-600',
      hover: 'hover:bg-slate-700',
      border: 'border-slate-500',
    },
    white: {
      bg: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      border: 'border-blue-500',
    },
  };

  toggleAddCard() {
    this.isAddingCard.set(true);
    setTimeout(() => {
      const input = document.getElementById(
        'newCardInput-' + this.column.id
      ) as HTMLInputElement;
      input?.focus();
    }, 0);
  }

  cancelAddCard() {
    this.isAddingCard.set(false);
    this.newCardControl.reset();
  }

  saveCard() {
    if (this.newCardControl.invalid) return;

    const title = this.newCardControl.value;
    const cards = this.column.cards || [];
    const position = cards.length > 0 ? [] : [];

    this.createCard
      .execute({
        title,
        columnId: this.column.id,
        priority: CardPriority.MEDIUM,
        creatorId: '1',
        assigneeIds: [],
        position: [],
      })
      .subscribe({
        next: (card) => {
          this.column = {
            ...this.column,
            cards: [...(this.column.cards || []), card],
          };
          this.newCardControl.reset();
          this.toggleAddCard();
        },
      });
  }

  drop(event: CdkDragDrop<any[] | undefined>) {
    if (!event.container.data || !event.previousContainer.data) return;

    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    if (event.previousContainer === event.container) {
      if (previousIndex === currentIndex) return;
      moveItemInArray(event.container.data, previousIndex, currentIndex);
      this.updateCardPosition(event.container.data, currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        previousIndex,
        currentIndex
      );
      this.updateCardPosition(
        event.container.data,
        currentIndex,
        this.column.id
      );
    }
  }

  private updateCardPosition(
    cards: any[],
    currentIndex: number,
    newColumnId?: string
  ) {
    const card = cards[currentIndex];
    const prevCard = cards[currentIndex - 1];
    const nextCard = cards[currentIndex + 1];

    const prevPos = prevCard?.position?.[0] || undefined;
    const prevRank = prevCard
      ? Array.isArray(prevCard.position)
        ? prevCard.position[0]
        : prevCard.position
      : undefined;
    const nextRank = nextCard
      ? Array.isArray(nextCard.position)
        ? nextCard.position[0]
        : nextCard.position
      : undefined;

    const newRank = PositionHelper.rankBetween(
      prevRank as string | undefined,
      nextRank as string | undefined
    );

    card.position = [newRank];
    if (newColumnId) {
      card.columnId = newColumnId;
    }

    this.moveCard.execute(card.id, newRank, newColumnId).subscribe({
      error: (err) => console.error('Error moving card', err),
    });
  }

  getButtonClass(): string {
    const colorStub = this.buttonColorMap[this.boardColor];
    if (colorStub) {
      return `${colorStub.bg} ${colorStub.hover}`;
    }
    return 'bg-blue-600 hover:bg-blue-700';
  }

  getInputBorderClass(): string {
    const colorStub = this.buttonColorMap[this.boardColor];
    return colorStub ? colorStub.border : 'border-blue-500';
  }
}
