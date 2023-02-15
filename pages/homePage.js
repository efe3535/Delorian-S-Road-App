import React, { useCallback, useEffect } from 'react';
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
    Platform,
    ActivityIndicator
} from 'react-native';
import messaging from "@react-native-firebase/messaging"

import Spinner from 'react-native-loading-spinner-overlay';
import { WebView } from 'react-native-webview';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CaretRight, NavigationArrow, Warning, Calendar,CalendarBlank, Repeat } from "phosphor-react-native"
import { Svg, Path } from "react-native-svg"
import {PermissionsAndroid} from 'react-native'
PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATION,{
    title: 'Bildirim izni',
    message:
      'Yol çalışmalarından haberdar olmak için bildirimlere izin verebilirsiniz',
    buttonNeutral: 'Daha sonra haber ver',
    buttonNegative: 'Olmaz',
    buttonPositive: 'Olur',
  },);

const ip = require("../ip").default
import AsyncStorage from "@react-native-async-storage/async-storage";

import html_script_light from '../html_script_light';
import {request, PERMISSIONS} from 'react-native-permissions';

request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)

  import Geolocation from '@react-native-community/geolocation';
import { useFocusEffect } from '@react-navigation/native';

Geolocation.requestAuthorization()
let once = false
var MQTTClient: IMqttClient;
const isDark = Appearance.getColorScheme() == "dark"


import init from "react_native_mqtt"
let STORAGE_KEY = '@routes-item';


init({
    size: 10000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24,
    enableCache: false,
    reconnect: true,
    sync: {
    }
});

const client = new Paho.MQTT.Client(ip, 1923, 'uname' + (Math.random() * 10000).toString());
let connected;
function onConnect() {
    console.log("onConnect");
    console.log("ISCONNECTED\t",client.isConnected());
    connected = true
    client.subscribe("esp32/test")
    client.subscribe('esp32/coordinates');
    client.subscribe('esp32/responsecalismalar');
    client.subscribe('esp32/responsephotobyid');
    client.send("esp32/calismalar", "GET", 0, false)
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
        client.connect({ onSuccess: onConnect, onFailure: fail })
    }
}


function fail(err) {
    console.log(err);
}

client.onConnectionLost = onConnectionLost;
client.connect({ onSuccess: onConnect, onFailure: fail });



const HomePage = ({ navigation, route }) => {
    const mapRef = useRef(null);
    console.log(ip);
    const [koor, setKoor] = useState(null);
    const [invalidWarningVisible, setInvalidWarningVisible] = useState(false);
    const [reason, setReason] = useState(null);
    const [isInvalid, setIsInvalid] = useState(false);
    const [lastCommand, setLastCommand] = useState("");
    const [calismalar, setCalismalar] = useState([])
    const [itemState, setItemState] = useState({})
    const [location, setLocation] = useState("")
    const [photo, setPhoto] = useState([])
    const [descr, setDescr] = useState("")
    const [marked, setMarked] = useState(false)
    const [attr, setAttr] = useState([])
    const [expecting, setExpecting] = useState(true)
    const [displayRoutes, setDisplayRoutes] = useState([])

    const cellRefs = useRef({})

    const getToken = async () => {
        await messaging().registerDeviceForRemoteMessages()
        const token = await messaging().getToken()
        console.log("token:",token);
    }

    const getItems = async () => {
        
        let val = await AsyncStorage.getItem(STORAGE_KEY)
        if(val) {
            //console.log("VALUES", JSON.parse(val).routes);
            routes = JSON.parse(val).routes
            setDisplayRoutes(routes)
        } else {
            return undefined
        }
    }
    const subscribeTopic = async (topic) => {
        messaging()
          .subscribeToTopic(topic)
          .then(() => console.log("Subscribed to topic:", topic))
          .catch((e) => {
            console.log(e);
          });
      };
    useFocusEffect(useCallback(()=>{
        routes = displayRoutes
        getToken()
        subscribeTopic("all")
        getItems()
        for (let map in cellRefs.current) {
            cellRefs.current[map].reload()
        }
    },[]))

    const renderItemRoutes = ({ item, index }) => {
        return (
            <TouchableOpacity onPress={()=>{
                setLoading(true)
                fetch(`https://nominatim.openstreetmap.org/search.php?q=${item.x},${item.y}&polygon_geojson=1&format=json`, { headers: { "Accept-Language": "tr" } })
                .then(response => response.json())
                .then(json => {
                    //setFirstDescr(json[0]["display_name"])
                    fetch(`https://nominatim.openstreetmap.org/search.php?q=${item.x2},${item.y2}&polygon_geojson=1&format=json`, { headers: { "Accept-Language": "tr" } }).then(response => response.json())
                        .then(json2 => {
                            //setSecDescr(json[0]["display_name"])
                            //console.log(json);
                            setLoading(false)
                            navigation.navigate("RouteDetails", { id:item.id, item: item, allRoutes: displayRoutes, firstDescr:json[0]["display_name"], secDescr:json2[0]["display_name"] })

                        })
                })
               // setDisplayRoutes([]); 
    
                }} style={{  marginTop: 30, borderWidth:1, padding:0, borderRadius:10, marginLeft:30, alignSelf:"baseline", borderColor:isDark?"#262626":"#d9d9d9" }}>

                    <WebView
                        androidHardwareAccelerationDisabled
                        androidLayerType='software'
                        renderToHardwareTextureAndroid={true}
                        containerStyle={{ minWidth: 170, minHeight: 130, maxWidth: 170, maxHeight: 130, borderRadius: 8, }}
                        ref={ref => {
                            cellRefs.current[item.id] = ref;
                        }}
                        renderLoading={()=>(<View style={{flex:1, width:"100%", height:"100%", position:"absolute", alignItems:"center", justifyContent:"center", backgroundColor:isDark?"#1b1b1b":"#fff"}}>
                            <ActivityIndicator color={"#e05003"}/>
                        </View>)}
                        source={{ html: isDark ? html_script : html_script_light }}
                        onLoad={() => {
                            cellRefs.current[item.id].injectJavaScript(`
                                mymap.setView([${item.x}, ${item.y}],14);

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


                            `)

                        }}
                    />
                    <View style={{marginLeft:15, marginBottom:15 }}>
                        <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000000" }}>Rota</Text>
                        <View style={{ flexDirection: "row", flexShrink:1, marginTop:8 }}>
                            <CalendarBlank size={24} color={isDark ? "#fff" : "#000000"} />
                            <Text style={{ marginLeft: 10, color: isDark ? "#fff" : "#000000" , flexShrink:1}}>{item.repeat}</Text>
                        </View>
                       
                    </View>
            </TouchableOpacity>
        )
    }

    const onMessageArrived = (msg) => {
        if(expecting) {
            console.log("onmessage");
            if (msg.topic == "esp32/responsecalismalar" && JSON.parse(msg.payloadString) != []) {
                setCalismalar([])
                console.log(msg.topic);
                for (let calisma in JSON.parse(msg.payloadString)["calismalar"]) {
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
                        }]
                    )
                }

            }

            if (msg.topic == "esp32/responsekoorbyid") {
                try {
                    msg.payloadString
                } catch (err) {
                    console.log(err);
                }
            }
    /*
            if (msg.topic == "esp32/responsephotobyid") {
                setPhoto([])
                if (msg.payloadString.includes("📷")) {
                    msg.payloadString.split("📷").forEach(
                        (elm, ind, arr) => {
                            setPhoto(photo => [...photo, { id: photo.length, photo: elm }])
                        }
                    )
                } else {
                    console.log("else")
                    setPhoto([{ id: photo.length, photo: msg.payloadString[0] }])
                }
            }*/

            if (msg.topic == "esp32/responsephotobyid") {
                console.log("GOT RESPONSE");
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
                    console.log(msg.payloadString.slice(2, -2));

                    ll = [{ id: photo.length, photo: msg.payloadString.slice(2, -2) }]
                }
                if (koor) {
                    console.log("ALIVE2");
                    if (once == false)
                        once = true
                    console.log("navigate");
                    navigation.navigate("WorkDetails", { item:itemState, koor: { x: koor[0], y: koor[1] }, photo: ll })
                    setLoading(false)
                    console.log("ALIVE3");

                }
            }
            setExpecting(false)
        }
    }

    client.onMessageArrived = onMessageArrived

    const markKoor = () => {
        const connected = client.isConnected()
        console.log("IS CONNECTED\t",connected==true);
        if(connected==true) {
            setExpecting(true)
            client.send("esp32/calismalar", "GET", 0, false)
        }
        console.log("send");
        
        setCalismalar([])
        setMarked(true)
        setRefreshing(false)
    }

    useFocusEffect(
        useCallback(() => {

           
            Geolocation.getCurrentPosition(
                info => {
                    fetch(`https://nominatim.openstreetmap.org/search.php?q=${info.coords.latitude},${info.coords.longitude}&polygon_geojson=1&format=json`, { headers: { "Accept-Language": "tr" } }).then(response => response.json()).then(json => setLocation(json[0]["display_name"]))
                        .catch((e) => console.log(e))
                    setKoor([info.coords.latitude, info.coords.longitude])
                })
            markKoor()
        }, []))



    const renderItem = ({ item, index }) => {

        return (
            <View style={{ flexDirection: "row", flexShrink: 1, marginTop: 15 }}>
                <Svg width="43" height="37" viewBox="0 0 43 37" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ alignSelf: "center", marginLeft: 30 }}>
                    <Path d="M3.67852 34.4123L21.5 4.57167L39.3215 34.4123H3.67852Z" fill={item.ended == 1 ? "#43f680" : "#FAD03C"} stroke="black" strokeWidth={isDark ? "0" : "4.17543"} />
                </Svg>
                <View style={{ margin: 10.5, flexShrink: 1 }}>
                    <TouchableOpacity onPress={() => {
                        setItemState(item)
                        console.log("ALIVE1");
                        setPhoto([])
                        setLoading(true)

                        if (item.hasPhoto) {
                            console.log("item.id\t"+item.id);
                            //console.log(client);
                            setExpecting(true)
                            client.send("esp32/photobyid", item.id.toString(), 0, false)
                            console.log("heeeey");

                        } else {
                            setLoading(false)
                            if (koor) {
                                navigation.navigate("WorkDetails", { item:item, koor: { x: koor[0], y: koor[1] }, photo: null })
                            }
                        }
                    }}>
                        <Text style={{ color: isDark ? "#fff" : "#000000", fontWeight: "600" }}>{item.descr?.toString()} konumunda yol çalışması</Text>
                        <Text style={{ color: isDark ? "#fff" : "#000000", fontWeight: "400" }}>{item.reason}</Text>
                    </TouchableOpacity>
                </View>
                <CaretRight size={38} color={isDark ? "#fff" : "#000000"} style={{ alignSelf: 'center', justifyContent: "center" }} />
            </View>
        )
    }


    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false)
    return (
        <ScrollView style={{
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
                <NavigationArrow style={{ marginLeft: 32, marginTop: 15 }} size={48} color={isDark ? "#fff" : "#000000"} />
                <View style={{ flexDirection: "column", justifyContent: "center", marginLeft: 20, marginTop: 15, flexShrink: 1 }}>
                    <Text style={{ fontSize: 18, textAlign: "left", color: isDark ? "#fff" : "#000000", fontWeight: "600" }}>Konumunuz</Text>
                    <Text style={{ fontSize: 18, textAlign: "left", color: isDark ? "#fff" : "#000000", fontWeight: "300", flexShrink: 1, marginRight: 30 }}>{location?.toString()}</Text>
                </View>
            </View>
            <Text style={{ marginLeft: 30, marginTop: 30, fontSize: 18, color: isDark ? "#a8a8a8" : "#575757", display:displayRoutes.length!="0"?null:'none' }}>ROTALARINIZ</Text>
            <FlatList
                data={displayRoutes}
                fadingEdgeLength={60}
                horizontal
                style={{  display:displayRoutes.length!=0?null:"none", marginRight:30, height:240}}
                renderItem={renderItemRoutes}
                keyExtractor={item => item.id}
            />
            <Text style={{ marginLeft: 30, marginTop: 10, fontSize: 18, color: isDark ? "#a8a8a8" : "#575757" }}>YAKININIZDAKİ YOL ÇALIŞMALARI</Text>
            <FlatList
                data={calismalar}
                renderItem={renderItem}
                keyExtractor={item => item["id"]}
                refreshControl={<RefreshControl progressBackgroundColor={isDark ? "#1d1d1d" : "#eee"} colors={[isDark ? "#fff" : "#000000"]} refreshing={refreshing} onRefresh={markKoor}></RefreshControl>}
                onRefresh={markKoor}
                refreshing={refreshing}

            />
        </ScrollView>
    );
}

export default HomePage;