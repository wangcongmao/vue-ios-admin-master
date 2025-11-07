import Raphael from 'raphael'

export default class PetriGraph {
  constructor(paper) {
    this.paper = paper // 这是一个 new Raphael(HtmlNode) 对象
    this.PAPER_WIDTH = 900
    this.PAPER_HEIGHT = 600
    this.place_attr = { 'fill': 'orange', 'stroke': 'brown', 'stroke-width': '2' }
    this.trans_attr = { 'fill': 'green', 'stroke': 'brown', 'stroke-width': '2' }
    this.token_attr = { 'fill': 'black', 'stroke': 'black', 'stroke-width': '0' }
    this.drag_on_attr = { 'stroke': 'red', 'stroke-width': '4' }
    this.drag_off_attr = { 'stroke': 'brown', 'stroke-width': '2' }
    this.arrow_head_attr = { 'stroke': 'brown', 'stroke-width': '3', 'arrow-end': 'block-wide-long' }
    this.text_attr = { 'fill': 'blue', 'font-size': '14', 'font-family': 'Courier New' }
    this.text_attr_tn = { 'fill': 'white', 'font-size': '12', 'font-family': 'Arial', 'font-weight': 'bold' }
    this.sel_attr = { 'stroke': 'red', 'stroke-width': '4' }

    this.TR_WIDTH = 10
    this.TR_HEIGHT = 50
    this.PL_RADIUS = 25
    this.TN_RADIUS = 4
    this.ARC_SHORT = this.PL_RADIUS + 2
    this.ARC_TYPE = 2
    this.DOUBLE_SHIFT = 10
    this.TEMP_ARC = { from: null, x: 0, y: 0, img: null }
    this.TEMP_ARC_ON = false

    this.places = {}
    this.trans = {}
    this.arcs = []
    this.selectedNodes = null
    this.selected_label = ''
    this.statusText = ''

    // For Running
    this.RunList = []
    this.RunIcon = null
    this.ExitRun = false
    this.IsRunning = false
    this.AnimateDelay = 500
  }

  graph_loaded() {
    return Object.keys(this.places).length > 0 && Object.keys(this.trans).length > 0
  }

  resetPnet() {
    this.places = {}
    this.trans = {}
    this.arcs = []
  }

  NewPlace(x, y) {
    this.AddPlace('P' + PetriGraph.next_key(this.places), x, y, 0, '')
  }
  NewTransition(x, y) {
    this.AddTransition('T' + PetriGraph.next_key(this.trans), x, y, '')
  }
  static next_key(nodes) {
    let last_key = 0
    const keys = Object.keys(nodes)
    if (keys.length > 0) {
      last_key = parseInt(keys[keys.length - 1].slice(1))
    }
    return last_key + 1
  }
  select_object(object) {
    this.clear_selection()
    switch (object.type) {
      case 'circle':
        this.select_circle(object)
        break
      case 'rect':
        this.select_rect(object)
        break
      case 'path':
        this.select_path(object)
        break
      default:
    }
  }
  select_circle(object) {
    const x = object.x
    const y = object.y

    const r1 = this.paper.rect(x - this.PL_RADIUS, y - this.PL_RADIUS / 2 - 3, 2 * this.PL_RADIUS, this.PL_RADIUS + 6).attr({ 'stroke': 'white', 'stroke-width': '4' }).toBack()
    const r2 = this.paper.rect(x - this.PL_RADIUS / 2 - 3, y - this.PL_RADIUS, this.PL_RADIUS + 6, 2 * this.PL_RADIUS).attr({ 'stroke': 'white', 'stroke-width': '4' }).toBack()
    const r3 = this.paper.rect(x - this.PL_RADIUS, y - this.PL_RADIUS, 2 * this.PL_RADIUS, 2 * this.PL_RADIUS).attr(this.sel_attr).toBack()
    this.selectedNodes = this.paper.set()
    this.selectedNodes.push(r1)
    this.selectedNodes.push(r2)
    this.selectedNodes.push(r3)
    this.selectedNodes.node = object
    this.type_selected(this.selectedNodes.node.key)
  }

  select_rect(object) {
    const x = object.x
    const y = object.y
    const w = object.attr('width')
    const h = object.attr('height')
    const r1 = this.paper.rect(x - this.TR_WIDTH - 5, y - this.TR_HEIGHT / 2 + 5, w + 20, h - 10).attr({ 'stroke': 'white', 'stroke-width': '4' }).toBack()
    const r2 = this.paper.rect(x - 8, y - this.TR_HEIGHT / 2 - 5, w + 6, h + 10).attr({ 'stroke': 'white', 'stroke-width': '4' }).toBack()
    const r3 = this.paper.rect(x - this.TR_WIDTH * 1.5, y - this.TR_HEIGHT / 2 - 5, w + 20, h + 10).attr(this.sel_attr).toBack()
    this.selectedNodes = this.paper.set()
    this.selectedNodes.push(r1)
    this.selectedNodes.push(r2)
    this.selectedNodes.push(r3)
    this.selectedNodes.node = object
    this.type_selected(this.selectedNodes.node.key)
  }

  select_path(object) {
    const path = object.attr('path')
    const x1 = path[0][1]
    const y1 = path[0][2]
    const x2 = path[1][1]
    const y2 = path[1][2]
    const arcSelAttr = { 'fill': 'yellow', 'stroke': 'red' }
    const sel_size = 10
    this.selectedNodes = this.paper.set()
    const rect1 = this.paper.rect(x1 - sel_size / 2, y1 - sel_size / 2, sel_size, sel_size).attr(arcSelAttr)
    const rect2 = this.paper.rect(x2 - 2, y2 - sel_size / 2, sel_size, sel_size).attr(arcSelAttr)
    this.selectedNodes.push(rect1)
    this.selectedNodes.push(rect2)
    this.selectedNodes.node = object
    this.type_selected(object.keys[0] + ',' + object.keys[1])
  }
  unselect() {
    this.clear_selection()
    this.type_selected('&nbsp;')
  }

  type_selected(text) {
    this.selected_label = text
  }

  clear_selection() {
    if (this.selectedNodes != null) {
      this.selectedNodes.remove()
      this.selectedNodes = null
    }
  }

  RemoveObject() {
    if (this.selectedNodes == null) return
    const obj = this.selectedNodes.node
    const key = obj.key

    switch (obj.type) {
      case 'circle':
        PetriGraph.remove_tokens(obj)
        this.remove_node(obj)
        delete this.places[key]
        break
      case 'rect':
        this.remove_node(obj)
        delete this.trans[key]
        break
      case 'path':
        this.remove_arc(obj.keys[0], obj.keys[1])
        break
      default:
    }

    if (this.selectedNodes != null) {
      this.clear_selection()
    }
  }

  remove_node(node) {
    const key = this.selectedNodes.node.key
    for (let i = this.arcs.length - 1; i >= 0; i--) {
      if (this.arcs[i].from.key === key || this.arcs[i].to.key === key) {
        this.arcs[i].img.remove()
        this.arcs.splice(i, 1)
      }
    }
    node.caption.remove()
    node.remove()
  }

  remove_arc(key1, key2) {
    for (let i = this.arcs.length - 1; i >= 0; i--) {
      if ((this.arcs[i].from.key === key1 && this.arcs[i].to.key === key2) || (this.arcs[i].from.key === key2 && this.arcs[i].to.key === key1)) {
        this.arcs[i].img.remove()
        this.arcs.splice(i, 1)
      }
    }
  }

  AddPlace(key, x, y, tokens, comment) {
    const place = this.paper.circle(x, y, this.PL_RADIUS).attr(this.place_attr)
    place.drag(this.drag_move(place).bind(this), this.drag_start(place).bind(this), this.drag_end(place).bind(this))
    place.click(() => {
      this.select_object(place)
    })
    place.mouseup((e) => {
      this.node_mouseup(place, e.ctrlKey)
    })
    place.x = x
    place.y = y
    place.comment = comment
    place.dx = 0
    place.dy = 0
    place.key = key
    place.tokens = new Array(tokens)
    place.tokens_count = 0
    place.caption = this.draw_text(key, x, y)
    place.pnString = function() {
      return ({
        key: this.key,
        x: this.x,
        y: this.y,
        tokens: this.tokens.length,
        comment: this.comment
      })
    }
    this.draw_tokens(place)
    this.places[key] = place
    return place
  }

  node_mouseup(node, ctrlKey) {
    if (ctrlKey && this.TEMP_ARC_ON) {
      this.TEMP_ARC.img.remove()
      this.AddArc(this.TEMP_ARC.from, node, '')
    }
  }

  AddTransition(key, x, y, comment) {
    const transition = this.paper.rect(x - this.TR_WIDTH / 2, y - this.TR_HEIGHT / 2, this.TR_WIDTH, this.TR_HEIGHT).attr(this.trans_attr)
    transition.drag(this.drag_move(transition).bind(this), this.drag_start(transition).bind(this), this.drag_end(transition).bind(this))
    transition.click(() => {
      this.select_object(transition)
    })
    transition.mouseup((e) => {
      this.node_mouseup(transition, e.ctrlKey)
    })
    transition.x = x
    transition.y = y
    transition.key = key
    transition.comment = comment
    transition.caption = this.draw_text(key, x, y)
    transition.pnString = function() {
      return {
        key: this.key, x: this.x, y: this.y, comment: this.comment
      }
    }
    this.trans[key] = transition
    return transition
  }

  AddArc(node1, node2, comment) {
    let arc = null
    if (node1 != null && node2 != null && node1.key.substr(0, 1) !== node2.key.substr(0, 1)) {
      arc = { isDouble: false }
      if (this.already_arc(node1.key, node2.key)) {
        arc.isDouble = true
      }

      arc.img = this.draw_arc(node1.x, node1.y, node2.x, node2.y, arc.isDouble)
      arc.from = node1
      arc.to = node2
      arc.comment = comment
      arc.img.click(() => {
        this.select_object(arc.img)
      })
      arc.img.keys = [node1.key, node2.key]
      arc.pnString = function() {
        return {
          from: this.from.key, to: this.to.key, comment: this.comment
        }
      }
      this.arcs.push(arc)
    }
    return arc
  }

  already_arc(key1, key2) {
    let count = 0
    this.arcs.forEach(function(arc) {
      if ((arc.from.key === key1 && arc.to.key === key2) || (arc.from.key === key2 && arc.to.key === key1)) {
        // console.log(arc);
        count++
      }
    })
    return count > 0
  }

  // set_arc(arc_img) {
  //   const path = arc_img.attr('path')
  //   arc_img.pn = {}
  //   arc_img.pn.x1 = path[0][1]
  //   arc_img.pn.y1 = path[0][2]
  //   arc_img.pn.x2 = path[1][1]
  //   arc_img.pn.y2 = path[1][2]
  //   arc_img.click(() => {
  //     this.select_object(arc_img)
  //   })
  // }

  drag_start = (item) => (x, y, e) => {
    if (!e.ctrlKey) {
      this.clear_selection()
      item.current_transform = item.transform()
      item.attr(this.drag_on_attr)
    } else {
      this.TEMP_ARC.x = item.x
      this.TEMP_ARC.y = item.y
      this.TEMP_ARC.from = item
    }
  }

  drag_move=(item) => (dx, dy, x, y, e) => {
    if (!e.ctrlKey) {
      item.dx = dx
      item.dy = dy
      item.transform(item.current_transform + 'T' + dx + ',' + dy)
      this.redraw_text(item, item.x + dx, item.y + dy, item.key)
      this.redraw_Arcs(item, item.x + dx, item.y + dy, 7)
      if (typeof item.tokens !== 'undefined' && item.tokens.length > 0) {
        this.redraw_tokens(item, item.x + dx, item.y + dy)
      }
    } else {
      if (this.TEMP_ARC.img != null) this.TEMP_ARC.img.remove()
      if (Math.abs(this.TEMP_ARC.x - item.x + dx) > this.PL_RADIUS) {
        this.TEMP_ARC.img = this.paper.arc(this.TEMP_ARC.x, this.TEMP_ARC.y, item.x + dx, item.y + dy, 7)
        this.TEMP_ARC_ON = true
      }
    }
  }

  drag_end=(item) => (e) => {
    if (!e.ctrlKey) {
      item.x += parseInt(item.dx) || 0
      item.y += parseInt(item.dy) || 0
      item.dx = 0 // Reset transform
      item.dy = 0
      item.current_transform = item.transform()
      item.attr(this.drag_off_attr)
    }
  }

  arrow_arc(x1, y1, x2, y2, dd) {
    const R = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
    const r = R - dd
    const dx = ((x2 - x1) * r) / R
    const dy = ((y2 - y1) * r) / R
    const a1 = x2 - dx
    const b1 = y2 - dy
    const a2 = x1 + dx
    const b2 = y1 + dy
    return this.paper.path('M' + a1 + ',' + b1 + ' L' + a2 + ',' + b2)
  }

  draw_arc(x1, y1, x2, y2, isDouble) {
    if (isDouble === true) {
      y1 += this.DOUBLE_SHIFT
      y2 += this.DOUBLE_SHIFT
    }
    let arc
    if (this.ARC_TYPE === 1) {
      arc = this.paper.arc(x1, y1, x2, y2, 7)
    } else {
      arc = this.arrow_arc(x1, y1, x2, y2, this.ARC_SHORT).attr(this.arrow_head_attr)
    }
    return arc
  }
  redraw_Arcs(node, x, y) {
    this.arcs.forEach(function(arc) {
      let keys = null
      if (arc.from.key === node.key) {
        keys = arc.img.keys
        arc.img.remove()
        // noinspection JSPotentiallyInvalidUsageOfClassThis
        arc.img = this.draw_arc(x, y, arc.to.x, arc.to.y, arc.isDouble)
        arc.img.keys = keys
        // noinspection JSPotentiallyInvalidUsageOfClassThis
        arc.img.click(() =>
          this.select_object(arc.img)
        )
      } else if (arc.to.key === node.key) {
        keys = arc.img.keys
        arc.img.remove()
        // noinspection JSPotentiallyInvalidUsageOfClassThis
        arc.img = this.draw_arc(arc.from.x, arc.from.y, x, y, arc.isDouble)
        arc.img.keys = keys
        // noinspection JSPotentiallyInvalidUsageOfClassThis
        arc.img.click(() => {
          this.select_object(arc.img)
        })
      }
    }, this)
  }

  draw_text(text, x, y) {
    return this.paper.text(x, y - this.PL_RADIUS - 10, text).attr(this.text_attr)
  }
  redraw_text(node, x, y, text) {
    node.caption.remove()
    node.caption = this.draw_text(text, x, y)
  }

  AddToken(place) {
    PetriGraph.remove_tokens(place)
    place.tokens.push({})
    this.draw_tokens(place)
  }
  RemoveToken(place) {
    if (place.tokens.length > 0) {
      PetriGraph.remove_tokens(place)
      place.tokens.pop()
      this.draw_tokens(place)
    }
  }
  draw_tokens(node) {
    this.place_tokens(node.tokens, node.x, node.y, this.TN_RADIUS)
  }

  place_tokens(tokens, x, y, r) {
    let d = r + 1

    if (tokens.length === 1) {
      tokens[0] = this.paper.circle(x, y, r).attr(this.token_attr)
    }
    if (tokens.length === 2) {
      tokens[0] = this.paper.circle(x - d, y, r).attr(this.token_attr)
      tokens[1] = this.paper.circle(x + d, y, r).attr(this.token_attr)
    }
    if (tokens.length === 3) {
      tokens[0] = this.paper.circle(x, y - r, r).attr(this.token_attr)
      tokens[1] = this.paper.circle(x - d, y + d, r).attr(this.token_attr)
      tokens[2] = this.paper.circle(x + d, y + d, r).attr(this.token_attr)
    }
    if (tokens.length === 4) {
      tokens[0] = this.paper.circle(x - d, y - d, r).attr(this.token_attr)
      tokens[1] = this.paper.circle(x + d, y - d, r).attr(this.token_attr)
      tokens[2] = this.paper.circle(x - d, y + d, r).attr(this.token_attr)
      tokens[3] = this.paper.circle(x + d, y + d, r).attr(this.token_attr)
    }
    if (tokens.length === 5) {
      d = r + 3
      tokens[0] = this.paper.circle(x - d, y - d, r).attr(this.token_attr)
      tokens[1] = this.paper.circle(x + d, y - d, r).attr(this.token_attr)
      tokens[2] = this.paper.circle(x - d, y + d, r).attr(this.token_attr)
      tokens[3] = this.paper.circle(x + d, y + d, r).attr(this.token_attr)
      tokens[4] = this.paper.circle(x, y, r).attr(this.token_attr)
    }
    if (tokens.length === 6) {
      d = r + 1
      tokens[0] = this.paper.circle(x - 2 * d, y - d, r).attr(this.token_attr)
      tokens[1] = this.paper.circle(x + 0 + 0, y - d, r).attr(this.token_attr)
      tokens[2] = this.paper.circle(x + 2 * d, y - d, r).attr(this.token_attr)
      tokens[3] = this.paper.circle(x - 2 * d, y + d, r).attr(this.token_attr)
      tokens[4] = this.paper.circle(x + 0 + 0, y + d, r).attr(this.token_attr)
      tokens[5] = this.paper.circle(x + 2 * d, y + d, r).attr(this.token_attr)
    }
    if (tokens.length === 7) {
      d = r + 1
      tokens[0] = this.paper.circle(x - 2 * d, y - d, r).attr(this.token_attr)
      tokens[1] = this.paper.circle(x + 0 + 0, y - 2 * d, r).attr(this.token_attr)
      tokens[2] = this.paper.circle(x + 2 * d, y - d, r).attr(this.token_attr)
      tokens[3] = this.paper.circle(x - 2 * d, y + d, r).attr(this.token_attr)
      tokens[4] = this.paper.circle(x + 0 + 0, y, r).attr(this.token_attr)
      tokens[5] = this.paper.circle(x + 2 * d, y + d, r).attr(this.token_attr)
      tokens[6] = this.paper.circle(x, y + 2 * d, r).attr(this.token_attr)
    }
    if (tokens.length === 8) {
      d = r + 1
      tokens[0] = this.paper.circle(x - 2 * d, y - d, r).attr(this.token_attr)
      tokens[1] = this.paper.circle(x + 0 + 0, y - d, r).attr(this.token_attr)
      tokens[2] = this.paper.circle(x + 2 * d, y - d, r).attr(this.token_attr)
      tokens[3] = this.paper.circle(x - 2 * d, y + d, r).attr(this.token_attr)
      tokens[4] = this.paper.circle(x + 0 + 0, y + d, r).attr(this.token_attr)
      tokens[5] = this.paper.circle(x + 2 * d, y + d, r).attr(this.token_attr)
      tokens[6] = this.paper.circle(x, y - 3 * d, r).attr(this.token_attr)
      tokens[7] = this.paper.circle(x, y + 3 * d, r).attr(this.token_attr)
    }
    if (tokens.length === 9) {
      d = r + 1
      tokens[0] = this.paper.circle(x - 2 * d, y - d, r).attr(this.token_attr)
      tokens[1] = this.paper.circle(x + 0 + 0, y - d, r).attr(this.token_attr)
      tokens[2] = this.paper.circle(x + 2 * d, y - d, r).attr(this.token_attr)
      tokens[3] = this.paper.circle(x - 2 * d, y + d, r).attr(this.token_attr)
      tokens[4] = this.paper.circle(x + 0 + 0, y + d, r).attr(this.token_attr)
      tokens[5] = this.paper.circle(x + 2 * d, y + d, r).attr(this.token_attr)
      tokens[6] = this.paper.circle(x, y - 3 * d, r).attr(this.token_attr)
      tokens[7] = this.paper.circle(x - d, y + 3 * d, r).attr(this.token_attr)
      tokens[8] = this.paper.circle(x + d, y + 3 * d, r).attr(this.token_attr)
    }
    if (tokens.length === 10) {
      d = r + 1
      tokens[0] = this.paper.circle(x - 2 * d, y - d, r).attr(this.token_attr)
      tokens[1] = this.paper.circle(x + 0 + 0, y - d, r).attr(this.token_attr)
      tokens[2] = this.paper.circle(x + 2 * d, y - d, r).attr(this.token_attr)
      tokens[3] = this.paper.circle(x - 2 * d, y + d, r).attr(this.token_attr)
      tokens[4] = this.paper.circle(x + 0 + 0, y + d, r).attr(this.token_attr)
      tokens[5] = this.paper.circle(x + 2 * d, y + d, r).attr(this.token_attr)
      tokens[6] = this.paper.circle(x - d, y - 3 * d, r).attr(this.token_attr)
      tokens[7] = this.paper.circle(x + d, y - 3 * d, r).attr(this.token_attr)
      tokens[8] = this.paper.circle(x - d, y + 3 * d, r).attr(this.token_attr)
      tokens[9] = this.paper.circle(x + d, y + 3 * d, r).attr(this.token_attr)
    }
    if (tokens.length > 10) {
      const tn = this.paper.set()
      tn.push(this.paper.circle(x, y, 15).attr(this.token_attr))
      tn.push(this.paper.text(x, y, tokens.length.toString()).attr(this.text_attr_tn))
      tokens[0] = tn
    }
  }
  redraw_tokens(node, x, y) {
    PetriGraph.remove_tokens(node)
    this.place_tokens(node.tokens, x, y, this.TN_RADIUS)
  }
  static remove_tokens(node) {
    for (let i = 0; i < node.tokens.length; i++) {
      if (typeof node.tokens[i] !== 'undefined' && node.tokens[i].hasOwnProperty('type')) {
        node.tokens[i].remove()
      } else {
        break
      }
    }
  }

  token_add() {
    if (this.selectedNodes != null && this.selectedNodes.node.key.substr(0, 1) === 'P') {
      this.AddToken(this.places[this.selectedNodes.node.key])
    } else {
      this.statusText = 'No selected placed.'
    }
  }

  token_remove() {
    if (this.selectedNodes != null && this.selectedNodes.node.key.substr(0, 1) === 'P') {
      this.RemoveToken(this.places[this.selectedNodes.node.key])
    } else {
      this.statusText = 'No selected placed.'
    }
  }

  clear_paper() {
    this.resetPnet()
    this.paper.clear()
    this.statusText = 'Ready'
  }

  getByKey(key) {
    if (key.charAt(0) === 'P') { return this.places[key] }
    if (key.charAt(0) === 'T') { return this.trans[key] }
    return null
  }

  // Below is for Petri net Running
  run_all() {
    if (this.graph_loaded()) {
      this.statusText = 'Running...'
      this.StartRun()
    } else {
      this.statusText = ('No valid graph loaded.')
    }
  }

  stop_all() {
    if (this.IsRunning) {
      this.statusText = ('Stopped.')
      this.StopRun()
    } else {
      this.statusText = ('There is no running graph.')
    }
  }
  StartRun() {
    this.IsRunning = true
    this.ExitRun = false
    this.RunIcon = new RunIconInitialize(this, this.AnimateDelay)
    this.Run()
  }

  StopRun() {
    this.ExitRun = true
    this.IsRunning = false
  }

  Run() {
    this.RunList = []
    Object.keys(this.places).forEach(function(key) { this.places[key].tokens_count = this.places[key].tokens.length }, this)

    if (!this.ExitRun) {
      Object.keys(this.trans).forEach(function(key) {
        const arcsIn = this.get_arcsIn(key)
        if (PetriGraph.ready_toFire(arcsIn)) {
          const run_item = {}
          run_item.tran = this.trans[key]
          run_item.arcsIn = arcsIn
          run_item.arcsOut = this.get_arcsOut(key)
          run_item.temp_tokens = []
          this.RunList.push(run_item)
        }
      }, this)
      this.animate_list()
    } else {
      this.RunIcon.remove()
    }
  }

  animate_list() {
    this.animate1()
    this.RunIcon.animate1() // Delay(1) using animation
  }
  animate1() {
    this.RunList.forEach(function(run_item) {
      run_item.arcsIn.forEach(function(arc) {
        if (arc.from.tokens.length > 0) {
          const animation = Raphael.animation(new XY(PetriGraph.arcX2(arc), PetriGraph.arcY2(arc)), this.AnimateDelay, 'easeIn')
          let ttoken = arc.from.tokens.pop()
          if (typeof ttoken !== 'undefined' && ttoken.hasOwnProperty('type')) {
            ttoken.remove()
          }
          ttoken = this.paper.circle(PetriGraph.arcX1(arc), PetriGraph.arcY1(arc), this.TN_RADIUS).attr(this.token_attr)
          this.redraw_tokens(arc.from, arc.from.x, arc.from.y)
          run_item.temp_tokens.push(ttoken)
          run_item.temp_tokens[run_item.temp_tokens.length - 1].animate(animation)
        }
      }, this)
    }, this)
  }
  animate2() {
    (this.RunList || []).forEach(function(run_item) {
      run_item.temp_tokens.forEach(function(token, ind) { token.remove() })
      run_item.temp_tokens = []
      run_item.arcsOut.forEach(function(arc) {
        // const token = paper.circle(run_item.tran.x, run_item.tran.y, 3).attr(token_attr);
        // const animation = Raphael.animation(new XY(arc.to.x, arc.to.y + 10), AnimateDelay, "easeIn");
        const token = this.paper.circle(PetriGraph.arcX1(arc), PetriGraph.arcY1(arc), this.TN_RADIUS).attr(this.token_attr)
        const animation = Raphael.animation(new XY(PetriGraph.arcX2(arc), PetriGraph.arcY2(arc)), this.AnimateDelay, 'easeIn')
        run_item.temp_tokens.push(token)
        token.animate(animation)
      }, this)
    }, this)
    this.RunIcon.animate2() // Delay(2) using animation
  }
  animate3() {
    this.RunList.forEach(function(run_item) {
      run_item.temp_tokens.forEach(function(token, ind) { token.remove() })
      run_item.temp_tokens = []
      run_item.arcsOut.forEach(function(arc) {			//
        this.AddToken(arc.to)
      }, this)
    }, this)
    this.Run()
  }

  static ready_toFire(arcsIn) {
    let isReady = true
    arcsIn.forEach(function(item) {
      if (item.from.tokens_count <= 0) {
        isReady = false
      } else {
        item.from.tokens_count--
      }
    })
    if (!isReady) {
      arcsIn.forEach(function(item) { item.from.tokens_count = item.from.tokens.length })
    }
    return isReady
  }

  get_arcsIn(key) {
    const arcsIn = []
    this.arcs.forEach(function(item) {
      if (item.to.key === key) {
        arcsIn.push(item)
      }
    })
    return arcsIn
  }
  get_arcsOut(key) {
    const arcsOut = []
    this.arcs.forEach(function(item) {
      if (item.from.key === key) {
        arcsOut.push(item)
      }
    })
    return arcsOut
  }
  static arcX1(arc) {
    return arc.img.attrs.path[0][1]
  }
  static arcY1(arc) {
    return arc.img.attrs.path[0][2]
  }
  static arcX2(arc) {
    return arc.img.attrs.path[1][1]
  }
  static arcY2(arc) {
    return arc.img.attrs.path[1][2]
  }

  // Below if for Petri new Save & Loading

  SerializePnet() {
    const pn = { places: [], trans: [], arcs: [] }

    Object.keys(this.places).forEach(function(key) {
      pn.places.push(this.places[key].pnString())
    }, this)
    Object.keys(this.trans).forEach(function(key) {
      pn.trans.push(this.trans[key].pnString())
    }, this)
    this.arcs.forEach(function(item) {
      pn.arcs.push(item.pnString())
    })
    // console.log(JSON.stringify(pn));
    return JSON.stringify(pn)
  }

  DeserializePnet(pn) {
    this.places = {}
    this.trans = {}
    this.arcs = []
    pn.places.forEach(function(item) {
      const { key, x, y, tokens, comment } = item
      // noinspection JSPotentiallyInvalidUsageOfClassThis
      this.AddPlace(key, x, y, tokens, comment || ' ')
    }, this)
    pn.trans.forEach(function(item) {
      const { key, x, y, comment } = item
      // noinspection JSPotentiallyInvalidUsageOfClassThis
      this.AddTransition(key, x, y, comment || ' ')
    }, this)
    pn.arcs.forEach(function(item) {
      const { from, to, comment } = item
      // noinspection JSPotentiallyInvalidUsageOfClassThis
      this.AddArc(this.getByKey(from), this.getByKey(to), comment || ' ')
    }, this)
    console.log(pn)
  }

  static ReadFromFile(file, handler) {
    const reader = new FileReader()
    reader.onload = handler
    try {
      reader.readAsText(file)
    } catch (err) {
      console.log(err.message)
    }
  }

  loadFromFile($event) {
    if (this.IsRunning) {
      this.StopRun()
    }
    this.clear_paper()
    const file = $event.target.files[0]
    PetriGraph.ReadFromFile(file, (event) => {
      try {
        const pn = JSON.parse(event.target.result)
        this.DeserializePnet(pn)
      } catch (err) {
        console.log(err.message)
      }
    })
  }

  saveToFile() {
    const text = this.SerializePnet()
    PetriGraph.DownloadToFile('petri.txt', text)
  }

  static DownloadToFile(file_name, text) {
    const link = document.createElement('a')
    link.setAttribute('download', file_name)
    link.href = PetriGraph.create_file(text)
    document.body.appendChild(link)
    // wait for the link to be added to the document
    window.requestAnimationFrame(function() {
      const event = new MouseEvent('click')
      link.dispatchEvent(event)
      document.body.removeChild(link)
    })
  }
  static textFile = null;
  static create_file(text) {
    const data = new Blob([text], { type: 'text/plain' })
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (PetriGraph.textFile !== null) {
      window.URL.revokeObjectURL(PetriGraph.textFile)
    }
    // returns a URL you can use as a href
    return window.URL.createObjectURL(data)
  }
}

class RunIconInitialize {
  constructor(petriGraph, delay) {
    const x = 25
    const y = petriGraph.PAPER_HEIGHT - 10
    const width = 40
    // const height = 2
    const r = 4

    // this.petriGraph = petriGraph
    this.img = petriGraph.paper.circle(x, y, r).attr({ 'fill': 'red', 'stroke': 'red' })
    this.animation1 = Raphael.animation(new XY(x + width, y), delay, 'easyin', petriGraph.animate2.bind(petriGraph))
    this.animation2 = Raphael.animation(new XY(x, y), delay, 'easyin', petriGraph.animate3.bind(petriGraph))
  }

  remove() {
    this.img.remove()
  }

  animate1() {
    this.img.animate(this.animation1)
  }

  animate2() {
    this.img.animate(this.animation2)
  }
}

class XY {
  constructor(x, y) {
    this.cx = x
    this.cy = y
  }
}
