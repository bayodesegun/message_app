import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import './message_list.js';
import './body.html';

// subscribe to message digest
Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('messages');
});

Template.body.helpers({
  user() {
    if (Meteor.user()) {
    	return Meteor.user().emails[0].address;
    }
	else {
		return "guest";
	}
  },
  welcomeMsg() {
    if (Meteor.user()) {
    	return 'You can see current messages and add or remove your own messages.';
    }
	else {
		return 'Please sign in or sign up to see current messages and add or remove your own messages.';
	}
  },
});