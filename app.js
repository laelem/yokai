const express = require('express')
const app = express()
const server = require('http').createServer(app)
const {Server} = require('socket.io')
const io = new Server(server)
const path = require('path')
const createError = require('http-errors')
const i18n = require("i18n")
const indexRouter = require('./routes/index')
const socketsManagement = require('./sockets/sockets')

const port = process.env.PORT || 8080

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(express.static('public'))
app.use(express.static(__dirname + '/node_modules/bootstrap/dist/js'));

// support URL-encoded bodies
app.use(express.urlencoded({extended: true}));

i18n.configure({
    locales: ['fr'],
    defaultLocale: 'fr',
    objectNotation: true,
    directory: path.join(__dirname, 'locales')
})

app.use(i18n.init)

socketsManagement.start(io)

server.listen(port)

app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals = {
        message: err.message,
        error: req.app.get('env') === 'development' ? err : {}
    }

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})