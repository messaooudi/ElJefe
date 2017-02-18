import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session'

//in order to use any schema u should import its js file 
import { Menu } from '../../database/menu';


//import html and css files of this component
import mobileTemplate from './mobile.html';
import './mobile.css';


class Map {
    constructor($scope, $reactive, $interval) {
        'ngInject';
        $reactive(this).attach($scope);
        var vm = this;

        vm.intervalTimer;
        Session.set("waitingMenu", 0);
        vm.snackHorsLigne = true;
        L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';

        var currentMarkerIcon = L.AwesomeMarkers.icon({
            prefix: 'fa',
            icon: 'fa-user',
            markerColor: 'red'
        });
        var snackMarkerIcon = L.AwesomeMarkers.icon({
            prefix: 'fa',
            icon: 'fa-cutlery',
            markerColor: 'blue'
        });
        let currentMarker = L.marker([34.68139, -1.90858], { icon: currentMarkerIcon });
        let snackMarker = L.marker([34.68139, -1.90858], { icon: snackMarkerIcon })

        vm.showRouting = false;
        vm.showInstructions = false;
        vm.direction = {
            _show: false,
            totalDistance: '-',
            totalTime: '-',
            text: ''
        }
        var routing = {};
        var osrmBackEnd = {}

        vm.helpers({
            current() {
                let pos = Location.getReactivePosition() || Location.getLastPosition() || { latitude: 0, longitude: 0 };
                currentMarker.setLatLng([pos.latitude, pos.longitude]);
                currentMarker.update();
                if (vm.showRouting) {
                    routing.setWaypoints([
                        L.latLng(vm.current.latitude, vm.current.longitude),
                        L.latLng(vm.snackPosition.latitude, vm.snackPosition.longitude)
                    ])
                }
                return pos;
            }
        });

        vm.snackPosition = { latitude: 34.68139, longitude: -1.90858 }

        client.onMessageArrived = onMessageArrived;
        function onMessageArrived(message) {
            switch (message.destinationName) {
                case 'NAYOTSnack/position':
                    vm.snackPosition = JSON.parse(message.payloadString);
                    snackMarker.setLatLng([vm.snackPosition.latitude, vm.snackPosition.longitude]);
                    snackMarker.update();

                    if (vm.showRouting) {
                        routing.setWaypoints([
                            L.latLng(vm.current.latitude, vm.current.longitude),
                            L.latLng(vm.snackPosition.latitude, vm.snackPosition.longitude)
                        ])
                    }

                    $interval.cancel(vm.intervalTimer);
                    vm.intervalTimer = $interval(() => {
                        vm.snackHorsLigne = true;
                    }, 5000)
                    $scope.$apply(() => {
                        vm.snackHorsLigne = false;
                    })
                    break;
                case 'NAYOTSnack/menu/checksum':
                    if (JSON.stringify(Menu.find({}).fetch()).length + '' != message.payloadString) {
                        let message = new Paho.MQTT.Message('0');
                        message.destinationName = "NAYOTSnack/menu/get";
                        if (connected)
                            client.send(message);
                        Session.set("waitingMenu", 1);
                    } else {
                        Session.set("waitingMenu", 0);
                    }
                    break;
                case 'NAYOTSnack/menu':
                    Session.set("waitingMenu", 0);
                    let data = JSON.parse(message.payloadString);
                    Menu.remove({});
                    data.forEach((item) => {
                        item._id = undefined;
                        Menu.insert(item)
                    })
                    break;
                case 'NAYOTSnack/ping':
                    break;
            }
        }

        //Map SetUp
        let markersLayer = L.featureGroup([currentMarker, snackMarker]);
        let map = L.map('map', { zoomControl: false });
        L.control.zoom({
            position: 'topright'
        }).addTo(map);
        L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWVzc2FvdWRpb3Vzc2FtYSIsImEiOiJjaXQ2MjBqdHQwMDFsMnhxYW9hOW9tcHZoIn0.uX-ZR_To6tzxUpXmaVKOnQ', {
        }).addTo(map);
        map.once('load', () => {
            markersLayer.addTo(map);

            osrmBackEnd = L.Routing.osrmv1({ useHints: false });//serviceUrl: 'http://127.0.0.1:5000/route/v1', useHints: false });

            routing = L.Routing.control({
                router: osrmBackEnd,
                waypoints: [],
                show: false,
                collapsibcollapseBtnle: () => { return null },
                draggableWaypoints: false,
                addWaypoints: false,
                fitSelectedRoutes: false,
                showAlternatives: true,
                lineOptions: { styles: [{ color: 'black', opacity: 0.15, weight: 9 }, { color: 'white', opacity: 0.8, weight: 6 }, { color: 'blue', opacity: 1, weight: 3 }] },
                altLineOptions: { styles: [{ color: 'black', opacity: 0.15, weight: 9 }, { color: 'white', opacity: 0.8, weight: 6 }, { color: 'red', opacity: 0.9, weight: 2 }] },
                createMarker: function () { return null; }
            });
            routing.addTo(map);
            routing.on('routeselected', function (e) {
                //var coord = e.route.coordinates;
                var instr = e.route.instructions;

                var formatter = new L.Routing.Formatter({ language: 'fr' });

                $scope.$apply(() => {
                    vm.direction.text = formatter.formatInstruction(instr[(instr.length < 3) ? 1 : 0]) + " (" + formatter.formatDistance(instr[0].distance) + ")";
                })
            });
            routing.on('routesfound', (e) => {
                $scope.$apply(() => {
                    vm.direction._show = true;
                    vm.direction.totalDistance = e.routes[0].summary.totalDistance / 1000 > 1 ? (e.routes[0].summary.totalDistance / 1000).toFixed(2) + " Km" : (e.routes[0].summary.totalDistance).toFixed(1) + " Métres";
                    let duration = new Date(e.routes[0].summary.totalTime * 1000);
                    let hh = duration.getUTCHours();
                    let mm = duration.getUTCMinutes();
                    let ss = duration.getSeconds();
                    vm.direction.totalTime = (hh > 0 ? hh + " heurs et " : "") + (mm > 0 ? mm + " minutes" : "") + ((hh == 0 && mm == 0) ? ss + " secondes." : ".");
                })
            })
        }).setView([vm.current.latitude, vm.current.longitude], 13);


        vm.itineraire = {
            _show: true,
            loading: false,
            click: function () {
                vm.showRouting = !vm.showRouting;
                if (!vm.showRouting) {
                    routing.setWaypoints([]);
                    vm.direction._show = false;
                }
            },
            show: function () {
                this._show = true;
            },
            hide: function () {
                this._show = false;
            }
        }

        vm.location = () => {
            map.fitBounds(markersLayer.getBounds())
        }

        vm.toggleInstructions = () => {
            if (vm.showInstructions) {
                routing.hide();
                $('.leaflet-routing-container').hide();
            }
            else {
                $('.leaflet-routing-container').show();
                routing.show();
            }
            vm.showInstructions = !vm.showInstructions;
        }

        /*
            the logic of the component should be encapsuled here 
         */

    }
}

const name = 'map';
const template = mobileTemplate;
//create a module
export default angular.module(name, [
    angularMeteor,
]).component(name, {
    template,
    controllerAs: name,
    controller: Map
})