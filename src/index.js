'use strict';
if (typeof window !== 'undefined' && !window.$) {
    window.jQuery = window.$ = require('jquery');
} 
var Octokit = require('octokit');

/**
 * @class Delegator
 * @param {Writer} writer
 */
function Delegator(writer) {
    var w = writer;

    /**
     * @lends Delegator.prototype
     */
    var del = {};
    
    /**
     * Gets the URI for the entity
     * @param {Object} entity The entity object
     * @returns {Promise} The promise object
     */
    del.getUriForEntity = function(entity) {
        var guid = w.utilities.createGuid();
        var uri = 'http://id.cwrc.ca/'+entity.getType()+'/'+guid;
        var dfd = new $.Deferred();
        dfd.resolve(uri);
        return dfd.promise();
    };
    
    /**
     * Gets the URI for the annotation
     * @param {Object} entity The entity object
     * @returns {Promise} The promise object
     */
    del.getUriForAnnotation = function() {
        var guid = w.utilities.createGuid();
        var uri = 'http://id.cwrc.ca/annotation/'+guid;
        var dfd = new $.Deferred();
        dfd.resolve(uri);
        return dfd.promise();
    };
    
    /**
     * Gets the URI for the document
     * @param {Object} entity The entity object
     * @returns {Promise} The promise object
     */
    del.getUriForDocument = function() {
        var guid = w.utilities.createGuid();
        var uri = 'http://id.cwrc.ca/doc/'+guid;
        var dfd = new $.Deferred();
        dfd.resolve(uri);
        return dfd.promise();
    };
    
    /**
     * Gets the URI for the target
     * @param {Object} entity The entity object
     * @returns {Promise} The promise object
     */
    del.getUriForTarget = function() {
        var guid = w.utilities.createGuid();
        var uri = 'http://id.cwrc.ca/target/'+guid;
        var dfd = new $.Deferred();
        dfd.resolve(uri);
        return dfd.promise();
    };
    
    /**
     * Gets the URI for the selector
     * @param {Object} entity The entity object
     * @returns {Promise} The promise object
     */
    del.getUriForSelector = function() {
        var guid = w.utilities.createGuid();
        var uri = 'http://id.cwrc.ca/selector/'+guid;
        var dfd = new $.Deferred();
        dfd.resolve(uri);
        return dfd.promise();
    };
    
    /**
     * Gets the URI for the user
     * @param {Object} entity The entity object
     * @returns {Promise} The promise object
     */
    del.getUriForUser = function() {
        var guid = w.utilities.createGuid();
        var uri = 'http://id.cwrc.ca/user/'+guid;
        var dfd = new $.Deferred();
        dfd.resolve(uri);
        return dfd.promise();
    };
    
   
    
 
    
    /**
     * Get a specific documentation file
     * @param {String} fileName The documentation file name.
     * @param {Delegator~getDocumentationCallback} callback
     */
    del.getDocumentation = function(fileName, callback) {
        var octo = Octokit.new({token: '15286e8222a7bc13504996e8b451d82be1cba397'});
        var templateRepo = octo.getRepo('cwrc', 'CWRC-Writer-Documentation');
        var branch = templateRepo.getBranch('master');
    
        branch.contents('out/xhtml/'+fileName).then(function(contents) {
            var doc = $.parseXML(contents);
            callback.call(w, doc);
        }, function() {
            w.dialogManager.show('message', {
                title: 'Error',
                type: 'error',
                msg: 'There was an error fetching the documentation for: '+fileName
            });
        });
    };
    
    /**
     * @callback Delegator~saveDocumentCallback
     * @param {Boolean} savedSuccessfully
     */
    
    del.getHelp = function(tagName) {
        return w.utilities.getDocumentationForTag(tagName);
    };
    
   
return del;
};




module.exports = Delegator;