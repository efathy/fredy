const mockNotification = require('./mocks/mockNotification');
const mockConfig = require('../conf/config.test');
const mockStats = require('./mocks/mockStats');
const mockStore = require('./mocks/mockStore');
const proxyquire = require('proxyquire').noCallThru();
const expect = require('chai').expect;

describe('#immowelt testsuite()', () => {

    it('should test immowelt provider', async () => {

        const immowelt = proxyquire('../lib/provider/immowelt', {
            '../../conf/config.json': mockConfig,
            '../lib/fredy': proxyquire('../lib/fredy', {
                './services/store': mockStore,
                './notification/notify': mockNotification
            })
        });

        return await new Promise(resolve => {
            immowelt.run(mockStats).then(() => {
                const immoweltDbContent = immowelt._getStore()._db;
                expect(immoweltDbContent.immowelt).to.be.a('array');

                const notificationObj = mockNotification.get();
                expect(notificationObj).to.be.a('object');
                expect(notificationObj.serviceName).to.equal('immowelt');

                /** check the actual structure **/
                expect(notificationObj.payload.id).to.be.a('number');
                expect(notificationObj.payload.price).to.be.a('string');
                expect(notificationObj.payload.size).to.be.a('string');
                expect(notificationObj.payload.title).to.be.a('string');
                expect(notificationObj.payload.link).to.be.a('string');
                expect(notificationObj.payload.address).to.be.a('string');

                /** check the values if possible **/
                expect(notificationObj.payload.id).to.equal(
                    immoweltDbContent.immowelt[immoweltDbContent.immowelt.length - 1]
                );
                expect(notificationObj.payload.price).that.does.include('€');
                expect(notificationObj.payload.size).that.does.include('m²');
                expect(notificationObj.payload.title).to.be.not.empty;
                expect(notificationObj.payload.link).that.does.include('https://www.immowelt.de');
                expect(notificationObj.payload.address).to.be.not.empty;

                resolve();
            });
        });
    });
});
