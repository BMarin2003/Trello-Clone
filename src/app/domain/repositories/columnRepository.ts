import { Observable } from 'rxjs';
import { ColumnModel } from '../models/columnModel';

export abstract class ColumnRepository {
  abstract create(boardId: string, title: string, position: string): Observable<ColumnModel>;

  abstract update(id: string, changes: Partial<ColumnModel>): Observable<ColumnModel>;

  abstract delete(id: string): Observable<boolean>;
}
