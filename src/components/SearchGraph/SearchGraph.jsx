import React, { PropTypes } from 'react'
import suitClassNames from 'suitcss-classnames'
require('./SearchGraph.scss')

export class SearchGraph extends React.Component {
  static propTypes = {
    levels: PropTypes.arrayOf(PropTypes.shape({
      depth: PropTypes.number,
      hist: PropTypes.shape({
        static: PropTypes.object,
        predictive: PropTypes.object
      })
    }))
  }

  classNames (options) {
    return suitClassNames({
      namespace: 'chesster',
      component: 'SearchGraph',
      ...options
    })
  }

  render () {
    const { levels } = this.props
    const graphClassNames = this.classNames()
    const rowClassNames = this.classNames({descendant: 'row'})
    const rows = levels.map(level => {
      return (
        <div key={level.depth} className={rowClassNames}>
          <HistHeatBar key='static' total={level.counts.static} data={level.hist.static} />
          <HistHeatBar key='predictive' total={level.counts.predictive} data={level.hist.predictive} />
        </div>
      )
    })

    return (
      <div className={graphClassNames}>
        Search histogram
        {rows}
      </div>
    )
  }
}

class HistHeatBar extends React.Component {
  classNames (options) {
    return suitClassNames({
      namespace: 'chesster',
      component: 'HistHeatBar',
      ...options
    })
  }

  render () {
    const { data, total } = this.props
    const classNames = this.classNames()
    const bucketClassNames = this.classNames({descendant: 'bucket'})
    const buckets = Object.keys(data).sort().map((score, i) => {
      const count = data[score]
      const scoreLimit = 20
      if (Math.abs(score) > scoreLimit) score = scoreLimit * Math.sign(score)
      console.log('score: %s, count: %s, total: %s, color: %s', score, count, total, bucketColor(score / scoreLimit, count / total))

      let style = {
        background: bucketColor(score / scoreLimit, count / total),
        left: (score * 10 + 200) + 'px'
      }
      return <div key={i} className={bucketClassNames} style={style} />
    })

    return (
      <div className={classNames}>
        {buckets}
      </div>
    )
  }
}

// score should be from -1 to 1
// pct should be from 0 to 1
function bucketColor (score, pct) {
  const gray = 128 + Math.floor(score * 127)
  const alpha = pct * 0.75 + 0.25
  var c = `rgba(${gray},${gray},${gray},${alpha})`
  return c
}
