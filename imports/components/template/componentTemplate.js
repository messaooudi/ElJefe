import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker'


//in order to use any schema u should import its js file 
//import { databaseExemple } from '../../database/template';


//import html and css files of this component
import mobileTemplate from './mobile.html';
import './mobile.css';


class Component {
    constructor($scope, $reactive) {
        'ngInject';
        $reactive(this).attach($scope);
        var vm = this;

        /*
            the logic of the component should be encapsuled here 
         */

    }
}

const name = 'component';
const template = mobileTemplate;
//create a module
export default angular.module(name, [
    angularMeteor,
])