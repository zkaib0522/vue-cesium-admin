
import Cesium from 'cesium/Cesium'
export const cartesian3ToDegree = (cartesian3,viewer) => {
  var ellipsoid=viewer.scene.globe.ellipsoid;
  var cartographic=ellipsoid.cartesianToCartographic(cartesian3);
  var lat=Cesium.Math.toDegrees(cartographic.latitude);
  var lon=Cesium.Math.toDegrees(cartographic.longitude);
  var alt=cartographic.height;
  return {lon:lon,lat:lat,alt:alt}
}
