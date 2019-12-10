<style lang="less">
  @import '../../styles/common.less';
</style>

<template>
  <div class="thng-crud-container job" style="margin-top: 20px">
    <div class="thng-crud-top">
      <Row>
        <Col span="24">
        <div class="top-button">
          <Button class="" type="primary" @click="add" icon="plus-round">添加Job</Button>
        </div>
        </Col>
      </Row>
    </div>
    <br>
    <div class="thng-crud-bottom">
      <Row>
        <Col span="24">
        <Table stripe :loading="loading" :columns="columns" :data="data"></Table>

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
        width="500"
        :styles="{top: '20px'}"
        :title="editModalTitle">

      <Form ref='jobForm' :model='jobForm' :rules='jobFormRule' :label-width='110'>
        <FormItem label='名称：' prop='name'>
          <Input v-model='jobForm.name' :maxlength=50 placeholder='请输入名称' style="width: 300px"/>
        </FormItem>
        <FormItem label='代码：' prop='code'>
          <Input v-model='jobForm.code' :maxlength=50 placeholder='请输入代码' style="width: 300px"/>
        </FormItem>
        <FormItem label='Bean名称：' prop='beanName'>
          <Input v-model='jobForm.beanName' :maxlength=50 placeholder='请输入Bean名称' style="width: 300px"/>
        </FormItem>
        <FormItem label='间隔值：' prop='intervalValue'>
          <Input v-model='jobForm.intervalValue' :maxlength=30
                 placeholder='请输入间隔值' style="width: 300px" number/></FormItem>
        <FormItem label='单位：' prop='unit'>
          <code-select :codeType="timeUnit" @emitedCodes="getUnitList">
            <Select v-model='jobForm.unit' style="width: 300px">
              <Option v-for="item in unitList" :value="item.code" :key="item.code">{{item.name}}</Option>
            </Select>
          </code-select>
        </FormItem>
        <FormItem label='描述：' prop='description'>
          <Input v-model='jobForm.description' type='textarea'
                 :maxlength=500 :autosize='{minRows: 2,maxRows: 5}'
                 placeholder='请输入...' style="width: 300px"/></FormItem>
      </Form>
      <Spin fix v-if="editLoading">
        <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
        <div>加载中...</div>
      </Spin>
      <div slot="footer">
        <Button @click="handleReset()" style="margin-left: 8px">取消</Button>
        <Button type="primary" :loading="isSaving" @click="handleSubmit()">保存</Button>
      </div>

    </Modal>

    <Modal v-model="deleteModal" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>删除job</span>
      </p>
      <div style="text-align:center">
        <p>删除该job，将无法恢复！</p>
        <p>是否删除?</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long :loading="isDeleting" @click="deletejob">删除</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import codeSelect from '../shared/code/CodeSelect';
  import constants from '../shared/constants';

  export default {
    components: { codeSelect },
    data() {
      return {
        searchModel: undefined,
        jobForm: {
          name: undefined,
          code: undefined,
          beanName: undefined,
          description: undefined,
          intervalValue: undefined,
          unit: undefined,
        },
        jobFormRule: {
          name: [{ required: true, message: '名称不能为空.', trigger: 'blur' }],
          code: [{ required: true, message: '代码不能为空.', trigger: 'blur' }],
          beanName: [{ required: true, message: 'Bean的名称不能为空.', trigger: 'blur' }],
          description: [{ type: 'string', max: 500, message: '描述最多500字符', trigger: 'blur' }],
          intervalValue: [{ required: true, type: 'number', message: '间隔值不能为空且必须为数字.', trigger: 'blur' }],
          unit: [{ required: true, message: '单位不能为空.', trigger: 'change' }],
        },
        loading: false,
        isSaving: false,
        isDeleting: false,
        pageInfo: {},
        editModal: false,
        deleteModal: false,
        deleteIndex: '',
        columns: [
          {
            type: 'index',
            title: '序号',
            width: 65,
            align: 'center'
          },
          {
            title: '名称',
            key: 'name'
          },
          {
            title: '代码',
            key: 'code'
          },
          {
            title: 'Bean名称',
            key: 'beanName',
            width: 230,
          },
          {
            title: '描述',
            key: 'description'
          },
          {
            title: '间隔',
            key: 'intervalValue',
            width: 80,
            render: (h, params) => {
              let unitStr = '';
              switch (params.row.unit) {
                case 'd' :
                  unitStr = '天';
                  break;
                case 'h' :
                  unitStr = '小时';
                  break;
                case 'm' :
                  unitStr = '分钟';
                  break;
                case 's' :
                  unitStr = '秒';
                  break;
              }
              return h('span', params.row.intervalValue + unitStr);
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
        data: [],
        editModalTitle: '',
        unitList: '',
        timeUnit: constants.codeType.time_unit,
        editLoading: false,
      }
    },
    methods: {
      getjobList() {
        this.loading = true;
        const self = this;
        const params = {
          page: this.pageInfo.pageNum || 1,
          size: this.pageInfo.pageSize || 10
        };
        this.$http.get('/job', params).then((res) => {
          self.loading = false;
          if (res.code === 200) {
            const result = res && res.data;
            self.data = result && result.list;
            self.pageInfo.total = result && result.total;
          } else {
            self.$Message.error('获取数据失败！' + res.code);
          }

        })
      },
      changePage(currentPage) {
        this.pageInfo.pageNum = currentPage;
        this.getjobList();
      },

      changePageSize(pageSize) {
        this.pageInfo.pageSize = pageSize;
        this.getjobList();
      },
      add() {
        this.isSaving = false;
        this.jobForm = {
          name: undefined,
          description: undefined,
          intervalValue: undefined,
          unit: undefined,
        };
        this.$refs.jobForm.resetFields();
        this.editModal = true;
        this.editModalTitle = '添加Job';
      },

      edit(index) {
        this.isSaving = false;
        this.editLoading = true;
        const self = this;
        this.editModalTitle = '编辑Job';
        this.$refs.jobForm.resetFields();
        this.editModal = true;
        this.$http.get('/job/' + self.data[index].id, {}).then((res) => {
          if (res.code === 200) {
            self.jobForm = res.data;
          } else {
            self.$Message.error('获取job失败！' + res.code);
          }
          self.editLoading = false;
        });
      },

      handleSubmit() {
        this.isSaving = true;
        let self = this;
        this.$refs.jobForm.validate((valid) => {
          if (valid) {
            console.log(this.jobForm.id);
            if (this.jobForm.id) {
              this.$http.put('/job', self.jobForm).then((res) => {
                if (res.code === 200) {
                  self.isSaving = false;
                  self.editModal = false;
                  self.getjobList();
                  self.$Message.success('更新成功！');
                } else {
                  self.$Message.error('更新失败！' + res.code);
                }

              });
            } else {
              this.$http.post('/job', self.jobForm).then((res) => {
                if (res.code === 200) {
                  self.isSaving = false;
                  self.editModal = false;
                  self.getjobList();
                  self.$Message.success('添加成功！');
                } else {
                  self.$Message.error('添加失败！' + res.code);
                }
              })
            }

          } else {
            self.isSaving = false;
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
      deletejob() {
        this.isDeleting = true;
        var self = this;
        this.$http.delete('/job/' + self.data[self.deleteIndex].id, {}).then((res) => {
          if (res.code === 200) {
            self.isDeleting = false;
            self.deleteModal = false;
            self.getjobList();
            self.$Message.success('删除成功！');
          } else {
            self.$Message.error('删除失败！' + res.code);
          }

        });
      },
      getUnitList(data) {
        this.unitList = data.data;
      },
    },
    created() {
      this.getjobList();
    }
  }
</script>
