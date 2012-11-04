// ==UserScript== 
// @name           Unmask Signup Passwords
// @namespace      http://andresriofrio.com/
// @match          http://*/*
// @match          https://*/*
// ==/UserScript== 

// Inspired by:
// http://uxdesign.smashingmagazine.com/2012/10/26/password-masking-hurt-signup-form/

var PREFIX = "unmaskSignupPasswords";

function onFocus() {
  if(this.type == "text") return; // skip duplicate firings
  this.type = "text";

  var oldFontSize = parseInt(getComputedStyle(this).fontSize);
  var rawOldLineHeight = getComputedStyle(this).lineHeight;

  var newLineHeight;
  if(rawOldLineHeight.indexOf("px") != -1) {
    newLineHeight = parseInt(rawOldLineHeight);
  } else {
    newLineHeight = (parseInt(rawOldLineHeight) || 1.2) * oldFontSize;
  }
  if(!(PREFIX + "RegularLineHeight" in this.dataset))
    this.dataset[PREFIX + "RegularLineHeight"] = this.style.lineHeight;
  this.style.lineHeight = newLineHeight + "px";

  var newFontSize = Math.round((3/4)*oldFontSize);
  if(!(PREFIX + "RegularFontSize" in this.dataset))
    this.dataset[PREFIX + "RegularFontSize"] = this.style.fontSize;
  this.style.fontSize = newFontSize + "px";

  var newColor = "#aaa";
  if(!(PREFIX + "RegularColor" in this.dataset))
    this.dataset[PREFIX + "RegularColor"] = this.style.color;
  this.style.color = newColor;

  var newFontStyle = "italic";
  if(!(PREFIX + "RegularFontStyle" in this.dataset))
    this.dataset[PREFIX + "RegularFontStyle"] = this.style.fontStyle;
  this.style.fontStyle = newFontStyle;
};

function onBlur() {
  if(this.type == "password") return; // skip duplicate firings
  this.type = "password";

  this.style.fontSize = this.dataset[PREFIX + "RegularFontSize"];
  this.style.lineHeight = this.dataset[PREFIX + "RegularLineHeight"];
  this.style.color = this.dataset[PREFIX + "RegularColor"];
  this.style.fontStyle = this.dataset[PREFIX + "RegularFontStyle"];
};

function onChange() {
  document.getElementById(this.dataset[PREFIX + "Secondary"]).value = this.value;
}

var fields = document.querySelectorAll("input[type=password]");
for(var i=0; i<fields.length; i++) {
  var form = fields[i].form;
  var re = /(^reg$|register|registration|signup|createaccount)/i;
  if(re.test(form.action) || re.test(form.id) || re.test(form.name)) {
    if(PREFIX + "PasswordFieldId" in form.dataset) {
      var primary = document.getElementById(form.dataset[PREFIX + "PasswordFieldId"]);
      if(PREFIX + "Secondary" in primary.dataset) {
        console.log("wow! more than two password fields in one form! ignoring.");
      } else {
        fields[i].disabled = true;
        primary.dataset[PREFIX + "Secondary"] = fields[i].id;
        primary.addEventListener("input", onChange);

        // Fight with e.g. Google, so that the secondary password is not
        // cleared as the primary password is inputted.
        primary.addEventListener("blur", onChange);
        primary.addEventListener("change", onChange);
      }
    } else {
      form.dataset[PREFIX + "PasswordFieldId"] = fields[i].id;
      fields[i].addEventListener("focus", onFocus);
      fields[i].addEventListener("blur", onBlur);
    }
  }
}

