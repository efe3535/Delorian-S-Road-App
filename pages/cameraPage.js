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
    ScrollView,
    Image,
    Appearance,
    Modal,
    Platform,
} from 'react-native';

import { IOSPermission } from 'react-native-permissions';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import Spinner from "react-native-loading-spinner-overlay"
const ip = require("../ip").default
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import { CaretLeft, Camera as CamIcon, CameraRotate, Image as ImageIcon } from 'phosphor-react-native';

import RNFS from "react-native-fs"
import AsyncStorage from '@react-native-async-storage/async-storage';
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
const CameraPage = ({ navigation, route }) => {
    
    if(Platform.OS == "android") {
    const granted = PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
            title: "Kamera Erişim İzni",
            message:
                "Yol fotoğrafı için kamera erişim izni" +
                "Yol çalışmasını fotoğraflamak için kamera iznine ihtiyacımzı var.",
            buttonNeutral: "Sonra Sor",
            buttonNegative: "İptal Et",
            buttonPositive: "Tamam"
        }
    );
    } else if(Platform.OS == "ios") {
       const perm = Camera.requestCameraPermission()
        
    }
    const devices = useCameraDevices();
    const device = devices.back;
    const frontdevice = devices.front;

    const camRef = useRef(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isFront, setIsFront] = useState(false);
    const [selected, setSelected] = useState(false)
    const [photoPath, setPhotoPath] = useState("");
    const isFocused = useIsFocused()
    const [loading,setLoading] = useState(false)
    console.log(route.params["id"])
    const fotografGonder = async () => {
        //  console.log(camRef);
        
        const photo = await camRef.current.takeSnapshot(
            {
                quality: 85,
                skipMetadata: true
            }
        )
        
        console.log(photo["path"])
        await readFile("file://" + photo["path"], "base64").then((str)=>{
            console.log(str)
                client.send("esp32/sendphoto",route.params["id"] + "," + str,0,false);
                console.log("done");
                setLoading(false)
    })
        
    }

    const base64FotografGonder = (data) => {
                client.send("esp32/sendphoto",route.params["id"] + "," + data,0,false);
                console.log("done");
                setLoading(false)
    }

    if (device == null) return <Text>LOADING</Text>
    return (
        <SafeAreaView style={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", flex: 1 }}>
                        <Spinner  animation='fade' visible={loading} textContent={"Fotoğraf yükleniyor"} overlayColor={"#000000aa"} textStyle={{fontSize:24, fontWeight:"300"}} />

            <TouchableOpacity style={{ flexDirection: "row", marginLeft: 30, marginTop: 60 }} onPress={() => navigation.goBack()}>
                <CaretLeft color={isDark ? "#fff" : "#000000"} style={{ alignSelf: "center" }} size={26} />
                <Text style={{ color: isDark ? "#fff" : "#000000", textAlign: "center", alignSelf: "center" }}>Geri</Text>
            </TouchableOpacity>
            <Text style={{marginLeft:30, color:isDark?"#fff":"#000000", fontSize:36, fontWeight:"700"}}>Fotoğraf Yükleme</Text>
            <View style={{alignItems:"center"}}>
                <Camera 
                
                style={{width:"80%",height:"75%", borderRadius:36, marginTop:25, backgroundColor:"#282828"}} 
                device={isFront ? frontdevice:device}
                ref={camRef}
                enableZoomGesture 
                isActive={isFocused}
                photo
                video={isFocused} />
                <View style={{flexDirection:"row", marginTop:10, alignContent:"center", alignItems:"center", gap: 10}}>
                    
                    <TouchableOpacity onPress={()=>{
                        setLoading(true)
                        launchImageLibrary({includeBase64:true}, (response)=>{
                            //console.log(response);
                            base64FotografGonder(response.assets[0].base64)
                        })
                    }} style={{justifyContent:"center", alignItems:"center",alignSelf:"center"}}>
                        <ImageIcon size={32} style={{ alignSelf:"center"}} color={isDark?"#fff":"#000000"} />
                    </TouchableOpacity>            

                    <TouchableOpacity onPress={()=>{/*setLoading(true);*/fotografGonder()}} style={{justifyContent:"center", alignItems:"center", width:32,height:32, alignSelf:"center", borderRadius:360,borderWidth:5,borderColor:"#e05003", padding:32, marginLeft:50 }}>
                        <CamIcon size={32} style={{ alignSelf:"center"}} color={isDark?"#fff":"#000000"} />
                    </TouchableOpacity>            

                    <TouchableOpacity onPress={()=>setIsFront(!isFront)} style={{justifyContent:"center", alignItems:"center",alignSelf:"center", marginLeft:50}}>
                        <CameraRotate size={32} style={{ alignSelf:"center"}} color={isDark?"#fff":"#000000"} />
                    </TouchableOpacity>    
                </View>        
            </View>

        </SafeAreaView>
    );
}

export default CameraPage;