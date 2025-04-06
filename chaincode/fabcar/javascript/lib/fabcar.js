/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const companies = [
            {
                name: 'ABC Limited',
                companyType: 'private',
                cashOutFlow: 30,
                cashInFlow: 40,
                employeeCount: 5,
                countryOfOrigin: 'Bangladesh',
                companyReputation: 'fair'
            },
            {
                name: 'XYZ Limited',
                companyType: 'private',
                cashOutFlow: 100000,
                cashInFlow: 5000000,
                employeeCount: 5,
                countryOfOrigin: 'Bangladesh',
                companyReputation: 'excellent'
            },
            {
                name: 'IJK Sheba',
                companyType: 'ngo',
                cashOutFlow: 25000,
                cashInFlow: 80000,
                employeeCount: 5,
                countryOfOrigin: 'Bangladesh',
                companyReputation: 'good'
            }
        ];

        const users = [
            {
                email : 'john.doe@example.com',   
                pass: '4526',
                role: 'admin',
                comID: 'Com1'
            },
            {
                email : 'jane.smith@example.com',   
                pass: '4526',
                role: 'admin',
                comID: 'Com1'
            },
            {
                email : 'michael.johnson@example.com',   
                pass: '4526',
                role: 'admin',
                comID: 'Com2'
            },
            {
                email : 'emily.wilson@example.com', 
                pass: '4526',
                role: 'admin',
                comID: 'Com3'
            },
            {
                email : 'david.brown@example.com', 
                pass: '4526',
                role: 'user'
            },
            {
                email : 'sarah.williams@example.com', 
                pass: '4526',
                role: 'user',
               
            },
            {
                email : 'matthew.miller@example.com', 
                pass: '4526',
                role: 'user',
               
            },
            {
                email : 'laura.davis@example.com', 
                pass: '4526',
                role: 'user',
                
            }
        ];

        let adminCount = 21; // Initialize the admin counter
        let userCount = 21; // Initialize the user counter
        let count=1
        // Store companies in the ledger
        for (const company of companies) {
            const companyKey = 'Company'+count.toString();
            count++;
            await ctx.stub.putState(companyKey, Buffer.from(JSON.stringify(company)));
        }

        // Store users in the ledger
        for (const user of users) {
            let userKey = '';
            if (user.role === 'user') {
                userKey = 'User12'+userCount.toString();
                userCount++;
            } else {
                userKey = 'User22'+adminCount.toString();
                adminCount++;
            }
            await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
        }

        console.info('============= END : Initialize Ledger ===========');
    }



    async queryCom(ctx, ID) {
        const queryResults = [];
    
        // Check if the queryValue is a valid Company ID
        const companyAsBytes = await ctx.stub.getState(ID);
        if (companyAsBytes && companyAsBytes.length > 0) {
            queryResults.push(JSON.parse(companyAsBytes.toString('utf8')));
        }
    
        // Check if the queryValue matches any country names
        // const iteratorByCountry = await ctx.stub.getStateByPartialCompositeKey('Company', [ID]);
        // for (const result of iteratorByCountry) {
        //     queryResults.push(JSON.parse(result.value.toString('utf8')));
        // }
    
        // // Check if the queryValue matches any company reputations
        // const iteratorByReputation = await ctx.stub.getStateByPartialCompositeKey('Company', [ID]);
        // for (const result of iteratorByReputation) {
        //     queryResults.push(JSON.parse(result.value.toString('utf8')));
        // }
    
        // If no results found, return an empty array
        if (queryResults.length === 0) {
            throw new Error(`No companies found matching the query: ${queryValue}`);
        }
    
        return JSON.stringify(queryResults);
    }
    

    async createCom(ctx, ID, name, companyType, employeeCount, countryOfOrigin) {
        console.info('============= START : Create Car ===========');

        const com = {
            name,
            companyType,
            cashOutFlow: '',
            cashInFlow: '',
            employeeCount,
            countryOfOrigin,
            companyReputation: '',
        };
        const id=ID.toString();
        const comp=await ctx.stub.getState(id);
        if (!comp || comp.length === 0){
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(com)));
        }
        else{
            console.log('Company exists with same ID')
        }
        console.info('============= END : Create Car ===========');
        
    }

    async queryAllCom(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                console.log(record);
                console.log(record.companyType);
                
                if (record.companyType){
                    allResults.push({ Key: key, Record: record });
                }

            } catch (err) {
                console.log(err);
                record = strValue;
            }

            // if (record.companyType){
            // allResults.push({ Key: key, Record: record });
            // } cd ../
        }
        
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async changeCompanyInfo(ctx, ID, name, companyType, employeeCount, countryOfOrigin) {
        console.info('============= START : changeCarOwner ===========');

        const carAsBytes = await ctx.stub.getState(ID); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${ID} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        if (car.companyReputation!=='banned'){
            car.name = name;
            car.companyType= companyType;
            car.employeeCount= employeeCount;
            car.countryOfOrigin= countryOfOrigin;

            await ctx.stub.putState(ID, Buffer.from(JSON.stringify(car)));
        }
        
        console.info('============= END : changeCarOwner ===========');
    
    }

    async registerUser(ctx, NID, email, pass){
        console.info('============= START : RegisterUser ===========');

        const user = {
            email,
            pass,
            role: 'User'
        }
        id=NID
        const comp=await ctx.stub.getState(id);
        if (comp || comp.length> 0){
            await ctx.stub.putState(id, Buffer.from(JSON.stringify(user)));
        }
         
        console.info('============= END : Create Car ===========');
    }
    async registerAdmin(ctx, NID, email, pass, comID){
        console.info('============= START : RegisterUser ===========');

        const user = {
            email,
            pass,
            role: 'Admin',
            comID
        }
        id=NID
        const comp=await ctx.stub.getState(id);
        if (!comp || comp.length=== 0){
           throw new Error ('Company exists with same ID')
        }
        else{
            await ctx.stub.putState(id, Buffer.from(JSON.stringify(user)));
        }

    }

    async loginUser(ctx, NID, email, pass,role){
        console.info('============= START : RegisterUser ===========');

        const userAsBytes = await ctx.stub.getState(NID);
        if (userAsBytes && userAsBytes.length > 0) {
            const user = JSON.parse(userAsBytes.toString());
            if (user.email==email && user.pass==pass && user.role===role){
                
                    return 0;
                
                
            }
        }else{
            throw new Error(`Wrong email or password ${NID}, ${email}, ${pass}, ${role}`);
        }

    }

    async loginAdmin(ctx, NID, email, pass,role){
        console.info('============= START : RegisterUser ===========');

        const userAsBytes = await ctx.stub.getState(NID);
        if (userAsBytes && userAsBytes.length > 0) {
            const user = JSON.parse(userAsBytes.toString());
            if (user.email===email && user.pass===pass && user.role===role){
                return 0;
            }
        }else{
            throw new Error(`Wrong email or password ${NID}, ${email}, ${pass}, ${role}`);
        }

    }
    
    

    async changeCompanyReputation(ctx, ID, cashOutFlow, companyReputation) {
        console.info('============= START : changeCarOwner ===========');

        const carAsBytes = await ctx.stub.getState(ID); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${ID} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        if (car.companyReputation!=='banned'){
            if(car.companyReputation==='poor'){
                car.companyType= cashOutFlow;
            }
            else{
                car.companyReputation= companyReputation;
            }
            

            await ctx.stub.putState(ID, Buffer.from(JSON.stringify(car)));
        }
        
        console.info('============= END : changeCarOwner ===========');
    }

}

module.exports = FabCar;
