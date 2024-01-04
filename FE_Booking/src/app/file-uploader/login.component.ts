import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-upload-file',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class FileUploadComponenet implements OnInit {
  @Input() type = ''; 
  title = 'fileUpload';
  images:any;
  multipleImages = [];
  constructor(private http: HttpClient){}

  ngOnInit(){
      this.getCourses()
  }

  selectImage(event:any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.images = file;
    }
  }

  selectMultipleImage(event:any){
    if (event.target.files.length > 0) {
      this.multipleImages = event.target.files;
    }
  }

  onSubmit(){
    const formData = new FormData();
    let url = 'file/student'
    formData.append('file', this.images);
    if(this.type != 'student') {
        url='file/advisor'
    }
    this.http.post<any>('http://localhost:80/'+url, formData).subscribe(
      (res) => {
        setTimeout(()=> {
          this.getCourses()
        },5000)
       
      },
      (err) => console.log(err)
    );
  }

  getCourses() {
    this.http.get<any>('http://localhost:80/courses').subscribe(
      (res) => {
        console.log(res)
      },
      (err) => console.log(err)
    );
  }

}
