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
import MQTT from "sp-react-native-mqtt";

import { CaretLeft, Camera as CamIcon, CameraRotate, Image as ImageIcon } from 'phosphor-react-native';

import RNFS from "react-native-fs"

const isDark = Appearance.getColorScheme() == "dark"

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
    console.log(route.params["id"])
    const fotografGonder = async () => {
        //  console.log(camRef);
        const photo = await camRef.current.takePhoto(
            {
            
            }
        )
        
        console.log(photo["path"])
        await readFile("file://" + photo["path"], "base64").then((str)=>{
        //    console.log(str)
        const client = MQTT.createClient({
            uri: 'mqtt://192.168.1.64:1883',
            clientId: 'teknofest' + Platform.OS
        }).then(function (client) {
            client.on('connect', function () {
                client.subscribe("esp32/sendphoto",0);
                client.publish("esp32/sendphoto",route.params["id"] + "," + str,0,false);
            });
            client.connect();
        }).catch(function (err) {
            console.log(err);
        });
        
    })
        
    }

    if (device == null) return <Text>LOADING</Text>
    return (
        <SafeAreaView style={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", flex: 1 }}>
            <TouchableOpacity style={{ flexDirection: "row", marginLeft: 30, marginTop: 60 }} onPress={() => navigation.goBack()}>
                <CaretLeft color={isDark ? "#fff" : "#000"} style={{ alignSelf: "center" }} size={26} />
                <Text style={{ color: isDark ? "#fff" : "#000", textAlign: "center", alignSelf: "center" }}>Geri</Text>
            </TouchableOpacity>
            <Text style={{marginLeft:30, color:isDark?"#fff":"#000", fontSize:36, fontWeight:"700"}}>Fotoğraf Yükleme</Text>
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
                    
                    <TouchableOpacity onPress={()=>setIsFront(!isFront)} style={{justifyContent:"center", alignItems:"center",alignSelf:"center"}}>
                        <ImageIcon size={32} style={{ alignSelf:"center"}} color={isDark?"#fff":"#000"} />
                    </TouchableOpacity>            

                    <TouchableOpacity onPress={fotografGonder} style={{justifyContent:"center", alignItems:"center", width:32,height:32, alignSelf:"center", borderRadius:360,borderWidth:5,borderColor:"#e05003", padding:32, marginLeft:50 }}>
                        <CamIcon size={32} style={{ alignSelf:"center"}} color={isDark?"#fff":"#000"} />
                    </TouchableOpacity>            

                    <TouchableOpacity onPress={()=>setIsFront(!isFront)} style={{justifyContent:"center", alignItems:"center",alignSelf:"center", marginLeft:50}}>
                        <CameraRotate size={32} style={{ alignSelf:"center"}} color={isDark?"#fff":"#000"} />
                    </TouchableOpacity>    
                </View>        
            </View>

        </SafeAreaView>
    );
}

export default CameraPage;