<style lang="less">
    @import '../../styles/common.less';
    @import "./iphone.less";
</style>

<template>
    <div class="smart-crud-container">

        <div class="smart-crud-top">
            <Row>
                <Col span="24">
                    <Button class="" type="primary" @click="add">添加</Button>
                    <Input class="pull-right" v-model="searchModel"
                           icon="ios-search" placeholder="搜索新闻标题" style="width: 200px" @on-enter="reloadList"/>
                </Col>
            </Row>
        </div>
        <br>
        <div class="smart-crud-bottom">
            <Row>
                <Col span="24">
                    <Tabs v-model="tabTitle" @on-click="getList">
                        <TabPane v-for="(item, index) in funcCodeList" :key="item.id" :label="item.name"
                                 :name="item.code">
                            <Table :loading="loading" :columns="columns" :data="data"></Table>
                        </TabPane>
                    </Tabs>

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

        <Modal v-model="deleteModal" width="360">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="information-circled"></Icon>
                <span>删除content</span>
            </p>
            <div style="text-align:center">
                <p>删除该content，将无法恢复！</p>
                <p>是否删除?</p>
            </div>
            <div slot="footer">
                <Button type="error" size="large" long :loading="isDeleting" @click="deleteItem">删除</Button>
            </div>
        </Modal>


        <Modal v-model="newsPreviewModal" width="302" :styles="{top: '20px'}" @on-visible-change="newsPreviewModalChange">
            <p slot="header" style="color:#333;text-align:center">
                <span>{{previewModalTitle}}</span>
            </p>
            <div style="position: relative;height: 562px">
                <div class="iphone-box">
                    <div class="iphone-head"></div>
                    <div class="iphone-container">
                        <div class="iphone-navbar">
                            <div id="news-news" class="iphone-context">
                                <div v-model="currentNewsForm">
                                    <h3 class="news-head" v-model="currentNewsForm.title">{{ currentNewsForm.title }}</h3>
                                    <div class="news-author" v-show="currentNewsForm.title">
                                        <span class="news-author-name">管理员</span>
                                        <span class="news-author-time">今天</span>
                                    </div>
                                    <br>
                                    <p class="news-body" v-html="currentNewsForm.detail">{{ currentNewsForm.detail }}</p>
                                    <p class="modify-tip" v-show="currentNewsForm.detail">文章已于{{DateUtil.formatDate(new Date(), 'yyyy-MM-dd')}}修改</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div slot="footer">
                <Button v-show="isPublish" type="primary" size="small"  @click="publish" :loading="publishButtonLoading">确认发布</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
  import CodeName from "../shared/code/CodeName";
  import constants from "@/view/shared/constants.js"
  import CodeSelect from "../shared/code/CodeSelect";
  import DateUtil from '../../libs/DateUtil'

  export default {
    name: 'news',
    components: {CodeSelect, CodeName},
    data() {
      return {
        searchModel: "",
        contentForm: {
          title: undefined,
          summary: undefined,
          publishDate: undefined,
          imageUrl: undefined,
          detail: undefined,
          status: undefined,
          recommendInd: undefined,
          functionCode: undefined,
        },
        loading: false,
        repealButtonLoading: false,
        keepalive: false,
        isSaving: false,
        isDeleting: false,
        pageInfo: {},
        editModal: false,
        funcCodeList: [],
        tabTitle: undefined,
        deleteModal: false,
        deleteIndex: '',
        DateUtil: DateUtil,
        previewModalTitle: '',
        publishButtonLoading: false,
        isPublish: false,
        publishIndex: 0,
        columns: [{type: 'index', title: '序号', width: 60, align: 'center'},
          {title: '主题', key: 'title'},
          {title: '概括', key: 'summary'},
          {
            title: '封面图片', key: 'imageUrl',
            render: (h, params) => {
              return h('img', {
                domProps: {
                  align: 'center',
                  src: params.row.imageUrl,
                },
                style: {
                  width: '45px',
                }
              })
            }
          },
          {
            title: '状态', key: 'status',
            render: (h, params) => {
              return h(CodeName, {
                props: {
                  codeType: constants.codeType.contentStatus,
                  code: params.row.status.toString()
                }
              })
            }
          },
          {
            title: '是否推荐', key: 'recommendInd',
            render: (h, params) => {
              if (params.row.recommendInd == 0) {
                return h('span', '否')
              } else if (params.row.recommendInd == 1) {
                return h('span', '是')
              }
            }
          },
          {
            title: '操作',
            align: 'center',
            key: 'handle',
            width: 220,
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'success',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.previewModalTitle = "新闻预览";
                      this.isPublish = false;
                      this.newsPreviewModal = true;
                      this.currentNewsForm = this.data[params.index]
                    }
                  }
                }, '预览'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    disabled: params.row.status ? 'disabled' : false
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.edit(params.index)
                    }
                  }
                }, '编辑'),
                h('Button', {
                  props: {
                    type: 'info',
                    size: 'small',
                    loading: this.repealButtonLoading
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.publishIndex = params.index;
                      if (params.row.status) {
                        this.repeal();
                      } else {
                        this.previewModalTitle = "预览新闻并发布";
                        this.isPublish = true;
                        this.currentNewsForm = this.data[params.index]
                        this.newsPreviewModal = true;
                      }
                    }
                  }
                }, params.row.status ? '撤销' : '发布'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.remove(params.index)
                    }
                  }
                }, '删除')
              ]);
            }
          }
        ],
        data: [],
        newsPreviewModal: false,
        currentNewsForm: {}
      }
    },
    methods: {
      getList() {
        this.loading = true;
        const self = this;
        const params = {
          page: this.pageInfo.pageNum || 1,
          size: this.pageInfo.pageSize || 10,
          functionCode: this.tabTitle || this.funcCodeList[0].code,
          title: this.searchModel
        };
        this.$http.get('/news/function/code', params).then((res) => {
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
      getFunctionCodeList() {
        const self = this;
        this.$http.get('/code/type', {type: constants.codeType.newsFunCode}).then((res) => {
          self.loading = false;
          if (res.code === 200) {
            self.funcCodeList = res.data;
            if (self.funcCodeList) {
              self.getList();
            }
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
        this.$router.push({
          params: {
            contentId: 0
          },
          name: 'news-detail'
        });
      },

      edit(index) {
        this.$router.push({
          params: {
            contentId: this.data[index].id
          },
          name: 'news-detail'
        });
      },

      publish() {
        this.publishButtonLoading = true;
        this.$http.get("/news/publish/" + this.data[this.publishIndex].id).then((res) => {
          if (res.code === 200) {
            this.$Message.success("发布新闻成功");
            this.newsPreviewModal = false;
            this.getList();
          } else {
            this.$Message.error("发布新闻失败，请重试");
          }
          this.publishButtonLoading = false;
        });
      },

      repeal() {
        this.repealButtonLoading = true;
        this.$http.get("/news/repeal/" + this.data[this.publishIndex].id).then((res) => {
          if (res.code === 200) {
            this.$Message.success("撤销新闻成功");
            this.getList();
          } else {
            this.$Message.error("撤销新闻成功，请重试");
          }
          this.repealButtonLoading = false;
        });
      },

      handleSubmit() {
        this.isSaving = true;
        let self = this;
        this.$refs.contentForm.validate((valid) => {
          if (valid) {
            if (this.contentForm.id) {
              this.$http.put('/news', self.contentForm).then((res) => {
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
              this.$http.post('/news', self.contentForm).then((res) => {
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
        this.$http.delete('/news/' + self.data[self.deleteIndex].id, {}).then((res) => {
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
      newsPreviewModalChange(val) {
        if (!val) {
          this.currentNewsForm = {};
        }
      }
    },
    created() {
      this.getFunctionCodeList()
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
