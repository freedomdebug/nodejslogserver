/**
 * Created by tommy.hu on 2016/11/21.
 */
var express = require('express');
var cluster = require('cluster');
var app = express();
var fs = require("fs");
var moment = require("moment");

var config = require('./config');

app.get('/log', function (req, res) {
    if(req.query.log.indexOf('东明餐饮')==-1) return;

    var type = req.query.type==1?"I":"E";//日志级别
    if(config.loglevel=="E" && type=="I") return;//日志记录级别控制

    var device = req.query.device_type==1?"service":"cashier";//日志client
    var text = req.query.log || "";//日志内容
    var stack ="";//堆栈
    var file = "/log/hs-"+ device + "-out-" + moment().format("YYYY-MM-DD") + ".log";//日志文件
    var path = __dirname+file;//日志保存路径
    var datetime = moment().format("YYYY-MM-DD HH:MM:SS.sss");//时间

    //log row
    text = text.replace(/\\/g,"");
    //text ="[" + type + "] "+ datetime + "("+ stack + "):" + text;
    text ="[" + type + "] "+ text;
    //check file exist
    fs.exists(path, function(boolExist){
        if(boolExist){
            var states = fs.statSync(path);
            var filesize=states.size;
            //当个文件大小检查
            if(filesize>1024*1024*config.logsize){
                var myIndex=1;
                if(file.indexOf('_')>-1){
                    var maxIndex=file.split('_')[1];
                    var myIndex=maxIndex+1;
                    file=file.split('_')[0]+"_"+myIndex+ ".log";
                }
            }

            //log append
            fs.appendFile(path, text + "\n", function (err, data) {
                if (err) throw err;
                console.log('It\'s saved!');
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Content-Type", "text/javascript;charset=UTF-8");
                res.json("ok");
            });
        }else{
            //log append
            fs.writeFile(path, text + "\n", function (err, data) {
                if (err) throw err;
                console.log('It\'s saved!');
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Content-Type", "text/javascript;charset=UTF-8");
                res.json("ok");
            });
        }
    });
});

//create http server
if(cluster.isMaster){
    // Create a worker for each CPU
    for( var i = 0; cCPUs = require('os').cpus().length,i < cCPUs; i++ ) {
        cluster.fork();
    }

    cluster.on( 'online', function( worker ) {
        console.log( 'Worker ' + worker.process.pid + ' is online.' );
    });
    cluster.on( 'exit', function( worker, code, signal ) {
        console.log( 'worker ' + worker.process.pid + ' died.' );
    });
}else{
    var server = app.listen(config.port, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log("instance url: http://%s:%s", host, port)
    });
}


