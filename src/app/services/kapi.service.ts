import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Kapi } from '../models/kapi';

@Injectable({
  providedIn: 'root'
})
export class KapiService {

  path:string = "http://localhost:58344/api/kapi/";
  
  constructor(private httpClient: HttpClient) { }

  add(kapiNo:number,mahalleKodu:number,koordinatlar:string){
    this.httpClient.post(this.path+'add',{"kapiNo":kapiNo, "mahalleKodu":mahalleKodu, "koordinatlar":koordinatlar}).subscribe(data => {
    })
  }

  getDoors():Observable<Kapi[]>{
    return this.httpClient.get<Kapi[]>(this.path + 'getall');
  }

  getDoorByKapiNo(kapiNo): Observable<Kapi> {
    return this.httpClient.get<Kapi>(this.path + 'getbykapino/?kapiNo=' + kapiNo);
  }
}
