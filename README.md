#服务台，收银台日志收集服务

##server部署
    服务器部署logserver
    node app.js
    或
    pm2 start app.js --name logserver
    确保log文件夹有读写权限

##client部署
    /*
     * 日志上报
     * */
    var log_update=function(data,type){
        if(webapp.track_event_url && webapp.writelog){
            var REPORT_URL = webapp.track_event_url+"&type="+type; // 收集上报数据的信息
            var url = REPORT_URL+ "&log=" + JSON.stringify(data);// 组装错误上报信息内容URL
            setTimeout(function(){
                var img = new Image;
                img.onload = img.onerror = function(){
                    img = null;
                };
                img.src = url;// 发送数据到后台cgi
            },100);
        }
    };
    /*
    * 日志输出
    * */
    var log = function(){
        var date = new Date();
        var year = date.getFullYear();
        var month= date.getMonth()+1;
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second= date.getSeconds();
        var commdatetime=year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;
    
        var terminalinfo=sessionStorage.getItem("ngStorage-terminalinfo");
        if(terminalinfo) terminalinfo=JSON.parse(terminalinfo);
        var pre_name = "";
        if (terminalinfo) pre_name = "service：" +terminalinfo.tenant_name + " "+ terminalinfo.shop_name +  " " + terminalinfo.name;
        //var browseinfo=navigator.userAgent;
        var text=commdatetime+"【"+pre_name+"】："+JSON.stringify(arguments[0]);
        text = text.replace(/\\/g,"");
        //绑定
        console.log.bind(console)(text);
    
        //把data上报到后台！
        var type=arguments[0].line?2:1;
        log_update(text,type);
    };
    /*
    * 异常处理
    * 控制台模拟报错setTimeout(function(){throw new Error}, 1000)
    * */
    window.onerror = function(msg,url,line,col,error){
        //没有URL不上报！上报也不知道错误
        if (msg != "Script error." && !url){
            return true;
        }
        //采用异步的方式
        setTimeout(function(){
            var data = {};
            //不一定所有浏览器都支持col参数
            col = col || (window.event && window.event.errorCharacter) || 0;
    
            data.url = url;
            data.line = line;
            data.col = col;
            if (!!error && !!error.stack){
                //如果浏览器有堆栈信息
                //直接使用
                data.msg = error.stack.toString();
            }else if (!!arguments.callee){
                //尝试通过callee拿堆栈信息
                var ext = [];
                var f = arguments.callee.caller, c = 3;
                //这里只拿三层堆栈信息
                while (f && (--c>0)) {
                    ext.push(f.toString());
                    if (f  === f.caller) {
                        break;//如果有环
                    }
                    f = f.caller;
                }
                ext = ext.join(",");
                data.msg = ext;
            }
            //把data上报到后台！
            log(data);
        },0);
        return true;
    };


##使用攻略
    【device_type】:1为服务台，2为收银台
    【type】:1为log.info,2为log.error
    【log】：日志明细
    【EXP】:http://logServer:logPort/log?device_type=2&type=1&log=日志信息