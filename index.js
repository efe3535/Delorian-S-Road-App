/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
const checkBildirim = async ( ) => {
  const bildirim = await AsyncStorage.getItem("bildirim")
  if(bildirim=="true") {
    messaging().subscribeToTopic("all")
  } else {
    console.log("Bildirim yok.")
    messaging().unsubscribeFromTopic("all")
  }
}

checkBildirim();

AppRegistry.registerComponent(appName, () => App);
