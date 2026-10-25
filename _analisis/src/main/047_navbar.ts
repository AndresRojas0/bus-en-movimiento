import { Component } from '@angular/core';

/**
 * Generated class for the NavbarComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'navbar',
  templateUrl: 'navbar.html'
})
export class NavbarComponent {

  text: string;

  constructor() {
    console.log('Hello NavbarComponent Component');
    this.text = 'Hello World';
  }

}



// WEBPACK FOOTER //
// ./src/components/navbar/navbar.ts