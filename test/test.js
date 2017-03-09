// file on which to run browserify when manually testing (in a browser) 
// or working on the module (to see the effect of changes in the browser).
'use strict';
if (!window.$) {
    window.jQuery = window.$ = require('jquery');
}
let gitDelegatorConstructor = require('../src/index.js');
let testDoc = '';
let writerMock = {
	utilities: {
		createGuid: ()=>{'fakeGUIDForTesting'},
		getCamelCase: (name)=>{name},
		getDocumentationForTag: (tagName)=>{'someDocs'}
	},
	converter: {
		getDocumentContent: (boolean)=>testDoc
	},
	schemaManager: {
		schemaId: 'tei', 
		schemas: {
			tei: {
				url:'PuturlToTeiSchemaHere'
			}
		}
	},
	dialogManager:{
		show: (nameOfDialogToShow, detailsObject)=>{true} //detailsObject: {title: '', message: '', type: ''}
	},
	fileManager:{
    	loadDocumentFromXml: (xmlDoc)=>{testDoc=xmlDoc}
    },
	event: {
		validationInitiated: publish=>{true},
		documentValidated: publish=>{true},
		documentSaved: publish=>{true},
		documentLoaded: publish=>{true}
	},
	baseUrl: 'http://localhost/cwrc',
	editor: {isNotDirty:1},
	repoName: '',
    repoOwner: '',
    parentCommitSHA: '',
    baseTreeSHA: ''  
};

let gitDelegator = new gitDelegatorConstructor(writerMock);
 
$('#load-pop').on('click', function() {	
	gitDelegator.load()
	
})

$('#save-pop').on('click', function() {	
	gitDelegator.save()
	//cD.popSearchPerson({query:'twain', success: result=>console.log(result)});
})


