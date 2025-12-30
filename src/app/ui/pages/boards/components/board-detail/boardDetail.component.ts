import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BoardModel, Colors } from '../../../../../domain/models/board.model';
import { GetBoardDetailAction } from '../../../../../actions/board/getBoardDetail.action';
import { UpdateBoardAction } from '../../../../../actions/board/updateBoard.action';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirmModal.component';
import { DeleteBoardAction } from '../../../../../actions/board/deleteBoard.action';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateColumnAction } from '../../../../../actions/column/createColumn.action';
import { GetColumnsByBoardIdAction } from '../../../../../actions/column/getColumnsByBoardId.action';
import { DeleteColumnAction } from '../../../../../actions/column/deleteColumn.action';
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
  private deleteColumn = inject(DeleteColumnAction);
  private getColumns = inject(GetColumnsByBoardIdAction);
  private moveColumn = inject(MoveColumnAction);

  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;

  board = signal<BoardModel | null>(null);
  isMenuOpen = signal(false);
  isEditingTitle = signal(false);
  isDeleting = signal(false);
  columns = signal<ColumnModel[]>([]);
  isCreatingColumn = signal(false);

  deleteContext = signal<'board' | 'column'>('board');
  columnIdToDelete = signal<string | null>(null);
  modalTitle = signal('');
  modalMessage = signal('');

  newColumnControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  titleControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });
  colors: Colors[] = ['sky', 'yellow', 'green', 'red', 'violet', 'gray'];

  colorMap: Record<string, string> = {
    sky: 'bg-sky-600',
    yellow: 'bg-amber-500',
    green: 'bg-emerald-600',
    red: 'bg-rose-600',
    violet: 'bg-violet-600',
    gray: 'bg-slate-600',
  };

  menuColorMap: Record<Colors, string> = {
    sky: 'bg-sky-500',
    yellow: 'bg-amber-500',
    green: 'bg-emerald-500',
    red: 'bg-rose-500',
    violet: 'bg-violet-500',
    gray: 'bg-slate-500',
    white: 'bg-white',
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

  updateBackgroundColor(color: Colors) {
    const currentBoard = this.board();
    if (!currentBoard || currentBoard.backgroundColor === color) return;

    this.board.update((b) => (b ? { ...b, backgroundColor: color } : null));

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
    this.deleteContext.set('board');
    this.modalTitle.set('Eliminar Tablero');
    this.modalMessage.set(
      'El tablero se eliminará permanentemente junto con todas sus listas y tarjetas. Esta acción no se puede deshacer.'
    );
    this.confirmModal.open();
  }

  requestDeleteColumn(columnId: string) {
    this.deleteContext.set('column');
    this.columnIdToDelete.set(columnId);
    this.modalTitle.set('Eliminar Lista');
    this.modalMessage.set(
      '¿ Seguro que deseas eliminar esta lista? Todas las tarjetas dentro de ella también se perderán.'
    );
    this.confirmModal.open();
  }

  onDeleteConfirm() {
    if (this.deleteContext() === 'board') {
      this.deleteBoardLogic();
    } else {
      this.deleteColumnLogic();
    }
  }

  private deleteBoardLogic() {
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

  private deleteColumnLogic() {
    const colId = this.columnIdToDelete();
    if (!colId) return;

    this.deleteColumn.execute(colId).subscribe({
      next: () => {
        this.columns.update((cols) => cols.filter((c) => c.id !== colId));
        this.confirmModal.close();
      },
      error: (err) => {
        console.error('Error deleting column', err);
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
