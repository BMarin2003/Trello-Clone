import { Injectable } from '@angular/core';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { Observable } from 'rxjs';
import { BoardModel } from '../../domain/models/board.model';

@Injectable({ providedIn: 'root' })
export class UpdateBoardAction {

  constructor(private boardRepository: BoardRepository) {}

  execute(id: string, changes: Partial<BoardModel>): Observable<BoardModel> {
    return this.boardRepository.updateBoard(id, changes);
  }
}
