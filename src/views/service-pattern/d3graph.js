import * as d3 from 'd3'
import Neo4jD3 from './neo4jd3'

export class D3Graph {
  constructor() {
    this.reset()
  }

  refresh(graph) {
    this.d3data = graph
    // d3.selectAll('#neo4jd3 .relationship').remove();
    // d3.selectAll('#neo4jd3 .node').remove();
    this.neo4jd3.updateWithD3Data(this.d3data)
  }

  reset() {
    if (this.neo4jd3) {
      delete this.neo4jd3
    }
    d3.selectAll('#neo4jd3 g.relationships *').remove()
    d3.selectAll('#neo4jd3 g.nodes *').remove()
    this.neo4jd3 = new Neo4jD3('#neo4jd3', {
      highlight: [],
      minCollision: 60,
      nodeRadius: 25,
      neo4jData: {
        'results': [{
          'columns': ['user', 'entity'],
          'data': [{
            'graph': {
              'nodes': [],
              'relationships': []
            }
          }]
        }]
      },
      // onNodeDoubleClick: function(node) {
      //   switch (node.id) {
      //     case '25':
      //       // Google
      //       window.open(node.properties.url, '_blank')
      //       break
      //     default:
      //       var maxNodes = 5
      //       var data = neo4jd3.randomD3Data(node, maxNodes)
      //       neo4jd3.updateWithD3Data(data)
      //       break
      //   }
      // },
      onRelationshipDoubleClick: function(relationship) {
        console.log('double click on relationship: ' + JSON.stringify(relationship))
      },
      zoomFit: true
    })
  }
}

// class D3Transfer {
//   constructor(graph) {
//     this.nodes = [... graph.nodes.values()].map(node => {
//       return {
//         id: node.id,
//         labels: [node.$type],
//         properties: node
//       }
//     })
//     this.relationships = graph.edges.map(edge => {
//       const edgeProps = Object.assign({}, edge)
//       delete edgeProps.graph
//
//       const fromNode = graph.getNode(edge.from)
//       const endNode = graph.getNode(edge.to)
//       const fault = graph.getRoot()
//
//       if (fromNode == null || endNode == null) {
//         return null
//       }
//
//       if (endNode.$is_sub_graph) {
//         edgeProps['概率'] = `${(endNode.defaultFrequency(fault.id)[fault.id] / endNode.defaultQuantum() * 100).toFixed(2)}%`
//       }
//
//       if (endNode.$type == 'Reason') {
//         if (fault.frequency != null && fault.quantum != null) {
//           edgeProps['概率'] = `${(fault.frequency[edge.to] / fault.quantum * 100).toFixed(2)}%`
//         } else {
//           edgeProps['概率'] = `${(endNode.probability * 100).toFixed(2)}%`
//         }
//       }
//
//       return {
//         'id': edge.id,
//         'type': edge.linkType(),
//         'startNode': edge.from,
//         'endNode': edge.to,
//         'properties': edgeProps,
//         'source': edge.from,
//         'target': edge.to,
//         'linknum': 1
//       }
//     }).filter(x => x != null)
//   }
// }
