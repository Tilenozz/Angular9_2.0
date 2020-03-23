import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Book} from '../../model/book';
import {NgForm} from '@angular/forms';

const ApiUrl = 'http://localhost:3000/books';

@Component({
  selector: 'app-book',
  template: `

    <!-- Main Content -->
    <div class="container">
      <div *ngIf="error" class="alert alert-danger">Error</div>
      <div class="row">
        <div class="col-lg-6 col-md-12 mx-0">
          <ul class="list-group">
            <li
              *ngFor="let book of books"
              class="list-group-item"
              [ngClass]="{'active': book.id === active?.id}"
              (click)="setActive(book)"
            >
              <img [src]="book.img ? book.img : '../../assets/img/copertineLibri/add.png'" class="img-thumbnail mr-2" alt="" width="40">
              {{book.title}} - {{book.author}}
              <div class="pull-right">
                <span [style.color]="book.price > 15 ? 'red' : null">€ {{book.price | number:'1.2-2'}}</span>
                <i class="fa fa-trash ml-2" (click)="delete($event,book)"></i>
              </div>
            </li>
          </ul>
        </div>
        <div class="col-lg-6 col-md12 mx-0">
          <form #f="ngForm" (submit)="save(f)">
            <div class="form-group">
              <input [ngModel]="active?.title" type="text" class="form-control" name="title" placeholder="Insert title...">
            </div>
            <div class="form-group">
              <input [ngModel]="active?.author" type="text" class="form-control" name="author" placeholder="Insert author...">
            </div>
            <div class="form-group">
              <input [ngModel]="active?.price" type="number" class="form-control" name="price" placeholder="Insert price...">
            </div>
            <div class="form-group">
              <input [ngModel]="active?.isbn" type="text" class="form-control" name="isbn" placeholder="Insert isbn...">
            </div>
            <div class="form-group">
              <textarea [ngModel]="active?.description" class="form-control" rows="3" name="description"
                        placeholder="Insert description..."></textarea>
            </div>
            <div class="form-group">
              <input style="display: none" type="file" class="form-control" name="img" (change)="readUrl($event)" #selectedFile>
            </div>
            <div class="mb-3">
              <img *ngIf="active" [src]="active?.img" height="130">
              <img *ngIf="this.imageSrc" [src]="this.imageSrc" height="130">
              <button type="button" class="btn btn-outline-warning btn-sm ml-1" (click)="selectedFile.click()">
                SELECT IMAGE
              </button>
            </div>
            <input *ngIf="this.imageSrc" [ngModel]="this.imageSrc" type="hidden" name="img">
            <input *ngIf="active" [ngModel]="active.img" type="hidden" name="img">
            <button type="submit" class="btn btn-outline-warning btn-sm mr-1">{{active ? 'EDIT' : 'ADD'}}</button>
            <button type="button" class="btn btn-outline-success btn-sm mr-1" (click)="reset(f)">RESET</button>
          </form>
        </div>
      </div>
    </div>

    <hr>

  `,
  styles: [`
    .list-group-item {
      font-size: 0.75em;
    }

    .list-group-item.active {
      z-index: 2;
      color: #fff;
      background-color: darkorange;
      border-color: darkorange;
    }

    .btn-sm {
      padding: .25rem .5rem;
      font-size: .875rem;
      line-height: 1.5;
      border-radius: .2rem;
    }
  `]
})
export class BookComponent implements OnInit {
  books: Book[];
  error: any;
  active: Book;
  imageSrc: string;

  constructor(private http: HttpClient) {
  }

  getAll() {
    this.http.get<Book[]>(ApiUrl)
      .subscribe((res: Book[]) => {
          this.books = res;
        },
        err => this.error = err);
  }

  save(form: NgForm) {
    if (this.active) {
      this.edit(form);
    } else {
      this.add(form);
    }
  }

  add(form: NgForm) {
    this.http.post<Book>(`${ApiUrl}`, form.value)
      .subscribe((res: Book) => {
        this.books.push(res);
        form.reset();
        this.imageSrc = null;
      });
  }

  edit(form: NgForm) {
    this.http.patch<Book>(`${ApiUrl}/${this.active.id}`, form.value)
      .subscribe(res => {
        const index = this.books.findIndex(b => b.id === this.active.id);
        this.books[index] = res;
      });
  }

  delete(event, book: Book) {
    event.stopPropagation();
    // const index = this.books.indexOf(book);
    this.http.delete<Book>(`${ApiUrl}/${book.id}`)
      .subscribe(() => {
          const index = this.books.findIndex(b => b.id === book.id);
          this.books.splice(index, 1);
        },
        err => this.error = err
      );
  }

  setActive(book: Book) {
    this.active = book;
  }

  reset(form: NgForm) {
    this.active = null;
    this.imageSrc = null;
    form.reset();
  }

  readUrl(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      if (this.active) {
        reader.onload = () => {
          this.active.img = reader.result as string;
        };
      } else {
          reader.onload = () => {
            this.imageSrc = reader.result as string;
          };
        }
      }

    }


  ngOnInit(): void {
    this.getAll();
  }

}
