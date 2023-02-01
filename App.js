import React, { useEffect } from 'react';
import { useState, useRef } from "react";
import type { Node } from 'react';


import HomePage from "./pages/homePage"
import CameraPage from './pages/cameraPage';
import AddRoutePage from './pages/addRoutePage';
import RouteDetails from './pages/routeDetails';

import html_script from "./html_script"

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {
  SafeAreaView,
  Text,
  StatusBar,
  TouchableOpacity,
  View,
  Appearance
} from 'react-native';

import { House, MapTrifold, Warning, Bell, Gear, Camera } from "phosphor-react-native"
import WorkDetails from './pages/workDetails';
import RoutesPage from './pages/routes';
import RoadPage from './pages/roadWorks';
import SettingsPage from './pages/settingsPage';
import NotificationsPage from './pages/notificationsPage';

const isDark = Appearance.getColorScheme() == "dark"

const Stack = createBottomTabNavigator();

const HomeButton = (props) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={{ alignItems: "center", flex: 1, backgroundColor:  isDark?"#1b1b1b":"#fff", flexDirection: "column", justifyContent: "flex-end", padding: 2 }}
    onPress={props.onPress}
  >
    <House size={28} color={props.accessibilityState.selected ? "#e05003" : (isDark?"#fff":"#000")} weight= { props.accessibilityState.selected ? "fill" : "regular" }/>
    <Text style={{ textAlign: 'center', marginBottom: 15, color: props.accessibilityState.selected ? "#e05003" : (isDark?"#fff":"#000")}}>Ana Ekran</Text>
  </TouchableOpacity>
);

const RouteButton = (props) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={{ alignItems: "center", flex: 1, backgroundColor:  isDark?"#1b1b1b":"#fff", flexDirection: "column", justifyContent: "flex-end", padding: 2 }}
    onPress={()=>{props.onPress()}}
  >
  <MapTrifold size={28} color={props.accessibilityState.selected ? "#e05003" : (isDark?"#fff":"#000")} weight= { props.accessibilityState.selected ? "fill" : "regular" }/>
    <Text style={{ textAlign: 'center', marginBottom: 15, color: props.accessibilityState.selected ? "#e05003" : (isDark?"#fff":"#000"), }}>Rotalarınız</Text>
    </TouchableOpacity>
);
const RoadworkButton = (props) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={{ alignItems: "center", flex: 1, backgroundColor:  isDark?"#1b1b1b":"#fff", flexDirection: "column", justifyContent: "flex-end", padding: 2 }}
    onPress={()=>{props.onPress()}}
  >
  <Warning size={28} color={props.accessibilityState.selected ? "#e05003" : (isDark?"#fff":"#000")} weight= { props.accessibilityState.selected ? "fill" : "regular" }/>
    <Text style={{ textAlign: 'center', marginBottom: 15, color: props.accessibilityState.selected ? "#e05003" : (isDark?"#fff":"#000"), }}>Çalışmalar</Text>
    </TouchableOpacity>
);
const NotificationsButton = (props) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={{ alignItems: "center", flex: 1, backgroundColor:  isDark?"#1b1b1b":"#fff", flexDirection: "column", justifyContent: "flex-end", padding: 2 }}
    onPress={()=>{props.onPress()}}
  >
  <Bell size={28} color={props.accessibilityState.selected ? "#e05003" : (isDark?"#fff":"#000")} weight= { props.accessibilityState.selected ? "fill" : "regular" }/>
    <Text style={{ textAlign: 'center', marginBottom: 15, color: props.accessibilityState.selected ? "#e05003" : (isDark?"#fff":"#000"), }}>Bildirimler</Text>
    </TouchableOpacity>
);
const SettingsButton = (props) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={{ alignItems: "center", flex: 1, backgroundColor:  isDark?"#1b1b1b":"#fff", flexDirection: "column", justifyContent: "flex-end", padding: 2 }}
    onPress={()=>{props.onPress()}}
  >
  <Gear size={28} color={props.accessibilityState.selected ? "#e05003" : (isDark?"#fff":"#000")} weight= { props.accessibilityState.selected ? "fill" : "regular" }/>
    <Text style={{ textAlign: 'center', marginBottom: 15, color: props.accessibilityState.selected ? "#e05003" : (isDark?"#fff":"#000"), }}>Ayarlar</Text>
    </TouchableOpacity>
);

const App: () => Node = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark?"#1b1b1b":"#fff" }}>
      <StatusBar barStyle="light-content" backgroundColor={"#00000000"} translucent={true} showHideTransition="fade" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ 
          headerShown: false, 
          tabBarActiveBackgroundColor: isDark?"#363636":"#fff", 
          tabBarInactiveBackgroundColor: isDark?"#282828":"#fff" , 
          tabBarActiveTintColor: "#ebdbb2", 
          tabBarInactiveTintColor: "#a89984", 
          tabBarStyle: 
          { height: 80,
           borderTopWidth:0,
          }, 
        }}>
          <Stack.Screen name="Home" component={HomePage} options={{ tabBarButton: HomeButton }} />
          <Stack.Screen name="Routes" component={RoutesPage} options={{ tabBarButton: RouteButton }} />
          <Stack.Screen name="Roadwork" component={RoadPage} options={{ tabBarButton: RoadworkButton }} />
          <Stack.Screen name="Notifications" component={NotificationsPage} options={{ tabBarButton: NotificationsButton }} />
          <Stack.Screen name="Settings" component={SettingsPage} options={{ tabBarButton: SettingsButton }} />
          <Stack.Screen name="WorkDetails" component={WorkDetails} options={{tabBarStyle:{display:"none"}, tabBarShowLabel:false, tabBarItemStyle:{display:"none"}}} />
          <Stack.Screen name="AddPhoto" component={CameraPage} options={{tabBarStyle:{display:"none"}, tabBarShowLabel:false, tabBarItemStyle:{display:"none"}}} />
          <Stack.Screen name="AddRoute" component={AddRoutePage} options={{tabBarStyle:{display:"none"}, tabBarShowLabel:false, tabBarItemStyle:{display:"none"}}} />
          <Stack.Screen name="RouteDetails" component={RouteDetails} options={{tabBarStyle:{display:"none"}, tabBarShowLabel:false, tabBarItemStyle:{display:"none"}}} />

        </Stack.Navigator>

      </NavigationContainer>
    </SafeAreaView>
  )
};

export default App;
