<template>
  <div id="full-map2">
    <div>
      <CesiumMapBase
        ref="cmap"
        :cesium-style="{height:'calc(100vh - 100px)'}"
        @on-pick="onPick"
        @on-cancel="onCancel"
      >
        <div slot="left">
          <Input v-model="condition.addName" size="large">
            <Select v-model="condition.communities" slot="prepend" style="width: 80px">
              <Option v-for="item in communitiesOptions" :value="item">{{ item }}</Option>
            </Select>
            <Button slot="append" icon="ios-search" @click="query"></Button>
          </Input>

          <br />
          <Card v-if="table.data&&table.data.length>0||modalEdit">
            <div v-show="!modalEdit">
              <div v-if="foldIf">
                <CellGroup style="width:550px;" @on-click="showPoint">
                  <Cell
                    v-for="address in table.data"
                    :title="address.addName"
                    :name="address.addId"
                  >
                    <Icon type="md-pin" slot="icon" />
                    <div slot="label">{{address.communities}}</div>
                    <Button type="text" slot="extra" @click.stop="edit(address)">编辑</Button>
                    <Button
                      type="text"
                      slot="extra"
                      ghost
                      shape="circle"
                      @click="remove(address)"
                      size="small"
                    >
                      <Icon type="md-close-circle" :size="18" />
                    </Button>
                  </Cell>
                </CellGroup>
                <div style="text-align: center">
                  <Row>
                    <Col span="24" v-if="table.data&&table.data.length>0">
                      <Page
                        :total="table.total"
                        :current="table.pageNum"
                        show-sizer
                        @on-change="pageChange"
                        show-total
                        size="small"
                        @on-page-size-change="pageSizeChange"
                      ></Page>
                    </Col>
                  </Row>
                </div>
              </div>

              <div style="text-align: center;">
                <Icon
                  type="md-arrow-dropup"
                  style="cursor:pointer;"
                  size="20"
                  v-if="foldIf"
                  @click.native="onChange"
                />
                <Icon
                  type="md-arrow-dropdown"
                  v-if="!foldIf"
                  style="cursor:pointer;"
                  @click.native="onChange"
                />
              </div>
            </div>
            <div v-show="modalEdit">
              <Form :model="editing" :label-width="80" style="width:500px;" inline>
                <FormItem label="省市区县" style="width: 47%">{{editing.province}}</FormItem>
                <FormItem label="乡镇街道" style="width: 47%">{{editing.subdistrict}}</FormItem>
                <FormItem label="所属社区" style="width: 47%">
                  <Select v-model="editing.communities" filterable clearable>
                    <Option
                      v-for="item in communitiesList"
                      :value="item.value"
                      :key="item.value"
                    >{{ item.label }}</Option>
                  </Select>
                </FormItem>
                <FormItem label="街港巷" style="width: 48%">
                  <Select v-model="editing.street" filterable clearable>
                    <Option
                      v-for="item in streetList"
                      :value="item.value"
                      :key="item.value"
                    >{{ item.label }}</Option>
                  </Select>
                </FormItem>
                <FormItem label="门牌前缀" style="width: 31%">
                  <Input v-model="editing.houseNumPrefix"></Input>
                </FormItem>
                <FormItem label="门牌号" style="width: 31%">
                  <Input v-model="editing.houseNum"></Input>
                </FormItem>
                <FormItem label="门牌后缀" style="width: 31%">
                  <Select v-model="editing.houseNumPostfix" clearable>
                    <Option value="号">号</Option>
                    <Option value="号楼">号楼</Option>
                  </Select>
                </FormItem>
                <FormItem label="小区名称" style="width: 97%">
                  <Select v-model="editing.communityName" filterable clearable>
                    >
                    <Option
                      v-for="item in communityNameList"
                      :value="item.value"
                      :key="item.value"
                    >{{ item.label }}</Option>
                  </Select>
                </FormItem>
                <FormItem label="幢楼前缀" style="width: 31%">
                  <Input v-model="editing.buildingNumPrefix"></Input>
                </FormItem>
                <FormItem label="幢楼号" style="width: 31%">
                  <Input v-model="editing.buildingNum"></Input>
                </FormItem>
                <FormItem label="幢楼后缀" style="width: 31%">
                  <Select v-model="editing.buildingNumPostfix" clearable>
                    <Option value="号">号</Option>
                    <Option value="号楼">号楼</Option>
                  </Select>
                </FormItem>
                <FormItem label="单元号" style="width: 31%">
                  <Input v-model="editing.unitNum"></Input>
                </FormItem>
                <FormItem label="室号" style="width: 31%">
                  <Input v-model="editing.roomNum"></Input>
                </FormItem>
                <FormItem label="室号后缀" style="width: 31%">
                  <Select v-model="editing.roomNumPostfix" filterable clearable>
                    >
                    <Option
                      v-for="item in roomNumPostfixList"
                      :value="item.value"
                      :key="item.value"
                    >{{ item.label }}</Option>
                  </Select>
                </FormItem>
                <FormItem label="附属详址" style="width: 97%">
                  <Input v-model="editing.subsidiaryAdd"></Input>
                </FormItem>
                <FormItem label="备注" style="width: 97%">
                  <Input v-model="editing.remark" type="textarea" :rows="2"></Input>
                </FormItem>
                <FormItem label="地址" style="width: 100%">{{editing.addName}}</FormItem>
                <FormItem label="位置信息">
                  poi:{{editing.camPoi}}
                  <br />
                  camHeading:{{editing.camHeading}}
                  <br />
                  camPitch:{{editing.camPitch}}
                  <br />
                  <Button type="success" icon="md-pin" @click="pickPoint">选择点</Button>
                </FormItem>
                <br />
                <FormItem>
                  <Button type="primary" @click="save">保存</Button>
                  <Button type="text" @click="modalEdit = false">取消</Button>
                </FormItem>
              </Form>
            </div>
          </Card>
          <!--  <Button @click="pickPoint">拾取点</Button>
             <Button @click="showPoint">显示点</Button>
          <Button @click="showPointa">显示点B</Button>-->
        </div>
        <div slot="bottom">
          <Button type="text" ghost shape="circle" @click="add" size="small">
            <Icon type="md-add-circle" :size="30" />
          </Button>
        </div>
      </CesiumMapBase>
    </div>
  </div>
</template>

<script>
// import { queryAddress, saveAddress, deleteAddress } from "@/api/address";
import CesiumMapBase from "../../../components/cesium/cesium-map-base";
export default {
  name: "full-map2",
  components: { CesiumMapBase },
  data() {
    return {
      foldIf: true,
      editing: {
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
        {
          value: "赛尔江西路警务室",
          label: "赛尔江西路警务室"
        },
        {
          value: "文化西路警务室",
          label: "文化西路警务室"
        }
        //青河/富蕴 位置变更 标记
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
        {
          value: "文化东路",
          label: "文化东路"
        },
        {
          value: "文化西路",
          label: "文化西路"
        },
        {
          value: "赛尔江东路",
          label: "赛尔江东路"
        },
        {
          value: "赛尔江西路",
          label: "赛尔江西路"
        },
        {
          value: "人民路",
          label: "人民路"
        },
        {
          value: "团结南路",
          label: "团结南路"
        },
        {
          value: "团结北路",
          label: "团结北路"
        },
        {
          value: "迎宾路",
          label: "迎宾路"
        },
        {
          value: "迎宾西路",
          label: "迎宾西路"
        },
        {
          value: "迎宾东路",
          label: "迎宾东路"
        },
        {
          value: "幸福路",
          label: "幸福路"
        },
        {
          value: "园艺路",
          label: "园艺路"
        },
        {
          value: "光明北路",
          label: "光明北路"
        },
        {
          value: "河滨路",
          label: "河滨路"
        },
        {
          value: "东风北路",
          label: "东风北路"
        },
        {
          value: "东风南路",
          label: "东风南路"
        },
        {
          value: "富兴路",
          label: "富兴路"
        },
        {
          value: "公园路",
          label: "公园路"
        }
        //青河/富蕴 位置变更 标记
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
        {
          value: "金蕴小区",
          label: "金蕴小区"
        },
        {
          value: "迎宾小区",
          label: "迎宾小区"
        },
        {
          value: "团结小区",
          label: "团结小区"
        }
        //青河/富蕴 位置变更 标记
        // {
        //   value: "花园小区",
        //   label: "花园小区"
        // },
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
      condition: {
        // 查询条件
        addName: null,
        communities: null,
        pageNumber: 1,
        pageSize: 10
      },
      modalEdit: false,
      communitiesOptions: [
        // "文化南路",
        // "文化北路",
        // "团结东路",
        // "民主北路",
        // "友好南路"
        // 青河/富蕴 变更位置
        "文化西路",
        "赛尔江西路"
      ],
      table: {
        data: []
      }
    };
  },
  watch: {
    editing: {
      handler: function(newEditing, oldEditing) {
        var unitNum =
          newEditing.unitNum != "" && newEditing.unitNum != undefined
            ? newEditing.unitNum + "单元"
            : "";
        var street =
          newEditing.street != "" && newEditing.street != undefined
            ? newEditing.street
            : "";
        var houseNum =
          newEditing.houseNum != "" && newEditing.houseNum != undefined
            ? newEditing.houseNum
            : "";
        var houseNumPostfix =
          newEditing.houseNumPostfix != "" &&
          newEditing.houseNumPostfix != undefined
            ? newEditing.houseNumPostfix
            : "";
        var communityName =
          newEditing.communityName != "" &&
          newEditing.communityName != undefined
            ? newEditing.communityName
            : "";
        var buildingNum =
          newEditing.buildingNum != "" && newEditing.buildingNum != undefined
            ? newEditing.buildingNum
            : "";
        var buildingNumPostfix =
          newEditing.buildingNumPostfix != "" &&
          newEditing.buildingNumPostfix != undefined
            ? newEditing.buildingNumPostfix
            : "";
        var roomNum =
          newEditing.roomNum != "" && newEditing.roomNum != undefined
            ? newEditing.roomNum
            : "";
        var roomNumPostfix =
          newEditing.roomNumPostfix != "" &&
          newEditing.roomNumPostfix != undefined
            ? newEditing.roomNumPostfix
            : "";
        this.editing.addName =
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
  methods: {
    onChange() {
      this.foldIf = !this.foldIf;
    },
    remove(address) {
      var _this = this;
      this.$Modal.confirm({
        title: "系统提示",
        content: "<p>是否确认删除？</p >",
        onOk: () => {
          deleteAddress({ addId: address.addId })
            .then(res => {
              if (res.data.success) {
                _this.$Message.success({
                  content: "成功",
                  duration: 3
                });
                _this.query();
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
    query() {
      var _this = this;
      var page = {
        page: {
          pageNum: this.condition.pageNumber,
          pageSize: this.condition.pageSize
        },
        condition: {
          addName: _this.condition.addName,
          communities: _this.condition.communities
        }
      };
      if (_this.condition.addName) {
        page.condition.addName = _this.condition.addName;
      }
      if (_this.condition.communities && _this.condition.communities != "") {
        page.condition.communities = _this.condition.communities;
      }
      console.log(page);
      queryAddress(page)
        .then(res => {
          console.log(res);
          _this.table.data = res.data.list;
          _this.table.total = res.data.total;
        })
        .catch(err => {
          reject(err);
        });
    },
    save() {
      var _this = this;
      if (_this.editing.camPoi == "" || _this.editing.camPoi == null) {
        _this.$Message.error({
          content: "位置信息不能为空",
          duration: 2
        });
      } else {
        _this.saveAddress();
      }
    },
    saveAddress() {
      var _this = this;
      saveAddress(_this.editing)
        .then(res => {
          if (res.data.success) {
            _this.$Message.success({
              content: "成功",
              duration: 3
            });
            _this.query();
            _this.modalEdit = false;
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
    add() {
      this.editing = {
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
      this.modalEdit = true;
    },
    edit(address) {
      this.title = "修改";
      this.editing = address;
      this.modalEdit = true;
    },
    pickPoint() {
      this.$refs.cmap.startPick();
    },
    showPoint(addId) {
      let addressData = _.filter(this.table.data, { addId: addId })[0];
      let pos = addressData.poi.split(",");
      let camPos = addressData.camPoi.split(",");
      let p = {
        position: {
          lon: Number(pos[0]),
          lat: Number(pos[1]),
          height: Number(pos[2])
        },
        camera: {
          position: {
            x: Number(camPos[0]),
            y: Number(camPos[1]),
            z: Number(camPos[2])
          },
          heading: Number(addressData.camHeading),
          pitch: Number(addressData.camPitch)
        }
      };
      this.$refs.cmap.showPoint(p);
    },
    showPointa(addId) {
      var p = {
        position: {
          lon: 90.3815074661593,
          lat: 46.669937932024325,
          height: 1233.8764038185404
        },
        camera: {
          position: {
            x: -29191.822030277912,
            y: 4385242.24207598,
            z: 4617542.11432573
          },
          heading: 0.316279758009931,
          pitch: -0.4090902010656752
        }
      };
      this.$refs.cmap.showPoint(p);
    },
    onPick(p) {
      console.log("外层获得拾取position:", p);
      this.editing.poi =
        p.position.lon + "," + p.position.lat + "," + p.position.height;
      this.editing.camPoi =
        p.camera.position.x +
        "," +
        p.camera.position.y +
        "," +
        p.camera.position.z;
      this.editing.camHeading = p.camera.heading;
      this.editing.camPitch = p.camera.pitch;
    },
    onCancel() {
      console.log("外层获得取消:");
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
#full-map2 {
  padding: 18px;
  justify-content: space-evenly;
}

.ivu-form-item {
  margin-bottom: 10px;
}

.form-width {
  width: 31%;
}
</style>
