<style lang="less">
  @import '../../styles/common.less';

</style>

<template>
  <div class="smart-crud-container">

    <div class="smart-crud-top">
      <Row>
        <Col span="24">
        <Button class="" type="primary" @click="add">创建</Button>
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
      <Form ref='classroomForm' :model='classroomForm' :rules='classroomFormRule' :label-width='90'>
        <FormItem label='教室编号' prop='classCode'>
          <Input v-model='classroomForm.classCode' :maxlength=50 placeholder='请输入教室编号' style="width: 550px;"/>
        </FormItem>
        <FormItem label='教室名称' prop='className'>
          <Input v-model='classroomForm.className' :maxlength=50 placeholder='请输入教室名称' style="width: 550px;"/>
        </FormItem>
        <FormItem label='课程' prop='curriculum'>
          <Input v-model='classroomForm.curriculum' :maxlength=50 placeholder='请输入课程' style="width: 550px;"/>
        </FormItem>
        <FormItem label='选择教师' prop='teacherId'>
          <Select v-model='classroomForm.teacherId' style="width:550px" placeholder='请选择教师'>
            <Option v-for="item in teacherList" :value="item.id" :key="item.userName">{{ item.userName }}</Option>
          </Select>
        </FormItem>
        <FormItem label='选择学生' prop='teacherId'>
          <Select v-model='classroomForm.studentId' style="width:550px" placeholder='请选择学生'>
            <Option v-for="item in studentList" :value="item.id" :key="item.userName">{{ item.userName }}</Option>
          </Select>
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
        <span>删除教室</span>
      </p>
      <div style="text-align:center">
        <p>删除该教室，将无法恢复！</p>
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
    name: 'classroom',
    data() {
      return {
        classroomForm: {
          classCode: undefined,
          studentId: undefined,
          className: undefined,
          curriculum: undefined,
          teacherId: undefined,
        },
        classroomFormRule: {
          classCode: [
            { required: true, message: '教室编号不能为空.', trigger: 'blur' },
            { type: 'string', max: 255, message: 'Code最多255字符', trigger: 'blur' },
          ],
          className: [
            { required: true, message: '教室名不能为空.', trigger: 'blur' },
            { type: 'string', max: 255, message: 'Code最多255字符', trigger: 'blur' },
          ],
          curriculum: [
            { required: true, message: '课程不能为空.', trigger: 'blur' },
            { type: 'string', max: 255, message: 'Name最多255字符', trigger: 'blur' },
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
          { title: '教室编号', key: 'classCode', align: 'center' },
          { title: '教室名', key: 'className', align: 'center' },
          { title: '课程', key: 'curriculum', align: 'center' },
          { title: '管理老师', key: 'teacherId', align: 'center' },
          { title: '学生ID', key: 'studentId', align: 'center' },
          {
            title: '操作',
            align: 'center',
            key: 'handle',
            render: (h, params) => {
              return this.$render.renderEditDel(this, h, params);
            }
          }
        ],
        data: [],
        teacherList:[],
        studentList:[]
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
        this.$http.get('/class/room', params).then((res) => {
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
          } else {
            self.$Message.error('获取数据失败！' + res.code);
          }

        })
      },

       getTeacherList() {
        const self = this;
        this.$http.get('/teacher').then((res) => {
          if (res.code === 200) {
            const result = res.data;
            self.teacherList = result && result.list;
          } else {
            self.$Message.error('获取数据失败！' + res.code);
          }

        })
      },

      getStuList(){
        const self = this;
        this.$http.get('/student').then((res) => {
          if (res.code === 200) {
            const result = res.data;
            self.studentList = result && result.list;
          } else {
            self.$Message.error('获取数据失败！' + res.code);
          }

        })

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
        this.getTeacherList();
        this.getStuList();
        this.isSaving = false;
        this.$refs.classroomForm.resetFields();
        this.modalTitle = '添加教室信息';
        this.classroomForm = {
          classCode: undefined,
          studentId: undefined,
          className: undefined,
          curriculum: undefined,
          teacherId: undefined,
          classStartTime: undefined,
        };
        this.editModal = true;
      },

      edit(index) {
        this.isSaving = false;
        const self = this;
        this.$refs.classroomForm.resetFields();
        this.modalTitle = '编辑学生信息';
        this.editModal = true;
        this.$http.get('/class/room/' + self.data[index].id, {}).then((res) => {
          if (res.code === 200) {
            self.classroomForm = res.data;
            console.log(self.classroomForm.menuIds);
            if (self.classroomForm.menuIds && self.classroomForm.menuIds.length > 0) {
              for (let key in self.originMenu) {
                self.originMenu[key].forEach(item => {
                  item.checked = false;
                  for (let i=0; i<self.classroomForm.menuIds.length; i++) {
                    if (item.id === self.classroomForm.menuIds[i]) {
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
        console.log(this.classroomForm.id);
        this.$refs.classroomForm.validate((valid) => {
          if (valid) {
             if (this.classroomForm.id) {
              this.$http.put('/class/room', self.classroomForm).then((res) => {
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
              this.$http.post('/class/room', self.classroomForm).then((res) => {
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
        this.$http.delete('/class/room/' + self.data[self.deleteIndex].id, {}).then((res) => {
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
