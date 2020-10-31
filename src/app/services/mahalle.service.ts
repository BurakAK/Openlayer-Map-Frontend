import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Mahalles } from '../models/mahalles';

@Injectable({
  providedIn: 'root'
})
export class MahalleService {

  path:string = "http://localhost:58344/api/mahalle/";

  constructor(private httpClient: HttpClient) { }

  add(mahalleAdi,koordinatlar){
    this.httpClient.post(this.path+'add',{"mahalleKodu":1, "mahalleAdi":mahalleAdi, "koordinatlar":koordinatlar}).subscribe(data => {
    })
  }

  getDistrict():Observable<Mahalles[]>{
    return this.httpClient.get<Mahalles[]>(this.path + 'getall');
  }

  getCityById(mahalleKodu): Observable<Mahalles> {
    return this.httpClient.get<Mahalles>(this.path + 'getbycode/?mahalleKodu=' + mahalleKodu);
  }

}
