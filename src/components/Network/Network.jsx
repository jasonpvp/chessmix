import React, { propTypes } from 'react'

export class Network extends React.Component {
  render () {
    // https://github.com/cazala/synaptic/wiki/Networks#tojsonfromjson
    const { networkJson, size } = this.props
    const { neurons } = networkJson
    const sqrt = Math.ceil(Math.sqrt(neurons.length))
    const mask = Array(sqrt).fill(0)
    const nodes = mask.reduce((ni, _, i) => {
      return mask.reduce((nj, _, j) => {
        const index = i * sqrt + j
        if (!neurons[index]) return nj
        nj.push(<div key={`n${i}-${j}`} style={neuronStyle(neurons[index], i, j, size)}></div>)
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

function neuronStyle (neuron, i, j, size) {
  return {
    position: 'absolute',
    top: `${i * size}px`,
    left: `${j * size}px`,
    width: `${size}px`,
    height: `${size}px`,
    background: neuronBackgroundColor(neuron),
    border: `solid 1px ${neuronBorderColor(neuron)}`,
    fontSize: '2px'
  }
}

function neuronBackgroundColor (neuron) {
  const blue = biasToHex(neuron.bias * 3)
  const green = biasToHex(neuron.bias, 150)
  const red = biasToHex(neuron.bias, 100)
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
