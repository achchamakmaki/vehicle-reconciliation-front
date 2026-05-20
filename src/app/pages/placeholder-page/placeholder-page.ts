import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './placeholder-page.html',
  styleUrl: './placeholder-page.css',
})
export class PlaceholderPageComponent {
  title = 'Module';

  constructor(private route: ActivatedRoute) {
    this.title = this.route.snapshot.data['title'] || 'Module';
  }
}
