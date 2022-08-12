import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { SharedModule } from './shared/shared.module';

// primeng imports
import {MenuModule} from 'primeng/menu';
import {MenubarModule} from 'primeng/menubar';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';

//ngx-toastr import
import { ToastrModule, ToastrService } from 'ngx-toastr';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth/interceptor/auth.interceptor';

import { CountdownModule } from 'ngx-countdown';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    MainLayoutComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    MenuModule,
    MenubarModule,
    CardModule,
    ButtonModule,
    HttpClientModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      progressAnimation: 'increasing',
    }),
    CountdownModule,
  ],
  providers: [ 
    ToastrService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
