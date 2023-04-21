import React, { useEffect } from 'react';
import { useState, useRef, useCallback } from "react";
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
    ActivityIndicator,
    Platform,
    Dimensions,
} from 'react-native';

import { IOSPermission } from 'react-native-permissions';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import Spinner from "react-native-loading-spinner-overlay"
const ip = require("../ip").default
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { CaretLeft, Camera as CamIcon, CameraRotate, Image as ImageIcon, MapPin, Check, Warning, Lightning } from 'phosphor-react-native';

import html_script from '../html_script';
import html_script_light from '../html_script_light';

import RNFS from "react-native-fs"
import AsyncStorage from '@react-native-async-storage/async-storage';
const isDark = Appearance.getColorScheme() == "dark"

import WebView from 'react-native-webview';

import init from "react_native_mqtt"
import { TextInput } from 'react-native-gesture-handler';


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
    console.log("ISCONNECTED\t", client.isConnected());
    connected = true
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
const AddWorkPage = ({ navigation, route }) => {

    if (Platform.OS == "android") {
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
    } else if (Platform.OS == "ios") {
        const perm = Camera.requestCameraPermission()

    }
    const devices = useCameraDevices();
    const device = devices.back;
    const frontdevice = devices.front;

    const camRef = useRef(null);
    const mapRef = useRef(null)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isFront, setIsFront] = useState(false);
    const [photoB64, setPhotoB64] = useState(null)
    const [selected, setSelected] = useState(false);
    const [showDevices, setShowDevices] = useState(false);
    const [photoPath, setPhotoPath] = useState("");
    const [deviceId, setDeviceId] = useState("");
    const isFocused = useIsFocused()
    const [devreKonum, setDevreKonum] = useState(null)
    const [loading, setLoading] = useState(false)
    const [camVisible, setCamVisible] = useState(false)
    const [showMap, setShowMap] = useState(false)
    const [devicePhotoHash, setDevicePhotoHash] = useState(null);
    const [neden, setNeden] = useState("");
    const [devreKoor,setDevreKoor] = useState([null,null])

    const [calismaKoor, setCalismaKoor] = useState([null, null])

    const fotografGonder = async () => {
        const photo = await camRef.current.takeSnapshot(
            {
                quality: 85,
                skipMetadata: true
            }
        )

        console.log(photo["path"])
        await readFile("file://" + photo["path"], "base64").then((str) => {
            console.log(str)
            //client.send("esp32/photocoordinates", str, 0, false);
            setPhotoB64(str)
            console.log("done");
            setLoading(false)
        })

    }

    const base64FotografGonder = (data) => {
        client.send("esp32/photocoordinates", data, 0, false);
        console.log("done");
        setLoading(false)
    }

    useFocusEffect(useCallback(() => {
        mapRef.current != null ? mapRef.current.reload() : null
    }, []))

    const calismaEkle = () => {
        if (photoB64 && (calismaKoor[0] != null && calismaKoor[1] != null && neden.length > 3)) {
            client.send("esp32/photocoordinates", `${calismaKoor[0]},${calismaKoor[1]},${photoB64}?${neden}`, 0, false);
        }
    }

    const rpiCalismaEkle = () => {
        client.send("esp32/photocoordinates", `${devreKoor[0]},${devreKoor[1]},${devicePhotoHash}?${neden}`, 0, false);
    }

    const koor = route.params.koor

    const onMessageArrived = (msg) => {
        client.unsubscribe("rpi/sendphoto");
        if (msg.topic == "rpi/sendphoto") {
            //console.log("rpi/sendphoto arrived", msg.payloadString.split(",")[msg.payloadString.split(",").length - 1])
            console.log("rpi/sendphoto", msg.payloadString.split(",")[0], msg.payloadString.split(",")[1])
            fetch(`https://nominatim.openstreetmap.org/search.php?q=${msg.payloadString.split(",")[0]},${msg.payloadString.split(",")[1]}&format=json`, { headers: { "Accept-Language": "tr" } }).then(response => response.json())
                .then(json => {
                    console.log("devrekonum", json[0]["display_name"]);
                    setDevreKonum(json[0]["display_name"])
                    setDevreKoor([parseFloat(msg.payloadString.split(",")[0]),parseFloat(msg.payloadString.split(",")[1])])
                }).catch(e => console.log("error", e))
            setDevicePhotoHash(msg.payloadString.split(",")[msg.payloadString.split(",").length - 1]);
            setLoading(false)
        }
    }

    client.onMessageArrived = onMessageArrived


    const getPhotoFromDevice = (devNum) => {
        client.subscribe("rpi/sendphoto");
        client.send("rpi/getphoto", devNum, 0, false);
    }

    if (device == null) return <Text>LOADING</Text>
    return (
        <ScrollView alwaysBounceVertical={false} style={{ backgroundColor: isDark ? "#1b1b1b" : "#fff" }} contentContainerStyle={{ minHeight: Dimensions.get("screen").height }}>
            <Spinner animation='fade' visible={loading} textContent={"Fotoğraf yükleniyor"} overlayColor={"#000000aa"} textStyle={{ fontSize: 24, fontWeight: "300" }} />
            <Modal visible={showDevices}>
                <ScrollView style={{ flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff" }}>
                    <TouchableOpacity style={{ marginLeft: 20, marginTop: 20, flexDirection: "row" }} onPress={() => {
                        setShowDevices(false);
                        setDeviceId("");
                    }}>
                        <CaretLeft size={32} style={{ alignSelf: "center" }} color={isDark ? "#fff" : "#000000"} />
                        <Text style={{ color: isDark ? "#fff" : "#000000", fontSize: 18, alignSelf: "center", marginLeft: 4 }}>Geri</Text>
                    </TouchableOpacity>

                    <View style={{ flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff", justifyContent: "center" }}>
                        <TextInput inputMode='numeric' style={{ marginLeft: 30, borderWidth: 2, borderColor: isDark ? "#262626" : "#d9d9d9", borderRadius: 8, width: "80%", marginTop: 16, color: isDark ? "#fff" : "#000" }} placeholder='Lütfen devrenin numarasını giriniz.' value={deviceId} onChangeText={(t) => setDeviceId(t)} />
                        <TouchableOpacity style={{ marginLeft: 30, borderWidth: 2, borderColor: isDark ? "#262626" : "#d9d9d9", borderRadius: 8, padding: 6, width: "80%", marginTop: 20, flexDirection: "row" }} onPress={() => {
                            if (deviceId.length > 0) {
                                setLoading(true)
                                getPhotoFromDevice(deviceId);
                            }
                        }}>
                            <ImageIcon size={32} style={{ alignSelf: "center" }} color={isDark ? "#fff" : "#000000"} />
                            <Text style={{ textAlign: "center", color: isDark ? "#fff" : "#000000", fontSize: 18, alignSelf: "center", marginLeft: 4 }}>{deviceId.length > 0 ? `${deviceId} nolu cihazdan fotoğraf` : "Cihazdan fotoğraf al"}</Text>
                        </TouchableOpacity>
                        <Image style={{ width: 320, height: 320, marginLeft: 30, marginTop: 16, resizeMode: "stretch", borderRadius: 12, display: devicePhotoHash ? null : "none" }} source={{ uri: `data:image/png;base64,${devicePhotoHash}`, cache: "only-if-cached", }} />

                        <View style={{marginLeft:30, marginTop:6}}>
                            <Text style={{ fontSize: 24, fontWeight:"bold", color: isDark ? "#fff" : "#000" }}>Devre konumu:</Text>
                            <Text style={{ fontSize: 18, color: isDark ? "#fff" : "#000" }}>{devreKonum}</Text>
                        </View>

                        <Text style={{ marginLeft: 30, color: isDark ? "#fff" : "#000000", fontSize: 24, fontWeight: "700", marginTop: 16 }}>Çalışma Nedeni</Text>
                        <TextInput style={{ marginLeft: 30, borderWidth: 2, borderColor: isDark ? "#262626" : "#d9d9d9", borderRadius: 8, width: "80%", marginTop: 16, color: isDark ? "#fff" : "#000" }} placeholder='Lütfen çalışma nedenini giriniz.' value={neden} onChangeText={(t) => setNeden(t)} />
                        <TouchableOpacity activeOpacity={(deviceId.length > 0) ? null : 0.3} onPress={rpiCalismaEkle} style={{ marginLeft: 30, marginTop: 16, marginBottom:32, opacity: (deviceId.length > 0) ? 1 : 0.3, flexDirection: "row", backgroundColor: isDark ? "#262626" : "#d9d9d9", width: "40%", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 6 }}>
                            <Warning size={24} color={isDark ? "#fff" : "#000"} />
                            <Text style={{ marginLeft: 6, color: isDark ? "#fff" : "#000", alignSelf: "center" }}>Yol çalışması ekle</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </Modal>

            <Modal visible={camVisible}>
                <View style={{ alignItems: "center", flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff", justifyContent: "center" }}>
                    <Camera
                        style={{ width: "80%", height: "75%", borderRadius: 36, marginTop: 25, backgroundColor: "#282828" }}
                        device={isFront ? frontdevice : device}
                        ref={camRef}
                        enableZoomGesture
                        isActive={isFocused}
                        photo
                        video={isFocused} />
                    <View style={{ flexDirection: "row", marginTop: 10, alignContent: "center", alignItems: "center", gap: 10 }}>
                        <TouchableOpacity onPress={() => {
                            launchImageLibrary({ includeBase64: true }, (response) => {
                                setLoading(true)
                                //console.log(response);
                                //base64FotografGonder(response.assets[0].base64)
                                setPhotoB64(response.assets[0].base64)
                                setCamVisible(false)
                                setLoading(false)
                            })
                        }} style={{ justifyContent: "center", alignItems: "center", alignSelf: "center" }}>
                            <ImageIcon size={32} style={{ alignSelf: "center" }} color={isDark ? "#fff" : "#000000"} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { setLoading(true); fotografGonder(); setCamVisible(false) }} style={{ justifyContent: "center", alignItems: "center", width: 32, height: 32, alignSelf: "center", borderRadius: 360, borderWidth: 5, borderColor: "#e05003", padding: 32, marginLeft: 50 }}>
                            <CamIcon size={32} style={{ alignSelf: "center" }} color={isDark ? "#fff" : "#000000"} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setIsFront(!isFront)} style={{ justifyContent: "center", alignItems: "center", alignSelf: "center", marginLeft: 50 }}>
                            <CameraRotate size={32} style={{ alignSelf: "center" }} color={isDark ? "#fff" : "#000000"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>



            <Modal animationType='fade' visible={showMap}>
                <View style={{ flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff" }}>
                    <TouchableOpacity style={{ marginLeft: 20, marginTop: 20, flexDirection: "row" }} onPress={() => {
                        setShowMap(false)
                    }}>
                        <CaretLeft size={32} color={isDark ? "#fff" : "#000000"} />
                        <Text style={{ color: isDark ? "#fff" : "#000000", fontSize: 18, alignSelf: "center", marginLeft: 10, fontWeight: "600" }}>Geri</Text>
                    </TouchableOpacity>
                    <WebView ref={mapRef} onMessage={
                        (msg) => {
                            console.log(msg.nativeEvent.data);
                            setCalismaKoor([parseFloat(msg.nativeEvent.data.split(",")[0]), parseFloat(msg.nativeEvent.data.split(",")[1])])
                            setShowMap(false)
                        }
                    } renderLoading={() => (<View style={{ flex: 1, width: "100%", height: "100%", position: "absolute", alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "#1b1b1b" : "#fff" }}>
                        <ActivityIndicator color={"#e05003"} />
                    </View>)} onLoad={() => mapRef.current.injectJavaScript(`mymap.setView([${koor[0]},${koor[1]}],18)`)} androidHardwareAccelerationDisabled androidLayerType='software' renderToHardwareTextureAndroid={true} containerStyle={{ flex: 1, borderRadius: 16, minWidth: 200, minHeight: 200, margin: 30, }} source={{ html: isDark ? html_script : html_script_light }} />
                </View>
            </Modal>





            <TouchableOpacity style={{ flexDirection: "row", marginLeft: 30, marginTop: 60 }} onPress={() => navigation.goBack()}>
                <CaretLeft color={isDark ? "#fff" : "#000000"} style={{ alignSelf: "center" }} size={26} />
                <Text style={{ color: isDark ? "#fff" : "#000000", textAlign: "center", alignSelf: "center" }}>Geri</Text>
            </TouchableOpacity>

            <Text style={{ marginLeft: 30, color: isDark ? "#fff" : "#000000", fontSize: 24, fontWeight: "700" }}>Devreden yol çalışması ekleme</Text>

            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 30 }}>
                <TouchableOpacity onPress={() => setShowDevices(true)} style={{ flexDirection: "row", backgroundColor: isDark ? "#262626" : "#d9d9d9", width: "30%", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 6, marginTop: 16 }}>
                    <Lightning size={24} color={isDark ? "#fff" : "#000"} />
                    <Text style={{ color: isDark ? "#fff" : "#000", alignSelf: "center", marginLeft: 6 }} >Cihaz seç</Text>
                </TouchableOpacity>
                <Check size={32} color='#32cd32' weight='bold' style={{ alignSelf: "center", marginLeft: 24, display: (calismaKoor[0] != null && calismaKoor[1] != null) ? null : "none" }} />
            </View>

            <Text style={{ marginLeft: 30, marginTop: 16, color: isDark ? "#fff" : "#000000", fontSize: 24, fontWeight: "700" }}>Yol çalışması konumu</Text>

            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 30, marginTop: 16 }}>
                <TouchableOpacity onPress={() => setShowMap(true)} style={{ flexDirection: "row", backgroundColor: isDark ? "#262626" : "#d9d9d9", width: "30%", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 6, marginTop: 16 }}>
                    <MapPin size={24} color={isDark ? "#fff" : "#000"} />
                    <Text style={{ color: isDark ? "#fff" : "#000", alignSelf: "center", marginLeft: 6 }} >Konum seç</Text>
                </TouchableOpacity>
                <Check size={32} color='#32cd32' weight='bold' style={{ alignSelf: "center", marginLeft: 24, display: (calismaKoor[0] != null && calismaKoor[1] != null) ? null : "none" }} />
            </View>

            <Text style={{ marginLeft: 30, color: isDark ? "#fff" : "#000000", fontSize: 24, fontWeight: "700", marginTop: 16 }}>Fotoğraf Yükleme</Text>

            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 30, marginTop: 16 }}>
                <TouchableOpacity onPress={() => { setCamVisible(true) }} style={{ flexDirection: "row", backgroundColor: isDark ? "#262626" : "#d9d9d9", width: "30%", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 6 }}>
                    <CamIcon size={24} color={isDark ? "#fff" : "#000"} />
                    <Text style={{ color: isDark ? "#fff" : "#000", alignSelf: "center", marginLeft: 6 }} >Fotoğrafla</Text>
                </TouchableOpacity>
                <Check size={32} color='#32cd32' weight='bold' style={{ alignSelf: "center", marginLeft: 24, display: photoB64 ? null : "none" }} />
            </View>

            <Image style={{ width: 80, height: 160, marginLeft: 30, marginTop: 16, resizeMode: "stretch", borderRadius: 12, display: photoB64 ? null : "none" }} source={{ uri: `data:image/png;base64,${photoB64}`, cache: "only-if-cached", }} />


            <Text style={{ marginLeft: 30, color: isDark ? "#fff" : "#000000", fontSize: 24, fontWeight: "700", marginTop: 16 }}>Çalışma Nedeni</Text>
            <TextInput style={{ marginLeft: 30, borderWidth: 2, borderColor: isDark ? "#262626" : "#d9d9d9", borderRadius: 8, width: "80%", marginTop: 16, color: isDark ? "#fff" : "#000" }} placeholder='Lütfen çalışma nedenini giriniz.' value={neden} onChangeText={(t) => setNeden(t)} />

            <TouchableOpacity activeOpacity={(photoB64 && (calismaKoor[0] != null && calismaKoor[1] != null && neden.length > 3)) ? null : 0.3} onPress={calismaEkle} style={{ marginLeft: 30, marginTop: 16, opacity: (photoB64 && (calismaKoor[0] != null && calismaKoor[1] != null && neden.length > 3)) ? 1 : 0.3, flexDirection: "row", backgroundColor: isDark ? "#262626" : "#d9d9d9", width: "40%", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 6 }}>
                <Warning size={24} color={isDark ? "#fff" : "#000"} />
                <Text style={{ marginLeft: 6, color: isDark ? "#fff" : "#000", alignSelf: "center" }}>Yol çalışması ekle</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

export default AddWorkPage;