import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker'


//in order to use any schema u should import its js file 
//import { databaseExemple } from '../../database/template';


//import html and css files of this component
import mobileTemplate from './mobile.html';
import './mobile.css';


class EmptyState {
    constructor($scope, $reactive) {
        'ngInject';
        $reactive(this).attach($scope);
        var vm = this;
        /*
            the logic of the component should be encapsuled here 
         */
        vm.init = () => {
            $('.uiViewContainer').css('visibility', 'hidden');
        }
    }
}

const name = 'emptyState';
const template = mobileTemplate;
//create a module
export default angular.module(name, [
    angularMeteor,
]).component(name, {
    template,
    controllerAs: name,
    controller: EmptyState
})