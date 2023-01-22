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

import html_script from '../html_script';
import html_script_light from '../html_script_light';

const isDark = Appearance.getColorScheme() == "dark"

const RoutesPage = ({ navigation, route }) => {


    const routes = [
        {
            id:2,
            x:"39.7669", y:"30.5094",
            x2: "39.7684", y2:"30.5153"
        }
    ]
    const mapRef = useRef(null)

    const renderItem = ({item, index}) => {

        
        return (
            <View>
                <WebView 
                androidHardwareAccelerationDisabled 
                androidLayerType='software' 
                renderToHardwareTextureAndroid={true} 
                containerStyle={{ minWidth:300, minHeight:300 }}  
                ref={mapRef} 
                source={{ html: isDark ? html_script : html_script_light }} 
                onLoad={()=>{
                    mapRef.current.injectJavaScript(`
                        mymap.setView([${item.x}, ${item.y}],16);

                        L.Routing.control({
                            waypoints: [
                            L.latLng(${item.x}, ${item.y}),
                            L.latLng(${item.x2}, ${item.y2})
                            ],
                            show:false,
                            createMarker:()=>{return null},
                        }).addTo(mymap);


                    `)

                }}
                />
            </View>
        )
    }

    return (
        <SafeAreaView style={{ backgroundColor: isDark?"#1b1b1b":"#fff", alignItems: "center", justifyContent: "center",  flex:1}}>
            <Text>rotalarınız</Text>
            
            <FlatList
                data={routes}
                fadingEdgeLength={60}
                renderItem={renderItem}
                keyExtractor={item => item["id"]}
             />

         </SafeAreaView>
    );
}

export default RoutesPage;