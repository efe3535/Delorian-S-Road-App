import React, { useEffect } from 'react';
import { useState, useRef } from "react";
import type { Node } from 'react';

import html_script from "../html_script"
import {
    SafeAreaView,
    Text,
    StatusBar,
    TouchableOpacity,
    View,
    Image,
    Modal,
    FlatList,
    Appearance,
    Alert,
    ScrollView,
    RefreshControl,
    Platform
} from 'react-native';


import Spinner from 'react-native-loading-spinner-overlay';
import { WebView } from 'react-native-webview';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CaretRight, NavigationArrow, Warning } from "phosphor-react-native"
import { Svg, Path } from "react-native-svg"


const ip = require("../ip").default
import AsyncStorage from "@react-native-async-storage/async-storage";

import MQTT, { IMqttClient } from "sp-react-native-mqtt";
import html_script_light from '../html_script_light';

import Geolocation from '@react-native-community/geolocation';
Geolocation.requestAuthorization()
let once = false
var MQTTClient: IMqttClient;
const isDark = Appearance.getColorScheme() == "dark"
const HomePage = ({ navigation, route }) => {
    const mapRef = useRef(null);
    console.log(ip);
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
    useEffect(
        () => {
            MQTT.createClient({
                uri: `mqtt://${ip}:1883`,
                clientId: 'teknofest' + Platform.OS
            }).then((client) => {
                client.on('message', function (msg) {
                    if (msg.topic == "esp32/responsecalismalar" && JSON.parse(msg.data) != []) {

                        for (let calisma in JSON.parse(msg.data)["calismalar"]) {
                            setCalismalar(
                                calismalar => [...calismalar,
                                {
                                    id: JSON.parse(msg.data)["calismalar"][calisma][0],
                                    koorX: JSON.parse(msg.data)["calismalar"][calisma][1],
                                    koorY: JSON.parse(msg.data)["calismalar"][calisma][2],
                                    reason: JSON.parse(msg.data)["calismalar"][calisma][3],
                                    descr: JSON.parse(msg.data)["calismalar"][calisma][4],
                                    timestamp: JSON.parse(msg.data)["calismalar"][calisma][5],
                                    ended: JSON.parse(msg.data)["calismalar"][calisma][6],
                                    hasPhoto: JSON.parse(msg.data)["calismalar"][calisma][7],
                                }]
                            )
                        }
                    }

                    if (msg.topic == "esp32/responsekoorbyid") {
                        try {
                            msg.data
                        } catch (err) {
                            console.log(err);
                        }
                    }

                    if (msg.topic == "esp32/responsephotobyid") {
                        setPhoto([])
                        if(msg.data.includes("📷")) {
                            msg.data.split("📷").forEach(
                                (elm, ind, arr) => {
                                    setPhoto(photo => [...photo, { id: photo.length, photo: elm }])
                                }
                            )
                        } else {
                            console.log("else")
                            setPhoto([{id:photo.length, photo:msg.data[0]}])
                        }
                    }

                });

                client.on('connect', function () {
                    //console.log('connected');
                    client.subscribe('esp32/coordinates', 0);
                    client.subscribe('esp32/responsekoorbyid', 0);
                    client.subscribe('esp32/responsephotobyid', 0);

                    client.subscribe('esp32/responsecalismalar', 0);
                    client.publish("esp32/calismalar", "GET", 0, true)
                    MQTTClient = client;

                });
                client.connect();
            })
            Geolocation.getCurrentPosition(
                info => {
                    fetch(`https://nominatim.openstreetmap.org/search.php?q=${info.coords.latitude},${info.coords.longitude}&polygon_geojson=1&format=json`, { headers: { "Accept-Language": "tr" } }).then(response => response.json()).then(json => setLocation(json[0]["display_name"]))
                        .catch((e) => console.log(e))
                    setKoor([info.coords.latitude, info.coords.longitude])
                })
            MQTTClient != undefined ? markKoor() : null
        },
        []
    )

    const markKoor = () => {
        setCalismalar([])
        MQTTClient.connect()
        MQTTClient.publish("esp32/calismalar", "GET", 0, true)
        setMarked(true)
        setRefreshing(false)

    }

    const renderItem = ({ item, index }) => {
        return (
            <View style={{ flexDirection: "row", flexShrink: 1, marginTop: 15 }}>
                <Svg width="43" height="37" viewBox="0 0 43 37" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ alignSelf: "center", marginLeft: 30 }}>
                    <Path d="M3.67852 34.4123L21.5 4.57167L39.3215 34.4123H3.67852Z" fill={item.ended == 1 ? "#43f680" : "#FAD03C"} stroke="black" strokeWidth={"4.17543"} />
                </Svg>
                <View style={{ margin: 10.5, flexShrink: 1 }}>
                    <TouchableOpacity onPress={() => {
                        console.log("ALIVE1");
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
                                            let photo = [];
                                            setPhoto([])
                                            var ll = []
                                            if(msg.data.includes("📷")==true) {
                                                console.log(msg.data.split("📷"));
                                                msg.data.split("📷").forEach(
                                                    (elm, ind, arr) => {
                                                        setPhoto(photo => [...photo, { id: photo.length, photo: elm }]);
                                                        ll.push({ id: ll.length, photo: elm })
                                                    }
                                                )
                                            } else {
                                                console.log(msg.data.slice(2,-2));
                                                
                                                ll = [ {id:photo.length,photo:msg.data.slice(2,-2) } ] 
                                            }
                                            if (koor) {
                                                console.log("ALIVE2");
                                                navigation.navigate("WorkDetails", { item, koor: { x: koor[0], y: koor[1] }, photo: ll })
                                                setLoading(false)
                                                console.log("ALIVE3");

                                            }
                                    }
                                    })
                                    client.on('connect', function () {
                                        client.subscribe("esp32/responsephotobyid", 0);
                                        client.publish("esp32/photobyid", item.id.toString(), 0, false);
                                    });

                                    client.connect();
                                }
                            })
                        } else {
                            setLoading(false)
                            if (koor) {
                                navigation.navigate("WorkDetails", { item, koor: { x: koor[0], y: koor[1] }, photo: null })
                            }
                        }
                    }}>
                        <Text style={{ color: isDark ? "#fff" : "#000", fontWeight: "600" }}>{item.descr?.toString()} konumunda yol çalışması</Text>
                        <Text style={{ color: isDark ? "#fff" : "#000", fontWeight: "400" }}>{item.reason}</Text>
                    </TouchableOpacity>
                </View>
                <CaretRight size={38} color={isDark ? "#fff" : "#000"} style={{ alignSelf: 'center', justifyContent: "center" }} />
            </View>
        )
    }


    const koorById = () => {
        MQTTClient.reconnect()
        MQTTClient.publish("esp32/koorbyid", "3", 0, false);
    }


    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false)
    return (
        <SafeAreaView style={{
            backgroundColor: isDark ? "#1b1b1b" : "#fff",
            flex: 1,
            flexDirection: "column"
        }

        }>
            <Spinner animation='fade' visible={loading} textContent={"Yükleniyor"} overlayColor={"#000000aa"} textStyle={{ fontSize: 24, fontWeight: "300" }} />
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View style={{ flexDirection: "row", marginTop: 10 }}>
                <Text style={
                    {
                        fontSize: 36, color: isDark ? "#FFFFFF" : "#000000", marginLeft: 32,
                        marginTop: 20, fontWeight: "700"
                    }}>Selam, test!</Text>
                <View style={{ alignContent: "center", justifyContent: "center", alignItems: "stretch", alignSelf: "center", flex: 1, flexDirection: "row" }}>
                    <Image source={require("../pp.png")} style={{ width: 37, height: 37, justifyContent: "flex-end", marginRight: 0, marginTop: 18, alignSelf: "center" }} />
                </View>
            </View>

            <View style={{ flexDirection: "row", }}>
                <NavigationArrow style={{ marginLeft: 32, marginTop: 15 }} size={48} color={isDark ? "#fff" : "#000"} />
                <View style={{ flexDirection: "column", justifyContent: "center", marginLeft: 20, marginTop: 15, flexShrink: 1 }}>
                    <Text style={{ fontSize: 18, textAlign: "left", color: isDark ? "#fff" : "#000", fontWeight: "600" }}>Konumunuz</Text>
                    <Text style={{ fontSize: 18, textAlign: "left", color: isDark ? "#fff" : "#000", fontWeight: "300", flexShrink: 1, marginRight: 30 }}>{location?.toString()}</Text>
                </View>
            </View>

            <Text style={{ marginLeft: 30, marginTop: 30, fontSize: 18, color: isDark ? "#a8a8a8" : "#575757" }}>YAKININIZDAKİ YOL ÇALIŞMALARI</Text>
            <FlatList
                data={calismalar}
                renderItem={renderItem}
                keyExtractor={item => item["id"]}
                refreshControl={<RefreshControl progressBackgroundColor={isDark ? "#1d1d1d" : "#eee"} colors={[isDark ? "#fff" : "#000"]} refreshing={refreshing} onRefresh={markKoor}></RefreshControl>}
                onRefresh={markKoor}
                refreshing={refreshing}

            />
        </SafeAreaView>
    );
}

export default HomePage;