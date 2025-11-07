<template>
  <el-container>
    <el-header>
      <el-button type="primary" icon="el-icon-folder-opened" @click="loadBPMN"
        >加载BPMN文件</el-button
      >
      <el-button
        type="primary"
        icon="el-icon-caret-right"
        :disabled="state < COMPONENT_STATE.BPMN_LOADED"
        @click="transferToPetri"
        >转换为Petri Net</el-button
      >
      <el-button
        type="primary"
        icon="el-icon-caret-right"
        :disabled="state < COMPONENT_STATE.PETRI_CREATED"
        @click="optimizePetri"
        >优化Petri Net</el-button
      >
      <el-button
        type="primary"
        icon="el-icon-caret-right"
        :disabled="state < COMPONENT_STATE.PETRI_FINISHED"
        @click="transfer2sc"
        >转换为智能合约</el-button
      >
    </el-header>
    <el-main>
      <el-collapse v-model="activeNames" @change="onCollapseChange">
        <el-collapse-item
          title="BPMN预览"
          :disabled="state < COMPONENT_STATE.BPMN_LOADED"
          name="1"
        >
          <input
            ref="filechooser"
            type="file"
            style="display: none"
            @change="showBPMN($event)"
          />
          <div ref="canvas" />
        </el-collapse-item>
        <el-collapse-item title="Petri Net 预览" name="2">
          <!--:disabled="state<COMPONENT_STATE.PETRI_CREATED" >-->
          <el-container>
            <el-header>
              <el-button round @click="petriView.selected_label = ' '"
                ><code
                  id="selected_label"
                  style="cursor:pointer; float:left;font-family:'Courier New';width: 60px;text-align:center;font-weight:bolder; font-size:12pt; border:solid gray 1px;"
                  >{{ petriView.selected_label }}</code
                ></el-button
              >
              <el-button-group>
                <el-button
                  type="success"
                  icon="el-icon-plus"
                  @click="petriView.token_add()"
                />
                <el-button
                  type="success"
                  icon="el-icon-minus"
                  @click="petriView.token_remove()"
                />
                <el-button
                  type="success"
                  icon="el-icon-zoom-in"
                  @click="zoomIn(petriView)"
                />
                <el-button
                  type="success"
                  icon="el-icon-zoom-out"
                  @click="zoomOut(petriView)"
                />
              </el-button-group>
              <el-button-group>
                <el-button
                  type="primary"
                  icon="el-icon-plus"
                  @click="petriView.NewPlace(35, 45)"
                  >Place</el-button
                >
                <el-button
                  type="primary"
                  icon="el-icon-plus"
                  @click="petriView.NewTransition(35, 45)"
                  >Transition</el-button
                >
                <el-button
                  type="primary"
                  icon="el-icon-delete"
                  @click="petriView.RemoveObject()"
                  >删除</el-button
                >
                <el-button
                  type="primary"
                  icon="el-icon-delete-solid"
                  @click="petriView.clear_paper()"
                  >清空</el-button
                >
              </el-button-group>
              <el-button-group>
                <el-button
                  type="danger"
                  icon="el-icon-video-play"
                  @click="petriView.run_all()"
                  >执行</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-video-pause"
                  @click="petriView.stop_all()"
                  >停止</el-button
                >
              </el-button-group>
              <el-button-group>
                <input
                  ref="filechooser2"
                  type="file"
                  style="display: none"
                  @change="petriView.loadFromFile($event)"
                />
                <el-button
                  type="info"
                  icon="el-icon-upload"
                  :disabled="petriView.paper == null"
                  @click="loadPetri(petriView)"
                  >加载</el-button
                >
                <el-button
                  type="info"
                  icon="el-icon-download"
                  @click="petriView.saveToFile()"
                  >下载</el-button
                >
              </el-button-group>
              <el-button type="text" @click="load_petri_example(petriView)"
                >示例</el-button
              >
            </el-header>
            <el-main>
              <div ref="petriView" />
            </el-main>
            <el-footer>
              <el-input
                v-if="
                  petriView.selectedNodes != null &&
                    petriView.selectedNodes.node != null
                "
                v-model="petriView.selectedNodes.node.comment"
                type="textarea"
                :rows="2"
                placeholder="备注"
                clearable
                @input="e => this.$forceUpdate()"
              />
              <el-alert :title="petriView.statusText" type="info" />
            </el-footer>
          </el-container>
        </el-collapse-item>
        <el-collapse-item title="优化后的Petri Net 预览" name="3">
          <el-container>
            <el-header>
              <el-button round @click="petriView2.selected_label = ' '"
                ><code
                  style="cursor:pointer; float:left;font-family:'Courier New';width: 60px;text-align:center;font-weight:bolder; font-size:12pt; border:solid gray 1px;"
                  >{{ petriView2.selected_label }}</code
                ></el-button
              >
              <el-button-group>
                <el-button
                  type="success"
                  icon="el-icon-plus"
                  @click="petriView2.token_add()"
                />
                <el-button
                  type="success"
                  icon="el-icon-minus"
                  @click="petriView2.token_remove()"
                />
                <el-button
                  type="success"
                  icon="el-icon-zoom-in"
                  @click="zoomIn(petriView2)"
                />
                <el-button
                  type="success"
                  icon="el-icon-zoom-out"
                  @click="zoomOut(petriView2)"
                />
              </el-button-group>
              <el-button-group>
                <el-button
                  type="primary"
                  icon="el-icon-plus"
                  @click="petriView2.NewPlace(35, 45)"
                  >Place</el-button
                >
                <el-button
                  type="primary"
                  icon="el-icon-plus"
                  @click="petriView2.NewTransition(35, 45)"
                  >Transition</el-button
                >
                <el-button
                  type="primary"
                  icon="el-icon-delete"
                  @click="petriView2.RemoveObject()"
                  >删除</el-button
                >
                <el-button
                  type="primary"
                  icon="el-icon-delete-solid"
                  @click="petriView2.clear_paper()"
                  >清空</el-button
                >
              </el-button-group>
              <el-button-group>
                <el-button
                  type="danger"
                  icon="el-icon-video-play"
                  @click="petriView2.run_all()"
                  >执行</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-video-pause"
                  @click="petriView2.stop_all()"
                  >停止</el-button
                >
              </el-button-group>
              <el-button-group>
                <input
                  ref="filechooser3"
                  type="file"
                  style="display: none"
                  @change="petriView2.loadFromFile($event)"
                />
                <el-button
                  type="info"
                  icon="el-icon-upload"
                  :disabled="petriView2.paper == null"
                  @click="loadPetri(petriView2)"
                  >加载</el-button
                >
                <el-button
                  type="info"
                  icon="el-icon-download"
                  @click="petriView2.saveToFile()"
                  >下载</el-button
                >
              </el-button-group>
              <el-button type="text" @click="load_petri_example(petriView2)"
                >示例</el-button
              >
            </el-header>
            <el-main>
              <div ref="petriView2" />
            </el-main>
            <el-footer>
              <el-input
                v-if="
                  petriView2.selectedNodes != null &&
                    petriView2.selectedNodes.node != null
                "
                v-model="petriView2.selectedNodes.node.comment"
                type="textarea"
                :rows="2"
                placeholder="备注"
                clearable
                @input="e => this.$forceUpdate()"
              />
              <el-alert :title="petriView2.statusText" type="info" />
            </el-footer>
          </el-container>
        </el-collapse-item>
        <el-collapse-item title="智能合约预览" name="4">
          <editor
            v-model="content"
            lang="html"
            theme="chrome"
            width="1000"
            height="800"
            @init="editorInit"
          />
        </el-collapse-item>
        <el-collapse-item title="智能合约执行样例" name="5">
          <el-container>
            <el-header>
              <el-button @click="start_process()">执行流程</el-button>
            </el-header>
            <el-main>
              <el-row>
                <p>mask:{{ processState.mask }}</p>
                <p>isFail:{{ processState.isFail }}</p>
                <p>isFinished:{{ processState.isFinished }}</p>
              </el-row>
              <el-row v-for="(task, index) in taskList" :key="index">
                <p>task_mask:{{ task.task_mask }}</p>
                <p>service_name:{{ task.service_name }}</p>
                <p>input:{{ task.results }}</p>
                <p>
                  <el-input
                    v-model="task.result"
                    placeholder="执行结果"
                    clearable
                    @input="e => this.$forceUpdate()"
                  />
                  <el-button @click="finish_task(task)">完成Task</el-button>
                </p>
              </el-row>
            </el-main>
          </el-container>
        </el-collapse-item>
      </el-collapse>
    </el-main>
  </el-container>
</template>
<script>
import BpmnViewer from "bpmn-js";
import Raphael from "raphael";
import dagre from "dagre";
import Web3 from "web3";

import PetriGraph from "./PetriGraph";

const COMPONENT_STATE = {
  READY: 0,
  BPMN_LOADED: 1,
  PETRI_CREATED: 2,
  PETRI_FINISHED: 3,
  SMART_CONTRACT_MAKED: 4
};

export default {
  components: { editor: require("vue2-ace-editor") },
  data() {
    return {
      COMPONENT_STATE: COMPONENT_STATE,
      state: COMPONENT_STATE.READY,
      activeNames: ["1"], // 折叠面板的折叠项
      bpmn: null,
      viewer: null, // BPMN 的视图
      detector: null,
      petriView: new PetriGraph(null), // PetriNet 的数据视图
      petriViewZoom: 1.0,
      petriView2: new PetriGraph(null), // PetriNet 的数据视图
      petriViewZoom2: 1.0,
      edgeMatrix: null,
      content: "",
      web3: null,
      infoContract: null,
      process: null,
      processEvent: null,
      processState: {
        isFail: null,
        isFinished: null,
        mask: null
      },
      taskList: []
    };
  },
  mounted: function() {
    if (typeof web3 !== "undefined") {
      this.web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      this.web3 = new Web3(
        new Web3.providers.WebsocketProvider("ws://10.147.19.68:7545")
      );
    }

    this.web3.eth.defaultAccount = this.web3.eth.accounts[0];
    this.infoContract = new this.web3.eth.Contract(
      [
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint256",
              name: "task_mask",
              type: "uint256"
            },
            {
              indexed: false,
              internalType: "string",
              name: "service_name",
              type: "string"
            },
            {
              indexed: false,
              internalType: "string",
              name: "results",
              type: "string"
            }
          ],
          name: "ServiceCallEvent",
          type: "event"
        },
        {
          inputs: [],
          name: "is_fail",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "is_finish",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "marking",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "task_mask",
              type: "uint256"
            },
            {
              internalType: "bool",
              name: "is_success",
              type: "bool"
            },
            {
              internalType: "string",
              name: "result",
              type: "string"
            }
          ],
          name: "on_task_finish",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256"
            }
          ],
          name: "results",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "start_process",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        }
      ],
      "0x37232816585430CE0695a070093908a4AEf159D7"
    );
    // this.process = this.infoContract.at('0x36ADeB38c503033c8501E0960367cdBEF1726f38')
    this.process = this.infoContract;
    this.processEvent = this.process.events.ServiceCallEvent(
      {},
      {
        fromBlock: 0,
        toBlock: "latest"
      },
      (error, event) => {
        const result = event.returnValues;
        if (!error) {
          this.taskList.push({
            task_mask: result.task_mask,
            service_name: result.service_name,
            results: result.results,
            result: ""
          });
        } else {
          console.log(error);
        }
        this.load_contract();
      }
    );
    // this.processEvent.watch((error, result) => {
    //   if (!error) {
    //     this.taskList.push({
    //       task_mask: result.args.task_mask,
    //       service_name: result.args.service_name,
    //       results: result.args.results,
    //       result: ''
    //     })
    //   } else {
    //     console.log(error)
    //   }
    //   this.load_contract()
    // })
    this.load_contract();
  },
  methods: {
    loadBPMN() {
      if (!this.viewer) {
        this.viewer = new BpmnViewer();
      }
      this.viewer.attachTo(this.$refs["canvas"]);

      const evt = new MouseEvent("click", {
        bubbles: false,
        cancelable: true,
        view: window
      });
      this.$refs["filechooser"].dispatchEvent(evt);
    },
    showBPMN(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      const that = this;
      reader.onloadend = function(e) {
        const fileContent = e.target.result;
        that.viewer
          .importXML(fileContent)
          .then(function(result) {
            const { warnings } = result;
            console.log("success !", warnings);
            that.viewer.get("canvas").zoom("fit-viewport");
            that.state = COMPONENT_STATE.BPMN_LOADED;
            that.bpmn = that.viewer._definitions.diagrams[0]; // 组成元素从 this.bpmn.plane.planeElement中拿到
          })
          .catch(function(err) {
            const { warnings, message } = err;
            console.log("something went wrong:", warnings, message);
          });
      };
      reader.readAsText(file);
    },
    transferToPetri: function() {
      console.info(this.bpmn);
      const elements = this.bpmn.plane.planeElement;
      const graph = {
        places: [],
        trans: [],
        arcs: []
      };

      const get_bpmn_node_end = bpmnElement => {
        switch (bpmnElement.$type) {
          case "bpmn:StartEvent":
          case "bpmn:UserTask":
          case "bpmn:ServiceTask":
          case "bpmn:ParallelGateway":
            return `T_${bpmnElement.id}`;
          case "bpmn:ExclusiveGateway":
            return `P_${bpmnElement.id}`;
          default:
            return null;
        }
      };

      const get_bpmn_node_start = bpmnElement => {
        switch (bpmnElement.$type) {
          case "bpmn:EndEvent":
          case "bpmn:UserTask":
          case "bpmn:ServiceTask":
          case "bpmn:ParallelGateway":
            return `T_${bpmnElement.id}`;
          case "bpmn:ExclusiveGateway":
            return `P_${bpmnElement.id}`;
          default:
            return null;
        }
      };

      const nodeMap = new Map();
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (!element.bpmnElement) continue;
        nodeMap.set(element.bpmnElement.id, element.bpmnElement);
      }

      for (const bpmnElement of nodeMap.values()) {
        switch (bpmnElement.$type) {
          case "bpmn:StartEvent":
            nodeMap.set(bpmnElement.id, bpmnElement);
            graph.places.push({
              key: `P_${bpmnElement.id}`,
              tokens: 1,
              ref: bpmnElement
            });
            graph.trans.push({
              key: `T_${bpmnElement.id}`,
              ref: bpmnElement
            });
            graph.arcs.push({
              from: `P_${bpmnElement.id}`,
              to: `T_${bpmnElement.id}`,
              ref: bpmnElement
            });
            break;
          case "bpmn:EndEvent":
            graph.trans.push({
              key: `T_${bpmnElement.id}`,
              ref: bpmnElement
            });
            graph.places.push({
              key: `P_${bpmnElement.id}`,
              tokens: 0,
              ref: bpmnElement
            });
            graph.arcs.push({
              from: `T_${bpmnElement.id}`,
              to: `P_${bpmnElement.id}`,
              ref: bpmnElement
            });
            break;
          case "bpmn:UserTask":
          case "bpmn:ServiceTask":
          case "bpmn:ParallelGateway":
            graph.trans.push({
              key: `T_${bpmnElement.id}`,
              ref: bpmnElement
            });
            break;
          case "bpmn:ExclusiveGateway":
            graph.places.push({
              key: `P_${bpmnElement.id}`,
              tokens: 1,
              ref: bpmnElement
            });
            break;
          case "bpmn:SequenceFlow":
            {
              const source = nodeMap.get(bpmnElement.sourceRef.id);
              const target = nodeMap.get(bpmnElement.targetRef.id);
              if (
                source.$type === "bpmn:ExclusiveGateway" &&
                target.$type === "bpmn:ExclusiveGateway"
              ) {
                graph.trans.push({
                  key: `T_${bpmnElement.id}`,
                  ref: bpmnElement
                });
                graph.arcs.push({
                  from: get_bpmn_node_end(
                    nodeMap.get(bpmnElement.sourceRef.id)
                  ),
                  to: `T_${bpmnElement.id}`,
                  ref: bpmnElement
                });
                graph.arcs.push({
                  from: `T_${bpmnElement.id}`,
                  to: get_bpmn_node_start(
                    nodeMap.get(bpmnElement.targetRef.id)
                  ),
                  ref: bpmnElement
                });
              } else if (source.$type === "bpmn:ExclusiveGateway") {
                graph.trans.push({
                  key: `T_${bpmnElement.id}`,
                  ref: bpmnElement
                });
                graph.places.push({
                  key: `P_${bpmnElement.id}`,
                  tokens: 0,
                  ref: bpmnElement
                });
                graph.arcs.push({
                  from: get_bpmn_node_end(
                    nodeMap.get(bpmnElement.sourceRef.id)
                  ),
                  to: `T_${bpmnElement.id}`,
                  ref: bpmnElement
                });
                graph.arcs.push({
                  from: `T_${bpmnElement.id}`,
                  to: `P_${bpmnElement.id}`,
                  ref: bpmnElement
                });
                graph.arcs.push({
                  from: `P_${bpmnElement.id}`,
                  to: get_bpmn_node_start(
                    nodeMap.get(bpmnElement.targetRef.id)
                  ),
                  ref: bpmnElement
                });
              } else if (target.$type === "bpmn:ExclusiveGateway") {
                graph.trans.push({
                  key: `T_${bpmnElement.id}`,
                  ref: bpmnElement
                });
                graph.places.push({
                  key: `P_${bpmnElement.id}`,
                  tokens: 0,
                  ref: bpmnElement
                });
                graph.arcs.push({
                  from: get_bpmn_node_end(
                    nodeMap.get(bpmnElement.sourceRef.id)
                  ),
                  to: `P_${bpmnElement.id}`,
                  ref: bpmnElement
                });
                graph.arcs.push({
                  from: `P_${bpmnElement.id}`,
                  to: `T_${bpmnElement.id}`,
                  ref: bpmnElement
                });
                graph.arcs.push({
                  from: `T_${bpmnElement.id}`,
                  to: get_bpmn_node_start(
                    nodeMap.get(bpmnElement.targetRef.id)
                  ),
                  ref: bpmnElement
                });
              } else {
                graph.places.push({
                  key: `P_${bpmnElement.id}`,
                  tokens: 0,
                  ref: bpmnElement
                });
                graph.arcs.push({
                  from: get_bpmn_node_end(
                    nodeMap.get(bpmnElement.sourceRef.id)
                  ),
                  to: `P_${bpmnElement.id}`,
                  ref: bpmnElement
                });
                graph.arcs.push({
                  from: `P_${bpmnElement.id}`,
                  to: get_bpmn_node_start(
                    nodeMap.get(bpmnElement.targetRef.id)
                  ),
                  ref: bpmnElement
                });
              }
            }
            break;
          default:
            console.info(bpmnElement.$type);
        }
      }

      // console.info(nodeMap)
      // console.info(graph)
      const g = new dagre.graphlib.Graph();
      g.setGraph({});
      g.setDefaultEdgeLabel(function() {
        return {};
      });
      for (let i = 0; i < graph.places.length; i++) {
        g.setNode(graph.places[i].key, {
          label: "mmmmm",
          width: 100,
          height: 100
        });
      }
      for (let i = 0; i < graph.trans.length; i++) {
        g.setNode(graph.trans[i].key, { label: "xxx", width: 30, height: 100 });
      }
      for (let i = 0; i < graph.arcs.length; i++) {
        g.setEdge(graph.arcs[i].from, graph.arcs[i].to);
      }
      g.rankdir = "LR";
      dagre.layout(g, {
        rankdir: "LR",
        height: this.petriView.PAPER_HEIGHT,
        width: this.petriView.PAPER_WIDTH
      });

      const map_place = place => {
        const gNode = g.node(place.key);
        const { $type, name, id, $attrs, extensionElements } = place.ref;
        return {
          key: place.key,
          x: gNode.y,
          y: gNode.x,
          tokens: place.tokens,
          comment: JSON.stringify({
            id: id,
            name: name,
            $type: $type,
            $attrs: $attrs,
            extension:
              extensionElements &&
              extensionElements.values &&
              extensionElements.values.length > 0 &&
              extensionElements.values.$children &&
              extensionElements.values.$children.length > 0
                ? extensionElements.values.map(e => {
                    return {
                      key: e.name,
                      value: e.$children[0].$body
                    };
                  })
                : []
          })
        };
      };

      const map_trans = trans => {
        const gNode = g.node(trans.key);
        const { $type, name, id, $attrs, extensionElements } = trans.ref;
        return {
          key: trans.key,
          x: gNode.y,
          y: gNode.x,
          comment: JSON.stringify({
            id: id,
            name: name,
            $type: $type,
            $attrs: $attrs,
            extension:
              extensionElements &&
              extensionElements.values &&
              extensionElements.values.length > 0 &&
              extensionElements.values.$children &&
              extensionElements.values.$children.length > 0
                ? extensionElements.values.map(e => {
                    return {
                      key: e.name,
                      value: e.$children[0].$body
                    };
                  })
                : []
          })
        };
      };

      const map_arcs = arc => {
        const { $type, name, id, $attrs, extensionElements } = arc.ref;
        return {
          from: arc.from,
          to: arc.to,
          comment: JSON.stringify({
            id: id,
            name: name,
            $type: $type,
            $attrs: $attrs,
            extension:
              extensionElements &&
              extensionElements.values &&
              extensionElements.values.length > 0 &&
              extensionElements.values.$children &&
              extensionElements.values.$children.length > 0
                ? extensionElements.values.map(e => {
                    return {
                      key: e.name,
                      value: e.$children[0].$body
                    };
                  })
                : []
          })
        };
      };
      this.petriView.DeserializePnet({
        places: graph.places.map(map_place),
        trans: graph.trans.map(map_trans),
        arcs: graph.arcs.map(map_arcs)
      });
      nodeMap.clear();
      this.state = COMPONENT_STATE.PETRI_CREATED;
    },
    optimizePetri() {
      // 默认Petri网无环
      const { places, trans, arcs } = JSON.parse(
        this.petriView.SerializePnet()
      );
      let count = 0;
      const edgeMatrix = [];
      const placeKeyIdMap = new Map();
      const transKeyIdMap = new Map();
      for (let i = 0; i < places.length; i++) {
        edgeMatrix[i] = Array.from({ length: trans.length });
        placeKeyIdMap.set(places[i].key, i);
      }
      for (let i = 0; i < trans.length; i++) {
        transKeyIdMap.set(trans[i].key, i);
      }
      for (let i = 0; i < arcs.length; i++) {
        const arc = arcs[i];
        if (arc.from.substr(0, 1) === "P") {
          edgeMatrix[placeKeyIdMap.get(arc.from)][transKeyIdMap.get(arc.to)] = {
            value: -1,
            ref: [arc]
          };
        } else {
          edgeMatrix[placeKeyIdMap.get(arc.to)][transKeyIdMap.get(arc.from)] = {
            value: 1,
            ref: [arc]
          };
        }
      }

      const combine = (m1, m2) => {
        if (m1 == null) return m2;
        if (m2 == null) return m1;
        return {
          value: m1.value + m2.value, // 此处不考虑有环的情况 正常的话 +1 + -1 = ‘环’，此处直接按 0 处理(消去)
          ref: [...m1.ref, ...m2.ref]
        };
      };

      const hasTask = m => {
        if (m == null) return false;
        for (let i = 0; i < m.ref.length; i++) {
          const arc = m.ref[i];
          if (arc.from.substr(0, 1) === "T") {
            const comment = trans[transKeyIdMap.get(arc.from)].comment;
            if (
              comment != null &&
              (comment.indexOf("Task") > 0 ||
                comment.indexOf("bpmn:SequenceFlow") > 0 ||
                comment.indexOf("bpmn:ParallelGateway") > 0)
            ) {
              return true;
            }
          }
          if (arc.to.substr(0, 1) === "T") {
            const comment = trans[transKeyIdMap.get(arc.to)].comment;
            if (
              comment &&
              (comment.indexOf("Task") > 0 ||
                comment.indexOf("bpmn:SequenceFlow") > 0 ||
                comment.indexOf("bpmn:ParallelGateway") > 0)
            ) {
              return true;
            }
          }
        }
        return false;
      };

      const valueOfM = m => {
        if (m == null) return 0;
        return m.value;
      };

      console.info(
        "规约前：",
        edgeMatrix.map(row => row.map(item => Object.assign({}, item)))
      );
      // 进行规约
      do {
        count = 0;
        // reudce 矩阵同行恰好只有一个 +1 和一个 -1时：
        for (let i = 0; i < edgeMatrix.length; i++) {
          if (
            edgeMatrix[i]
              .map(edge => (edge && edge.value > 0 ? 1 : 0))
              .reduce((x, y) => x + y, 0) === 1 &&
            edgeMatrix[i]
              .map(edge => (edge && edge.value < 0 ? 1 : 0))
              .reduce((x, y) => x + y, 0) === 1
          ) {
            const x = edgeMatrix[i].findIndex(edge => edge && edge.value === 1);
            const y = edgeMatrix[i].findIndex(
              edge => edge && edge.value === -1
            );
            if (hasTask(edgeMatrix[i][x]) && hasTask(edgeMatrix[i][y]))
              continue;
            for (let j = 0; j < edgeMatrix.length; j++) {
              edgeMatrix[j][x] = combine(edgeMatrix[j][x], edgeMatrix[j][y]);
            }
            for (let j = 0; j < edgeMatrix.length; j++) {
              if (edgeMatrix[j][x] && edgeMatrix[j][x].value === -1) {
                edgeMatrix[j][x] = combine(edgeMatrix[j][x], edgeMatrix[i][x]);
              }
              if (edgeMatrix[j][y] && edgeMatrix[j][y] === 1) {
                edgeMatrix[j][y] = combine(edgeMatrix[j][y], edgeMatrix[i][y]);
              }
              edgeMatrix[j].splice(y, 1);
            }
            edgeMatrix.splice(i, 1);
            console.info(
              "规约1：(行，列，列)",
              i,
              x,
              y,
              edgeMatrix.map(row => row.map(item => Object.assign({}, item)))
            );
            i--; // 少了1行
            count++;
          }
        }
        // 同一列有且只有一个+1 和 一个-1时：
        for (let i = 0; i < edgeMatrix[0].length; i++) {
          if (
            edgeMatrix
              .map(row => (row[i] && row[i].value > 0 ? 1 : 0))
              .reduce((x, y) => x + y, 0) === 1 &&
            edgeMatrix
              .map(row => (row[i] && row[i].value < 0 ? 1 : 0))
              .reduce((x, y) => x + y, 0) === 1
          ) {
            const x = edgeMatrix.findIndex(row => row[i] && row[i].value === 1);
            const y = edgeMatrix.findIndex(
              row => row[i] && row[i].value === -1
            );
            if (
              edgeMatrix[x]
                .map(edge => (edge && edge.value > 0 ? 1 : 0))
                .reduce((x, y) => x + y, 0) === 1 ||
              edgeMatrix[y]
                .map(edge => (edge && edge.value < 0 ? 1 : 0))
                .reduce((x, y) => x + y, 0) === 1
            ) {
              if (hasTask(edgeMatrix[x][i]) && hasTask(edgeMatrix[y][i]))
                continue;
              const current_cloumns = edgeMatrix[0].length;
              for (let j = 0; j < current_cloumns; j++) {
                edgeMatrix[x][j] = combine(edgeMatrix[x][j], edgeMatrix[y][j]);
              }
              edgeMatrix.splice(y, 1);
              for (let j = 0; j < edgeMatrix.length; j++) {
                edgeMatrix[j].splice(i, 1);
              }
              console.info(
                "规约2：(列，行, 行)",
                i,
                x,
                y,
                edgeMatrix.map(row => row.map(item => Object.assign({}, item)))
              );
              i--;
              count++;
            }
            // else {
            //     // 多列只有一个 +1 和 一个 -1，合并两行，不考虑有环的情况（由正常bpmn转换出的不会有环）  先不实现
            //     // 当前的第i列只有一个 +1 和 一个 -1，再找一列即可
            //     for (let j = i + 1; j < edgeMatrix[0].length; j++) {
            //       if (edgeMatrix[x][j] && edgeMatrix[x][j].value === 1 &&
            //         edgeMatrix[y][j] && edgeMatrix[y][j].value === -1 &&
            //         edgeMatrix.every((row, column) => column === x || row[j] !== 1) &&
            //         edgeMatrix.every((row, column) => column === y || row[j] !== -1)
            //       ) {
            //         // x，y 两行相加，去除 所有满足的列
            //       }
            //     }
            //   }
          }
        }
        // 某几列完全相同，合并为一列
        for (let i = 0; i < edgeMatrix[0].length; i++) {
          for (let j = i + 1; j < edgeMatrix[0].length; j++) {
            if (
              edgeMatrix.every(row => valueOfM(row[i]) === valueOfM(row[j]))
            ) {
              for (let k = 0; k < edgeMatrix.length; k++) {
                edgeMatrix[k][i] = combine(edgeMatrix[k][i], edgeMatrix[k][j]);
                edgeMatrix[k].splice(j, 1);
              }
              console.info(
                "规约3：(列, 列)",
                i,
                j,
                edgeMatrix.map(row => row.map(item => Object.assign({}, item)))
              );
              j--;
              count++;
            }
          }
        }
        // 某几行完全相同，合并为一行
        for (let i = 0; i < edgeMatrix.length; i++) {
          for (let j = i + 1; j < edgeMatrix.length; j++) {
            if (
              edgeMatrix[i].every(
                (val, index) => valueOfM(val) === valueOfM(edgeMatrix[j][index])
              )
            ) {
              for (let k = 0; k < edgeMatrix[i].length; k++) {
                edgeMatrix[i][k] = combine(edgeMatrix[i][k], edgeMatrix[j][k]);
              }
              edgeMatrix.splice(j, 1);
              console.info(
                "规约4：(行，行)",
                i,
                j,
                edgeMatrix.map(row => row.map(item => Object.assign({}, item)))
              );
              j--;
              count++;
            }
          }
        }
      } while (count > 0);

      this.edgeMatrix = edgeMatrix;
      console.info("规约后：", Object.assign({}, edgeMatrix));
      const startPlace = edgeMatrix.findIndex(row =>
        row.every(item => item == null || item.value <= 0)
      );

      const g = new dagre.graphlib.Graph();
      g.setGraph({});
      g.setDefaultEdgeLabel(function() {
        return {};
      });
      for (let i = 0; i < edgeMatrix.length; i++) {
        g.setNode(`P_${i}`, { label: "mmmmm", width: 100, height: 100 });
      }
      for (let i = 0; i < edgeMatrix[0].length; i++) {
        g.setNode(`T_${i}`, { label: "xxx", width: 30, height: 100 });
      }
      for (let i = 0; i < edgeMatrix.length; i++) {
        for (let j = 0; j < edgeMatrix[0].length; j++) {
          if (edgeMatrix[i][j] && edgeMatrix[i][j].value !== 0) {
            if (edgeMatrix[i][j].value === 1) {
              g.setEdge(`T_${j}`, `P_${i}`);
            } else {
              g.setEdge(`P_${i}`, `T_${j}`);
            }
          }
        }
      }
      g.rankdir = "LR";
      dagre.layout(g, {
        rankdir: "LR",
        height: this.petriView.PAPER_HEIGHT,
        width: this.petriView.PAPER_WIDTH
      });

      this.petriView2.DeserializePnet({
        places: this.edgeMatrix.map((row, i) => {
          return {
            key: `P_${i}`,
            x: g.node(`P_${i}`).y,
            y: g.node(`P_${i}`).x,
            tokens: startPlace === i ? 1 : 0
          };
        }),
        trans: this.edgeMatrix[0].map((val, i) => {
          const transSet = new Set();
          this.edgeMatrix
            .map(row => row[i])
            .filter(item => item && item.ref && item.ref.length > 0)
            .forEach(item => {
              item.ref.forEach(arc => {
                if (arc.from.substr(0, 1) === "T") {
                  const comment = trans[transKeyIdMap.get(arc.from)].comment;
                  transSet.add(comment);
                }
                if (arc.to.substr(0, 1) === "T") {
                  const comment = trans[transKeyIdMap.get(arc.to)].comment;
                  transSet.add(comment);
                }
              });
            });
          return {
            key: `T_${i}`,
            x: g.node(`T_${i}`).y,
            y: g.node(`T_${i}`).x,
            comment: JSON.stringify(
              [...transSet]
                .filter(
                  comment =>
                    comment.indexOf("Task") > 0 ||
                    comment.indexOf("bpmn:SequenceFlow") > 0 ||
                    comment.indexOf("bpmn:ParallelGateway") > 0
                )
                .map(comment => JSON.parse(comment))
            )
          };
        }),
        arcs: g.edges().map(edge => {
          return {
            from: edge.v,
            to: edge.w
          };
        })
      });
      this.state = COMPONENT_STATE.PETRI_FINISHED;
    },
    transfer2sc() {
      const init_state = this.edgeMatrix.findIndex(row =>
        row.every(item => item == null || item.value <= 0)
      );
      const end_state = this.edgeMatrix.findIndex(row =>
        row.every(item => item == null || item.value >= 0)
      );
      let transCodes = "";
      let step_next = "";
      for (let i = 0; i < this.edgeMatrix[0].length; i++) {
        let mask = 0;
        let next_mask = 0;
        for (let j = 0; j < this.edgeMatrix.length; j++) {
          if (
            this.edgeMatrix[j][i] != null &&
            this.edgeMatrix[j][i].value === -1
          ) {
            mask += 1 << j;
          }
          if (
            this.edgeMatrix[j][i] != null &&
            this.edgeMatrix[j][i].value === 1
          ) {
            next_mask += 1 << j;
          }
        }
        transCodes = `${transCodes}
            if(task_mask & ${mask} == ${mask}){
                change_marking(${mask},${next_mask});
            }
        `;
        const task_comment = JSON.parse(
          this.petriView2.getByKey(`T_${i}`).comment
        )[0];
        const task_type = task_comment.$type;
        if (task_type === "bpmn:UserTask") {
          step_next = `${step_next}
          if(marking & ${mask} == ${mask}){
            call_task('${task_comment.name}',${mask});
          }
        `;
        } else {
          step_next = `${step_next}
          if(marking & ${mask} == ${mask}){
            change_marking(${mask},${next_mask});
            return;
          }
        `;
        }
      }
      step_next = `${step_next}
          if(marking & ${1 << end_state} == ${1 << end_state}){
            is_finish = true;
          }
        `;

      this.content = `
pragma solidity ^0.4.0;

contract  Process{
    uint public marking = ${1 << init_state};
    bool public is_finish = false;
    bool public is_fail = false;
    string[] public results;

    event ServiceCallEvent(uint task_mask,string service_name,string[] results);

    function call_task(uint task_mask,string service_name) internal {
        emit ServiceCallEvent(task_mask,service_name,results);
    }
    function change_marking(uint task_mask,uint next_pool_mask) internal {
        marking = marking & (~task_mask) | next_pool_mask;
        step_next();
    }

    function start_process(){
        step_next();
    }
    //某一个Task完成后，检查对应的task_mask(Place的状态),清除当前状态，转移到下一个状态
    function on_task_finish(uint task_mask, bool is_success, string result){
        if(is_success){ //转移到下一个状态
            results.push(result);
            ${transCodes}
        }else{
            is_fail = true;
        }
    }

    function step_next() internal {
        //依次检查每个trans的前置Place是否被满足，如满足则执行它
        ${step_next}
    }
}`;
    },
    initPetriFrame() {
      const viewNode = this.$refs["petriView"];
      this.$nextTick(() => {
        this.petriView.PAPER_WIDTH = viewNode.clientWidth;
        this.petriView.PAPER_HEIGHT = viewNode.clientHeight;

        if (!this.petriView.paper) {
          const paper = new Raphael(
            viewNode,
            this.petriView.PAPER_WIDTH,
            this.petriView.PAPER_HEIGHT
          );
          this.petriView.paper = paper;
          this.petriViewZoom = 1.0;
        }

        this.petriView.statusText = "Ready!";
      });
    },
    initPetriFrame2() {
      const viewNode = this.$refs["petriView2"];
      this.$nextTick(() => {
        this.petriView2.PAPER_WIDTH = viewNode.clientWidth;
        this.petriView2.PAPER_HEIGHT = viewNode.clientHeight;

        if (!this.petriView2.paper) {
          const paper = new Raphael(
            viewNode,
            this.petriView2.PAPER_WIDTH,
            this.petriView2.PAPER_HEIGHT
          );
          this.petriView2.paper = paper;
          this.petriViewZoom2 = 1.0;
        }

        this.petriView2.statusText = "Ready!";
      });
    },
    loadPetri(view) {
      const evt = new MouseEvent("click", {
        bubbles: false,
        cancelable: true,
        view: window
      });
      if (view === this.petriView) {
        this.$refs["filechooser2"].dispatchEvent(evt);
      } else {
        this.$refs["filechooser3"].dispatchEvent(evt);
      }
    },
    load_petri_example(view) {
      view.clear_paper();
      view.DeserializePnet({
        places: [
          { key: "P1", x: 383, y: 303, tokens: 1 },
          { key: "P2", x: 384, y: 219, tokens: 1 },
          { key: "P3", x: 385, y: 147, tokens: 1 },
          { key: "P4", x: 632, y: 218, tokens: 1 }
        ],
        trans: [
          { key: "T1", x: 497, y: 301 },
          { key: "T2", x: 497, y: 224 },
          { key: "T4", x: 495, y: 151 }
        ],
        arcs: [
          { from: "P1", to: "T1" },
          { from: "P2", to: "T2" },
          { from: "P4", to: "T1" },
          { from: "T4", to: "P4" },
          { from: "T4", to: "P1" },
          { from: "T4", to: "P2" },
          { from: "T4", to: "P3" },
          { from: "T1", to: "P4" },
          { from: "T2", to: "P4" },
          { from: "P4", to: "T2" },
          { from: "P3", to: "T4" },
          { from: "P4", to: "T4" }
        ]
      });
    },
    zoomIn(view) {
      // this.petriViewZoom = this.petriViewZoom * 4 / 3.0
      const { places, trans, arcs } = JSON.parse(view.SerializePnet());
      view.clear_paper();
      view.DeserializePnet({
        places: places.map(p => {
          p.x = (p.x * 4) / 3.0;
          p.y = (p.y * 4) / 3.0;
          return p;
        }),
        trans: trans.map(p => {
          p.x = (p.x * 4) / 3.0;
          p.y = (p.y * 4) / 3.0;
          return p;
        }),
        arcs: arcs
      });
    },
    zoomOut(view) {
      // this.petriViewZoom = this.petriViewZoom * 3.0 / 4.0
      const { places, trans, arcs } = JSON.parse(view.SerializePnet());
      view.clear_paper();
      view.DeserializePnet({
        places: places.map(p => {
          p.x = (p.x * 3.0) / 4.0;
          p.y = (p.y * 3.0) / 4.0;
          return p;
        }),
        trans: trans.map(p => {
          p.x = (p.x * 3.0) / 4.0;
          p.y = (p.y * 3.0) / 4.0;
          return p;
        }),
        arcs: arcs
      });
    },
    onCollapseChange(val) {
      // console.log(val)
      if (val.indexOf("2") >= 0) {
        this.initPetriFrame();
      }
      if (val.indexOf("3") >= 0) {
        this.initPetriFrame2();
      }
    },
    editorInit: function() {
      require("brace/ext/language_tools"); // language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); // language
      require("brace/mode/less");
      require("brace/theme/chrome");
      require("brace/snippets/javascript"); // snippet
    },
    load_contract: function() {
      if (this.process == null) return;
      this.process.methods.is_fail().call({}, (error, result) => {
        if (!error) {
          this.processState.isFail = result;
        } else {
          console.error(error);
        }
      });
      this.process.methods.is_finish().call({}, (error, result) => {
        if (!error) {
          this.processState.isFinished = result;
        } else {
          console.error(error);
        }
      });
      this.process.methods.marking().call({}, (error, result) => {
        if (!error) {
          this.processState.mask = result;
        } else {
          console.error(error);
        }
      });
    },
    start_process: function() {
      if (this.process) {
        this.process.methods
          .start_process()
          .send({
            from: "0x7bB97F18C19a7b5Bf814fedE7216Ea26A8a7c350",
            gas: 900000
          })
          .on("transactionHash", function(hash) {
            console.info("流程已启动,交易hash：", hash);
          })
          .on("receipt", function(receipt) {
            console.info("receipt", receipt);
          })
          .on("confirmation", function(confirmationNumber, receipt) {
            console.info("confirmationNumber", confirmationNumber);
          })
          .on("error", console.error);
      }
    },
    finish_task(task) {
      if (this.process) {
        this.process.methods
          .on_task_finish(task.task_mask, true, task.result)
          .send({
            from: "0x7bB97F18C19a7b5Bf814fedE7216Ea26A8a7c350",
            gas_price: 30000000000,
            gas: 900000
          })
          .on("transactionHash", function(hash) {
            console.info("已提交执行结果,交易hash：", hash);
          })
          .on("receipt", function(receipt) {
            console.info("receipt", receipt);
          })
          .on("confirmation", function(confirmationNumber, receipt) {
            console.info("confirmationNumber", confirmationNumber);
          })
          .on("error", console.error);
      }
    }
  }
};

const raphael_arrows_extends = function() {
  /**
   * Create a set that will contain a path for the arrow line and a path for the arrow head.
   */
  Raphael.fn.arc = function(x1, y1, x2, y2, r) {
    var paper = this;
    var arrow = paper.set();

    var x3 = Math.min(x1, x2) + (Math.max(x1, x2) - Math.min(x1, x2)) / 2;
    var y3 = Math.min(y1, y2) + (Math.max(y1, y2) - Math.min(y1, y2)) / 2;

    arrow.push(
      paper
        .path(triangle(x3, y3 - r / 2, r))
        .rotate(arrowHeadAngle(x1, y1, x3, y3), x3, y3)
    );
    arrow.push(paper.path(line(x1, y1, x2, y2)));

    arrow[0].attr({ fill: "brown", "stroke-width": "1", stroke: "gray" });
    arrow[1].attr({ "stroke-width": "2", stroke: "brown" });

    return arrow;

    /**
     * Calculate angle to rotate arrow head by
     * This function was inspired by: http://taitems.tumblr.com/post/549973287/drawing-arrows-in-raphaeljs
     */
    function arrowHeadAngle(x1, y1, x2, y2) {
      var angle = Math.atan2(x1 - x2, y2 - y1);
      angle = (angle / (2 * Math.PI)) * 360 + 180;
      return angle;
    }

    /**
     * String that represents a line path on canvas
     * Adapted from raphael.primitives.js
     * For more info visit: https://github.com/DmitryBaranovskiy/raphael
     */
    function line(x1, y1, x2, y2) {
      return ["M", x1, y1, "L", x2, y2];
    }

    /**
     * String that represents a triangle path on canvas
     * Adapted from raphael.primitives.js
     * For more info visit: https://github.com/DmitryBaranovskiy/raphael
     */
    function triangle(cx, cy, r) {
      r *= 1.75;
      return "M".concat(
        cx,
        ",",
        cy,
        "m0-",
        r * 0.58,
        "l",
        r * 0.5,
        ",",
        r * 0.87,
        "-",
        r,
        ",0z"
      );
    }
  };
};
raphael_arrows_extends();
</script>
