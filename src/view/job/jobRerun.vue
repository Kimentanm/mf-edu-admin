<style lang="less">
  @import '../../styles/common.less';
  @import './job.less';
</style>

<template>
  <div class="jobRerun">
    <Row>
      <Col span="24">
      <div class="top-button">
        <Button style="margin-top: 12px;margin-bottom: 18px" type="primary" @click="addJobRerun"
                icon="plus-round">
          新增Job重跑
        </Button>
      </div>
      <div style="margin-bottom: 18px;margin-left:10px">
        <label style="display: inline-block;">状态：</label>
        <RadioGroup v-model="status">
          <Radio label="ALL:ALL">全部</Radio>
          <Radio label="INPROGRESS:INPROGRESS">正在运行</Radio>
          <Radio label="COMPLETED:SUCCESS">运行成功</Radio>
          <Radio label="COMPLETED:ERROR">运行失败</Radio>
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
        <Table stripe :data="jobRerunResultData" :columns="jobRerunResultColumns"
               :loading="jobRerunResultTableLoading"></Table>
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

    <!--Job重跑弹框-->
    <Modal v-model="jobRerunModal"
           :title="modalTitle"
           width="500"
           :styles="{top: '20px'}">
      <Form :label-width='120'>
        <FormItem label="Job名称：">
          <Select v-model="jobId"
                  style="width: 260px" @on-change="getJob" filterable>
            <Option v-for="item in jobList" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <FormItem label="开始时间：">
          <DatePicker v-model="startDate" type="date" placeholder="请选择开始日期"
                      :style="{width: startTimeSeen ? '130px' : '270px'}" :clearable="false"></DatePicker>
          <TimePicker v-model="startTime" v-show="startTimeSeen" type="time" placeholder="请选择开始时间"
                      style="width: 130px"></TimePicker>
        </FormItem>
        <FormItem label="结束时间：">
          <DatePicker v-model="endDate" type="date" placeholder="请选择结束日期"
                      :style="{width: endTimeSeen ? '130px' : '270px'}" :clearable="false"></DatePicker>
          <TimePicker v-model="endTime" v-show="endTimeSeen" type="time" placeholder="请选择结束时间"
                      style="width: 130px"></TimePicker>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="handleReset()" style="margin-left: 8px">取消</Button>
        <Button icon="ios-speedometer"
                :disabled="jobId === '' || projId === '' || startDate === '' || endDate === ''"
                :loading="loading" type="primary" @click="rerunJob">重跑
        </Button>
      </div>
      <Spin fix v-if="rerunModalLoading">
        <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
        <div>加载中...</div>
      </Spin>
    </Modal>

    <!--查看错误信息弹框-->
    <Modal v-model="jobErrorModal"
           title="错误信息"
           width="500"
           style="text-align: center"
           :styles="{top: '20px'}">
      <p v-for="item in jobErrorContent" :key="item">{{item}}</p>
    </Modal>
  </div>
</template>

<script>
  import DateUtil from '../../libs/DateUtil';
  //  import Page from "iview/src/components/page/page";

  export default {
//    components: {Page},
    name: 'job-rerun',
    data() {
      return {
        status: '',
        jobId: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        startTimeSeen: true,
        endTimeSeen: true,
        loading: false,
        jobRerunResultTableLoading: false,
        rerunModalLoading: false,
        jobList: [],
        pageInfo: {},
        modalTitle: '',
        jobRerunModal: false,
        jobRerunResultData: [],
        jobErrorContent: [],
        jobErrorModal: false,
        jobRerunResultColumns: [
          {
            type: 'index',
            title: '序号',
            width: 65,
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
            title: '重跑开始时间',
            align: 'center',
            key: 'startTime',
            render: (h, params) => {
              return h('span', DateUtil.formatDate(new Date(params.row.startTime), 'yyyy-MM-dd hh:mm:ss'));
            }
          },
          {
            title: '重跑结束时间',
            align: 'center',
            key: 'endTime',
            render: (h, params) => {
              return h('span', DateUtil.formatDate(new Date(params.row.endTime), 'yyyy-MM-dd hh:mm:ss'));
            }
          },
          {
            title: '运行时间',
            align: 'center',
            key: 'runTime',
            render: (h, params) => {
              return h('span', params.row.runTime ? params.row.runTime : '无');
            }
          },
          {
            title: 'Job执行进度',
            key: 'percent',
            align: 'center',
            render: (h, params) => {
              let text;
              let textColor;
              if (params.row.status === 'INPROGRESS') {
                text = '正在运行';
                textColor = '#2b85e4';
              } else if (params.row.status === 'COMPLETED') {
                switch (params.row.jobItemStatus) {
                  case 'SUCCESS' :
                    textColor = '#19be6b';
                    text = '运行成功';
                    break;
                  case 'ERROR' :
                    textColor = '#ed3f14';
                    text = '运行失败';
                    break;
                  default:
                    textColor = '#495060';
                    break;
                }
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
              return h('Button', {
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
        this.status = 'ALL:ALL';
        this.getJobRerunResultByStatus();
      },
      getJobRerunResultByStatus() {
        const self = this;
        this.jobRerunResultTableLoading = true;
        let params = {
          status: this.status.split(':')[0],
          jobItemStatus: this.status.split(':')[1],
          page: this.pageInfo.pageNum || 1,
          size: this.pageInfo.pageSize || 10
        };
        this.jobRerunResultData = [];
        this.$http.get('/job/rerun/result/status', params).then((res) => {
          if (res.code === 200) {
            self.jobRerunResultData = res.data.list;
            self.pageInfo.total = res.data.total;
          } else {
            self.$Message.error('job重跑结果数据获取失败！错误代码：' + res.code);
          }
          self.jobRerunResultTableLoading = false;
        });
      },
      changePage(currentPage) {
        this.pageInfo.pageNum = currentPage;
        this.getJobRerunResultByStatus();
      },

      changePageSize(pageSize) {
        this.pageInfo.pageSize = pageSize;
        this.getJobRerunResultByStatus();
      },
      getJobList() {
        const self = this;
        this.$http.get('/job', {}).then((res) => {
          if (res.code === 200) {
            self.jobList = res.data.list;
          } else {
            self.$Message.error('job数据获取失败！' + res.code);
          }
          self.rerunModalLoading = false;
        });
      },
      getJob(value) {
        this.jobList.map(item => {
          if (item.id === value) {
            if (item.unit === 'd') {
              this.startTimeSeen = false;
              this.endTimeSeen = false;
              this.startTime = '';
              this.endTime = '';
            } else {
              this.startTimeSeen = true;
              this.endTimeSeen = true;
            }
          }
        });
      },
      rerunJob() {
        this.loading = true;
        const self = this;
        let params = {
          jobId: this.jobId,
          startTime: this.startTime ? DateUtil.formatDate(this.startDate, 'yyyy-MM-dd') + ' ' + DateUtil.formatDate(this.startTime, 'hh:mm:ss') : DateUtil.formatDate(this.startDate, 'yyyy-MM-dd hh:mm:ss'),
          endTime: this.endTime ? DateUtil.formatDate(this.endDate, 'yyyy-MM-dd') + ' ' + DateUtil.formatDate(this.endTime, 'hh:mm:ss') : DateUtil.formatDate(this.endDate, 'yyyy-MM-dd hh:mm:ss'),
        };
        if (DateUtil.isBefore(params.startTime, params.endTime) || DateUtil.isEquals(params.startTime, params.endTime)) {
          this.$http.get('/job/rerun/result/rerun', params).then(function (res) {
            if (res.code === 200) {
              self.$Message.success('Job已开始重跑');
              self.getJobRerunResultByStatus();
              self.handleReset();
            } else {
              self.$Message.error('Job重跑失败，错误代码：' + res.code);
            }
            self.loading = false;
          });
        } else {
          this.$Message.warning('开始时间和结束时间有误，请重新选择');
          this.loading = false;
        }
      },
      addJobRerun() {
        this.jobRerunModal = true;
        this.rerunModalLoading = true;
        this.jobId = '';
        this.modalTitle = '新增Job重跑';
        this.startDate = '';
        this.endDate = '';
        this.getJobList();
      },
      handleReset() {
        this.jobRerunModal = false;
        this.rerunModalLoading = false;
      },
      searchByJobStatus() {
        if (this.status) {
          this.getJobRerunResultByStatus();
        }
      },
      showJobError(jobError) {
        this.modalTitle = '错误信息';
        if (jobError) {
          this.jobErrorContent = JSON.parse(jobError);
        } else {
          this.jobErrorContent = ['暂无错误信息'];
        }
        this.jobErrorModal = true;
      }
    },
    created() {
      this.init();
    }
  }
</script>
