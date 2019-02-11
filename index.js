const express = require('express')
const app = express()
const port = 3000

const jsonData = require('./getdata.js')

/* sample routing, many options, such as index page, using next, and passing a param */
app.get('/', (req, res) => (
    jsonData.api_request(req, res)
))
app.get('/next', function (req, res, next) {
    next()
}, function (req, res) {
    res.send('an alternative setup')
})
app.get('/:id', function (req, res) {
    jsonData.api_request(req, res)
})
app.get('/:id/:location', function (req, res) {
    jsonData.api_request(req, res)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))