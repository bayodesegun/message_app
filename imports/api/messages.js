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
// Security check to ensure that 
// 1. A user is logged in
// 2. User can only set the 'message' key of the collection (server will handle the rest, thanks)
Messages.allow({
  insert: function (userId, doc) {
  	// Mr user needs only give us the message
  	if (Meteor.isClient) {
    	return Meteor.userId() && _.without(_.keys(doc), 'message').length === 0;
	}

	// server needs to add other keys to the collection, but a user must still be logged on
	return Meteor.userId(); 
  }
})

// Let the server do the adding of timestamp and user's email
if (Meteor.isServer) {
  Messages.before.insert(function (userId, doc) {
    doc.createdAt = (new Date()).toLocaleString();
    doc.owner = Meteor.user().emails[0].address;
 });
}