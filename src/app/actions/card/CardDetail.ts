import { Injectable } from '@angular/core';
import { CardRepository } from '../../domain/repositories/cardRepository';
import { Observable } from 'rxjs';
import { CardModel } from '../../domain/models/cardModel';

@Injectable({ providedIn: 'root' })
export class CardDetailAction {

  constructor(private cardRepository: CardRepository) {}

  execute(id: string): Observable<CardModel | null> {
    return this.cardRepository.getCardDetail(id);
  }
}
