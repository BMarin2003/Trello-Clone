import { Injectable } from '@angular/core';
import { BoardRepository } from '../../domain/repositories/board.repository';
import { Observable } from 'rxjs';
import { BoardModel } from '../../domain/models/board.model';

@Injectable({ providedIn: 'root' })
export class GetAllBoardsAction {

  constructor(private boardRepository: BoardRepository) {}

  execute(): Observable<BoardModel[]> {
    return this.boardRepository.getAll();
  }
}
