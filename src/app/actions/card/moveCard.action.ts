import { Injectable, inject } from '@angular/core';
import { CardRepository } from '../../domain/repositories/card.repository';
import { Observable } from 'rxjs';
import { CardModel } from '../../domain/models/card.model';

@Injectable({ providedIn: 'root' })
export class MoveCardAction {
  private cardRepository = inject(CardRepository);

  execute(
    id: string,
    position: string,
    columnId?: string
  ): Observable<CardModel> {
    return this.cardRepository.updateCardPosition(id, position, columnId);
  }
}
