

var x = new XMLHttpRequest();
x.open("GET", "https://testbucket9959.s3.amazonaws.com/", true);
// x.setRequestHeader("Content-Type", "application/xml");
x.onreadystatechange = function () {
    if (x.readyState == 4 && x.status == 200) {
        let promiseArr = [];
        let data = [];
        var doc = x.responseXML;
        let keys = doc.getElementsByTagName("Key");

        let index = 0;
        createDataSet(index);

        function createDataSet(index) {
            if (index >= keys.length) {
                generateGraph();
                return false;
            }
            let element = keys[index];
            element = element.textContent;


            let splitName = element.split('/');
            if (splitName[0] === 'testfolder' && splitName[1] !== '') {
                promiseArr.push(new Promise((resolve, reject) => {
                    var innerReq = new XMLHttpRequest();
                    innerReq.open("GET", "https://testbucket9959.s3.amazonaws.com/" + splitName[0] + "/" + splitName[1], true);
                    // innerReq.setRequestHeader("Content-Type", "application/xml");
                    innerReq.onreadystatechange = function () {
                        if (innerReq.readyState == 4 && innerReq.status == 200) {
                            let parseData = JSON.parse(innerReq.responseText);
                            if (parseData.humidity) {
                                data.push(Object.assign({}, parseData, { timestamp: splitName[1] }));
                            }
                            resolve('Done')
                            index++;
                            createDataSet(index);
                        } else {
                            // reject(innerReq)
                        }
                    }
                    innerReq.send(null);
                }));
            } else {
                index++;
                createDataSet(index);
            }
        }




        function generateGraph() {
            Promise.all(promiseArr.map(p => p.catch(e => e)))
                .then(res => {

                    abcData = data;
                    let barGraphXaxisName = ['Humidity', 'Temperature', 'Uptime'];
                    let humiditySum = 0, temperatureSum = 0, uptimeSum = 0;
                    let lineXaxisData = [], humArr = [], tempArr = [], upArr = [];
                    for (let i = 0; i < abcData.length; i++) {
                        //only for bar graph
                        /*                                 humiditySum += Number(abcData[i].humidity);
                                                        temperatureSum += Number(abcData[i].temperature);
                                                        uptimeSum += Number(abcData[i].uptime); */
                        //only for line graph
                        humArr.push(Number(abcData[i].humidity));
                        tempArr.push(Number((abcData[i].temperature * 9/5 + 32).toFixed(2)));
                        upArr.push(Number(abcData[i].uptime));
                        // lineXaxisData.push(new Date(Number(abcData[i].timestamp)).toLocaleString());
                    }

                    /* Line chart 
                    var chart = Highcharts.chart('container', {

                        chart: {
                            type: 'column'
                        },

                        title: {
                            text: 'Bar Chart'
                        },
                        xAxis: {
                            categories: barGraphXaxisName
                        },

                        yAxis: {
                            title: {
                                text: 'Value'
                            }
                        },

                        series: [{
                            data: [humiditySum, temperatureSum, uptimeSum]
                        }],

                        responsive: {
                            rules: [{
                                condition: {
                                    maxWidth: 500
                                },
                                chartOptions: {
                                    chart: {
                                        className: 'small-chart'
                                    }
                                }
                            }]
                        }
                    });
*/
                    Highcharts.chart('container1', {

                        title: {
                            text: 'Humidity and Temperature'
                        },

                        yAxis: {
                            title: {
                                text: 'Value'
                            }
                        },

                        xAxis: {
                            categories: upArr
                        },

                        legend: {
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'middle'
                        },

                        plotOptions: {
                            series: {
                                label: {
                                    connectorAllowed: false
                                }
                            }
                        },
                        series: [{
                            name: 'Humdity',
                            data: humArr
                        }, {
                            name: 'Temperature',
                            data: tempArr
                        }],

                        responsive: {
                            rules: [{
                                condition: {
                                    maxWidth: 500
                                },
                                chartOptions: {
                                    legend: {
                                        layout: 'horizontal',
                                        align: 'center',
                                        verticalAlign: 'bottom'
                                    }
                                }
                            }]
                        }

                    });
                }).catch(err => {
                    console.log('err', err)
                })
        }

    }
};
x.send(null);
