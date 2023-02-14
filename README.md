# S-Road Uygulaması
## **zorunlu** - Server da çalıştırmanız gerek, https://github.com/efe3535/Delorian-S-Road-Server

## _opsiyonel_  - Firebase ile bildirimlerden yararlanmak
 Ek olarak bildirim özelliklerinden yararlanabilmek için bir Firebase uygulaması oluşturup konfigüre etmeli, google-services.json dosyasını elde edip android/app/ konumuna yerleştirmelisiniz. 

## Server kurulumu

ip.js dosyasına server ip'nizi giriniz, port 1883 alınmıştır (default) websockets bağlantıları için 1923 portu kullanılmıştır.

build etmek için
`npx react-native start` ile metro sunucunuzu baslatin
`npx react-native run-android --variant=release` ile release modunda build edip emulatorunuze / fiziksel cihaziniza apk'yi yukleyin
