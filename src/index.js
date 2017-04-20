'use strict';
if (!window.$) {
    window.jQuery = window.$ = require('jquery');
}
var Octokit = require('octokit');
var Cookies = require('js-cookie');
require('bootstrap');
var cwrcGit = require('cwrc-git-server-client');

var cwrcAppName = "CWRC-GitWriter" + "-web-app";

var blankTEIDoc = '<?xml version="1.0" encoding="UTF-8"?> <?xml-model href="http://cwrc.ca/schemas/cwrc_tei_lite.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?> <?xml-stylesheet type="text/css" href="http://cwrc.ca/templates/css/tei.css"?> <TEI xmlns="http://www.tei-c.org/ns/1.0" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:cw="http://cwrc.ca/ns/cw#" xmlns:w="http://cwrctc.artsrn.ualberta.ca/#"> <teiHeader> <fileDesc> <titleStmt> <title>Sample Document Title</title> </titleStmt> <publicationStmt> <p></p> </publicationStmt> <sourceDesc sameAs="http://www.cwrc.ca"> <p>Created from original research by members of CWRC/CSÉC unless otherwise noted.</p> </sourceDesc> </fileDesc> </teiHeader> <text> <body> <div> Replace with your text. </div> </body> </text> </TEI>';
/**
 * @class Delegator
 * @param {Writer} writer
 * @
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
     * Validate the document against the current schema
     * @fires Writer#validationInitiated
     * @fires Writer#documentValidated
     * @param {Delegator~validateCallback} callback
     */
    del.validate = function(callback) {
        var docText = w.converter.getDocumentContent(false);
        var schemaUrl = w.schemaManager.schemas[w.schemaManager.schemaId].url;
        
        w.event('validationInitiated').publish();
        
        $.ajax({
          //  url: w.baseUrl+'services/validator/validate.html',
            url: 'http://validator.services.cwrc.ca/validator/validate.html',
            type: 'POST',
            dataType: 'xml',
            data: {
                sch: schemaUrl,
                type: 'RNG_XML',
                content: docText
            },
            success: function(data, status, xhr) {
                var valid = $('status', data).text() == 'pass';
                w.event('documentValidated').publish(valid, data, docText);
                if (callback) {
                    callback.call(w, valid);
                }
            },
            error: function() {
                if (callback) {
                    callback.call(w, null);
                } else {
                    w.dialogManager.show('message', {
                        title: 'Error',
                        msg: 'An error occurred while trying to validate the document.',
                        type: 'error'
                    });
                }
            }
        });
    };
    
    /**
     * @callback Delegator~validateCallback
     * @param {Boolean} isValid is the document valid
     * 
     */
    
    
    function _getDocumentationBranch() {
        var octo = Octokit.new({token: '15286e8222a7bc13504996e8b451d82be1cba397'});
        var templateRepo = octo.getRepo('cwrc', 'CWRC-Writer-Documentation');
        return templateRepo.getBranch('master');
    }
    
    /**
     * Get a specific documentation file
     * @param {String} fileName The documentation file name.
     * @param {Delegator~getDocumentationCallback} callback
     */
    del.getDocumentation = function(fileName, callback) {
        var branch = _getDocumentationBranch();
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
     * @callback Delegator~getTemplatesCallback
     * @param {Document} The XML doc
     */
    
    function _getTemplateBranch() {
        // don't use this with gitDelegator
    }

    del.getTemplates = function(callback) {
        // don't use this with gitDelegator
    };

    del.getDocuments = function(callback) {
        // don't use this with git delegator
    };

    del.loadTemplate = function(path, callback) {
        // don't use this with gitDelegator
    };
    
    del.loadDocument = function(docId, callback) {
        // don't use this with gitDelegator
    };    

    del.saveDocument = function(docId, callback) {
        // don't use this with gitDelegator
    };

    del.saveAndExit = function(callback) {
      // don't use this with gitDelegator
    };

    function processSuccessfulSave(docId) {
        w.editor.isNotDirty = 1; // force clean state
        w.dialogManager.show('message', {
            title: 'Document Saved',
            msg: docId+' was saved successfully.'
        });
       // window.location.hash = '#'+docId;
        w.event('documentSaved').publish();
    };


    
    /**
     * @callback Delegator~saveDocumentCallback
     * @param {Boolean} savedSuccessfully
     */
    
    del.getHelp = function(tagName) {
        return w.utilities.getDocumentationForTag(tagName);
    };
    
    function getInfoAndReposForAuthenticatedUser() {
        return cwrcGit.getInfoForAuthenticatedUser()
            .done(function(info) {
                writer.githubUser = info;
                $('#private-tab').text(`${writer.githubUser.login} documents`);
                showRepos(writer.githubUser.login, '#github-private-doc-list');
            }).fail(function(errorMessage) {
                console.log("in the fail");
                var message = (errorMessage == 'login')?`You must first authenticate with Github.`:`Couldn't find anything for that id.  Please try again.`;
                $('#cwrc-message').text(message).show();
            });
    }

    function setDocInEditor(result) {
        w.repoName = result.repo;
        w.repoOwner = result.owner;
        w.parentCommitSHA = result.parentCommitSHA;
        w.baseTreeSHA = result.baseTreeSHA;
        var xmlDoc = $.parseXML(result.doc);
        w.fileManager.loadDocumentFromXml(xmlDoc);
    }

    function getDoc(reponame) {

        return cwrcGit.getDoc(reponame)
            .done(function( result ) {
                setDocInEditor(result)
            }).fail(function(errorMessage) {
                console.log("in the getDoc fail");
                console.log(errorMessage);
            });
    }

    

    function createRepoWithBlankDoc(repoName, repoDescription, isPrivate) {
        w.event('savingDocument').publish();
        var annotations = "";
        var versionTimestamp = Math.floor(Date.now() / 1000);
        
        cwrcGit.createCWRCRepo(repoName, repoDescription, isPrivate, blankTEIDoc, annotations, versionTimestamp)
            .done(function(result){
                setDocInEditor(result);
                w.event('documentSaved').publish(true)
            })
            .fail(function(errorMessage){
                w.event('documentSaved').publish(false)
            })
            
    }

    function createRepoForCurrentDoc(repoName, repoDesc, isPrivate) {
        w.event('savingDocument').publish();
        var annotations = "some annotations";
        var versionTimestamp = Math.floor(Date.now() / 1000);
        var docText = w.converter.getDocumentContent(true);
        return cwrcGit.createCWRCRepo(repoName, repoDesc, isPrivate, docText, annotations, versionTimestamp)
            .done(function(result){
                setDocInEditor(result);
                w.event('documentSaved').publish(true)
            })
            .fail(function(errorMessage){
                w.event('documentSaved').publish(false)
            })
    }

    function saveDoc() {
        w.event('savingDocument').publish();
        var versionTimestamp = Math.floor(Date.now() / 1000);
        var docText = w.converter.getDocumentContent(true);
        
        return cwrcGit.saveDoc(w.repoName, w.repoOwner, w.parentCommitSHA, w.baseTreeSHA, docText, versionTimestamp)
            .done(function(result){
                setDocInEditor(result);
                w.event('documentSaved').publish(true)
            })
            .fail(function(errorMessage){
                w.event('documentSaved').publish(false)
            })
    }
/*
    function showReposForAuthenticatedGithubUser() {
       // cwrcGit.getReposForAuthenticatedGithubUser()
            .done(function( results var queryString = cwrcAppName;
          //  if (publicTopicTerms) queryString += "+" + publicTopicTerms;
            if (publicSearchTerms) queryString += "+" + publicSearchTerms;
            queryString += "+user:" + writer.githubUser;
            cwrcGit.search(queryString) ) {
               // populateRepoList(repos, '#github-private-doc-list');
               populateResultsList(results, '#github-private-doc-list');
                //console.log(repos);
            }).fail(function(errorMessage) {
                console.log("in the fail");
                var message = (errorMessage == 'login')?`You must first authenticate with Github.`:`Couldn't find anything for that id.  Please try again.`;
                $('#cwrc-message').text(message).show();
            });
    }*/

    function showRepos(gitName, listContainerId, searchTerms) {   

       // if (publicSearchTerms || publicTopicTerms) {
            var queryString = cwrcAppName;
          //  if (publicTopicTerms) queryString += "+" + publicTopicTerms;
            if (searchTerms) queryString += "+" + searchTerms;
            if (gitName) queryString += "+user:" + gitName;
            cwrcGit.search(queryString)
                .done(function (results) {
                    populateResultList(results, listContainerId)
                }).fail(function(errorMessage) {
                    $('#cwrc-message').text(`Couldn't find anything for your query.  Please try again.`).show()
                })
      //  } else if (gitName) {
       //     cwrcGit.getReposForGithubUser(gitName)
       //         .done(function( repos ) {
      //              populateRepoList(repos, '#github-public-doc-list')
      //          }).fail(function(errorMessage) {
       //             $('#cwrc-message').text(`Couldn't find anything for that id.  Please try again.`).show();
        //        });
       // }
    }

    function showTemplates() {   
        cwrcGit.getTemplates()
            .done(function( templates ) {
                populateTemplateList(templates, '#template-list')
            }).fail(function(errorMessage) {
                $('#cwrc-message').text(`Couldn't find the templates. Please check your connection or try again.`).show();
            });
    }

    function populateTemplateList(templates, listGroupId) {
        $(function () { 
            var listContainer = $(listGroupId);
            listContainer.empty()

            for (var template of templates) {
                listContainer.prepend(`
                    <a id="gh_${template.name}" href="#" data-template="${template.name}" class="list-group-item git-repo">
                        <h4 class="list-group-item-heading">${template.name}</h4>
                    </a>`);
            }

            $('#cwrc-message').hide();
            
            $(`${listGroupId} .list-group-item`).on('click', function() {
                var $this = $(this);
                var $templateName = $this.data('template');
                getTemplate($templateName);
                
                $('#githubLoadModal').modal('hide');
            });
            
        });
    }

    function getTemplate(templateName) {
        cwrcGit.getTemplate(templateName)
            .done(function( result ) {
                w.fileManager.loadDocumentFromXml(result);
            }).fail(function(errorMessage) {
                console.log("in the getTemplate fail");
                console.log(errorMessage);
            });
    }
/*
    function populateRepoList(repos, listGroupId) {
        $(function () { 
            var listContainer = $(listGroupId);
            listContainer.empty()

            for (var repo of repos) {
                listContainer.prepend(`
                    <a id="gh_${repo.id}" href="#" data-ghrepo="${repo.full_name}" data-ghrepoid="${repo.id}" class="list-group-item git-repo">
                        <h4 class="list-group-item-heading">${repo.full_name}</h4>
                        <p class="list-group-item-text">${repo.id} -- ${repo.description}</p>
                    </a>`);
            }

            $('#cwrc-message').hide();
            
            $(`${listGroupId} .list-group-item`).on('click', function() {
                var $this = $(this);
                var $gitHubRepoName = $this.data('ghrepo');
                getDoc($gitHubRepoName);
                
                $('#githubLoadModal').modal('hide');
            });
            
        });
    }   */

     function populateResultList(results, listGroupId) {
        $(function () { 
            var listContainer = $(listGroupId);
            listContainer.empty()
            for (var result of results.items) {
                var htmlForResultRow =
                    `<a id="gh_${result.repository.id}" href="#" data-ghrepo="${result.repository.full_name}" data-ghrepoid="${result.repository.id}" class="list-group-item git-repo">
                        <h4 class="list-group-item-heading">${result.repository.full_name}</h4>
                        <p class="list-group-item-text">${result.repository.description}</p>`;
                for (var textMatch of result.text_matches) {
                    if (! textMatch.fragment.includes(cwrcAppName)) {
                        var fragment = textMatch.fragment;
                        var searchString = textMatch.matches[0].text;
                        var boldSearchString = `<b>${searchString}</b>`;
                        var regex = new RegExp(searchString,"gi");
                        var boldFragment = fragment.replace('<', '&lt;').replace('>', '&gt;').replace(regex, boldSearchString);

                        htmlForResultRow += `<p>${boldFragment}</p>`
                    } 
                }
                htmlForResultRow += `</a>`;
                listContainer.prepend(htmlForResultRow);
                
            }

            $('#cwrc-message').hide();
            
            $(`${listGroupId} .list-group-item`).on('click', function() {
                var $this = $(this);
                var $gitHubRepoName = $this.data('ghrepo');
                getDoc($gitHubRepoName);
                
                $('#githubLoadModal').modal('hide');
            });
            
        });
    }

    del.save = function() {
        $(document.body).append($.parseHTML(
            
        `<div id="githubSaveModal" class="modal fade">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    
                    <div id="menu" class="modal-body">
                        
                        <div style="margin-bottom:2em">
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="float:right"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                            <h4 id="gh-modal-title' class="modal-title" style="text-align:center">Save</h4>
                        </div>
   
                        <div style="well" style="margin-top:1em;text-align:center">
                            <h5 id="save-cwrc-message">
                                This document is associated with the ${w.repoOwner}/${w.repoName} GitHub repository.  You may save to it, or save to a new repository.
                            </h5>
                        </div>

                        <form id="github-save-new-form" class="well collapse" style="margin-top:1em">
                                    
                                        <div class="form-group">
                                            <label for="save-git-doc-name">Document Name</label>
                                            <small id="new-document-name-help" class="text-muted" style="margin-left:1em">
                                              The name to give the new Github repository that will be created for the document.
                                            </small>
                                            <input id="save-git-doc-name" type="text" class="form-control" aria-describedby="new-document-name-help"/>
                                        </div><!-- /form-group -->
                                    
                                        <div class="form-group">
                                            <label for="save-git-doc-description">Description of document</label>
                                            <small id="new-document-description-help" class="text-muted" style="margin-left:1em">
                                                  A short description of the document that will appear on the github page.
                                            </small>
                                            <textarea class="form-control" id="save-git-doc-description" rows="3" aria-describedby="new-document-description-help"></textarea>    
                                         </div><!-- /form-group -->
                                    
                                        <div class="form-group">
                                            <div class="form-check">
                                                <label class="form-check-label">
                                                    <input id="save-git-doc-private" type="checkbox" class="form-check-input" aria-describedby="new-document-private-help">
                                                    Private
                                                </label>
                                                <small id="new-document-private-help" class="text-muted" style="margin-left:1em">
                                                      You may create a private repository if you have a paid Github account.
                                                </small>
                                            </div>
                                         </div><!-- /form-group -->
                                    
                                        <div class="form-group">
                                            <button id="dismiss-save-new-btn" type="button" class="btn btn-default"  >Cancel</button>
                                            <button type="submit" value="Submit" id="create-doc-btn" class="btn btn-default">Create</button>
                                        </div>
                                
                        </form> 

                    </div><!-- /.modal-body -->
                    <div class="modal-footer">
                        <form id="github-save-form"  style="margin-top:1em">
                                <div class="form-group">
                                    <button id="save-doc-btn" class="btn btn-default">Save</button>
                                    <button id="open-save-new-doc-btn" href="#github-save-new-form" class="btn btn-default"  data-toggle="collapse">Save to a new repository</button>
                                    <button class="btn btn-default" data-dismiss="modal">Cancel</button>
                                    
                                </div>              
                        </form>
                    </div><!-- /.modal-footer -->
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->`));

        $(function () {
            $('[data-toggle="popover"]').popover()
        });


        $('#github-save-new-form').submit(function(event){
          event.preventDefault();
          var repoName = $('#save-git-doc-name').val();
          var repoDesc = $('#save-git-doc-description').val();
          var isPrivate = $('#save-git-doc-private').checked;
          $('#githubSaveModal').modal('hide');
          createRepoForCurrentDoc(repoName, repoDesc, isPrivate).then(
            function(success){
                    //alert(success);
                   // $('#githubSaveModal').modal('hide');
                    $('#save-cwrc-message').text(`This document is associated with the ${w.repoOwner}/${w.repoName} GitHub repository.  You may save to it, or save to a new repository.`);
                },
            function(failure){
                console.log(failure);
                $('#save-cwrc-message').text("Couldn't save.").show()
            });
        });

        if (Cookies.get('cwrc-token')) {
            // the user should already be logged in if they've edited a doc.
            // So, don't need this check.  what I really want to check is if they've
            // already selected a repository.  if so, show the save button.  if not, hide the save button 
            // and only show the save to new repo button.
            $('#open-save-new-doc-btn').show();
        } else {
            $('#open-save-new-doc-btn').hide();
        }

        $('#open-save-new-doc-btn').click(function(ev){$('#github-save-form').hide()});

        $('#dismiss-save-new-btn').click(function(ev){
            $('#github-save-form').show();
            $('#github-save-new-form').hide();
        });

        
        
        $('#githubSaveModal').modal();
        
        if (!w.repoName) {
            $('#save-doc-btn').hide();
            $('#save-cwrc-message').text("This document isn't yet associated with a GitHub repository.");
        } 
        $('#save-doc-btn').click(function(event){
            $('#githubSaveModal').modal('hide');
            saveDoc().then(
                function(success){
                    //$('#githubSaveModal').modal('hide');
                },
                function(failure){
                    console.log("save failed, and the return value is: ");
                    console.log(failure);
                    //alert(failure);
                }
            );
        });

    };


    del.load = function() {
    
        $(document.body).append($.parseHTML(
            
        `<div id="githubLoadModal" class="modal fade">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
     
                    <div id="menu" class="modal-body">
                        <div style="margin-bottom:2em">
                            
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="float:right"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                            <h4 id="gh-modal-title' class="modal-title" style="text-align:center">Load From a CWRC-enabled Github Repository</h4>
                        </div>
                        <div style="margin-top:1em">
                            <div id="cwrc-message" class="text-warning" style="margin-top:1em">some text</div>
                        </div>


                            <!-- Nav tabs -->
                        <ul class="nav nav-tabs" role="tablist">
                          <li class="nav-item">
                            <a class="nav-link active" id="private-tab" data-toggle="tab" href="#private" role="tab">My Github Documents</a>
                          </li>
                          <li class="nav-item">
                            <a class="nav-link" data-toggle="tab" href="#public" role="tab">Search all public CWRC Github documents</a>
                          </li>
                          <li class="nav-item">
                            <a class="nav-link" data-toggle="tab" href="#templates" role="tab">CWRC Templates</a>
                          </li>
                          
                        </ul>

                        <!-- Tab panes -->
                        <div class="tab-content">
                            <div class="tab-pane active" id="private" role="tabpanel">
                                <form role="search" id="github-private-form">
                                    <div class="row" style="margin-top:1em">
                                        <div class="col-xs-4">   
                                            <div class="input-group">
                                                <input type="text" class="form-control input-md" id="private-search-terms" name="private-search-terms"
                                                       placeholder="Search your documents"/>
                                                <span class="input-group-btn">
                                                    <button type="submit" value="Submit" class="btn btn-default"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp;</button>
                                                </span>
                                            </div>  
                                        </div>
                                        <div class="col-xs-4">
                                            
                                        </div>
                                        <div class="col-xs-4">
                                            <button id="open-new-doc-btn" href="#github-new-form"  class="btn btn-default"  style="float:right" data-toggle="collapse" >Create new document</button>
                                        </div>
                                    </div>
                                </form>
                                
                                <form id="github-new-form" class="well collapse" style="margin-top:1em">
                                    
                                        <div class="form-group">
                                            <label for="git-doc-name">Document Name</label>
                                            <small id="new-document-name-help" class="text-muted" style="margin-left:1em">
                                              The name to give the new Github repository that will be created for the document.
                                            </small>
                                            <input id="git-doc-name" type="text" class="form-control" aria-describedby="new-document-name-help"/>
                                        </div><!-- /form-group -->
                                    
                                        <div class="form-group">
                                            <label for="git-doc-description">Description of document</label>
                                            <small id="new-document-description-help" class="text-muted" style="margin-left:1em">
                                                  A short description of the document that will appear on the github page.
                                            </small>
                                            <textarea class="form-control" id="git-doc-description" rows="3" aria-describedby="new-document-description-help"></textarea>    
                                         </div><!-- /form-group -->
                                    
                                        <div class="form-group">
                                            <div class="form-check">
                                                <label class="form-check-label">
                                                    <input id="git-doc-private" type="checkbox" class="form-check-input" aria-describedby="new-document-private-help">
                                                    Private
                                                </label>
                                                <small id="new-document-private-help" class="text-muted" style="margin-left:1em">
                                                      You may create a private repository if you have a paid Github account.
                                                </small>
                                            </div>
                                         </div><!-- /form-group -->
                                    
                                        <div class="form-group">
                                            <button type="button" href="#github-new-form" class="btn btn-default" data-toggle="collapse">Cancel</button>
                                            <button type="submit" value="Submit" id="create-doc-btn" class="btn btn-default">Create</button>
                                        </div>
                                
                                </form> 
                                <div id="github-private-doc-list" class="list-group" style="padding-top:1em"></div>
                            </div><!-- /tab-pane -->
                            
                            <!-- PUBLIC REPOS PANE -->
                            <div class="tab-pane" id="public" role="tabpanel">
                                
                                    <form role="search" id="github-public-form">
                                        <div class="row" style="margin-top:1em">
                                            <div class="col-xs-4">   
                                                <div class="input-group">
                                                    <input type="text" class="form-control input-md" id="public-search-terms" name="public-search-terms"
                                                           placeholder="Search"/>
                                                    <span class="input-group-btn">
                                                        <button type="submit" value="Submit" class="btn btn-default"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp;</button>
                                                    </span>
                                                </div>  
                                            </div>
                                            <div class="col-xs-4">
                                                <!--div class="input-group">
                                                    <input type="text" class="form-control input-md" id="public-topic-terms" name="public-topic-terms"
                                                           placeholder="Filter by GitHub topic"/>
                                                    <span class="input-group-btn">
                                                        <button type="submit" value="Submit" class="btn btn-default"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp;</button>
                                                    </span>
                                                </div-->  
                                            </div>
                                            <div class="col-xs-4">
                                                <div class="input-group" >
                                                    <input id="git-user" type="text" class="form-control" placeholder="Limit to github user or organization" aria-describedby="git-user-addon"/>
                                                    <div class="input-group-btn" id="git-user-id-addon">
                                                        <button type="submit" value="Submit" id="new-user-btn" class="btn btn-default"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp;</button>
                                                    </div>
                                                </div><!-- /input-group -->
                                            </div>
                                        </div>
                                    </form>

                               
                                <div id="github-public-doc-list" class="list-group" style="padding-top:1em"></div>
                            </div><!-- /tab-pane -->

                            <!-- TEMPLATES PANE -->
                            <div class="tab-pane" id="templates" role="tabpanel">
                            
                                <div id="template-list" class="list-group" style="padding-top:1em"></div>
                            </div><!-- /tab-pane -->                     

                        </div> <!-- /tab-content -->
                    </div><!-- /.modal-body -->
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->`));

        // enable popover functionality - bootstrap requires explicit enabling
        $(function () {
            $('[data-toggle="popover"]').popover()
        });

        $('#github-public-form').submit(function(event){
          event.preventDefault();
          var gitName = $('#git-user').val();
          var publicSearchTerms = $('#public-search-terms').val();
         // var publicTopicTerms = $('#public-topic-terms').val();
          showRepos(gitName,'#github-public-doc-list',publicSearchTerms);
        });

        $('#github-private-form').submit(function(event){
          event.preventDefault();
          var privateSearchTerms = $('#private-search-terms').val();
          showRepos(writer.githubUser.login,'#github-private-doc-list',privateSearchTerms);
        });

        $('#github-new-form').submit(function(event){
          event.preventDefault();
          var repoName = $('#git-doc-name').val();
          var repoDesc = $('#git-doc-description').val();
          var isPrivate = $('#git-doc-private').checked;
          $('#githubLoadModal').modal('hide');
          createRepoWithBlankDoc(repoName, repoDesc, isPrivate);

        });

        if (Cookies.get('cwrc-token')) {
            getInfoAndReposForAuthenticatedUser();
            showTemplates();
            $('#open-new-doc-btn').show();
            $('#cwrc-message').hide();
            $('#private-tab').tab('show')
            $('#githubLoadModal').modal();
            $('#githubLoadModal').on('hidden.bs.modal', function (e) {
                var contents = writer.editor.getContent({format: 'raw'});
                console.log(contents);
              if (!contents.includes('_tag')) {
                var defaultxmlDoc = $.parseXML(blankTEIDoc);
                w.fileManager.loadDocumentFromXml(defaultxmlDoc);
                //writer.loadDocument(blankTEIDoc)
              }
            })
        } else {
            del.authenticate()
        }    
    }

    del.authenticate = function() {
         if (Cookies.get('cwrc-token')) {
            return true
        } else {
            $(document.body).append($.parseHTML(  
                `<div id="githubAuthenticateModal" class="modal fade">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div id="menu" class="modal-body">
                                <div style="margin-bottom:2em">
                                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="float:right"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                                    <h4 id="gh-modal-title' class="modal-title" style="text-align:center">Authenticate with Github</h4>
                                </div>
                                <div style="margin-top:1em">
                                    <div id="cwrc-message" style="margin-top:1em">
                                        You must first authenticate through Github to allow the CWRC-Writer 
                                        to make calls on your behalf.  CWRC does not keep any of your github 
                                        information.  The github token issued by github is not stored on a 
                                        CWRC-Server, but is only submitted as a jwt token for each request 
                                        you make.  If you are looking for a version of the CWRC-Writer that 
                                        does not use Github to store documents, please try our other sandbox:  
                                        <a href="http://apps.testing.cwrc.ca/editor/dev/editor_dev.htm">
                                            CWRC-Writer Simple Sandbox
                                        </a>
                                    </div>
                                </div>
                                <div style="text-align:center;margin-top:3em;margin-bottom:3em" id="git-oath-btn-grp">
                                    <div class="input-group" >
                                        <div class="input-group-btn" >
                                            <button type="button" id="git-oauth-btn" class="btn btn-default">Authenticate with Github</button>
                                        </div>
                                    </div> <!--input group -->
                                </div>
                            </div><!-- /.modal-body --> 
                        </div><!-- /.modal-content -->
                    </div><!-- /.modal-dialog -->
                </div><!-- /.modal -->`
            ));

            $('#git-oauth-btn').click(function(event){
                window.location.href = "/github/authenticate";
            });

            $('#githubAuthenticateModal').modal('show').on('shown.bs.modal', function () {
                $(".modal").css('display', 'block');
            })
             
            return false
        } 
        
    }

return del;
};




module.exports = Delegator;