import { Injectable } from '@angular/core';
import { BoardRepository } from '../../domain/repositories/boardRepository';
import { Observable } from 'rxjs';
import { BoardModel } from '../../domain/models/boardModel';

@Injectable({ providedIn: 'root' })
export class CreateBoardAction {

  constructor(private boardRepository: BoardRepository) {}

  execute(title: string, backgroundColor: string): Observable<BoardModel> {

    return this.boardRepository.createBoard(title, backgroundColor);
  }
}

