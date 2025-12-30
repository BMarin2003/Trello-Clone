import { ColumnModel } from './column.model';

export type Colors =
  | 'sky'
  | 'yellow'
  | 'green'
  | 'red'
  | 'violet'
  | 'gray'
  | 'white';

export interface BoardModel {
  id: string;
  title: string;
  backgroundColor: Colors;
  columns?: ColumnModel[];
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  memberIds: string[];
}
