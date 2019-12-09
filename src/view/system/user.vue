<style lang="less">
  @import '../../styles/common.less';

</style>

<template>
  <div class="smart-crud-container">

    <div class="smart-crud-top">
      <Row>
        <Col span="24">
        <Button class="" type="primary" @click="add">添加</Button>
        <!--<Input class="pull-right" v-model="searchModel"-->
               <!--icon="ios-search" placeholder="搜索..." style="width: 200px"/>-->
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
        width="600"
        :loading="isSaving"
        @on-ok="handleSubmit"
        @on-cancel="handleReset"
        ok-text="保存"
        cancel-text="取消"
        :title="modalTitle"
        :styles="{top: '20px'}">
      <Form ref='userForm' :model='userForm' :rules='userFormRule' :label-width='120'>
        <FormItem label='登录名:' prop='loginName'>
          <Input v-model='userForm.loginName' :maxlength=30 placeholder='请输入登录名' style="width: 350px"/>
        </FormItem>
        <FormItem label='昵称:' prop='name'>
          <Input v-model='userForm.name' :maxlength=50 placeholder='请输入昵称' style="width: 350px"/>
        </FormItem>
        <FormItem label='密码:' prop='password' v-if="seen">
          <Input v-model='userForm.password' :maxlength=50 placeholder='请输入密码' type="password" style="width: 350px"/>
        </FormItem>
        <FormItem label='联系方式:' prop='mobile'>
          <Input v-model='userForm.mobile' :maxlength=11 placeholder='请输入联系方式' style="width: 350px"/>
        </FormItem>
        <FormItem label='电子邮箱:' prop='email'>
          <Input v-model='userForm.email' :maxlength=50 placeholder='请输入电子邮箱' style="width: 350px"/>
        </FormItem>
        <FormItem label="用户角色:" prop='roleIds'>
          <Select v-model="userForm.roleIds" filterable multiple style="width: 350px">
            <Option v-for="item in roleList" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <FormItem label="头像:" prop='imageUrl' style="margin-top: 25px">
          <div>
            <div class="margin-top-10  margin-top-10Again" v-show="fileChoose">
              <img :src="userForm.imageUrl" class="imgShow"/>
            </div>
            <div>
              <div class="fileInput">
                <input type="file" accept="image/png, image/jpeg, image/gif, image/jpg"
                       @change="handleChange" id="fileinput"/>
                <span>选择图片</span>
              </div>
            </div>
          </div>
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
        <span>删除user</span>
      </p>
      <div style="text-align:center">
        <p>删除该user，将无法恢复！</p>
        <p>是否删除?</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long :loading="isDeleting" @click="deleteItem">删除</Button>
      </div>
    </Modal>

    <Modal v-model="showCropedImage">
      <div class="cropperAgain">
        <vueCropper
            ref="cropper"
            :img="cut.Img"
            :outputSize="cut.size"
            :outputType="cut.outputType"
            :autoCrop="cut.autoCrop"
            :autoCropWidth="cut.autoCropWidth"
            :autoCropHeight="cut.autoCropHeight"
        >
        </vueCropper>
      </div>
      <div slot="footer">
        <Button @click="cancelReset()" style="margin-left: 8px">取消</Button>
        <Button type="primary" icon="crop" @click="handleCrop" class="pictureButton">裁剪</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import constants from '@/view/shared/constants.js';
  import CodeSelect from '@/view/shared/code/CodeSelect.vue';
  import CodeName from '@/view/shared/code/CodeName.vue';
  import VueCropper from 'vue-cropper'
  import { cropperPicture } from '../../libs/util';

  const userNameCheckValidate = (rule, value, callback) => {
    if (value) {
      if (value.indexOf(":") !== -1) {
        callback(new Error('用户名中不能包含特殊字符'));
      } else {
        callback();
      }
    } else {
      callback(new Error('用户名不能为空'));
    }
  };

  export default {
    components: { CodeSelect, CodeName, VueCropper },
    name: 'user',
    data() {
      return {
        userType: constants.codeType.user_type,
        searchModel: '',
        userForm: {
          mobile: undefined,
          loginName: undefined,
          name: undefined,
          email: undefined,
          imageUrl: undefined,
          status: undefined,
          password: undefined,
          type: undefined,
          roleIds: [],
        },
        userFormRule: {
          mobile: [
            { required: true, message: '联系方式不能为空.', trigger: 'blur' },
            { type: 'string', max: 50, message: 'Mobile最多50字符', trigger: 'blur' },
          ],
          loginName: [
            { required: true, validator: userNameCheckValidate, trigger: 'blur' },
            { type: 'string', max: 50, message: '登录名最多50字符', trigger: 'blur' },
          ],
          name: [
            { required: true, message: '用户名不能为空',  trigger: 'blur' },
            { type: 'string', max: 50, message: '用户名最多50字符', trigger: 'blur' },
          ],
          email: [
            { required: true, message: '邮箱不能为空.', trigger: 'blur' },
            { type: 'string', max: 100, message: '邮箱最多100字符', trigger: 'blur' },
            { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
          ],
          imageUrl: [
            { required: true, message: '头像不能为空.', trigger: 'blur' },
            { type: 'string', max: 256, message: '头像最多256字符', trigger: 'blur' },
          ],
          status: [
            { type: 'string', max: 10, message: 'Status最多10字符', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '密码不能为空.', trigger: 'blur' },
            { type: 'string', max: 500, message: '密码最多500字符', trigger: 'blur' },
          ],
          user_type: [
            { type: 'string', max: 20, message: '用户类型最多20字符', trigger: 'blur' },
          ],
          roleIds: [
            { required: true, type: 'array', max: 20, message: '角色不能为空', trigger: 'change' },
          ],
        },
        loading: false,
        keepalive: false,
        isSaving: false,
        isDeleting: false,
        seen: false,
        fileChoose: false,
        showCropedImage: false,
        cut: {
          size: 1,
          Img: '',
          outputType: 'jpeg || png || web',
          autoCrop: true,
          autoCropWidth: 200,
          autoCropHeight: 200
        },
        modalTitle: '',
        pageInfo: {},
        editModal: false,
        cropper: undefined,
        userTypeList: [],
        roleList: [],
        deleteModal: false,
        deleteIndex: '',
        columns: [
          {
            type: 'index',
            title: '序号',
            width: 60,
            align: 'center'
          },
          {
            title: '登录名',
            key: 'loginName',
            align: 'center'
          },
          {
            title: '昵称',
            key: 'name',
            align: 'center'
          },
          {
            title: '联系方式',
            key: 'mobile',
            align: 'center'
          },
          {
            title: '电子邮箱',
            width: 200,
            key: 'email',
            align: 'center'
          },
          {
            title: '用户角色',
            align: 'center',
            key: 'type',
            render: (h, params) => {
              let roles = params.row.roles;
              console.log(roles)
              let result = "";
              for (let i = 0;i < roles.length;i++) {
                result += roles[i].name;
                if (i !== roles.length - 1) {
                  result += ",";
                }
              }
              return h('span', result);
            }
          },
          {
            title: '操作',
            align: 'center',
            key: 'handle',
            render: (h, params) => {
              return this.$render.renderEditDel(this, h, params);
            }
          }],
        data: []
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
        this.$http.get('/user/listUserPage', params).then((res) => {
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
      getRoleList() {
        let self = this;
        this.$http.get('/role/pageList', {}).then(function (res) {
          if (res.code === 200) {
            self.roleList = res.data.list;
          }
        });
      },
      getUserTypeList(params) {
        this.userTypeList = params.data;
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
        this.isSaving = false;
        this.modalTitle = '新增用户';
        this.seen = true;
        this.fileChoose = false;
        this.$refs.userForm.resetFields();
        this.userForm = {
          mobile: undefined,
          loginName: undefined,
          name: undefined,
          email: undefined,
          imageUrl: undefined,
          status: undefined,
          password: undefined,
          type: undefined,
          roleIds: [],
        };
        this.editModal = true;
      },

      edit(index) {
        this.isSaving = false;
        const self = this;
        this.modalTitle = '编辑用户';
        this.seen = false;
        this.$refs.userForm.resetFields();
        this.editModal = true;
        this.$http.get('/user/withRoles/' + self.data[index].id, {}).then((res) => {
          if (res.code === 200) {
            self.userForm = res.data;
            if (self.userForm.imageUrl) {
              self.fileChoose = true;
            }
          } else {
            self.$Message.error('获取user失败！' + res.code);
          }

        });
      },

      handleSubmit() {
        this.isSaving = true;
        let self = this;
        this.$refs.userForm.validate((valid) => {
          if (valid) {
            if (this.userForm.id) {
              this.$http.put('/user/updateAdmin', self.userForm).then((res) => {
                if (res.code === 200) {
                  self.isSaving = false;
                  self.editModal = false;
                  self.reloadList();
                  self.$Message.success('更新成功！');
                } else {
                  self.$Message.error('更新失败！' + res.code);
                }
              })
            } else {
              this.$http.post('/user', self.userForm).then((res) => {
                if (res.code === 200) {
                  self.isSaving = false;
                  self.editModal = false;
                  self.reloadList();
                  self.$Message.success('添加成功！');
                } else if (res.code === 800) {
                  self.$Message.error('登录名已存在');
                } else {
                  self.$Message.error('添加失败！' + res.code);
                }
              })
            }
          } else {
            self.isSaving = false;
            self.$Message.error('表单验证失败！');
          }
        })
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
              self.userForm.imageUrl = resp.data.location;
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
      clear() {
        if (document.getElementById('fileinput').value !== '') {
          document.getElementById('fileinput').value = '';
        }
      },
      handleReset() {
        this.editModal = false;
        console.log('handleReset');
      },
      remove(index) {
        this.deleteModal = true;
        this.deleteIndex = index;
        this.isDeleting = false;
      },
      deleteItem() {
        this.isDeleting = true;
        const self = this;
        this.$http.delete('/user/deleteUser/' + self.data[self.deleteIndex].id, {}).then((res) => {
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
      this.getRoleList();
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
