/* istanbul ignore file */

import { Component, NgModule } from '@angular/core';
import { ActivatedRoute, RouterModule, Routes } from '@angular/router';
import { RouterQuery } from './router.query';

@Component({ template: '' })
export class HomeComponent {
  constructor(public activatedRoute: ActivatedRoute) {}
}

@Component({ template: '<router-outlet></router-outlet>' })
export class UsersComponent {
  constructor(public routerQuery: RouterQuery, public activatedRoute: ActivatedRoute) {}
}

@Component({ template: '<router-outlet></router-outlet>' })
export class UserComponent {
  constructor(public activatedRoute: ActivatedRoute) {}
}

@Component({ template: '' })
export class UserDetailComponent {
  constructor(public activatedRoute: ActivatedRoute) {}
}

@NgModule({
  declarations: [UserDetailComponent],
  imports: [
    RouterModule.forChild([
      {
        path: ':idDetail',
        component: UserDetailComponent,
        children: [{ path: 'user/:idUser', component: UserComponent }],
      },
    ]),
  ],
})
export class UserDetails {}

@Component({ template: `<router-outlet></router-outlet>` })
export class AppComponent {
  constructor(public activatedRoute: ActivatedRoute) {}
}

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'users',
    component: UsersComponent,
    children: [
      {
        path: ':idUser',
        component: UserComponent,
        data: { data1: 1, data2: [1, 2, 3], data3: { nome: 'Guilherme' } },
        children: [{ path: 'details', loadChildren: () => Promise.resolve(UserDetails) }],
      },
    ],
  },
];
