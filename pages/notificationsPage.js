import React, { useCallback, useEffect } from 'react';
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

import { CaretRight, Warning, ArrowRight } from 'phosphor-react-native';

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
const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"]

import AsyncStorage from "@react-native-async-storage/async-storage"

import init from "react_native_mqtt"

let STORAGE_KEY = '@sroad';



init({
    size: 10000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24,
    enableCache: true,
    reconnect: true,
    sync: {
    }
});

const client = new Paho.MQTT.Client(ip, 1923, 'uname_notif'+ (Math.random() * 10000).toString());

function onConnect() {
    console.log("onConnect");
    client.subscribe("esp32/test")
    client.subscribe('esp32/coordinates');
    client.subscribe('esp32/responsecalismalar');
    client.subscribe('esp32/responsephotobyid');

    client.send("esp32/calismalar", "GET", 0, false)
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }
    client.connect({ onSuccess: onConnect, onFailure: fail })
}

function fail(err) {
    console.log(err);
}

client.connect({ onSuccess: onConnect, onFailure: fail });
client.onConnectionLost = onConnectionLost;

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
    const [itemState, setItemState] = useState({})
    const [loading, setLoading] = useState(false)
    const [expecting,setExpecting] = useState(false)
    const [refreshing, setRefreshing] = useState(false)


    const onMessageArrived = (msg) => {
        //console.log("onMessageArrived:" + msg.payloadString, msg.topic);
        if(expecting) {
            if (msg.topic == "esp32/responsecalismalar" && JSON.parse(msg.payloadString) != []) {
                //setCalismalar([])
                let calismaList = []

                for (let calisma in JSON.parse(msg.payloadString)["calismalar"]) {
                    var date = new Date(parseInt(JSON.parse(msg.payloadString)["calismalar"][calisma][5]))
                    var timestamp = (date.getDate() + " " + (monthNames[date.getMonth()]) + " " + days[date.getDay()]).toLocaleUpperCase("tr")
                    setCalismalar(
                        calismalar => [...calismalar,
                        {
                            timestamp: timestamp,
                            data: [
                                {
                                    num: calismalar.length,
                                    id: JSON.parse(msg.payloadString)["calismalar"][calisma][0],
                                    koorX: JSON.parse(msg.payloadString)["calismalar"][calisma][1],
                                    koorY: JSON.parse(msg.payloadString)["calismalar"][calisma][2],
                                    reason: JSON.parse(msg.payloadString)["calismalar"][calisma][3],
                                    descr: JSON.parse(msg.payloadString)["calismalar"][calisma][4],
                                    ended: JSON.parse(msg.payloadString)["calismalar"][calisma][6],
                                    hasPhoto: JSON.parse(msg.payloadString)["calismalar"][calisma][7],
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
                                id: JSON.parse(msg.payloadString)["calismalar"][calisma][0],
                                koorX: JSON.parse(msg.payloadString)["calismalar"][calisma][1],
                                koorY: JSON.parse(msg.payloadString)["calismalar"][calisma][2],
                                reason: JSON.parse(msg.payloadString)["calismalar"][calisma][3],
                                descr: JSON.parse(msg.payloadString)["calismalar"][calisma][4],
                                ended: JSON.parse(msg.payloadString)["calismalar"][calisma][6],
                                hasPhoto: JSON.parse(msg.payloadString)["calismalar"][calisma][7],
                                date: date,
                                day: date.getDate(),
                                timestamp: JSON.parse(msg.payloadString)["calismalar"][calisma][5],
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

            if (msg.topic == "esp32/responsephotobyid") {
                console.log("GOT RESPONSE - NOTIFICATIONS");
                let photo = [];
                //setPhoto([])
                var ll = []
                if (msg.payloadString.includes("📷") == true) {
                    //console.log(msg.payloadString.split("📷"));
                    msg.payloadString.split("📷").forEach(
                        (elm, ind, arr) => {
                            //setPhoto(photo => [...photo, { id: photo.length, photo: elm }]);
                            ll.push({ id: ll.length, photo: elm })
                        }
                    )
                } else {
                    //console.log(msg.payloadString.slice(2, -2));

                    ll = [{ id: photo.length, photo: msg.payloadString.slice(2, -2) }]
                }
                if (koor) {
                    console.log("ALIVE2");
                    console.log("navigate -> ",itemState.toString());

                    navigation.navigate("WorkDetails", { item: itemState, a:"b", koor: { x: koor[0], y: koor[1] }, photo: ll })
                    setLoading(false)

                }
            }
            setExpecting(false)
        }
    }

    client.onMessageArrived = onMessageArrived


    useEffect(
        () => {
            setExpecting(true)
            client.send("esp32/calismalar", "GET", 0, false)
            refreshList()

        },
        []
    )
   
    

    const refreshList = () => {
        Geolocation.getCurrentPosition(
            info => {
                setKoor([info.coords.latitude, info.coords.longitude])
            })
            setExpecting(true)
        client.send("esp32/calismalar", "GET", 0, false)


    }

    const renderItem = ({ item, index }) => {
        return (
            <View>
                <TouchableOpacity onPress={() => {
                    console.log("ALIVE1");
                    setPhoto([])
                    setLoading(true)
                    setItemState(item)
                    if (item.hasPhoto) {
                        console.log("item.id\t" + item.id);
                        //console.log(client);
                        setExpecting(true)
                        client.send("esp32/photobyid", item.id.toString(), 0, false)
                        console.log("heeeey");

                    } else {
                        setLoading(false)
                        if (koor) {
                            navigation.navigate("WorkDetails", { item: item, koor: { x: koor[0], y: koor[1] }, photo: null })
                        }
                    }
                }} style={{ flexDirection: "row", flexShrink: 1, marginTop: 16 }}>
                    <Svg width="43" height="37" viewBox="0 0 43 37" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ alignSelf: "center", marginLeft: 30 }}>
                        <Path d="M3.67852 34.4123L21.5 4.57167L39.3215 34.4123H3.67852Z" fill={item.ended == 1 ? "#43f680" : "#FAD03C"} stroke={"black"} strokeWidth={isDark ? "0" : "4.17543"} />
                    </Svg>


                    <Text style={{ color: isDark ? "#fff" : "#000000", fontWeight: "600", flexShrink: 1, marginLeft: 10 }}>{item.descr?.toString()} konumundaki yol çalışması {item.ended ? "sona erdi." : "devam ediyor."}</Text>
                    <CaretRight size={38} color={isDark ? "#fff" : "#000000"} style={{ marginLeft: 10, alignSelf: "center", marginRight: 10 }} />

                </TouchableOpacity>
            </View>
        )
    }

    return (
        <SafeAreaView style={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", flex: 1 }}>
            <Spinner animation='fade' visible={loading} textContent={"Yükleniyor"} overlayColor={"#000000aa"} textStyle={{ fontSize: 24, fontWeight: "300" }} />

            <Text style={{ color: isDark ? "#fff" : "#000000", fontWeight: "700", fontSize: 36, marginTop: 60, marginLeft: 30 }}>Bildirimler</Text>
            <SectionList
                refreshing={refreshing}
                onRefresh={refreshList}
                sections={calismalar}
                renderItem={renderItem}
                renderSectionHeader={({ section: { timestamp } }) => (<Text style={{ marginLeft: 30, fontSize: 20, fontWeight: "500", marginTop: 30, color: isDark ? "#a8a8a8" : "#575757" }}>{timestamp}</Text>)}
                keyExtractor={item => item.id}
            />
            <TouchableOpacity style={{ flexDirection: "row", flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff", alignSelf: "flex-end", borderRadius: 56, borderWidth: 2, borderColor: isDark ? "#262626" : "#d9d9d9", padding: 16, position: "absolute", alignItems: "center", alignContent: "center", justifyContent: "center", marginRight: 28, marginBottom: 12, bottom: 0, right: 0 }}
                onPress={() => { setCalismalar([]) }}
            >
                <ArrowRight size={36} color={isDark ? "#fff" : "#000000"} />
                <Text style={{ marginLeft: 8, alignSelf: "center", justifyContent: "center", textAlign: "center", textAlignVertical: "center", fontSize: 18, color: isDark ? "#FFF" : "#000000" }}>Tümünü sil</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

export default NotificationsPage;