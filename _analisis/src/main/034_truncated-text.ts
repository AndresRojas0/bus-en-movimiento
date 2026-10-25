import { Component, Input } from '@angular/core';

@Component({
  selector: 'truncated-text',
  templateUrl: 'truncated-text.html'
})
export class TruncatedTextComponent {

  @Input() text: string;
  @Input() limit: number;
  truncating = true;

  constructor() {
    
  }

}


// WEBPACK FOOTER //
// ./src/components/truncated-text/truncated-text.ts