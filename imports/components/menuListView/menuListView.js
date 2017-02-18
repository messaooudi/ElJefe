import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session'

//in order to use any schema u should import its js file 
import { Menu } from '../../database/menu';

//import html and css files of this component
import mobileTemplate from './mobile.html';
import './mobile.css';


class MenuListView {
    constructor($scope, $reactive, $interval) {
        'ngInject';
        $reactive(this).attach($scope);
        var vm = this;

        vm.helpers({
            waitingMenu() {
                return Session.get("waitingMenu")
            }
        })

        vm.helpers({
            menu() {
                return Menu.find({});
            }
        })

        vm.init = () => {

        }

        vm.intervalTimer;
        vm.deleteTimer = 5;
        vm.selectedItemId = '';
        vm.remove = (item) => {
            $interval.cancel(vm.intervalTimer);
            vm.selectedItemId = item._id;
            vm.deleteTimer = 4;
            vm.intervalTimer = $interval(() => {
                vm.deleteTimer--;
                if (vm.deleteTimer == 0) {
                    $interval.cancel(vm.intervalTimer);
                    vm.deleteTimer = 5;
                    vm.selectedItemId = "";
                }
            }, 1000)

        }
        vm.submitRemove = function (item) {
            Menu.remove({ _id: item._id })
            $interval.cancel(vm.intervalTimer);
            vm.deleteTimer = 5;
            vm.selectedItemId = "";
        }
    }
}

const name = 'menuListView';
const template = mobileTemplate;
//create a module
export default angular.module(name, [
    angularMeteor,
]).component(name, {
    template,
    controllerAs: name,
    controller: MenuListView
})