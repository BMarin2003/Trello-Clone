import { ColumnModel } from './columnModel';

export type BoardColors = 'sky' | 'yellow' | 'green' | 'red' | 'violet';

export interface BoardModel {
  id: string;
  title: string;
  backgroundColor: BoardColors;
  columns?: ColumnModel[];
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  memberIds: string[];
}
