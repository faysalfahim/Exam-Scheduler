import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import{HttpClient, HttpHeaders} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import * as uuid from 'uuid';
import { environment } from 'src/environments/environment';
const newId = uuid.v4();
const Baseurl = environment.apiUrl

@Component({
  selector: 'app-studentpannel',
  templateUrl: './studentpannel.component.html',
  styleUrls: ['./studentpannel.component.scss']
})
export class StudentpannelComponent implements OnInit {
  displayedColumns: string[] = ['Date', 'Department', 'Event', 'Reference','Status'];
  dataSource :any [] =[];
  allRequests=[];
  myRequests=[];
  id:number;
  length:any;
  isLoading:boolean = false
  
  allEvents:any [] =[]
  allCourses:any [] = [
    {name:'cse2121',value:'cse2101'},

    {name:'cse2123',value:'cse2303'},

    {name:'cse2124',value:'cse2104'},

    {name:'cse2125',value:'cse2105'},

    {name:'cse2126',value:'cse2106'},
  ]
  private header=new HttpHeaders({'Content-Type':'application/json'})
  Active: boolean[];
  minDate:Date =new Date();
  userId: any;
  department: any;
  dateFilter:any;
  dataArray=[];
  requests : any [] =[]
  dateForm=new FormGroup({
    roll:new FormControl(),
    course1:new FormControl(),
    course2:new FormControl(),
    course3:new FormControl(),
    course4:new FormControl(),
    course5:new FormControl()
  })
  event: any;
  constructor(private http:HttpClient,private _snackBar: MatSnackBar,private router:Router){}
  ngOnInit(){
    this.getAllRequests()
  }
  
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }
 

  getAllRequests() {
    let user = this.getCurrentUser()
    this.http.post(Baseurl+'/get/request',user).subscribe((res:any)=>{
      this.requests = res     
    })
  }
  selcteddep(dep:any){
    this.department=dep.value;
  }
  onselcteEvent(event:any) {
    this.event = event
  }
  
  delete(id:any){
  }
  cancel(){
    this.dateForm.reset()
  }
  fetchData(){
  }

  logOut() {
    this.router.navigate([''])
    localStorage.removeItem('user')
  }
  submitdate(){
    let formdata = this.dateForm.getRawValue()
    let courses:any = []
    console.log(formdata.course1)
    formdata.course1?courses.push(formdata.course1):''
    formdata.course2?courses.push(formdata.course2):''
    formdata.course3?courses.push(formdata.course3):''
    formdata.course4?courses.push(formdata.course4):''
    formdata.course5?courses.push(formdata.course5):''
    console.log(courses)
    formdata.user = this.getCurrentUser()
    let req = {
      roll:formdata.roll,
      courses:courses
    }
    this.http.post(Baseurl+'/request',req).subscribe(res=>{
      this.getAllRequests()
      this.openSnackBar("Request placed",'')  
      this.dateForm.reset();   
    },(error) => {
      this.openSnackBar(error.error.error,'')     
    })
    
  }

  getCurrentUser() {
    let user = localStorage.getItem('user') || ''
    return JSON.parse(user)
  }

}
