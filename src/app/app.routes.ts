import { Routes } from '@angular/router';
import { MainLayoutComponent } from './ui/layout/main/main.layout';
import { BoardsPageComponent } from './ui/pages/boards/boardsPage.component';
import { BoardDetailComponent } from './ui/pages/boards/components/board-detail/boardDetail.component';

export const routes: Routes = [
  {
    path: 'boards/:id',
    component: BoardDetailComponent,
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'boards',
        component: BoardsPageComponent,
      },
      {
        path: '',
        redirectTo: 'boards',
        pathMatch: 'full',
      },
    ],
  },
];
