<template>
  <div id="cesium-map-base" :style="cesiumStyle">
    <!--    {{geo.landDistricts.length}}-->
    <div v-show="showTools" class="map-tools">
      <!-- <Button type="primary" icon  shape="circle" icon="md-pin" @click="startPick"></Button>
      -->
      <slot name="left"></slot>
      <!--   <Button type="text" ghost @click="startPick">
           <Icon type="md-pin" :size="36"/>
      </Button>-->
    </div>
    <div id="tip" v-show="tip" class="map-tip">
      <Row type="flex" justify="center">
        <Col span="4">
          <Alert show-icon>
            <b>{{tip}}</b>
            <div v-show="picked.position" style="text-align: center;">
              <Button type="text" @click="cancelPick">取消</Button>
              <Button type="primary" @click="completePick">确认</Button>
            </div>
          </Alert>
        </Col>
      </Row>
    </div>

    <div class="map-tools-right">
      <!-- <Tooltip content="显示控制" placement="left">
       <Button icon="ios-switch" size="large"  shape="circle" @click="showControl = true" v-show="!showControl" ghost type="text"></Button>
      </Tooltip>-->
    </div>
    <Drawer title="显示控制" :closable="false" v-model="showControl" style="z-index: 1002;">
      <CellGroup>
        <Cell title="社区">
          <i-Switch size="large" v-model="switch1" slot="extra">
            <span slot="open">显示</span>
            <span slot="close">隐藏</span>
          </i-Switch>
        </Cell>
        <Cell title="社区网络">
          <i-Switch size="large" v-model="switch1" slot="extra">
            <span slot="open">显示</span>
            <span slot="close">隐藏</span>
          </i-Switch>
        </Cell>
      </CellGroup>
      <Divider></Divider>
      <CellGroup>
        <Cell title="社区">
          <i-Switch size="large" v-model="switch1" slot="extra">
            <span slot="open">显示</span>
            <span slot="close">隐藏</span>
          </i-Switch>
        </Cell>
        <Cell title="社区网络">
          <i-Switch size="large" v-model="switch1" slot="extra">
            <span slot="open">显示</span>
            <span slot="close">隐藏</span>
          </i-Switch>
        </Cell>
      </CellGroup>
    </Drawer>
    <div class="map-tools-bottom">
      <slot name="bottom"></slot>
    </div>
    <!--地图信息调试-->
    <!-- <Card class="map-console">
       <p><b>picked</b> : {{picked}}</p>
       <p><b>currentCamera</b> : {{currentCamera}}</p>
       <p><b>cameraLevel</b> : {{cameraLevel}}</p>
    </Card>-->
    <div>
      <div id="cesium-container">
        <!--地图容器-->
      </div>
      <Spin fix v-if="spinShow" style="z-index: 1000003">
        <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
        <div>加载地图数据...</div>
      </Spin>
    </div>
  </div>
</template>

<script>
import Cesium from "cesium/Cesium";
import widgets from "cesium/Widgets/widgets.css";
import { cartesian3ToDegree } from "@/libs/cutil";
import rymjcs from "@/api/jsondata/人员密集场所.json";
import jyqz from "@/api/jsondata/加油气站.json";
import yhnlsqjws from "@/api/jsondata/友好南路社区警务室.json";
import tjdlsqjws from "@/api/jsondata/团结东路社区警务室.json";
import dxcs from "@/api/jsondata/大型超市.json";
import jyjg from "@/api/jsondata/教育机构.json";
import whblsqjws from "@/api/jsondata/文化北路社区警务室.json";
import whnlsqjws from "@/api/jsondata/文化南路社区警务室.json";
import mzblsqjws from "@/api/jsondata/民主北路社区警务室.json";
import sq from "@/api/jsondata/社区.json";
import sqwg1 from "@/api/jsondata/sqwg/友好南路社区警务室.json";
import sqwg2 from "@/api/jsondata/sqwg/团结东路社区警务室.json";
import sqwg3 from "@/api/jsondata/sqwg/文化北路社区警务室.json";
import sqwg4 from "@/api/jsondata/sqwg/文化南路社区警务室.json";
import sqwg5 from "@/api/jsondata/sqwg/民主北路社区警务室.json";
import jdbg from "@/api/jsondata/酒店宾馆.json";

export default {
  name: "cesium-map-base",
  props: {
    cesiumStyle: {
      type: Object,
      default: function() {
        return {
          height: "100px"
        };
      }
    },
    pickType: {
      type: String,
      default: function() {
        return "point";
      }
    }
  },
  watch: {
    picking(val) {
      if (val) {
        this.startPick();
      } else {
        this.stopPick();
      }
    },
    overlay(val) {
      var _this = this;
      _.forEach(val, function(ol, i) {
        var point = {
          id: "overlayPoint" + i,
          position: ol.position,
          color: [239, 245, 36],
          icon: "house",
          text: ""
        };
        _this.addPoint(point);
        if (ol.camera) {
          // _this.setView(_this.geo.initialCamera);
          var time = 0;

          setTimeout(function() {
            _this.setView(ol.camera);
          }, time);
        }
      });
    },
    "picked.position.lon": {
      handler(val) {
        var _this = this;
        var point = {
          id: "pickedPoint",
          position: this.picked.position,
          color: [100, 228, 43],
          icon: "location",
          text: ""
        };
        _this.addPoint(point);
      },
      immediate: true
      // deep: true
    }
  },
  data() {
    return {
      colorSeq: 0,
      switch1: true,
      showControl: false,
      showTools: true, // 显示工具
      spinShow: false,
      mapShow: {
        landMark: true
      },
      picking: false,
      pickHandler: {},
      overlay: [],
      geo: {
        initialCamera: {
          position: {
            // 青河/富蕴 位置变更 标记
            // x: -29068.151266718203,
            // y: 4385959.219216957,
            // z: 4617557.8229551455
            x: 37277.439182592745,
            y: 4362687.706274172,
            z: 4645353.794903784
          },
          // heading: 0.2422529037945118,
          // pitch: -0.7143765122090757
          heading: 0.016904516702650696,
          pitch: -1.3546026135359606
        },
        landMarks: [
          /* {name: '花苑小区', position: [90.3820025451447, 46.67236385745338, 1260], type: "小区"}, */
        ],
        landDistricts: [], // [[90.37991975897464, 46.67317191808513, 90.33991975897464, 46.63317191808513, 90.39991975897464, 46.69317191808513,]],
        roadNames: [
          {
            level: "", // 级别
            position: "", // 位置
            text: "", // 文本
            方向: "" // 方向
          }
        ]
      },
      tip: "",
      picked: {},
      dataUrls: [
        "XJFY-3DTiles/tileset.json"
        // "/CesiumData/QH01_Cesium/Scene/QH01_Cesium.json",
        // "/CesiumData/QH02_Cesium/Scene/QH02_Cesium.json",
        // "/CesiumData/QH03_Cesium/Scene/QH03_Cesium.json",
        // "/CesiumData/QH04_2_Cesium/Scene/XJQH_04_02_C.json",
        // "/CesiumData/QH04_Cesium/Scene/Production_6.json",
        // "/CesiumData/XQ04_03_cesium/Scene/XQ04_03_cesium.json"
      ], // 三维数据地址
      // dataUrls: [
      //   // "/3D/Production_2/Scene/Production_2.json",
      //   // "/3D/Production_2_bu/Scene/Production_2.json",
      //   // "/3D/Xinjian-3DTiles-V1.2/Scene/Xinjianm3DTilesmV1.2.json"
      //   "/CesiumData/QH03_Cesium/Scene/QH03_Cesium.json" //本地数据 数据变更
      // ], // 三维数据地址
      cesium_token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMTZjNmQxMS0zNmUyLTQzM2ItYmRjOC03OTNkMzkwZjEyYjYiLCJpZCI6MzgxNiwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MzkwNzgxM30.sMoEoLbiHsKTagh0eCSf5cDufWHPFknnyWvr3ZFKUks"
    };
  },
  computed: {
    isPicking() {
      return this.picking;
    },
    currentCamera() {
      if (this.viewer) {
        let cameraPosition = {
          position: this.viewer.camera.position,
          heading: this.viewer.camera.heading,
          pitch: this.viewer.camera.pitch
        };
        return cameraPosition;
      } else {
        return "";
      }
    },
    cameraLevel() {
      var levelSetting = [4617970, 4618286, 4620749];
      if (this.viewer) {
        var z = this.viewer.camera.position.z;
        if (z < levelSetting[0]) {
          return 4;
        } else if (z < levelSetting[1]) {
          return 3;
        } else if (z < levelSetting[2]) {
          return 2;
        } else {
          return 1;
        }
      } else {
        return "";
      }
    }
  },
  mounted() {
    var _this = this;
    var landMarkDatas = [
      rymjcs,
      jyqz,
      yhnlsqjws,
      tjdlsqjws,
      dxcs,
      jyjg,
      whblsqjws,
      whnlsqjws,
      mzblsqjws,
      jdbg
    ];
    var landDistrictDatas = [sq, sqwg1, sqwg2, sqwg3, sqwg4, sqwg5];
    _.forEach(landMarkDatas, function(landMarkData) {
      var type = landMarkData.name;
      _.forEach(landMarkData.features, function(feature) {
        _this.geo.landMarks.push({
          name: feature.properties.TE_TEXT,
          position: [
            feature.geometry.coordinates[0],
            feature.geometry.coordinates[1],
            feature.geometry.coordinates[2]
          ],
          type: type
        });
      });
    });
    _.forEach(landDistrictDatas, function(landDistrictData) {
      _.forEach(landDistrictData.features, function(feature) {
        _this.geo.landDistricts.push(
          _.flattenDeep(feature.geometry.coordinates)
        );
      });
    });

    this.spinShow = true;
    this.init();
    this.listenWheel();

    setTimeout(() => {
      _this.spinShow = false;
      _this.addLandMarks();
      _this.addLandDistricts();
    }, 3000);
  },
  methods: {
    showPoint(point) {
      this.overlay = [];
      this.overlay.push(point);
    },
    addLandDistricts() {
      var _this = this;
      var alpha = 0.5;
      var colors = [
        new Cesium.Color(193 / 255, 46 / 255, 52 / 255, alpha),
        new Cesium.Color(230 / 255, 182 / 255, 0 / 255, alpha),
        new Cesium.Color(0 / 255, 152 / 255, 217 / 255, alpha),
        new Cesium.Color(43 / 255, 130 / 255, 29 / 255, alpha),
        new Cesium.Color(0 / 255, 94 / 255, 170 / 255, alpha),
        new Cesium.Color(51 / 255, 156 / 255, 168 / 255, alpha),
        new Cesium.Color(205 / 255, 168 / 255, 25 / 255, alpha),
        new Cesium.Color(50 / 255, 164 / 255, 135 / 255, alpha)
      ];

      _.forEach(this.geo.landDistricts, function(landDistrict) {
        if (_this.colorSeq >= colors.length) {
          _this.colorSeq = 0;
        }
        var color = colors[_this.colorSeq];
        _this.colorSeq = _this.colorSeq + 1;
        var redLine = _this.viewer.entities.add({
          name: "Red line on terrain",
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(landDistrict),
            width: 10,
            material: color,
            clampToGround: true
          }
        });
      });
    },
    addLandMarks() {
      var landMarks = [
        //青河/富蕴 位置变更 标记
        // {
        //   position: { lon: 90.37991975897464, lat: 46.67317191808513 },
        //   text: "青河县旅游宾馆",
        //   type: "特种行业"
        // },
        // {
        //   position: { lon: 90.38177629219192, lat: 46.67460114471527 },
        //   text: "花园小区",
        //   type: "小区"
        // }
      ];
      /*  "人员密集场所": {color: [125, 0, 200], icon: "icon-mjcs"},//紫色
          "加油气站": {color: [200, 125, 0], icon: "icon-tzhy"},//橙色
          "小区": {color: [19, 162, 88], icon: "icon-xq"},//绿色
          "重点单位": {color: [162, 19, 88], icon: "icon-zddw"},//红色
          "企事业单位": {color: [19, 88, 162], icon: "icon-qsydw"},//蓝色 */
      var markType = {
        //青河/富蕴 位置变更 标记
        友好南路社区警务室: { color: [19, 162, 88], icon: "icon-xq" }, //绿色
        团结东路社区警务室: { color: [19, 162, 88], icon: "icon-xq" }, //绿色
        文化北路社区警务室: { color: [19, 162, 88], icon: "icon-xq" }, //绿色
        文化南路社区警务室: { color: [19, 162, 88], icon: "icon-xq" }, //绿色
        民主北路社区警务室: { color: [19, 162, 88], icon: "icon-xq" }, //绿色
        人员密集场所: { color: [125, 0, 200], icon: "icon-mjcs" }, //紫色
        加油气站: { color: [200, 125, 0], icon: "icon-tzhy" }, //橙色
        大型超市: { color: [162, 19, 88], icon: "icon-zddw" }, //红色
        教育机构: { color: [19, 88, 162], icon: "icon-qsydw" }, //蓝色
        酒店宾馆: { color: [162, 19, 88], icon: "icon-zddw" } //红色
      };
      var _this = this;
      var pinBuilder = new Cesium.PinBuilder();
      _.forEach(this.geo.landMarks, function(landMark) {
        // "lon": 90.37479884584577, "lat": 46.67431152045768, "height": 1224.830480483262
        _this.addLandMark({
          position: {
            lon: landMark.position[0],
            lat: landMark.position[1],
            height: landMark.position[2]
          },
          color: markType[landMark.type].color,
          icon: markType[landMark.type].icon,
          text: landMark.name
        });
      });
    }, // 添加多个地标
    addLandMark(landMark) {
      var _this = this;
      /* landMark = {
           position: {"lon": 90.37991975897464, "lat": 46.67317191808513},
           position: {"lon": 90.3801622781649, "lat": 46.673604919008795, "height": 1234.7381457974784},
           color: {r:255,g:255,b:255},
           icon: 'zhongdiandanwei-red',
           text: '',
         }; */
      var pinBuilder = new Cesium.PinBuilder();
      var position = landMark.position;
      var pinPosition = Cesium.Cartesian3.fromDegrees(
        position.lon,
        position.lat,
        position.height
      );
      // pinPosition = _this.viewer.scene.clampToHeight(pinPosition);
      // console.log("输出pinPosition:",pinPosition);
      var url = Cesium.buildModuleUrl(
        require("@/assets/images/" + landMark.icon + ".png")
      );
      var pinColor = new Cesium.Color(
        Number(landMark.color[0]) / 255,
        Number(landMark.color[1]) / 255,
        Number(landMark.color[2]) / 255,
        1
      );
      var groceryPin = Cesium.when(
        pinBuilder.fromUrl(url, pinColor, 44),
        function(canvas) {
          return _this.viewer.entities.add({
            name: "Grocery store",
            position: pinPosition,
            label: {
              show: true,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              font: "22px 微软雅黑",
              outlineWidth: 8,
              fillColor: new Cesium.Color(1, 1, 1, 1), // 文字颜色
              outlineColor: pinColor, // 文字轮廓颜色
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              text: landMark.text,
              pixelOffset: new Cesium.Cartesian2(0, 0),
              pixelOffsetScaleByDistance: new Cesium.NearFarScalar(
                1.5e2,
                3.0,
                1.5e7,
                0.5
              ),
              translucencyByDistance: new Cesium.NearFarScalar(1500, 1, 2000, 0) // 代表2000米，透明度1。3000米，文字透明度0
            },
            billboard: {
              image: canvas.toDataURL(),
              // image: pinBuilder.fromColor( pinColor, 44).toDataURL(),
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, 6.0),
              pixelOffsetScaleByDistance: new Cesium.NearFarScalar(
                1.5e2,
                3.0,
                1.5e7,
                0.5
              ),
              translucencyByDistance: new Cesium.NearFarScalar(2000, 1, 3000, 0) // 代表2000米，透明度1。3000米，文字透明度0
            }
          });
        }
      );
    }, // 添加一个地标
    addPoint(point) {
      this.viewer.entities.removeById(point.id);
      if (point && point.position) {
        var _this = this;
        /* landMark = {
             position: {"lon": 90.37991975897464, "lat": 46.67317191808513},
             position: {"lon": 90.3801622781649, "lat": 46.673604919008795, "height": 1234.7381457974784},
             color: {r:255,g:255,b:255},
             icon: 'zhongdiandanwei-red',
             text: '',
           }; */
        var pinBuilder = new Cesium.PinBuilder();
        var position = point.position;
        var pinPosition = Cesium.Cartesian3.fromDegrees(
          position.lon,
          position.lat,
          position.height
        );
        // pinPosition = _this.viewer.scene.clampToHeight(pinPosition);
        var url = Cesium.buildModuleUrl(
          require("@/assets/images/" + point.icon + ".png")
        );
        var pinColor = new Cesium.Color(
          Number(point.color[0]) / 255,
          Number(point.color[1]) / 255,
          Number(point.color[2]) / 255,
          1
        );
        var groceryPin = Cesium.when(
          pinBuilder.fromUrl(url, pinColor, 44),
          function(canvas) {
            return _this.viewer.entities.add({
              id: point.id,
              name: "Grocery store",
              position: pinPosition,
              label: {
                show: true,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                font: "22px 微软雅黑",
                outlineWidth: 8,
                fillColor: new Cesium.Color(1, 1, 1, 1), // 文字颜色
                outlineColor: pinColor, // 文字轮廓颜色
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                text: point.text,
                pixelOffset: new Cesium.Cartesian2(0, -11.3),
                pixelOffsetScaleByDistance: new Cesium.NearFarScalar(
                  1.5e2,
                  3.0,
                  1.5e7,
                  0.5
                ),
                translucencyByDistance: new Cesium.NearFarScalar(
                  1200,
                  1,
                  1800,
                  0
                ) // 代表2000米，透明度1。3000米，文字透明度0
              },
              billboard: {
                image: canvas.toDataURL(),
                // image: pinBuilder.fromColor( pinColor, 44).toDataURL(),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -6.0),
                pixelOffsetScaleByDistance: new Cesium.NearFarScalar(
                  1.5e2,
                  3.0,
                  1.5e7,
                  0.5
                ),
                translucencyByDistance: new Cesium.NearFarScalar(
                  2000,
                  1,
                  3000,
                  0
                ) // 代表2000米，透明度1。3000米，文字透明度0
              },
              ellipsoid: {
                radii: new Cesium.Cartesian3(0.33, 0.65, 0.5),
                material: pinColor
              }
            });
          }
        );
      }
    }, // 添加点
    completePick() {
      this.$emit("on-pick", this.picked);
      this.stopPick();
    }, // 完成拾取
    stopPick() {
      this.tip = "";
      this.picked = {};
      this.pickHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
    },
    cancelPick() {
      this.$emit("on-cancel");
      this.stopPick();
    },
    startPick() {
      this.tip = "请点击地图标注位置";
      var _this = this;
      var scene = this.viewer.scene;
      var viewer = this.viewer;
      this.pickHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
      this.pickHandler.setInputAction(function(evt) {
        var scene = _this.viewer.scene;
        var pickedObject = scene.pick(evt.position);
        var cartesian = viewer.scene.pickPosition(evt.position);
        if (Cesium.defined(cartesian)) {
          var pickPosition = _this.cartesion2Degree(cartesian);
          var camera = {
            position: viewer.camera.position,
            heading: viewer.camera.heading,
            pitch: viewer.camera.pitch
          };
          _this.picked = { position: pickPosition, camera: camera };
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }, // 开始拾取
    listenWheel() {
      var _this = this;
      var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
      handler.setInputAction(function(event) {},
      Cesium.ScreenSpaceEventType.WHEEL);
    }, // 监听滚轮
    setView(camera) {
      // this.viewer.camera.setView({
      //   destination: Cesium.Cartesian3.fromDegrees(Number(this.geo.initialCamera.position.lon), Number(this.geo.initialCamera.position.lat), Number(this.geo.initialCamera.position.alt)),
      // })
      // this.viewer.camera.setView({
      //   destination: Cesium.Cartesian3.fromDegrees(-117.16, 32.71, 15000.0)
      // })
      this.viewer.camera.flyTo({
        // destination: Cesium.Cartesian3.fromDegrees(Number(this.geo.initialCamera.position.lon), Number(this.geo.initialCamera.position.lat), Number(this.geo.initialCamera.position.alt)),
        destination: new Cesium.Cartesian3(
          Number(camera.position.x),
          Number(camera.position.y),
          Number(camera.position.z)
        ),
        orientation: {
          heading: camera.heading, // east, default value is 0.0 (north)
          pitch: camera.pitch, // default value (looking down)
          roll: 0.0 // default value
        }
      });
    },
    test() {
      console.log("this is cesium-map-base page.");
    },
    init() {
      var _this = this;
      // var serverIP = "http://120.69.220.48:8009/";
      var serverIP = "http://localhost:8080/";
      var terrainProvider = new Cesium.CesiumTerrainProvider({
        url: serverIP + "data-fy/dem-fy"
      });
      var imageryProvider1 = new Cesium.createTileMapServiceImageryProvider({
        // url: Cesium.buildModuleUrl(serverIP + "qhtiles")
        url: Cesium.buildModuleUrl(serverIP + "data-fy/dom-fy")
      });
      //影像,互联网,备注
      var googleimageryProvider = new Cesium.UrlTemplateImageryProvider({
        url: "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali"
      });

      Cesium.Ion.defaultAccessToken = this.cesium_token;
      this.viewer = new Cesium.Viewer("cesium-map-base", {
        // 需要进行可视化的数据源的集合
        animation: false, // 是否显示动画控件
        shouldAnimate: true,
        homeButton: false, // 是否显示Home按钮
        fullscreenButton: false, // 是否显示全屏按钮
        baseLayerPicker: false, // 是否显示图层选择控件
        geocoder: false, // 是否显示地名查找控件
        timeline: false, // 是否显示时间线控件
        sceneModePicker: false, // 是否显示投影方式控件
        navigationHelpButton: false, // 是否显示帮助信息控件
        infoBox: false, // 是否显示点击要素之后显示的信息
        requestRenderMode: true, // 启用请求渲染模式
        scene3DOnly: true, // 每个几何实例将只能以3D渲染以节省GPU内存
        sceneMode: Cesium.SceneMode.MORPHING, // 初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  Cesium.SceneMode
        imageryProvider: googleimageryProvider,
        // imageryProvider: imageryProvider1,
        // terrainProvider: terrainProvider
        terrainProvider: Cesium.createWorldTerrain()
      });
      // this.viewer.sceneMode = Cesium.SceneMode.MORPHING
      // 加载三维数据
      _.forEach(this.dataUrls, function(dataUrl) {
        _this.viewer.scene.primitives.add(
          new Cesium.Cesium3DTileset({
            url: serverIP + dataUrl,
            maximumScreenSpaceError: 2,
            maximumNumberOfLoadedTiles: 1000,
            maximumMemoryUsage: 4096,
            skipLevels: 1
          })
        );
      });
      this.viewer._cesiumWidget._creditContainer.style.display = "none"; // 屏蔽loge广告
      this.setView(this.geo.initialCamera);
    }, // 初始化
    cartesion2Degree(cartesian) {
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      let lon = Cesium.Math.toDegrees(cartographic.longitude);
      let lat = Cesium.Math.toDegrees(cartographic.latitude);
      let height = cartographic.height; // 模型高度
      let degree = { lon: lon, lat: lat, height: height };
      return degree;
    } // 世界坐标转经纬度
  }
};
</script>

<style scoped>
#cesium-map-base {
  height: 500px;
}

.map-tip {
  position: absolute;
  margin-top: 10px;
  z-index: 1000;
  width: 100%;
}

.map-console {
  position: absolute;
  bottom: 10px;
  margin-left: 10px;
  z-index: 1000;
  width: 800px;
}

.map-tools {
  position: absolute;
  margin-left: 10px;
  margin-top: 10px;
  z-index: 1001;
}

.map-tools-right {
  position: absolute;
  right: 30px;
  margin-top: 10px;
  z-index: 1001;
}

.map-tools-bottom {
  position: absolute;
  bottom: 22px;
  z-index: 1001;
}

.demo-spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}
</style>
