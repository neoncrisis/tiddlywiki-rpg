/*\
title: $:/plugins/neoncrisis/titansgrave/utilities.js
type: application/javascript
module-type: library
\*/
(function() {
  "use strict";

  // Configuration for our plugin
  var config = $tw.config.titansgrave || {};

  /// Check whether a property is an own property of an object
  var hasOwnProperty = exports.hasOwnProperty = function(object, key) {
    return $tw.utils.hop(object, key);
  };

  /// Check whether a value is an Array
  var isArray = exports.isArray = function(val) {
    return $tw.utils.isArray(val);
  };

  /// Check whether a value is an object
  var isObject = exports.isObject = function(val) {
    return val != null && typeof val === 'object' && isArray(val) === false;
  };

  function isObjectObject(o) {
    return isObject(o) === true
      && Object.prototype.toString.call(o) === '[object Object]';
  }

  /// Check whether a value is a POJO
  var isPlainObject = exports.isPlainObject = function(val) {
    var ctor,prot;

    if (isObjectObject(val) === false) return false;

    // If has modified constructor
    ctor = val.constructor;
    if (typeof ctor !== 'function') return false;

    // If has modified prototype
    prot = ctor.prototype;
    if (isObjectObject(prot) === false) return false;

    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false) {
      return false;
    }

    // Most likely a plain Object
    return true;
  };

  // Interpolate values into a tokenized string
  var interpolate = exports.interpolate = function(string, object) {
    return string.replace(/{([^{}]*)}/g, function(match, key) {
      var value = object[key];
      return typeof value === 'string' || typeof value === 'number' ? value : match;
    });
  };

  // Create a tag string for ability pages
  var ability_tag = exports.ability_tag = function() {
    return config.tags.ability;
  };

  // Create a tag string for focus pages
  var focus_tag = exports.focus_tag = function(ability) {
    return interpolate(config.tags.focus, {ability: ability});
  };

})();
