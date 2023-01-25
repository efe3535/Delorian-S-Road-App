import React, { useEffect } from 'react';
import { useState, useRef } from "react";
import type { Node } from 'react';
import {
    SafeAreaView,
    Text,
    StatusBar,
    TouchableOpacity,
    View,
    PermissionsAndroid,
    Image,
    Modal,
    FlatList,
    Platform,
    Appearance,
    SectionList,
} from 'react-native';

import MQTT, { IMqttClient } from 'sp-react-native-mqtt';
import { CaretRight, Warning,ArrowRight } from 'phosphor-react-native';

import { Svg, Path } from 'react-native-svg';

import Geolocation from '@react-native-community/geolocation';

var array = require('lodash');

const ip = require("../ip").default

import Spinner from "react-native-loading-spinner-overlay"
import { merge } from 'lodash';

const isDark = Appearance.getColorScheme() == "dark"
const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];
const days = ["Pazar","Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"]

import AsyncStorage from "@react-native-async-storage/async-storage"

let STORAGE_KEY = '@sroad';
const NotificationsPage = ({ navigation, route }) => {
    const [koor, setKoor] = useState(null);
    const [invalidWarningVisible, setInvalidWarningVisible] = useState(false);
    const [reason, setReason] = useState(null);
    const [isInvalid, setIsInvalid] = useState(false);
    const [lastCommand, setLastCommand] = useState("");
    const [calismalar, setCalismalar] = useState([])
    const [location, setLocation] = useState("")
    const [photo, setPhoto] = useState([])
    const [descr, setDescr] = useState("")
    const [marked, setMarked] = useState(false)
    const [attr, setAttr] = useState([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    const refreshList = ( ) => {
        MQTT.createClient({
            uri: `mqtt://${ip}:1883`,
            clientId: 'teknofest' + Platform.OS
        }).then((client) => {
            client.on('message', function (msg) {
                if (msg.topic == "esp32/responsecalismalar" && JSON.parse(msg.data) != []) {
                    setCalismalar([])
                    let calismaList = []

                    for (let calisma in JSON.parse(msg.data)["calismalar"]) {
                        var date = new Date(parseInt(JSON.parse(msg.data)["calismalar"][calisma][5]))
                        var timestamp = (date.getDate() + " " + (monthNames[date.getMonth()]) + " " + days[date.getDay()]).toLocaleUpperCase("tr")
                        console.log(date.getDay());
                        setCalismalar(
                            calismalar => [...calismalar,
                            {
                                timestamp: timestamp,
                                data: [
                                    {
                                        num: calismalar.length,
                                        id: JSON.parse(msg.data)["calismalar"][calisma][0],
                                        koorX: JSON.parse(msg.data)["calismalar"][calisma][1],
                                        koorY: JSON.parse(msg.data)["calismalar"][calisma][2],
                                        reason: JSON.parse(msg.data)["calismalar"][calisma][3],
                                        descr: JSON.parse(msg.data)["calismalar"][calisma][4],
                                        ended: JSON.parse(msg.data)["calismalar"][calisma][6],
                                        hasPhoto: JSON.parse(msg.data)["calismalar"][calisma][7],
                                        date: date,
                                        day:date.getDate()
                                    }
                                ]
                            }]
                        )

                        calismaList.push({
                            timestamp: timestamp,
                            data: [
                                {
                                    num: calismalar.length,
                                    id: JSON.parse(msg.data)["calismalar"][calisma][0],
                                    koorX: JSON.parse(msg.data)["calismalar"][calisma][1],
                                    koorY: JSON.parse(msg.data)["calismalar"][calisma][2],
                                    reason: JSON.parse(msg.data)["calismalar"][calisma][3],
                                    descr: JSON.parse(msg.data)["calismalar"][calisma][4],
                                    ended: JSON.parse(msg.data)["calismalar"][calisma][6],
                                    hasPhoto: JSON.parse(msg.data)["calismalar"][calisma][7],
                                    date: date,
                                    day:date.getDate()
                                }
                            ]
                        })

                        console.log("_");
                        const groupedByTitle = array.groupBy(calismaList, "timestamp");
                        const groupedData = [];

                        for (const key of Object.keys(groupedByTitle)) {
                            const values = groupedByTitle[key].map(value => value.data).flat();
                            const group = { timestamp: key, data: values };
                            groupedData.push(group);
                        }
                        //console.log(calismalar);
                        //console.log(groupedData);
                        groupedData.reverse()
                        setCalismalar(groupedData)



                    }
                }
            });

            client.on('connect', function () {
                client.subscribe('esp32/coordinates', 0);
                client.subscribe('esp32/responsecalismalar', 0);
                client.publish("esp32/calismalar", "GET", 0, true)
                MQTTClient = client;
            });
            client.connect();

        })
    }

    useEffect(
        () => {
            Geolocation.getCurrentPosition(
                info => {
                    setKoor([info.coords.latitude, info.coords.longitude])
                })
            MQTT.createClient({
                uri: `mqtt://${ip}:1883`,
                clientId: 'teknofest' + Platform.OS
            }).then((client) => {
                client.on('message', function (msg) {
                    if (msg.topic == "esp32/responsecalismalar" && JSON.parse(msg.data) != []) {
                        setCalismalar([])
                        let calismaList = []

                        for (let calisma in JSON.parse(msg.data)["calismalar"]) {
                            var date = new Date(parseInt(JSON.parse(msg.data)["calismalar"][calisma][5]))
                            var timestamp = (date.getDate() + " " + (monthNames[date.getMonth()]) + " " + days[date.getDay()]).toLocaleUpperCase("tr")
                            setCalismalar(
                                calismalar => [...calismalar,
                                {
                                    timestamp: timestamp,
                                    data: [
                                        {
                                            num: calismalar.length,
                                            id: JSON.parse(msg.data)["calismalar"][calisma][0],
                                            koorX: JSON.parse(msg.data)["calismalar"][calisma][1],
                                            koorY: JSON.parse(msg.data)["calismalar"][calisma][2],
                                            reason: JSON.parse(msg.data)["calismalar"][calisma][3],
                                            descr: JSON.parse(msg.data)["calismalar"][calisma][4],
                                            ended: JSON.parse(msg.data)["calismalar"][calisma][6],
                                            hasPhoto: JSON.parse(msg.data)["calismalar"][calisma][7],
                                            date: date,
                                            day: date.getDate()
                                        }
                                    ]
                                }]
                            )

                            calismaList.push({
                                timestamp: timestamp,
                                data: [
                                    {
                                        num: calismalar.length,
                                        id: JSON.parse(msg.data)["calismalar"][calisma][0],
                                        koorX: JSON.parse(msg.data)["calismalar"][calisma][1],
                                        koorY: JSON.parse(msg.data)["calismalar"][calisma][2],
                                        reason: JSON.parse(msg.data)["calismalar"][calisma][3],
                                        descr: JSON.parse(msg.data)["calismalar"][calisma][4],
                                        ended: JSON.parse(msg.data)["calismalar"][calisma][6],
                                        hasPhoto: JSON.parse(msg.data)["calismalar"][calisma][7],
                                        date: date,
                                        day: date.getDate(),
                                        timestamp: JSON.parse(msg.data)["calismalar"][calisma][5],
                                    }
                                ]
                            })
                            console.log("_");
                            const groupedByTitle = array.groupBy(calismaList, "timestamp");
                            const groupedData = [];

                            for (const key of Object.keys(groupedByTitle)) {
                                const values = groupedByTitle[key].map(value => value.data).flat();
                                const group = { timestamp: key, data: values };
                                groupedData.push(group);
                            }
                            groupedData.reverse()
                            
                            setCalismalar(groupedData)
                            


                        }
                    }
                });

                client.on('connect', function () {
                    client.subscribe('esp32/coordinates', 0);
                    client.subscribe('esp32/responsecalismalar', 0);
                    client.publish("esp32/calismalar", "GET", 0, true)
                    client.publish("esp32/calismalar", "GET", 0, true)


                    MQTTClient = client;
                });
                client.connect();

            })
        },
        []
    )

    const renderItem = ({ item, index }) => {
        return (
            <View>
                <TouchableOpacity onPress={() => {
                    setPhoto([])
                    setLoading(true)
                    if (item.hasPhoto) {
                        MQTT.createClient({
                            uri: `mqtt://${ip}:1883`,
                            clientId: 'teknofest' + Platform.OS
                        }).then(function (client) {
                            //console.log(client);
                            
                            console.log("heeeey");
                            if (client) {
                                client.on("message", (msg) => {
                               if (msg.topic == "esp32/responsephotobyid") {
                                        console.log("GOT RESPONSE");
                                        setPhoto([])
                                        var ll = []
                                        if(msg.data.includes("📷")) {
                                            msg.data.split("📷").forEach(
                                                (elm, ind, arr) => {
                                                    setPhoto(photo => [...photo, { id: photo.length, photo: elm }]);
                                                    ll.push({ id: ll.length, photo: elm })
                                                }
                                            )
                                        } else {
                                            setPhoto([{id:photo.length,photo:msg.data}])
                                        }
                                        if (koor) {
                                            console.log("ALIVE2");
                                            navigation.navigate("WorkDetails", { item, koor: { x: koor[0], y: koor[1] }, photo: ll })
                                            setLoading(false)
                                            console.log("ALIVE3");

                                        }
                                }
                                    console.log(msg.data);
                                })
                                client.on('connect', function () {
                                    client.subscribe("esp32/responsephotobyid", 0);
                                    client.publish("esp32/photobyid", item.id.toString(), 0, false);
                                });

                                client.connect();
                            }
                        })


                    } else
                        setLoading(false)
                    if (koor)
                        navigation.navigate("WorkDetails", { item, koor: { x: koor[0], y: koor[1] }, photo: null })

                }} style={{ flexDirection: "row", flexShrink: 1, marginTop: 16 }}>
                    <Svg width="43" height="37" viewBox="0 0 43 37" fill="none" xmlns="http://www.w3.org/2000/svg" style={{alignSelf:"center", marginLeft:30}}>
                        <Path d="M3.67852 34.4123L21.5 4.57167L39.3215 34.4123H3.67852Z" fill={item.ended==1?"#43f680":"#FAD03C"} stroke={"black"} strokeWidth={isDark?"0":"4.17543"} />
                    </Svg>


                    <Text style={{ color: isDark ? "#fff" : "#000", fontWeight: "600", flexShrink: 1, marginLeft: 10 }}>{item.descr?.toString()} konumundaki yol çalışması {item.ended ? "sona erdi." : "devam ediyor."}</Text>
                    <CaretRight size={38} color={isDark ? "#fff" : "#000"} style={{ marginLeft: 10, alignSelf: "center", marginRight: 10 }} />

                </TouchableOpacity>
            </View>
        )
    }

    return (
        <SafeAreaView style={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", flex: 1 }}>
            <Spinner animation='fade' visible={loading} textContent={"Yükleniyor"} overlayColor={"#000000aa"} textStyle={{ fontSize: 24, fontWeight: "300" }} />

            <Text style={{ color: isDark ? "#fff" : "#000", fontWeight: "700", fontSize: 36, marginTop: 60, marginLeft: 30 }}>Bildirimler</Text>
            <SectionList
                refreshing={refreshing} 
                onRefresh={refreshList}
                sections={calismalar}
                renderItem={renderItem}
                renderSectionHeader={({ section: { timestamp } }) => (<Text style={{ marginLeft: 30, fontSize: 20, fontWeight: "500", marginTop: 30, color: isDark ? "#a8a8a8" : "#575757" }}>{timestamp}</Text>)}
                keyExtractor={item => item.id}
            />
            <TouchableOpacity style={{flexDirection:"row",flex:1, backgroundColor:isDark?"#1b1b1b":"#fff", alignSelf:"flex-end", borderRadius:56, borderWidth:2, borderColor:isDark?"#262626":"#d9d9d9", padding:16, position:"absolute", alignItems:"center", alignContent:"center", justifyContent:"center", marginRight:28, marginBottom:12, bottom:0, right:0}}
            onPress={()=>{setCalismalar([])}}
            >
                <ArrowRight size={36} color={isDark?"#fff":"#000"} />
                <Text style={{ marginLeft:8, alignSelf:"center", justifyContent:"center", textAlign:"center", textAlignVertical:"center", fontSize:18, color:isDark?"#FFF":"#000"}}>Tümünü sil</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

export default NotificationsPage;