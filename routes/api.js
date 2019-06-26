
var fs = require('fs');
var _ = require('lodash');

var express = require('express'),
	router = express.Router(),
	request = require('request');

var appInfo = {},
    apiContext = null,
	tenantClient = null,
	entityClient = null,
	entityListFullName= '';

function getTenants(req, callback) {
	var tenantID = 't' + (req.body['x-vol-tenant'] || req.query.tenantId);
	fs.readFile('clients.json', 'utf8', function (err, data) {
		if (err) {
            res.json({ "STATUS": "ERROR", "message": "Error in connection!" });
        } else {
            try {
                var clients = JSON.parse(data);
                if (clients[tenantID]) {
                    callback(clients[tenantID]);
                } else {
                    callback();
                }
            } catch (e) {
                callback();
            }
        }
    });
};
exports.getSitesForTenant = function(req, res){
	try {
		getTenants(req, function (response){
			if (!response) {
				res.json({ "STATUS": "ERROR", "message": "Something went wrong!!" });
			} else {
				appInfo = response;
				entityListFullName = appInfo.entityListName + '@' + appInfo.clientName;					
				apiContext = require('mozu-node-sdk/clients/platform/application')({
					"context": {
						"appKey": appInfo.appKey,
						"sharedSecret": appInfo.sharedSecret,
						"baseUrl": appInfo.baseUrl || "https://home.mozu.com",
						"basePciUrl": appInfo.basePciUrl || "https://pmts.mozu.com/"
					}
				});
				apiContext.context.tenant = req.query.tenantId;
				apiContext.context['user-claims'] = null;				
				tenantClient = require("mozu-node-sdk/clients/platform/tenant")(apiContext);

				if (req.query.tenantId) {
					tenantClient.getTenant({ 'tenantId': req.query.tenantId }).then(function (tenant) {
						res.json(JSON.stringify(tenant.sites));
					}).catch(function (error) {
						res.json({ "STATUS": "ERROR", "message": "Something went wrong!!" });
					});
				}
				else {
					res.json({ "STATUS": "ERROR", "message": "Something went wrong!!" });
				}
			}
		});
	} catch (error) {
		console.log(error);
	}	
};

exports.getTPEntity = function (req, res) {
	var siteId = req.query.siteId;
	apiContext.context.siteId = siteId;
	entityClient = require("mozu-node-sdk/clients/platform/entitylists/entity")(apiContext);
    entityClient.context['user-claims'] = null;
	try {
		entityClient.getEntities({ entityListFullName: entityListFullName, filter: 'id eq ' + siteId })
			.then(function (entityData) {
				res.json(entityData);
			}).catch(function (error) {
				console.log("No entry found : " + error);
				res.json({ "STATUS": "ERROR", "message": "No entry found!!" });
			});
	} catch (error) {		
		console.log(error);
	}
};

exports.createTPEntity = function (req, res) {	
	var siteId = req.query.siteId;
		apiContext.context.siteId = siteId;
		entityClient = require("mozu-node-sdk/clients/platform/entitylists/entity")(apiContext);
		entityClient.context['user-claims'] = null;
		req.body.id = siteId;
		
	entityClient.insertEntity({ entityListFullName: entityListFullName },{ body: req.body })
	.then(function (entityData) {
		res.json(entityData);
	})
	.catch(function (error) {
		res.json({ "STATUS": "ERROR", "message": "Not able to insert Trust pilot configuration !!" });
	});
};

exports.updateTPEntity = function (req, res) {
	var siteId = req.query.siteId;
		apiContext.context.siteId = siteId;
		entityClient = require("mozu-node-sdk/clients/platform/entitylists/entity")(apiContext);
		entityClient.context['user-claims'] = null;
		req.body.id = siteId;

	entityClient.updateEntity({  entityListFullName: entityListFullName, id: siteId }, { body: req.body })
	.then(function (entityData) {
		res.json({result: 'success'});
	}).catch(function (error) {
		res.json({ "STATUS": "ERROR", "message": "Not able to update Trust pilot configuration !!" });
	});
};