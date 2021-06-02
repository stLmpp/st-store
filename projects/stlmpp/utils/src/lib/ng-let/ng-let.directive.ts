import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

export class NgLetContext<T> {
  $implicit!: T;
  ngLet!: T;

  setData(value: T): void {
    this.$implicit = value;
    this.ngLet = value;
  }
}

@Directive({ selector: '[ngLet]' })
export class NgLetDirective<T> implements OnInit {
  constructor(private viewContainer: ViewContainerRef, private templateRef: TemplateRef<NgLetContext<T>>) {}

  readonly context = new NgLetContext<T>();

  @Input()
  set ngLet(value: T) {
    this.context.setData(value);
  }

  ngOnInit(): void {
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this.templateRef, this.context);
  }

  static ngTemplateContextGuard<ST>(dir: NgLetDirective<ST>, ctx: any): ctx is NgLetContext<NonNullable<ST>> {
    return true;
  }
}
