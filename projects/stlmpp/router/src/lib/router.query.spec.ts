import { TestBed } from '@angular/core/testing';
import { RouterQuery } from './router.query';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent, HomeComponent, routes, UserComponent, UserDetailComponent, UsersComponent } from './util-test';
import { StRouterModule } from './st-router.module';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core';
import { isFunction } from 'st-utils';
import { take } from 'rxjs/operators';

function wrapRouterInNgZone(router: Router, ngZone: NgZone): Router {
  return new Proxy(router, {
    get(target: Router, p: PropertyKey): unknown {
      const invokedProperty = (target as any)[p];
      if (!isFunction(invokedProperty)) {
        return invokedProperty;
      }
      return (...args: Array<unknown>) => ngZone.run(() => invokedProperty.apply(target, args));
    },
  });
}

function wait(ms = 10): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

describe('Router Query', () => {
  let routerQuery: RouterQuery;
  let router: Router;
  let ngZone: NgZone;
  let usersComponent: UsersComponent;
  let userComponent: UserComponent;
  let appComponent: AppComponent;
  let homeComponent: HomeComponent;
  let userDetailComponent: UserDetailComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes), StRouterModule.forRoot()],
    }).compileComponents();
    routerQuery = TestBed.inject(RouterQuery);
    ngZone = TestBed.inject(NgZone);
    router = wrapRouterInNgZone(TestBed.inject(Router), ngZone);
    usersComponent = TestBed.createComponent(UsersComponent).componentInstance;
    userComponent = TestBed.createComponent(UserComponent).componentInstance;
    appComponent = TestBed.createComponent(AppComponent).componentInstance;
    homeComponent = TestBed.createComponent(HomeComponent).componentInstance;
    userDetailComponent = TestBed.createComponent(UserDetailComponent).componentInstance;
  });

  describe('params', () => {
    it('should get one', async () => {
      router.initialNavigation();
      expect(routerQuery.getParams('idUser')).toBeNull();
      routerQuery
        .selectParams('idUser')
        .pipe(take(1))
        .subscribe(id => {
          expect(id).toBeNull();
        });
      await router.navigate(['/users', 1]);
      await wait();
      expect(routerQuery.getParams('idUser')).toBe('1');
      routerQuery
        .selectParams('idUser')
        .pipe(take(1))
        .subscribe(id => {
          expect(id).toBe('1');
        });
      expect(usersComponent.routerQuery.getParams('idUser')).toBe('1');
    });

    it('should get the id even if lazy loaded', async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1, 'details', 2]);
      await wait();
      expect(routerQuery.getParams('idDetail')).toBe('2');
      expect(usersComponent.routerQuery.getParams('idDetail')).toBe('2');
    });

    it('should get all params that have the same alias', async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1, 'details', 2, 'user', 3]);
      await wait();
      expect(routerQuery.getAllParams('idUser')).toEqual(['1', '3']);
    });

    it('should get multiple', async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1, 'details', 2, 'user', 3]);
      await wait();
      expect(routerQuery.getParams(['idUser', 'idDetail'])).toEqual({ idUser: '3', idDetail: '2' });
      routerQuery
        .selectParams(['idUser', 'idDetail'])
        .pipe(take(1))
        .subscribe(params => {
          expect(params).toEqual({ idUser: '3', idDetail: '2' });
        });
    });

    it('should get all', async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1, 'details', 2, 'user', 3]);
      await wait();
      expect(routerQuery.getParams()).toEqual({ idUser: '3', idDetail: '2' });
      routerQuery
        .selectParams()
        .pipe(take(1))
        .subscribe(params => {
          expect(params).toEqual({ idUser: '3', idDetail: '2' });
        });
    });

    it('should distinct multiple', async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1, 'details', 2, 'user', 3]);
      await wait();
      const sub = jasmine.createSpy('sub');
      routerQuery.selectParams().subscribe(sub);
      expect(sub).toHaveBeenCalledTimes(1);
      await router.navigate(['/users', 1, 'details', 2, 'user', 4]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(2);
      await router.navigate(['/users', 1]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(3);
      await router.navigate(['/users', 1, 'details', 1, 'user', 1]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(4);
      await router.navigate(['/users', 2, 'details', 1, 'user', 1]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(4);
      await router.navigate(['/users', 1, 'details', 1]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(4);
    });

    it('should distinct multiples (keys)', async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1, 'details', 2, 'user', 3]);
      await wait();
      const sub = jasmine.createSpy('sub');
      routerQuery.selectParams(['idUser']).subscribe(sub);
      expect(sub).toHaveBeenCalledTimes(1);
      await router.navigate(['/users', 1, 'details', 2, 'user', 4]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(2);
      await router.navigate(['/users', 1]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(3);
      await router.navigate(['/users', 1, 'details', 1, 'user', 1]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(3);
      await router.navigate(['/users', 2, 'details', 1, 'user', 1]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(3);
      await router.navigate(['/users', 1, 'details', 1]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(3);
    });

    it('should distinct one', async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1, 'details', 2, 'user', 3]);
      await wait();
      const sub = jasmine.createSpy('sub');
      routerQuery.selectParams('idUser').subscribe(sub);
      expect(sub).toHaveBeenCalledTimes(1);
      await router.navigate(['/users', 1, 'details', 2, 'user', 4]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(2);
      await router.navigate(['/users', 1, 'details', 2]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(3);
      await router.navigate(['/users', 1, 'details', 1, 'user', 1]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(3);
      await router.navigate(['/users', 2, 'details', 1, 'user', 1]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(3);
      await router.navigate(['/users', 1, 'details', 1]);
      await wait();
      expect(sub).toHaveBeenCalledTimes(3);
    });
  });

  describe('query params', () => {
    it('should get one', async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1], { queryParams: { qp1: 1, qp2: 'qp2' } });
      await wait();
      expect(routerQuery.getQueryParams('qp1')).toBe('1');
      expect(routerQuery.getQueryParams('qp2')).toBe('qp2');
      routerQuery
        .selectQueryParams('qp1')
        .pipe(take(1))
        .subscribe(qp1 => {
          expect(qp1).toBe('1');
        });
      routerQuery
        .selectQueryParams('qp2')
        .pipe(take(1))
        .subscribe(qp2 => {
          expect(qp2).toBe('qp2');
        });
    });

    it('should get multiple', async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1], { queryParams: { qp1: 1, qp2: 'qp2', qp3: 'qp3' } });
      await wait();
      expect(routerQuery.getQueryParams(['qp1', 'qp2'])).toEqual({ qp1: '1', qp2: 'qp2' });
      routerQuery
        .selectQueryParams(['qp1', 'qp2'])
        .pipe(take(1))
        .subscribe(params => {
          expect(params).toEqual({ qp1: '1', qp2: 'qp2' });
        });
    });

    it('should return null if not exists', async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1], { queryParams: { qp1: 1, qp2: 'qp2', qp3: 'qp3' } });
      await wait();
      expect(routerQuery.getQueryParams('not-exists')).toBeNull();
      routerQuery
        .selectQueryParams('not-exists')
        .pipe(take(1))
        .subscribe(isNull => {
          expect(isNull).toBeNull();
        });
    });

    it(`should not include in object if doesn't exists`, async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1], { queryParams: { qp1: 1, qp2: 'qp2', qp3: 'qp3' } });
      await wait();
      const params = routerQuery.getQueryParams(['qp1', 'notExists']);
      expect(params.notExists).toBeUndefined();
      expect(params.qp1).toBe('1');
      routerQuery
        .selectQueryParams(['qp1', 'notExists'])
        .pipe(take(1))
        .subscribe(params1 => {
          expect(params1.notExists).toBeUndefined();
          expect(params1.qp1).toBe('1');
        });
    });

    it('should get all', async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1], { queryParams: { qp1: 1, qp2: 'qp2', qp3: 'qp3' } });
      await wait();
      expect(routerQuery.getQueryParams()).toEqual({ qp1: '1', qp2: 'qp2', qp3: 'qp3' });
      routerQuery
        .selectQueryParams()
        .pipe(take(1))
        .subscribe(params => {
          expect(params).toEqual({ qp1: '1', qp2: 'qp2', qp3: 'qp3' });
        });
    });
  });

  describe('data', () => {
    it('should get all data', async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1]);
      await wait();
      expect(routerQuery.getData()).toEqual({ data1: 1, data2: [1, 2, 3], data3: { nome: 'Guilherme' } });
      routerQuery
        .selectData()
        .pipe(take(1))
        .subscribe(data => {
          expect(data).toEqual({ data1: 1, data2: [1, 2, 3], data3: { nome: 'Guilherme' } });
        });
    });

    it('should get one data', async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1]);
      await wait();
      expect(routerQuery.getData<number>('data1')).toBe(1);
      routerQuery
        .selectData<number>('data1')
        .pipe(take(1))
        .subscribe(data => {
          expect(data).toBe(1);
        });
    });

    it('should get multiple data', async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1]);
      await wait();
      expect(routerQuery.getData(['data1', 'data2'])).toEqual({ data1: 1, data2: [1, 2, 3] });
      routerQuery
        .selectData(['data1', 'data2'])
        .pipe(take(1))
        .subscribe(data => {
          expect(data).toEqual({ data1: 1, data2: [1, 2, 3] });
        });
    });

    it(`should not select data that doesn't exists`, async () => {
      router.initialNavigation();
      await router.navigate(['/users', 1]);
      await wait();
      expect(routerQuery.getData(['data1', 'data2', 'data4'])).toEqual({ data1: 1, data2: [1, 2, 3] });
      routerQuery
        .selectData(['data1', 'data2', 'data4'])
        .pipe(take(1))
        .subscribe(data => {
          expect(data).toEqual({ data1: 1, data2: [1, 2, 3] });
        });
    });
  });

  it('should destroy', async () => {
    router.initialNavigation();
    await router.navigate(['/users', 1]);
    await wait();
    const sub = jasmine.createSpy('sub');
    routerQuery.selectParams('idUser').subscribe(sub);
    expect(sub).toHaveBeenCalledTimes(1);
    routerQuery.ngOnDestroy();
    expect(sub).toHaveBeenCalledTimes(1);
  });
});
