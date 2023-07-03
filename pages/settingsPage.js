import React, { useCallback, useEffect } from 'react';
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
    Switch,
    Linking,
    ScrollView,
    Image,
    Modal,
    Platform,
    Appearance,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { Faders, Bell, NavigationArrow, Envelope, Lifebuoy, SignOut, MaskSad } from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

const isDark = Appearance.getColorScheme() == "dark"

const SettingsPage = ({ navigation, route }) => {
    const [showBildirimler, setShowBildirimler] = useState(false)
    const [bildirimAcik, setBildirimAcik] = useState(false)
    const [username, setUsername] = useState(null)

    const handleBildirim = async () => {
        const bildirim = await AsyncStorage.getItem("bildirim");
        console.log("bildirim", bildirim);
        if (bildirim == null) {
            await AsyncStorage.setItem("bildirim", "true")
        } else {
            setBildirimAcik(bildirim == "true")
        }
    }

    const setBildirim = async () => {
        let bildirim = await AsyncStorage.getItem("bildirim");
        console.log("bildirim-", !bildirim == "true");
        await AsyncStorage.setItem("bildirim", (bildirim != "true").toString())
        setBildirimAcik(!(bildirim == "true"));
        (!(bildirim == "true")) ? messaging().subscribeToTopic("all") : messaging().unsubscribeFromTopic("all")
    }

    const handleUsername = async () => {
        const login = await AsyncStorage.getItem("login");
        setUsername(JSON.parse(login).username)
    }

    useFocusEffect(useCallback(() => {
        handleBildirim()
        handleUsername()
    }, []))

    const signOut = async () => {
        await AsyncStorage.removeItem("login");
        navigation.navigate("LoginPage");
    }

    return (
        <SafeAreaView style={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", flex: 1 }}>
            <Modal visible={showBildirimler} onRequestClose={() => { setShowBildirimler(false); }} transparent style={{ alignItems: "center", justifyContent: "center" }}>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#000000bb" }}>
                    <View style={{ alignSelf: "center", width: "70%", alignItems: "center", height: "40%", borderRadius: 16, backgroundColor: isDark ? "#1b1b1b" : "#fff", alignItems: "center", justifyContent: "center" }}>
                        <TouchableOpacity onPress={() => { setBildirim(); setTimeout(() => setShowBildirimler(false), 300) }} style={{ backgroundColor: isDark ? "#262626" : "#d9d9d9", padding: 24, borderRadius: 6 }}>
                            <Text style={{ color: isDark ? "#fff" : "#000" }}>Bildirimleri {bildirimAcik ? "kapat" : "aç"}</Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ fontWeight: "bold", color: isDark ? "white" : "black", marginRight: 6 }}>Bildirimler</Text>
                            <Switch onValueChange={() => { setBildirim(); setTimeout(() => setShowBildirimler(false), 300) }} value={bildirimAcik} />
                        </View>
                    </View>
                </View>
            </Modal>
            <ScrollView>

                <TouchableOpacity>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <Image source={require("../pp.png")} style={{ width: 37, height: 37 }} />
                        <View style={{ marginLeft: 18 }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000000" }}>{username}</Text>
                            <Text style={{ fontWeight: "400", color: isDark ? "#a8a8a8" : "#575757" }}>S-Road Kullanıcısı</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/*}

                <TouchableOpacity>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <Faders size={43} color={isDark ? "#fff" : "#000000"} />
                        <View style={{ marginLeft: 18 }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000000" }}>Tercihler</Text>
                            <Text style={{ fontWeight: "400", color: isDark ? "#a8a8a8" : "#575757" }}>Ölçü birimi</Text>
                        </View>
                    </View>
                </TouchableOpacity>
    {*/} 
        {/* TODO: SİL! */}
                <TouchableOpacity>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <MaskSad size={43} color={isDark ? "#fff" : "#000000"} />
                        <View style={{ marginLeft: 18 }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000000" }}>Niye Bize Ödül Vermediniz?</Text>
                            <Text style={{ fontWeight: "400", color: isDark ? "#a8a8a8" : "#575757" }}>Alçak jüriler</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                    setShowBildirimler(true);
                }}>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <Bell size={43} color={isDark ? "#fff" : "#000000"} />
                        <View style={{ marginLeft: 18 }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000000" }}>Bildirimler</Text>
                            <Text style={{ fontWeight: "400", color: isDark ? "#a8a8a8" : "#575757" }}>Bildirimler</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                {/*}
                <TouchableOpacity>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <NavigationArrow size={43} color={isDark ? "#fff" : "#000000"} />
                        <View style={{ marginLeft: 18 }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000000" }}>Konum</Text>
                            <Text style={{ fontWeight: "400", color: isDark ? "#a8a8a8" : "#575757" }}>Yenileme sıklığı</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            {*/}

                <TouchableOpacity onPress={() => { Linking.openURL("mailto:a.efe.akyazi@gmail.com") }}>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <Envelope size={43} color={isDark ? "#fff" : "#000000"} />
                        <View style={{ marginLeft: 18, justifyContent: "center", alignItems: "center", paddingTop: 10 }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000000" }}>Bize Ulaşın</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => Linking.openURL("http://delorian.me/")}>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <Lifebuoy size={43} color={isDark ? "#fff" : "#000000"} />
                        <View style={{ marginLeft: 18, alignItems: "center", justifyContent: "center", marginTop: 10 }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000000", textAlignVertical: "center" }}>Yardım Merkezi</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={signOut}>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <SignOut size={43} color={isDark ? "#fff" : "#000000"} />
                        <View style={{ marginLeft: 18, alignSelf: "center" }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000000", paddingTop: 10 }}>Çıkış yap</Text>
                        </View>
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

export default SettingsPage;