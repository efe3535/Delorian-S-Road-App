import React, { useEffect } from 'react';
import { useState, useRef } from "react";
import type { Node } from 'react';

import html_script from "../html_script"
import html_script_light from '../html_script_light';
import {
    SafeAreaView,
    Text,
    StatusBar,
    TouchableOpacity,
    View,
    ActivityIndicator,
    FlatList,
    Modal,
    Appearance,
    TextInput,
    ScrollView,
    Dimensions
} from 'react-native';

import CalendarPicker from 'react-native-calendar-picker';
import DropDownPicker from 'react-native-dropdown-picker';


let STORAGE_KEY = '@routes-item';

import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { WebView } from 'react-native-webview';
const isDark = Appearance.getColorScheme() == "dark";


const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];
const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"]


import Geolocation from '@react-native-community/geolocation';
Geolocation.requestAuthorization()

import { Calendar as CalendarIcon, CaretLeft, MapTrifold, NavigationArrow, PencilSimple, Repeat, Check } from "phosphor-react-native"
import { useFocusEffect } from '@react-navigation/native';

/*
    mapRef.current.injectJavaScript(
        "mymap.on('click', (a)=>window.ReactNativeWebView.postMessage(a.latlng.lat.toString()+','+a.latlng.lng.toString()))"
    );
*/



const AddRoutePage = ({ navigation, route }) => {
    const textRef = useRef(null)
    const text2Ref = useRef(null)
    const [routeName, setRouteName] = useState("")
    const [routeDescr, setRouteDescr] = useState("")
    
    const [firstDate, setFirstDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [dateStr, setDateStr] = useState("")
    const [value, setValue] = useState(null);
    const [open, setOpen] = useState(false)
    const [repeat, setRepeat] = useState(false)
    const [x2,setx2] = useState(null)
    const [y2,sety2] = useState(null)
    const [picker, setPicker] = useState(false)
    const [map, setMap] = useState(false)
    const [repeatText, setRepeatText] = useState("")
    const [first,setFirst] = useState([])
    const [second,setSecond] = useState(false)
    const [chosen, setChosen] = useState(false)
    const routes = route.params.routes
    console.log(routes);
    const [listRoute, setListRoute] = useState(routes)
    const [koor, setKoor] = useState([])

    const mapRef = useRef(null)
    const mapRef2 = useRef(null)
    let repeatLet = repeatText;
    let dateNav = dateStr;

    useEffect(
        () => {
            mapRef.current!=null?mapRef.current.reload():null
            mapRef2.current!=null?mapRef2.current.reload():null

        },[])
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

    const addValue = async (data) => {
        
        let val = await AsyncStorage.getItem(STORAGE_KEY)
        console.log(val);
        if(val!=null) {
            console.log("NOT NULL");
            console.log("VAL ",val);
            val = JSON.parse(val)
            val.routes.push(data)
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(val))
        } else {
            console.log("NULL");
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({"routes":[data]}))
        }
    }


    return (
        <ScrollView style={{ flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff" }} fadingEdgeLength={120}>
            <Modal transparent animationType={'slide'} visible={open} style={{ backgroundColor: "#1b1b1b",  }}>
                <View style={{ backgroundColor:"#000000cc", alignItems:"center", flex:1, justifyContent:"center", alignSelf:"center", }}>
                    <View style={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", borderRadius:16,}}>
                        <View style={{width:"60%", height:"60%"}}>
                            <CalendarPicker
                                allowRangeSelection
                                textStyle={{ color: isDark ? "#d9d9d9" : "#262626" }}
                                todayTextStyle={{ backgroundColor: isDark ? "#262626" : "#d9d9d9" }}
                                selectedDayColor={isDark ? "#262626" : "#d9d9d9"}
                                selectedDayTextColor={isDark ? "#fff" : "#000000"}
                                onDateChange={(date, type) => {
                                    if (type == "END_DATE") {
                                        //setDateStr((date.get().getDate() + " " + (monthNames[date.get().getMonth()]) + " " + days[date.get().getDay()]))
                                        if(date!=null) {
                                            if ( firstDate.date() != date.date()) {
                                                setDateStr(firstDate.date().toString() + " " + monthNames[firstDate.month()] + " - " + date.date().toString() + " " + monthNames[date.month()])
                                                dateNav = firstDate.date().toString() + " " + monthNames[firstDate.month()] + " - " + date.date().toString() + " " + monthNames[date.month()] 
                                            } else {
                                                setDateStr(date.date().toString() + " " + monthNames[date.month()])
                                                dateNav = date.date().toString() + " " + monthNames[date.month()] 
                                            }
                                        } else {
                                            setDateStr(firstDate.date().toString() + " " + monthNames[firstDate.month()])
                                            dateNav = firstDate.date().toString() + " " + monthNames[firstDate.month()]
                                        }
                                        setEndDate(date)
                                        setTimeout(()=>setOpen(false),500)

                                    } else if (type = "START_DATE") {
                                        setFirstDate(date)
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
                            onChangeValue={(val) => { setRepeatText(valDict[val]) ; repeatLet = valDict[val] ; setTimeout(()=>setRepeat(false),200) ;  }}
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
                <View style={{flex:1 , backgroundColor:isDark?"#1b1b1b":"#fff"}}>
                    <TouchableOpacity style={{ marginLeft: 20, marginTop: 20, flexDirection: "row" }} onPress={() => {
                        setMap(false) 
                        }}>
                        <CaretLeft size={32} color={isDark ? "#fff" : "#000000"} />
                        <Text style={{ color: isDark ? "#fff" : "#000000", fontSize: 18, alignSelf: "center", marginLeft: 10, fontWeight: "600" }}>Geri</Text>
                    </TouchableOpacity>
                    <WebView ref={mapRef} onMessage={
                            (msg)=>{
                                console.log(msg.nativeEvent.data);
                                setSecond(false)
                                if(second==true) {
                                    console.log(repeatText);
                                    setx2(parseFloat(msg.nativeEvent.data.split(",")[0]))
                                    sety2(parseFloat(msg.nativeEvent.data.split(",")[1]))
                                    console.log(first[0],first[1],parseFloat(msg.nativeEvent.data.split(",")[0]),parseFloat(msg.nativeEvent.data.split(",")[1]));
                                    
                                    mapRef.current.reload()
                                    mapRef.current.injectJavaScript(`
                                    L.Routing.control({
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
                                    }).addTo(mymap);`)
                                    setChosen(true)
                                    chose = true
                                    setTimeout(()=>setMap(false),200)
                                    mapRef2!=null?mapRef2?.current?.reload():null
                                    /*setRouteDescr("")
                                    setRouteName("")
                                    setRepeat(null)
                                    setRepeatText("")
                                    setDate("")*/
                                } else {
                                    setFirst([parseFloat(msg.nativeEvent.data.split(",")[0]), parseFloat(msg.nativeEvent.data.split(",")[1]) ])
                                    setSecond(true)
                                
                                }
                            }
                        }  renderLoading={()=>(<View style={{flex:1, width:"100%", height:"100%", position:"absolute", alignItems:"center", justifyContent:"center", backgroundColor:isDark?"#1b1b1b":"#fff"}}>
                        <ActivityIndicator color={"#e05003"}/>
                    </View>)} onLoad={()=>mapRef.current.injectJavaScript(`mymap.setView([${koor[0]},${koor[1]}],18)`)} androidHardwareAccelerationDisabled androidLayerType='software' renderToHardwareTextureAndroid={true} containerStyle={{ flex: 1, borderRadius:16 , minWidth: 200, minHeight: 200, margin:30, }}  source={{ html: isDark ? html_script : html_script_light }} />

                </View>
            </Modal>


            <View style={{ flexDirection: "row" }}>
                <TouchableOpacity style={{ flexDirection: "row", marginLeft: 20, marginTop: 60 }} onPress={() => {
                    setChosen(false)
                    setRouteDescr("")
                    setDateStr("")
                    setRouteName("")
                    setRepeatText("")
                    navigation.navigate("Routes" , {extraRoutes:listRoute})}}>
                    <CaretLeft color={isDark ? "#fff" : "#000000"} style={{ alignSelf: "center" }} size={26} />
                    <Text style={{ color: isDark ? "#fff" : "#000000", textAlign: "center", alignSelf: "center" }}>Geri</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ flexDirection: "row", marginLeft: 20, marginTop: 60, position: 'absolute', right: 30 }} 
                onPress={
                    () => { 
                       
                        console.log({
                            id:listRoute!=null && listRoute.length>0?listRoute[listRoute.length-1].id + 1:0, 
                            x:first[0],
                            y:first[1],
                            x2:x2, 
                            y2:y2,
                            descr: routeDescr,
                            name: routeName,
                            repeat:repeatText,
                            startDate: firstDate,
                                endDate:endDate,
                            date:dateStr
                        }); 
                        setListRoute(listRoute => [
                            ...listRoute,
                            {
                                id:listRoute!=[] && listRoute.length>0?listRoute[listRoute.length-1].id + 1:0, 
                                x:first[0],
                                y:first[1],
                                x2:x2, 
                                y2:y2,
                                descr: routeDescr,
                                name: routeName,
                                repeat:repeatText,
                                startDate: firstDate,
                                endDate:endDate,
                                date:dateStr
                            }
                        ])
                        setChosen(false)
                        setRouteDescr("")
                        setDateStr("")
                        setRouteName("")
                        setRepeatText("")
                        
                        addValue({
                            id:listRoute.length>0 && listRoute !=[]?listRoute[listRoute.length-1].id + 1:0, 
                            x:first[0],
                            y:first[1],
                            x2:x2,
                            y2:y2,
                            descr:routeDescr,
                            name:routeName,
                            repeat:repeatText,
                            startDate: firstDate,
                                endDate:endDate,
                            date:dateStr
                        })
                        
                        navigation.navigate("Routes", {extraRoutes:[...listRoute, {
                            id:listRoute!=[] && listRoute.length>0 ?listRoute[listRoute.length-1].id + 1:0, 
                            x:first[0],
                            y:first[1],
                            x2:x2,
                            y2:y2,
                            descr:routeDescr,
                            name:routeName,
                            repeat:repeatText,
                            startDate: firstDate,
                                endDate:endDate,
                            date:dateStr
                        
                        }]})
                        setValue(null) 
                    }
                }>
                    <Check color={isDark ? "#fff" : "#000000"} style={{ alignSelf: "center" }} size={26} />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", flexShrink: 1, marginLeft: 20, borderWidth: 2, marginRight: 30, marginTop: 32, borderRadius: 5, borderColor: isDark ? "#262626" : "d9d9d9" }}>
                <TextInput ref={textRef} onChangeText={text=>{setRouteName(text);}} value={routeName} caretHidden placeholder={'Bir rota adı seç'} placeholderTextColor={isDark ? "#fff" : "#000000"} style={{ fontSize: 36, color:isDark?"#fff":"#000", fontWeight: "700" }} />
                <TouchableOpacity onPress={() => textRef.current.focus()} style={{ alignSelf: "center", position: "absolute", right: 10 }}>
                    <PencilSimple size={32} color={isDark ? "#fff" : "#000000"} style={{}} />
                </TouchableOpacity>
            </View>
            {chosen==false ?<TouchableOpacity onPress={()=> {
                Geolocation.getCurrentPosition(
                    (pos)=>setKoor([pos.coords.latitude, pos.coords.longitude]));
                    setMap(true) 
                }
            } style={{ borderColor: isDark ? "#262626" : "#d9d9d9", borderWidth: 4, marginTop: 30, width: 350, height: 250, alignSelf:"center", borderRadius: 8, borderStyle: "dashed", alignItems: "center", justifyContent: "center" }}>
                <MapTrifold size={55} color={isDark ? "#fff" : "#000000"} />
                <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000000" }}>Bir konum seçin...</Text>
            </TouchableOpacity>: <WebView  renderLoading={()=>(<View style={{flex:1, width:"100%", height:"100%", position:"absolute", alignItems:"center", justifyContent:"center", backgroundColor:isDark?"#1b1b1b":"#fff"}}>
                            <ActivityIndicator color={"#e05003"}/>
                        </View>)} ref={mapRef2} onLoad={()=>mapRef2.current.injectJavaScript(
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
                `)} androidHardwareAccelerationDisabled androidLayerType='software' renderToHardwareTextureAndroid={true} containerStyle={{ flex: 1, borderRadius:16 , minWidth: 350, minHeight: 250, marginTop:15, alignSelf:"center",  }}  source={{ html: isDark ? html_script : html_script_light }} />}
            
            <View style={{ flexDirection: "row", flexShrink: 1, marginLeft: 20, marginTop: 20 }}>
                <TextInput ref={text2Ref} onChangeText={(text)=>setRouteDescr(text)} value={routeDescr} caretHidden placeholder={'Bir açıklama yazın...'} placeholderTextColor={isDark ? "#fff" : "#000000"} style={{ fontSize: 18, color:isDark?"#fff":"#000", fontWeight: "400" }} />
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
                    Geolocation.getCurrentPosition((pos)=>setKoor([pos.coords.latitude, pos.coords.longitude]));
                    setMap(true)
                    }
                } style={{ alignSelf: "center", position: "absolute", right: 10 }}>
                    <PencilSimple size={32} color={isDark ? "#fff" : "#000000"} style={{}} />
                </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", flexShrink: 1, marginLeft: 20, borderWidth: 2, marginRight: 30, marginTop: 20, borderRadius: 5, borderColor: isDark ? "#262626" : "d9d9d9", padding: 10 }}>
                <CalendarIcon size={32} color={isDark ? "#fff" : "#000000"} style={{ alignSelf: "center" }} />
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
    )
}

export default AddRoutePage;
