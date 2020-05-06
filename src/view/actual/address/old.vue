<template>
  <div id="index">
    <Card>
      <Row>
        <Col span="18">
          <Form :model="condition" :label-width="120">
            <Row>
              <Col span="5">&nbsp;</Col>
              <Col span="6">
                <FormItem label="所属社区" sty>
                  <Select v-model="condition.communities" filterable clearable>
                    <Option
                      v-for="item in communitiesList"
                      :value="item.value"
                      :key="item.value"
                    >{{ item.label }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="6">
                <FormItem label="地名" style="width: 100%">
                  <Input v-model="condition.addName" placeholder="请输入关键字查询..." clearable></Input>
                </FormItem>
              </Col>
              <Col span="1">&nbsp;</Col>
              <Col span="2">
                <Button type="primary" @click="query">查询</Button>
              </Col>
            </Row>
          </Form>
        </Col>
        <Col span="6">
          <Button type="text" style="color: #0a6aff" @click="add">添加</Button>
        </Col>
      </Row>
    </Card>
    <Table border size="small" :columns="addressTable.columns" :data="addressTable.data"></Table>
    <Card style="text-align:center" v-if="addressTable.data&&addressTable.data.length>0">
      <Page
        :total="addressTable.total"
        :current="addressTable.pageNum"
        show-sizer
        @on-change="pageChange"
        show-total
        @on-page-size-change="pageSizeChange"
      ></Page>
    </Card>
    <Modal v-model="modalAddress" :title="title" ok-text="保存" @on-ok="save" width="900">
      <Form ref="condition" :model="formItem" :label-width="80" inline>
        <FormItem label="省市区县" style="width: 47%">{{formItem.province}}</FormItem>
        <FormItem label="乡镇街道" style="width: 47%">{{formItem.subdistrict}}</FormItem>
        <FormItem label="所属社区" style="width: 47%">
          <Select v-model="formItem.communities" filterable clearable>
            <Option
              v-for="item in communitiesList"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="街港巷" style="width: 47%">
          <Select v-model="formItem.street" filterable clearable>
            <Option
              v-for="item in streetList"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="门牌前缀" style="width: 31%">
          <Input v-model="formItem.houseNumPrefix"></Input>
        </FormItem>
        <FormItem label="门牌号" style="width: 31%">
          <Input v-model="formItem.houseNum"></Input>
        </FormItem>
        <FormItem label="门牌后缀" style="width: 31%">
          <Select v-model="formItem.houseNumPostfix">
            <Option value="号">号</Option>
            <Option value="号楼">号楼</Option>
          </Select>
        </FormItem>
        <FormItem label style="width: 31%"></FormItem>
        <FormItem label="副号" style="width: 31%">
          <Input v-model="formItem.auxiliaryNum"></Input>
        </FormItem>
        <FormItem label="副号后缀" style="width: 31%">
          <Select v-model="formItem.auxiliaryNumPostfix">
            <Option value="号">号</Option>
            <Option value="号楼">号楼</Option>
          </Select>
        </FormItem>
        <FormItem label="小区名称" style="width: 95%">
          <Select v-model="formItem.communityName" filterable clearable>
            >
            <Option
              v-for="item in communityNameList"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="幢楼前缀" style="width: 31%">
          <Input v-model="formItem.buildingNumPrefix"></Input>
        </FormItem>
        <FormItem label="幢楼号" style="width: 31%">
          <Input v-model="formItem.buildingNum"></Input>
        </FormItem>
        <FormItem label="幢楼后缀" style="width: 31%">
          <Select v-model="formItem.buildingNumPostfix">
            <Option value="号">号</Option>
            <Option value="号楼">号楼</Option>
          </Select>
        </FormItem>
        <FormItem label="单元号" style="width: 31%">
          <Input v-model="formItem.unitNum"></Input>
        </FormItem>
        <FormItem label="室号" style="width: 31%">
          <Input v-model="formItem.roomNum"></Input>
        </FormItem>
        <FormItem label="室号后缀" style="width: 31%">
          <Select v-model="formItem.roomNumPostfix" filterable clearable>
            >
            <Option
              v-for="item in roomNumPostfixList"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="附属详址" style="width: 95%">
          <Input v-model="formItem.subsidiaryAdd"></Input>
        </FormItem>
        <FormItem label="地址预览" style="width: 95%">
          <h3>{{formItem.addName}}</h3>
        </FormItem>
        <!--    <FormItem label="位置信息" style="width: 95%">
              <Input v-model="formItem.poi" disabled placeholder="点击文本框,开始拾取坐标点"></Input>
            </FormItem>
            <FormItem label="相机坐标" style="width: 95%">
              <Input v-model="formItem.camPoi" disabled></Input>
            </FormItem>
            <FormItem label="朝向" style="width: 47%">
              <Input v-model="formItem.camHeading" disabled></Input>
            </FormItem>
            <FormItem label="俯角" style="width: 47%">
              <Input v-model="formItem.camPitch" disabled></Input>
        </FormItem>-->
        <FormItem label="备注" style="width: 95%">
          <Input v-model="formItem.remark" type="textarea" :rows="4"></Input>
        </FormItem>
      </Form>
    </Modal>
    <Modal v-model="modalPosition" fullscreen title="位置" @on-ok="savePosition">
      <CesiumMap
        :cesium-style="{height:'calc(100vh - 160px)'}"
        :overlay="overlay"
        :camera="camera"
        :picking="picking"
        @on-pick="onPick"
      ></CesiumMap>
    </Modal>
  </div>
</template>

<script>
import { queryAddress, saveAddress, deleteAddress } from "@/api/address";
import CesiumMap from "../../../components/cesium/cesium-map";

export default {
  name: "index",
  components: { CesiumMap },
  data() {
    return {
      condition: {
        // 查询条件
        addName: "",
        communities: "",
        pageNumber: 1,
        pageSize: 10
      },
      title: "",
      modalPosition: false,
      modalAddress: false,
      formItem: {
        addName: "",
        province: "新疆" + this.gloabl.city_name + "县",
        subdistrict: this.gloabl.city_name + "镇",
        communities: "",
        street: "",
        houseNumPrefix: "",
        houseNum: "",
        houseNumPostfix: "",
        auxiliaryNum: "",
        auxiliaryNumPostfix: "",
        communityName: "",
        buildingNumPrefix: "",
        buildingNum: "",
        buildingNumPostfix: "",
        unitNum: "",
        roomNum: "",
        roomNumPostfix: "",
        subsidiaryAdd: "",
        remark: "",
        poi: "",
        camPoi: "",
        camHeading: "",
        camPitch: ""
      },
      communitiesList: [
        // {
        //   value: "团结东路社区警务室",
        //   label: "团结东路社区警务室"
        // },
        // {
        //   value: "文化南路社区警务室",
        //   label: "文化南路社区警务室"
        // },
        // {
        //   value: "民主北路社区警务室",
        //   label: "民主北路社区警务室"
        // },
        // {
        //   value: "文化北路社区警务室",
        //   label: "文化北路社区警务室"
        // },
        // {
        //   value: "友好南路社区警务室",
        //   label: "友好南路社区警务室"
        // }
      ],
      streetList: [
        // {
        //   value: "北西街",
        //   label: "北西街"
        // },
        // {
        //   value: "光明路",
        //   label: "光明路"
        // },
        // {
        //   value: "环城北路",
        //   label: "环城北路"
        // },
        // {
        //   value: "解放东路",
        //   label: "解放东路"
        // },
        // {
        //   value: "解放西路",
        //   label: "解放西路"
        // },
        // {
        //   value: "民主北路",
        //   label: "民主北路"
        // },
        // {
        //   value: "民主南路",
        //   label: "民主南路"
        // },
        // {
        //   value: "模范北路",
        //   label: "模范北路"
        // },
        // {
        //   value: "模范南路",
        //   label: "模范南路"
        // },
        // {
        //   value: "南西街",
        //   label: "南西街"
        // },
        // {
        //   value: "团结东路",
        //   label: "团结东路"
        // },
        // {
        //   value: "团结西路",
        //   label: "团结西路"
        // },
        // {
        //   value: "文化北路",
        //   label: "文化北路"
        // },
        // {
        //   value: "文化南路",
        //   label: "文化南路"
        // },
        // {
        //   value: "幸福东路",
        //   label: "幸福东路"
        // },
        // {
        //   value: "幸福西路",
        //   label: "幸福西路"
        // },
        // {
        //   value: "友好北路",
        //   label: "友好北路"
        // },
        // {
        //   value: "友好南路",
        //   label: "友好南路"
        // }
      ],
      communityNameList: [
        // {
        //   value: "花苑小区",
        //   label: "花苑小区"
        // },
        // {
        //   value: "滨河小区",
        //   label: "滨河小区"
        // },
        // {
        //   value: "田园小区",
        //   label: "田园小区"
        // },
        // {
        //   value: "银河小区",
        //   label: "银河小区"
        // },
        // {
        //   value: "银杉小区",
        //   label: "银杉小区"
        // },
        // {
        //   value: "家和园小区",
        //   label: "家和园小区"
        // },
        // {
        //   value: "雪松小区",
        //   label: "雪松小区"
        // },
        // {
        //   value: "银丰小区",
        //   label: "银丰小区"
        // },
        // {
        //   value: "建业小区",
        //   label: "建业小区"
        // },
        // {
        //   value: "瑞苑小区",
        //   label: "瑞苑小区"
        // },
        // {
        //   value: "星光花园小区",
        //   label: "星光花园小区"
        // },
        // {
        //   value: "阳光小区",
        //   label: "阳光小区"
        // },
        // {
        //   value: "星河小区",
        //   label: "星河小区"
        // },
        // {
        //   value: "光明小区",
        //   label: "光明小区"
        // },
        // {
        //   value: "胡杨小区",
        //   label: "胡杨小区"
        // },
        // {
        //   value: "晨光小区",
        //   label: "晨光小区"
        // },
        // {
        //   value: "向阳小区",
        //   label: "向阳小区"
        // },
        // {
        //   value: "馨怡小区",
        //   label: "馨怡小区"
        // },
        // {
        //   value: "祥瑞小区",
        //   label: "祥瑞小区"
        // },
        // {
        //   value: "怡家小区",
        //   label: "怡家小区"
        // },
        // {
        //   value: "康乐小区",
        //   label: "康乐小区"
        // },
        // {
        //   value: "祥和小区",
        //   label: "祥和小区"
        // },
        // {
        //   value: "和谐小区",
        //   label: "和谐小区"
        // },
        // {
        //   value: "桦林小区",
        //   label: "桦林小区"
        // },
        // {
        //   value: "天福小区",
        //   label: "天福小区"
        // },
        // {
        //   value: "幸福花园小区",
        //   label: "幸福花园小区"
        // },
        // {
        //   value: "友好小区",
        //   label: "友好小区"
        // },
        // {
        //   value: "青龙湖小区",
        //   label: "青龙湖小区"
        // },
        // {
        //   value: "公园小区",
        //   label: "公园小区"
        // },
        // {
        //   value: "文化小区",
        //   label: "文化小区"
        // },
        // {
        //   value: "独立营小区",
        //   label: "独立营小区"
        // }
      ],
      roomNumPostfixList: [
        {
          value: "室",
          label: "室"
        },
        {
          value: "",
          label: ""
        }
      ],
      addressTable: {
        columns: [
          {
            type: "index",
            width: 60,
            align: "center"
          },
          {
            title: "操作",
            key: "action",
            width: 150,
            align: "center",
            render: (h, params) => {
              return h("div", [
                h(
                  "A",
                  {
                    props: {
                      size: "small",
                      type: "text"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.edit(params.row);
                      }
                    }
                  },
                  "修改      "
                ),
                h(
                  "A",
                  {
                    props: {
                      size: "small",
                      type: "text"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.delete(params.row);
                      }
                    }
                  },
                  "     删除"
                ),
                h(
                  "A",
                  {
                    props: {
                      size: "small",
                      type: "text"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.changeShow(params.row);
                      }
                    }
                  },
                  "     位置"
                )
              ]);
            }
          },
          {
            title: "社区名称",
            key: "communities",
            width: 200,
            align: "center"
          },
          {
            title: "地名",
            key: "addName",
            align: "left"
          }
        ],
        data: [],
        total: 0,
        pageNum: 1
      },
      picking: false, // 是否打开拾取工具
      camera: {
        // 初始相机视角
        heading: 0.20686589478643302,
        pitch: -0.9589577430294973,
        position: {
          x: -29024.149759384716,
          y: 4384936.483159972,
          z: 4617855.356854772
        }
      },
      overlay: [
        // 初始显示覆盖物
        {
          type: "point",
          position: {
            height: 1233.1871818248476,
            lat: 46.673727825098304,
            lon: 90.37929450029857
          }
        }
        // {
        //   type: "point",
        //   position: {
        //     height: 1231.998337557897,
        //     lat: 46.673722833792844,
        //     lon: 90.37933061411208
        //   }
        // },
      ]
    };
  },
  watch: {
    formItem: {
      handler: function(newFormItem, oldFormItem) {
        var unitNum =
          newFormItem.unitNum != "" && newFormItem.unitNum != undefined
            ? newFormItem.unitNum + "单元"
            : "";
        var street =
          newFormItem.street != "" && newFormItem.street != undefined
            ? newFormItem.street
            : "";
        var houseNum =
          newFormItem.houseNum != "" && newFormItem.houseNum != undefined
            ? newFormItem.houseNum
            : "";
        var houseNumPostfix =
          newFormItem.houseNumPostfix != "" &&
          newFormItem.houseNumPostfix != undefined
            ? newFormItem.houseNumPostfix
            : "";
        var communityName =
          newFormItem.communityName != "" &&
          newFormItem.communityName != undefined
            ? newFormItem.communityName
            : "";
        var buildingNum =
          newFormItem.buildingNum != "" && newFormItem.buildingNum != undefined
            ? newFormItem.buildingNum
            : "";
        var buildingNumPostfix =
          newFormItem.buildingNumPostfix != "" &&
          newFormItem.buildingNumPostfix != undefined
            ? newFormItem.buildingNumPostfix
            : "";
        var roomNum =
          newFormItem.roomNum != "" && newFormItem.roomNum != undefined
            ? newFormItem.roomNum
            : "";
        var roomNumPostfix =
          newFormItem.roomNumPostfix != "" &&
          newFormItem.roomNumPostfix != undefined
            ? newFormItem.roomNumPostfix
            : "";
        this.formItem.addName =
          "新疆" +
          this.gloabl.city_name +
          "县" +
          this.gloabl.city_name +
          "镇" +
          street +
          houseNum +
          houseNumPostfix +
          communityName +
          buildingNum +
          buildingNumPostfix +
          unitNum +
          roomNum +
          roomNumPostfix;
      },
      deep: true
    }
  },
  mounted() {
    this.query();
  },
  methods: {
    query() {
      var _this = this;
      var page = {
        page: {
          pageNum: this.condition.pageNumber,
          pageSize: this.condition.pageSize
        },
        condition: {
          addName: _this.condition.addName
          /* communities: _this.condition.communities */
        }
      };
      queryAddress(page)
        .then(res => {
          _this.addressTable.data = res.data.list;
          _this.addressTable.total = res.data.total;
        })
        .catch(err => {
          reject(err);
        });
    },
    add() {
      this.formItem = {
        addName: "",
        province: "新疆" + this.gloabl.city_name + "县",
        subdistrict: this.gloabl.city_name + "镇",
        communities: "",
        street: "",
        houseNumPrefix: "",
        houseNum: "",
        houseNumPostfix: "",
        auxiliaryNum: "",
        auxiliaryNumPostfix: "",
        communityName: "",
        buildingNumPrefix: "",
        buildingNum: "",
        buildingNumPostfix: "",
        unitNum: "",
        roomNum: "",
        roomNumPostfix: "",
        subsidiaryAdd: "",
        remark: "",
        poi: "",
        camPoi: "",
        camHeading: "",
        camPitch: ""
      };
      this.title = "新增";
      this.modalAddress = true;
    },
    edit(row) {
      (this.title = "修改"), (this.formItem = _.extend(this.formItem, row));
      this.modalAddress = true;
    },
    save() {
      if (this.formItem.addId != undefined) {
        this.update();
      } else {
        this.saveAddress();
      }
    },
    saveAddress() {
      var _this = this;
      saveAddress(_this.formItem)
        .then(res => {
          if (res.data.success) {
            _this.$Message.success({
              content: "成功",
              duration: 3
            });
            _this.query();
            _this.modalAddress = false;
          } else {
            _this.$Message.error({
              content: "失败",
              duration: 3
            });
          }
        })
        .catch(err => {
          reject(err);
        });
    },
    update() {
      var _this = this;
      saveAddress(_this.formItem)
        .then(res => {
          if (res.data.success) {
            _this.$Message.success({
              content: "成功",
              duration: 3
            });
            _this.query();
            _this.modalAddress = false;
          } else {
            _this.$Message.error({
              content: "失败",
              duration: 3
            });
          }
        })
        .catch(err => {
          reject(err);
        });
    },
    delete(row) {
      var _this = this;
      this.$Modal.confirm({
        title: "系统提示",
        content: "<p>是否确认删除？</p >",
        onOk: () => {
          deleteAddress({ addId: row.addId })
            .then(res => {
              if (res.data.success) {
                _this.$Message.success({
                  content: "成功",
                  duration: 3
                });
                _this.query();
                _this.modalAddress = false;
              } else {
                _this.$Message.error({
                  content: "失败",
                  duration: 3
                });
              }
            })
            .catch(err => {
              reject(err);
            });
        }
      });
    },
    changeShow(row) {
      var poi = row.poi.split(",");
      var camPoi = row.camPoi.split(",");
      var camHeading = row.camHeading;
      var camPitch = row.camPitch;
      this.overlay = [
        {
          type: "point",
          position: {
            height: Number(poi[2]),
            lat: Number(poi[1]),
            lon: Number(poi[0])
          }
        }
      ];
      this.camera = {
        heading: Number(camHeading),
        pitch: Number(camPitch),
        position: {
          x: Number(camPoi[0]),
          y: Number(camPoi[1]),
          z: Number(camPoi[2])
        }
      };
      this.picking = true;
      this.modalPosition = true;
      this.formItem = _.extend(this.formItem, row);
    },
    onPick(pickedPositions) {
      console.log(pickedPositions);
      var pos = pickedPositions[0];
      this.formItem.poi = [
        pos.position.lon,
        pos.position.lat,
        pos.position.height
      ].join(",");
      this.formItem.camPoi = [
        pos.camera.position.x,
        pos.camera.position.y,
        pos.camera.position.z
      ].join(",");
      this.formItem.camHeading = pos.camera.heading;
      this.formItem.camPitch = pos.camera.pitch;
    },
    savePosition() {
      this.update();
      this.picking = false;
    },
    pageChange(current) {
      this.condition.pageNumber = current;
      if (this.conditionChange) {
        this.condition.pageNumber = 1;
        this.conditionChange = false;
      }
      this.query();
    },
    pageSizeChange(pageSize) {
      this.condition.pageSize = pageSize;
      this.query();
    }
  }
};
</script>

<style scoped>
#index {
}

.form-width {
  width: 31%;
}

.ivu-form-item {
  margin-bottom: 10px;
}
</style>
