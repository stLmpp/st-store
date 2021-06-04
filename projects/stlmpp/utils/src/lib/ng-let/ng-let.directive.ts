import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

/**
 * @description Context of the template variable NgLet
 */
export class NgLetContext<T> {
  $implicit!: T;
  ngLet!: T;

  /**
   * @description This method is called everytime the @Input() ngLet changes,
   * <br> to update the $implicit and ngLet values of the template
   * @param {T} value
   */
  setData(value: T): void {
    this.$implicit = value;
    this.ngLet = value;
  }
}

/**
 * @description Directive used to create a template variable
 */
@Directive({ selector: '[ngLet]' })
export class NgLetDirective<T> implements OnInit {
  constructor(private viewContainer: ViewContainerRef, private templateRef: TemplateRef<NgLetContext<T>>) {}

  readonly context = new NgLetContext<T>();

  /**
   * @description This input can be any value, including falsey ones
   * @param {T} value
   */
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
