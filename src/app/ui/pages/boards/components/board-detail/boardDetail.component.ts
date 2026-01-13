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
import { EditBoardModalComponent } from '../edit-board-modal/edit-board-modal.component';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { MoveColumnAction } from '../../../../../actions/column/moveColumn.action';
import { PositionHelper } from '../../../../../domain/utils/position.helper';
import { MockUserService } from '../../../../../infra/services/mock-user.service';

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
    EditBoardModalComponent,
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

  showFilters = signal(false);
  filterCriteria = signal<{
    query?: string;
    memberIds?: string[];
    due?: 'overdue' | 'dueSoon' | 'noDate';
  }>({});

  availableUsers = signal<any[]>([]);

  private mockUserService = inject(MockUserService);

  loadUsers() {
    this.mockUserService
      .getUsers()
      .subscribe((u) => this.availableUsers.set(u));
  }

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
    sky: 'bg-sky-500',
    yellow: 'bg-amber-500',
    green: 'bg-emerald-500',
    red: 'bg-rose-500',
    violet: 'bg-violet-500',
    gray: 'bg-slate-500',
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

  buttonColorMap: Record<
    Colors,
    { bg: string; hover: string; border: string }
  > = {
    sky: {
      bg: 'bg-sky-500',
      hover: 'hover:bg-sky-600',
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

  shadowColorMap: Record<Colors, string> = {
    sky: 'hover:shadow-[0_0_12px_2px_rgba(14,165,233,0.6)]',
    yellow: 'hover:shadow-[0_0_12px_2px_rgba(245,158,11,0.6)]',
    green: 'hover:shadow-[0_0_12px_2px_rgba(16,185,129,0.6)]',
    red: 'hover:shadow-[0_0_12px_2px_rgba(225,29,72,0.6)]',
    violet: 'hover:shadow-[0_0_12px_2px_rgba(139,92,246,0.6)]',
    gray: 'hover:shadow-[0_0_12px_2px_rgba(71,85,105,0.6)]',
    white: 'hover:shadow-[0_0_12px_2px_rgba(255,255,255,0.6)]',
  };

  ngOnInit() {
    this.loadUsers();
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

  isEditModalOpen = signal(false);

  openEditModal() {
    this.isMenuOpen.set(false);
    this.isEditModalOpen.set(true);
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
  }

  updateBoardHandler(changes: Partial<BoardModel>) {
    const currentBoard = this.board();
    if (!currentBoard) return;

    this.closeEditModal();

    const updatedBoard = { ...currentBoard, ...changes };
    this.board.set(updatedBoard);

    this.updateBoard.execute(currentBoard.id, changes).subscribe({
      error: (err) => {
        console.error('Error updating board', err);
        // Revert on error
        this.board.set(currentBoard);
      },
    });
  }

  getBackgroundClass(): string {
    const color = this.board()?.backgroundColor;
    return color ? this.colorMap[color] : 'bg-gray-100';
  }

  getButtonClass(): string {
    const color = this.board()?.backgroundColor;
    if (color && this.buttonColorMap[color]) {
      const { bg, hover } = this.buttonColorMap[color];
      return `${bg} ${hover} text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer`;
    }
    return 'bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer';
  }

  getInputBorderClass(): string {
    const color = this.board()?.backgroundColor;
    if (color && this.buttonColorMap[color]) {
      return this.buttonColorMap[color].border;
    }
    return 'border-blue-500';
  }

  toggleFilterPanel() {
    this.showFilters.update((v) => !v);
  }

  toggleUserFilter(userId: string) {
    this.filterCriteria.update((current) => {
      const members = current.memberIds || [];
      const newMembers = members.includes(userId)
        ? members.filter((id) => id !== userId)
        : [...members, userId];
      return { ...current, memberIds: newMembers };
    });
  }

  setDueFilter(val: 'overdue' | 'dueSoon' | 'noDate' | undefined) {
    this.filterCriteria.update((current) => {
      if (current.due === val) return { ...current, due: undefined };
      return { ...current, due: val };
    });
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
