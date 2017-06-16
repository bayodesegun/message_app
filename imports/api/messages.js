import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
 
export const Messages = new Mongo.Collection('messages');

Meteor.methods({
  'messages.remove'(messageId) {
    check(messageId, String);
 
    Messages.remove(messageId);
  },  
});