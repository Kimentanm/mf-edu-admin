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
                           icon="ios-search" placeholder="请输入用户名..." style="width: 200px" @on-enter="reloadList"/>
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
            <Form ref='teacherForm' :model='teacherForm' :rules='teacherFormRule' :label-width='90'>
                <FormItem label='用户名' prop='userName'>
                    <Input v-model='teacherForm.userName' :maxlength=50 placeholder='请输入用户名' style="width: 550px;"/>
                </FormItem>
                <FormItem label='姓名' prop='realName'>
                    <Input v-model='teacherForm.realName' :maxlength=50 placeholder='请输入真实姓名' style="width: 550px;"/>
                </FormItem>
                <FormItem label='性别' prop='gender'>
                    <i-select placeholder="请选择性别" :autosize='{minRows: 2,maxRows: 5}'
                              :maxlength=500 style="width: 550px;" v-model='teacherForm.gender'>
                        <i-option :value="0">男</i-option>
                        <i-option :value="1">女</i-option>
                    </i-select>
                </FormItem>
                <FormItem label='密码' prop='password' v-if="isShow">
                    <Input type="password" v-model='teacherForm.password' :maxlength=500 style="width: 550px;"
                           :autosize='{minRows: 2,maxRows: 5}' placeholder='请输入...'/>
                </FormItem>
                <FormItem label='确认密码' prop='pwdCheck' v-if="isShow">
                    <Input type="password" :maxlength=500 style="width: 550px;" v-model='teacherForm.pwdCheck'
                           :autosize='{minRows: 2,maxRows: 5}' placeholder='请输入...'/>
                </FormItem>
                <FormItem label='工作号码' prop='officePhone'>
                    <Input v-model='teacherForm.officePhone' :maxlength=500 style="width: 550px;"
                           :autosize='{minRows: 2,maxRows: 5}' placeholder='请输入...'/>
                </FormItem>
                <FormItem label='电话号码' prop='mobilePhone'>
                    <Input v-model='teacherForm.mobilePhone' :maxlength=500 style="width: 550px;"
                           :autosize='{minRows: 2,maxRows: 5}' placeholder='请输入...'/>
                </FormItem>
                <FormItem label='邮箱' prop='email'>
                    <Input v-model='teacherForm.email' :maxlength=500 style="width: 550px;"
                           :autosize='{minRows: 2,maxRows: 5}' placeholder='请输入...'/>
                </FormItem>
                <FormItem label="头像:" prop='imageUrl' style="margin-top: 25px">
                    <div>
                        <div class="margin-top-10  margin-top-10Again" v-show="fileChoose">
                        <img :src="teacherForm.imageUrl" class="imgShow"/>
                        </div>
                        <div>
                        <div class="fileInput">
                            <input type="file" accept="image/png, image/jpeg, image/gif, image/jpg"
                                @change="handleChange" id="fileinput"/>
                            <span>选择图片</span>
                        </div>
                        </div>
                    </div>
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
                <span>删除教师</span>
            </p>
            <div style="text-align:center">
                <p>删除该教师，将无法恢复！</p>
                <p>是否删除?</p>
            </div>
            <div slot="footer">
                <Button type="error" size="large" long :loading="isDeleting" @click="deleteItem">删除</Button>
            </div>
        </Modal>
        <Modal v-model="showCropedImage">
            <div class="cropperAgain">
                <vueCropper
                    ref="cropper"
                    :img="cut.Img"
                    :outputSize="cut.size"
                    :outputType="cut.outputType"
                    :autoCrop="cut.autoCrop"
                    :autoCropWidth="cut.autoCropWidth"
                    :autoCropHeight="cut.autoCropHeight"
                >
                </vueCropper>
            </div>
            <div slot="footer">
                <Button @click="cancelReset()" style="margin-left: 8px">取消</Button>
                <Button type="primary" icon="crop" @click="handleCrop" class="pictureButton">裁剪</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
import { cropperPicture } from '../../libs/util';
import VueCropper from 'vue-cropper'
    export default {
        components: { VueCropper },
        name: 'teacher',
        data() {
            const pwdCheckValidate = (rule, value, callback) => {
                if (this.teacherForm.password != '' && value == '') {
                    callback(new Error('确认密码不能为空'));
                } else if (this.teacherForm.password != value) {
                    callback(new Error('新密码和确认密码应相同'));
                } else {
                    callback();
                }
            };
            const userNameCheckValidate = (rule, value, callback) => {
                if (value) {
                    if (value.indexOf(":") !== -1) {
                        callback(new Error('用户名中不能包含特殊字符'));
                    } else {
                        callback();
                    }
                } else {
                    callback(new Error('用户名不能为空'));
                }
            };
            return {
                searchModel: undefined,
                teacherForm: {
                    userName: undefined,
                    realName: undefined,
                    password: undefined,
                    mobilePhone: undefined,
                    officePhone: undefined,
                    gender: undefined,
                    email: undefined,
                    pwdCheck: undefined,
                },

                teacherFormRule: {
                    userName: [
                        {required: true, validator: userNameCheckValidate, trigger: 'blur'},
                        {type: 'string', max: 255, message: 'Code最多255字符', trigger: 'blur'},
                    ],
                    realName: [
                        {required: true, message: '姓名不能为空.', trigger: 'blur'},
                        {type: 'string', max: 255, message: 'Code最多255字符', trigger: 'blur'},
                    ],
                    gender: [
                        {required: true, type: 'number', message: '性别不能为空.', trigger: 'change'},
                    ],
                    password: [
                        {required: true, message: '密码不能为空.', trigger: 'blur'},
                        {type: 'string', max: 255, message: '密码最多255字符', trigger: 'blur'},
                    ],
                    pwdCheck: [
                        {required: true, validator: pwdCheckValidate, trigger: 'blur'}
                    ]
                },
                cut: {
                size: 1,
                Img: '',
                outputType: 'jpeg || png || web',
                autoCrop: true,
                autoCropWidth: 200,
                autoCropHeight: 200
                },
                showCropedImage: false,
                fileChoose: false,
                isShow: true,
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
                    {type: 'index', title: '序号', width: 60, align: 'center'},
                    {title: '用户名', key: 'userName', align: 'center'},
                    {title: '姓名', key: 'realName', align: 'center'},
                    {
                        title: '性别', key: 'gender',
                        render: (h, params) => {
                            if (params.row.gender == '0')
                                return h('div', [
                                    h('Icon', {
                                        props: {
                                            type: 'ios-man'
                                        }
                                    }),
                                    h('strong', '男')
                                ]);
                            if (params.row.gender == '1')
                                return h('div', [
                                    h('Icon', {
                                        props: {
                                            type: 'ios-woman'
                                        }
                                    }),
                                    h('strong', '女')
                                ]);
                        }, align: 'center'
                    },
                    {title: '工作号码', key: 'officePhone', align: 'center'},
                    {title: '电话号码', key: 'mobilePhone', align: 'center'},
                    {title: '邮箱', key: 'email', align: 'center'},
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
                    name: this.searchModel,
                };
                this.$http.get('/teacher/name', params).then((res) => {
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

            getMenuList() {
                const self = this;
                this.$http.get('/menu/listMenuBO').then((res) => {
                    if (res.code === 200) {
                        self.originMenu = res.data;
                    }
                })
            },

            getCheckMenuList(list) {
                this.teacherForm.menuIds = [];
                if (list) {
                    list.forEach(item => {
                        this.teacherForm.menuIds.push(item.id);
                    })
                }
            },
            reloadList() {
                this.pageInfo.pageNum = 1;
                this.getList();
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
                this.isShow = true;
                this.fileChoose = false;
                this.isSaving = false;
                this.$refs.teacherForm.resetFields();
                this.modalTitle = '添加教师信息';
                this.teacherForm = {
                    userName: undefined,
                    realName: undefined,
                    password: undefined,
                    mobilePhone: undefined,
                    officePhone: undefined,
                    gender: undefined,
                    email: undefined,
                };
                this.editModal = true;
            },

            edit(index) {
                this.isShow = false,
                    this.isSaving = false;
                const self = this;
                this.$refs.teacherForm.resetFields();
                this.modalTitle = '编辑教师信息';
                this.editModal = true;
                this.$http.get('/teacher/' + self.data[index].id, {}).then((res) => {
                    if (res.code === 200) {
                        self.teacherForm = res.data;
                        if (self.teacherForm.imageUrl) {
                        self.fileChoose = true;
                        }
                        if (self.teacherForm.menuIds && self.teacherForm.menuIds.length > 0) {
                            for (let key in self.originMenu) {
                                self.originMenu[key].forEach(item => {
                                    item.checked = false;
                                    for (let i = 0; i < self.teacherForm.menuIds.length; i++) {
                                        if (item.id === self.teacherForm.menuIds[i]) {
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
                this.$refs.teacherForm.validate((valid) => {
                    if (valid) {
                        if (this.teacherForm.id) {
                            this.$http.put('/teacher', self.teacherForm).then((res) => {
                                if (res.code === 200) {
                                    self.isSaving = false;
                                    self.editModal = false;
                                    self.reloadList();
                                    self.$Message.success('更新成功！');
                                } else if (res.code === 800) {
                                    self.$Message.error('当前教师用户名已存在');
                                } else {
                                    self.$Message.error('更新失败！' + res.code);
                                }
                            })
                        } else {
                            this.$http.post('/teacher', self.teacherForm).then((res) => {
                                if (res.code === 200) {
                                    self.isSaving = false;
                                    self.editModal = false;
                                    self.reloadList();
                                    self.$Message.success('添加成功！');
                                } else if (res.code === 800) {
                                    self.$Message.error('当前教师用户名已存在');
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
                handleChange(e) {
                this.showCropedImage = true;
                let reader = cropperPicture(e);
                console.log(reader);
                reader.onload = (event) => {
                let data = event.target.result;
                reader.onload = null;
                this.cut.Img = data;
                this.clear();
                };
            },
            handleCrop() {
                this.showCropedImage = false;
                let self = this;
                // var fd = new FormData();
                // 获取截图的blob数据
                this.$refs.cropper.getCropBlob((data) => {
                var fd = new FormData();
                fd.append('picturefile', data, 'cropped.png');
                const config = {
                    headers: { 'Content-Type': 'multipart/form-data' }
                };
                this.$http.post('/common/file/upload', fd, config).then(resp => {
                    if (resp.code === 200) {
                    self.teacherForm.imageUrl = resp.data.location;
                    self.fileChoose = true;
                    }
                }).catch(err => {
                    console.log(err)
                });
                })
            },
            remove(index) {
                this.deleteModal = true;
                this.deleteIndex = index;
                this.isDeleting = false;
            },
            deleteItem() {
                this.isDeleting = true;
                const self = this;
                this.$http.delete('/teacher/' + self.data[self.deleteIndex].id, {}).then((res) => {
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
