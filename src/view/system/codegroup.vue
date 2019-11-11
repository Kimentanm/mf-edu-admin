<style lang="less">
  @import '../../styles/common.less';

</style>

<template>
  <div class="smart-crud-container">

    <div class="smart-crud-top">
      <Row>
        <Col span="24">
          <Button class="" type="primary" @click="add">添加</Button>
          <Input class="pull-right" v-model="searchModel"
               icon="ios-search" placeholder="搜索..." style="width: 200px" @on-enter="reloadList" />
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
      width="450"
      :loading="isSaving"
      @on-ok="handleSubmit"
      @on-cancel="handleReset"
      ok-text="保存"
      cancel-text="取消"
      :title="modalTitle"
      :styles="{top: '20px'}">
      <Form ref='codegroupForm' :model='codegroupForm' :rules='codegroupFormRule' :label-width='120'>
        <FormItem label='Code:' prop='code'>
          <Input v-model='codegroupForm.code' :maxlength=30 placeholder='请输入词义' style="width:200px"/>
        </FormItem>
        <FormItem label='名称:' prop='name'>
          <Input v-model='codegroupForm.name' :maxlength=50 placeholder='请输入名称' style="width:200px"/>
        </FormItem>
        <FormItem label='描述:' prop='description'>
          <Input v-model='codegroupForm.description' type='textarea' :maxlength=500 style="width:200px"
                 :autosize='{minRows: 2,maxRows: 5}'
                 placeholder='请输入描述'/>
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
        <span>删除codegroup</span>
      </p>
      <div style="text-align:center">
        <p>删除该codegroup，将无法恢复！</p>
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
  name: 'codegroup',
  data() {
    return {
      searchModel: undefined,
      codegroupForm: {
				code: undefined, 
				name: undefined, 
				description: undefined, 
			},
      codegroupFormRule: {
				code: [
					{ required: true, message: 'Code不能为空.', trigger: 'blur' }, 
					{ type: 'string', max: 30, message: 'Code最多30字符', trigger: 'blur' }, 
				], 
				name: [
					{ required: true, message: '名称不能为空.', trigger: 'blur' },
					{ type: 'string', max: 50, message: '名称最多50字符', trigger: 'blur' },
				], 
				description: [
					{ type: 'string', max: 500, message: '描述最多500字符', trigger: 'blur' },
				], 
			},
      loading: false,
      keepalive: false,
      isSaving: false,
      isDeleting: false,
      pageInfo: {},
      modalTitle: '',
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
        size: this.pageInfo.pageSize || 10,
        keyword: this.searchModel,
      };
      this.$http.get('/codeGroup/filter', params).then((res) => {
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
      this.$refs.codegroupForm.resetFields();
      this.modalTitle = '新建codeGroup';
      this.codegroupForm = {
				code: undefined, 
				name: undefined, 
				description: undefined, 
			};
      this.editModal = true;
    },

    edit(index) {
      this.isSaving = false;
      const self = this;
      this.modalTitle = '编辑codeGroup';
      this.$refs.codegroupForm.resetFields();
      this.editModal = true;
      this.$http.get('/codeGroup/' + self.data[index].id, {}).then((res) => {
        if (res.code === 200) {
          self.codegroupForm = res.data;
        } else {
          self.$Message.error('获取codegroup失败！' + res.code);
        }

      });
    },

    handleSubmit() {
      this.isSaving = true;
      let self = this;
      this.$refs.codegroupForm.validate((valid) => {
        if (valid) {
          if (this.codegroupForm.id) {
            this.$http.put('/codeGroup', self.codegroupForm).then((res) => {
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
            this.$http.post('/codeGroup', self.codegroupForm).then((res) => {
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
      this.$http.delete('/codeGroup/' + self.data[self.deleteIndex].id, {}).then((res) => {
        if (res.code === 200) {
          self.isDeleting = false;
          self.deleteModal = false;
          self.reloadList();
          self.$Message.success('删除成功！');
        } else {
          self.$Message.error('删除失败！'+res.code);
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
