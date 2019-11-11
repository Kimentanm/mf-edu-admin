<style lang="less">
    @import './login.less';

    .login-card > .ivu-card-body {
        padding: 0px;
    }

    .login-button {
        height: 45px;
        text-align: center;
        background-color: #19be6b;
        display: flex;
        align-items: center;

        &-text {
            font-size: 20px;
            color: #FFFFFF;
            margin: 0 auto;
        }
    }

</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <div class="login-con">
            <p style="font-size: 35px;color: #FFF">在线一对一后台管理平台</p>
            <Card class="login-card" :bordered="false" style="margin: 40px auto; border-radius: 3%;width: 300px;">
                <p slot="title">欢迎登录</p>
                <div class="form-con">
                    <Form ref="loginForm" :model="form" :rules="rules" style="padding: 16px 16px 0 16px">
                        <FormItem prop="username">
                            <Input v-model="form.username" placeholder="请输入用户名">
                            <span slot="prepend">
                                    <Icon :size="16" type="ios-person"/>
                            </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="password">
                            <Input type="password" v-model="form.password" placeholder="请输入密码">
                            <span slot="prepend">
                                    <Icon :size="14" type="ios-lock"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                    </Form>
                    <a>
                        <div @click="handleSubmit" slot="footer" class="login-button">
                            <span class="login-button-text">{{loginButtonTest}}</span>
                        </div>
                    </a>
                </div>
            </Card>
        </div>

    </div>
</template>

<script>
    import {mapActions} from 'vuex'

    export default {
        data() {
            return {
                form: {
                    username: '',
                    password: ''
                },
                loginButtonTest: '登录',
                registerButtonText: '注册',
                rules: {
                    username: [
                        {required: true, message: '账号不能为空', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '密码不能为空', trigger: 'blur'}
                    ]
                },
                // 注册
                registerModal: false,
                userForm: {
                    loginName: undefined,
                    name: undefined,
                    password: undefined,
                    mobile: undefined,
                    email: undefined,
                },
                userFormRule: {
                    loginName: [
                        {required: true, message: '登录名不能为空.', trigger: 'blur'},
                        {type: 'string', max: 30, message: '登录名最多30字符', trigger: 'blur'},
                    ],
                    name:
                        [
                            {required: true, message: '名称不能为空.', trigger: 'blur'},
                            {type: 'string', max: 50, message: '名称最多50字符', trigger: 'blur'},
                        ],
                    password:
                        [
                            {required: true, message: '密码不能为空.', trigger: 'blur'},
                            {min: 6, message: '请至少输入6个字符', trigger: 'blur'},
                            {max: 32, message: '最多输入32个字符', trigger: 'blur'}
                        ],
                    mobile: [
                        {type: 'string', max: 30, message: '联系方式必须为数字', trigger: 'blur'}
                    ],
                    email: [
                        {type: 'email', message: '电子邮箱的格式不正确', trigger: 'blur'}
                    ],
                },
            };
        },
        methods: {
            ...mapActions([
                'handleLogin',
                'getUserInfo'
            ]),
            handleSubmit() {
                this.$refs.loginForm.validate((valid) => {
                    if (valid) {
                        this.loginButtonTest = "正在登录";
                        this.handleLogin(this.form).then(res => {
                            this.getUserInfo().then(res => {
                                this.loginButtonTest = "登录成功";
                                this.$router.push({
                                    name: 'home'
                                })
                            }).catch(err => {
                                this.loginButtonTest = "登录";
                                this.$Message.error("获取当前用户基本信息失败");
                            })
                        }).catch(err => {
                            this.loginButtonTest = "登录";
                            this.$Message.error("登录名或密码错误");
                        })
                    }
                });
            },
            handleReset() {
                this.registerModal = false;
                this.userForm = {
                    loginName: undefined,
                    name: undefined,
                    password: undefined,
                    mobile: undefined,
                    email: undefined
                };
                this.$refs.userForm.resetFields();
            },
        },
    };
</script>

<style>

</style>
