import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session'


//import Modules

import { name as Map } from '../map/map'
import { name as MenuList } from '../menuList/menuList'
import { name as EmptyState } from '../emptyState/emptyState'


//import html and css files of this component
import mobileTemplate from './mobile.html';
import './mobile.css';

class Main {
    constructor($scope, $reactive, $state) {
        'ngInject';
        $reactive(this).attach($scope);
        var vm = this;


        document.addEventListener("backbutton", onBackButtonDown, false);

        function onBackButtonDown(event) {
            event.preventDefault();
            event.stopPropagation();
            if ($state.current.name == 'menuList.add')
                $state.go('menuList.view');
            else
                $state.go('emptyState');
        }

        Location.getGPSState(function (state) {
            if (state === 'Enabled') {
            } else {
            }
        }, function () {
        }, { dialog: true })


        Location.startWatching(function (pos) {
        }, function (err) {
            //alert("Oops! There was an error" + JSON.stringify(err));
        });



        vm.menuListTrigger = {
            _show: true,
            loading: false,
            click: function () {
                let message = new Paho.MQTT.Message('1');
                message.destinationName = "NAYOTSnack/menu/get";
                if (connected)
                    client.send(message);
                Session.set("waitingMenu", 1);
            },
            show: function () {
                this._show = true;
            },
            hide: function () {
                this._show = false;
            }
        }

    }
}

const name = 'main';
const template = mobileTemplate;
//create a module
export default angular.module(name, [
    angularMeteor,
    uiRouter,
    MenuList,
    Map,
    EmptyState
]).component(name, {
    template,
    controllerAs: name,
    controller: Main
}).config(config); //to set the route config of this Component
function config($locationProvider, $urlRouterProvider, $stateProvider) {
    'ngInject';
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/'); //to set a default route in general used in a global context not in a component
    $stateProvider
        .state('menuList', {
            url: '/menuList',
            template: '<menu-list></menu-list>',
        }).
        state('menuList.view', {
            url: '/menuListView',
            template: '<menu-list-view></menu-list-view>',
        }).
        state('emptyState', {
            url: '/emptyState',
            template: '<empty-state></empty-state>',
        })
}