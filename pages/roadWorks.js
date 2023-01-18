import React, { useEffect } from 'react';
import { useState, useRef, useMemo, useCallback } from "react";
import type { Node } from 'react';
import { readFile } from "react-native-fs"
import {
    SafeAreaView,
    Text,
    StatusBar,
    TouchableOpacity,
    View,
    PermissionsAndroid,
    Image,
    RefreshControl,
    Modal,
    Platform,
    FlatList,
    Appearance,
} from 'react-native';

import { WebView } from "react-native-webview"

import LinearGradient from 'react-native-linear-gradient';

import { CaretRight, NavigationArrow, Warning, ArrowLeft } from "phosphor-react-native"
import {getDistance, getPreciseDistance} from 'geolib';


import Geolocation from '@react-native-community/geolocation';
Geolocation.requestAuthorization()

import html_script from '../html_script';
import html_script_light from '../html_script_light';

import BottomSheet, { BottomSheetView, BottomSheetModalProvider } from "@gorhom/bottom-sheet"

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MQTT, { IMqttClient } from 'sp-react-native-mqtt';

const isDark = Appearance.getColorScheme() == "dark"

var MQTTClient: IMqttClient

const RoadPage = ({ navigation, route }) => {

    const mapRef = useRef(null);
    const bottomSheetRef = useRef(null);
    const snapPoints = ['40%', '80%'];
    const [calismalar, setCalismalar] = useState([])
    const [refreshing, setRefreshing] = useState(false);
    const [location, setLocation] = useState([])
    let coords = [];
    useEffect(
        () => {
            Geolocation.getCurrentPosition(
                info=> { 
                    setLocation([info.coords.latitude,info.coords.longitude])
                    coords = [info.coords.latitude, info.coords.longitude]
                }
            )

            MQTT.createClient({
                uri: 'mqtt://192.168.1.64:1883',
                clientId: 'teknofest' + Platform.OS
            }).then((client) => {
                client.on('message', function (msg) {
                    if (msg.topic == "esp32/responsecalismalar" && JSON.parse(msg.data) != []) {
                        setCalismalar([])
                        console.log(msg.data);
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
                                    distance: getPreciseDistance({latitude:coords[0],longitude:coords[1]}, {latitude:JSON.parse(msg.data)["calismalar"][calisma][1], longitude:JSON.parse(msg.data)["calismalar"][calisma][2]}) / 1000
                                }]
                            )
                        }
                    }
                });

                client.on('connect', function () {
                    //console.log('connected');
                    client.subscribe('esp32/coordinates', 0);

                    client.subscribe('esp32/responsecalismalar', 0);
                    client.publish("esp32/calismalar", "GET", 0, true)
                    MQTTClient = client;

                });
                client.connect();
            })
        },
        []
    )


    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const markKoor = () => {
        setCalismalar([])
        MQTTClient.connect()
        MQTTClient.publish("esp32/calismalar", "GET", 0, true)
        setRefreshing(false)
    }

    const renderItem = ({ item, index }) => {
        return (
            <View style={{ flexDirection: "row", flexShrink: 1, marginTop: 15 }}>
                <Warning size={38} color={"orange"} style={{ alignSelf: "center", marginLeft: 30 }} />
                <View style={{ margin: 10.5, flexShrink: 1 }}>
                    <TouchableOpacity onPress={()=>{mapRef.current.injectJavaScript(`mymap.setView([${item.koorX},${item.koorY}],20) ;  L.marker([${item.koorX}, ${item.koorY}],{icon:greenIcon}).addTo(mymap)`)}}>
                        <Text style={{ color: isDark ? "#fff" : "#000", fontWeight: "600" }}>{item.descr?.toString()}</Text>
                        <Text style={{ color: isDark ? "#fff" : "#000", fontWeight: "400" }}>{item.distance} km uzaklıkta</Text>
                    </TouchableOpacity>
                </View>
                <CaretRight size={38} color={isDark ? "#fff" : "#000"} style={{ alignSelf: 'center', justifyContent: "center" }} />
            </View>
        )
    }

    return (
        <GestureHandlerRootView style={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", flex: 1, alignItems: "center", justifyContent: "center" }}>
            <WebView onLoad={() => mapRef.current.injectJavaScript("mymap.setView([38.9637,35.2433],5)")} containerStyle={{ flex: 1, minWidth: "100%", minHeight: 200 }} ref={mapRef} source={{ html: isDark ? html_script : html_script_light }} />
            <BottomSheetModalProvider>
                <BottomSheet
                    ref={bottomSheetRef}
                    snapPoints={snapPoints}
                    backgroundStyle={{ backgroundColor: isDark ? "#1b1b1b" : "#fff" }}
                    handleIndicatorStyle={{ backgroundColor: isDark ? "#262626" : "#d9d9d9", width: 72 }}
                >
                    <View style={{ flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff", alignItems: "center" }}>
                        <FlatList
                            data={calismalar}
                            fadingEdgeLength={60}
                            renderItem={renderItem}
                            keyExtractor={item => item["id"]}
                            refreshControl={<RefreshControl progressBackgroundColor={isDark ? "#1d1d1d" : "#eee"} colors={[isDark ? "#fff" : "#000"]} refreshing={refreshing} onRefresh={markKoor}></RefreshControl>}
                            onRefresh={markKoor}
                            refreshing={refreshing}

                        />
                    </View>
                </BottomSheet>
            </BottomSheetModalProvider>
            <View style={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
                <LinearGradient style={{ flex: 1, height: 150 }} colors={['#000000df', '#00000000']}>
                    <View style={{marginTop:60,marginLeft:32}}>
                        <TouchableOpacity style={{flexDirection:"row"}} onPress={()=>navigation.goBack()}>
                            <ArrowLeft size={32} color={"#fff"} style={{ alignSelf:"center", marginRight:10 }}/>
                            <Text style={{ color: "#fff", fontSize: 36 }}>Yol Çalışmaları</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

        </GestureHandlerRootView>
    );
}

export default RoadPage;