function getObjectRandomKey(object) {

  const max = Object.keys(object).length
  const min = 0

  return Object.keys(object)[Math.floor(Math.random() * (max - min) + min)]
}

function getObjectRandomValue(object) {

  const max = Object.keys(object).length
  const min = 0

  return object[Object.keys(object)[Math.floor(Math.random() * (max - min) + min)]]
}

function sortObjectByKey(object) {
  return Object.keys(object).sort().reduce((result, key) => {
    result[key] = object[key]
    return result
  }, {})
}

function formatMessageTip(title, tip) {
  return `*${title}*\n\n${tip}`
}

module.exports = { getObjectRandomKey, getObjectRandomValue, sortObjectByKey, formatMessageTip };