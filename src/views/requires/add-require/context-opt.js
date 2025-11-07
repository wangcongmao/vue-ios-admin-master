const variableSet = {
  '性别': ['男', '女'],
  '职业': ['学生', '老师', '工程师', '快递员', '保姆'],
  '学历': ['小学', '初中', '高中', '大学'],
  '一天的时间段': ['夜间', '上午', '下午', '晚上'],
  '节假日': ['节假日', '工作日'],
  '环境': ['室内', '室外'],
  '天气': ['晴天', '阴天', '雨天', '雾霾']
}
const allContexts = [
  '年龄', '温度', '性别', '职业', '学历', '一天的时间段', '节假日', '环境', '天气'
]
const selectCon = new Set()
Object.keys(variableSet).forEach((_) => {
  selectCon.add(_)
})

const defaultCon = {}
allContexts.forEach((item) => {
  defaultCon[item] = ''
})

export { variableSet, allContexts, defaultCon, selectCon }
