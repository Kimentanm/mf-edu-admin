<style lang="less">
    @import "../../styles/common.less";
    @import "./newsDetails.less";
    @import "./iphone.less";
</style>

<template>
    <div class="news-detail">
        <div class="smart-crud-container" style="float: left">
            <div v-if=" this.$route.params.news ==  null"><H3>新建新闻内容</H3></div>
            <div v-else><H3>编辑新闻内容</H3></div>
            <br>
            <Card style="width: 600px;height: 100%;">
                <Form ref='newsForm' :model='newsForm' :rules='newsFormRule' :label-width='80'>
                    <FormItem label='新闻标题:' prop='title'>
                        <Input v-model='newsForm.title' placeholder='请输入主题' style="width: 250px"/>
                    </FormItem>
                    <FormItem label='封面图片: ' prop='imageUrl'>
                        <div class="margin-top-10  margin-top-10Again" v-show="fileChoose" style="width:665px">
                            <img :src="newsForm.imageUrl" class="imgShow">
                        </div>
                        <div class="fileInput">
                            <input type="file" accept="image/png, image/jpeg, image/gif, image/jpg"
                                   @change="handleChange"
                                   id="fileupload"/>选择图片
                        </div>
                    </FormItem>
                    <FormItem label='新闻简介:' prop='summary' style="margin-top:50px;">
                        <Input v-model='newsForm.summary' :maxlength=500 type="textarea" :rows="4"
                               placeholder='请输入简介' style="width:450px"/>
                    </FormItem>
                    <FormItem label='新闻详情:' prop='detail'>
                        <tinymce id="tinymceEditer" v-model="newsForm.detail" style="width:450px">
                        </tinymce>
                    </FormItem>
                    <FormItem label='所属类别' prop='functionCode'>
                        <code-select @emitedCodes="getFunctionCode($event)" codeType="newsFunCode">
                            <Select v-model='newsForm.functionCode' filterable>
                                <Option v-for="item in funcCodeList" :key="item.id" :value="item.code"
                                        :label="item.name"></Option>
                            </Select>
                        </code-select>
                    </FormItem>
                    <!--<FormItem label="是否推荐" prop="recommendInd">-->
                    <!--<Checkbox v-model="single">（勾选推荐）</Checkbox>-->
                    <!--</FormItem>-->
                    <!--<FormItem label='状态:' prop='status'>-->
                    <!--<code-select @emitedCodes="getContentStatusList($event)" codeType="contentStatus">-->
                    <!--<Select v-model='newsForm.status' filterable>-->
                    <!--<Option v-for="item in contentStatusList" :key="item.id" :value="item.code"-->
                    <!--:label="item.name"></Option>-->
                    <!--</Select>-->
                    <!--</code-select>-->
                    <!--</FormItem>-->
                </Form>
                <div style="text-align:center">
                    <Button type="default" @click="handleReset">取消</Button>
                    <Button type="primary" style="margin-left:20px" :loading="isSaving" @click="handleSubmit">保存
                    </Button>
                </div>

                <Modal v-model="option1.showCropedImage">
                    <p slot="header">裁剪图片</p>
                    <div class="cropperAgain">
                        <vueCropper
                                ref="cropper"
                                :img="cut.Img"
                                :outputSize="cut.size"
                                :outputType="cut.outputType"
                                :autoCrop="cut.autoCrop"
                                :autoCropWidth="cut.autoCropWidth"
                                :autoCropHeight="cut.autoCropHeight"
                                :fixed="cut.fixed"
                                :canScale="cut.canScale"
                                :fixedNumber="cut.fixedNumber"
                        >
                        </vueCropper>
                    </div>
                    <div slot="footer">
                        <Button type="primary" @click="handleCrop" icon="crop" class="pictureButton">裁剪</Button>
                    </div>
                </Modal>
            </Card>
        </div>
        <div style="margin-right: 50px;margin-left: 650px;padding-top: 24px;">
            <br>
            <div class="iphone-box" style="top: 124px;">
                <div class="iphone-head"></div>
                <div class="iphone-container">
                    <div class="iphone-navbar">
                        <div id="news-news" class="iphone-context">
                            <div v-model="newsForm">
                                <h3 class="news-head" v-model="newsForm.title">{{ newsForm.title }}</h3>
                                <div class="news-author" v-show="newsForm.title">
                                    <span class="news-author-name">管理员</span>
                                    <span class="news-author-time">今天</span>
                                </div>
                                <br>
                                <p class="news-body" v-html="newsForm.detail">{{ newsForm.detail }}</p>
                                <p class="modify-tip" v-show="newsForm.detail">文章已于{{DateUtil.formatDate(new Date(), 'yyyy-MM-dd')}}修改</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import vueCropper from 'vue-cropper';
  import {cropperPicture} from '../../libs/util';
  import tinymce from '@/view/shared/tinymce.vue';
  import CodeSelect from '@/view/shared/code/CodeSelect.vue';
  import DateUtil from '../../libs/DateUtil'

  export default {
    components: {CodeSelect, tinymce, vueCropper},
    data() {
      return {
        cut: {
          size: 1,
          Img: '',
          outputType: 'jpeg || png || web',
          autoCrop: true,
          autoCropWidth: 300,
          autoCropHeight: 300,
          canScale: true,
          fixed: true,
          fixedNumber: [1, 1]
        },
        option1: {
          showCropedImage: false,
          cropedImg: ''
        },
        newsForm: {
          title: undefined,
          summary: undefined,
          publishDate: undefined,
          imageUrl: undefined,
          detail: undefined,
          status: undefined,
          recommendInd: undefined,
          functionCode: undefined,
        },
        newsFormRule: {
          title: [
            {required: true, message: '标题不能为空.', trigger: 'blur'},],
          summary: [
            {required: true, message: '概括不能为空.', trigger: 'blur'},
            {type: 'string', max: 255, message: '概括最多255字符', trigger: 'blur'},],
          detail: [
            {required: true, message: '详情不能为空.', trigger: 'blur'},],
          imageUrl: [
            {type: 'string', max: 500, message: '图片最多255字符', trigger: 'blur'},],
          functionCode: [
            {required: true, message: '从属资讯不能为空', trigger: 'blur'},],
        },
        fileChoose: false,
        isSaving: false,
        editModal: true,
        single: false,
        news: undefined,
        contentStatusList: [],
        funcCodeList: [],
        newsContent: {},
        DateUtil: DateUtil
      }
    },
    watch: {
      'newsForm.detail'(value) {
        this.newsContent.scrollTop = this.newsContent.scrollHeight - this.newsContent.clientHeight;
      }
    },
    methods: {
      getContentStatusList($event) {
        this.contentStatusList = $event.data;
      },
      getFunctionCode($event) {
        this.funcCodeList = $event.data;
      },
      handleChange(e) {
        this.option1.showCropedImage = true;
        let reader = cropperPicture(e);
        reader.onload = (event) => {
          let data = event.target.result;
          reader.onload = null;
          this.cut.Img = data;
        }
      },
      handleCrop() {
        this.option1.showCropedImage = false;
        this.fileChoose = true;
        let self = this;
        var fd = new FormData();
        this.$refs.cropper.getCropBlob((data) => {
          fd.append("picturefile", data, "cropped.png");
          const config = {
            headers: {'Content-Type': 'multipart/form-data'}
          };
          this.$http.post('/common/file/upload', fd, config).then(resp => {
            if (resp.code === 200) {
              self.newsForm.imageUrl = resp.data.location;
              this.cut.Img = resp.data.data.location;
            }
          }).catch(err => {
            console.log(err)
          });
        })
      },
      add() {
        this.isSaving = false;
        this.newsForm = {
          title: undefined,
          summary: undefined,
          imageUrl: undefined,
          detail: undefined,
          recommendInd: undefined,
          status: undefined,
          funcCode: undefined,
          publishDate: undefined,
        };
        this.fileChoose = false;
        this.single = false;
      },
      edit(index) {
        this.isSaving = false;
        this.fileChoose = true;
        var self = this;
        this.$http.get('/news/' + index, {}).then((res) => {
          if (res.code === 200) {
            self.newsForm = res.data;
            self.newsForm.status = self.newsForm.status.toString();
            if (this.newsForm.recommendInd === 1) {
              this.single = true;
            } else {
              this.single = false;
            }
          } else {
            self.$Message.error('获取news失败！' + res.data.code);
          }
        });
      },
      handleSubmit() {
        this.isSaving = true;
        let self = this;
        if (self.single === true) {
          self.newsForm.recommendInd = 1;
        } else {
          self.newsForm.recommendInd = 0;
        }
        this.$refs.newsForm.validate((valid) => {
          if (valid) {
            if (this.newsForm.id) {
              this.$http.put('/news', self.newsForm).then((res) => {
                if (res.code === 200) {
                  self.isSaving = false;
                  this.$router.push({name: 'news-index'});
                  self.$Message.success('更新成功！');
                } else {
                  self.$Message.error('更新失败！' + res.data.code);
                  self.isSaving = false;
                }
              });
            } else {
              this.$http.post('/news', self.newsForm).then((res) => {
                if (res.code === 200) {
                  self.isSaving = false;
                  this.$router.push({name: 'news-index'});
                  self.$Message.success('添加成功！');
                } else {
                  self.isSaving = false;
                  self.$Message.error('添加失败！' + res.data.code);

                }
              })
            }
          } else {
            self.isSaving = false;
            self.$Message.error('表单验证失败！');
          }
        });
      },

      handleReset() {
        this.single = false;
        this.fileChoose = false;
        this.$router.go(-1);
      },

    },
    mounted() {
      this.newsContent = document.getElementById('news-news');
    },
    created() {
      if (this.$route.params.contentId) {
        this.edit(this.$route.params.contentId);
      }
    },
  }
</script>