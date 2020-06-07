import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchPipe } from './search.pipe';
import { CeilPipe } from './ceil.pipe';
import { StUtilsModule } from '../../../stlmpp/utils/src/lib/st-utils.module';
import { StRouterModule } from '../../../stlmpp/router/src/lib/st-router.module';
import { RouterModule } from '@angular/router';
import { TrackByPropertyDirective } from './track-by-property.directive';

@NgModule({
  declarations: [AppComponent, SearchPipe, CeilPipe, TrackByPropertyDirective],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([]),
    StUtilsModule.forRoot(),
    StRouterModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
