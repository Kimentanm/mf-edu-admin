<style lang="less">
  @import '../../styles/common.less';
  @import './job.less';
</style>

<template>
  <div class="thng-crud-container jobRun" style="margin-top: 20px">
    <Row>
      <Col span="24">
      <div style="margin-bottom: 18px;margin-left:10px">
        <label style="display: inline-block;">状态：</label>
        <RadioGroup v-model="status">
          <Radio label="ALL">全部</Radio>
          <Radio label="INPROGRESS">正在运行</Radio>
          <Radio label="SUCCESS">运行成功</Radio>
          <Radio label="FAILED">运行失败</Radio>
        </RadioGroup>
        <Button type="primary" icon="ios-search" @click="searchByJobStatus()"
                style="display: inline-block; margin-left: 20px">查询
        </Button>
      </div>
      </Col>
    </Row>
    <Row>
      <Col span="24">
      <div>
        <Table stripe :data="jobRunResultData" :columns="jobRunResultColumns"
               :loading="jobRunResultTableLoading"></Table>
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
      </div>
      </Col>
    </Row>

    <!--查看错误信息弹框-->
    <Modal v-model="jobErrorModal"
           title="错误信息"
           width="450"
           style="text-align: center"
           :styles="{top: '20px'}">
      <p>{{jobErrorContent}}</p>
    </Modal>
  </div>
</template>

<script>
  import DateUtil from '../../libs/DateUtil';

  export default {
    name: 'job-rerun',
    data() {
      return {
        status: '',
        jobRunResultTableLoading: false,
        pageInfo: {},
        jobRunResultData: [],
        jobErrorContent: '',
        jobErrorModal: false,
        jobRunResultColumns: [
          {
            type: 'index',
            title: '序号',
            width: 70,
align: 'center'
          },
          {
            title: 'Job名称',
            key: 'name',
            align: 'center',
            width: 200,
            render: (h, params) => {
              return h('span', params.row.job.name);
            }
          },
          {
            title: 'Job开始时间',
            key: 'startTime',
            align: 'center',
            width: 200,
            render: (h, params) => {
              return h('span', DateUtil.formatDate(new Date(params.row.startTime), 'yyyy-MM-dd hh:mm:ss'));
            }
          },
          {
            title: 'Job结束时间',
            key: 'endTime',
            align: 'center',
            width: 200,
            render: (h, params) => {
              return h('span', DateUtil.formatDate(new Date(params.row.endTime), 'yyyy-MM-dd hh:mm:ss'));
            }
          },
          {
            title: 'Job运行总时间',
            key: 'runTime',
            align: 'center',
            render: (h, params) => {
              return h('span', params.row.runTime + '秒');
            }
          },
          {
            title: 'Job执行结果',
            key: 'status',
            align: 'center',
            render: (h, params) => {
              let text;
              let textColor;
              switch (params.row.status) {
                case 'INPROGRESS' :
                  textColor = '#2b85e4';
                  text = '正在运行';
                  break;
                case 'SUCCESS' :
                  textColor = '#19be6b';
                  text = '运行成功';
                  break;
                case 'FAILED' :
                  textColor = '#ed3f14';
                  text = '运行失败';
                  break;
                default:
                  textColor = '#495060';
                  break;
              }
              return h('p', {
                style: {
                  color: textColor
                },
              }, text);
            }
          },
          {
            title: '错误信息',
            key: 'jobError',
            align: 'center',
            render: (h, params) => {
              return h('a', {
                props: {
                  type: 'success',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.showJobError(params.row.jobError);
                  }
                }
              }, '查看');
            }
          },
        ]
      }
    },
    methods: {
      init() {
        this.status = 'ALL';
        this.getJobRunResultByStatus();
      },
      getJobRunResultByStatus() {
        const self = this;
        this.jobRunResultTableLoading = true;
        let params = {
          status: this.status,
          page: this.pageInfo.pageNum || 1,
          size: this.pageInfo.pageSize || 10
        };
        this.$http.get('/job/run/result/status', params).then((res) => {
          if (res.code === 200) {
            self.jobRunResultData = res.data.list;
            self.pageInfo.total = res.data.total;
          } else {
            self.$Message.error('job运行结果数据获取失败！错误代码：' + res.data.code);
          }
          self.jobRunResultTableLoading = false;
        });
      },
      changePage(currentPage) {
        this.pageInfo.pageNum = currentPage;
        this.getJobRunResultByStatus();
      },
      changePageSize(pageSize) {
        this.pageInfo.pageSize = pageSize;
        this.getJobRunResultByStatus();
      },
      searchByJobStatus() {
        if (this.status) {
          this.getJobRunResultByStatus();
        }
      },
      showJobError(jobError) {
        if (jobError) {
          this.jobErrorContent = jobError;
        } else {
          this.jobErrorContent = '暂无错误信息';
        }
        this.jobErrorModal = true;
      }
    },
    created() {
      this.init();
    }
  }
</script>
