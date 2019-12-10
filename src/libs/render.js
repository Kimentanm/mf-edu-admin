export default {
  /**
   *
   * @param context
   * @param h
   * @param params
   * @returns {*}
   */
  renderEditDel: function (context, h, params) {
    return h('div', [
      h('Button', {
        props: {
          type: 'primary',
          size: 'small'
        },
        style: {
          marginRight: '5px'
        },
        on: {
          click: () => {
            context.edit(params.index)
          }
        }
      }, '编辑'),
      h('Button', {
        props: {
          type: 'error',
          size: 'small'
        },
        on: {
          click: () => {
            context.remove(params.index)
          }
        }
      }, '删除')
    ]);
  }

}
