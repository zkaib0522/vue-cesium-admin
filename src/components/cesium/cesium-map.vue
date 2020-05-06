<template>
  <div id="cesium-map" :style="cesiumStyle"></div>
</template>

<script>
import Cesium from "cesium/Cesium";
import widgets from "cesium/Widgets/widgets.css";

export default {
  name: "cesium-map",
  props: {
    cesiumStyle: {
      type: Object,
      default: function() {
        return {
          height: "100px"
        };
      }
    },
    camera: {
      type: Object
    },
    overlay: {
      type: Array
    },
    picking: {
      type: Boolean
    }
  },
  watch: {
    overlay(val) {
      this.loadOverlay();
    },
    camera(val) {
      let centerCamera = {
        // heading: 0.2316885450934265,
        // pitch: -1.0588058198275196,
        heading: 0.016904516702650696,
        pitch: -1.3546026135359606,
        position: {
          // 青河/富蕴 位置变更 标记
          // x: -28731.775874104227,
          // y: 4386503.8234824315,
          // z: 4617679.660869936
          x: 37277.439182592745,
          y: 4362687.706274172,
          z: 4645353.794903784
        }
      };

      this.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromElements(
          Number(centerCamera.position.x),
          Number(centerCamera.position.y),
          Number(centerCamera.position.z)
        ), // Cesium.Cartesian3.fromDegrees(this.position.lon, this.position.lat, this.position.height),// Cesium.Cartesian3.fromElements(Number(this.position.x), Number(4385202.284005581), Number(4617635.651295184)),//Cesium.Cartesian3.fromDegrees(this.position.lon, this.position.lat, this.position.alt),
        orientation: {
          heading: this.camera.heading,
          pitch: this.camera.pitch,
          roll: 0.0
        }
      });
      this.setView(); //
    },
    picking(val) {
      let _this = this;
      if (val) {
        var scene = this.viewer.scene;
        var viewer = this.viewer;
        this.handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        this.handler.setInputAction(function(evt) {
          var scene = _this.viewer.scene;
          var pickedObject = scene.pick(evt.position);
          var cartesian = viewer.scene.pickPosition(evt.position);
          if (Cesium.defined(cartesian)) {
            var pickPosition = _this.cartesion2Degree(cartesian);
            var camera = {
              position: viewer.camera.position,
              heading: viewer.camera.heading,
              pitch: viewer.camera.pitch
            }; // _this.cartesion2Degree(viewer.camera.position);
            if (true) {
              // TODO 单点
              _this.pickedPositions = [];
            }
            console.log(camera);
            _this.pickedPositions.push({
              position: pickPosition,
              camera: camera
            });
            _this.$emit("on-pick", _this.pickedPositions);
            _this.loadOverlay();
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      } else {
        this.pickedPositions = [];
        this.loadOverlay();
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      }
    }
  },
  data() {
    return {
      handler: {},
      viewer: null,
      cesium_token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMTZjNmQxMS0zNmUyLTQzM2ItYmRjOC03OTNkMzkwZjEyYjYiLCJpZCI6MzgxNiwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MzkwNzgxM30.sMoEoLbiHsKTagh0eCSf5cDufWHPFknnyWvr3ZFKUks",
      // cesium_token:
      //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NjBlYzRiYS0wMDRhL" +
      //   "TRjZWYtODJhOS1jZTk5ZmI4ZDg5ZTIiLCJpZCI6ODI1MCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MTU3M" +
      //   "DU1Mn0.yfJ_i4EPiunFj_qUftuv1ksx4pUNgnPC16vQCBGrM08",
      dataUrls: [
        // "/CesiumData/QH01_Cesium/Scene/tileset.json",
        // "/CesiumData/QH01_Cesium/Scene/QH01_Cesium.json",
        // "/CesiumData/QH02_Cesium/Scene/QH02_Cesium.json",
        // "/CesiumData/QH03_Cesium/Scene/QH03_Cesium.json",
        // "/CesiumData/QH04_2_Cesium/Scene/XJQH_04_02_C.json",
        // "/CesiumData/QH04_Cesium/Scene/Production_6.json",
        // "/CesiumData/XQ04_03_cesium/Scene/XQ04_03_cesium.json"
        "XJFY-3DTiles/tileset.json"
      ], // 三维数据地址
      //青河/富蕴 位置变更 标记
      // dataUrls: ["/3D/Xinjiang-3DTiles/3DTiles/Scene/Production_3.json"], // 三维数据地址
      pickedPositions: []
    };
  },
  mounted() {
    var _this = this;
    // var serverIP = "http://120.69.220.48:8009/";
    var serverIP = "http://localhost:8080/";
    //地形
    var terrainProvider = new Cesium.CesiumTerrainProvider({
      url: serverIP + "data-fy/dem-fy"
    });

    //影像,互联网,备注
    var googleimageryProvider = new Cesium.UrlTemplateImageryProvider({
      url: "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali"
    });
    var imageryProvider = new Cesium.BingMapsImageryProvider({
      url: "https://dev.virtualearth.net",
      key: "AvzM4FgDkpuZwkwP9DPDUwq15NUTJxHNyyUHGSXiA9JwAtAinnlPS31PvwB3hcWh",
      mapStyle: Cesium.BingMapsStyle.AERIAL
    });
    // 本地影像
    var imageryProvider1 = new Cesium.createTileMapServiceImageryProvider({
      url: Cesium.buildModuleUrl(serverIP + "data-fy/dom-fy")
    });

    Cesium.Ion.defaultAccessToken = this.cesium_token;
    this.viewer = new Cesium.Viewer("cesium-map", {
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
      // fullscreenElement: document.body, //全屏时渲染的HTML元素 暂时没发现用处
      // imageryProvider: googleimageryProvider,
      // imageryProvider: imageryProvider,
      // terrainProvider: Cesium.createWorldTerrain()
      //青河/富蕴 位置变更 标记
      imageryProvider: imageryProvider1,
      terrainProvider: terrainProvider
    });
    this.viewer.sceneMode = Cesium.SceneMode.MORPHING;
    // 加载三维数据
    _.forEach(this.dataUrls, function(dataUrl) {
      _this.viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: dataUrl,
          maximumScreenSpaceError: 1, // 根据屏幕调整初始显示精度
          maximumNumberOfLoadedTiles: 1000,
          skipLevelOfDetail: true,
          baseScreenSpaceError: 1024,
          skipScreenSpaceErrorFactor: 16,
          skipLevels: 1,
          immediatelyLoadDesiredLevelOfDetail: true,
          loadSiblings: false,
          cullWithChildrenBounds: true,
          dynamicScreenSpaceError: true,
          dynamicScreenSpaceErrorDensity: 0.00278,
          dynamicScreenSpaceErrorFactor: 4.0,
          dynamicScreenSpaceErrorHeightFalloff: 0.25
        })
      );
    });
    this.viewer._cesiumWidget._creditContainer.style.display = "none"; // 屏蔽loge广告

    this.setView();

    this.loadOverlay();
  },
  methods: {
    cartesion2Degree(cartesian) {
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      let lon = Cesium.Math.toDegrees(cartographic.longitude);
      let lat = Cesium.Math.toDegrees(cartographic.latitude);
      let height = cartographic.height; // 模型高度
      let degree = { lon: lon, lat: lat, height: height };
      return degree;
    },
    loadOverlay() {
      var _this = this;
      _this.viewer.entities.removeAll();
      _.forEach(this.overlay, function(o) {
        _this.addPoint(o);
      });
      _.forEach(this.pickedPositions, function(o) {
        _this.addPoint({ position: o.position, color: [0.8, 0.8, 0.2, 1] });
      });
    },
    setView() {
      /*  this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromElements(Number(this.camera.position.x), Number(this.camera.position.y), Number(this.camera.position.z)), // Cesium.Cartesian3.fromDegrees(this.position.lon, this.position.lat, this.position.height),// Cesium.Cartesian3.fromElements(Number(this.position.x), Number(4385202.284005581), Number(4617635.651295184)),//Cesium.Cartesian3.fromDegrees(this.position.lon, this.position.lat, this.position.alt),
          }); */
      this.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromElements(
          Number(this.camera.position.x),
          Number(this.camera.position.y),
          Number(this.camera.position.z)
        ), // Cesium.Cartesian3.fromDegrees(this.position.lon, this.position.lat, this.position.height),// Cesium.Cartesian3.fromElements(Number(this.position.x), Number(4385202.284005581), Number(4617635.651295184)),//Cesium.Cartesian3.fromDegrees(this.position.lon, this.position.lat, this.position.alt),
        orientation: {
          heading: this.camera.heading,
          pitch: this.camera.pitch,
          roll: 0.0
        }
      });
    },
    addPoint(o) {
      let _this = this;
      let color = [0.2, 0.2, 1, 1];
      if (o.color) color = o.color;
      var name = new Date().getTime() + "-" + Math.random();
      var cart = Cesium.Cartesian3.fromDegrees(
        o.position.lon,
        o.position.lat,
        o.position.height
      );
      var add_ellipsoid = _this.viewer.entities.add({
        name: name,
        id: "ade" + name,
        position: cart,
        ellipsoid: {
          radii: new Cesium.Cartesian3(0.33, 0.65, 0.5),
          material: new Cesium.Color(color[0], color[1], color[2], color[3])
        }
      });
    },
    test() {
      console.log("this is cesium-map page.");
    }
  }
};
</script>

<style scoped>
#cesium-map {
}
</style>
