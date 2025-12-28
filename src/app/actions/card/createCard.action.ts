import { Injectable } from '@angular/core';
import { CardRepository } from '../../domain/repositories/card.repository';
import { Observable } from 'rxjs';
import { CardModel } from '../../domain/models/card.model';

@Injectable({ providedIn: 'root' })
export class CreateCardAction {

  constructor(private cardRepository: CardRepository) {}

  execute(card: Omit<CardModel, 'id' | 'createdAt' | 'updatedAt'>): Observable<CardModel> {

    return this.cardRepository.createCard(card);
  }
}
