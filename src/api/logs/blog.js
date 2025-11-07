import request from '@/utils/request'

export function blogList(data) {
  return request({
    url: '/rest/logs/blog/list',
    method: 'post',
    data
  })
}
