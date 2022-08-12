import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  footerMessage: string = 'Developed by Group 16: CSCI 5409 S22';

  constructor() { }

  ngOnInit(): void {
  }

}
