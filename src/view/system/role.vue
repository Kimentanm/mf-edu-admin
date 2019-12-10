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
      <Form ref='roleForm' :model='roleForm' :rules='roleFormRule' :label-width='90'>
        <FormItem label='Code' prop='code'>
          <Input v-model='roleForm.code' :maxlength=30 placeholder='请输入code' style="width: 550px;"/>
        </FormItem>
        <FormItem label='名称' prop='name'>
          <Input v-model='roleForm.name' :maxlength=50 placeholder='请输入name' style="width: 550px;"/>
        </FormItem>
        <FormItem label='描述' prop='description'>
          <Input v-model='roleForm.description' type='textarea' :maxlength=500 style="width: 550px;"
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
    name: 'role',
    data() {
      return {
        roleForm: {
          code: undefined,
          name: undefined,
          description: undefined,
          menuIds: [],
        },
        roleFormRule: {
          code: [
            { type: 'string', max: 255, message: 'Code最多255字符', trigger: 'blur' },
          ],
          name: [
            { required: true, message: 'Name不能为空.', trigger: 'blur' },
            { type: 'string', max: 255, message: 'Name最多255字符', trigger: 'blur' },
          ],
          description: [
            { required: true, message: 'Description不能为空.', trigger: 'blur' },
            { type: 'string', max: 255, message: 'Description最多255字符', trigger: 'blur' },
          ],
          menuIds: [
            { type: 'array', message: '权限不能为空', trigger: 'blur', required: true }
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
          { title: 'Code', key: 'code', align: 'center' },
          { title: '名称', key: 'name', align: 'center' },
          { title: '描述', key: 'description', align: 'center' },
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
        this.$http.get('/role/pageList', params).then((res) => {
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

      getMenuList() {
        const self = this;
        this.$http.get('/menu/listMenuBO').then((res) => {
          if (res.code === 200) {
            self.originMenu = res.data;
          }
        })
      },

      getCheckMenuList(list) {
        this.roleForm.menuIds = [];
        if (list) {
          list.forEach(item => {
            this.roleForm.menuIds.push(item.id);
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
        this.$refs.roleForm.resetFields();
        this.modalTitle = '添加角色';
//        this.resetCheckMenu();
        this.roleForm = {
          code: undefined,
          name: undefined,
          description: undefined,
          menuIds: [],
        };
        this.editModal = true;
      },

      edit(index) {
        this.isSaving = false;
        const self = this;
        this.$refs.roleForm.resetFields();
        this.modalTitle = '编辑角色';
        this.editModal = true;
        this.$http.get('/role/detailInfo/' + self.data[index].id, {}).then((res) => {
          if (res.code === 200) {
            self.roleForm = res.data;
            console.log(self.roleForm.menuIds);
            if (self.roleForm.menuIds && self.roleForm.menuIds.length > 0) {
              for (let key in self.originMenu) {
                self.originMenu[key].forEach(item => {
                  item.checked = false;
                  for (let i=0; i<self.roleForm.menuIds.length; i++) {
                    if (item.id === self.roleForm.menuIds[i]) {
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
        this.$refs.roleForm.validate((valid) => {
          if (valid) {
            if (this.roleForm.id) {
              this.$http.put('/role/updateRole', self.roleForm).then((res) => {
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
              this.$http.post('/role/addRole', self.roleForm).then((res) => {
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
          } else {
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
        this.$http.delete('/role/deleteRole/' + self.data[self.deleteIndex].id, {}).then((res) => {
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
