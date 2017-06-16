import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { check } from 'meteor/check';
import { Messages } from '../api/messages.js';
import './message_list.html';

Template.message_list.helpers({
  messages() {
    return Messages.find({}, { sort: { createdAt: -1 } });
  },
});

Template.message_list.events({
  'submit .post-message'(event) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get value from form element
    const target = event.target;
    const message = target.message.value;

    if(!message) {
    	alert('Please enter a message to post.');
    	return;
    }

    check(message, String);
 
    // Insert a message
    Messages.insert({
      message,
      createdAt: (new Date()).toLocaleString(), // current DateTime
      // owner: Meteor.userId(),
    });
 
    // Clear form
    target.message.value = '';
  },

  'click .delete-message'(event) {
    // Prevent link, if any, from being followed
    event.preventDefault();
 
    // Get the id value of clicked link
    const target = event.target;
    const id = target.id;
 
    // Call meteor method to delete the message
   	Meteor.call('messages.remove', id);
  },
});