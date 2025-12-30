import {Component, OnInit, inject, signal, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {BoardModel, BoardColors} from '../../../../../domain/models/board.model';
import {GetBoardDetailAction} from '../../../../../actions/board/getBoardDetail.action';
import {UpdateBoardAction} from '../../../../../actions/board/updateBoard.action';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirmModal.component';
import { DeleteBoardAction } from '../../../../../actions/board/deleteBoard.action';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ConfirmModalComponent],
  templateUrl: './boardDetail.component.html'
})
export class BoardDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private getBoardDetail = inject(GetBoardDetailAction);
  private updateBoard = inject(UpdateBoardAction);
  private deleteBoard = inject(DeleteBoardAction);

  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;

  board = signal<BoardModel | null>(null);
  isMenuOpen = signal(false);
  isEditingTitle = signal(false);
  isDeleting = signal(false);

  titleControl = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] });
  colors: BoardColors[] = ['sky', 'yellow', 'green', 'red', 'violet'];

  colorMap: Record<string, string> = {
    sky: 'bg-sky-600',
    yellow: 'bg-yellow-500',
    green: 'bg-green-600',
    red: 'bg-red-600',
    violet: 'bg-violet-600'
  };

  menuColorMap: Record<BoardColors, string> = {
    sky: 'bg-sky-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    violet: 'bg-violet-500'
  };

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
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
        } else {
          this.router.navigate(['/boards']);
        }
      },
      error: () => this.router.navigate(['/boards'])
    });
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

      if (currentBoard && newTitle !== currentBoard.title && this.titleControl.valid) {

        this.board.update(b => b ? ({ ...b, title: newTitle }) : null);

        this.updateBoard.execute(currentBoard.id, { title: newTitle }).subscribe({
          error: (err) => {
            console.error(err);
            this.board.set(currentBoard);
          }
        });
      }
    }
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  updateBackgroundColor(color: BoardColors) {
    const currentBoard = this.board();
    if (!currentBoard || currentBoard.backgroundColor === color) return;

    this.board.update(b => b ? ({ ...b, backgroundColor: color }) : null);

    this.isMenuOpen.set(false);

    this.updateBoard.execute(currentBoard.id, { backgroundColor: color }).subscribe({
      error: () => {
        this.board.set(currentBoard);
      }
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
      }
    });
  }
}
