// Monogoto
import React, { PropTypes } from 'react'
import HTML5Backend from 'react-dnd-html5-backend'
import suitClassNames from 'suitcss-classnames'
import { connect } from 'react-redux'
import { actions } from '../../state/app_actions'
import Chessdiagram from 'react-chessdiagram'
import Chess from 'chess.js'
import { Network } from '../Network'
require('./App.scss')

import { ChessClient } from '../../chess_client'
const chessClient = new ChessClient()


const lightSquareColor = '#2492FF'
const darkSquareColor = '#005EBB'
const flip = false
const squareSize = 40
const newGame = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const initialState = {
  fen: newGame,
  lastMove: null,
  msg: '',
  autoPlay: true,
  autoRestart: false,
  moves: [],
  whitePlayer: human(),
  blackPlayer: chessClient.Chesster
}

export class App extends React.Component {
  constructor (props) {
    super(props)
    this.wrappedActions = actions(props.dispatch)
    this.board = new Chess()
    window.game = this

    this.state = initialState
  }

  getChildContext () {
    return {
      actions: this.wrappedActions
    }
  }

  onMovePiece = (piece, from, to, promotion = '') => {
    this.makeMove({
      piece,
      from,
      to,
      promotion
    })
  }

  needsPromotion (options) {
    return options.piece.toLowerCase() === 'p' && ([1,8]).includes(parseInt(options.to[1]))
  }

  promptPromotion () {
    let newType = ''
    while (!(['q', 'r', 'b', 'n']).includes(newType.toLowerCase())) {
      newType = prompt('New piece (q, b, r, n)')
    }
    if (this.board.turn() === 'W') newType = newType.toUpperCase()
    return newType
  }

  makeMove = (options) => {
    const piece = options.piece || this.board.get(options.from).type
    console.log('Move) piece: %s, %o', piece, options)

    if (this.needsPromotion({piece: piece, to: options.to}) && !options.promotion) {
      options.promotion = this.promptPromotion()
    }
    const move = options.from + options.to + (options.promotion || '')

    this.board.move(move, {sloppy: true})

    if (this.board.fen() === this.state.fen) {
      this.setState({lastMove: 'Invalid move', msg: ''})
    } else {
      let msg = ''
      if (game.board.in_checkmate()) {
        msg = 'Check mate!'
      } else if (game.board.in_check()) {
        msg = 'Check!'
      }

      this.setState({
        fen: this.board.fen(),
        lastMove: `${piece}${options.from}${options.to}${options.promotion}`,
        moves: [...this.state.moves, move],
        msg
      })

      if (this.state.autoPlay) {
        this.scheduleMove()
      }
    }
  }

  scheduleMove () {
    const game = this
    setTimeout(function () {
      if (game.board.in_checkmate() && game.state.autoRestart) {
        game.board.load(newGame)
        game.setState(initialState)
      }
      game.makeNextMove()
    }, 0)
  }

  makeNextMove () {
    if (this.board.turn() === 'b') {
      console.log('Blacks turn')
      this.state.blackPlayer.getMove({moves: this.state.moves}).then(game.makeMove)
    } else {
      console.log('Whites turn')
      this.state.whitePlayer.getMove({moves: this.state.moves}).then(game.makeMove)
    }
  }

  toggleAutoPlay = () => {
    const autoPlay = !this.state.autoPlay
    this.setState({autoPlay})
    if (autoPlay) this.scheduleMove()
  }

  toggleAutoRestart = () => {
    const autoRestart = !this.state.autoRestart
    this.setState({autoRestart})
    if (this.state.autoPlay && autoResart) this.scheduleAutoMove()
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
    const { lastMove, fen, msg, autoRestart, autoPlay } = this.state
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
          <button onClick={this.toggleAutoRestart}>{autoRestart ? 'Disable' : 'Enable'} AutoRestart</button>
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

function human () {
  return {
    // return unresolved promise since humans are untrustworthy
    getMove: () => new Promise(_ => {})
  }
}
