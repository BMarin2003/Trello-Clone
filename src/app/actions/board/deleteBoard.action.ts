import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BoardRepository } from '../../domain/repositories/board.repository';

@Injectable({ providedIn: 'root' })
export class DeleteBoardAction {
  private boardRepository = inject(BoardRepository);

  execute(id: string): Observable<boolean> {
    return this.boardRepository.deleteBoard(id);
  }
}
