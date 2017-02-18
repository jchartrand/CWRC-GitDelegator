'use strict';
var $ = require('jquery');
var Octokit = require('octokit');
let Cookies = require('js-cookie');
let bootstrap = require('bootstrap');
let cwrcGit = require('cwrc-git-server-client');

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
            url: w.baseUrl+'services/validator/validate.html',
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
        var octo = Octokit.new({token: '15286e8222a7bc13504996e8b451d82be1cba397'});
        var templateRepo = octo.getRepo('cwrc', 'CWRC-Writer-Templates');
        // if we're on development then also get the templates development branch
        var forceDev = true;
        var isDev = window.location.pathname.indexOf('/dev/') !== -1;
        if (forceDev || isDev) {
            return templateRepo.getBranch('development');
        } else {
            return templateRepo.getBranch('master');
        }
    }
    
    /**
     * Gets the list of templates
     * @param {Delegator~getTemplatesCallback} callback
     */
    del.getTemplates = function(callback) {
        var branch = _getTemplateBranch();
        branch.contents('templates').then(function(contents) {
            contents = $.parseJSON(contents);
            var templates = [];
            for (var i = 0; i < contents.length; i++) {
                var c = contents[i];
                var path = c.path;
                var name = c.name;
                name = name.replace(/_/g, ' ').replace('.xml', '');
                name = w.utilities.getCamelCase(name);
                templates.push({name: name, path: path});
            }
            callback.call(w, templates);
        });
    };
    
    /**
     * @callback Delegator~getTemplatesCallback
     * @param {Array} templates The list of templates
     * @property {String} name The template name
     * @property {String} path The path to the template, relative to the parent branch
     * 
     */
    
    
    /**
     * Gets the list of documents
     * @param {Delegator~getDocumentsCallback} callback
     */
    del.getDocuments = function(callback) {
        // don't use this with git delegator
        /*$.ajax({
            url: w.baseUrl+'editor/documents',
            type: 'GET',
            dataType: 'json',
            success: function(docNames, status, xhr) {
                if (callback) {
                    callback.call(w, docNames);
                }
            },
            error: function() {
                if (callback) {
                    callback.call(w, []);
                }
            }
        });*/
    };
    
    /**
     * @callback Delegator~getDocumentsCallback
     * @param {Array} documents The list of documents
     * @property {String} name The document name
     * 
     */
    
    
    /**
     * Loads a template
     * @param {String} path The path to the template, relative to the templates repo
     * @param {Delegator~loadTemplateCallback} callback
     */
    del.loadTemplate = function(path, callback) {
        var branch = _getTemplateBranch();
        branch.contents(path).then(function(template) {
            path = path.replace('.xml', '');
            window.location.hash = '#'+path;
            // byte order mark fix
            if (template.charCodeAt(0) == 65279) {
                template = template.substr(1);
            }
            var xml = $.parseXML(template);
            callback.call(w, xml);
        });
    };
    
    /**
     * @callback Delegator~loadTemplateCallback
     * @param {Document} The template document
     */
    
    /**
     * Loads a document
     * @param {String} docId The document ID
     * @param {Delegator~loadDocumentCallback} callback
     */
    del.loadDocument = function(docId, callback) {
        // don't use this with gitDelegator
       /* $.ajax({
            url: w.baseUrl+'editor/documents/'+docId,
            type: 'GET',
            success: function(doc, status, xhr) {
                window.location.hash = '#'+docId;
                callback.call(w, doc);
            },
            error: function(xhr, status, error) {
                w.dialogManager.show('message', {
                    title: 'Error',
                    msg: 'An error ('+status+') occurred and '+docId+' was not loaded.',
                    type: 'error'
                });
                callback.call(w, null);
                
                w.event('documentLoaded').publish(false, null);
            },
            dataType: 'xml'
        });*/
    };
    
    /**
     * @callback Delegator~loadDocumentCallback
     * @param {(Document|null)} document Returns the document or null if there was an error
     */
    
    /**
     * Performs the server call to save the document.
     * @fires Writer#documentSaved
     * @param {String} docId The document ID
     * @param {Delegator~saveDocumentCallback} callback
     */
    del.saveDocument = function(docId, callback) {
   
    };

    
    
    del.saveAndExit = function(callback) {
      
    };

    function processSuccessfulSave(docId) {
        w.editor.isNotDirty = 1; // force clean state
        w.dialogManager.show('message', {
            title: 'Document Saved',
            msg: docId+' was saved successfully.'
        });
        window.location.hash = '#'+docId;
        w.event('documentSaved').publish();
    };


    
    /**
     * @callback Delegator~saveDocumentCallback
     * @param {Boolean} savedSuccessfully
     */
    
    del.getHelp = function(tagName) {
        return w.utilities.getDocumentationForTag(tagName);
    };
    
    

   
    
/*  
    function markCWRCRepos() {
        $( ".git-repo" ).each(function( index ) {
            var $this = $(this);
            var $gitHubRepoId = $this.data('ghrepoID');
            if (checkIfCWRCRepo($gitHubRepoId)) {
                $this.addClass('non-cwrc');
            }
        });
    }

    function showCWRCRepos() {
        $('.non-cwrc').hide();
    }

    function showAllRepos() {
        $('.non-cwrc').show();
    }
*/
    function getInfoForAuthenticatedUser() {
        cwrcGit.getInfoForAuthenticatedUser()
            .done(function( info ) {
                writer.githubUser = info;
                $('#private-tab').text(`${writer.githubUser.login} repos`);
                
            }).fail(function(errorMessage) {
                console.log("in the fail");
                var message = (errorMessage == 'login')?`You must first authenticate with Github.`:`Couldn't find anything for that id.  Please try again.`;
                $('#cwrc-message').text(message).show();
            });
    }


    function getDoc(reponame) {
        cwrcGit.getDoc(reponame)
            .done(function( result ) {
                console.log(result);
                w.repoName = result.repo;
                w.repoOwner = result.owner;
                w.parentCommitSHA = result.parentCommitSHA;
                w.baseTreeSHA = result.baseTreeSHA;
                var xmlDoc = $.parseXML(result.doc);
                w.fileManager.loadDocumentFromXml(xmlDoc);
            }).fail(function(errorMessage) {
                console.log("in the getDoc fail");
                console.log(errorMessage);
            });
    }

    function createRepoWithBlankDoc(repoName, repoDescription, isPrivate) {
        cwrcGit.createCWRCRepo(repoName, isPrivate, repoDescription, '<?xml version="1.0"?><TEI>some text</TEI>')
            .done(result=>{})
            .fail(errorMessage=>{})
    }

    function createRepoForCurrentDoc(repoName, repoDesc, isPrivate) {
        var annotations = "some annotations";
        var versionTimestamp = Math.floor(Date.now() / 1000);
        return cwrcGit.createCWRCRepo(repoName, repoDesc, isPrivate, w.converter.getDocumentContent(true), annotations, versionTimestamp)
    }

    function saveDoc() {
        console.log("in the save doc method in js/dialogs/fileManager.js")
        var versionTimestamp = Math.floor(Date.now() / 1000);
        return cwrcGit.saveDoc(w.repoName, w.repoOwner, w.parentCommitSHA, w.baseTreeSHA, w.converter.getDocumentContent(true), versionTimestamp)
    }

    function showReposForAuthenticatedGithubUser() {
        cwrcGit.getReposForAuthenticatedGithubUser()
            .done(function( repos ) {
                populateRepoList(repos, '#github-private-doc-list');
                //console.log(repos);
            }).fail(function(errorMessage) {
                console.log("in the fail");
                var message = (errorMessage == 'login')?`You must first authenticate with Github.`:`Couldn't find anything for that id.  Please try again.`;
                $('#cwrc-message').text(message).show();
            });
    }

    function showReposForGitHubUser(gitName) {   
        cwrcGit.getReposForGithubUser(gitName)
            .done(function( repos ) {
                //console.log(repos);
                populateRepoList(repos, '#github-public-doc-list')
            }).fail(function(errorMessage) {
                console.log("in the fail");
                $('#cwrc-message').text(`Couldn't find anything for that id.  Please try again.`).show();
            });
    }

    function populateRepoList(repos, listGroupId) {
        $(function () { 
            var listContainer = $(listGroupId);
            listContainer.empty()

            for (let repo of repos) {
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
                        <div style="margin-top:1em">
                            <div id="save-cwrc-message" class="text-warning" style="margin-top:1em">some text</div>
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
          createRepoForCurrentDoc(repoName, repoDesc, isPrivate).then(
            success=>{
                    alert(success);
                    $('#githubSaveModal').modal('hide');
                },
            failure=>$('#save-cwrc-message').text("Couldn't save.").show());
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

        $('#open-save-new-doc-btn').click(ev=>$('#github-save-form').hide());

        $('#dismiss-save-new-btn').click(ev=>{
            $('#github-save-form').show();
            $('#github-save-new-form').hide();
        });

        $('#save-cwrc-message').hide();
        
        $('#githubSaveModal').modal();
        
        $('#save-doc-btn').click(function(event){
            saveDoc().then(
                success=>{
                    $('#githubSaveModal').modal('hide');
                },
                failure=>{
                    console.log("save failed, and the return value is: ");
                    console.log(failure);
                    alert(failure);
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
                            <a class="nav-link" data-toggle="tab" href="#public" role="tab">Public Github Documents</a>
                          </li>
                          <li class="nav-item">
                            <a class="nav-link" data-toggle="tab" href="#search" role="tab">Search Github</a>
                          </li>
                        </ul>

                        <!-- Tab panes -->
                        <div class="tab-content">
                            <div class="tab-pane active" id="private" role="tabpanel">
                                <div class="row" style="margin-top:1em">
                                    <div class="col-lg-12">
                                        <button id="open-new-doc-btn" href="#github-new-form"  class="btn btn-default"  data-toggle="collapse" style="float:right;">Create new document</button>
                                        <!--button id="sign-out-github-btn" class="btn btn-default" style="float:right">Sign out of Github</button-->
                                    </div>
                                    
                                </div>
                                
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
                                <div class=row>
                                    <span class="col-lg-8"></span>
                                    <form class="form-group col-lg-4" id="github-user-id-form" style="float:right;margin-top:1em;margin-bottom:1em">
                                        <div class="input-group" >
                                            <input id="git-user" type="text" class="form-control" placeholder="Github username" aria-describedby="git-user-addon"/>
                                            <div class="input-group-btn" id="git-user-id-addon">
                                                <a
                                                    role="button"
                                                    type="button" 
                                                    class="btn btn-default" 
                                                    data-container="body" 
                                                    tabindex="0" 
                                                    data-toggle="popover" 
                                                    data-trigger="focus" 
                                                    title="Github user" 
                                                    data-content="The Github account containing the repository for the document you'd like to load.  Only public documents will be shown if you use this option." 
                                                    
                                                    aria-hidden="true">
                                                    <span class="glyphicon glyphicon-question-sign"></span>
                                                </a>
                                                <button type="submit" value="Submit" id="new-user-btn" class="btn btn-default">Go</button>
                                            </div>
                                        </div><!-- /input-group -->
                                    </form><!-- /form-group -->
                                </div> <!-- row -->
                                <div id="github-public-doc-list" class="list-group"></div>
                            </div><!-- /tab-pane -->

                            <!-- SEARCH PANE -->

                            <div class="tab-pane" id="search" role="tabpanel">...</div><!-- /tab-pane -->

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

        $('#github-user-id-form').submit(function(event){
          event.preventDefault();
          var gitName = $('#git-user').val();
          showReposForGitHubUser(gitName);
        });

        $('#github-new-form').submit(function(event){
          event.preventDefault();
          var repoName = $('#git-doc-name').val();
          var repoDesc = $('#git-doc-description').val();
          var isPrivate = $('#git-doc-private').checked;
          createRepoWithBlankDoc(repoName, repoDesc, isPrivate);
        });

        if (Cookies.get('cwrc-token')) {
            getInfoForAuthenticatedUser();
            showReposForAuthenticatedGithubUser();
            $('#open-new-doc-btn').show();
            $('#cwrc-message').hide();
            $('#private-tab').tab('show')
            $('#githubLoadModal').modal();
        } else {
            dialog('You no longer seem to be logged into github, please try reloading the CWRC-Writer.')
            // 
            // BUT REALLY, SHOULDN'T GET HERE WITHOUT HAVING LOGGED IN.
        }   
        
    }

return del;
};




module.exports = Delegator;