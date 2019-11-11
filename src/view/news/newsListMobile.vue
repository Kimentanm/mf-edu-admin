<style lang="less">
    body {
        font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue",
        "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI",
        "Microsoft YaHei", Arial, sans-serif;
    }

    .newsListMobile {
        height: 100%;
        width: 100%;
        background-color: #fff;
        padding: 0 16px 12px;
        position: relative;
        overflow-y: auto;
        overflow-x: hidden;

        &-cell {
            height: 100px;

            &-left {
                height: 100%;
                width: 80%;
                display: inline-block;
                vertical-align: middle;

                div {
                    height: 100%;width: 100%;
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    font-weight: bold;
                    font-size: 16px;
                }

            }

            &-right {
                height: 100%;
                width: 20%;
                display: inline-block;
                vertical-align: middle;
                position: relative;

                img {
                    width: 60px;
                    height: 60px;
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                }
            }
        }
    }
</style>
<template>
    <div class="newsListMobile">
        <my-tabs sticky @click="getTabValue">
            <my-tab v-for="(item, index) in funcCodeList" :key="index" :title="item.name">
                <my-list v-model="loading"
                         :finished="finished"
                         finished-text="没有更多了"
                         @load="reloadList">
                    <my-cell v-for="(item, index) in data" :key="index" @click="gotoNewsDetail(item.id)"
                             class="newsListMobile-cell">
                        <div class="newsListMobile-cell-left">
                            <div>
                                <span>
                                    {{item.title}}
                                </span>
                            </div>
                        </div>
                        <div class="newsListMobile-cell-right">
                            <img v-lazy="item.imageUrl"/>
                        </div>
                    </my-cell>
                </my-list>
            </my-tab>
        </my-tabs>
    </div>
</template>

<script>
  import constants from "@/view/shared/constants.js"
  import {Tabs, Tab, List, Cell, Toast} from 'vant';

  export default {
    name: "newsListMobile",
    components: {
      MyTabs: Tabs,
      MyTab: Tab,
      MyList: List,
      MyCell: Cell
    },
    data() {
      return {
        selected: '',
        funcCodeList: [],
        pageInfo: {
          pageNum: 1
        },
        data: [],
        loading: false,
        finished: false
      }
    },
    methods: {
      getList() {
        this.loading = true;
        const params = {
          page: this.pageInfo.pageNum || 1,
          size: this.pageInfo.pageSize || 10,
          functionCode: this.selected || this.funcCodeList[0].code
        };
        this.$http.get('/news/function/code/published', params).then((res) => {
          let result = [];
          if (res.code === 200) {
            result = res.data.list;
            this.data = result;
          } else {
            Toast('获取数据失败！');
          }
          this.loading = false;
          if (result.length < 10) {
            this.finished = true;
          }
        })
      },
      getFunctionCodeList() {
        Toast.loading({
          duration: 0,       // 持续展示 toast
          forbidClick: true, // 禁用背景点击
          mask: true,
          message: '加载中...'
        });
        this.$http.get('/code/type', {type: constants.codeType.newsFunCode}).then((res) => {
          if (res.code === 200) {
            this.funcCodeList = res.data;
            this.getList();
          } else {
            this.$Message.error('获取数据失败！' + res.code);
          }
          Toast.clear();
        })
      },
      getTabValue(val) {
        this.selected = this.funcCodeList[val].code;
        this.getList();
      },
      reloadList() {
        this.pageInfo.pageNum++;
        this.getList();
        console.log("再次加载")
      },
      gotoNewsDetail(newsId) {
        this.$router.push({
          name: 'newsView',
          params: {
            newsId: newsId
          }
        })
      }
    },
    created() {
      this.getFunctionCodeList()
    },
  }
</script>