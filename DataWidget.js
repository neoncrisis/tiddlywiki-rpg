/*\
title: $:/plugins/neoncrisis/titansgrave/DataWidget.js
type: application/javascript
module-type: widget
\*/
(function() {
  "use strict";

  var utils = require("$:/plugins/neoncrisis/titansgrave/utilities.js");
  var YAML = require("$:/plugins/neoncrisis/titansgrave/js-yaml.min.js");
  var Widget = require("$:/core/modules/widgets/widget.js").widget;

  /// Simple widget that parses some data and trigges a macro
  var DataWidget = function(parseTreeNode, options) {
    this.initialise(parseTreeNode, options);
  };

  /// Inherit from Widget class
  DataWidget.prototype = new Widget();

  /// Render the widget into DOM
  DataWidget.prototype.render = function(parent, nextSibling) {
    this.parentDomNode = parent;
    this.computeAttributes();
    this.execute();
    this.renderChildren(parent, nextSibling);
  };

  /// Create a key from a parent key and a new key fragment
  DataWidget.prototype.compoundKey = function(parentKey, fragment) {
    if (parentKey && parentKey.length > 0) {
        return [parentKey, fragment].join(".");
    } else {
      return fragment;
    }
  };

  /// Recursively set context variables for the parsed data
  DataWidget.prototype.populateContext = function(parentKey, data) {
    if (utils.isArray(data)) {
      for (var i=0, max=data.length; i < max; i++) {
        var compoundKey = this.compoundKey(parentKey, i);
        this.populateContext(compoundKey, data[i]);
      }
    } else if (utils.isPlainObject(data)) {
      for (var key in data) {
        if (utils.hasOwnProperty(data, key)) {
          var compoundKey = this.compoundKey(parentKey, key);
          this.populateContext(compoundKey, data[key]);
        }
      }
    } else {
      this.setVariable(parentKey, ""+data);
    }
  };

  /// Extract the inner data text from the widget
  DataWidget.prototype.getDataText = function() {
    var children = this.parseTreeNode && this.parseTreeNode.children;
    var textWidget = children[children.length - 1] || {};

    if (textWidget.type == "text") {
      return textWidget.text || "";
    }

    return "";
  };

  /// Make a child object using the desired macro
  DataWidget.prototype.makeChildWidgets = function(parseTreeNodes) {
    this.children = [];

    var template = this.getAttribute("template");
    if (!template) {
      var treeNode = {type: "text", text: "Missing 'template' attribute"};
      var widget = this.makeChildWidget(treeNode);
      this.children = [widget];
      return
    }

    var dataText = this.getDataText();
    var context = {}, dataObject;

    try {
      dataObject = YAML.safeLoad(dataText);
      this.populateContext("", dataObject);
    } catch (e) {
      console.error(e, "Could not parse '", this.dataText, "' as YAML");
      return
    }

    // Call the desired macro with the parsed data
    var widget = this.makeChildWidget({type: "transclude", attributes: {
        tiddler: {type: "string", value: template},
        mode: {type: "string", value: "block"}
    }});

    this.children = [widget];
  };

  exports.data = DataWidget;
}());
