const serverBaseUrl = 'http://localhost:3000'

export function ChessClient () {
  return {
    Spoc: {
      name: 'Spoc',
      order: 0,
      getMove: (options) => getMove({...options, engine: 'spoc'})
    },
    Stockfish: {
      name: 'Stockfish',
      order: 2,
      getMove: (options) => getMove({...options, engine: 'stockfish'})
    },
    Chesster: {
      name: 'Chesster',
      order: 1,
      getMove: (options) => getMove({...options, engine: 'chesster'})
    }
  }
}

function getMove (options) {
  return new Promise((resolve, reject) => {
    options.moves = options.moves || []

    fetch(moveUrl(options)).then(response => {
      return response.json()
    }).then(data => {
      console.log('%s response: %o', options.engine, data)
      if (!data.verboseMove && data.nextMove) {
        data.verboseMove = moveToOptions(data.nextMove)
      }
      resolve(data)
    })
  })
}

function moveUrl (options) {
  const moves = options.moves.join(' ')
  return `${serverBaseUrl}/getMove?engine=${options.engine}&moves=${moves}&movetime=0`
}

function moveToOptions (move = '') {
  // convert move like 'e7e5' to an object
  const from = move.slice(0, 2)
  const to = move.slice(2, 4)
  const promotion = move.slice(4, 5)
  return {
    from,
    to,
    promotion
  }
}
