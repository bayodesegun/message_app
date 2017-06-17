import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';
import { expect } from 'meteor/practicalmeteor:chai';
 
import { Messages } from './messages.js';

// Server tests
if (Meteor.isServer) {
  describe('Messages', () => {
    describe('methods', () => {
      const userId = Random.id();
      let messageId;
 
      beforeEach(() => {
        Messages.remove({});
        messageId = Messages.insert({
          message: 'This is a test message',
          createdAt: (new Date()).toLocaleString(),
          owner: 'bayodesegun@gmail.com',
          ownerId: userId,         
        });
      });
 
      it('messages.remove method allows user to delete own message', () => {
        // test internal implementation of remove method in isolation
        const removeMessage = Meteor.server.method_handlers['messages.remove'];
 
        // fake method invocation that looks like what the method expects
        const invocation = { userId: userId };
 
        // Run the method with the fake user id
        removeMessage.apply(invocation, [messageId]);
 
        // Verify that the method is expected
        assert.equal(Messages.find().count(), 0);
      });
    });
  });
}

// Client tests
if (Meteor.isClient) {
	describe('Messages', () => {
		describe('user actions', () => {
		  let messageId1;
		  let messageId2;

		  beforeEach((done) => {
		    Accounts.createUser({email: 'user1@example.com', password:'password123'}, function(error) {
		      
		    });
		    messageId1 = Messages.insert({message: 'Initial message from user 1'});		    
		    Accounts.createUser({email: 'user2@example.com', password:'password123'}, function(error) {
		       
		    });
		    messageId2 = Messages.insert({message: 'Initial message from user 2'});		   
		    done();
		  });

		  it ('user should be able to insert when logged in', (done) => {		      
		      Messages.insert({message: 'hello everyone, is anyone online?'}, function(error, res) {
		      	// Try inserting while still logged in, as user2
			      // verify message has been added
			      expect(error).to.be.undefined;
			      expect(res).to.be.ok; 	// res would be the id of the message inserted
			      done();
		      });		  	
		  });

		  it ('user should not be able to insert when not logged in', (done) => {
		  	// log out and try to insert...
		    Meteor.logout(); 	// this is user2
		    Messages.insert({message: 'hello everyone, not logged in yet!'}, function(error, res) {
		      // verify message cannot be added		      
		      expect(error).to.exist;
		      expect(res).to.be.false;
		      done();
		    });
		  });		  

		  it ('trying to remove another user\'s message should throw an unauthorised error', (done) => {		    
	      // Try removing messageId1 while logged in as user2		      
		      Meteor.call('messages.remove', messageId1, function (error, res) {		      	
		      	expect(error).to.exist;
		      	expect(res).to.be.undefined;
		      	assert.equal(error.error, 403);
		      	done();
		      });	      
		  });

		  it ('user should not be able to remove own message without server side call', (done) => {		    
		      // Try removing messageId2 directly from the client end, as user2
		      Messages.remove(messageId2, function (error, res) {		      	
		      	expect(error).to.exist;
		      	expect(res).to.be.false;
		      	done();
		      });
		      
		  });

		  afterEach((done) => {	  	
		    Meteor.call('dropDatabase', done);		    
		  });

	 	});

	});
}