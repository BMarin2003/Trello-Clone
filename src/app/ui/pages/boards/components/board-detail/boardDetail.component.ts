import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BoardModel,
  BoardColors,
} from '../../../../../domain/models/board.model';
import { GetBoardDetailAction } from '../../../../../actions/board/getBoardDetail.action';
import { UpdateBoardAction } from '../../../../../actions/board/updateBoard.action';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirmModal.component';
import { DeleteBoardAction } from '../../../../../actions/board/deleteBoard.action';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateColumnAction } from '../../../../../actions/column/createColumn.action';
import { GetColumnsByBoardIdAction } from '../../../../../actions/column/getColumnsByBoardId.action';
import { ColumnModel } from '../../../../../domain/models/column.model';
import { BoardColumnComponent } from '../board-column/boardColumns.component';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { MoveColumnAction } from '../../../../../actions/column/moveColumn.action';
import { PositionHelper } from '../../../../../domain/utils/position.helper';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    ConfirmModalComponent,
    BoardColumnComponent,
    DragDropModule,
  ],
  templateUrl: './boardDetail.component.html',
})
export class BoardDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private getBoardDetail = inject(GetBoardDetailAction);
  private updateBoard = inject(UpdateBoardAction);
  private deleteBoard = inject(DeleteBoardAction);
  private createColumn = inject(CreateColumnAction);
  private getColumns = inject(GetColumnsByBoardIdAction);
  private moveColumn = inject(MoveColumnAction);

  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;

  board = signal<BoardModel | null>(null);
  isMenuOpen = signal(false);
  isEditingTitle = signal(false);
  isDeleting = signal(false);
  columns = signal<ColumnModel[]>([]);
  isCreatingColumn = signal(false);
  newColumnControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  titleControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });
  colors: BoardColors[] = ['sky', 'yellow', 'green', 'red', 'violet'];

  colorMap: Record<string, string> = {
    sky: 'bg-sky-600',
    yellow: 'bg-yellow-500',
    green: 'bg-green-600',
    red: 'bg-red-600',
    violet: 'bg-violet-600',
  };

  menuColorMap: Record<BoardColors, string> = {
    sky: 'bg-sky-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    violet: 'bg-violet-500',
  };

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadBoard(id);
      }
    });
  }

  private loadBoard(id: string) {
    this.getBoardDetail.execute(id).subscribe({
      next: (board) => {
        if (board) {
          this.board.set(board);
          this.titleControl.setValue(board.title);
          this.loadColumns(board.id);
        } else {
          this.router.navigate(['/boards']);
        }
      },
      error: () => this.router.navigate(['/boards']),
    });
  }

  private loadColumns(boardId: string) {
    this.getColumns.execute(boardId).subscribe({
      next: (cols) => {
        const sorted = cols.sort((a, b) =>
          a.position.localeCompare(b.position)
        );
        this.columns.set(sorted);
      },
    });
  }

  enableAddColumn() {
    this.isCreatingColumn.set(true);
    setTimeout(() => {
      const input = document.getElementById(
        'newColumnInput'
      ) as HTMLInputElement;
      input?.focus();
    }, 0);
  }

  cancelAddColumn() {
    this.isCreatingColumn.set(false);
    this.newColumnControl.reset();
  }

  saveColumn() {
    if (this.newColumnControl.invalid || !this.board()) return;

    const title = this.newColumnControl.value;
    const currentCols = this.columns();
    const lastPosition =
      currentCols.length > 0
        ? currentCols[currentCols.length - 1].position
        : undefined;

    this.createColumn.execute(this.board()!.id, title, lastPosition).subscribe({
      next: (newCol) => {
        this.columns.update((cols) => [...cols, newCol]);
        this.cancelAddColumn();
        this.scrollToRight();
      },
    });
  }

  private scrollToRight() {
    setTimeout(() => {
      const container = document.querySelector('main');
      if (container)
        container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    }, 100);
  }

  editTitle() {
    this.isEditingTitle.set(true);
    setTimeout(() => {
      const input = document.getElementById('titleInput') as HTMLInputElement;
      input?.focus();
      input?.select();
    }, 0);
  }

  saveTitle() {
    if (this.isEditingTitle()) {
      this.isEditingTitle.set(false);

      const newTitle = this.titleControl.value;
      const currentBoard = this.board();

      if (
        currentBoard &&
        newTitle !== currentBoard.title &&
        this.titleControl.valid
      ) {
        this.board.update((b) => (b ? { ...b, title: newTitle } : null));

        this.updateBoard
          .execute(currentBoard.id, { title: newTitle })
          .subscribe({
            error: (err) => {
              console.error(err);
              this.board.set(currentBoard);
            },
          });
      }
    }
  }

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  updateBackgroundColor(color: BoardColors) {
    const currentBoard = this.board();
    if (!currentBoard || currentBoard.backgroundColor === color) return;

    this.board.update((b) => (b ? { ...b, backgroundColor: color } : null));

    this.isMenuOpen.set(false);

    this.updateBoard
      .execute(currentBoard.id, { backgroundColor: color })
      .subscribe({
        error: () => {
          this.board.set(currentBoard);
        },
      });
  }

  cancelEdit() {
    this.isEditingTitle.set(false);
    this.titleControl.setValue(this.board()?.title || '');
  }

  getBackgroundClass(): string {
    const color = this.board()?.backgroundColor;
    return color ? this.colorMap[color] : 'bg-gray-100';
  }

  requestDeleteBoard() {
    this.isMenuOpen.set(false);
    this.confirmModal.open();
  }

  onDeleteConfirm() {
    const currentBoard = this.board();
    if (!currentBoard || this.isDeleting()) return;

    this.isDeleting.set(true);

    this.deleteBoard.execute(currentBoard.id).subscribe({
      next: () => {
        this.router.navigate(['/boards']);
      },
      error: (err) => {
        console.error('Error deleting board', err);
        this.isDeleting.set(false);
      },
    });
  }

  drop(event: CdkDragDrop<ColumnModel[]>) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    if (previousIndex === currentIndex) return;

    const columns = this.columns();
    moveItemInArray(columns, previousIndex, currentIndex);
    this.columns.set([...columns]);

    const column = columns[currentIndex];
    const prevCol = columns[currentIndex - 1];
    const nextCol = columns[currentIndex + 1];

    const prevPos = prevCol ? prevCol.position : undefined;
    const nextPos = nextCol ? nextCol.position : undefined;

    const newPosition = PositionHelper.rankBetween(prevPos, nextPos);
    column.position = newPosition;

    this.moveColumn.execute(column.id, newPosition).subscribe({
      error: (err) => {
        console.error('Error moving column', err);
        if (this.board()) {
          this.loadColumns(this.board()!.id);
        }
      },
    });
  }
}
