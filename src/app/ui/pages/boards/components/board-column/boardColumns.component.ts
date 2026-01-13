import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  inject,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnModel } from '../../../../../domain/models/column.model';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UpdateColumnAction } from '../../../../../actions/column/updateColumn.action';
import { UpdateCardAction } from '../../../../../actions/card/updateCard.action';
import { DeleteCardAction } from '../../../../../actions/card/deleteCard.action';
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
import { CardModel } from '../../../../../domain/models/card.model';
import { CardDetailModalComponent } from '../card-detail-modal/card-detail-modal.component';
import {
  COLORS,
  COLOR_MAP,
  BACKGROUND_MAP,
  ADD_CARD_HOVER_MAP,
  BUTTON_COLOR_MAP,
} from '../../utils/board.constants';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CdkDragHandle,
    DragDropModule,
    CardDetailModalComponent,
  ],
  templateUrl: './board-column.component.html',
})
export class BoardColumnComponent {
  @Input({ required: true }) column!: ColumnModel;
  @Input() boardColor: Colors = 'sky';
  @Input() filterCriteria: {
    query?: string;
    memberIds?: string[];
    due?: 'overdue' | 'dueSoon' | 'noDate';
  } | null = null;
  @Output() onDelete = new EventEmitter<string>();

  private updateColumn = inject(UpdateColumnAction);
  private createCard = inject(CreateCardAction);
  private updateCard = inject(UpdateCardAction);
  private deleteCard = inject(DeleteCardAction);
  private moveCard = inject(MoveCardAction);
  private elementRef = inject(ElementRef);

  @ViewChild('addCardForm') addCardForm?: ElementRef;

  isMenuOpen = signal(false);
  isEditingTitle = signal(false);
  isAddingCard = signal(false);
  selectedCard: CardModel | null = null;

  // Constants
  colors = COLORS;
  colorMap = COLOR_MAP;
  bgMap = BACKGROUND_MAP;
  addCardHoverMap = ADD_CARD_HOVER_MAP;
  buttonColorMap = BUTTON_COLOR_MAP;

  titleControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  newCardControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  get filteredCards(): CardModel[] {
    let cards = this.column.cards || [];

    if (!this.filterCriteria) return cards;

    const { query, memberIds, due } = this.filterCriteria;

    if (query) {
      const q = query.toLowerCase();
      cards = cards.filter((c) => c.title.toLowerCase().includes(q));
    }

    if (memberIds && memberIds.length > 0) {
      cards = cards.filter((c) =>
        c.assigneeIds.some((id) => memberIds.includes(id))
      );
    }

    if (due) {
      const now = new Date();
      cards = cards.filter((c) => {
        if (!c.deadline) return due === 'noDate';
        const deadline = new Date(c.deadline);
        if (due === 'noDate') return false;
        if (due === 'overdue') return deadline < now;
        if (due === 'dueSoon') {
          const diff = deadline.getTime() - now.getTime();
          return diff > 0 && diff < 24 * 60 * 60 * 1000 * 3; // 3 days
        }
        return true;
      });
    }

    return cards;
  }

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

  openCardDetail(card: CardModel) {
    this.selectedCard = card;
  }

  closeCardDetail() {
    this.selectedCard = null;
  }

  updateCardHandler(changes: Partial<CardModel>) {
    if (!this.selectedCard) return;

    const cardId = this.selectedCard.id;
    const updatedCard = {
      ...this.selectedCard,
      ...changes,
      updatedAt: new Date(),
    };

    // Optimistic update
    this.selectedCard = updatedCard;

    // Update in list
    this.column = {
      ...this.column,
      cards: this.column.cards?.map((c) => (c.id === cardId ? updatedCard : c)),
    };

    this.updateCard.execute(cardId, changes).subscribe();
  }

  deleteCardHandler() {
    if (!this.selectedCard) return;
    const cardId = this.selectedCard.id;

    // Optimistic delete
    this.column = {
      ...this.column,
      cards: this.column.cards?.filter((c) => c.id !== cardId),
    };

    this.closeCardDetail();

    this.deleteCard.execute(cardId).subscribe();
  }
}
