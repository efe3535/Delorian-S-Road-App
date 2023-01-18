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
    Switch,
    ScrollView,
    Image,
    Modal,
    Platform,
    Appearance,
} from 'react-native';

import { Faders, Bell, NavigationArrow, Envelope, Lifebuoy, SignOut } from 'phosphor-react-native';

const isDark = Appearance.getColorScheme() == "dark"

const SettingsPage = ({ navigation, route }) => {

    const SettingsItem = (props) => {
        return (
            <View style={{ width: "100%", height: 300, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                {(props.leftComponent)}
                <View style={{ marginLeft: 18 }}>
                    <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000" }}>{props.header}</Text>
                    <Text style={{ fontWeight: "400", color: isDark ? "#a8a8a8" : "#575757" }}>{props.description}</Text>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={{ backgroundColor: isDark ? "#1b1b1b" : "#fff", flex: 1 }}>
            <ScrollView>
                <TouchableOpacity>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <Image source={require("../pp.png")} style={{ width: 37, height: 37 }} />
                        <View style={{ marginLeft: 18 }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000" }}>test</Text>
                            <Text style={{ fontWeight: "400", color: isDark ? "#a8a8a8" : "#575757" }}>S-Road Kullanıcısı</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <Faders size={43} color={isDark ? "#fff" : "#000"} />
                        <View style={{ marginLeft: 18 }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000" }}>Tercihler</Text>
                            <Text style={{ fontWeight: "400", color: isDark ? "#a8a8a8" : "#575757" }}>Ölçü birimi</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <Bell size={43} color={isDark ? "#fff" : "#000"} />
                        <View style={{ marginLeft: 18 }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000" }}>Bildirimler</Text>
                            <Text style={{ fontWeight: "400", color: isDark ? "#a8a8a8" : "#575757" }}>Bildirimler</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <NavigationArrow size={43} color={isDark ? "#fff" : "#000"} />
                        <View style={{ marginLeft: 18 }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000" }}>Konum</Text>
                            <Text style={{ fontWeight: "400", color: isDark ? "#a8a8a8" : "#575757" }}>Yenileme sıklığı</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <Envelope size={43} color={isDark ? "#fff" : "#000"} />
                        <View style={{ marginLeft: 18, justifyContent:"center", alignItems:"center", paddingTop:10 }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000" }}>Bize Ulaşın</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <Lifebuoy size={43} color={isDark ? "#fff" : "#000"} />
                        <View style={{ marginLeft: 18, alignItems:"center", justifyContent:"center", marginTop:10 }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000",textAlignVertical:"center" }}>Yardım Merkezi</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity>
                    <View style={{ width: "100%", height: 60, padding: 15, marginLeft: 30, marginTop: 30, flexDirection: "row" }}>
                        <SignOut size={43} color={isDark ? "#fff" : "#000"} />
                        <View style={{ marginLeft: 18, alignSelf:"center" }}>
                            <Text style={{ fontWeight: "600", color: isDark ? "#fff" : "#000",paddingTop:10 }}>Çıkış yap</Text>
                        </View>
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

export default SettingsPage;