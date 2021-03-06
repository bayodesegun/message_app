import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { throwError } from '../../lib/globals.js';
import { Factory } from 'meteor/dburles:factory';
import faker from 'faker';
 
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

  // for testing purposes
  'dropDatabase' () {
    if (process.env.NODE_ENV === 'development') {
      Meteor.users.remove({});
      Messages.remove({});
    } else {
      console.log('Can only drop the database in development mode');
    }
  },
});

// Security check to ensure that 
// 1. A user is logged in
// 2. User can only set the 'message' key of the collection (server will handle the rest, thanks)
Messages.allow({
  insert: function (userId, doc) {
  	// Mr user needs only give us the message
  	if (Meteor.isClient) {
    	return userId && _.without(_.keys(doc), 'message').length === 0;     
	}
	// server needs to add other keys to the collection, but a user must still be logged on
	return userId; 
  }
})

// Let the server do the adding of timestamp, user's email and id 
// (if not already done, say in a test scenario)
if (Meteor.isServer) {
  Messages.before.insert(function (userId, doc) {    
    doc.createdAt = (new Date()).toLocaleString();
    doc.owner = doc.owner ? doc.owner : Meteor.users.findOne(userId).emails[0].address;
    doc.ownerId = doc.ownerId ? doc.ownerId : userId;
 });
}

// define a factory for Messages
Factory.define('messages', Messages, {
  message: () => faker.lorem.sentence(),
  owner: () => faker.internet.email(),
  ownerId: () => faker.random.uuid() ,
  createdAt: () => (new Date()).toLocaleString(),
});