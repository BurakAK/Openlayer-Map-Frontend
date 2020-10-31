import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import Tile from 'ol/layer/Tile';
import BingMaps from 'ol/source/BingMaps';
import { Vector } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import View from 'ol/View';
import * as olProj from 'ol/proj';
import Feature from 'ol/Feature';
import { KapiService } from '../services/kapi.service';
import Draw from 'ol/interaction/Draw';
import GeometryType from 'ol/geom/GeometryType';
import { jsPanel } from 'jspanel4';
import * as $ from 'jquery';
import Point from 'ol/geom/Point';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import { AlertifyService } from '../services/alertify.service';
import { MahalleService } from '../services/mahalle.service';
import Polygon from 'ol/geom/Polygon';
import VectorSource from 'ol/source/Vector';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [KapiService, MahalleService],
})
export class MapComponent implements OnInit {
  doorLayer: VectorLayer;
  districtLayer: VectorLayer;
  source;
  districtSource;
  door: Draw;
  district: Draw;
  map;
  layers = [];

  constructor(
    private kapiService: KapiService,
    private mahalleService: MahalleService,
    private alertifyService: AlertifyService
  ) {}

  ngOnInit() {
    this.initializeMap();
  }

   //Map'ın initialize edilmesi
   initializeMap() {
    const turkey = olProj.transform(
      [36.9744, 39.0128],
      'EPSG:4326',
      'EPSG:3857'
    );

    var styles = ['AerialWithLabels'];

    var raster = new Tile({
      visible: true,
      preload: Infinity,
      source: new BingMaps({
        key: 'AuvibMcrQ2sIXwCzo-dZpzI-cJh8iytV3ubFzfpTazlM28D_eCyIaY9m0ca9LEmx',
        imagerySet: styles[0],
      }),
    });

    this.source = new Vector({ wrapX: false });

    var vector = new VectorLayer({
      source: this.source,
    });

    this.doorLayer = new VectorLayer({
      source: new Vector(),
    });

    this.districtLayer = new VectorLayer({
      source: new VectorSource({}),
    });

    this.map = new Map({
      layers: [raster, vector, this.doorLayer, this.districtLayer],
      target: 'map',
      overlays: [],
      view: new View({
        center: turkey,
        zoom: 6.3,
        minZoom: 6.3,
        maxZoom: 20,
      }),
    });

    this.map.on('tileloadend', this.getAllDoors());
    this.getAllDistcrict();
  }

  //Kapi bilgilerinin eklenmesi
  addDoorInteraction = () => {
    this.door = this.drawPoint();
    this.map.addInteraction(this.door);

    this.door.on('drawend', (event) => {
      var currentFeature = event.feature;
      var _coords = (<any>currentFeature.getGeometry()).getCoordinates();
      var hdms = _coords[0] + '-' + _coords[1];

      this.createJsPanel(hdms);

      this.door.setActive(false);
    });
  };

  //ekle Menüsünün gelmesini saplar
  createJsPanel(hdms) {
    var content = `<input id="kapiNo" type="text" placeholder="Kapı No" class="form-control mb-1" required /><input id="mahalleKodu" type="text" placeholder="Mahalle Kodu" class="form-control mb-1"  /><button style="height:40px;width:60px" id="kapiKaydet" class="btn btn-dark">Ekle</button>`;

    this.drawPanel(content, 1, 'Kapı Ekle');

    var kapiNo, mahalleKodu;
    document.getElementById('kapiKaydet').onclick = () => {
      kapiNo = Number.parseInt($('#kapiNo').val().toString());
      mahalleKodu = Number.parseInt($('#mahalleKodu').val().toString());

      if (kapiNo >= 1 && mahalleKodu >= 1) {
        this.kapiService.add(kapiNo, mahalleKodu, hdms);
        this.alertifyService.success('Basarıyla Eklendi');
      } else {
        this.alertifyService.error('Tüm alanları doldurunuz ...');
      }
    };
  }

  //Harita özerinde Mahalle cizimi
  addDistrictInteraction = () => {
    this.district = this.drawPolygon();
    this.map.addInteraction(this.district);

    this.district.on('drawend', (event) => {
      let currentFeature = event.feature;
      let _coords = (<any>currentFeature.getGeometry()).getCoordinates();
      var coords = '';
      for (var i = 0; i < _coords.length; i++) {
        for (var ii = 0; ii < _coords[i].length; ii++)
          coords = coords + '-' + _coords[i][ii]; 
      }

      var content =
        '<input id="kapiNo" type="text" placeholder="Mahalle Adi" class="form-control mb-1" required /><button style="height:40px;width:60px" id="mahalleKaydet" class="btn btn-dark">Ekle</button>';

      this.drawPanel(content, 1, 'Mahalle Ekle');

      var mAdi;
      document.getElementById('mahalleKaydet').onclick = () => {
        mAdi = $('#kapiNo').val().toString();
        if (mAdi.length >= 1) {
          console.log(coords);
          this.mahalleService.add(mAdi, coords);
          this.alertifyService.success('Basarıyla Eklendi');
        } else {
          this.alertifyService.error('Tüm alanları doldurunuz ...');
        }
      };

      this.district.setActive(false);
    });
  };

  //Db'deki verilerin haritaya basılması
  getAllDoors() {
    this.kapiService.getDoors().subscribe((data) => {
      
      if (data.length > 0) {
        var _features = [];
        //her bir koordinatı aldım
        for (var i = 0; i < data.length; i++) {
          var coord = data[i].koordinatlar.split('-');

          var _geo = new Point([
            Number.parseInt(coord[0]),
            Number.parseInt(coord[1]),
          ]);
          var feature = new Feature({
            name: '' + data[i].kapiNo,
            geometry: _geo,
          });

          feature.setId(data[i].kapiNo);

          //feature oluşutup buna noktaları atadım ve style verdim
          var style = new Style({
            image: new Circle({
              fill: new Fill({
                color: 'rgba(0,0,255,0.5)',
              }),
              stroke: new Stroke({
                color: '#8000ff',
              }),
              radius: 10,
            }),
          });
          feature.setStyle(style); //olusturlan style featura'a set edildi
          _features.push(feature);
        }
        var source = this.doorLayer.getSource();

        source.addFeatures(_features);
      }
    });
  }

  getAllDistcrict() {
    this.mahalleService.getDistrict().subscribe((response) => {

      if (response.length > 0) {
        var _features = [];
        var _coordList = [];
        var _idList = [];

        for (var j = 0; j < response.length; j++) {
          var _coords = [];
          var _data = response[j];
          var _id = _data.mahalleKodu;
          var _koorSpt = _data.koordinatlar.split('-');

          // suan  koordinat alıyor.
          for (var i = 1; i < _koorSpt.length; i++) {
            var _mahalle = _koorSpt[i];
            var _sp = _mahalle.split(',');
            _coords.push([_sp[0], _sp[1]]);
          }

          _coordList.push(_coords);
          //artık id de alıyor
          _idList.push(_id);
        }

        // db den cızılmıs  olan her nesneyı gostermemı saglıyor
        for (var i = 0; i < _coordList.length; i++) {
          var feature = new Feature({
            name: 'Mahalle',
            geometry: new Polygon([_coordList[i]]),
          });
          //FEATURİNG DEGISKENINDE SADECE COORDLIST VAR AMA ID YOK
          var _featureID = _idList[i];
          feature.setId(_featureID);
          feature.set('adi', '123');
          //feature e set ile id atadım

          _features.push(feature);
        }
        var _mahalleSource = this.districtLayer.getSource();

        _mahalleSource.addFeatures(_features);
      }
    });
  }

   //Kapı Bilgilerini Alınması
   informationDoor() {
    //seçili işleme göre yeni bir geometrik çizi  oluşturuyor.
    //Biz point seçtireceğimiz için type ı ona göre verdik.
    var controll: boolean = false;
    var information;
    information = this.drawPoint();

    this.map.addInteraction(information);

    information.on('drawend', (e) => {
      controll = true;
      this.map.on('click', (event) => {
        information.setActive(false);

        this.map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
          //feature dan seçilen pointin bilgilerini yakalayıp db ye method üzerinden gönderelim
          //id ye feature dan gelen bilgiyi atadım
          var id = feature.getId();
          var seciliId = id;

          if (seciliId && controll) {
            this.kapiService.getDoorByKapiNo(seciliId).subscribe((data) => {
              var content = `Kapı No : <input id="yeniNo" type="text"class="form-control mb-1" value=${data.kapiNo} /> Mahalle Kodu : <input id="yeniKod" type="text"class="form-control mb-1" value=${data.mahalleKodu} /> Koordinatlar : <input id="coords" type="text"class="form-control mb-1" value=${data.koordinatlar} />`;

              this.drawPanel(content, seciliId, 'Kapı Bilgileri');
              (seciliId = 0), (content = '');
            });
            controll = false;
          }
        });
      });
    });
  }

  //MahalleBilgilerinin alınması
  informationDistrict() {
    //seçili işleme göre yeni bir geometrik çizi  oluşturuyor.
    //Biz point seçtireceğimiz için type ı ona göre verdik.
    var controll: boolean = false;
    var information;
    information = this.drawPoint();

    this.map.addInteraction(information);

    information.on('drawend', (e) => {
      information.setActive(false);
      controll = true;

      this.map.on('click', (event) => {
        this.map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
          //feature dan seçilen pointin bilgilerini yakalayıp db ye method üzerinden gönderelim
          // id ye feature dan gelen bilgiyi atadım
          var id = feature.getId();
          var seciliId = id;

          if (seciliId && controll) {
            this.mahalleService.getCityById(seciliId).subscribe((data) => {
              var content = `Mahalle Adı : <input id="yeniAd" type="text"class="form-control mb-1" value=${data.mahalleAdi} /> Mahalle Kodu : <input id="yeniKod" type="text"class="form-control mb-1" value=${data.mahalleKodu} /> Koordinatlar : <textarea class="form-control mb-1" id="yeniCoord" rows="3" >${data.koordinatlar}</textarea>`;

              this.drawPanel(content, seciliId, 'Mahalle Bilgileri');
              //degerleri sıfırla
              (seciliId = 0), (content = '');
            });
            controll = false;
          }
        });
      });
    });
  }

   //Harita Üzerinde Point Cizimi
   drawPoint() {
    return new Draw({
      source: this.source,
      type: GeometryType.POINT,
    });
  }

  //Harita üzerine Polygon Çizimi
  drawPolygon() {
    return new Draw({
      source: this.source,
      type: GeometryType.POLYGON,
    });
  }

  //Harita Üzerinde bilgilendirme ve Ekleme Paneli
  drawPanel(content: string, seciliId: number, header: string) {
    jsPanel.create({
      id: 'information' + seciliId,
      theme: 'dark',
      headerTitle: header,
      position: 'center-top 0 58',
      contentSize: '400 400',
      content: content,
      callback: function () {
        this.content.style.padding = '20px';
      },
    });
  }

}
