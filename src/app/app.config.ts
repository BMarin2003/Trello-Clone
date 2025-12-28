import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { BoardRepository} from './domain/repositories/boardRepository';
import { BoardLocalStorageAdapter} from './infra/adapters/board-local-storage';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    {provide: BoardRepository, useClass: BoardLocalStorageAdapter},
  ]
};
