import { Injectable } from '@angular/core';
import { CardRepository } from '../../domain/repositories/cardRepository';
import { Observable } from 'rxjs';
import { CardModel } from '../../domain/models/cardModel';

@Injectable({ providedIn: 'root' })
export class CreateCardAction {

  constructor(private cardRepository: CardRepository) {}

  execute(card: Omit<CardModel, 'id' | 'createdAt' | 'updatedAt'>): Observable<CardModel> {

    return this.cardRepository.createCard(card);
  }
}
