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

import { WebView } from 'react-native-webview';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CaretRight, NavigationArrow, Warning } from "phosphor-react-native"

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

    const [koor, setKoor] = useState(null);
    const [invalidWarningVisible, setInvalidWarningVisible] = useState(false);
    const [reason, setReason] = useState(null);
    const [isInvalid, setIsInvalid] = useState(false);
    const [lastCommand, setLastCommand] = useState("");
    const [calismalar, setCalismalar] = useState([])
    const [location, setLocation] = useState("")
    const [photo,setPhoto] = useState([])
    const [descr, setDescr] = useState("")
    const [marked, setMarked] = useState(false)
    const [attr, setAttr] = useState([])
    useEffect(
        //  () => Geolocation.getCurrentPosition(info=>setLocation(info.coords.latitude + "," + info.coords.longitude)),
        // () => Geolocation.getCurrentPosition(info => setLocation(info)),
        () => {
            MQTT.createClient({
                uri: 'mqtt://192.168.1.64:1883',
                clientId: 'teknofest' + Platform.OS
            }).then((client) => {
                client.on('message', function (msg) {
                    /*if (!msg.data.includes("INVALID")) {
                        setKoor(msg.data.split("-")[0].split(","));
                        setReason(msg.data.split("-")[1])
                    } else {
                        setKoor(null);
                        setReason(null);
                    }
                    
                    console.log(msg.data)
                    // msg.data.includes("INVALID")?setIsInvalid(true):setIsInvalid(false);
                    //  console.log(msg.data)*/
                    if (msg.topic == "esp32/responsecalismalar" && JSON.parse(msg.data) != []) {
                        setCalismalar([])
                        //console.log(JSON.parse(msg.data)["calismalar"])
                        // console.log(JSON.parse(msg.data)["calismalar"].sort((data => data[1] + "," + data[2])))
                        for (let calisma in JSON.parse(msg.data)["calismalar"]) {
                            setCalismalar(
                                calismalar => [...calismalar,
                                {
                                    id: JSON.parse(msg.data)["calismalar"][calisma][0],
                                    koorX: JSON.parse(msg.data)["calismalar"][calisma][1],
                                    koorY: JSON.parse(msg.data)["calismalar"][calisma][2],
                                    reason: JSON.parse(msg.data)["calismalar"][calisma][3],
                                    descr: JSON.parse(msg.data)["calismalar"][calisma][4],
                                    hasPhoto: JSON.parse(msg.data)["calismalar"][calisma][5],
//                                    photoPath: JSON.parse(msg.data)["calismalar"][calisma][6],
                                }]
                            )
                            //console.log(descr)
                            /*
                                                    mapRef.current.injectJavaScript(`   var marker = L.marker([${JSON.parse(msg.data)["calismalar"][calisma]["calisma"][1]}, ${JSON.parse(msg.data)["calismalar"][calisma]["calisma"][2]}],{icon:greenIcon}).addTo(mymap)
                                                    ;    mymap.setView([${JSON.parse(msg.data)["calismalar"][calisma]["calisma"][1]}, ${JSON.parse(msg.data)["calismalar"][calisma]["calisma"][2]}], 18) ; true
                                                    `)*/
              
                        }
                        // console.log(msg.data);
                    }

                    if (msg.topic == "esp32/responsekoorbyid") {
                        try {
                            // console.log(JSON.parse(msg.data)["koorbyid"].sort((data=>data[1] + "," + data[2])))
                            console.log(msg.data)
                        } catch (err) {
                            console.log(err);
                        }
                        // console.log(msg.data);
                    }
                    
                    if (msg.topic == "esp32/responsephotobyid") {
                        setPhoto([])
                        msg.data.split("📷").forEach(
                            (elm, ind, arr) => {
                                setPhoto(photo=>[...photo, { id: photo.length - 1, photo: elm }] )
                            }
                        )
                    }

                });

                client.on('connect', function () {
                    //console.log('connected');
                    client.subscribe('esp32/coordinates', 0);
                    client.subscribe('esp32/responsekoorbyid', 0);
                    client.subscribe('esp32/responsephotobyid', 0);

                    client.subscribe('esp32/responsecalismalar', 0);

                    MQTTClient = client;

                });
                client.connect();
            })
            Geolocation.getCurrentPosition(
                info => {
                    fetch(`https://nominatim.openstreetmap.org/search.php?q=${info.coords.latitude},${info.coords.longitude}&polygon_geojson=1&format=json`, { headers: { "Accept-Language": "tr" } }).then(response => response.json()).then(json => setLocation(json[0]["display_name"]))
                    setKoor([info.coords.latitude, info.coords.longitude])
                })
                MQTTClient != undefined ? markKoor() : null
        },
        []
    )

    const markKoor = () => {
        /*
        if (koor) {
            mapRef.current.injectJavaScript(`   var marker = L.marker([${koor[0]}, ${koor[1]}],{icon:greenIcon}).addTo(mymap)
      ;    mymap.setView([${koor[0]}, ${koor[1]}], 18) ; true
      `)
        } else {
            setInvalidWarningVisible(true);
        }*/

        setCalismalar([])
        MQTTClient.connect()
        MQTTClient.publish("esp32/calismalar", "GET", 0, true)
        setMarked(true)
        setRefreshing(false)

        // await console.log(calismalar)

    }
    
    const renderItem = ({ item, index }) => {
        return (
            <View style={{ flexDirection: "row", flexShrink: 1, marginTop: 15 }}>
                <Warning size={38} color={"orange"} style={{ alignSelf: "center", marginLeft: 30 }} />
                <View style={{ margin: 10.5, flexShrink: 1 }}>
                    <TouchableOpacity onPress={() => {
                        setPhoto([])
                        if(item.hasPhoto) {
                            MQTT.createClient({
                                uri: 'mqtt://192.168.1.64:1883',
                                clientId: 'teknofest' + Platform.OS
                            }).then(function (client) {
                                client.on("message", (msg) => {
            
                                    if (msg.topic == "esp32/responsephotobyid") {
                                        setPhoto([])
                                        var ll = []
                                        msg.data.split("📷").forEach(
                                            (elm, ind, arr) => {
                                                setPhoto(photo => [...photo, { id: photo.length, photo: elm }]);   
                                                ll.push({id:ll.length, photo:elm})
                                            }
                                        )
                                        
                                        navigation.navigate("WorkDetails", {item, koor:{x: koor[0], y:koor[1]}, photo:ll })
                                    }
                                })
                                client.on('connect', function () {
                                    client.subscribe("esp32/responsephotobyid", 0);
                                    client.publish("esp32/photobyid", item.id.toString(), 0, false);
                                });
            
                                client.connect();
                            }).catch(function (err) {
                                console.log(err);
                            });
                            // MQTTClient.publish("esp32/photobyid",item.id.toString(),0,false)
                            
                        
                        } else
                            navigation.navigate("WorkDetails", { item, koor:{x:koor[0], y:koor[1]}, photo:null }) 
                            
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

    return (
        <SafeAreaView style={{
            backgroundColor: isDark ? "#1b1b1b" : "#fff",
            flex: 1,
            flexDirection: "column"
        }

        }>

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
                    <Text style={{ fontSize: 18, textAlign: "left", color: isDark ? "#fff" : "#000", fontWeight: "300", flexShrink: 1, marginRight:30 }}>{location?.toString()}</Text>
                </View>
            </View>
            {/*}
                <View style={{ flexDirection: "row" }}>
                    <View style={{ flex: 1, height: 300, backgroundColor: "black", shadowOffset: { width: 0, height: 0 }, elevation: 15, marginTop: 20, borderRadius: 6, shadowColor: "#2d2d2d", shadowRadius: 12, shadowOpacity: 0.8, margin: 15 }}>
                        <WebView containerStyle={{ borderRadius: 6 }} ref={mapRef} source={{ html: Appearance.getColorScheme() == "dark" ? html_script : html_script_light }} style={{ flex: 1 }} />
                    </View>
                </View>
                    {*/}

            <Text style={{ marginLeft: 30, marginTop: 30, fontSize: 18, color: isDark ? "#a8a8a8" : "#575757" }}>YAKININIZDAKİ YOL ÇALIŞMALARI</Text>
            <FlatList
                data={calismalar}
                renderItem={renderItem}
                keyExtractor={item => item["id"]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={markKoor}></RefreshControl>}
                onRefresh={markKoor}
                refreshing={refreshing}

            />
        </SafeAreaView>
    );
}

export default HomePage;