const chai = require('chai');
const chaiHttp = require('chai-http');
const main = require("../app.js");
const should = chai.should();

chai.use(chaiHttp);

describe('Database interaction', function(){
    it('should register a new user on /register-user POST', function(done){
        let testUser = {
            "firstName": "TestUser",
            "lastName": "TestUser",
            "email": "test@yahoo.com",
            "password": "testPass"
        }

        chai.request(main)
        .post('/register-user')
        .send(testUser)
        .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('username');
        res.body.username.should.equal(testUser.firstName[0] + testUser.lastName[0]);
        res.body.should.have.property('userId');
        res.body.message.should.equal('The user was registered successfully !');
        res.body.email.should.equal(testUser.email);
        done();
        });
    });

    it("should get list of all messages on /get-messages GET", function(done){
        chai.request(main)
        .get('/get-messages')
        .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.messages.should.be.a('array');
            done();
        });
    });

    it('should update a user status on /updateActive POST', function(done){
        let active = true;
        let data = {
            'userId': 5, 'isActive': active
        }

        chai.request(main)
        .post('/updateActive')
        .send(data)
        .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.equal('User status updated successfully !');
        done();
        });
    });

    
    it('should sign in a user on /sign-in POST', function(done){
        let testUser = {
            "email": "nikolay.kanchev@yahoo.com",
            "password": "1234"
        }

        chai.request(main)
        .post('/sign-in')
        .send(testUser)
        .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('username');
        res.body.should.have.property('userId');
        res.body.username.should.equal("NK");
        done();
        });
    });
});

