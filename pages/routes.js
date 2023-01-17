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
    Platform,
} from 'react-native';

const RoutesPage = ({ navigation, route }) => {
    return (
        <SafeAreaView style={{ backgroundColor: "#121212", flex: 1, alignContent: "center", alignItems: "center", justifyContent: "center" }}>
            <Text>ROUTES</Text>
        </SafeAreaView>
    );
}

export default RoutesPage;