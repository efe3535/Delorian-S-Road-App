import React, { useEffect } from 'react';
import { useState, useRef } from "react";
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
    Modal,
    FlatList,
    Platform,
    Appearance,
} from 'react-native';

import { WebView } from "react-native-webview"
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Calendar, Plus, PlusCircle, Repeat, WarningCircle } from 'phosphor-react-native';

import { useAsyncStorage } from '@react-native-async-storage/async-storage';

import html_script from '../html_script';
import html_script_light from '../html_script_light';

const isDark = Appearance.getColorScheme() == "dark"

let STORAGE_KEY = '@routes-item';


const RoutesPage = ({ navigation, route }) => {
    
    const [displayRoutes, setDisplayRoutes] = useState([])

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

    const [value, setValue] = useState(null);
    const { getItem, setItem } = useAsyncStorage(STORAGE_KEY);
    let routes = getItems()
    const cellRefs = useRef({})

    

    useEffect(
        () => {
            routes = displayRoutes
            getItems()
        }, 
    [])

    const renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity onPress={()=>{setDisplayRoutes([]) ; navigation.navigate("RouteDetails", {item:item,allRoutes:displayRoutes })}} style={{ flexDirection: "row", marginTop: 30, marginLeft: 30, alignItems: "center" }}>
                <WebView
                    androidHardwareAccelerationDisabled
                    androidLayerType='software'
                    renderToHardwareTextureAndroid={true}
                    containerStyle={{ minWidth: 150, minHeight: 100, maxWidth: 150, maxHeight: 100, borderRadius: 8, alignSelf: "center" }}
                    ref={ref => {
                        cellRefs.current[item.id] = ref;
                    }}
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
                <View style={{ marginLeft: 18 }}>
                    <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000" }}>Rota</Text>
                    <View style={{ flexDirection: "row", flexShrink:1 }}>
                        <Calendar size={24} color={isDark ? "#fff" : "#000"} />
                        <Text style={{ marginLeft: 10, color: isDark ? "#fff" : "#000" , flexShrink:1}}>{item.date}</Text>
                    </View>
                    <View style={{ flexDirection: "row", flexShrink:1 }}>
                        <Repeat size={24} color={isDark ? "#fff" : "#000"} />
                        <Text style={{ marginLeft: 10, color: isDark ? "#fff" : "#000", flexShrink:1 }}>{item.repeat}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    route.params ? routes = route.params.extraRoutes : null
  
    return (
        <SafeAreaView style={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", justifyContent: "center", flex: 1 }}>        
            <Text style={{ fontWeight: "700", fontSize: 36, marginTop: 32, marginLeft: 30, color: isDark ? "#fff" : "#000" }}>Rotalarınız</Text>
            {
                displayRoutes?.length==0?
                <View style={{flex:1, alignItems:"center", marginHorizontal:60, marginTop:15, flexDirection:"row", flexShrink:1}}>
                    <WarningCircle size={48} style={{opacity:0.5, alignSelf:"center"}} color={isDark?"#a8a8a8":"#575757"} weight="thin" />
                    <Text style={{color:isDark?"#a8a8a8":"#575757", textAlign:"center", flexShrink:1 }}>Henüz rota bulunmuyor. Rota eklemek için <Text style={{fontWeight:"700", flexShrink:1, color:isDark?"#a8a8a8":"#575757"}}>Yeni Rota Oluştur</Text> butonuna basın.</Text>
                    
                </View>
                :null}
            <FlatList
                data={displayRoutes}
                fadingEdgeLength={60}
                style={{marginBottom:100}}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
            <TouchableOpacity style={{ flexDirection: "row", flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff", alignSelf: "flex-end", borderRadius: 56, borderWidth: 2, borderColor: isDark ? "#262626" : "#d9d9d9", padding: 16, position: "absolute", alignItems: "center", alignContent: "center", justifyContent: "center", marginRight: 28, marginBottom: 12, bottom: 0, right: 0 }}
                onPress={() => { navigation.navigate("AddRoute", {routes:displayRoutes})}}
            >
                <Plus size={36} color={isDark ? "#fff" : "#000"} />
                <Text style={{ marginLeft: 8, alignSelf: "center", justifyContent: "center", textAlign: "center", textAlignVertical: "center", fontSize: 18, color: isDark ? "#FFF" : "#000" }}>Yeni Rota Oluştur</Text>
            </TouchableOpacity>
            
        </SafeAreaView>
    );
}

export default RoutesPage;