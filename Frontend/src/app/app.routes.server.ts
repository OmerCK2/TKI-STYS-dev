import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'rooms',
    renderMode: RenderMode.Client,
  },
  {
    path: 'guests',
    renderMode: RenderMode.Client,
  },
  {
    path: 'billing',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
