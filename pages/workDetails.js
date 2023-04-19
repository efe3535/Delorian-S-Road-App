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
import { CaretLeft, Warning, NavigationArrow, PlusCircle, Calendar } from 'phosphor-react-native';

import { useIsFocused } from '@react-navigation/native';

import { WebView } from "react-native-webview"
import { useFocusEffect } from '@react-navigation/native';
import { Svg, Path } from 'react-native-svg';



const isDark = Appearance.getColorScheme() == "dark"

var MQTTClient: IMqttClient

const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];
const days = ["Pazar","Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"]

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
    console.log("workDetails Item -> ", route.params);
    const renderItem = ({ item, index }) => {
        console.log("item.photoworkdetails", item.photo);
        return (
            <View style={{ marginTop: 15, marginLeft: 30 }}>
                <View style={{ margin: 10.5 }}>
                    <Image style={{ width: 80, height: 160, resizeMode: "stretch", borderRadius: 12 }} source={{ uri: `data:image/png;base64,${item.photo}`, cache: "only-if-cached", }} />
                </View>
            </View>
        )
    }
    console.log("ITEM ->",route.params)
    
    useFocusEffect(
        () => {
            if(mapRef)
                mapRef.current.injectJavaScript(`   var marker = L.marker([${item.koorX}, ${item.koorY}],{icon:greenIcon}).addTo(mymap)
                ;    mymap.setView([${item.koorX}, ${item.koorY}], 18) ; true
                `)
        })
    return (
        <SafeAreaView style={{flex:1, backgroundColor:isDark?"#1b1b1b":"#fff"}}>
        <ScrollView overScrollMode='never' style={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", flex: 1 }} fadingEdgeLength={160}>
            <TouchableOpacity style={{ flexDirection: "row", marginLeft: 30, marginTop: 24 }} onPress={() => navigation.goBack()}>
                <CaretLeft color={isDark ? "#fff" : "#000000"} style={{ alignSelf: "center" }} size={26} />
                <Text style={{ color: isDark ? "#fff" : "#000000", textAlign: "center", alignSelf: "center" }}>Geri</Text>
            </TouchableOpacity>
            <Text style={{ marginLeft: 32, color: isDark ? "#fff" : "#000000", marginTop: 15, fontSize: 19, marginRight:16 }} adjustsFontSizeToFit>{item.descr}</Text>
                            <WebView androidHardwareAccelerationDisabled androidLayerType='software' renderToHardwareTextureAndroid={true}  onLoad={() => {mapRef.current.injectJavaScript(`   var marker = L.marker([${item.koorX}, ${item.koorY}],{icon:greenIcon}).addTo(mymap)
                                                        ;    mymap.setView([${item.koorX}, ${item.koorY}], 18) ; true
                        `)}} containerStyle={{ flex: 1, borderRadius:16 , minWidth: 200, minHeight: 200, margin:30, }} ref={mapRef} source={{ html: isDark ? html_script : html_script_light }} />

            <Text style={{ fontSize: 18, marginLeft: 32, marginRight: 32, color: isDark ? "#fff" : "#000000" }}>{item.reason}</Text>
            
            <View style={{ marginLeft: 32, flexDirection: "row", marginTop: 20 }}>
                <Svg width="43" height="37" viewBox="0 0 43 37" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ alignSelf: "center" }}>
                    <Path d="M3.67852 34.4123L21.5 4.57167L39.3215 34.4123H3.67852Z" fill={item.ended == 1 ? "#43f680" : "#FAD03C"} stroke="black" strokeWidth={isDark?"0":"4.17543"} />
                </Svg>
                               <View style={{ marginLeft: 18 }}>
                    <Text style={{ fontSize: 18, color: isDark ? "#fff" : "#000000" }}>Durum</Text>
                    <Text style={{ fontSize: 18, color: isDark ? "#a8a8a8" : "#575757" }}>{item.ended==1?"Yol çalışması bitti":"Yol çalışması sürüyor"}</Text>
                </View>
            </View>

            <View style={{ marginLeft: 32, flexDirection: "row", marginTop: 20 }}>
                <NavigationArrow size={36} color={isDark ? "white" : "black"} style={{ alignSelf: "center" }} />
                <View style={{ marginLeft: 18, flexShrink: 1 }}>
                    <Text style={{ fontSize: 18, color: isDark ? "#fff" : "#000000" }}>Konumu</Text>
                    <Text style={{ fontSize: 18, color: isDark ? "#a8a8a8" : "#575757" }}>{item.descr}</Text>
                </View>
            </View>

            <View style={{ marginLeft: 32, flexDirection: "row", marginTop: 20 }}>
                <Calendar size={36} color={isDark?"#fff":"#000000"} style={{ alignSelf: "center" }} />
                <View style={{ marginLeft: 18 }}>
                    <Text style={{ fontSize: 18, color: isDark ? "#fff" : "#000000" }}>Tarihler</Text>
                    <Text style={{ fontSize: 18, color: isDark ? "#a8a8a8" : "#575757", flexWrap:"wrap" }}>{(new Date(parseInt(item.timestamp)).getDate() + " " + (monthNames[new Date(parseInt(item.timestamp)).getMonth()]) + " " + days[new Date(parseInt(item.timestamp)).getDay()])} {item.ended!=1?"- Devam ediyor":""}</Text>
                </View>
            </View>

            <Text style={{ color: isDark ? "#a8a8a8" : "#575757", marginLeft: 30, fontSize: 20, marginTop: 20 }}>{item.hasPhoto  ? "FOTOĞRAFLAR" : "Fotoğraf yok"}</Text>
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
                                    (Math.abs(parseFloat(koor.x) - parseFloat(item.koorX)) < 0.005) && (Math.abs(parseFloat(koor.y) - parseFloat(item.koorY)) < 0.005) && item.ended != 1 ? navigation.navigate("AddPhoto", { id: item.id }) : null
                                }}>
                            <PlusCircle size={32} color={isDark ? "#fff" : "#000000"} style={{ alignSelf: "center" }} />
                            <Text style={{ fontWeight: "500", color: isDark ? "#fff" : "#000000", alignSelf: "center", marginLeft: 15 }}>{(Math.abs(parseFloat(koor.x) - parseFloat(item.koorX)) < 0.005) && (Math.abs(parseFloat(koor.y) - parseFloat(item.koorY)) < 0.005) && item.ended != 1 ? "Fotoğraf ekle" : "Fotoğraf eklenemez"}</Text>
                        </TouchableOpacity>
                    </View>
                    : <TouchableOpacity style={{ marginLeft: 30, marginTop: 15, flexDirection: "row" }} onPress={
                        () => {
                            console.log(Math.abs(parseFloat(koor.x) - parseFloat(item.koorX)));
                            (Math.abs(parseFloat(koor.x) - parseFloat(item.koorX)) < 0.005) && (Math.abs(parseFloat(koor.y) - parseFloat(item.koorY)) < 0.005) && item.ended != 1 ? navigation.navigate("AddPhoto", { id: item.id }) : null
                        }}>
                        <PlusCircle size={32} color={isDark ? "#fff" : "#000000"} style={{ alignSelf: "center" }} />
                        <Text style={{ fontWeight: "500", color: isDark ? "#fff" : "#000000", alignSelf: "center", marginLeft: 15 }}>{(Math.abs(parseFloat(koor.x) - parseFloat(item.koorX)) < 0.005) && (Math.abs(parseFloat(koor.y) - parseFloat(item.koorY)) < 0.005) && item.ended != 1 ? "Fotoğraf ekle" : "Fotoğraf eklenemez"}</Text>
                    </TouchableOpacity>
            }
        </ScrollView>
        </SafeAreaView>
    );
}

export default WorkDetails;