import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {BoardModel} from '../../../../../domain/models/board.model';
import {GetBoardDetailAction} from '../../../../../actions/board/getBoardDetail.action';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './boardDetail.component.html'
})
export class BoardDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private getBoardDetail = inject(GetBoardDetailAction);

  board = signal<BoardModel | null>(null);

  colorMap: Record<string, string> = {
    sky: 'bg-sky-600',
    yellow: 'bg-yellow-500',
    green: 'bg-green-600',
    red: 'bg-red-600',
    violet: 'bg-violet-600'
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
        } else {
          this.router.navigate(['/boards']);
        }
      },
      error: () => this.router.navigate(['/boards'])
    });
  }

  getBackgroundClass(): string {
    const color = this.board()?.backgroundColor;
    return color ? this.colorMap[color] : 'bg-gray-100';
  }
}
