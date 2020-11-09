import { Injectable, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  ActivationEnd,
  convertToParamMap,
  Data,
  Event,
  ParamMap,
  Params,
  Router,
} from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { auditTime, distinctUntilChanged, filter, map, pluck, takeUntil } from 'rxjs/operators';
import { isNil, isString } from '@stlmpp/utils';
import { isEqualParams } from './util';

type ParamType = 'queryParamMap' | 'paramMap';

@Injectable()
export class RouterQuery implements OnDestroy {
  constructor(activatedRoute: ActivatedRoute, private router: Router) {
    this.listenToRouteChanges();
    this._lastSnapshot = activatedRoute.snapshot;
  }

  private _lastSnapshot: ActivatedRouteSnapshot;

  private _destroy$ = new Subject();

  private _params$ = new BehaviorSubject<Params>({});
  private _queryParams$ = new BehaviorSubject<Params>({});
  private _data$ = new BehaviorSubject<Data>({});

  private listenToRouteChanges(): void {
    this.router.events
      .pipe(
        takeUntil(this._destroy$),
        filter(event => event instanceof ActivationEnd),
        map<Event, ActivationEnd>(event => event as ActivationEnd),
        auditTime(0)
      )
      .subscribe(event => {
        let state = event.snapshot;
        this._lastSnapshot = state;
        const params: Params = {};
        const queryParams: Params = {};
        let data: Data = {};
        const fill = (_state: ActivatedRouteSnapshot) => {
          for (const key of state.paramMap.keys) {
            params[key] = state.paramMap.get(key);
          }
          for (const key of state.queryParamMap.keys) {
            queryParams[key] = state.queryParamMap.get(key);
          }
          data = { ...data, ...state.data };
        };
        while (state.firstChild) {
          fill(state);
          state = state.firstChild;
        }
        fill(state);
        this._params$.next(params);
        this._queryParams$.next(queryParams);
        this._data$.next(data);
      });
  }

  private getParamMap(type: ParamType): ParamMap {
    let params: Params;
    if (type === 'paramMap') {
      params = this._params$.value;
    } else {
      params = this._queryParams$.value;
    }
    return convertToParamMap(params);
  }

  private selectParamMap(type: ParamType): Observable<ParamMap> {
    let params$: Observable<Params>;
    if (type === 'paramMap') {
      params$ = this._params$;
    } else {
      params$ = this._queryParams$;
    }
    return params$.pipe(
      distinctUntilChanged(isEqualParams),
      map(params => convertToParamMap(params))
    );
  }

  private reduceParams(params: string[], paramMap: ParamMap): Params {
    return params.reduce((acc, param) => (paramMap.has(param) ? { ...acc, [param]: paramMap.get(param) } : acc), {});
  }

  private getParamsBase(type: ParamType, params?: string | string[]): string | Params | null {
    const paramMap = this.getParamMap(type);
    if (!params) {
      return this.reduceParams(paramMap.keys, paramMap);
    } else if (isString(params)) {
      return paramMap.get(params);
    } else {
      return this.reduceParams(params, paramMap);
    }
  }

  private selectParamsBase(
    type: ParamType,
    params?: string | string[]
  ): Observable<string | null> | Observable<Params> {
    const paramMap$ = this.selectParamMap(type);
    if (!params) {
      return paramMap$.pipe(map(paramsRoute => this.reduceParams(paramsRoute.keys, paramsRoute)));
    } else if (isString(params)) {
      return paramMap$.pipe(
        map(paramRoute => paramRoute.get(params)),
        distinctUntilChanged()
      );
    } else {
      return paramMap$.pipe(
        map(paramsRoute => this.reduceParams(params, paramsRoute)),
        distinctUntilChanged(isEqualParams)
      );
    }
  }

  getParams(): Params;
  getParams(param: string): string | null;
  getParams(params: string[]): Params;
  getParams(params?: string | string[]): string | null | Params {
    return this.getParamsBase('paramMap', params);
  }

  getAllParams(param: string): string[] {
    let state = this._lastSnapshot;
    const params = new Set<string>();
    while (state.firstChild) {
      if (state.paramMap.has(param)) {
        params.add(state.paramMap.get(param)!);
      }
      state = state.firstChild;
    }
    if (state.paramMap.has(param)) {
      params.add(state.paramMap.get(param)!);
    }
    return [...params];
  }

  selectParams(): Observable<Params>;
  selectParams(param: string): Observable<string | null>;
  selectParams(params: string[]): Observable<Params>;
  selectParams(params?: string[] | string): Observable<string | null | Params> {
    return this.selectParamsBase('paramMap', params);
  }

  getQueryParams(): Params;
  getQueryParams(param: string): string | null;
  getQueryParams(params: string[]): Params;
  getQueryParams(params?: string | string[]): string | null | Params {
    return this.getParamsBase('queryParamMap', params);
  }

  selectQueryParams(): Observable<Params>;
  selectQueryParams(param: string): Observable<string>;
  selectQueryParams(params: string[]): Observable<Params>;
  selectQueryParams(params?: string[] | string): Observable<string | null | Params> {
    return this.selectParamsBase('queryParamMap', params);
  }

  getData(): Data;
  getData<R = unknown>(param: string): R | undefined;
  getData(params: string[]): Data;
  getData<R = unknown>(params?: string | string[]): R | undefined | Data {
    const data = this._data$.value;
    if (!params) {
      return data;
    } else if (isString(params)) {
      return data[params];
    } else {
      return params.reduce((acc, param) => (!isNil(data[param]) ? { ...acc, [param]: data[param] } : acc), {});
    }
  }

  selectData(): Observable<Data>;
  selectData<R = unknown>(param: string): Observable<R | undefined>;
  selectData(params: string[]): Observable<Data>;
  selectData<R = unknown>(params?: string[] | string): Observable<R | Data | undefined> {
    const data$ = this._data$.asObservable();
    if (!params) {
      return data$;
    } else if (isString(params)) {
      return data$.pipe(pluck(params));
    } else {
      return data$.pipe(
        map(data => params.reduce((acc, param) => (!isNil(data[param]) ? { ...acc, [param]: data[param] } : acc), {}))
      );
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
