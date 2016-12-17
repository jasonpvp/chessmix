// Monogoto
import React, { PropTypes } from 'react'
import HTML5Backend from 'react-dnd-html5-backend'
import suitClassNames from 'suitcss-classnames'
import { connect } from 'react-redux'
import { actions } from '../../state/app_actions'
import Chessdiagram from 'react-chessdiagram'
import Chess from 'chess.js'
require('./App.scss')

const lightSquareColor = '#2492FF'
const darkSquareColor = '#005EBB'
const flip = false
const squareSize = 70

export class App extends React.Component {
  constructor (props) {
    super(props)
    this.wrappedActions = actions(props.dispatch)
    this.chess = new Chess()
    this.state = {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      lastMove: null
    }
  }

  getChildContext () {
    return {
      actions: this.wrappedActions
    }
  }

  onMovePiece = (piece, fromSquare, toSquare) => {
    const game = this
    let move = fromSquare + toSquare
    const type = piece.toLowerCase()
    if (type === 'p' && ([1,8]).includes(parseInt(toSquare[1]))) {
      let newType = ''
      while (!(['q', 'r', 'b', 'n']).includes(newType.toLowerCase())) {
        newType = prompt('New piece (q, b, r, n)')
      }
      const newPiece = (type !== piece) ? newType.toLowerCase() : newType.toUpperCase()
      move += newPiece
    }

    this.chess.move(move, {sloppy: true})
    if (this.chess.fen() === this.state.fen) {
      this.setState({lastMove: 'Invalid move'})
    } else {
      this.setState({fen: this.chess.fen(), lastMove: `${piece}${fromSquare}${toSquare}`})
      setTimeout(function () {
        if (game.chess.in_checkmate()) {
          alert('Check mate!')
        } else if (game.chess.in_check()) {
          alert('Check!')
        }
      }, 0)
    }
  }

  classNames (options) {
    return suitClassNames({
      namespace: 'chesster',
      component: 'App',
      ...options
    })
  }

  render () {
    const { example } = this.props
    const { lastMove, fen } = this.state
    const appClasses = this.classNames()
    const headerClasses = this.classNames({descendant: 'header'})
    const titleClasses = this.classNames({descendant: 'title'})
    const lastMoveClasses = this.classNames({descendant: 'lastMove'})

    const chessBoardProps = {
      flip: flip,
      fen: fen,
      squareSize: squareSize,
      lightSquareColor: lightSquareColor,
      darkSquareColor: darkSquareColor,
      onMovePiece: this.onMovePiece
    }
    const lastMoveMessage = lastMove ? `Last move: ${lastMove}` : 'New game'

    return (
      <div className={appClasses}>
        <div className={headerClasses}>
          <div className={titleClasses}>Chesster</div>
          <div className={lastMoveClasses}>{lastMoveMessage}</div>
        </div>
        <Chessdiagram {...chessBoardProps} />
      </div>
    )
  }
}

App.childContextTypes = {
  actions: PropTypes.object
}

export const AppContainer = connect(state => state)(App)
