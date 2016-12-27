import React, { PropTypes } from 'react'
import suitClassNames from 'suitcss-classnames'
require('./SearchGraph.scss')

export class SearchGraph extends React.Component {
  static propTypes = {
    currentDepth: PropTypes.number,
    searchStats: PropTypes.shape({
      levels: PropTypes.arrayOf(PropTypes.shape({
        depth: PropTypes.number,
        hist: PropTypes.shape({
          static: PropTypes.object,
          predictive: PropTypes.object
        })
      }))
    })
  }

  classNames (options) {
    return suitClassNames({
      namespace: 'chesster',
      component: 'SearchGraph',
      ...options
    })
  }

  componentDidUpdate () {
    this.refs.pane.scrollTop = this.props.currentDepth * 24
  }

  render () {
    const { currentDepth, searchStats: {levels} } = this.props
    const graphClassNames = this.classNames()
    const hLegendClassNames = this.classNames({descendant: 'hLegend'})
    const paneClassNames = this.classNames({descendant: 'pane'})
    const centerClassNames = this.classNames({descendant: 'center'})
    const rows = levels.map((level, i) => {
      if (!level) {
        console.log(`level ${i} null`)
        return null
      }
      const rowClassNames = this.classNames({
        descendant: 'row',
        states: {
          current: (level.depth === currentDepth) ? 'current' : null
        }
      })

      return (
        <div key={level.depth} className={rowClassNames}>
          <HistHeatBar key='static' type='static' total={level.counts.static} data={level.hist.static} />
          <HistHeatBar key='predictive' type='predictive' total={level.counts.predictive} data={level.hist.predictive} />
        </div>
      )
    })

    return (
      <div className={graphClassNames}>
        <div className={hLegendClassNames}>
          <span>Advantage: Black</span>
          <span>Advantage: White</span>
        </div>
        <div ref='pane' className={paneClassNames}>
          {rows}
        </div>
        <div className={centerClassNames}/>
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
    const { type, data, total } = this.props
    const classNames = this.classNames()
    const bucketClassNames = this.classNames({descendant: 'bucket'})
    const buckets = Object.keys(data).sort().map((score, i) => {
      const count = data[score]
      const scoreLimit = 20
      if (Math.abs(score) > scoreLimit) score = scoreLimit * Math.sign(score)

      let style = {
        background: bucketColor(type, count / total),
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
function bucketColor (type, pct) {
  const color = type === 'static' ? '0,94,187' : '200,0,255'
  const alpha = pct * 0.75 + 0.25
  var c = `rgba(${color},${alpha})`
  return c
}
