import { Observable } from 'rxjs';
import { ColumnModel } from '../models/column.model';

export abstract class ColumnRepository {
  abstract createColumn(boardId: string, title: string, position: string): Observable<ColumnModel>;

  abstract updateColumn(id: string, changes: Partial<ColumnModel>): Observable<ColumnModel>;

  abstract deleteColumn(id: string): Observable<boolean>;
}
