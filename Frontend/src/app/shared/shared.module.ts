import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TabViewModule} from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {PanelModule} from 'primeng/panel';
import {CardModule} from 'primeng/card';
import {DialogModule} from 'primeng/dialog';
import {FieldsetModule} from 'primeng/fieldset';
import {DropdownModule} from 'primeng/dropdown';
import {MultiSelectModule} from 'primeng/multiselect';
import {RadioButtonModule} from 'primeng/radiobutton';
import {ChipsModule} from 'primeng/chips';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {DataViewModule} from 'primeng/dataview';
import {CheckboxModule} from 'primeng/checkbox';
import {DividerModule} from 'primeng/divider';
import {TableModule} from 'primeng/table';
import {FileUploadModule} from 'primeng/fileupload';
import {ImageModule} from 'primeng/image';
import { CountdownModule } from 'ngx-countdown';

// ngx-spinner import
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    TabViewModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    MessagesModule,
    MessageModule,
    PanelModule,
    CardModule,
    DialogModule,
    FieldsetModule,
    DropdownModule,
    MultiSelectModule,
    RadioButtonModule,
    ChipsModule,
    InputTextModule,
    InputNumberModule,
    DataViewModule,
    CheckboxModule,
    DividerModule,
    TableModule,
    FileUploadModule,
    ImageModule,
    CountdownModule,
    NgxSpinnerModule
  ],
  exports: [
    TabViewModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    MessagesModule,
    MessageModule,
    PanelModule,
    CardModule,
    DialogModule,
    FieldsetModule,
    DropdownModule,
    MultiSelectModule,
    RadioButtonModule,
    ChipsModule,
    InputTextModule,
    InputNumberModule,
    DataViewModule,
    CheckboxModule,
    DividerModule,
    TableModule,
    FileUploadModule,
    ImageModule,
    CountdownModule,
    NgxSpinnerModule
  ]
})
export class SharedModule { }
