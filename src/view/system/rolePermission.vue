<style lang="less">
    @import '../../styles/common.less';

    .role-list {
        .ivu-menu-submenu-title-icon {
            display: none;
        }

        .title-icon {
            position: absolute;
            top: 50%;
            right: 24px;
            transform: translateY(-50%);
        }

        .ivu-menu {
            padding: 0 10px;
        }
    }
    .button-div{
      text-align:center;
    }
</style>
<template>
    <Row :gutter="16">
        <Col span="6">
            <Card title="公共角色" icon="ios-options" :padding="0" shadow>
               <Button icon="md-add" slot="extra" @click="add"></Button>
               <Scroll height="600">
                <div @mouseleave="mouseLeave">
                    <Menu class="role-list" ref="menu" width="auto">
                        <template>
                            <Submenu v-for="(item, index) in roleList" :name="item.id" :key="index">
                                <template slot="title">
                                    <Icon type="md-person" size="16"/>
                                    <span>{{item.name}}</span>
                                </template>
                                <CellGroup>
                                    <Cell title="角色编码：" :label="item.code"/>
                                    <Cell title="角色描述：" :label="item.description"/>
                                    <Cell title="是否启用">
                                        <i-switch v-model="switchValue" slot="extra"/>
                                    </Cell>                              
                                </CellGroup>
                                <div class="button-div">
                                  <Button type="warning" ghost style="margin-right:15px;" @click="edit(item.id)" >修改</Button>                                 
                                  <Button type="error" ghost @click="remove(item.id)" style="margin-left:15px;">删除</Button>
                                </div>
                            </Submenu>
                        </template>
                    </Menu>
                </div>
               </Scroll>
            </Card>
        </Col>
        <Col span="18">
            <Card title="权限树" icon="ios-options">
              <Button  shape="circle" slot="extra">保存</Button>
              <Scroll height="565">
                <Tree :data="data4" show-checkbox multiple></Tree>
              </Scroll>
            </Card>
        </Col>
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
    </Row>
</template>
<script>
    export default {
        name: 'rolePermission',
        data() {
            return {
                editCell: false,
                isSaving: false,
                switchValue: true,
                editModal:false,
                modalTitle: '',
                deleteModal:false,
                isSaving: false,
                isDeleting: false,
                roleList: [],
                data4: [
                    {
                        title: '权限总菜单',
                        expand: true,
                        selected: true,
                        children: []
                    }
                ],
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
            }
        },
        methods: {
            getTree() {
                const self = this;
                this.$http.get('/permission/permission-list').then((res) => {
                    if (res.code === 200) {
                        this.data4[0].children = res.data.children;
                    } else {
                        self.$Message.error('获取数据失败！' + res.code);
                    }
                })
            },
            getRole() {
                const self = this;
                this.$http.get('/role/pageList').then((res) => {
                    if (res.code === 200) {
                        self.roleList = res.data.list;
                        console.log(self.roleList);
                    } else {
                        self.$Message.error('获取数据失败！' + res.code);
                    }
                })
            },
            chooseRole() {
                this.editCell = true;
            },
            mouseLeave() {
                this.editCell = false;
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
                          self.getRole();
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
                          self.getRole();
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
            deleteItem() {
              this.isDeleting = true;
              const self = this;
              this.$http.delete('/role/deleteRole/' + self.deleteIndex, {}).then((res) => {
                if (res.code === 200) {
                  self.isDeleting = false;
                  self.deleteModal = false;
                  self.reloadList();
                  self.$Message.success('删除成功！');
                } else {
                  self.$Message.error('删除失败！' + res.code);
                }
              });
            },
            remove(index) {
              console.log(index);
            this.deleteModal = true;
            this.deleteIndex = index;
            this.isDeleting = false;
          }, 
           add() {
            this.isSaving = false;
            this.$refs.roleForm.resetFields();
            this.modalTitle = '添加角色';
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
            this.$http.get('/role/detailInfo/' + index, {}).then((res) => {
              if (res.code === 200) {
                self.roleForm = res.data;
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
        },
        created() {
            this.getTree();
            this.getRole();
        },

    }

</script>
