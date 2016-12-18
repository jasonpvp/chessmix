import React, { propTypes } from 'react'

export class Network extends React.Component {
  render () {
    // https://github.com/cazala/synaptic/wiki/Networks#tojsonfromjson
    const { networkJson, size } = this.props
    const { neurons, connections } = networkJson
    const sqrt = Math.ceil(Math.sqrt(neurons.length))
    const mask = Array(sqrt).fill(0)
    const nodes = mask.reduce((ni, _, i) => {
      return mask.reduce((nj, _, j) => {
        const index = (i * sqrt + j).toString()
        const neuron = neurons[index]
        if (!neuron || index < 256) return nj
        const conns = connections.filter(c => c.to === index)
        let connWeight
        if (conns.length > 0) {
          connWeight = conns.reduce((sum, c) => sum + c.weight, 0) / conns.length
          nj.push(<div key={`n${i}-${j}`} style={neuronStyle(neuron, connWeight, i, j, size)}></div>)
        }
        return nj
      }, ni)
    }, [])

    return (
      <div>
        {nodes}
      </div>
    )
  }
}

function neuronStyle (neuron, connWeight, i, j, size) {
  return {
    position: 'absolute',
    top: `${i * size}px`,
    left: `${j * size}px`,
    width: `${size}px`,
    height: `${size}px`,
    background: neuronBackgroundColor(neuron, connWeight),
    border: `solid 1px ${neuronBorderColor(neuron)}`,
    fontSize: '2px'
  }
}

function neuronBackgroundColor (neuron, avgWeight) {
  const blue = biasToHex(neuron.bias * 2)
  const green = biasToHex(avgWeight, 128)
  const red = biasToHex((neuron.bias + avgWeight) / 2, 64)
  return `#${red}${green}${blue}`
}

function neuronBorderColor (neuron) {
  const blue = biasToHex(neuron.bias)
  const green = biasToHex(neuron.bias, 128)
  return `#00${green}${blue}`
}

function biasToHex (bias, scale = 255) {
  return Math.floor((bias + 1) / 2 * scale).toString(16)
}
