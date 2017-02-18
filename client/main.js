import angular from 'angular';
import { Meteor } from 'meteor/meteor';


import '/public/CDN/jquery/jquery-3.1.1.min.js'

import '/public/CDN/bootstrap/css/bootstrap.min.css'
import '/public/CDN/bootstrap/js/bootstrap.min.js'

import './font-awesome/css/font-awesome.min.css'


import '/public/CDN/leaftlet/leaflet.min.js'
import '/public/CDN/leaftlet/leaflet.css'


import '/public/CDN/leaflet-routing-machine/js/leaflet-routing-machine.min.js'
import '/public/CDN/leaflet-routing-machine/css/leaflet-routing-machine.css'


import '/public/CDN/Leaflet-awesome-markers/js/leaflet-awesome-markers.min.js'
import '/public/CDN/Leaflet-awesome-markers/css/leaflet-awesome-markers.css'

import '/public/CDN/paho/mqttws31.min.js'


import './index.css';



import { Menu } from '../imports/database/menu';

import { name as Main } from '../imports/components/main/main';



client = new Paho.MQTT.Client('broker.mqttdashboard.com', 8000, "NAYOTGSEIR" + Math.floor((Date.now()*Math.random())));
connected = false;


Meteor.startup(function () {
    Meteor.disconnect();

    client.connect({ onSuccess: onConnect });
    function onConnect() {
        client.subscribe("NAYOTSnack/menu");
        client.subscribe("NAYOTSnack/position");
        client.subscribe("NAYOTSnack/menu/checksum");
        client.subscribe("NAYOTSnack/ping");
        alert('connection established')
        connected = true;
    }

    client.onConnectionLost = onConnectionLost;
    function onConnectionLost(responseObject) {
        connected = false;
        alert('connection lost !!\nplease wait a second or restart the app')
        client.connect({ onSuccess: onConnect });
    }

    setInterval(() => {
        if (connected) {
            let pos = Location.getReactivePosition() || Location.getLastPosition() || { latitude: 34.68139, longitude: -1.90858 };
            let message = new Paho.MQTT.Message(JSON.stringify({id : client.clientId ,latitude: pos.latitude, longitude: pos.longitude }));
            message.destinationName = "NAYOTSnack/client/position";
            client.send(message);
        }
    }, 5000)
});


function onReady() {
    angular.bootstrap(document, [
        Main
    ], {
            strictDi: true
        });
}

if (Meteor.isCordova) {
    angular.element(document).on('deviceready', onReady);
} else {
    angular.element(document).ready(onReady);
}