/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getParticipantRegistry getAssetRegistry getFactory */


/**
 * A shipment has been received by a supplier
 * @param {com.bookgo.shipping.ShipmentReceived} shipmentReceived - the ShipmentReceived transaction
 * @transaction
 */
async function approvePOD(shipmentReceived) {  // eslint-disable-line no-unused-vars

    const contract = shipmentReceived.shipment.contract;
    const shipment = shipmentReceived.shipment;
  
    let payOut = shipment.settlementAmount;

    console.log('Received at: ' + shipmentReceived.timestamp);
    console.log('Contract arrivalDateTime: ' + contract.arrivalDateTime);

    // set the status of the shipment
    shipment.status = 'ARRIVED';

    console.log('Payout: ' + payOut); 
    contract.fleetManagementCompany.accountBalance += payOut;
  
    console.log('Fleet Management Company: ' + contract.fleetManagementCompany.$identifier + ' new balance: ' +         contract.fleetManagementCompany.accountBalance);

    // update the grower's balance
    const fleetManagementCompanyRegistry = await getParticipantRegistry('com.bookgo.shipping.FleetManagementCompany');
    await fleetManagementCompanyRegistry.update(contract.fleetManagementCompany);

  

    // update the state of the shipment
    const shipmentRegistry = await getAssetRegistry('com.bookgo.shipping.Shipment');
    await shipmentRegistry.update(shipment);
}


/**
 * A temperature reading has been received for a shipment
 * @param {org.acme.shipping.perishable.TemperatureReading} temperatureReading - the TemperatureReading transaction
 * @transaction
 */
/*async function createPOD(temperatureReading) {  // eslint-disable-line no-unused-vars

    const shipment = temperatureReading.shipment;

    console.log('Adding temperature ' + temperatureReading.centigrade + ' to shipment ' + shipment.$identifier);

    if (shipment.temperatureReadings) {
        shipment.temperatureReadings.push(temperatureReading);
    } else {
        shipment.temperatureReadings = [temperatureReading];
    }

    // add the temp reading to the shipment
    const shipmentRegistry = await getAssetRegistry('org.acme.shipping.perishable.Shipment');
    await shipmentRegistry.update(shipment);
}*/

/**
 * Initialize some test assets and participants useful for running a demo.
 * @param {com.bookgo.shipping.SetupDemo} setupDemo - the SetupDemo transaction
 * @transaction
 */
async function setupDemo(setupDemo) {  // eslint-disable-line no-unused-vars

    const factory = getFactory();
    const NS = 'com.bookgo.shipping';

    // create the fleetManagementCompany
    const fleetManagementCompany = factory.newResource(NS, 'FleetManagementCompany', 'fahad@truckgenie.com');
    fleetManagementCompany.accountBalance = 0;

    // create the supplier
    const supplier = factory.newResource(NS, 'Supplier', 'tvsadmin@email.com');
  
    const bank = factory.newResource(NS,'Bank','bank@email.com');
    // create the contract
    const contract = factory.newResource(NS, 'Contract', 'CON_001');
    contract.fleetManagementCompany = factory.newRelationship(NS, 'FleetManagementCompany', 'fahad@truckgenie.com');
    contract.supplier = factory.newRelationship(NS, 'Supplier', 'supermarket@email.com');
    contract.bank = factory.newRelationship(NS, 'Bank', 'bank@email.com');
    const tomorrow = setupDemo.timestamp;
    tomorrow.setDate(tomorrow.getDate() + 1);
    contract.arrivalDateTime = tomorrow; // the shipment has to arrive tomorrow
    contract.settlementAmount = 85000.00
    contract.ctrStatus = 'REQUESTED'
    // create the shipment
    const shipment = factory.newResource(NS, 'Shipment', 'SHIP_001');
    shipment.type = 'AUTO';
    shipment.status = 'IN_TRANSIT';
    shipment.from = 'JAMALPUR';
    shipment.to   = 'CHENNAI';
    shipment.company = 'TVS';
    shipment.startTime = new Date();
    shipment.endTime = new Date();
    shipment.settlementAmount = 0.0;
    shipment.contract = factory.newRelationship(NS, 'Contract', 'CON_001');

    // add the fleetManagementCompany
    const fleetManagementCompanyRegistry = await getParticipantRegistry(NS + '.FleetManagementCompany');
    await fleetManagementCompanyRegistry.addAll([fleetManagementCompany]);

    // add the suppliers
    const supplierRegistry = await getParticipantRegistry(NS + '.Supplier');
    await supplierRegistry.addAll([supplier]);

    // add the shippers
    const bankRegistry = await getParticipantRegistry(NS + '.Bank');
    await bankRegistry.addAll([bank]);

    // add the contracts
    const contractRegistry = await getAssetRegistry(NS + '.Contract');
    await contractRegistry.addAll([contract]);

    // add the shipments
    const shipmentRegistry = await getAssetRegistry(NS + '.Shipment');
    await shipmentRegistry.addAll([shipment]);
}
