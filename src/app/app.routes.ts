import { Routes } from '@angular/router';
import {MainLayoutComponent} from './ui/layout/main/main.layout';
import {BoardsPageComponent} from './ui/pages/boards/boardsPage.component';

export const routes: Routes = [

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {

        path: 'boards',
        component: BoardsPageComponent
      },
      {
        path: '',
        redirectTo: 'boards',
        pathMatch: 'full'
      }
    ]
  }

];
