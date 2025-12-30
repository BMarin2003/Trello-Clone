import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ColumnRepository } from '../../domain/repositories/column.repository';
import { ColumnModel } from '../../domain/models/column.model';

@Injectable({ providedIn: 'root' })
export class GetColumnsByBoardIdAction {
  private columnRepository = inject(ColumnRepository);

  execute(boardId: string): Observable<ColumnModel[]> {
    return this.columnRepository.getByBoardId(boardId);
  }
}
