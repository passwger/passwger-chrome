// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 **/
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    // Put the image URL in Google search.
    renderStatus('Performing Google Image search for ' + url);

    getPasswordUrl(url, function(pwds) {

      renderStatus(pwds)

    }, function(errorMessage) {
      renderStatus('Cannot display image. ' + errorMessage);
    });
  });
});


function getPasswordUrl(url, callback, errorCallback) {

  var link = document.createElement('a')
  link.setAttribute('href', url)

  var domain = link.hostname

  console.log(domain)

  renderHost('Host: ' + domain)

  var x = new XMLHttpRequest()

  x.open('POST', 'http://localhost:12358/getPassword', true)
  x.responseType = 'json'
  x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')

  x.onload = function() {
    var response = x.response

    console.log(response)

    if (!response) {
      errorCallback('No response')
      return
    }

    if (response.error) {
      console.error(response.error)
      return
    }

    var results = response.pwds

    callback(results)
  }

  x.onerror = function() {
    errorCallback('Network error')
  }

  x.send('pwd=test')
}

function renderHost(host) {
  document.getElementById('host').textContent = host
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}