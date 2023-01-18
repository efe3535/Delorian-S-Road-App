import React, { useCallback, useEffect, useReducer } from 'react';
import { useState, useRef } from "react";
import type { Node } from 'react';
import {
    SafeAreaView,
    Text,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    View,
    Image,
    Modal,
    Platform,
    Dimensions,
    Appearance,
    FlatList
} from 'react-native';

import html_script from '../html_script';
import html_script_light from '../html_script_light';
import { CaretLeft, Warning, NavigationArrow, PlusCircle } from 'phosphor-react-native';

import { useIsFocused } from '@react-navigation/native';

import { WebView } from "react-native-webview"
import { useFocusEffect } from '@react-navigation/native';
import MQTT, { IMqttClient } from 'sp-react-native-mqtt';

const isDark = Appearance.getColorScheme() == "dark"



var MQTTClient: IMqttClient

const WorkDetails = ({ navigation, route }) => {
    const { item, koor, photo } = route.params;

    const mapRef = useRef(null);
    const [once, setOnce] = useState(false)
    const [final, setFinal] = useState([])
    const [refresh, setRefresh] = useState(false)

    const [orig_msg, setOrigMsg] = useState("")
    const [_, forceUpdate] = useReducer((x) => x + 1, 0);
    let done = []
    let connected = false

    const renderItem = ({ item, index }) => {
        return (
            <View style={{ marginTop: 15, marginLeft: 30 }}>
                <View style={{ margin: 10.5 }}>
                    <Image style={{ width: 80, height: 160, resizeMode: "contain", borderRadius: 12 }} source={{ uri: `data:image/png;base64,${item.photo}`, cache: "only-if-cached", }} />
                </View>
            </View>
        )
    }
    //   forceUpdate();
    useFocusEffect(
        () => {
            //                setFinal(final)
            mapRef.current.injectJavaScript(`   var marker = L.marker([${item.koorX}, ${item.koorY}],{icon:greenIcon}).addTo(mymap)
            ;    mymap.setView([${item.koorX}, ${item.koorY}], 18) ; true
            `)
            /*MQTT.createClient({
                uri: 'mqtt://192.168.1.64:1883',
                clientId: 'teknofest' + Platform.OS
            }).then(function (client) {
                client.on("message", (msg) => {

                    if (msg.topic == "esp32/responsephotobyid") {
                        setOrigMsg(msg.data)
                        setFinal([])
             
                        msg.data.split("📷").forEach(
                            (elm, ind, arr) => {
                                setFinal(final => [...final, { id: final.length - 1, photo: elm }]);
                                
                            }
                        )
                        setRefresh(true)
                    }
                })
                client.on('connect', function () {
                    client.subscribe("esp32/responsephotobyid", 0);
                    client.publish("esp32/photobyid", item.id.toString(), 0, false);
                });

                client.connect();
            }).catch(function (err) {
                console.log(err);
            });*/
        })
    return (
        <ScrollView style={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", flex: 1 }} fadingEdgeLength={160}>
            <TouchableOpacity style={{ flexDirection: "row", marginLeft: 30, marginTop: 24 }} onPress={() => navigation.goBack()}>
                <CaretLeft color={isDark ? "#fff" : "#000"} style={{ alignSelf: "center" }} size={26} />
                <Text style={{ color: isDark ? "#fff" : "#000", textAlign: "center", alignSelf: "center" }}>Geri</Text>
            </TouchableOpacity>
            <Text style={{ marginLeft: 32, color: isDark ? "#fff" : "#000", marginTop: 15, fontSize: 19 }} adjustsFontSizeToFit>{item.descr}</Text>

            <WebView onLoad={() => {
                mapRef.current.injectJavaScript(`   var marker = L.marker([${item.koorX}, ${item.koorY}],{icon:greenIcon}).addTo(mymap)
                                                    ;    mymap.setView([${item.koorX}, ${item.koorY}], 18) ; true
                    `)
            }} containerStyle={{ borderRadius: 12, minHeight: 250, maxHeight: 250, margin: 32 }} ref={mapRef} source={{ html: isDark ? html_script : html_script_light }} />

            <Text style={{ fontSize: 18, marginLeft: 32, marginRight: 32, color: isDark ? "#fff" : "#000" }}>{item.reason}</Text>
            <View style={{ marginLeft: 32, flexDirection: "row", marginTop: 20 }}>
                <Warning size={36} color={"orange"} style={{ alignSelf: "center" }} />
                <View style={{ marginLeft: 18 }}>
                    <Text style={{ fontSize: 18, color: isDark ? "#fff" : "#000" }}>Durum</Text>
                    <Text style={{ fontSize: 18, color: isDark ? "#a8a8a8" : "#575757" }}>Yol çalışması sürüyor</Text>
                </View>
            </View>

            <View style={{ marginLeft: 32, flexDirection: "row", marginTop: 20 }}>
                <NavigationArrow size={36} color={isDark ? "white" : "black"} style={{ alignSelf: "center" }} />
                <View style={{ marginLeft: 18, flexShrink: 1 }}>
                    <Text style={{ fontSize: 18, color: isDark ? "#fff" : "#000" }}>Konumu</Text>
                    <Text style={{ fontSize: 18, color: isDark ? "#a8a8a8" : "#575757" }}>{item.descr}</Text>
                </View>
            </View>

            <Text style={{ color: isDark ? "#a8a8a8" : "#575757", marginLeft: 30, fontSize: 20, marginTop: 20 }}>{item.hasPhoto ? "FOTOĞRAFLAR" : "Fotoğraf yok"}</Text>
            {
                item.hasPhoto ?
                    <View>
                        <FlatList
                            data={photo}
                            renderItem={renderItem}
                            keyExtractor={item => item["id"]}
                            style={{ flexDirection: "row" }}
                            horizontal
                        />
                        <TouchableOpacity
                            style={{ marginLeft: 30, marginTop: 15, flexDirection: "row", marginBottom: 15 }}
                            onPress={
                                () => {
                                    //console.log(Math.abs(parseFloat(koor.y) - parseFloat(item.koorY)));
                                    
                                    (Math.abs(parseFloat(koor.x) - parseFloat(item.koorX)) < 0.003) && (Math.abs(parseFloat(koor.y) - parseFloat(item.koorY)) < 0.003) ? navigation.navigate("AddPhoto", { id: item.id }) : null
                                }}>
                            <PlusCircle size={32} color={isDark ? "#fff" : "#000"} style={{ alignSelf: "center" }} />
                            <Text style={{ fontWeight: "500", color: isDark ? "#fff" : "#000", alignSelf: "center", marginLeft: 15 }}>{(Math.abs(parseFloat(koor.x) - parseFloat(item.koorX)) < 0.003) && (Math.abs(parseFloat(koor.y) - parseFloat(item.koorY)) < 0.003) ? "Fotoğraf ekle" : "Fotoğraf eklenemez"}</Text>
                        </TouchableOpacity>
                    </View>
                    : <TouchableOpacity style={{ marginLeft: 30, marginTop: 15, flexDirection: "row" }} onPress={
                        () => {
                            console.log(Math.abs(parseFloat(koor.x) - parseFloat(item.koorX)));
                            (Math.abs(parseFloat(koor.x) - parseFloat(item.koorX)) < 0.003) && (Math.abs(parseFloat(koor.y) - parseFloat(item.koorY)) < 0.003) ? navigation.navigate("AddPhoto", { id: item.id }) : null
                        }}>
                        <PlusCircle size={32} color={isDark ? "#fff" : "#000"} style={{ alignSelf: "center" }} />
                        <Text style={{ fontWeight: "500", color: isDark ? "#fff" : "#000", alignSelf: "center", marginLeft: 15 }}>{(Math.abs(parseFloat(koor.x) - parseFloat(item.koorX)) < 0.003) && (Math.abs(parseFloat(koor.y) - parseFloat(item.koorY)) < 0.003) ? "Fotoğraf ekle" : "Fotoğraf eklenemez"}</Text>
                    </TouchableOpacity>
            }
        </ScrollView>
    );
}

export default WorkDetails;