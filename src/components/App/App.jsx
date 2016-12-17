// Monogoto
import React, { PropTypes } from 'react'
import HTML5Backend from 'react-dnd-html5-backend'
import suitClassNames from 'suitcss-classnames'
import { connect } from 'react-redux'
import { actions } from '../../state/app_actions'
import Chessdiagram from 'react-chessdiagram'
import Chess from 'chess.js'
import { ChessBrain, boardToBinary, moveToBinary } from '../../brain'
require('./App.scss')

const lightSquareColor = '#2492FF'
const darkSquareColor = '#005EBB'
const flip = false
const squareSize = 70

export class App extends React.Component {
  constructor (props) {
    super(props)
    this.wrappedActions = actions(props.dispatch)
    this.board = new Chess()
    this.brain = new ChessBrain()
    this.state = {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      lastMove: null,
      msg: '',
      autoPlay: false
    }
  }

  getChildContext () {
    return {
      actions: this.wrappedActions
    }
  }

  onMovePiece = (piece, fromSquare, toSquare, promotion = '') => {
    console.log(arguments)
    //console.log(this.board.ascii())
    //console.log(boardToBinary(this.board))
    const game = this
    let move = fromSquare + toSquare
    //console.log('move %s %o', move, moveToBinary(move))
    const type = piece.toLowerCase()

    if (type === 'p' && ([1,8]).includes(parseInt(toSquare[1]))) {
      let newType = promotion
      while (!(['q', 'r', 'b', 'n']).includes(newType.toLowerCase())) {
        newType = prompt('New piece (q, b, r, n)')
      }
      const newPiece = (type !== piece) ? newType.toLowerCase() : newType.toUpperCase()
      move += newPiece
    }

    this.board.move(move, {sloppy: true})
    const nextMove = this.brain.getBestMove(this.board.ascii(), this.board.moves({verbose: true}))
    console.log('next: %o', nextMove)

    if (this.board.fen() === this.state.fen) {
      this.setState({lastMove: 'Invalid move'})
    } else {
      this.setState({fen: this.board.fen(), lastMove: `${piece}${fromSquare}${toSquare}`})
      if (this.state.autoPlay) {
        setTimeout(function () {
          if (game.board.in_checkmate()) {
            game.setState({msg: 'Check mate!'})
            return
          } else if (game.board.in_check()) {
            game.setState({msg: 'Check!'})
          }
          game.onMovePiece(nextMove.move.piece, nextMove.move.from, nextMove.move.to, nextMove.move.promotion)
        }, 1000)
      }
    }
  }

  toggleAutoPlay = () => {
    this.setState({autoPlay: !this.state.autoPlay})
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
    const { lastMove, fen, msg, autoPlay } = this.state
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
          <div className={lastMoveClasses}>{lastMoveMessage} {msg}</div>
          <button onClick={this.toggleAutoPlay}>{autoPlay ? 'Disable' : 'Enable'} AutoPlay</button>
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
