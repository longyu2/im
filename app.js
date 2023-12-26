const WebSocket = require('ws');
const fs = require("fs")
const httpServ = require('https');

const WebSocketServer = require('ws').Server; // 引用Server类

// 一些配置信息
const cfg = JSON.parse(fs.readFileSync("./config.json"));

// 创建request请求监听器
const processRequest = (req, res) => {
    res.writeHead(200);
    res.end('厉害了，我的WebSockets!\n');
};





const app = httpServ.createServer({
    // 向server传递key和cert参数
    key: fs.readFileSync(cfg.ssl_key),
    cert: fs.readFileSync(cfg.ssl_cert)
}, processRequest).listen(cfg.port);

// 实例化WebSocket服务器
const wss = new WebSocketServer({
    server: app
});

console.log("服务已启动")


wss.on('connection', function connection(ws) {
    
    console.log(`[SERVER] connection()`);
    ws.on('message', function incoming(message) {

        const data = JSON.parse(message.toString())
        console.log('服务端接受到数据：', data);

        switch (data.type) {
            case "message":
                // 往数据库存一条

                let messageList = JSON.parse(fs.readFileSync("messageList.json",'utf-8'))
                messageList.push((data))
                fs.writeFileSync('messageList.json',JSON.stringify(messageList))

                // 广播给所有用户
                wss.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(message.toString());
                    }
                });
                break
            case "login":
                
                const users = JSON.parse(fs.readFileSync('user.json', 'utf-8'))

                for (let index = 0; index < users.length; index++) {
                    const element = users[index];
                    if(element.code===data.data.code){
                        ws.send(JSON.stringify(
                            {
                                type:"loginSuccess",
                                data:{
                                    messageList:JSON.parse(fs.readFileSync("messageList.json",'utf-8')),
                                    userinfo:element
                                }
                            }
                        ));
                        break
                    }
                    else if(index ==  users.length-1){
                        ws.send('{"status":"login error"}');
                        ws.close()
                    }
                }
                break
        }


    });
    // ws.send('something');
});