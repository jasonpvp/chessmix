const serverBaseUrl = 'http://localhost:3000'

export function ChessClient () {
  return {
    Stockfish: {
      name: 'Stockfish',
      getMove: (options) => getMove({...options, engine: 'stockfish'})
    },
    Chesster: {
      name: 'Chesster',
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
      console.log(data)
      console.log(`${options.engine} response: ${JSON.stringify(data)}`)
      resolve(moveToOptions(data.nextMove))
    })
  })
}

function moveUrl (options) {
  const moves = options.moves.join(' ')
  return `${serverBaseUrl}/getMove?engine=${options.engine}&moves=${moves}`
}

function moveToOptions (move) {
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
