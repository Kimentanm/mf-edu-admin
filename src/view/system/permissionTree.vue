<template>
    <Row :gutter="0">
        <Col span="16">
             <Tree :data="data5" :render="renderContent"@on-check-change="choice" ref="tree4"></Tree>
        </Col>
        <Col span="8">
            <Card style="width:500 px">
                <p slot="title">查看</p>
                <Form :label-width="80">
                    <FormItem label="节点类型" prop="gender">
                        <RadioGroup>
                            <Radio label="male">菜单</Radio>
                            <Radio label="female">元素</Radio>
                            <Radio label="3223">数据</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="权限编码" prop="passwd">
                        <Input type="text" ></Input>
                    </FormItem>
                    <FormItem label="权限名称" prop="passwdCheck">
                        <Input type="text" ></Input>
                    </FormItem>
                    <FormItem label="权限描述" prop="age">
                        <Input type="textarea" ></Input>
                    </FormItem>
                    <FormItem label="权限url" prop="age">
                        <Input type="textarea" ></Input>
                    </FormItem>
                    <FormItem label="显示序列" prop="passwdCheck">
                        <Input type="text" ></Input>
                    </FormItem>
                </Form>
            </Card>
        </Col>
    </Row>
</template>
<script>
    export default {
        name: "permission",
         data () {
            return {
                data:[],
                treeData:[],
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
                                            type: 'ios-folder-outline'
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
                        children: [
                            // {
                            //     title: 'child 1-1',
                            //     expand: true,
                            //     children: [
                            //         {
                            //             title: 'leaf 1-1-1',
                            //             expand: true
                            //         },
                            //         {
                            //             title: 'leaf 1-1-2',
                            //             expand: true
                            //         }
                            //     ]
                            // },
                            // {
                            //     title: 'child 1-2',
                            //     expand: true,
                            //     children: [
                            //         {
                            //             title: 'leaf 1-2-1',
                            //             expand: true
                            //         },
                            //         {
                            //             title: 'leaf 1-2-1',
                            //             expand: true
                            //         }
                            //     ]
                            // }
                        ]
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
                    h('span', [
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
                const children = data.children || [];
                children.push({
                    title: 'appended node',
                    expand: true
                });
                this.$set(data, 'children', children);
            },
            remove (root, node, data) {
                const parentKey = root.find(el => el === node).parent;
                const parent = root.find(el => el.nodeKey === parentKey).node;
                const index = parent.children.indexOf(data);
                parent.children.splice(index, 1);
            },
            choice(data){
        　　　　console.log(data); 
        　　　　let choicesAll=this.$refs.tree4.getSelectedNodes;
        　　　　console.log(choicesAll);
        　　},
            getList(){
                const self = this;
                this.$http.get('/permission/permission-list').then((res) => {
                if (res.code === 200) {
                    // console.log(res.data);
                    // res.data.children.forEach(item => {
                    //      if(item.children){
                    //             this.data5[0].children.push({
                    //             children:item.children
                    //             })
                    //         }
                    //     else{
                    //         this.data5[0].children.push({
                    //             title: item.description,
                    //             expand: true
                    //         })}
                    //     })
                    // console.log( self.data5[0].children);
                    this.treeData=res.data.children;
                    this.handleData(this.treeData);
                } else {
                    self.$Message.error('获取数据失败！' + res.code);
                }
                })
            },
            handleData(res){
                console.log(res);
                res.forEach(item => {
                         if(item.children){
                                item.children.forEach(item2 =>{handleData(item2.children)})
                                
                            }
                        else{
                            this.data5[0].children.push({
                                title: item.description,
                                expand: true
                            })}
                    })
                     console.log( this.data5[0].children);
            }
        
        },
         created() {
            this.getList();
        },

    }
</script>

<style scoped>

</style>
