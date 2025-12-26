import { Observable } from 'rxjs';
import { BoardModel } from '../models/boardModel';

export abstract class BoardRepository {
  abstract getDetail(id: string): Observable<BoardModel | null>;

  abstract getAll(): Observable<BoardModel[]>;

  abstract createBoard(title: string, backgroundColor: string): Observable<BoardModel>;

  abstract updateBoard(id: string, changes: Partial<BoardModel>): Observable<BoardModel>;

  abstract deleteBoard(id: string): Observable<boolean>;
}
