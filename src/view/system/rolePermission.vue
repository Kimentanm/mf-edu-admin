<style lang="less">
  @import '../../styles/common.less';
</style>
<template>
    <Row :gutter="16">
        <Col span="5">
          <Card title="Options" icon="ios-options" :padding="0" shadow >
            <CellGroup>
                <Cell title="Display right content" extra="details" />
                <Cell title="With Badge" to="/components/badge">
                    <Badge :count="10" slot="extra" />
                </Cell>
                <Cell title="With Switch">
                    <Switch v-model="switchValue" slot="extra" />
                </Cell>
            </CellGroup>
        </Card>
        </Col>
        <Col span="19">
          <Card>
            <div>col-6</div>
          </Card>
        </Col>
    </Row>   
</template>
<script>
  export default {
    name: 'rolePermission',
    data() {
      return {
        switchValue: true,
      }
    },
    methods: {
     
    },

    created() {
  
    },

  }

</script>
