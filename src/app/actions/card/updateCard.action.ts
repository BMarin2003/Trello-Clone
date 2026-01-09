import { Injectable } from '@angular/core';
import { CardRepository } from '../../domain/repositories/card.repository';
import { Observable } from 'rxjs';
import { CardModel } from '../../domain/models/card.model';

@Injectable({ providedIn: 'root' })
export class UpdateCardAction {
  constructor(private cardRepository: CardRepository) {}

  execute(id: string, changes: Partial<CardModel>): Observable<CardModel> {
    return this.cardRepository.updateCard(id, changes);
  }
}
