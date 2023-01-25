import React, { useEffect } from 'react';
import { useState, useRef } from "react";
import type { Node } from 'react';

import html_script from "../html_script"
import html_script_light from '../html_script_light';
import { Svg, Path } from "react-native-svg"

import {
    SafeAreaView,
    Text,
    StatusBar,
    TouchableOpacity,
    View,
    FlatList,
    Modal,
    Appearance,
    TextInput,
    ScrollView,
    Dimensions
} from 'react-native';

const isDark = Appearance.getColorScheme() == "dark"

import MQTT, { IMqttClient } from "sp-react-native-mqtt"

const ip = require("../ip").default

import { Calendar, CaretLeft, DotsThreeVertical, NavigationArrow, Repeat } from 'phosphor-react-native';

import { WebView } from "react-native-webview"

import ContextMenu from "react-native-context-menu-view";
import { useFocusEffect } from '@react-navigation/native';



let STORAGE_KEY = '@routes-item';

import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const between = ( min, x, max) => {
    return min < x &&  max > x;
  }

let found

const RouteDetails = ({ navigation, route }) => {
    const mapRef = useRef(null)
    const [firstDescr, setFirstDescr] = useState("")
    const [calismalar, setCalismalar] = useState([])
    const [match,setMatch] = useState(false)

    const [secDescr, setSecDescr] = useState("")
    const item = route.params.item

    const deleteItem = async (id) => {
        let items = await AsyncStorage.getItem(STORAGE_KEY)
        items = JSON.parse(items)
        for(let key in items.routes) {
            if(items.routes[key].id == id) {
                items.routes.splice(items.routes.indexOf(items.routes[key]),1)
            } 
        }
        console.log(items);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }

    useEffect(() => {
        fetch(`https://nominatim.openstreetmap.org/search.php?q=${item.x},${item.y}&polygon_geojson=1&format=json`, { headers: { "Accept-Language": "tr" } }).then(response => response.json()).then(json => setFirstDescr(json[0]["display_name"]))
        fetch(`https://nominatim.openstreetmap.org/search.php?q=${item.x2},${item.y2}&polygon_geojson=1&format=json`, { headers: { "Accept-Language": "tr" } }).then(response => response.json()).then(json => setSecDescr(json[0]["display_name"]))

        
    }, [])

    useFocusEffect(() => {
        found = false
        fetch(`https://nominatim.openstreetmap.org/search.php?q=${item.x},${item.y}&polygon_geojson=1&format=json`, { headers: { "Accept-Language": "tr" } }).then(response => response.json()).then(json => setFirstDescr(json[0]["display_name"]))
        fetch(`https://nominatim.openstreetmap.org/search.php?q=${item.x2},${item.y2}&polygon_geojson=1&format=json`, { headers: { "Accept-Language": "tr" } }).then(response => response.json()).then(json => setSecDescr(json[0]["display_name"]))
       
        mapRef.current.injectJavaScript(
            `mymap.setView([${item.x},${item.y}],14);
            L.Routing.control({
                waypoints: [
                L.latLng(${item.x}, ${item.y}),
                L.latLng(${item.x2}, ${item.y2})
                ],
                show:false,
                draggableWaypoints:false,
                lineOptions : {
                    addWaypoints: false
                },
                routeWhileDragging: false,
                createMarker:()=>{return null},
            }).addTo(mymap);
            `
        )
        console.log("kkkkk");
        MQTT.createClient({
            uri: `mqtt://${ip}:1883`,
            clientId: 'teknofest' + Platform.OS
        }).then((client) => {
            client.on('message', function (msg) {
                if (msg.topic == "esp32/responsecalismalar" && JSON.parse(msg.data) != []) {
                    for(let calismakoor in JSON.parse(msg.data)["calismalar"]) {
                        console.log(item.x,item.y,item.x2,item.y2);
                        if(between(item.x<=item.x2?item.x:item.x2, parseFloat(JSON.parse(msg.data)["calismalar"][calismakoor][1]) ,item.x2>=item.x?item.x2:item.x) && between(item.y<=item.y2?item.y:item.y2, parseFloat(JSON.parse(msg.data)["calismalar"][calismakoor][2]) , item.y2>=item.y?item.y2:item.y)) {
                            found = true
                            setMatch(true)
                        }
                    }

                    if(found==false) {
                        console.log("b");
                        setMatch(false)
                    }

                }
            })

            client.on('connect', function () {
                client.subscribe('esp32/coordinates', 0);
                client.subscribe('esp32/responsecalismalar', 0);
                client.publish("esp32/calismalar", "GET", 0, true)
                MQTTClient = client;

            });
            client.connect();
        })

    })

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff" }}>
            <TouchableOpacity style={{ flexDirection: "row", marginLeft: 30, marginTop: 24 }} onPress={() => navigation.goBack()}>
                <CaretLeft color={isDark ? "#fff" : "#000"} style={{ alignSelf: "center" }} size={26} />
                <Text style={{ color: isDark ? "#fff" : "#000", textAlign: "center", alignSelf: "center" }}>Geri</Text>
            </TouchableOpacity>

            <View style={{ width: "100%", flexDirection: "row" }}>
                <Text style={{ fontSize: 36, fontWeight: "700", marginLeft: 30, color: isDark ? "#fff" : "#000" }}>{item.name}</Text>
                <ContextMenu onPress={(e)=>{
                    if(e.nativeEvent.index == 1) {
                        deleteItem(item.id)
                    }
                }} style={{ alignSelf: "center", top: 12, right: 30, position: "absolute" }} actions={[{ title: "Düzenle" }, { title: "Sil" }]}>
                    <DotsThreeVertical size={32} color={isDark ? "#fff" : "#000"} />
                </ContextMenu>
            </View>

            <WebView
                androidHardwareAccelerationDisabled
                androidLayerType='software'
                renderToHardwareTextureAndroid={true}
                containerStyle={{ minWidth: "90%", minHeight: 250, maxWidth: "90%", maxHeight: 250, margin: 30, borderRadius: 8, alignSelf: "center" }}
                ref={mapRef}
                source={{ html: isDark ? html_script : html_script_light }}
                onLoad={() => {
                    mapRef.current.injectJavaScript(
                        `mymap.setView([${item.x},${item.y}],14);
                    L.Routing.control({
                        waypoints: [
                        L.latLng(${item.x}, ${item.y}),
                        L.latLng(${item.x2}, ${item.y2})
                        ],
                        show:false,
                        draggableWaypoints:false,
                        lineOptions : {
                            addWaypoints: false
                        },
                        routeWhileDragging: false,
                        createMarker:()=>{return null},
                    }).addTo(mymap);
                    `
                    )

                }
                }
            />
            
            <Text style={{ marginLeft: 30, color: isDark ? "#fff" : "#000" }}>{item.descr}</Text>
            
            <View style={{marginLeft:30, flexDirection:"row", marginTop:15}}>
                <Svg width="43" height="37" viewBox="0 0 43 37" fill="none" xmlns="http://www.w3.org/2000/svg" >
                    <Path d="M3.67852 34.4123L21.5 4.57167L39.3215 34.4123H3.67852Z" fill={match?"#FAD03C":"#43f680"} stroke={"black"} strokeWidth={isDark?"0":"4.17543"} />
                </Svg>
                <View style={{marginLeft:15}}>
                    <Text style={{color:isDark?"#fff":"#000", fontWeight:"700" }} >Durum</Text>
                    <Text style={{color:isDark?"#fff":"#000"}}>{match?"Yol Çalışması Sürüyor":"Yol Çalışması Bulunmuyor"}</Text>
                </View>
            </View>
            <View style={{ flexDirection: "row", flexShrink: 1, marginLeft: 30 }}>
                <NavigationArrow size={43} style={{ alignSelf: "center" }} color={isDark ? "#fff" : "#000"} />
                <View style={{ marginLeft: 18, flexShrink: 1, marginRight: 32 }}>
                    <Text style={{ fontWeight: "700", color: isDark ? "#fff" : "#000", marginTop:15 }}>Konumu</Text>
                    <Text style={{ color: isDark ? "#a8a8a8" : "#575757" }}>{firstDescr} - </Text>
                    <Text style={{ color: isDark ? "#a8a8a8" : "#575757" }}>{secDescr}</Text>
                </View>
            </View>

            <View style={{ flexDirection: "row", flexShrink: 1, marginLeft: 30, marginTop: 20 }}>
                <Calendar color={isDark ? "#fff" : "#000"} size={43} style={{ alignSelf: "center" }} />
                <View style={{ flexShrink: 1, marginLeft: 18, marginRight: 32 }}>
                    <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000" }}>Günler</Text>
                    <Text style={{ color: isDark ? "#a8a8a8" : "#575757" }}>{item.date}</Text>
                </View>
            </View>

            <View style={{ flexDirection: "row", flexShrink: 1, marginLeft: 30, marginTop: 20 }}>
                <Repeat color={isDark ? "#fff" : "#000"} size={43} style={{ alignSelf: "center" }} />
                <View style={{ flexShrink: 1, marginLeft: 18, marginRight: 32 }}>
                    <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000" }}>Tekrarlama Sıklığı</Text>
                    <Text style={{ color: isDark ? "#a8a8a8" : "#575757" }}>{item.repeat}</Text>
                </View>
            </View>
        </View>
    )
}

export default RouteDetails