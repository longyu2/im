const { createApp, ref } = Vue
createApp({
    setup() {

        const user = ref("")

        const message = ref('Helsssssssssssssssssssssssssssssssssssssssssssssssssssssssslo vue!')
        const list = ref([])
        const inp = ref('')

        for (let i = 0; i < list.length; i++) {

        }

        let ws
        ws = new WebSocket('wss://misaka-mikoto.cn:10000');
        ws.onopen = function (evt) { // 连接建立触发


            console.log('建立连接，状态:' + ws.readyState);


            let userCode
            // 判断localstorage是否存在
            if (localStorage.getItem("code") === null) {

                userCode = prompt("请输入你的神秘代码：")
            }
            else {
                userCode = localStorage.getItem("code")
            }



            ws.send(JSON.stringify({
                type: "login",
                data: { code: userCode }
            }))


        };


        ws.onmessage = function (evt) { // 服务端返回数据触发
            // 收到数据，判断是什么类型
            const response = JSON.parse(evt.data)



            switch (response.type) {
                case "message":
                    list.value.push(response)
                    break
                case "loginSuccess":


                    console.table()
                    list.value = (response.data.messageList)



                    localStorage.setItem("code", response.data.userinfo.code)
                    localStorage.setItem("user", response.data.userinfo.user)

                    // 刷到最新
                    setTimeout(() => {
                        document.querySelector(".message-box").scrollTop = 1000000;
                        user.value = localStorage.getItem("user")
                    }, 100)

                default:
                    break
            }


        };



        var d = new Date();

        // 获取时间
        const getdateStr = () => {
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`

        }

        const btnSend = () => {


            // 刷到最新
            setTimeout(() => {
                document.querySelector(".message-box").scrollTop = 1000000;
                user.value = localStorage.getItem("user")
            }, 100)


            ws.send(JSON.stringify({
                type: "message",
                data: {
                    user: localStorage.getItem("user"),
                    content: inp.value,
                    createtime: getdateStr()
                }
            }))
            inp.value = ""

        }







        return {
            message, list, inp, btnSend, user
        }
    }
}).mount('#app')




