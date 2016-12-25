// Monogoto
import React, { PropTypes } from 'react'
import HTML5Backend from 'react-dnd-html5-backend'
import suitClassNames from 'suitcss-classnames'
import { connect } from 'react-redux'
import { actions } from '../../state/app_actions'
import Chessdiagram from 'react-chessdiagram'
import Chess from 'chess.js'
import { SearchGraph } from '../SearchGraph'
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
  autoRestart: false,
  moves: [],
  whitePlayer: human(),
  blackPlayer: human(),
  searchStats: null
}
const playerOptions = {
  human: human(),
  ...chessClient
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
    const t = this.board.turn()
    const p = (t === 'b') ? 'blackPlayer' : 'whitePlayer'
    if (t !== this.board.get(from).color || this.state[p].name !== 'human') {
      this.setState({msg: 'Cant do that'})
      return
    }

    this.makeMove({
      move: {
        verboseMove: {
          piece,
          from,
          to,
          promotion
        }
      }
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
    var move = options.move.verboseMove
    if (!(move.from && move.from.length && move.to && move.to.length)) return

    let piece
    try {
      piece = move.piece || this.board.get(moves.from).type
    } catch(err) {
      // An invalid move can occur on new game when switching opponents since computer opponent responses might be pending
      console.log(this.board.ascii())
      console.error('Invalid move options: %o', JSON.stringify(move))
      return
    }
    console.log('Move) piece: %s, %o', piece, JSON.stringify(move))

    if (this.needsPromotion({piece: piece, to: move.to}) && !move.promotion) {
      move.promotion = this.promptPromotion()
    }
    const simpleMove = move.from + move.to + (move.promotion || '')

    this.board.move(move)

    if (this.board.fen() === this.state.fen) {
      this.setState({lastMove: 'Invalid move', msg: ''})
    } else {
      let msg = ''
      if (this.board.in_checkmate()) {
        msg = 'Check mate!'
      } else if (this.board.in_check()) {
        msg = 'Check!'
      }

      let newState = {
        fen: this.board.fen(),
        lastMove: `${piece}${move.from}${move.to}${move.promotion}`,
        moves: [...this.state.moves, simpleMove],
        msg
      }
      if (options.searchStats) newState.searchStats = options.searchStats
      this.setState(newState)
      this.scheduleMove()
    }
  }

  scheduleMove () {
    const game = this
    setTimeout(function () {
      if (game.board.in_checkmate() && game.state.autoRestart) {
        game.newGame()
      }
      game.makeNextMove()
    }, 0)
  }

  newGame = () => {
    this.board.load(newGame)
    const newState = {
      ...initialState,
      whitePlayer: this.state.whitePlayer,
      blackPlayer: this.state.blackPlayer,
      autoRestart: this.state.autoRestart
    }
    this.setState(newState)
    this.scheduleMove()
  }

  makeNextMove () {
    if (this.board.turn() === 'b') {
      console.log('Blacks turn')
      this.state.blackPlayer.getMove({moves: this.state.moves}).then(this.makeMove)
    } else {
      console.log('Whites turn')
      this.state.whitePlayer.getMove({moves: this.state.moves}).then(this.makeMove)
    }
  }

  toggleAutoRestart = () => {
    const autoRestart = !this.state.autoRestart
    this.setState({autoRestart})
    if (autoRestart) this.scheduleMove()
  }

  toggleWhitePlayer = () => {
    this.togglePlayer('whitePlayer')
  }

  toggleBlackPlayer = () => {
    this.togglePlayer('blackPlayer')
  }

  togglePlayer (player) {
    const p = this.state[player]
    const opts = Object.keys(playerOptions).sort((a, b) => (a.order < b.order) ? -1 : (a.order > b.order) ? 1 : 0)
    let index = opts.indexOf(p.name) + 1
    if (index >= opts.length) {
      index = 0
    }
    let change = {}
    change[player] = playerOptions[opts[index]]
    this.setState(change)
    this.scheduleMove()
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
    const { lastMove, fen, msg, autoRestart, whitePlayer, blackPlayer, searchStats } = this.state
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
          <button onClick={this.newGame}>New game</button>
          <button onClick={this.toggleAutoRestart}>{autoRestart ? 'Disable' : 'Enable'} AutoRestart</button>
          <button onClick={this.toggleWhitePlayer}>White: {whitePlayer.name}</button>
          <button onClick={this.toggleBlackPlayer}>Black: {blackPlayer.name}</button>
        </div>
        <Chessdiagram {...chessBoardProps} />
        {searchStats && <SearchGraph {...searchStats} />}
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
    name: 'human',
    // return unresolved promise since humans are untrustworthy
    getMove: () => new Promise(_ => {})
  }
}
