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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { WebView } from "react-native-webview"
const ip = require("../ip").default

import LinearGradient from 'react-native-linear-gradient';

import { CaretRight, NavigationArrow, Warning, ArrowLeft, Calendar, MagnifyingGlass } from "phosphor-react-native"
import { getDistance, getPreciseDistance } from 'geolib';
import DropDownPicker from 'react-native-dropdown-picker';


import Geolocation from '@react-native-community/geolocation';
Geolocation.requestAuthorization()

import html_script from '../html_script';
import html_script_light from '../html_script_light';

import BottomSheet, { BottomSheetView, BottomSheetModalProvider, BottomSheetFlatList } from "@gorhom/bottom-sheet"

import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';

const isDark = Appearance.getColorScheme() == "dark"


import init from "react_native_mqtt"


init({
    size: 10000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24,
    enableCache: false,
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

const RoadPage = ({ navigation, route }) => {

    const mapRef = useRef(null);
    const bottomSheetRef = useRef(null);
    const snapPoints = ['20%', '40%', '80%'];
    const [calismalar, setCalismalar] = useState([])
    const [picker, setPicker] = useState(false)
    const [value, setValue] = useState("a");
    const [searchValue, setSearchValue] = useState("")
    const [items, setItems] = useState(
        [
            { label: "Bugün", value: "t" },
            { label: "Bu ay", value: "m" },
            { label: "Bu yıl", value: "y" },
            { label: "Tümü", value: "a" }
        ]
    )
    const [once, setOnce] = useState(false)
    const [refreshing, setRefreshing] = useState(false);
    const [fullCalismalar, setFullCalismalar] = useState([])
    const [tinyFont, setTinyFont] = useState(false);
    const [arrowVisible, setArrowVisible] = useState(false);
    const [sheetIndex, setSheetIndex] = useState(1);
    const [location, setLocation] = useState([])
    let coords = [];


    const isSameDay = (firstTimeStamp, secondTimeStamp) => {
        return (new Date(firstTimeStamp).getDate() === (new Date(secondTimeStamp).getDate()) && new Date(firstTimeStamp).getMonth() == new Date(secondTimeStamp).getMonth())
    }

    useEffect(
        () => {
            Geolocation.getCurrentPosition(
                info => {
                    setLocation([info.coords.latitude, info.coords.longitude])
                    coords = [info.coords.latitude, info.coords.longitude]
                }
            )
        },
        []
    )
    
    const onMessageArrived = (msg) => {
        if (msg.topic == "esp32/responsecalismalar" && JSON.parse(msg.payloadString) != [] && once == false) {
            setOnce(true)
            setCalismalar([])
            console.log(msg.payloadString);
            for (let calisma in JSON.parse(msg.payloadString)["calismalar"]) {
                
                console.log("coords",location);
                mapRef.current.injectJavaScript(`L.marker([${JSON.parse(msg.payloadString)["calismalar"][calisma][1]}, ${JSON.parse(msg.payloadString)["calismalar"][calisma][2]}],{icon:greenIcon}).addTo(mymap);`);
                setCalismalar(
                    calismalar => [...calismalar,
                    {
                        id: JSON.parse(msg.payloadString)["calismalar"][calisma][0],
                        koorX: JSON.parse(msg.payloadString)["calismalar"][calisma][1],
                        koorY: JSON.parse(msg.payloadString)["calismalar"][calisma][2],
                        reason: JSON.parse(msg.payloadString)["calismalar"][calisma][3],
                        descr: JSON.parse(msg.payloadString)["calismalar"][calisma][4],
                        timestamp: JSON.parse(msg.payloadString)["calismalar"][calisma][5],
                        ended: JSON.parse(msg.payloadString)["calismalar"][calisma][6],
                        hasPhoto: JSON.parse(msg.payloadString)["calismalar"][calisma][7],
                        distance: getPreciseDistance({ latitude: location[0], longitude: location[1] }, { latitude: JSON.parse(msg.payloadString)["calismalar"][calisma][1], longitude: JSON.parse(msg.payloadString)["calismalar"][calisma][2] }) / 1000
                    }]
                )
                setFullCalismalar(
                    fullCalismalar => [...fullCalismalar,
                    {
                        id: JSON.parse(msg.payloadString)["calismalar"][calisma][0],
                        koorX: JSON.parse(msg.payloadString)["calismalar"][calisma][1],
                        koorY: JSON.parse(msg.payloadString)["calismalar"][calisma][2],
                        reason: JSON.parse(msg.payloadString)["calismalar"][calisma][3],
                        descr: JSON.parse(msg.payloadString)["calismalar"][calisma][4],
                        timestamp: JSON.parse(msg.payloadString)["calismalar"][calisma][5],
                        ended: JSON.parse(msg.payloadString)["calismalar"][calisma][6],
                        hasPhoto: JSON.parse(msg.payloadString)["calismalar"][calisma][7],
                        distance: getPreciseDistance({ latitude: location[0], longitude: location[1] }, { latitude: JSON.parse(msg.payloadString)["calismalar"][calisma][1], longitude: JSON.parse(msg.payloadString)["calismalar"][calisma][2] }) / 1000
                    }]
                )
                console.log(calismalar);
            }
        }
    }
    client.onMessageArrived = onMessageArrived

    useFocusEffect(useCallback(() => {
           
        client.send("esp32/calismalar", "GET", 0, false)

        
    }, []))


    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const markKoor = () => {
        setCalismalar([])
        setOnce(false)
        client.send("esp32/calismalar", "GET", 0, false)
        setRefreshing(false)
    }

    const renderItem = ({ item, index }) => {
        if (item.ended != 1) {
            return (
                <View style={{ flexDirection: "row", flexShrink: 1, marginTop: 15 }}>
                    <Warning size={38} color={"orange"} style={{ alignSelf: "center", marginLeft: 30 }} />
                    <View style={{ margin: 10.5, flexShrink: 1 }}>
                        <TouchableOpacity onPress={() => {
                            setSheetIndex(1)
                            mapRef.current.injectJavaScript(`
                        mymap.setView([${item.koorX},${item.koorY}],20) ;  
                        L.marker([${item.koorX}, ${item.koorY}],{icon:greenIcon}).addTo(mymap);
                        var latlng = L.latLng(${item.koorX},${item.koorY});
                        var popup = L.popup()
                        .setLatLng(latlng)
                        .setContent('<p style="color:${isDark ? "#d9d9d9" : "#000000"}">${item.descr} konumunda yol çalışması</p>Neden: ${item.reason}</p>')
                        .openOn(mymap);
                        `)
                        }}>
                            <Text style={{ color: isDark ? "#fff" : "#000000", fontWeight: "600" }}>{item.descr?.toString()}</Text>
                            <Text style={{ color: isDark ? "#fff" : "#000000", fontWeight: "400" }}>{item.distance} km uzaklıkta</Text>
                        </TouchableOpacity>
                    </View>
                    <CaretRight size={38} color={isDark ? "#fff" : "#000000"} style={{ alignSelf: 'center', justifyContent: "center" }} />
                </View>
            )
        }
    }

    return (
        <GestureHandlerRootView  style={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", flex: 1, alignItems: "center", top:0, justifyContent: "center" }}>
            <StatusBar />
            <WebView onMessage={(m) => console.log(m.nativeEvent.data)} onLoad={() => mapRef.current.injectJavaScript("mymap.setView([38.9637,35.2433],5)")} containerStyle={{ flex: 1, minWidth: "100%", minHeight: 200, top:0 }} ref={mapRef} source={{ html: isDark ? html_script : html_script_light }} />
            <BottomSheetModalProvider>
                <BottomSheet

                    index={sheetIndex}
                    onChange={
                        (ind) => {
                            setSheetIndex(ind)
                            if (ind == 2) {
                                console.log("büyük");
                                setArrowVisible(true)
                                setTinyFont(false)
                            } else {
                                setArrowVisible(false)
                                setTinyFont(true)
                            }
                        }
                    }
                    ref={bottomSheetRef}
                    snapPoints={snapPoints}
                    backgroundStyle={{ backgroundColor: isDark ? "#1b1b1b" : "#fff" }}
                    handleIndicatorStyle={{ backgroundColor: isDark ? "#262626" : "#d9d9d9", width: 72, height:6 }}
                >
                    <View style={{ alignItems: "center", flexDirection: "row", flexShrink: 1, zIndex:10000,elevation:10000 }}>
                        <Calendar size={24} color={isDark ? "#fff" : "#000000"} style={{ marginLeft: 30, alignSelf: "center", marginTop: 12 }} />
                        <DropDownPicker
                            theme='DARK'
                            style={{ zIndex: 999, elevation:999, marginTop: 15, width: 100, backgroundColor: isDark ? "#1b1b1b" : "#fff", borderWidth: 0 }}
                            containerStyle={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", borderWidth: 0, left:0, zIndex: 2 }}
                            badgeStyle={{ borderWidth: 0 }}
                            textStyle={{ color: isDark ? "#fff" : "#000000", }}
                            labelStyle={{ color: isDark ? "#fff" : "#000000" }}
                            showArrowIcon={true}
                            placeholder={value}
                            open={picker}
                            onChangeValue={
                                (val) => {

                                    if (val == "t") {
                                        setCalismalar(fullCalismalar.filter(item => isSameDay(parseFloat(item.timestamp), Date.now())));
                                    }
                                    else if (val == "a") {
                                        setCalismalar(fullCalismalar)
                                    }

                                    else if (val == "y") {
                                        setCalismalar(fullCalismalar.filter(
                                            item => new Date(parseFloat(item.timestamp)).getFullYear() == new Date(Date.now()).getFullYear()
                                        )
                                        )
                                    }
                                    else if (val == "m") {
                                        setCalismalar(fullCalismalar.filter(
                                            item => new Date(parseFloat(item.timestamp)).getMonth() == new Date(Date.now()).getMonth()
                                        )
                                        )
                                    }
                                }
                            }

                            tickIconStyle={{ color: "#ff0000" }}
                            showBadgeDot={false}
                            listParentContainerStyle={{ borderWidth: 0, backgroundColor:isDark?"#1b1b1b":"#fff"}}
                            listChildContainerStyle={{ borderWidth: 0, backgroundColor:isDark?"#1b1b1b":"#fff"}}
                            itemSeparator
                            itemSeparatorStyle={{ backgroundColor: "#1d1d1d", height: 1 }}
                            dropDownContainerStyle={{ borderWidth: 0, zIndex:10000, borderRadius: 6, shadowOpacity: 1, shadowColor: "#000000", shadowRadius: 16, elevation: 10000, width: "90%", alignSelf: "center" }}
                            
                            setOpen={setPicker}
                            listItemContainerStyle={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", borderWidth: 0, }}
                            listItemLabelStyle={{ color: isDark ? "#fff" : "#000000" }}
                            value={value}
                            setValue={setValue}
                            items={items}
                            setItems={setItems}
                        />
                    </View>

                    <View style={{borderRadius:25, borderWidth:2, borderColor:isDark?"#262626":"#d9d9d9", width:"90%", alignSelf:"center", flexDirection:"row"}}>
                        <MagnifyingGlass size={26} style={{alignSelf:"center", marginLeft:13}} color={isDark?"#fff":"#000000"} />
                        <TextInput value={searchValue} onChangeText={
                            (text)=>{
                                setSearchValue(text)
                                setCalismalar(fullCalismalar.filter(item=>item.descr.toLocaleLowerCase()?.includes(text.toLocaleLowerCase())))
                            }
                        } placeholder='Yol veya bölge adı aratın...' placeholderTextColor={isDark?"#fff":"#000000"} style={{paddingLeft:13, zIndex:-1}}/>
                    </View>
                    
                    <View style={{ flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff", alignItems: "center" }}>
                        <BottomSheetFlatList
                            data={calismalar}
                            style={{ zIndex: 0 }}
                            fadingEdgeLength={60}
                            renderItem={renderItem}
                            keyExtractor={item => item["id"]}
                            refreshControl={<RefreshControl progressBackgroundColor={isDark ? "#1d1d1d" : "#eee"} colors={[isDark ? "#fff" : "#000000"]} refreshing={refreshing} onRefresh={markKoor}></RefreshControl>}
                            onRefresh={markKoor}
                            refreshing={refreshing}
                        />


                    </View>

                </BottomSheet>
            </BottomSheetModalProvider>
            <View style={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
                <LinearGradient style={{ flex: 1, height: 150 }} colors={['#000000df', '#00000000']}>
                    <View style={{ marginTop: 60, marginLeft: 32 }}>
                        <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => navigation.goBack()}>
                            <ArrowLeft size={32} color={"#fff"} style={{ alignSelf: "center", marginRight: 10, display: arrowVisible ? "flex" : "none" }} />
                            <Text style={{ color: "#fff", fontSize: tinyFont ? 36 : 28 }}>Yol Çalışmaları</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

        </GestureHandlerRootView>
    );
}

export default RoadPage;