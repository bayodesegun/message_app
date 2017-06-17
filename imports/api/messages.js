import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { throwError } from '../../lib/globals.js';
 
export const Messages = new Mongo.Collection('messages');

// explicitly publish messages to clients
if (Meteor.isServer) {
  Meteor.publish('messages', function messagesPublication() {
    return Messages.find();
  });
}

// Define server-only method for removing messages
// Ensures that user can only remove own messages 
Meteor.methods({
  'messages.remove' (messageId) {
    check(messageId, String);
    const message = Messages.findOne(messageId);    
 	if (message.ownerId !== this.userId) {
 		return throwError(403, 'unauthorized');
 	}
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