import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { BoardRepository} from './domain/repositories/board.repository';
import { BoardLocalStorageAdapter} from './infra/adapters/boardLocalStorage.adapter';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    {provide: BoardRepository, useClass: BoardLocalStorageAdapter},
  ]
};
