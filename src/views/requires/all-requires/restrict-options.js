export default {
  maxexpandId: 95,
  treelist: [{
    id: 1,
    name: 'goal',
    restricts: [{
      key: '',
      valueType: '',
      value: ''
    }
    ],
    pid: '',
    isEdit: false,
    children: []
  }]
}
const initParam = {// 新增参数
  id: 0,
  goal: {
    content: 'goal',
    restricts: []
  },
  children: []
}
const adminState = {
  0: '需求编辑状态',
  1: '匹配需求模式',
  2: '方案编辑状态',
  3: '已生成服务方案'
}

// 普通用户能看到的状态
const userState = {
  INITIALIZATION: '需求编辑状态', EDITING: '需求编辑状态', CREATED: '已生成方案', RUNNING: '执行中', FINISH: '执行完毕', NONE: '获取失败'
}

const getUserState = function(r) {
  return userState[r]
}

const getAdminState = function(uState, aState) {
  if (aState === 1 || aState === 2) {
    return adminState[aState]
  }
  return userState[uState]
}

const getRestrictString = function(r) {
  if (r.valueType === 'region') {
    return ` ${r.key}:${r.minValue}~${r.maxValue}${r.unit}`
  }
  if (r.valueType === 'after') {
    return ` 在${r.value}之后进行`
  }
  if (r.valueType !== '') {
    return ` ${r.key}:${r.value}`
  }
}

export { initParam, getAdminState, getRestrictString, getUserState }

