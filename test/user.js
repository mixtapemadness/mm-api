const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../bin/www');
let should = chai.should();

chai.use(chaiHttp);

const mongoose = require("mongoose");
const UserModel = global.db.UserModel;


// App dependencies
const jwtService = require('app/services/jwtService')
const config = require('app/config')
const api = config.HTTP_HOST


//Our parent block
describe('User', () => {

    let token = ''
    let user = {}

    // // Clear users before testing
    before(function() {
        return UserModel.remove({}).exec();
    });

    // // Clear users after testing
    after(function() {
        // return UserModel.remove({}).exec();
    });

    describe('POST /api/v1/users/sign-up', function() {
        it('should respond register user', function(done) {
            chai.request(api)
                .post('/api/v1/users/sign-up')
                .send({
                    email: 'test@test.com',
                    password: 'password',
                    role: "Admin",
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('data').eql('User Created');
                    done();
                });
        });

    });

    describe('POST /api/v1/users/sign-in', function() {
        it('should respond with JWT when authenticated', function(done) {
            chai.request(api)
                .post('/api/v1/users/sign-in')
                .send({
                    email: 'test@test.com',
                    password: 'password',
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('access_token');
                    res.body.data.should.have.property('user');
                    jwtService(config.jwt).verify(res.body.data.access_token)
                    token = res.body.data.access_token
                    user = res.body.data.user
                    done();
                });
        });

    });

    describe('POST /api/v1/users/request-reset-password', function() {
        it('should request reset password', function(done) {
            chai.request(api)
                .post('/api/v1/users/request-reset-password')
                .send({
                    email: 'test@test.com',
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('email').eql('test@test.com');
                    done();
                });
        });

    });

    describe('POST /api/v1/users/change-password', function() {
        it('should change user password', function(done) {
            chai.request(api)
                .post('/api/v1/users/change-password')
                .send({
                    email: 'test@test.com',
                    password: 'newPassword',
                    oldPassword: 'password',
                })
                .query({access_token: token})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('email').eql('test@test.com');
                    done();
                });
        });

    });

    describe('GET /api/v1/users/info', function() {
        it('should return authenticated user', function(done) {
            chai.request(api)
                .get('/api/v1/users/info')
                .query({access_token: token})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('email').eql('test@test.com');
                    done();
                });
        });

    });

    describe('PUT /api/v1/users/update-profile', function() {
        it('should update and return authenticated user', function(done) {
            chai.request(api)
                .put('/api/v1/users/update-profile')
                .send({
                    fullName: 'Fake name 2',
                    phone: '123321',
                })
                .query({access_token: token})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('fullName').eql('Fake name 2');
                    res.body.data.should.have.property('phone').eql('123321');
                    done();
                });
        });

    });

    describe('GET /api/v1/users/:id/', function() {
        it('should return user by id', function(done) {

            let userData = new UserModel({
                email: 'test2@test.com',
                password: 'password',
                role: "Admin",
            })

            userData.save((err, userDoc) => {
                chai.request(api)
                    .get('/api/v1/users/'+userDoc.id)
                    .query({access_token: token})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('data');
                        res.body.data.should.have.property('email').eql('test2@test.com');
                        done();
                    });
            });

        });

    });


});
