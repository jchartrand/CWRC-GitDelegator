![Picture](http://www.cwrc.ca/wp-content/uploads/2010/12/CWRC_Dec-2-10_smaller.png)

# CWRC-GitDelegator

[![Travis](https://img.shields.io/travis/jchartrand/CWRC-GitDelegator.svg)](https://travis-ci.org/jchartrand/CWRC-GitDelegator)
[![Codecov](https://img.shields.io/codecov/c/github/jchartrand/CWRC-GitDelegator.svg)](https://codecov.io/gh/jchartrand/CWRC-GitDelegator)
[![version](https://img.shields.io/npm/v/cwrc-git-delegator.svg)](http://npm.im/cwrc-git-delegator)
[![downloads](https://img.shields.io/npm/dm/cwrc-git-delegator.svg)](http://npm-stat.com/charts.html?package=cwrc-git-delegator&from=2015-08-01)
[![GPL-2.0](https://img.shields.io/npm/l/cwrc-git-delegator.svg)](http://opensource.org/licenses/GPL-2.0)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

1. [Overview](#overview)
1. [Demo](#demo)
1. [Installation](#installation)
1. [Use](#use)
1. [API](#api)

### Overview

Makes calls to server from web browser on behalf of [CWRC-GitWriter](https://github.com/jchartrand/CWRC-GitWriter).

### Demo 

The [CWRC GitHub Sandbox](http://208.75.74.217/editor_github.html) uses the NPM package published from this repository along with the code in [CWRC-Writer](https://github.com/jchartrand/CWRC-Writer), [CWRC-GitServer](https://github.com/jchartrand/CWRC-GitServer), [CWRC-GitWriter](https://github.com/jchartrand/CWRC-GitWriter), and [CWRC-GitServerClient](https://github.com/jchartrand/CWRC-GitServerClient). The same code is easily (for someone with modest development experience) installed on any server to run your own instance.

### Installation

`npm install cwrc-git-delegator`   

To simultaneously register as a dependency in your package.json:

`npm install cwrc-git-delegator --save`   

or in shortcut form:

`npm i -S cwrc-git-delegator`

### Use

The spec directory contains specifications (tests) that can help better understand the API. Also see [CWRC-GitWriter](https://github.com/jchartrand/CWRC-GitWriter) which fully uses the API.

### API

The methods exposed (API) by this package are:

```

/**
     * Gets the URI for the entity
     * @param {Object} entity The entity object
     * @returns {Promise} The promise object
     */
getUriForEntity(entity)
    
    /**
     * Gets the URI for the annotation
     * @param {Object} entity The entity object
     * @returns {Promise} The promise object
     */
getUriForAnnotation()
    
    /**
     * Gets the URI for the document
     * @param {Object} entity The entity object
     * @returns {Promise} The promise object
     */
    del.getUriForDocument()

    /**
     * Gets the URI for the target
     * @param {Object} entity The entity object
     * @returns {Promise} The promise object
     */
    getUriForTarget()
    
    /**
     * Gets the URI for the selector
     * @param {Object} entity The entity object
     * @returns {Promise} The promise object
     */
    getUriForSelector()
    
    /**
     * Gets the URI for the user
     * @param {Object} entity The entity object
     * @returns {Promise} The promise object
     */
    getUriForUser()
    
    /**
     * Validate the current document against the current schema.  Publishes a documentValidated event
     * that includes three args: valid (true/false),  data (validation info from validator), docText 
     * @fires Writer#validationInitiated
     * @fires Writer#documentValidated
     * @param {Delegator~validateCallback} callback 
     #
     * @callback Delegator~validateCallback
     * @param {Boolean} isValid is the document valid
     * 
     */
    validate(callback)
    
    /**
     * Get a specific documentation file
     * @param {String} fileName The documentation file name.
     * @param {Delegator~getDocumentationCallback} callback
     *
     * @callback Delegator~getTemplatesCallback
     * @param {Document} The XML doc
     */
    getDocumentation(fileName, callback)
    

    
    /**
     * Gets the list of templates
     * @param {Delegator~getTemplatesCallback} callback
     *
     * @callback Delegator~getTemplatesCallback
     * @param {Array} templates The list of templates
     * @property {String} name The template name
     * @property {String} path The path to the template, relative to the parent branch
     * 
     */
    getTemplates(callback)

    
    /**
     * Gets the list of documents
     * @param {Delegator~getDocumentsCallback} callback
     *
     * @callback Delegator~getDocumentsCallback
     * @param {Array} documents The list of documents
     * @property {String} name The document name
     * 
     */
    getDocuments(callback)
     
    
    
    /**
     * Loads a template
     * @param {String} path The path to the template, relative to the templates repo
     * @param {Delegator~loadTemplateCallback} callback
     *
     * @callback Delegator~loadTemplateCallback
     * @param {Document} The template document
     */
    loadTemplate(path, callback)
     
    
    /**
     * Loads a document
     * @param {String} docId The document ID
     * @param {Delegator~loadDocumentCallback} callback
     *
     * @callback Delegator~loadDocumentCallback
     * @param {(Document|null)} document Returns the document or null if there was an error
     */
    loadDocument(docId, callback)
     
    
    /**
     * Performs the server call to save the document.
     * @fires Writer#documentSaved
     * @param {String} docId The document ID
     * @param {Delegator~saveDocumentCallback} callback
     *
     * @callback Delegator~saveDocumentCallback
     * @param {Boolean} savedSuccessfully
     */
    saveDocument = function(docId, callback)
    
    /**
     * Standard save and exit.
     */
    saveAndExit(callback) 
    
    /**
     * returns help text for given tagname.
     @param {String} tagName The tag for which to provide help
     */
    getHelp(tagName)

    /**
     * Spawns a popup prompting the user to save the current document to a github repository.
     */
    save()

    /**
     * Spawns a popup prompting the user to load a document from one of their GitHub repositories.
     */
    load()
	

```
