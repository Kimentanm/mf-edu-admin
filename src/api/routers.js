import http from '@/libs/http.request'

export const getRouterReq = (access) => {
  return http.request({
    url: 'get_router',
    params: {
      access
    },
    method: 'get'
  })
}
