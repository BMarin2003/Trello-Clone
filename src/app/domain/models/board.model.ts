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
  responsibles?: string[];
  projectId?: string; // Could be a string or a separate model, keeping it simple for now
  projectName?: string;
  memberGroupIds?: string[];
}
