import { Injectable } from '@angular/core';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { Observable } from 'rxjs';
import { BoardModel } from '../../domain/models/board.model';

@Injectable({ providedIn: 'root' })
export class GetBoardDetailAction {

  constructor(private boardRepository: BoardRepository) {}

  execute(id: string): Observable<BoardModel | null> {
    return this.boardRepository.getBoardDetail(id);
  }
}
