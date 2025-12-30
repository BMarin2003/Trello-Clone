import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ColumnRepository } from '../../domain/repositories/column.repository';

@Injectable({ providedIn: 'root' })
export class DeleteColumnAction {
  private columnRepository = inject(ColumnRepository);

  execute(id: string): Observable<boolean> {
    return this.columnRepository.deleteColumn(id);
  }
}
