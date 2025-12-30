import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GetAllBoardsAction } from '../../../actions/board/getAllBoards.action';
import { CreateBoardAction } from '../../../actions/board/createBoard.action';
import { BoardColors, BoardModel } from '../../../domain/models/board.model';
import { CreateBoardModalComponent } from './components/create-board-modal/createBoardModal.component';

@Component({
  selector: 'app-boards-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CreateBoardModalComponent],
  templateUrl: './boardsPage.component.html',
})
export class BoardsPageComponent implements OnInit {
  private getAllBoards = inject(GetAllBoardsAction);
  private createBoard = inject(CreateBoardAction);

  boards = signal<BoardModel[]>([]);
  isLoading = signal<boolean>(true);
  isCreateModalOpen = signal<boolean>(false);

  ngOnInit() {
    this.loadBoards();
  }

  loadBoards() {
    this.isLoading.set(true);
    this.getAllBoards.execute().subscribe({
      next: (data) => {
        this.boards.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando tableros', err);
        this.isLoading.set(false);
      },
    });
  }

  openCreateModal() {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal() {
    this.isCreateModalOpen.set(false);
  }

  createBoardHandler(event: { title: string; color: BoardColors }) {
    this.closeCreateModal();

    this.createBoard.execute(event.title, event.color).subscribe({
      next: (newBoard) => {
        this.boards.update((current) => [...current, newBoard]);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  getBgColor(color: string): string {
    const map: Record<string, string> = {
      sky: 'bg-sky-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      violet: 'bg-violet-500',
    };
    return map[color] || 'bg-gray-500';
  }
}
