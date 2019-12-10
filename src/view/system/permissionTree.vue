<template>
<div>
    <Row :gutter="0">
        <Col span="16">
            <Card >
                <Tree :data="data5" :render="renderContent" ref="tree4"></Tree>
            </Card>
        </Col>
        <Col span="8">
            <Card style="width:500 px">
                <p slot="title">查看</p>
                <Form ref='permissionForm' :model='permissionForm' :label-width="80">
                    <FormItem label="节点类型" prop="gender" >
                        <RadioGroup v-model='permissionForm.reourceType'>
                            <Radio label="menu">菜单</Radio>
                            <Radio label="element">元素</Radio>
                            <Radio label="data">数据</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="权限编码" prop="passwd">
                        <Input type="text" v-model='permissionForm.permissionCode'></Input>
                    </FormItem>
                    <FormItem label="权限名称" prop="passwdCheck">
                        <Input type="text" v-model='permissionForm.permissionName'></Input>
                    </FormItem>
                    <FormItem label="权限描述" prop="age">
                        <Input type="textarea" v-model='permissionForm.description'></Input>
                    </FormItem>
                    <FormItem label="权限url" prop="age">
                        <Input type="textarea" v-model='permissionForm.resourceUrl'></Input>
                    </FormItem>
                    <FormItem label="显示序列" prop="passwdCheck">
                        <Input type="text" v-model='permissionForm.displaySort'></Input>
                    </FormItem>
                </Form>
                <Button type="success" long @click="save">保存</Button>
            </Card>
        </Col>
    </Row>
    </div>
</template>
<script>
    export default {
        name: "permission",
         data () {
            return {
                data:[],
                deleteModal: false,
                permissionForm: {
                    permissionCode: undefined,
                    permissionName: undefined,
                    description:undefined,
                    reourceType: undefined,
                    resourceUrl: undefined,
                    displaySort: undefined,
                    },
                permissionUpload:[],
                data5: [
                    {
                        title: '权限总菜单',
                        expand: true,
                        render: (h, { root, node, data }) => {
                            return h('span', {
                                style: {
                                    display: 'inline-block',
                                    width: '100%'
                                }
                            }, [
                                h('span', [
                                    h('Icon', {
                                        props: {
                                            type: 'ios-bowtie'
                                        },
                                        style: {
                                            marginRight: '8px'
                                        }
                                    }),
                                    h('span', data.title)
                                ]),
                                h('span', {
                                    style: {
                                        display: 'inline-block',
                                        float: 'right',
                                        marginRight: '32px'
                                    }
                                }, [
                                    h('Button', {
                                        props: Object.assign({}, this.buttonProps, {
                                            icon: 'ios-add',
                                            type: 'primary'
                                        }),
                                        style: {
                                            width: '64px'
                                        },
                                        on: {
                                            click: () => { this.append(data) }
                                        }
                                    })
                                ])
                            ]);
                        },
                        children: []
                    }
                ],
                buttonProps: {
                    type: 'default',
                    size: 'small',
                }
            }
        },
        methods: {
            renderContent (h, { root, node, data }) {
                return h('span', {
                    style: {
                        display: 'inline-block',
                        width: '100%'
                    }
                }, [
                    h('span', {
                        style: {
                            cursor: 'pointer'
                        },
                        on: {
                            click: () => {
                                this.choice(data.id);
                            }
                        },
                    },[
                        h('Icon', {
                            props: {
                                type: 'ios-paper-outline'
                            },
                            style: {
                                marginRight: '8px'
                            }
                        }),
                        h('span', data.title)
                    ]),
                    h('span', {
                        style: {
                            display: 'inline-block',
                            float: 'right',
                            marginRight: '32px'
                        }
                    }, [
                        h('Button', {
                            props: Object.assign({}, this.buttonProps, {
                                icon: 'ios-add'
                            }),
                            style: {
                                marginRight: '8px'
                            },
                            on: {
                                click: () => { this.append(data) }
                            }
                        }),
                        h('Button', {
                            props: Object.assign({}, this.buttonProps, {
                                icon: 'ios-remove'
                            }),
                            on: {
                                click: () => { this.remove(root, node, data) }
                            }
                        })
                    ])
                ]);
            },
            append (data) {
                this.permissionUpload= {
                    permissionCode: '0',
                    permissionName: '新建权限',
                    description: '新建权限',
                    reourceType: '',
                    resourceUrl: '',
                    displaySort: '',
                    parentPermissionId:data.id
                    }
                this.$http.post('/permission', this.permissionUpload).then(resp => {
                    if (resp.code === 200) {
                    this.getList();
                    }
                }).catch(err => {
                    console.log(err)
                });               
            },
            remove (root, node, data) {
                // this.deleteModal = true;
                this.$http.delete('/permission/' + data.id, {}).then((res) => {
                if (res.code === 200) {
                    this.getList();
                    this.$Message.success('删除成功！');
                } else {
                    this.$Message.error('删除失败！' + res.code);
                }
                })
            },
            getList(){
                const self = this;
                this.$http.get('/permission/permission-list').then((res) => {
                if (res.code === 200) {
                    this.data5[0].children=res.data.children;
                } else {
                    self.$Message.error('获取数据失败！' + res.code);
                }
                })
            },
            choice(treeId){
            this.$http.get('/permission/' + treeId, {}).then((res) => {
                this.permissionForm=res.data;
                })
            },
            deleteItem(){
                this.isDeleting = true;
                const self = this;
                this.$http.delete('/permission/' + self.data[self.deleteIndex].id, {}).then((res) => {
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
            save(){
                const self = this;
                if (this.permissionForm.id) {
                    console.log(this.permissionForm.id);
                this.$http.put('/permission', self.permissionForm).then((res) => {
                    console.log(self.permissionForm);
                if (res.code === 200) {
                  self.editModal = false;
                  self.getList();
                  self.$Message.success('更新成功！');
                } else if (res.code === 800) {
                  self.$Message.error('当前学生用户名已存在');
                }  else {
                  self.$Message.error('更新失败！' + res.code);
                }
              })
            } 
            }
        },
         created() {
            this.getList();
        },

    }
</script>

<style scoped>

</style>
