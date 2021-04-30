// ==UserScript==
// @name         figma hack
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  export image base64
// @author       FE-Sakamoto
// @match        http*://www.figma.com/file/*
// @icon         https://www.google.com/s2/favicons?domain=figma.com
// @grant        none
// ==/UserScript==
(function() {
  'use strict';

  let base64BtnWrapper = document.createElement('div');
  let base64Btn = document.createElement('button')
  base64Btn.innerText = 'base64'
  base64Btn.addEventListener('click', function(){
    // 缩放比选择器
    let scaleInputs = Array.apply(null, document.querySelectorAll('input[spellcheck="false"][autocomplete="new-password"][class^=raw_components--textInput]'))
    let scales = scaleInputs.map(ele => ele.value)
    let scalesSet = new Set(scales)
    if (scalesSet.size) {
      const {selection} = figma.currentPage
      if (!selection[0]) {
        alert('请选择要处理的节点')
        return
      }
      selection[0].exportAsync({
        format: 'PNG',
        constraint: {
          type: 'SCALE',
          value: 2
        }
      }).then(u8 => {
        let binary = ''
        for (let i = 0; i < u8.length; i++) {
          binary += String.fromCharCode(u8[i])
        }
        let base64 = window.btoa(binary)
        copyContent('data:image/png;base64,' + base64)
        console.log(base64)
      })
    }
    console.log(scales)
    console.log(Array.apply(null, scaleInputs))
  })
  base64BtnWrapper.appendChild(base64Btn)

  // 监听export 面板点击监听
  function addExportTabEventListener() {
    document.querySelectorAll('[data-label=export]')[0]?.addEventListener('click', function() {
      setTimeout(()=>{
        insertBase64Btn()
        addAddBtnEventListener()
      }, 100)
    })
  }

  // 给+号按钮添加监听
  function addAddBtnEventListener() {
    document.querySelectorAll('span[aria-label^=Add]')[0]?.addEventListener('click', function(){
      setTimeout(()=>{
        insertBase64Btn()
      }, 100)
    })
  }

  function insertBase64Btn() {
    let exportBtn = document.querySelectorAll('button[class*=export_panel--exportButton]')[0]
    if (exportBtn) {
      !base64Btn.className && base64Btn.classList.add(...exportBtn.className.split(' '))
      !base64BtnWrapper.className && base64BtnWrapper.classList.add(...exportBtn.parentElement.className.split(' '))
      exportBtn.parentElement.parentElement.insertBefore(base64BtnWrapper, exportBtn.parentElement.nextSibling);
    }
  }

  function copyContent(text) {
    if (typeof navigator.clipboard == "undefined") {
      const textarea = window.document.querySelector("#copy-area");
      textarea.value = text;
      textarea.focus();
      textarea.select();
      const successful = window.document.execCommand("copy");
      if (successful) {
        parent.postMessage({ pluginMessage: { type: "success" } }, "*");
      } else {
        parent.postMessage({ pluginMessage: { type: "fail" } }, "*");
      }
      return;
    }
    navigator.clipboard.writeText(text).then(
      function () {
        parent.postMessage({ pluginMessage: { type: "success" } }, "*");
      },
      function (err) {
        parent.postMessage({ pluginMessage: { type: "fail" } }, "*");
      }
    );
  }

  addExportTabEventListener()
})();
