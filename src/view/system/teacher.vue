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
      <Form ref='teacherForm' :model='teacherForm' :rules='teacherFormRule' :label-width='90'>
        <FormItem label='用户名' prop='userName'>
          <Input v-model='teacherForm.userName' :maxlength=50 placeholder='请输入用户名' style="width: 550px;"/>
        </FormItem>
        <FormItem label='姓名' prop='realName'>
          <Input v-model='teacherForm.realName' :maxlength=50 placeholder='请输入真实姓名' style="width: 550px;"/>
        </FormItem>
        <FormItem label='性别' prop='gender'>
          <i-select placeholder="请选择性别" :autosize='{minRows: 2,maxRows: 5}' 
            :maxlength=500 style="width: 550px;"v-model='teacherForm.gender'>
              <i-option value="0">男</i-option>
              <i-option value="1">女</i-option>
          </i-select>
        </FormItem>
        <FormItem label='密码' prop='password'>
          <Input v-model='teacherForm.password' :maxlength=500 style="width: 550px;"
                 :autosize='{minRows: 2,maxRows: 5}' placeholder='请输入...'/>
        </FormItem>
        <FormItem label='工作号码' prop='officePhone'>
          <Input v-model='teacherForm.officePhone'  :maxlength=500 style="width: 550px;"
                 :autosize='{minRows: 2,maxRows: 5}' placeholder='请输入...'/>
        </FormItem>
        <FormItem label='电话号码' prop='mobilePhone'>
          <Input v-model='teacherForm.mobilePhone'  :maxlength=500 style="width: 550px;"
                 :autosize='{minRows: 2,maxRows: 5}' placeholder='请输入...'/>
        </FormItem>
        <FormItem label='邮箱' prop='email'>
          <Input v-model='teacherForm.email' :maxlength=500 style="width: 550px;"
                 :autosize='{minRows: 2,maxRows: 5}' placeholder='请输入...'/>
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
        <span>删除角色</span>
      </p>
      <div style="text-align:center">
        <p>删除该角色，将无法恢复！</p>
        <p>是否删除?</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long :loading="isDeleting" @click="deleteItem">删除</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  export default {
    name: 'teacher',
    data() {
      return {
        teacherForm: {
          userName: undefined,
          realName: undefined,
          password: undefined,
          mobilePhone: undefined,
          officePhone: undefined,
          gender: undefined,
          email: undefined,
        },
        teacherFormRule: {
          userName: [
            { required: true, message: '用户名不能为空.', trigger: 'blur' },
            { type: 'string', max: 255, message: 'Code最多255字符', trigger: 'blur' },
          ],
          realName: [
            { required: true, message: '姓名不能为空.', trigger: 'blur' },
            { type: 'string', max: 255, message: 'Code最多255字符', trigger: 'blur' },
          ],
          gender: [
            { required: true, message: '性别不能为空.', trigger: 'blur' },
            { type: 'string', max: 255, message: 'Name最多255字符', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '密码不能为空.', trigger: 'blur' },
            { type: 'string', max: 255, message: '密码最多255字符', trigger: 'blur' },
          ]
        },
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
        deleteIndex: '',
        columns: [
          { type: 'index', title: '序号', width: 60, align: 'center' },
          { title: '用户名', key: 'userName', align: 'center' },
          { title: '姓名', key: 'realName', align: 'center' },
          { title: '性别', key: 'gender', align: 'center' },
          { title: '工作号码', key: 'officePhone', align: 'center' },
          { title: '电话号码', key: 'mobilePhone', align: 'center' },
          { title: '邮箱', key: 'email', align: 'center' },
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
    methods: {
      getList() {
        this.loading = true;
        const self = this;
        const params = {
          page: this.pageInfo.pageNum || 1,
          size: this.pageInfo.pageSize || 10
        };
        this.$http.get('/teacher', params).then((res) => {
          self.loading = false;
          if (res.code === 200) {        
            const result = res.data;
            self.data = result && result.list;
            self.pageInfo.total = result && result.total;
            for (let i = 0; i < self.data.length; i++) {
               if(self.data[i].gender=='0'){
                 self.data[i].gender='男'
               }
               else{
                 self.data[i].gender='女';
               }
              }
            console.log(self.data);
          } else {
            self.$Message.error('获取数据失败！' + res.code);
          }

        })
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
        this.teacherForm.menuIds = [];
        if (list) {
          list.forEach(item => {
            this.teacherForm.menuIds.push(item.id);
          })
        }
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
        this.isSaving = false;
        this.$refs.teacherForm.resetFields();
        this.modalTitle = '添加角色';
        this.teacherForm = {
          userName: undefined,
          realName: undefined,
          password: undefined,
          mobilePhone: undefined,
          officePhone: undefined,
          gender: undefined,
          email: undefined,
        };
        this.editModal = true;
      },

      edit(index) {
        this.isSaving = false;
        const self = this;
        this.$refs.teacherForm.resetFields();
        this.modalTitle = '编辑角色';
        this.editModal = true;
        this.$http.get('/teacher/' + self.data[index].id, {}).then((res) => {
          if (res.code === 200) {
            self.teacherForm = res.data;
            console.log(self.teacherForm.menuIds);
            if (self.teacherForm.menuIds && self.teacherForm.menuIds.length > 0) {
              for (let key in self.originMenu) {
                self.originMenu[key].forEach(item => {
                  item.checked = false;
                  for (let i=0; i<self.teacherForm.menuIds.length; i++) {
                    if (item.id === self.teacherForm.menuIds[i]) {
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
        console.log(this.teacherForm.id);
        this.$refs.teacherForm.validate((valid) => {
          if (valid) {
             if (this.teacherForm.id) {
              this.$http.put('/teacher', self.teacherForm).then((res) => {
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
              this.$http.post('/teacher', self.teacherForm).then((res) => {
                if (res.code === 200) {
                  self.isSaving = false;
                  self.editModal = false;
                  self.reloadList();
                  self.$Message.success('添加成功！');
                } else {
                  self.$Message.error('添加失败！' + res.code);
                }
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
        this.$http.delete('/teacher/' + self.data[self.deleteIndex].id, {}).then((res) => {
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