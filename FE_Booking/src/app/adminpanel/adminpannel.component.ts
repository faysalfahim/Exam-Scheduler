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
  selector: 'app-adminpannel',
  templateUrl: './adminpannel.component.html',
  styleUrls: ['./adminpannel.component.scss']
})
export class AdminpannelComponent implements OnInit {
  displayedColumns: string[] = ['Roll','Courses','Status','Action'];
  id:number;
  length:any;
  isLoading:boolean = false
  Active: boolean[];
  requests = new MatTableDataSource<any>();
  minDate: Date;
  userId: any;
  courses:any;
  department: any;
  dateFilter:any;
  selectedRole:string;
  dataArray=[];
  dateForm=new FormGroup({
    name:new FormControl('',[Validators.required]),
    roll:new FormControl('',[Validators.required]),
    cgpa:new FormControl('',[Validators.required]),
    series:new FormControl(),
  })
  advisorForm = new FormGroup({
    name:new FormControl('',[Validators.required]),
  })
  constructor(private http:HttpClient,private _snackBar: MatSnackBar,
    private activatedRouter:ActivatedRoute,private router:Router){}
  ngOnInit(){
     this.getAllRequests()
  }

  onValChange(event:any) {

  }
  
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }
  selcteddep(dep:any){
    this.department=dep.value;

  }

  onselcteEvent(role:any) {
    this.selectedRole = role
  }

  getAllRequests() {
    let user = this.getCurrentUser()
    this.http.get(BaseUrl+'/requests').subscribe((res:any)=>{
       this.requests= res
    })
  }
  
  delete(id:any){
  }
  cancel(){
    this.dateForm.reset()
  }
  fetchData(){
  }

  // logOut() {
  //   this.router.navigate([''])
  //   localStorage.removeItem('user')
    
  // }
  generate() {
    this.http.get<any>('http://localhost:80/generate').subscribe(
      (res) => {
      },
      (err) => console.log(err)
    );
  }
  submitdate(){
    let formData = this.dateForm.getRawValue()
    this.http.post(BaseUrl+'/create/student',formData).subscribe(res=>{
      console.log("res",res);
      this.openSnackBar("Option Created",'')     
    })
    this.dateForm.reset();
  }
  submitAdvisor(){
    let formData = this.advisorForm.getRawValue()
    this.http.post(BaseUrl+'/create/advisor',formData).subscribe(res=>{
      console.log("res",res);
      this.openSnackBar("Option Created",'')     
    })
    this.dateForm.reset();
  }

  approve(element:any) {
    console.log(element)
    let obj = {
      id:element._id,
      isApproved:!element.isApproved
    }
    this.http.post(BaseUrl+'/update/request',obj).subscribe(res=>{
      this.getAllRequests()
      this.openSnackBar("Status changed",'')     
    })
  }

  reloadData() {
    this.getAllRequests()
    this.getCourses()
  }

  getCourses() {
    this.courses = new MatTableDataSource<any>()
    this.http.get<any>('http://localhost:80/courses').subscribe(
      (res) => {
        this.courses = res
        if(this.courses.length>0) {
          this.courses =  this.courses.filter((course:any) => course.students !== "");
        }
      },
      (err) => console.log(err)
    );
  }

  logOut() {
    this.router.navigate([''])
    localStorage.removeItem('user')
  }

  

  
  getCurrentUser() {
    let user = localStorage.getItem('user') || ''
    return JSON.parse(user)
  }

}
