﻿/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

var viewer;

function launchViewer() {
  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
  };

  Autodesk.Viewing.Initializer(options, () => {
    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('forgeViewer'),
    { extensions: ['CustomPropertyPanelExtension'] });
    viewer.start();
    //var documentId = 'urn:' + urn;
    var demo_id = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dHdpbi9ibG94aHViLnJ2dA';
    Autodesk.Viewing.Document.load(demo_id, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}

function onDocumentLoadSuccess(doc) {
  var masterViews = findMasterViews(doc.getRoot().findAllViewables()[0]);
  viewer.loadDocumentNode(doc, 
    /* if any master view */ masterViews.length !== 0 ? /* use first */ masterViews[0] : /* or use default */ doc.getRoot().getDefaultGeometry())
  //var viewables = doc.getRoot().getDefaultGeometry();
  //viewer.loadDocumentNode(doc, viewables)
  .then(i => {
    // documented loaded, any action?
    //initViewer(viewer);
    var ViewerInstance = new CustomEvent("viewerinstance", {detail: {viewer: viewer}});      
      document.dispatchEvent(ViewerInstance);
      // var LoadExtensionEvent = new CustomEvent("loadextension", {
      //   detail: {
      //     extension: "Extension1",
      //     viewer: viewer
      //   }
      // });      
      // document.dispatchEvent(LoadExtensionEvent);
  });
}

// Yet to confirm if is safe to assume that Master View will be named
// according to the phase it represents.
function findMasterViews(viewable) {
  var masterViews = [];
  // master views are under the "folder" with this UUID
  if (viewable.data.type === 'folder' && viewable.data.name === '08f99ae5-b8be-4f8d-881b-128675723c10') {
    return viewable.children;
  }
  if (viewable.children === undefined) return;
  viewable.children.forEach((children) => {
    var mv = findMasterViews(children);
    if (mv === undefined || mv.length == 0) return;
    masterViews = masterViews.concat(mv);
  })
  return masterViews;
}

function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

/* Reference from Petr Broz github (Digital Twin) */
function initViewer(viewer) {
  viewer.setQualityLevel(/* ambient shadows */ false, /* antialiasing */ true);
  viewer.setGroundShadow(true);
  viewer.setGroundReflection(false);
  viewer.setGhosting(true);
  viewer.setEnvMapBackground(true);
  viewer.setLightPreset(5);
  viewer.setSelectionColor(new THREE.Color(0xEBB30B));
}

function getForgeToken(callback) {
  fetch('/api/forge/oauth/token').then(res => {
    res.json().then(data => {
      callback(data.access_token, data.expires_in);
    });
  });
}