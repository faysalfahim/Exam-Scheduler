import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import{HttpClient, HttpHeaders} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import * as uuid from 'uuid';
import { environment } from 'src/environments/environment';
import { MatTableDataSource } from '@angular/material/table';
const myId = uuid.v4();
const BaseUrl = environment.apiUrl

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.scss']
})
export class AddStudentComponent implements OnInit {
  dateForm=new FormGroup({
    date1:new FormControl('',[Validators.required]),
    date2:new FormControl('',[Validators.required]),
    date3:new FormControl('',[Validators.required]),
    date4:new FormControl(),
    date5:new FormControl(),
  })
  constructor(private http:HttpClient,private _snackBar: MatSnackBar,
    private activatedRouter:ActivatedRoute,private router:Router){}

  ngOnInit(): void {
  }

  submitdate(){
    let formData = this.dateForm.getRawValue()
    let payload = {
      date1:formData.date1 ? formData.date1.toDateString():null,
      date2:formData.date2 ? formData.date2.toDateString():null,
      date3:formData.date3 ? formData.date3.toDateString():null,
      date4:formData.date4 ? formData.date4.toDateString():null,
      date5:formData.date5 ? formData.date5.toDateString():null,
    }
    this.http.post(BaseUrl+'/create/dates',payload).subscribe(res=>{
      console.log("res",res);
      this.openSnackBar("Dates Created",'')     
    })
    this.dateForm.reset();
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  deleteAllStudents() {
    this.http.delete<any>('http://localhost:80/delete').subscribe(
      (res) => {
      //  this.getAdvisors()
      },
      (err) => console.log(err)
    );
  }

}
