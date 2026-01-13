import { Injectable } from '@angular/core';
import { CardRepository } from '../../domain/repositories/card.repository';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeleteCardAction {
  constructor(private cardRepository: CardRepository) {}

  execute(id: string): Observable<boolean> {
    return this.cardRepository.deleteCard(id);
  }
}
