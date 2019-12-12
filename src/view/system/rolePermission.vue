<style lang="less">
    @import '../../styles/common.less';

    .role-list {
        .ivu-menu-submenu-title-icon {
            display: none;
        }

        .title-icon {
            position: absolute;
            top: 50%;
            right: 24px;
            transform: translateY(-50%);
        }

        .ivu-menu {
            padding: 0 10px;
        }
    }
</style>
<template>
    <Row :gutter="16">
        <Col span="5">
            <Card title="公共角色" icon="ios-options" :padding="0" shadow>
                <div @mouseleave="mouseLeave">
                    <Menu class="role-list" ref="menu" width="auto">
                        <template>
                            <Submenu v-for="(item, index) in roleList" :name="item.id" :key="index">
                                <template slot="title">
                                    <Icon type="md-person" size="16"/>
                                    <span>{{item.name}}</span>
                                    <div class="title-icon">
                                        <Icon type="ios-construct" size="16"/>
                                        <Icon type="ios-trash-outline" size="20"/>
                                    </div>
                                </template>
                                <CellGroup>
                                    <Cell title="角色编码" :extra="item.code"/>
                                    <Cell title="角色描述" :extra="item.description"/>
                                    <Cell title="是否启用">
                                        <i-switch v-model="switchValue" slot="extra"/>
                                    </Cell>
                                </CellGroup>
                            </Submenu>
                        </template>
                    </Menu>
<!--                    <CellGroup @on-click="chooseRole" v-for="item in roleList" :key="item.id">-->
<!--                        <Cell>-->
<!--                            <Icon type="md-person"/>-->
<!--                            <span>{{item.name}}</span>-->
<!--                            <Icon type="ios-construct" slot="extra" v-show="editCell"/>-->
<!--                            <Icon type="ios-trash-outline" slot="extra" v-show="editCell"/>-->
<!--                        </Cell>-->
<!--                        <Cell title="角色编码" :extra="item.code" v-show="editCell"/>-->
<!--                        <Cell title="角色描述" :extra="item.description" v-show="editCell"/>-->
<!--                        <Cell title="是否启用">-->
<!--                            <i-switch v-model="switchValue" slot="extra" v-show="editCell"/>-->
<!--                        </Cell>-->
<!--                    </CellGroup>-->
                </div>
            </Card>
        </Col>
        <Col span="19">
            <Card title="权限树" icon="ios-options">
                <Tree :data="data4" show-checkbox multiple></Tree>
            </Card>
        </Col>
    </Row>
</template>
<script>
    export default {
        name: 'rolePermission',
        data() {
            return {
                editCell: false,
                switchValue: true,
                roleList: [],
                data4: [
                    {
                        title: '权限总菜单',
                        expand: true,
                        selected: true,
                        children: []
                    }
                ]
            }
        },
        methods: {
            getTree() {
                const self = this;
                this.$http.get('/permission/permission-list').then((res) => {
                    if (res.code === 200) {
                        this.data4[0].children = res.data.children;
                    } else {
                        self.$Message.error('获取数据失败！' + res.code);
                    }
                })
            },
            getRole() {
                const self = this;
                this.$http.get('/role/pageList').then((res) => {
                    if (res.code === 200) {
                        self.roleList = res.data.list;
                        console.log(self.roleList);
                    } else {
                        self.$Message.error('获取数据失败！' + res.code);
                    }
                })
            },
            chooseRole() {
                this.editCell = true;
            },
            mouseLeave() {
                this.editCell = false;
            }

        },
        created() {
            this.getTree();
            this.getRole();
        },

    }

</script>
