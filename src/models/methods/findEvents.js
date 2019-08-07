const Event = require('../Event')

module.exports = (query = {}, startDate, endDate) => {
  if (startDate) {
    query.timestamp = query.timestamp || {}
    query.timestamp['$gte'] = startDate
  }

  if (endDate) {
    query.timestamp = query.timestamp || {}
    query.timestamp['$lte'] = endDate
  }

  return Event.find(query)
}
