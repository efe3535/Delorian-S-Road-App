import React, { useCallback, useEffect } from 'react';
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
    ActivityIndicator,
    TextInput,
    ScrollView,
    Dimensions
} from 'react-native';

const isDark = Appearance.getColorScheme() == "dark"


import Geolocation from '@react-native-community/geolocation';
Geolocation.requestAuthorization()

import MQTT, { IMqttClient } from "sp-react-native-mqtt"

const ip = require("../ip").default

import { Calendar, CaretLeft, DotsThreeVertical, NavigationArrow, Repeat, Check, PencilSimple } from 'phosphor-react-native';

import CalendarPicker from 'react-native-calendar-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { WebView } from "react-native-webview"

import ContextMenu from "react-native-context-menu-view";
import { useFocusEffect } from '@react-navigation/native';

import init from "react_native_mqtt"

let STORAGE_KEY = '@routes-item';

import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';




const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];
const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"]


init({
    size: 10000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24,
    enableCache: true,
    reconnect: true,
    sync: {
    }
});


const client = new Paho.MQTT.Client(ip, 1923, 'uname_route' + (Math.random() * 10000).toString());


function onConnect() {
    console.log("onConnect - routeDetails");
    client.subscribe('esp32/responsecalismalar');
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

const between = (min, x, max) => {
    return min < x && max > x;
}

let found

const RouteDetails = ({ navigation, route }) => {

    const firstDescr = route.params.firstDescr
    const secDescr = route.params.secDescr

    const mapRef2 = useRef(null)
    //const [firstDescr, setFirstDescr] = useState(route.params.firstDescr)
    const [calismalar, setCalismalar] = useState([])
    const [match, setMatch] = useState(false)
    const [expecting, setExpecting] = useState(false)
    const [editVisible, setEditVisible] = useState(false)
    //const [secDescr, setSecDescr] = useState(route.params.secDescr)
    let item = route.params.item
    const [id, setId] = useState(null)
    const [displayRoutes, setDisplayRoutes] = useState([])

    const [items, setItems] = useState([

        { label: "Her ay", value: "em" },

        { label: "Her hafta", value: "ew" },

        { label: "Her gün", value: "ed" },

    ])

    let chose = false

    const valDict = {
        "em": "Her ay",
        "ew": "Her hafta",
        "ed": "Her gün"
    }


    const currentDate = new Date()


    let dateLet;
    let repeatLet = repeatText;
    let dateNav = dateStr;
    //const [item,setItem] = useState(item)
    console.log("rotues:",route.params.routes);
    const textRef = useRef(null)
    const text2Ref = useRef(null)
    const [routeName, setRouteName] = useState("")
    const [routeDescr, setRouteDescr] = useState(item.descr)
    
    const [date, setDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [dateStr, setDateStr] = useState(null)
    const [value, setValue] = useState(null);
    const [open, setOpen] = useState(false)
    const [repeat, setRepeat] = useState(false)
    const [x2,setx2] = useState(item.x2)
    const [y2,sety2] = useState(item.y2)
    const [picker, setPicker] = useState(false)
    const [map, setMap] = useState(false)
    const [repeatText, setRepeatText] = useState("")
    const [first,setFirst] = useState(null)
    const [second,setSecond] = useState(false)
    const [chosen, setChosen] = useState(false)
    const routes = route.params.routes
    console.log(routes);
    const [listRoute, setListRoute] = useState(routes)
    const [koor, setKoor] = useState([])

    const mapRef = useRef(null)
    const mapRef3 = useRef(null)


    const deleteItem = async (id) => {
        let items = await AsyncStorage.getItem(STORAGE_KEY)
        items = JSON.parse(items)
        for (let key in items.routes) {
            if (items.routes[key].id == id) {
                items.routes.splice(items.routes.indexOf(items.routes[key]), 1)
            }
        }
        console.log(items);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }

    const getItems = async () => {

        let items = await AsyncStorage.getItem(STORAGE_KEY)
        if (items) {
            //console.log("VALUES", JSON.parse(val).routes);
            rotalar = JSON.parse(items).routes
            setDisplayRoutes(rotalar)
            items = JSON.parse(items)
            setRepeatText(items.routes.find(a=>a.id==item.id).repeat)
            setDateStr(items.routes.find(a=>a.id==item.id).date);
            setRouteDescr(items.routes.find(a=>a.id==item.id).descr)
            setRouteName(items.routes.find(a=>a.id==item.id).name)
            setFirst([items.routes.find(a=>a.id==item.id).x,items.routes.find(a=>a.id==item.id).y])
            item = items.routes.find(a=>a.id==item.id)
    
        } else {
            return undefined
        }
    }

    console.log("ITEM->", item);
    const onMessageArrived = (msg) => {
        console.log("topic", msg.topic);
        if (msg.topic == "esp32/responsecalismalar" && JSON.parse(msg.payloadString) != []) {
            for (let calismakoor in JSON.parse(msg.payloadString)["calismalar"]) {
                console.log("calismakoor", calismakoor);
                /*if (JSON.parse(msg.payloadString)["calismalar"][calismakoor][6] == 0) {
                    console.log(item.x, item.y, item.x2, item.y2);
                    if (between(item.x <= item.x2 ? item.x : item.x2, parseFloat(JSON.parse(msg.payloadString)["calismalar"][calismakoor][1]), item.x2 >= item.x ? item.x2 : item.x) && between(item.y <= item.y2 ? item.y : item.y2, parseFloat(JSON.parse(msg.payloadString)["calismalar"][calismakoor][2]), item.y2 >= item.y ? item.y2 : item.y)) {
                        found = true
                        console.log("calisma var");
                        setMatch(true)
                        break
                    } else {
                        found = false
                       // setMatch(false)
                    }
                }*/
                if (between(item.x <= item.x2 ? item.x : item.x2, parseFloat(JSON.parse(msg.payloadString)["calismalar"][calismakoor][1]), item.x2 >= item.x ? item.x2 : item.x) && between(item.y <= item.y2 ? item.y : item.y2, parseFloat(JSON.parse(msg.payloadString)["calismalar"][calismakoor][2]), item.y2 >= item.y ? item.y2 : item.y && JSON.parse(msg.payloadString)["calismalar"][calismakoor][6] == 0)) {
                    //setMatch(between(item.x <= item.x2 ? item.x : item.x2, parseFloat(JSON.parse(msg.payloadString)["calismalar"][calismakoor][1]), item.x2 >= item.x ? item.x2 : item.x) && between(item.y <= item.y2 ? item.y : item.y2, parseFloat(JSON.parse(msg.payloadString)["calismalar"][calismakoor][2]), item.y2 >= item.y ? item.y2 : item.y && JSON.parse(msg.payloadString)["calismalar"][calismakoor][6] == 0))
                    setMatch(true)
                    console.log("MATCHING->", item.x, item.y, parseFloat(JSON.parse(msg.payloadString)["calismalar"][calismakoor][1]), parseFloat(JSON.parse(msg.payloadString)["calismalar"][calismakoor][2]), item.x2, item.y2);
                    break
                }
            }
        }
    }

    client.onMessageArrived = onMessageArrived
    useEffect(() => {
        setId(item.id)
        console.log("itemid", item.id);
        setMatch(false)
        getItems()
        console.log("useFocusEffect");
        mapRef2.current.reload()
        client.send("esp32/calismalar", "GET", 0, false)
        console.log(item.x, item.y, item.x2, item.y2);

        mapRef2.current.injectJavaScript(
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
            true
            `
        )
        /*fetch(`https://nominatim.openstreetmap.org/search.php?q=${item.x},${item.y}&polygon_geojson=1&format=json`, { headers: { "Accept-Language": "tr" } })
        .then(response => response.json())
        .then(json => {
            setFirstDescr(json[0]["display_name"])
            console.log(json);
        })
       
        fetch(`https://nominatim.openstreetmap.org/search.php?q=${item.x2},${item.y2}&polygon_geojson=1&format=json`, { headers: { "Accept-Language": "tr" } }).then(response => response.json())
        .then(json => {
            setSecDescr(json[0]["display_name"])
            console.log(json);
        })*/
    }, [])

    useFocusEffect(useCallback(() => {
        getItems()
        setId(item.id)
        console.log("itemid", item.id);
        setMatch(false)
        console.log("useFocusEffect");
        mapRef2.current.reload()
        client.send("esp32/calismalar", "GET", 0, false)
        console.log(item.x, item.y, item.x2, item.y2);

        mapRef2.current.injectJavaScript(
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
            true
            `
        )
        /*fetch(`https://nominatim.openstreetmap.org/search.php?q=${item.x},${item.y}&polygon_geojson=1&format=json`, { headers: { "Accept-Language": "tr" } })
        .then(response => response.json())
        .then(json => {
            setFirstDescr(json[0]["display_name"])
            console.log(json);
        })
       
        fetch(`https://nominatim.openstreetmap.org/search.php?q=${item.x2},${item.y2}&polygon_geojson=1&format=json`, { headers: { "Accept-Language": "tr" } }).then(response => response.json())
        .then(json => {
            setSecDescr(json[0]["display_name"])
            console.log(json);
        })*/
    }, []))

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff" }}>
            <Modal visible={editVisible}>
                <ScrollView style={{ flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff" }} fadingEdgeLength={120}>
                    <Modal transparent animationType={'slide'} visible={open} style={{ backgroundColor: "#1b1b1b", }}>
                        <View style={{ backgroundColor: "#000000cc", alignItems: "center", flex: 1, justifyContent: "center", alignSelf: "center", }}>
                            <View style={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", borderRadius: 16, }}>
                                <View style={{ width: "60%", height: "60%" }}>
                                    <CalendarPicker
                                        allowRangeSelection
                                        textStyle={{ color: isDark ? "#d9d9d9" : "#262626" }}
                                        todayTextStyle={{ backgroundColor: isDark ? "#262626" : "#d9d9d9" }}
                                        selectedDayColor={isDark ? "#262626" : "#d9d9d9"}
                                        selectedDayTextColor={isDark ? "#fff" : "#000000"}
                                        onDateChange={(date, type) => {
                                            if (type == "END_DATE") {
                                                //setDateStr((date.get().getDate() + " " + (monthNames[date.get().getMonth()]) + " " + days[date.get().getDay()]))
                                                if (date != null) {
                                                    if (dateLet.date() != date.date()) {
                                                        setDateStr(dateLet.date().toString() + " " + monthNames[dateLet.month()] + " - " + date.date().toString() + " " + monthNames[date.month()])
                                                        dateNav = dateLet.date().toString() + " " + monthNames[dateLet.month()] + " - " + date.date().toString() + " " + monthNames[date.month()]
                                                    } else {
                                                        setDateStr(date.date().toString() + " " + monthNames[date.month()])
                                                        dateNav = date.date().toString() + " " + monthNames[date.month()]
                                                    }
                                                } else {
                                                    setDateStr(dateLet.date().toString() + " " + monthNames[dateLet.month()])
                                                    dateNav = dateLet.date().toString() + " " + monthNames[dateLet.month()]
                                                }

                                                setTimeout(() => setOpen(false), 500)

                                            } else if (type = "START_DATE") {
                                                dateLet = date
                                            }
                                        }}
                                        todayBackgroundColor='#1b1b1b'
                                        nextTitle='Sonraki ay'
                                        previousTitle='Önceki ay'
                                        startFromMonday
                                        selectedDayTextStyle={{ fontSize: 24, color: "#fff", fontWeight: "700", fontStyle: "italic" }}
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal transparent animationType='fade' visible={repeat}>
                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000000cc" }}>
                            <View style={{ width: "80%", borderRadius: 16, height: "60%", alignSelf: "center", position: "absolute", alignContent: "center", backgroundColor: isDark ? "#1b1b1b" : "#fff" }}>

                                <TouchableOpacity style={{ marginLeft: 20, marginTop: 20, flexDirection: "row" }} onPress={() => setRepeat(false)}>
                                    <CaretLeft size={32} color={isDark ? "#fff" : "#000000"} />
                                    <Text style={{ color: isDark ? "#fff" : "#000000", fontSize: 18, alignSelf: "center", marginLeft: 10, fontWeight: "600" }}>Geri</Text>
                                </TouchableOpacity>

                                <Text style={{ fontSize: 24, marginLeft: 20, marginTop: 15, color: isDark ? "#fff" : "#000000", fontWeight: "700" }}>Tekrarlama sıklığı</Text>
                                <DropDownPicker
                                    theme='DARK'
                                    style={{ marginTop: 15, width: "90%", alignSelf: "center", backgroundColor: isDark ? "#262626" : "#d9d9d9", borderWidth: 0 }}
                                    containerStyle={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", borderWidth: 0 }}
                                    badgeStyle={{ borderWidth: 0 }}
                                    textStyle={{ color: isDark ? "#fff" : "#000000", }}
                                    labelStyle={{ color: isDark ? "#fff" : "#000000" }}
                                    showArrowIcon={true}
                                    placeholder={"Tekrarlama sıklığı seçiniz..."}
                                    open={picker}
                                    onChangeValue={(val) => { setRepeatText(valDict[val]); repeatLet = valDict[val]; setTimeout(() => setRepeat(false), 200) }}
                                    tickIconStyle={{ color: "#ff0000" }}
                                    showBadgeDot={false}
                                    listParentContainerStyle={{ borderWidth: 0, }}
                                    listChildContainerStyle={{ borderWidth: 0, }}
                                    itemSeparator
                                    itemSeparatorStyle={{ backgroundColor: "#1d1d1d", height: 1 }}
                                    dropDownContainerStyle={{ borderWidth: 0, borderRadius: 6, shadowOpacity: 1, shadowColor: "#000000", shadowRadius: 16, elevation: 5, width: "90%", alignSelf: "center" }}
                                    setOpen={setPicker}
                                    listItemContainerStyle={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", borderWidth: 0, }}
                                    listItemLabelStyle={{ color: isDark ? "#fff" : "#000000" }}
                                    value={value}
                                    setValue={setValue}
                                    items={items}
                                    setItems={setItems}
                                />

                            </View>
                        </View>

                    </Modal>

                    <Modal animationType='fade' visible={map}>
                        <View style={{ flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff" }}>
                            <TouchableOpacity style={{ marginLeft: 20, marginTop: 20, flexDirection: "row" }} onPress={() => {
                                setMap(false)
                            }}>
                                <CaretLeft size={32} color={isDark ? "#fff" : "#000000"} />
                                <Text style={{ color: isDark ? "#fff" : "#000000", fontSize: 18, alignSelf: "center", marginLeft: 10, fontWeight: "600" }}>Geri</Text>
                            </TouchableOpacity>
                            <WebView 
                             renderLoading={()=>(<View style={{flex:1, width:"100%", height:"100%", position:"absolute", alignItems:"center", justifyContent:"center", backgroundColor:isDark?"#1b1b1b":"#fff"}}>
                             <ActivityIndicator color={"#e05003"}/>
                         </View>)}
                            ref={mapRef} onMessage={
                                (msg) => {
                                    console.log(msg.nativeEvent.data);
                                    setSecond(false)
                                    if (second == true) {
                                        console.log(repeatText);
                                        setx2(parseFloat(msg.nativeEvent.data.split(",")[0]))
                                        sety2(parseFloat(msg.nativeEvent.data.split(",")[1]))
                                        console.log(first[0], first[1], parseFloat(msg.nativeEvent.data.split(",")[0]), parseFloat(msg.nativeEvent.data.split(",")[1]));

                                      //  mapRef.current.reload()
                                        mapRef.current.injectJavaScript(`
                                var route = L.Routing.control({
                                    waypoints: [
                                    L.latLng(${first[0]}, ${first[1]}),
                                    L.latLng(${parseFloat(msg.nativeEvent.data.split(",")[0])}, ${parseFloat(msg.nativeEvent.data.split(",")[1])})
                                    ],
                                    show:false,
                                    draggableWaypoints:false,
                                    lineOptions : {
                                        addWaypoints: false
                                    },
                                    routeWhileDragging: false,
                                    createMarker:()=>{return null},
                                }).addTo(mymap);
                                route.setWaypoints([ L.latLng(${first[0]}, ${first[1]}),
                                L.latLng(${parseFloat(msg.nativeEvent.data.split(",")[0])}, ${parseFloat(msg.nativeEvent.data.split(",")[1])})
                               ])
                                `)
                                        mapRef3.current.reload()
                                        mapRef3.current.injectJavaScript(`
                                var routing = L.Routing.control({
                                    waypoints: [
                                  
                                    ],
                                    show:false,
                                    draggableWaypoints:false,
                                    lineOptions : {
                                        addWaypoints: false
                                    },
                                    routeWhileDragging: false,
                                    createMarker:()=>{return null},
                                }).addTo(mymap);
                                routing.setWaypoints([  L.latLng(${first[0]}, ${first[1]}),
                                L.latLng(${parseFloat(msg.nativeEvent.data.split(",")[0])}, ${parseFloat(msg.nativeEvent.data.split(",")[1])})])
                                `)
                                        setChosen(true)
                                        chose = true
                                        setTimeout(() => setMap(false), 500)
                                        /*setRouteDescr("")
                                        setRouteName("")
                                        setRepeat(null)
                                        setRepeatText("")
                                        setDate("")*/
                                    } else {
                                        setFirst([parseFloat(msg.nativeEvent.data.split(",")[0]), parseFloat(msg.nativeEvent.data.split(",")[1])])
                                        setSecond(true)

                                    }
                                }
                            } onLoad={() => mapRef.current.injectJavaScript(`mymap.setView([${koor[0]},${koor[1]}],18)`)} androidHardwareAccelerationDisabled androidLayerType='software' renderToHardwareTextureAndroid={true} containerStyle={{ flex: 1, borderRadius: 16, minWidth: 200, minHeight: 200, margin: 30, }} source={{ html: isDark ? html_script : html_script_light }} />

                        </View>
                    </Modal>


                    <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity style={{ flexDirection: "row", marginLeft: 20, marginTop: 60 }} onPress={() => {
                            setChosen(false)
                            setEditVisible(false)
                            setRouteDescr("")
                            setDateStr("")
                            setRouteName("")
                            setRepeatText("")
                            navigation.navigate("Routes", { extraRoutes: listRoute })
                        }}>
                            <CaretLeft color={isDark ? "#fff" : "#000000"} style={{ alignSelf: "center" }} size={26} />
                            <Text style={{ color: isDark ? "#fff" : "#000000", textAlign: "center", alignSelf: "center" }}>Geri</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flexDirection: "row", marginLeft: 20, marginTop: 60, position: 'absolute', right: 30 }}
                            onPress={
                                async () => {
                                    setEditVisible(false)
                                    let storage = await AsyncStorage.getItem(STORAGE_KEY)
                                    storage = JSON.parse(storage)

                                    storage.routes[storage.routes.indexOf(storage.routes.find(rt => rt.id == item.id))] = {
                                        id: item.id,
                                        x: first[0],
                                        y: first[1],
                                        x2: x2,
                                        y2: y2,
                                        descr: routeDescr,
                                        name: routeName,
                                        repeat: repeatText,
                                        date: dateStr
                                    }
                                    // console.log(dateStr);
                                    // console.log(storage);
                                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
                                    navigation.navigate("Routes", { extraRoutes: [] })
                                }
                            }>
                            <Check color={isDark ? "#fff" : "#000000"} style={{ alignSelf: "center" }} size={26} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row", flexShrink: 1, marginLeft: 20, borderWidth: 2, marginRight: 30, marginTop: 32, borderRadius: 5, borderColor: isDark ? "#262626" : "d9d9d9" }}>
                        <TextInput ref={textRef} onChangeText={text => { setRouteName(text); }} value={routeName} caretHidden placeholder={'Bir rota adı\nseçin...'} placeholderTextColor={isDark ? "#fff" : "#000000"} style={{ fontSize: 36, fontWeight: "700" }} />
                        <TouchableOpacity onPress={() => textRef.current.focus()} style={{ alignSelf: "center", position: "absolute", right: 10 }}>
                            <PencilSimple size={32} color={isDark ? "#fff" : "#000000"} style={{}} />
                        </TouchableOpacity>
                    </View>
                    <WebView ref={mapRef3} onLoad={() => mapRef3.current.injectJavaScript(
                        `mymap.setView([${first[0]},${first[1]}],18);
            L.Routing.control({
                waypoints: [
                L.latLng(${first[0]}, ${first[1]}),
                L.latLng(${x2}, ${y2})
                ],
                show:false,
                draggableWaypoints:false,
                lineOptions : {
                    addWaypoints: false
                },
                routeWhileDragging: false,
                createMarker:()=>{return null},
            }).addTo(mymap);
            `)} androidHardwareAccelerationDisabled androidLayerType='software' renderToHardwareTextureAndroid={true} containerStyle={{ flex: 1, borderRadius: 16, minWidth: 350, minHeight: 250, marginTop: 15, alignSelf: "center", }} source={{ html: isDark ? html_script : html_script_light }} />

                    <View style={{ flexDirection: "row", flexShrink: 1, marginLeft: 20, marginTop: 20 }}>
                        <TextInput ref={text2Ref} onChangeText={(text) => setRouteDescr(text)} value={routeDescr} caretHidden placeholder={'Bir açıklama yazın...'} placeholderTextColor={isDark ? "#fff" : "#000000"} style={{ fontSize: 18, fontWeight: "400" }} />
                        <TouchableOpacity onPress={() => text2Ref.current.focus()} style={{ alignSelf: "center", position: "absolute", right: 25 }}>
                            <PencilSimple size={32} color={isDark ? "#fff" : "#000000"} style={{}} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: "row", flexShrink: 1, marginLeft: 20, borderWidth: 2, marginRight: 30, marginTop: 20, borderRadius: 5, borderColor: isDark ? "#262626" : "d9d9d9", padding: 10 }}>
                        <NavigationArrow size={32} color={isDark ? "#fff" : "#000000"} style={{ alignSelf: "center" }} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: "700", color: isDark ? "#fff" : "#000000" }}>Konumu</Text>
                            <Text style={{ color: isDark ? "#a8a8a8" : "#575757", fontSize: 18 }}>Bir konum girin...</Text>
                        </View>
                        <TouchableOpacity onPress={() => {
                            Geolocation.getCurrentPosition((pos) => setKoor([pos.coords.latitude, pos.coords.longitude]));
                            setMap(true)
                        }
                        } style={{ alignSelf: "center", position: "absolute", right: 10 }}>
                            <PencilSimple size={32} color={isDark ? "#fff" : "#000000"} style={{}} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: "row", flexShrink: 1, marginLeft: 20, borderWidth: 2, marginRight: 30, marginTop: 20, borderRadius: 5, borderColor: isDark ? "#262626" : "d9d9d9", padding: 10 }}>
                        <Calendar size={32} color={isDark ? "#fff" : "#000000"} style={{ alignSelf: "center" }} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: "700", color: isDark ? "#fff" : "#000000" }}>Günler</Text>
                            <Text style={{ color: isDark ? "#a8a8a8" : "#575757", fontSize: 18 }}>{dateStr != "" ? dateStr : "Bir gün veya gün aralığı seçin..."}</Text>
                        </View>
                        <TouchableOpacity onPress={() => { setOpen(true) }} style={{ alignSelf: "center", position: "absolute", right: 10 }}>
                            <PencilSimple size={32} color={isDark ? "#fff" : "#000000"} style={{}} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: "row", flexShrink: 1, marginLeft: 20, borderWidth: 2, marginRight: 30, marginTop: 20, marginBottom: 32, borderRadius: 5, borderColor: isDark ? "#262626" : "d9d9d9", padding: 10 }}>
                        <Repeat size={32} color={isDark ? "#fff" : "#000000"} style={{ alignSelf: "center" }} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: "700", color: isDark ? "#fff" : "#000000" }}>Tekrarlama sıklığı</Text>
                            <Text style={{ color: isDark ? "#a8a8a8" : "#575757", fontSize: 18 }}>{repeatText != "" ? repeatText : "Bir tekrarlama sıklığı seçin..."}</Text>
                        </View>
                        <TouchableOpacity onPress={() => { setRepeat(true) }} style={{ alignSelf: "center", position: "absolute", right: 10 }}>
                            <PencilSimple size={32} color={isDark ? "#fff" : "#000000"} style={{}} />
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </Modal>
            <TouchableOpacity style={{ flexDirection: "row", marginLeft: 30, marginTop: 24 }} onPress={() => navigation.goBack()}>
                <CaretLeft color={isDark ? "#fff" : "#000000"} style={{ alignSelf: "center" }} size={26} />
                <Text style={{ color: isDark ? "#fff" : "#000000", textAlign: "center", alignSelf: "center" }}>Geri</Text>
            </TouchableOpacity>

            <View style={{ width: "100%", flexDirection: "row" }}>
                <Text style={{ fontSize: 36, fontWeight: "700", marginLeft: 30, color: isDark ? "#fff" : "#000000" }}>{item.name}</Text>
                <ContextMenu onPress={(e) => {
                    if (e.nativeEvent.index == 1) {
                        deleteItem(item.id)
                        navigation.navigate("Routes", { extraRoutes: route.params.allRoutes.filter(arr => arr.id != item.id) })
                    } else if (e.nativeEvent.index == 0) {
                        console.log("displayRoutes:", item.id);
                        getItems()
                        setEditVisible(true)
                        //navigation.navigate("EditRoutes", {routes:displayRoutes, id:id, item, rt:displayRoutes.find(a=>a.id==item.id)})
                    }
                }} style={{ alignSelf: "center", top: 12, right: 30, position: "absolute" }} actions={[{ title: "Düzenle" }, { title: "Sil" }]}>
                    <DotsThreeVertical size={32} color={isDark ? "#fff" : "#000000"} />
                </ContextMenu>
            </View>

            <WebView
             renderLoading={()=>(<View style={{flex:1, width:"100%", height:"100%", position:"absolute", alignItems:"center", justifyContent:"center", backgroundColor:isDark?"#1b1b1b":"#fff"}}>
             <ActivityIndicator color={"#e05003"}/>
         </View>)}
                androidHardwareAccelerationDisabled
                androidLayerType='software'
                renderToHardwareTextureAndroid={true}
                containerStyle={{ minWidth: "90%", minHeight: 250, maxWidth: "90%", maxHeight: 250, margin: 30, borderRadius: 8, alignSelf: "center" }}
                ref={mapRef2}
                source={{ html: isDark ? html_script : html_script_light }}
                onLoad={() => {
                    mapRef2.current.injectJavaScript(
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
                    true
                    `
                    )

                }
                }
            />

            <Text style={{ marginLeft: 30, color: isDark ? "#fff" : "#000000" }}>{item.descr}</Text>

            <View style={{ marginLeft: 30, flexDirection: "row", marginTop: 15 }}>
                <Svg width="43" height="37" viewBox="0 0 43 37" fill="none" xmlns="http://www.w3.org/2000/svg" >
                    <Path d="M3.67852 34.4123L21.5 4.57167L39.3215 34.4123H3.67852Z" fill={match ? "#FAD03C" : "#43f680"} stroke={"black"} strokeWidth={isDark ? "0" : "4.17543"} />
                </Svg>
                <View style={{ marginLeft: 15 }}>
                    <Text style={{ color: isDark ? "#fff" : "#000000", fontWeight: "700" }} >Durum</Text>
                    <Text style={{ color: isDark ? "#fff" : "#000000" }}>{match ? "Yol Çalışması Sürüyor" : "Yol Çalışması Bulunmuyor"}</Text>
                </View>
            </View>
            <View style={{ flexDirection: "row", flexShrink: 1, marginLeft: 30 }}>
                <NavigationArrow size={43} style={{ alignSelf: "center" }} color={isDark ? "#fff" : "#000000"} />
                <View style={{ marginLeft: 18, flexShrink: 1, marginRight: 32 }}>
                    <Text style={{ fontWeight: "700", color: isDark ? "#fff" : "#000000", marginTop: 15 }}>Konumu</Text>
                    <Text style={{ color: isDark ? "#a8a8a8" : "#575757" }}>{firstDescr} - </Text>
                    <Text style={{ color: isDark ? "#a8a8a8" : "#575757" }}>{secDescr}</Text>
                </View>
            </View>

            <View style={{ flexDirection: "row", flexShrink: 1, marginLeft: 30, marginTop: 20 }}>
                <Calendar color={isDark ? "#fff" : "#000000"} size={43} style={{ alignSelf: "center" }} />
                <View style={{ flexShrink: 1, marginLeft: 18, marginRight: 32 }}>
                    <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000000" }}>Günler</Text>
                    <Text style={{ color: isDark ? "#a8a8a8" : "#575757" }}>{item.date}</Text>
                </View>
            </View>

            <View style={{ flexDirection: "row", flexShrink: 1, marginLeft: 30, marginTop: 20 }}>
                <Repeat color={isDark ? "#fff" : "#000000"} size={43} style={{ alignSelf: "center" }} />
                <View style={{ flexShrink: 1, marginLeft: 18, marginRight: 32 }}>
                    <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000000" }}>Tekrarlama Sıklığı</Text>
                    <Text style={{ color: isDark ? "#a8a8a8" : "#575757" }}>{item.repeat}</Text>
                </View>
            </View>
        </View>
    )
}

export default RouteDetails