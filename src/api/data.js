import http from '@/libs/http.request'

export const getTableData = () => {
  return http.request({
    url: 'get_table_data',
    method: 'get'
  })
}
