<template>
    <div>
        <span>{{codeName}}</span>
    </div>

</template>
<script>
    import Cookies from 'js-cookie'
    export default {
        name: 'code-name',
        data(){
            return{
                codeName: '',
            }
        },
        props: {
            codeType: {
                type: String | Number,
                required: true
            },
            code: {
                type: String | Number,
                required: true
            }

        },
        mounted() {
            let cookieName = this.codeType +"_"+ this.code;
            if (Cookies.get(cookieName)) {
                this.codeName = Cookies.get(cookieName)
            } else {
                const self = this;
                let params = {
                    type: this.codeType,
                    code: this.code
                }
                this.$http.get('/code/name', params).then(resp => {
                    if (resp.code === 200) {
                        self.codeName = resp.data;
                        Cookies.set(cookieName, self.codeName)
                    } else {
                        self.$Message.error('获取Code失败：' + resp.code);
                    }
                }).catch(err => {
                    self.$Message.error('获取Code失败：' + err);
                })
            }
        }
    }
</script>