<style lang="less">
    body {
        font-family: -apple-system-font,BlinkMacSystemFont,"Helvetica Neue",
        "PingFang SC","Hiragino Sans GB","Microsoft YaHei UI",
        "Microsoft YaHei",Arial,sans-serif;
    }

    .news-mobile {
        height: 100%;
        width: 100%;
        background-color: #fff;
        padding: 10px 16px 12px;
        position: relative;
        overflow-y: auto;
        overflow-x: hidden;

        p {
            font-size: 16px;
        }

        img {
            height: auto;
            width: 100%;
        }

        .news-head {
            width: 100%;
            font-size: 22px;
            line-height: 1.4;
            margin-bottom: 14px;
            font-weight: 500;
            color: #333;
        }

        .news-author {
            font-size: 15px;
            color: #576b95;
            margin-bottom: 22px;
            line-height: 20px;
            word-wrap: break-word;
            word-break: break-all;

            &-name {
                color: #5b6a91;
            }

            &-time {
                margin-left: 10px;
                color: #b3b3b3;
            }
        }

        .news-body {
            width: 100%;
            margin-top: 5px;
            font-size: 12px;
            word-wrap: break-word;
            word-break: break-all;
        }

        .modify-tip {
            margin-top: 16px;
            text-align: left;
            font-size: 15px;
            color: rgba(0,0,0,0.3);
        }

        .no-news {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;

            p {
                margin: 0 auto;
                font-size: 22px;
            }
        }
    }
</style>
<template>
    <div class="news-mobile">
        <!--<my-nav-bar-->
                <!--title=""-->
                <!--left-text="返回"-->
                <!--right-text="· · ·"-->
                <!--left-arrow-->
                <!--@click-left="returnNewsList" style="margin-left: -16px;margin-right: -10px"></my-nav-bar>-->
        <div v-if="newsShow">
            <h2 class="news-head">{{ currentNewsForm.title }}</h2>
            <div class="news-author">
                <span class="news-author-name">{{currentNewsForm.user ? currentNewsForm.user.name : '佚名'}}</span>
                <span class="news-author-time">{{currentNewsForm.publishDate.split(' ')[0]}}</span>
            </div>
            <p class="news-body" v-html="currentNewsForm.detail">{{ currentNewsForm.detail }}</p>
            <p class="modify-tip">文章已于{{currentNewsForm.lastModifiedDate.split(' ')[0]}}修改</p>
        </div>
        <div class="no-news" v-else>
            <p>当前新闻没找到哦</p>
        </div>
    </div>
</template>

<script>
  import { Toast, NavBar } from 'vant';
  export default {
    name: "newsMobile",
    components: {
      MyNavBar: NavBar
    },
    data() {
      return {
        newsId: 0,
        currentNewsForm: {
          user: {}
        },
        newsShow: false
      }
    },
    methods: {
      init() {
        Toast.loading({
          duration: 0,       // 持续展示 toast
          forbidClick: true, // 禁用背景点击
          mask: true,
          message: '加载中...'
        });
        this.$http.get('/news/' + this.newsId, {}).then((res) => {
          if (res.code === 200) {
            this.currentNewsForm = res.data;
            this.newsShow = true;
            if (!this.currentNewsForm.status) {
              this.newsShow = false;
            }
          } else {
            this.$Message.error('获取新闻失败！' + res.data.code);
          }
          Toast.clear();
        });
      },
      returnNewsList() {
        this.$router.go(-1);
      }
    },
    mounted() {
      this.newsId = this.$route.params.newsId;
      this.init();
    }
  }
</script>