
<template>
  <div class="container">
    <div id="cesiumContainer"></div>
  </div>
</template>
 
<script>
export default {
  name: "directive_page",
  data() {
    return {
      cesium_token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMTZjNmQxMS0zNmUyLTQzM2ItYmRjOC03OTNkMzkwZjEyYjYiLCJpZCI6MzgxNiwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MzkwNzgxM30.sMoEoLbiHsKTagh0eCSf5cDufWHPFknnyWvr3ZFKUks"
    };
  },
  mounted() {
    var Cesium = this.Cesium;
    var cesiumContainer = document.getElementById("cesiumContainer");
    Cesium.Ion.defaultAccessToken = this.cesium_token;
    var viewer = new Cesium.Viewer("cesiumContainer", {
      //加载在线谷歌地图
      imageryProvider: new Cesium.UrlTemplateImageryProvider({
        url: "http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}"
      })
    });
  }
};
</script>
 
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
   width: 100%;
   height: 100%;
}
#cesiumContainer {
   width: 100%;
   height: 100%;
}
</style>