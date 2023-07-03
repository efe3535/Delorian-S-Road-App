import React, { useCallback, useEffect } from 'react';
import { useState, useRef } from "react";
import type { Node } from 'react';

import {
    SafeAreaView,
    Text,
    StatusBar,
    TouchableOpacity,
    View,
    Image,
    Modal,
    ImageBackground,
    Appearance,
    ScrollView,
    Platform,
    ActivityIndicator,
    useColorScheme,
    Dimensions
} from 'react-native';
import messaging from "@react-native-firebase/messaging"


import AsyncStorage from '@react-native-async-storage/async-storage';

import Spinner from 'react-native-loading-spinner-overlay';
import { WebView } from 'react-native-webview';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CaretRight, NavigationArrow, Warning, Calendar, CalendarBlank, Repeat, ArrowRight } from "phosphor-react-native"
import { Svg, Path, Rect, Line } from "react-native-svg"
import { PermissionsAndroid } from 'react-native'
import { TextInput } from 'react-native-gesture-handler';
import { sha256 } from "react-native-sha256"
import LinearGradient from 'react-native-linear-gradient';
import ip from "../ip"
import { log } from 'react-native-reanimated';

const LoginPage = ({ navigation, route }) => {

    const isDark = useColorScheme() === "dark";
    const [registerVisible, setRegisterVisible] = useState(false)
    const [loginVisible, setLoginVisible] = useState(false)
    const [unameInput, setUnameInput] = useState("")
    const [passInput, setPassInput] = useState("")

    const handleRegister = async () => {
        console.log(sha256(passInput))
        const shasum = await sha256(passInput)
        const resp = await fetch(`http://${ip}:3366/register`, {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: unameInput, pass: shasum }),
        })

        const json = await resp.json()

        if (json.status == "success") {
            await AsyncStorage.setItem("login", JSON.stringify({ username: unameInput }))
            navigation.navigate("Home", {isci:false});
        }
        console.log(JSON.stringify(json), { username: unameInput, pass: shasum })
        await setUnameInput("")
        await setPassInput("");
    }

    const setIsciAsyncStorage = async (status) => {
        await AsyncStorage.setItem("isci", status==true ? "true" : "false")
    }

    const handleLogin = async () => {
        console.log(passInput)
        const shasum = await sha256(passInput)
        const resp = await fetch(`http://${ip}:3366/login`, {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: unameInput, pass: shasum }),
        })

        const json = await resp.json()

        if (json.status == "success") {
            await AsyncStorage.setItem("login", JSON.stringify({ username: unameInput }))
            fetch(
                `http://${ip}:3366/isci`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        username: unameInput
                    })
                }
            ).then(resp => resp.json())
                .then(json => {
                    console.log("json.isci",json.isci)
                    setIsciAsyncStorage(json.isci)
                navigation.navigate("Home", {isci:json.isci});
                })
            setLoginVisible(false)
        } else {

        }

        setUnameInput(""); setPassInput("");
    }

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff", alignItems: "center", height: "100%" }}>
            <ImageBackground style={{ flex: 1, height: Dimensions.get("screen").height, width: Dimensions.get("screen").width, alignItems: "center", zIndex: 0 }} source={require("../assets/background.png")}>
                <StatusBar tranlucent backgroundColor={"transparent"} barStyle={"light-content"} />
                <Modal visible={loginVisible}>
                    <View style={{ flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff", padding: 16, justifyContent: "center" }}>
                        <Text style={{ fontSize: 36, color: isDark ? "#fff" : "#000", fontWeight: "bold" }}>Giriş Yap</Text>
                        <Text style={{ fontSize: 20, color: isDark ? "#fff" : "#000", marginTop: 10 }} >Giriş için Kullanıcı adı</Text>
                        <TextInput autoCapitalize='none' placeholder='Kullanıcı adı' value={unameInput} onChangeText={t => setUnameInput(t)} style={{ color: isDark ? "#fff" : "#000", borderWidth: 2, marginTop: 10, padding: 15, borderRadius: 16, borderColor: isDark ? "#262626" : "#d9d9d9" }} />
                        <Text style={{ fontSize: 20, color: isDark ? "#fff" : "#000", marginTop: 10 }} >Giriş için şifre</Text>
                        <TextInput placeholder='Şifreniz' value={passInput} secureTextEntry autoCapitalize='none' importantForAutofill='no' onChangeText={t => setPassInput(t)} style={{ color: isDark ? "#fff" : "#000", borderWidth: 2, marginTop: 10, padding: 15, borderRadius: 16, borderColor: isDark ? "#262626" : "#d9d9d9" }} />
                        <View style={{ alignItems: "center", marginTop: 32 }}>
                            <TouchableOpacity onPress={() => { handleLogin(); }} style={{ backgroundColor: "#e05003", height: 60, flexDirection: "row", marginBottom: 16, borderWidth: 2, borderColor: isDark ? "#262626" : "#d9d9d9", borderRadius: 56, width: "80%", alignItems: "center", justifyContent: "center" }}>
                                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "500" }}>Giriş Yap</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>

                <Modal visible={registerVisible}>
                    <View style={{ flex: 1, backgroundColor: isDark ? "#1b1b1b" : "#fff", padding: 16, justifyContent: "center" }}>
                        <Text style={{ fontSize: 36, color: isDark ? "#fff" : "#000", fontWeight: "bold" }}>Kayıt Ol</Text>
                        <Text style={{ fontSize: 20, color: isDark ? "#fff" : "#000", marginTop: 10 }} >Kayıt için Kullanıcı adı</Text>
                        <TextInput autoCapitalize='none' placeholder='Kullanıcı adı' value={unameInput} onChangeText={t => setUnameInput(t)} style={{ color: isDark ? "#fff" : "#000", borderWidth: 2, marginTop: 10, padding: 15, borderRadius: 16, borderColor: isDark ? "#262626" : "#d9d9d9" }} />
                        <Text style={{ fontSize: 20, color: isDark ? "#fff" : "#000", marginTop: 10 }} >Kayıt için şifre</Text>
                        <TextInput placeholder='Şifreniz' value={passInput} secureTextEntry autoCapitalize='none' importantForAutofill='no' onChangeText={t => setPassInput(t)} style={{ color: isDark ? "#fff" : "#000", borderWidth: 2, marginTop: 10, padding: 15, borderRadius: 16, borderColor: isDark ? "#262626" : "#d9d9d9" }} />
                        <View style={{ alignItems: "center", marginTop: 32 }}>
                            <TouchableOpacity onPress={() => { setRegisterVisible(false); handleRegister(); }} style={{ backgroundColor: "#e05003", height: 60, flexDirection: "row", marginBottom: 16, borderWidth: 2, borderColor: isDark ? "#262626" : "#d9d9d9", borderRadius: 56, width: "80%", alignItems: "center", justifyContent: "center" }}>
                                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "500" }}>Kayıt Ol</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>
                <LinearGradient colors={[isDark ? "#1b1b1b" : "#fff", isDark ? "#1b1b1bdd" : "#ffffffdd", "transparent"]} style={{ position: "absolute", height: 300 }}>
                    <View style={{ width: Dimensions.get("window").width, height: 200 }}></View>
                </LinearGradient>
                <View style={{ left: 0, width: "80%", height: "70%" }}>
                    <Svg
                        width={136}
                        style={{ marginTop: 100 }}
                        height={40}
                        viewBox="0 0 136 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <Path
                            d="M114.834 13.923h13.682a6.133 6.133 0 110 12.265h-13.682V13.923z"
                            stroke={isDark ? "#fff" : "#000"}
                            strokeWidth={2.70199}
                        />
                        <Rect
                            x={65.2981}
                            y={13.9233}
                            width={19.8146}
                            height={12.265}
                            rx={6.13252}
                            stroke={isDark ? "#fff" : "#000"}
                            strokeWidth={2.70199}
                        />
                        <Path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M55.332 15.274H41.13v5.822h14.202a2.91 2.91 0 000-5.822zM41.13 12.572h-2.702V27.54h2.702v-3.742h13.914l2.598 3.742h2.702l-2.871-4.164a5.614 5.614 0 00-2.14-10.803H41.13zM90.907 27.54h-2.942l9.367-14.968h3.783l9.366 14.967h-2.942l-2.248-3.592H93.155l-2.248 3.592zm3.747-5.988l3.934-6.286h1.27l3.934 6.286h-9.138z"
                            fill={isDark ? "#fff" : "#000"}
                        />
                        <Path
                            d="M16.726 10.936l5.58.214-4.107 5.157-1.473-5.37z"
                            fill="#E05003"
                        />
                        <Path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M20.951 12.37l-1.867 2.345c5.194 4.112 6.06 11.644 1.936 16.823-4.125 5.178-11.679 6.042-16.873 1.93L2.28 35.812c6.493 5.14 15.935 4.06 21.09-2.413 5.157-6.473 4.073-15.888-2.419-21.029z"
                            fill="#E05003"
                        />
                        <Path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M11.547 27.63l1.867-2.345c-5.194-4.112-6.06-11.644-1.936-16.823 4.125-5.178 11.679-6.042 16.872-1.93l1.867-2.344C23.725-.952 14.283.128 9.127 6.601c-5.156 6.473-4.072 15.888 2.42 21.029z"
                            fill="#000"
                        />
                    </Svg>
                    <Text style={{ fontSize: 36, fontWeight: "bold", color: isDark ? "#fff" : "#000" }}>A noktasından B noktasına gitmenin akıllı yolu.</Text>
                </View>

                <TouchableOpacity onPress={() => { setRegisterVisible(true) }} style={{ position: "absolute", bottom: 80, backgroundColor: "#e05003", height: 56, flexDirection: "row", marginBottom: 16, borderRadius: 56, width: "80%", alignItems: "center", justifyContent: "center", zIndex: 99 }}>
                    <ArrowRight size={36} color={"#fff"} />
                    <Text style={{ color: "#fff", fontSize: 18, fontWeight: "500" }}>Hesap Oluştur</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setLoginVisible(true) }} style={{ height: 56, bottom: 24, position: "absolute", backgroundColor: isDark ? "#1b1b1b" : "#fff", borderWidth: 2, borderColor: isDark ? "#262626" : "#d9d9d9", borderRadius: 56, width: "80%", alignItems: "center", justifyContent: "center", zIndex: 99 }}>
                    <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 18, fontWeight: "500" }}>Oturum Aç</Text>
                </TouchableOpacity>
                <LinearGradient colors={["transparent", isDark ? "#1b1b1bdd" : "#ffffffdd", isDark ? "#1b1b1b" : "#fff"]} style={{ position: "absolute", bottom: 0, zIndex: 1, height: 200 }}>
                    <View style={{ width: Dimensions.get("window").width, height: 200 }}></View>
                </LinearGradient>
            </ImageBackground>
        </View>
    )

}

export default LoginPage;