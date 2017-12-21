const os = require('os');
var config = require('./config');
var express = require('express')
var shell = require('shelljs');
var request = require('request');
var app = express()

app.get('/', function (req, res) {
  res.sendFile('status.html', {root: __dirname })
})

app.get('/os/memory', function (req, res) {
  var free = parseInt(shell.exec('grep ^MemFree /proc/meminfo | awk \'{print $2}\'',{silent:true}).stdout)
  var buffers = parseInt(shell.exec('grep ^Buffers /proc/meminfo | awk \'{print $2}\'',{silent:true}).stdout)
  var cached = parseInt(shell.exec('grep ^Cached /proc/meminfo | awk \'{print $2}\'',{silent:true}).stdout)
  total_free = free + buffers + cached
  var json = {}
  json[`total`] = Math.round((os.totalmem()/1024/1024)*100)/100 + " MB"
  json[`free`] = Math.round((free/1024)*100)/100 + " MB (Total: " + Math.round((total_free/1024)*100)/100 + " MB)"
  json[`buffers`] = Math.round((buffers/1024)*100)/100 + " MB"
  json[`cached`] = Math.round((cached/1024)*100)/100 + " MB"
  json[`used`] = Math.round(((os.totalmem() - total_free*1024)/1024/1024)*100)/100 + " MB"
  json[`percent_used`] = Math.round(((os.totalmem() - total_free*1024) / os.totalmem()) * 100)
  json[`percent_buffers`] = Math.round(((buffers*1024) / os.totalmem()) * 100)
  json[`percent_cached`] = Math.round(((cached*1024) / os.totalmem()) * 100)
  res.send(json)
})

app.get('/os/cpus', function (req, res) {
  res.send(os.cpus());
})

app.get('/os/load-average', function (req, res) {
  res.send(os.loadavg());
})

app.get('/os/pm2', function (req, res) {
  var pm2 = {}
  pm2.processes = JSON.parse(shell.exec('pm2 jlist',{silent:true}).stdout)
  pm2.time = Date.now()
  res.send(pm2);
})

app.get('/os/system', function (req, res) {
  var system = {}
  system.hostname = os.hostname()
  system.os = shell.exec('/usr/bin/lsb_release -ds | cut -d= -f2 | tr -d \'"\'',{silent:true}).stdout.replace(/\r?\n|\r/g,'')
  system.kernel = shell.exec('/bin/uname -r',{silent:true}).stdout.replace(/\r?\n|\r/g,'')
  system.uptime = shell.exec('/usr/bin/cut -d. -f1 /proc/uptime',{silent:true}).stdout.replace(/\r?\n|\r/g,'')
  system.last_boot = shell.exec('uptime -s',{silent:true}).stdout.replace(/\r?\n|\r/g,'')
  system.current_users = shell.exec('who -u | awk \'{ print $1 }\' | wc -l',{silent:true}).stdout.replace(/\r?\n|\r/g,'')
  system.server_date = shell.exec('/bin/date',{silent:true}).stdout.replace(/\r?\n|\r/g,'')
  res.send(system);
})

app.get('/os/vhost', function (req, res) {
  var info = shell.exec('apache2ctl -t -D DUMP_VHOSTS',{silent:true}).stdout
  var vhost = []
  for (var row of info.split('\n')) {
    if(row.match(/^\s.*port/)) {
      var one = {}
      var port = false;
      var name = false;
      for(var v of row.split(' '))
        if(v) {
          if(port) {
            one.port = v
            port = false
          }
          if(name) {
            one.name = v
            name = false
          }
          if(v == "port") port = true
          if(v == "namevhost") name = true
        }
        if(one) vhost.push(one)
    }
  }
  var auth = () => {
    if(config.vhost && config.vhost.user) return {
    'auth': {
      'user': config.vhost.user,
      'pass': config.vhost.pass,
      'sendImmediately': false
    }}
    return {}
  }
  var count = vhost.length;
  for(let i=0; i<vhost.length; i++) {
    request(`http://${vhost[i].name}:${vhost[i].port}`, auth(), (error, response, body) => {
      vhost[i].statusCode = error ? error.code : response.statusCode
      if(--count < 1) res.send(vhost)
    })
  }
})

app.listen(config.web.port, config.web.host)
console.log(`Status on http://${config.web.host}:${config.web.port}/`)
