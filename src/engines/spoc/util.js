module.exports = {
  asciiBoardToArray: asciiBoardToArray
}

// Convert an ascii board into a nested array
function asciiBoardToArray (ascii) {
  var rows = ascii.split(/\n/)
  var boardArray = rows.reduce(function (boardArray, row) {
    if (row.indexOf('-') > -1 || row.indexOf('h') > -1) return boardArray
    var rowArray = row.slice(5, 27).split(/\ +/)
    boardArray.push(rowArray)
    return boardArray
  }, [])
  return boardArray
}
