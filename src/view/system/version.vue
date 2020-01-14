<style lang="less">
  @import '../../styles/common.less';

</style>

<template>
  <div class="smart-crud-container">

    <div class="smart-crud-top">
      <Row>
        <Col span="24">
        <Button class="" type="primary" @click="add">添加</Button>
        </Col>
      </Row>
    </div>
    <br>
    <div class="smart-crud-bottom">
      <Row>
        <Col span="24">
        <Table :loading="loading" :columns="columns" :data="data"></Table>

        <div style="margin: 10px;overflow: hidden">
          <div style="float: right;">
            <Page v-model="pageInfo"
                  :current="pageInfo.pageNum"
                  :total="pageInfo.total"
                  :page-size="pageInfo.pageSize"
                  size="small"
                  :page-size-opts="[5,10,15]"
                  @on-change="changePage"
                  @on-page-size-change="changePageSize"
                  show-elevator
                  show-sizer
                  show-total></Page>
          </div>
        </div>
        </Col>
      </Row>
    </div>

    <Modal
        v-model="editModal"
        width="700"
        :loading="isSaving"
        @on-ok="handleSubmit"
        @on-cancel="handleReset"
        ok-text="保存"
        cancel-text="取消"
        :title="modalTitle"
        :styles="{top: '20px'}">
      <Form ref='versionForm' :model='versionForm' :rules='versionFormRule' :label-width='90'>
        <FormItem label='版本号' prop='versionNo'>
          <Input v-model='versionForm.versionNo' :maxlength=50 placeholder='请输入版本号' style="width: 550px;"/>
        </FormItem>
        <FormItem label='种类' prop='type'>
          <i-select placeholder="请选择种类" :autosize='{minRows: 2,maxRows: 5}'
            :maxlength=500 style="width: 550px;"v-model='versionForm.type'>
              <i-option value="student">Student</i-option>
              <i-option value="teacher">Teacher</i-option>
          </i-select>
        </FormItem>
        <FormItem label='描述' prop='description' >
          <Input type="textarea" :maxlength=500 style="width: 550px;" v-model='versionForm.description'
                 :autosize='{minRows: 2,maxRows: 5}' placeholder='请输入...'/>
        </FormItem>
        <FormItem  >
          <Upload
            ref='file'
            multiple
            type="drag"
            :action="baseUrl + '/version/resource/upload'" 
            :headers='headers'
            style="width: 550px"
            :before-upload='beforeUpload'
            :on-success='getUploadRes'
            :on-remove='uploadRemove'
            >
            <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                <p>Click or drag files here to upload</p>
            </div>
          </Upload>
        </FormItem>
        <FormItem label='更新日志' prop='updateLog'>
          <tinymce id="tinymceEditer" v-model="versionForm.updateLog" style="width: 550px">
          </tinymce>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="handleReset()" style="margin-left: 8px">取消</Button>
        <Button type="primary" :loading="isSaving" @click="handleSubmit()">保存</Button>
      </div>
    </Modal>

    <Modal v-model="deleteModal" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>删除该版本</span>
      </p>
      <div style="text-align:center">
        <p>删除该版本，将无法恢复！</p>
        <p>是否删除?</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long :loading="isDeleting" @click="deleteItem">删除</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
 import { cropperPicture,getToken } from '../../libs/util';
 import tinymce from '@/view/shared/tinymce.vue';
  import VueCropper from 'vue-cropper'
  import baseUrl from '_conf/url'
  export default {
    components: { VueCropper ,tinymce},
    name: 'version',
    data() {
      return {
        allowUpload:true,
        baseUrl:baseUrl,
        versionForm: {
          versionNo: undefined,
          type: undefined,
          resHash: undefined,
          description: undefined,
          updateLog: undefined,
          resUrl: undefined,        
        },
        versionFormRule: {
          versionNo: [
            { required: true, message: '版本号不能为空.', trigger: 'blur' },
            { type: 'string', max: 255, message: 'Code最多255字符', trigger: 'blur' },
          ],
          type:[
             { required: true, type: 'string', message: '性别不能为空.', trigger: 'change' }
          ],
          resUrl: [
            { required: true, message: '资源地址不能为空.', trigger: 'blur' },
            { type: 'string', max: 255, message: 'Code最多255字符', trigger: 'blur' },
          ],
        },
        cut: {
          size: 1,
          Img: '',
          outputType: 'jpeg || png || web',
          autoCrop: true,
          autoCropWidth: 200,
          autoCropHeight: 200
        },
        fileChoose: false,
        loading: false,
        keepalive: false,
        isSaving: false,
        isDeleting: false,
        pageInfo: {},
        menuList: [],
        originMenu: new Map(),
        modalTitle: '',
        permissionList: [],
        editModal: false,
        deleteModal: false,
        showCropedImage: false,
        deleteIndex: '',
        columns: [
          { type: 'index', title: '序号', width: 60, align: 'center' },
          { title: '版本号', key: 'versionNo', align: 'center' },
          { title: '种类', key: 'type', align: 'center' },
          { title: '资源hash值', key: 'resHash', align: 'center' },
          { title: '描述', key: 'description', align: 'center' },
          { title: '资源地址', key: 'resUrl', align: 'center' },
          {
            title: '操作',
            align: 'center',
            key: 'handle',
            render: (h, params) => {
              return this.$render.renderEditDel(this, h, params);
            }
          }
        ],
        data: []
      }
    },
    computed:{
      headers(){
        return{
          "Authorization":getToken()
        }
      }
    },
    methods: {
      getList() {
        this.loading = true;
        const self = this;
        const params = {
          page: this.pageInfo.pageNum || 1,
          size: this.pageInfo.pageSize || 10
        };
        this.$http.get('/version', params).then((res) => {
          self.loading = false;
          if (res.code === 200) {
            const result = res.data;
            self.data = result && result.list;
            self.pageInfo.total = result && result.total;
          } else {
            self.$Message.error('获取数据失败！' + res.code);
          }

        })
      },
      beforeUpload(){
        if(this.allowUpload===false){            
            this.$Message.error('只允许上传一个文件！');
            return false;
        }
      },
      uploadRemove(){
        this.allowUpload=true;
      },
      getUploadRes(res){
        if (res.code === 200) {
          this.versionForm.resHash=res.data[0].hash;
          this.versionForm.resUrl=res.data[0].location;
          this.allowUpload=false;
        }else{
          this.$Message.success('上传文件失败');
        }
      },
      getMenuList() {
        const self = this;
        this.$http.get('/menu/listMenuBO').then((res) => {
          if (res.code === 200) {
            self.originMenu = res.data;
          }
        })
      },

      getCheckMenuList(list) {
        this.versionForm.menuIds = [];
        if (list) {
          list.forEach(item => {
            this.versionForm.menuIds.push(item.id);
          })
        }
      },
       handleChange(e) {
        this.showCropedImage = true;
        let reader = cropperPicture(e);
        console.log(reader);
        reader.onload = (event) => {
          let data = event.target.result;
          reader.onload = null;
          this.cut.Img = data;
          this.clear();
        };
      },
      clear() {
        if (document.getElementById('fileinput').value !== '') {
          document.getElementById('fileinput').value = '';
        }
      },
       handleCrop() {
        this.showCropedImage = false;
        let self = this;
        // var fd = new FormData();
        // 获取截图的blob数据
        this.$refs.cropper.getCropBlob((data) => {
          var fd = new FormData();
          fd.append('picturefile', data, 'cropped.png');
          const config = {
            headers: { 'Content-Type': 'multipart/form-data' }
          };
          this.$http.post('/common/file/upload', fd, config).then(resp => {
            if (resp.code === 200) {
              self.versionForm.imageUrl = resp.data[0].location;
              self.fileChoose = true;
            }
          }).catch(err => {
            console.log(err)
          });
        })
      },
       cancelReset() {
        this.showCropedImage = false;
        console.log('cancelReset');
      },
      resetCheckMenu() {
        const self = this;
        for (let key in self.originMenu) {
          self.originMenu[key].forEach(item => {
            item.checked = false;
          })
        }
        let tmp = JSON.parse(JSON.stringify(self.originMenu[0]));
        this.sort(tmp);
        self.menuList = JSON.parse(JSON.stringify(tmp));
      },

      sort(data) {
        const self = this;
        data.forEach(item => {
          if (self.originMenu[item.id]) {
            item.children = self.originMenu[item.id];
            self.sort(item.children)
          }
        })
      },

      reloadList() {
        this.pageInfo.pageNum = 1;
        this.getList();
      },

      changePage(currentPage) {
        this.pageInfo.pageNum = currentPage;
        this.getList();
      },

      changePageSize(pageSize) {
        this.pageInfo.pageSize = pageSize;
        this.getList();
      },

      add() {
        this.$refs.file.clearFiles();
        this.isSaving = false;
        this.fileChoose = false;
        this.$refs.versionForm.resetFields();
        this.modalTitle = '添加版本信息';
        this.versionForm = {
          versionNo: undefined,
          type: undefined,
          resHash: undefined,
          description: undefined,
          updateLog: undefined,
          resUrl: undefined,  
        };
        this.editModal = true;
      },

      edit(index) {
        this.isSaving = false;
        this.isShow = false;
        const self = this;
        this.$refs.versionForm.resetFields();
        this.modalTitle = '编辑版本信息';
        this.editModal = true;
        this.$http.get('/version/' + self.data[index].id, {}).then((res) => {
          if (res.code === 200) {
            self.versionForm = res.data;
            if (self.versionForm.imageUrl) {
              self.fileChoose = true;
            }
            if (self.versionForm.menuIds && self.versionForm.menuIds.length > 0) {
              for (let key in self.originMenu) {
                self.originMenu[key].forEach(item => {
                  item.checked = false;
                  for (let i=0; i<self.versionForm.menuIds.length; i++) {
                    if (item.id === self.versionForm.menuIds[i]) {
                      item.checked = true;
                    }
                  }
                })
              }
              let tmp = JSON.parse(JSON.stringify(self.originMenu[0]));
              self.sort(tmp);
              self.menuList = JSON.parse(JSON.stringify(tmp));
            } else {
//              self.resetCheckMenu();
            }
          } else {
            self.$Message.error('获取role失败！' + res.code);
          }

        });
      },

      handleSubmit() {
        this.isSaving = true;
        let self = this;
        this.$refs.versionForm.validate((valid) => {
          if (valid) {
             if (this.versionForm.id) {
              this.$http.put('/version', self.versionForm).then((res) => {
                if (res.code === 200) {
                  self.editModal = false;
                  self.reloadList();
                  self.$Message.success('更新成功！');
                } else if (res.code === 800) {
                  self.$Message.error('当前版本号已存在');
                }  else {
                  self.$Message.error('更新失败！' + res.code);
                }
                self.isSaving = false;
              })
            } else {
              this.$http.post('/version', self.versionForm).then((res) => {
                if (res.code === 200) {
                  self.editModal = false;
                  self.reloadList();
                  self.$Message.success('添加成功！');
                } else if (res.code === 800) {
                  self.$Message.error('当前版本号已存在');
                } else {
                  self.$Message.error('添加失败！' + res.code);
                }
                self.isSaving = false;
              })
            }
          }else {
            self.isSaving = false;
            self.$Message.error('表单验证失败！');
          }
        })
      },
      handleReset() {
        this.editModal = false;
      },
      remove(index) {
        this.deleteModal = true;
        this.deleteIndex = index;
        this.isDeleting = false;
      },
      deleteItem() {
        this.isDeleting = true;
        const self = this;
        this.$http.delete('/version/' + self.data[self.deleteIndex].id, {}).then((res) => {
          if (res.code === 200) {
            self.isDeleting = false;
            self.deleteModal = false;
            self.reloadList();
            self.$Message.success('删除成功！');
          } else {
            self.$Message.error('删除失败！' + res.code);
          }
        });
      }
    },

    created() {
      this.getList();
    },

    activated() {
      if (this.keepalive) {
        this.keepalive = false;
        this.getList();
      }
    },

    deactivated() {
      this.keepalive = true;
    }

  }

</script>
