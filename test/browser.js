'use strict';

const test = require('tape')
const Cookies = require('js-cookie')
const sinon = require('sinon')

addBootstrapCSS();


        
  
/*var usersNock = nock('http://localhost:2222')
                .get('/github/users')
                .reply(200, require('./httpResponseMocks/users.json'));
*/
const testDoc = `
    <?xml version="1.0" encoding="UTF-8"?>
<?xml-model href="http://cwrc.ca/schemas/cwrc_tei_lite.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
<?xml-stylesheet type="text/css" href="http://cwrc.ca/templates/css/tei.css"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:cw="http://cwrc.ca/ns/cw#" xmlns:w="http://cwrctc.artsrn.ualberta.ca/#">
    <teiHeader>
        <fileDesc>
            <titleStmt>
                <title>Sample Document Title</title>
            </titleStmt>
            <publicationStmt>
                <p></p>
            </publicationStmt>
            <sourceDesc sameAs="http://www.cwrc.ca">
                <p>Created from original research by members of CWRC/CSÉC unless otherwise noted.</p>
            </sourceDesc>
        </fileDesc>
    </teiHeader>
    <text>
        <body>
            <div>
                Replace with your text.
            </div>
        </body>
    </text>
</TEI>`;

function addBootstrapCSS() {
    let bootstrapCSSLink = document.createElement('link')
    let bootstrapThemeCSSLink = document.createElement('link')
    bootstrapCSSLink.rel='stylesheet'
    bootstrapThemeCSSLink.rel='stylesheet'
    bootstrapCSSLink.href= '../node_modules/bootstrap/dist/css/bootstrap.min.css'
    bootstrapThemeCSSLink.href='../node_modules/bootstrap/dist/css/bootstrap-theme.min.css'
    let headElement = document.getElementsByTagName('head')[0]
    headElement.appendChild(bootstrapCSSLink)
    headElement.appendChild(bootstrapThemeCSSLink)
}

 const gitDelegatorConstructor = require('../src/index.js');
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
        event: (eventId)=>{return {publish: ()=>true}},
        baseUrl: 'http://localhost/cwrc',
        editor: {isNotDirty:1, getContent: ()=>'  oh'},
        repoName: '',
        repoOwner: '',
        parentCommitSHA: '',
        baseTreeSHA: '',
        loadDocument: (xml)=>{console.log(xml);console.log('loadDocument called')}
    };



test('A passing test', (assert) => {
    test.onFinish(()=>{
        console.log('# coverage:', JSON.stringify(window.__coverage__))
        window.close()
    })
    assert.plan(2)
    let gitDelegator = new gitDelegatorConstructor(writerMock);
    Cookies.set('cwrc-token', 'test');
    var server = sinon.fakeServer.create();
    server.autoRespond = true;
    const usersReply = JSON.stringify(require('./httpResponseMocks/users.json'))
    const templatesReply = JSON.stringify(require('./httpResponseMocks/templates.json'))
    const searchReply = JSON.stringify(require('./httpResponseMocks/search.json'))
    server.respondWith("GET", "/github/users",
                [200, { "Content-Type": "application/json" },
                 usersReply]);
    server.respondWith("GET", "/github/templates",
                [200, { "Content-Type": "application/json" },
                 templatesReply]);
    server.respondWith("GET", "/github/search?q=CWRC-GitWriter-web-app+user:jchartrand",
                [200, { "Content-Type": "application/json" },
                 searchReply]);
    
    gitDelegator.load()
   // sinon.assert.calledWith(callback, [{ id: 12, comment: "Hey there" }]);
    assert.ok(server.requests.length > 0, "server requests should have been made")
   //console.log(server.requests);
    //server.restore();
    let titleElem = document.querySelector('h4');
    assert.equal('Load From a CWRC-enabled Github Repository', document.querySelector('h4').textContent, 'popup should have opened with modal title')
    
   
   // console.log(dom.window.document.querySelector("p").textContent); // "Hello world"

  //assert.pass('This test will pass.');

  
});


 // "Hello worl