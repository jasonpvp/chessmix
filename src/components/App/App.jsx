// Monogoto
import React, { PropTypes } from 'react'
import HTML5Backend from 'react-dnd-html5-backend'
import suitClassNames from 'suitcss-classnames'
import { connect } from 'react-redux'
import { actions } from '../../state/app_actions'
import Chessdiagram from 'react-chessdiagram'
import Chess from 'chess.js'
import { Chesster } from '../../chesster'
import { StockfishClient } from '../../stockfish_client'
import { Network } from '../Network'
require('./App.scss')

const lightSquareColor = '#2492FF'
const darkSquareColor = '#005EBB'
const flip = false
const squareSize = 70
let moves = []
const newGame = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
export class App extends React.Component {
  constructor (props) {
    super(props)
    this.wrappedActions = actions(props.dispatch)
    this.board = new Chess()
    this.chessterBlack = Chesster(this.board, this.onMovePiece)
    this.chessterWhite = Chesster(this.board, this.onMovePiece)
    this.stockfish = StockfishClient(this.board, this.onMovePiece)
    this.blackPlayer = human()
    this.whitePlayer = human()
    this.state = {
      fen: newGame,
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
    const game = this
    let move = fromSquare + toSquare
    console.log('Move) piece: %s, from: %s to: %s, promotion: %s', piece, fromSquare, toSquare, promotion)
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

    if (this.board.fen() === this.state.fen) {
      this.setState({lastMove: 'Invalid move', msg: ''})
    } else {
      moves.push(move)
      this.setState({fen: this.board.fen(), lastMove: `${piece}${fromSquare}${toSquare}`, msg: ''})
      if (game.board.in_checkmate()) {
        game.setState({msg: 'Check mate!'})
      } else if (game.board.in_check()) {
        game.setState({msg: 'Check!'})
      }

      if (this.state.autoPlay) {
        setTimeout(function () {
          if (game.board.in_checkmate()) {
            moves = []
            game.board.load(newGame)
            game.setState({fen: newGame})
          }
          if (game.board.turn() === 'b') {
            console.log('Blacks turn')
            game.blackPlayer.makeMove(moves)
          } else {
            console.log('Whites turn')
            game.whitePlayer.makeMove(moves)
          }
        }, 0)
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
    const networkClasses = this.classNames({descendant: 'network'})

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
        <div className={networkClasses}>
          <Network networkJson={this.chessterWhite.brain.network.toJSON()} size={15} />
        </div>
      </div>
    )
  }
}

App.childContextTypes = {
  actions: PropTypes.object
}

export const AppContainer = connect(state => state)(App)

function human () {
  return {
    makeMove: () => {}
  }
}
