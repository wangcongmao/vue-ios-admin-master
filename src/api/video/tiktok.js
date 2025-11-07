import request from '@/utils/request'

export function tiktokList(data) {
  return request({
    url: '/rest/video/tiktok/list',
    method: 'post',
    data
  })
}

export function deleteTikTok(id) {
  return request({
    url: `/rest/video/tiktok/delete`,
    method: 'get',
    params: { id }
  })
}
