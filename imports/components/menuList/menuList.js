import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';


//in order to use any schema u should import its js file 
//import { databaseExemple } from '../../database/template';

import { name as MenuListView } from '../menuListView/menuListView'


//import html and css files of this component
import mobileTemplate from './mobile.html';
import './mobile.css';


class MenuList {
    constructor($scope, $reactive, $state) {
        'ngInject';
        $reactive(this).attach($scope);
        var vm = this;
        vm.state = $state; //to be able to use it in the view
        /*
            the logic of the component should be encapsuled here 
         */



        vm.init = () => {
            $('.uiViewContainer').css('visibility', 'visible');
        }

        
        vm.navigate = () => {
            switch (vm.state.current.name) {
                case 'menuList.view':
                    $state.go('menuList.add');
                    break;
                case 'menuList.add':
                    $state.go('menuList.view');
                    break;
            }
        }

        vm.back = () => {
            $('.uiViewContainer').css('visibility', 'hidden');
            $state.go('emptyState');
        }
    }

}

const name = 'menuList';
const template = mobileTemplate;
//create a module
export default angular.module(name, [
    angularMeteor,
    MenuListView,
]).component(name, {
    template,
    controllerAs: name,
    controller: MenuList
})