import { CardModel } from './card.model';
import { Colors } from './board.model';

export interface ColumnModel {
  id: string;
  title: string;
  position: string;
  boardId: string;
  color?: Colors;
  cards?: CardModel[];
  createdAt: Date;
  updatedAt: Date;
}
