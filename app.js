const http = require('node:http');

const hostname = '127.0.0.1';
const port = 3000;
const server = http.createServer((req, res) => {
    res.statusCode = 200;
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    start();
});

function start() {
    getDatas();
    setTimeout(start, 150000);
}

function getDatas() {
    const axios = require("axios");
    axios({
            method: 'get',
            url: 'https://api.taapi.io/exchange-symbols?secret=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHVlIjoiNjRmODhlODM0OThkNzVkYTM2ZDNmNTU1IiwiaWF0IjoxNjk0MDExMDM5LCJleHAiOjMzMTk4NDc1MDM5fQ.xU9XWyfy9lcO4n9-5nD63kYJtI8jHIm0SWwd-fwyNMI&exchange=binancefutures',
        })
        .then(function (response) {
            response.data = response.data.filter(item => item !== "USDC/USDT");
            response.data = response.data.filter(item => item !== "ETH/BTC");
            response.data.forEach((coin, index) => {
                setTimeout(() => {

                    const Taapi = require("taapi");
                    const taapi = new Taapi.default("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHVlIjoiNjRmODhlODM0OThkNzVkYTM2ZDNmNTU1IiwiaWF0IjoxNjk0MDExMDM5LCJleHAiOjMzMTk4NDc1MDM5fQ.xU9XWyfy9lcO4n9-5nD63kYJtI8jHIm0SWwd-fwyNMI");
                    taapi.setDefaultExchange('binancefutures');
                    taapi.addCalculation("rsi", coin, "1h", "rsi_1h");
                    taapi.addCalculation("rsi", coin, "15m", "rsi_15m");
                    taapi.addCalculation("rsi", coin, "5m", "rsi_5m");
                    taapi.executeBulk().then(results => {
                            console.log(results);
                            if (parseFloat(results.rsi_1h.value) > 70 || parseFloat(results.rsi_1h.value) < 15) {
                                sendDiscordMessage("" + coin + " 1h :", JSON.stringify(results.rsi_1h.value));
                            }
                            if (parseFloat(results.rsi_15m.value) > 70 || parseFloat(results.rsi_15m.value) < 15) {
                                sendDiscordMessage("" + coin + " 15m :", JSON.stringify(results.rsi_15m.value));
                            }
                            if (parseFloat(results.rsi_5m.value) > 70 || parseFloat(results.rsi_5m.value) < 15) {
                                sendDiscordMessage("" + coin + " 5m :", JSON.stringify(results.rsi_5m.value));
                            }
                        }
                    ).catch(error => {
                        console.error(error)
                    });
                }, 550 * (index + 1));
            });
        });
}

function sendDiscordMessage(symbol, message) {
    var params = {
        username: "Rsibot",
        avatar_url: "",
        content: " " + symbol + " " + message,
        // embeds: [
        //     {
        //         "title": "Bitcoin Rsi 1h",
        //         "color": 15258703,
        //         "thumbnail": {
        //             "url": "",
        //         },
        //         "fields": [
        //             {
        //                 "name": "Your fields here",
        //                 "value": "Whatever you wish to send",
        //                 "inline": true
        //             }
        //         ]
        //     }
        // ]
    }


    fetch('https://discord.com/api/webhooks/1145319925385277542/Nv7WYIX8eUXzcLrpaH730toluO4B1MDxsuE1o3tqCkXbylo3asQwXD2y1kcW42MmYhhy', {
        method: "POST",
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(res => {
        // console.log(res);
    })
}