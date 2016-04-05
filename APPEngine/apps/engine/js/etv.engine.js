
//TVUI命名空间
var TVUI = (function () {
    return {
        version : '1.2.0',
        //版本号

        uuid : 0,
        //全局唯一id标识，递增

        debug : false
        //debug开关，如果打开，页面支持按键清理缓存，蓝色键刷新，支持 TVUI.Log模版
    };
})();



//支持CMD方式加载
if (typeof define !== 'undefined') {
    define(function (require, exports, module) {
        module.exports = TVUI;
    });
}
;
/**
 *  JSON对象兼容模块
 */
if (!this.JSON) {
    this.JSON = {};
}
(function () {
    function f(n) {
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function () {
            return this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate()) + 'T' +
                f(this.getUTCHours()) + ':' +
                f(this.getUTCMinutes()) + ':' +
                f(this.getUTCSeconds()) + 'Z';
        };
        String.prototype.toJSON =
            Number.prototype.toJSON =
                Boolean.prototype.toJSON = function (key) {
                    return this.valueOf();
                };
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' :
            '"' + string + '"';
    }

    function str(key, holder) {
        var i,
            k,
            v,
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
            case 'string':
                return quote(value);
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
                    v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                            mind + ']' :
                            '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }
                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }
                v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', { '': value });
        };
    }
    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
            var j;

            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (/^[\],:{}\s]*$/.
                test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
                    replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
                    replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function' ?
                    walk({ '': j }, '') : j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }
})();;
//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

var Zepto = (function (undefined) {
    var key, $, classList, emptyArray = [], filter = emptyArray.filter,
        document = window.document,
        elementDisplay = {}, classCache = {},
        cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 },
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        rootNodeRE = /^(?:body|html)$/i,
        capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
        methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

        adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
        table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        containers = {
            'tr': document.createElement('tbody'),
            'tbody': table, 'thead': table, 'tfoot': table,
            'td': tableRow, 'th': tableRow,
            '*': document.createElement('div')
        },
        readyRE = /complete|loaded|interactive/,
        simpleSelectorRE = /^[\w-]*$/,
        class2type = {},
        toString = class2type.toString,
        zepto = {},
        camelize, uniq,
        tempParent = document.createElement('div'),
        propMap = {
            'tabindex': 'tabIndex',
            'readonly': 'readOnly',
            'for': 'htmlFor',
            'class': 'className',
            'maxlength': 'maxLength',
            'cellspacing': 'cellSpacing',
            'cellpadding': 'cellPadding',
            'rowspan': 'rowSpan',
            'colspan': 'colSpan',
            'usemap': 'useMap',
            'frameborder': 'frameBorder',
            'contenteditable': 'contentEditable'
        },
        isArray = Array.isArray ||
            function (object) {
                return object instanceof Array;
            };


    function type(obj) {
        return obj === null ? String(obj) :
            class2type[toString.call(obj)] || "object";
    }

    function isFunction(value) {
        return type(value) === "function";
    }

    function isWindow(obj) {
        return obj && obj !== null && obj === obj.window;
    }

    function isDocument(obj) {
        return obj && obj.nodeType === obj.DOCUMENT_NODE;
    }

    function isObject(obj) {
        return type(obj) === "object";
    }

    function isPlainObject(obj) {
        return obj && isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) === Object.prototype;
    }

    function likeArray(obj) {
        return obj && typeof obj.length === 'number';
    }

    function compact(array) {
        return filter.call(array, function (item) {
            return item !== null;
        });
    }

    function flatten(array) {
        return array.length > 0 ? $.fn.concat.apply([], array) : array;
    }


    function dasherize(str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase();
    }


    function classRE(name) {
        return name in classCache ?
            classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
    }

    function maybeAddPx(name, value) {
        return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value;
    }

    function defaultDisplay(nodeName) {
        var element, display;
        if (!elementDisplay[nodeName]) {
            element = document.createElement(nodeName);
            document.body.appendChild(element);
            display = getComputedStyle(element, '').getPropertyValue("display");
            element.parentNode.removeChild(element);
            display == "none" && (display = "block");
            elementDisplay[nodeName] = display;
        }
        return elementDisplay[nodeName];
    }

    function children(element) {
        return 'children' in element ?
            emptyArray.slice.call(element.children) :
            $.map(element.childNodes, function (node) {
                if (node.nodeType == 1) return node;
            });
    }

    function Z(dom, selector) {
        var i, len = dom ? dom.length : 0;
        for (i = 0; i < len; i++) this[i] = dom[i];
        this.length = len;
        this.selector = selector || '';
    }


    camelize = function (str) {
        return str.replace(/-+(.)?/g, function (match, chr) {
            return chr ? chr.toUpperCase() : '';
        });
    };
    uniq = function (array) {
        return filter.call(array, function (item, idx) {
            return array.indexOf(item) == idx;
        });
    };

    zepto.matches = function (element, selector) {
        if (!selector || !element || element.nodeType !== 1) return false;
        var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
            element.oMatchesSelector || element.matchesSelector;
        if (matchesSelector) return matchesSelector.call(element, selector);
        // fall back to performing a selector:
        var match, parent = element.parentNode, temp = !parent;
        if (temp) (parent = tempParent).appendChild(element);
        match = ~zepto.qsa(parent, selector).indexOf(element);
        temp && tempParent.removeChild(element);
        return match;
    };

    // `$.zepto.fragment` takes a html string and an optional tag name
    // to generate DOM nodes nodes from the given html string.
    // The generated DOM nodes are returned as an array.
    // This function can be overriden in plugins for example to make
    // it compatible with browsers that don't support the DOM fully.
    zepto.fragment = function (html, name, properties) {
        var dom, nodes, container;

        // A special case optimization for a single tag
        if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1));

        if (!dom) {
            if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>");
            if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
            if (!(name in containers)) name = '*';

            container = containers[name];
            container.innerHTML = '' + html;
            dom = $.each(emptyArray.slice.call(container.childNodes), function () {
                container.removeChild(this);
            });
        }

        if (isPlainObject(properties)) {
            nodes = $(dom);
            $.each(properties, function (key, value) {
                if (methodAttributes.indexOf(key) > -1) nodes[key](value);
                else nodes.attr(key, value);
            });
        }

        return dom;
    };

    // `$.zepto.Z` swaps out the prototype of the given `dom` array
    // of nodes with `$.fn` and thus supplying all the Zepto functions
    // to the array. This method can be overriden in plugins.
    zepto.Z = function (dom, selector) {
        return new Z(dom, selector);
    };

    // `$.zepto.isZ` should return `true` if the given object is a Zepto
    // collection. This method can be overriden in plugins.
    zepto.isZ = function (object) {
        return object instanceof zepto.Z;
    };

    // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
    // takes a CSS selector and an optional context (and handles various
    // special cases).
    // This method can be overriden in plugins.
    zepto.init = function (selector, context) {
        var dom;
        // If nothing given, return an empty Zepto collection
        if (!selector) return zepto.Z();
        // Optimize for string selectors
        else if (typeof selector == 'string') {
            selector = selector.trim();
            // If it's a html fragment, create nodes from it
            // Note: In both Chrome 21 and Firefox 15, DOM error 12
            // is thrown if the fragment doesn't begin with <
            if (selector[0] == '<' && fragmentRE.test(selector))
                dom = zepto.fragment(selector, RegExp.$1, context), selector = null;
            // If there's a context, create a collection on that context first, and select
            // nodes from there
            else if (context !== undefined) return $(context).find(selector);
            // If it's a CSS selector, use it to select nodes.
            else dom = zepto.qsa(document, selector);
        }
        // If a function is given, call it when the DOM is ready
        else if (isFunction(selector)) return $(document).ready(selector);
        // If a Zepto collection is given, just return it
        else if (zepto.isZ(selector)) return selector;
        else {
            // normalize array if an array of nodes is given
            if (isArray(selector)) dom = compact(selector);
            // Wrap DOM nodes.
            else if (isObject(selector))
                dom = [selector], selector = null;
            // If it's a html fragment, create nodes from it
            else if (fragmentRE.test(selector))
                dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null;
            // If there's a context, create a collection on that context first, and select
            // nodes from there
            else if (context !== undefined) return $(context).find(selector);
            // And last but no least, if it's a CSS selector, use it to select nodes.
            else dom = zepto.qsa(document, selector);
        }
        // create a new Zepto collection from the nodes found
        return zepto.Z(dom, selector);
    };

    // `$` will be the base `Zepto` object. When calling this
    // function just call `$.zepto.init, which makes the implementation
    // details of selecting nodes and creating Zepto collections
    // patchable in plugins.
    $ = function (selector, context) {
        return zepto.init(selector, context);
    };

    function extend(target, source, deep) {
        for (key in source) {
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key]))
                    target[key] = {};
                if (isArray(source[key]) && !isArray(target[key]))
                    target[key] = [];
                extend(target[key], source[key], deep);
            }
            else if (source[key] !== undefined) target[key] = source[key];
        }
    }

    // Copy all but undefined properties from one or more
    // objects to the `target` object.
    $.extend = function (target) {
        var deep, args = emptyArray.slice.call(arguments, 1);
        if (typeof target == 'boolean') {
            deep = target;
            target = args.shift();
        }
        args.forEach(function (arg) {
            extend(target, arg, deep);
        });
        return target;
    };

    // `$.zepto.qsa` is Zepto's CSS selector implementation which
    // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
    // This method can be overriden in plugins.
    zepto.qsa = function (element, selector) {
        var found,
            maybeID = selector[0] == '#',
            maybeClass = !maybeID && selector[0] == '.',
            nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
            isSimple = simpleSelectorRE.test(nameOnly);
        return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
            ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
            (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
                emptyArray.slice.call(
                        isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
                        maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
                            element.getElementsByTagName(selector) : // Or a tag
                        element.querySelectorAll(selector) // Or it's not simple, and we need to query all
                );
    };

    function filtered(nodes, selector) {
        return selector === null ? $(nodes) : $(nodes).filter(selector);
    }

    $.contains = document.documentElement.contains ?
        function (parent, node) {
            return parent !== node && parent.contains(node);
        } :
        function (parent, node) {
            while (node && (node = node.parentNode))
                if (node === parent) return true;
            return false;
        };

    function funcArg(context, arg, idx, payload) {
        return isFunction(arg) ? arg.call(context, idx, payload) : arg;
    }

    function setAttribute(node, name, value) {
        value === null ? node.removeAttribute(name) : node.setAttribute(name, value);
    }

    // access className property while respecting SVGAnimatedString
    function className(node, value) {
        var klass = node.className || '',
            svg = klass && klass.baseVal !== undefined;

        if (value === undefined) return svg ? klass.baseVal : klass;
        svg ? (klass.baseVal = value) : (node.className = value);
    }

    // "true"  => true
    // "false" => false
    // "null"  => null
    // "42"    => 42
    // "42.5"  => 42.5
    // "08"    => "08"
    // JSON    => parse if valid
    // String  => self
    function deserializeValue(value) {
        try {
            return value ?
                value == "true" ||
                ( value == "false" ? false :
                        value == "null" ? null :
                        +value + "" == value ? +value :
                    /^[\[\{]/.test(value) ? $.parseJSON(value) :
                        value )
                : value;
        } catch (e) {
            return value;
        }
    }

    $.type = type;
    $.isFunction = isFunction;
    $.isWindow = isWindow;
    $.isArray = isArray;
    $.isPlainObject = isPlainObject;

    $.isEmptyObject = function (obj) {
        var name;
        for (name in obj) return false;
        return true;
    };

    $.inArray = function (elem, array, i) {
        return emptyArray.indexOf.call(array, elem, i);
    };

    $.camelCase = camelize;
    $.trim = function (str) {
        if (typeof str == 'string') {
            return  String.prototype.trim.call(str);
        } else {
            return "";
        }
    };

    // plugin compatibility
    $.uuid = 0;
    $.support = { };
    $.expr = { };
    $.noop = function () {
    };

    $.map = function (elements, callback) {
        var value, values = [], i, key;
        if (likeArray(elements))
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i);
                if (value !== null) values.push(value);
            }
        else
            for (key in elements) {
                value = callback(elements[key], key);
                if (value !== null) values.push(value);
            }
        return flatten(values);
    };

    $.each = function (elements, callback) {
        var i, key;
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++)
                if (callback.call(elements[i], i, elements[i]) === false) return elements;
        } else {
            for (key in elements)
                if (callback.call(elements[key], key, elements[key]) === false) return elements;
        }

        return elements;
    };

    $.grep = function (elements, callback) {
        return filter.call(elements, callback);
    };

    if (window.JSON) $.parseJSON = JSON.parse;

    // Populate the class2type map
    $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
        class2type[ "[object " + name + "]" ] = name.toLowerCase();
    });

    // Define methods that will be available on all
    // Zepto collections
    $.fn = {
        constructor: zepto.Z,
        length: 0,

        // Because a collection acts like an array
        // copy over these useful array functions.
        forEach: emptyArray.forEach,
        reduce: emptyArray.reduce,
        push: emptyArray.push,
        sort: emptyArray.sort,
        splice: emptyArray.splice,
        indexOf: emptyArray.indexOf,
        concat: function () {
            var i, value, args = [];
            for (i = 0; i < arguments.length; i++) {
                value = arguments[i];
                args[i] = zepto.isZ(value) ? value.toArray() : value;
            }
            return emptyArray.concat.apply(zepto.isZ(this) ? this.toArray() : this, args);
        },

        // `map` and `slice` in the jQuery API work differently
        // from their array counterparts
        map: function (fn) {
            return $($.map(this, function (el, i) {
                return fn.call(el, i, el);
            }));
        },
        slice: function () {
            return $(emptyArray.slice.apply(this, arguments));
        },

        ready: function (callback) {
            // need to check if document.body exists for IE as that browser reports
            // document ready when it hasn't yet created the body element
            if (readyRE.test(document.readyState) && document.body) callback($);
            else document.addEventListener('DOMContentLoaded', function () {
                callback($);
            }, false);
            return this;
        },
        get: function (idx) {
            return idx === undefined ? emptyArray.slice.call(this) : this[idx >= 0 ? idx : idx + this.length];
        },
        toArray: function () {
            return this.get();
        },
        size: function () {
            return this.length;
        },
        remove: function () {
            return this.each(function () {
                if (this.parentNode !== null)
                    this.parentNode.removeChild(this);
            });
        },
        each: function (callback) {
            emptyArray.every.call(this, function (el, idx) {
                return callback.call(el, idx, el) !== false;
            });
            return this;
        },
        filter: function (selector) {
            if (isFunction(selector)) return this.not(this.not(selector));
            return $(filter.call(this, function (element) {
                return zepto.matches(element, selector);
            }));
        },
        add: function (selector, context) {
            return $(uniq(this.concat($(selector, context))));
        },
        is: function (selector) {
            return this.length > 0 && zepto.matches(this[0], selector);
        },
        not: function (selector) {
            var nodes = [];
            if (isFunction(selector) && selector.call !== undefined)
                this.each(function (idx) {
                    if (!selector.call(this, idx)) nodes.push(this);
                });
            else {
                var excludes = typeof selector == 'string' ? this.filter(selector) :
                    (likeArray(selector) && isFunction(selector.item)) ? emptyArray.slice.call(selector) : $(selector);
                this.forEach(function (el) {
                    if (excludes.indexOf(el) < 0) nodes.push(el);
                });
            }
            return $(nodes);
        },
        has: function (selector) {
            return this.filter(function () {
                return isObject(selector) ?
                    $.contains(this, selector) :
                    $(this).find(selector).size();
            });
        },
        eq: function (idx) {
            return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
        },
        first: function () {
            var el = this[0];
            return el && !isObject(el) ? el : $(el);
        },
        last: function () {
            var el = this[this.length - 1];
            return el && !isObject(el) ? el : $(el);
        },
        find: function (selector) {
            var result, $this = this;
            if (!selector) result = $();
            else if (typeof selector == 'object')
                result = $(selector).filter(function () {
                    var node = this;
                    return emptyArray.some.call($this, function (parent) {
                        return $.contains(parent, node);
                    });
                });
            else if (this.length == 1) result = $(zepto.qsa(this[0], selector));
            else result = this.map(function () {
                    return zepto.qsa(this, selector);
                });
            return result;
        },
        closest: function (selector, context) {
            var node = this[0], collection = false;
            if (typeof selector == 'object') collection = $(selector);
            while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
                node = node !== context && !isDocument(node) && node.parentNode;
            return $(node);
        },
        parents: function (selector) {
            var ancestors = [], nodes = this;
            while (nodes.length > 0)
                nodes = $.map(nodes, function (node) {
                    if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                        ancestors.push(node);
                        return node;
                    }
                });
            return filtered(ancestors, selector);
        },
        parent: function (selector) {
            return filtered(uniq(this.pluck('parentNode')), selector);
        },
        children: function (selector) {
            return filtered(this.map(function () {
                return children(this);
            }), selector);
        },
        contents: function () {
            return this.map(function () {
                return this.contentDocument || emptyArray.slice.call(this.childNodes);
            });
        },
        siblings: function (selector) {
            return filtered(this.map(function (i, el) {
                return filter.call(children(el.parentNode), function (child) {
                    return child !== el;
                });
            }), selector);
        },
        empty: function () {
            return this.each(function () {
                this.innerHTML = '';
            });
        },
        // `pluck` is borrowed from Prototype.js
        pluck: function (property) {
            return $.map(this, function (el) {
                return el[property];
            });
        },
        show: function () {
            return this.each(function () {
                this.style.display == "none" && (this.style.display = '');
                var style = getComputedStyle(this, '');
                if (style && style.getPropertyValue("display") == "none") {
                    this.style.display = defaultDisplay(this.nodeName);
                }
            });
        },
        replaceWith: function (newContent) {
            return this.before(newContent).remove();
        },
        wrap: function (structure) {
            var func = isFunction(structure);
            if (this[0] && !func)
                var dom = $(structure).get(0),
                    clone = dom.parentNode || this.length > 1;

            return this.each(function (index) {
                $(this).wrapAll(
                    func ? structure.call(this, index) :
                        clone ? dom.cloneNode(true) : dom
                );
            });
        },
        wrapAll: function (structure) {
            if (this[0]) {
                $(this[0]).before(structure = $(structure));
                var children;
                // drill down to the inmost element
                while ((children = structure.children()).length) structure = children.first();
                $(structure).append(this);
            }
            return this;
        },
        wrapInner: function (structure) {
            var func = isFunction(structure);
            return this.each(function (index) {
                var self = $(this), contents = self.contents(),
                    dom = func ? structure.call(this, index) : structure;
                contents.length ? contents.wrapAll(dom) : self.append(dom);
            });
        },
        unwrap: function () {
            this.parent().each(function () {
                $(this).replaceWith($(this).children());
            });
            return this;
        },
        clone: function () {
            return this.map(function () {
                return this.cloneNode(true);
            });
        },
        hide: function () {
            return this.css("display", "none");
        },
        toggle: function (setting) {
            return this.each(function () {
                var el = $(this);
                (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide();
            });
        },
        prev: function (selector) {
            return $(this.pluck('previousElementSibling')).filter(selector || '*');
        },
        next: function (selector) {
            return $(this.pluck('nextElementSibling')).filter(selector || '*');
        },
        html: function (html) {
            return 0 in arguments ?
                this.each(function () {
                    this.innerHTML = html;
                }) :
                (0 in this ? this[0].innerHTML : null);
        },
        text: function (text) {
            return 0 in arguments ?
                this.each(function (idx) {
                    var newText = funcArg(this, text, idx, this.textContent);
                    this.textContent = newText === null ? '' : '' + newText;
                }) :
                (0 in this ? this[0].textContent : null);
        },
        attr: function (name, value) {
            var result;
            return (typeof name == 'string' && !(1 in arguments)) ?
                (!this.length || this[0].nodeType !== 1 ? undefined :
                    (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
                    ) :
                this.each(function (idx) {
                    if (this.nodeType !== 1) return;
                    if (isObject(name)) for (key in name) setAttribute(this, key, name[key]);
                    else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)));
                });
        },
        removeAttr: function (name) {
            return this.each(function () {
                this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
                    setAttribute(this, attribute);
                }, this);
            });
        },
        prop: function (name, value) {
            name = propMap[name] || name;
            return (1 in arguments) ?
                this.each(function (idx) {
                    this[name] = funcArg(this, value, idx, this[name]);
                }) :
                (this[0] && this[0][name]);
        },
        data: function (name, value) {
            var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase();

            var data = (1 in arguments) ?
                this.attr(attrName, value) :
                this.attr(attrName);

            return data !== null ? deserializeValue(data) : undefined;
        },
        val: function (value) {
            return 0 in arguments ?
                this.each(function (idx) {
                    this.value = funcArg(this, value, idx, this.value);
                }) :
                (this[0] && (this[0].multiple ?
                    $(this[0]).find('option').filter(function () {
                        return this.selected;
                    }).pluck('value') :
                    this[0].value)
                    );
        },
        offset: function (coordinates) {
            if (coordinates) {
                return this.each(function (index) {
                    var $this = $(this),
                        coords = funcArg(this, coordinates, index, $this.offset()),
                        parentOffset = $this.offsetParent().offset(),
                        props = {
                            top: coords.top - parentOffset.top,
                            left: coords.left - parentOffset.left
                        };

                    if ($this.css('position') == 'static') props.position = 'relative';
                    $this.css(props);
                });
            }

            if (!this.length) return null;
            if (!$.contains(document.documentElement, this[0]))
                return {top: 0, left: 0, width: 0, height: 0 };
            var obj = this[0].getBoundingClientRect();
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                width: Math.round(obj.width),
                height: Math.round(obj.height)
            };
        },
        css: function (property, value) {
            if (arguments.length < 2) {
                var computedStyle, element = this[0];
                if (!element) return;
                computedStyle = getComputedStyle(element, '');
                if (typeof property == 'string')
                    return element.style[camelize(property)] || computedStyle.getPropertyValue(property);
                else if (isArray(property)) {
                    var props = {};
                    $.each(property, function (_, prop) {
                        props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop));
                    });
                    return props;
                }
            }

            var css = '';
            if (type(property) == 'string') {
                if (!value && value !== 0)
                    this.each(function () {
                        this.style.removeProperty(dasherize(property));
                    });
                else
                    css = dasherize(property) + ":" + maybeAddPx(property, value);
            } else {
                for (key in property)
                    if (!property[key] && property[key] !== 0)
                        this.each(function () {
                            this.style.removeProperty(dasherize(key));
                        });
                    else
                        css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
            }

            return this.each(function () {
                this.style.cssText += ';' + css;
            });
        },
        index: function (element) {
            return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0]);
        },
        hasClass: function (name) {
            if (!name) return false;
            return emptyArray.some.call(this, function (el) {
                return this.test(className(el));
            }, classRE(name));
        },
        addClass: function (name) {
            if (!name) return this;
            return this.each(function (idx) {
                if (!('className' in this)) return;
                classList = [];
                var cls = className(this), newName = funcArg(this, name, idx, cls);
                newName.split(/\s+/g).forEach(function (klass) {
                    if (!$(this).hasClass(klass)) classList.push(klass);
                }, this);
                classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "));
            });
        },
        removeClass: function (name) {
            return this.each(function (idx) {
                if (!('className' in this)) return;
                if (name === undefined) return className(this, '');
                classList = className(this);
                funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
                    classList = classList.replace(classRE(klass), " ");
                });
                className(this, classList.trim());
            });
        },
        toggleClass: function (name, when) {
            if (!name) return this;
            return this.each(function (idx) {
                var $this = $(this), names = funcArg(this, name, idx, className(this));
                names.split(/\s+/g).forEach(function (klass) {
                    (when === undefined ? !$this.hasClass(klass) : when) ?
                        $this.addClass(klass) : $this.removeClass(klass);
                });
            });
        },
        scrollTop: function (value) {
            if (!this.length) return;
            var hasScrollTop = 'scrollTop' in this[0];
            if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset;
            return this.each(hasScrollTop ?
                function () {
                    this.scrollTop = value;
                } :
                function () {
                    this.scrollTo(this.scrollX, value);
                });
        },
        scrollLeft: function (value) {
            if (!this.length) return;
            var hasScrollLeft = 'scrollLeft' in this[0];
            if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset;
            return this.each(hasScrollLeft ?
                function () {
                    this.scrollLeft = value;
                } :
                function () {
                    this.scrollTo(value, this.scrollY);
                });
        },
        position: function () {
            if (!this.length) return;

            var elem = this[0],
            // Get *real* offsetParent
                offsetParent = this.offsetParent(),
            // Get correct offsets
                offset = this.offset(),
                parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

            // Subtract element margins
            // note: when an element has margin: auto the offsetLeft and marginLeft
            // are the same in Safari causing offset.left to incorrectly be 0
            offset.top -= parseFloat($(elem).css('margin-top')) || 0;
            offset.left -= parseFloat($(elem).css('margin-left')) || 0;

            // Add offsetParent borders
            parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0;
            parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0;

            // Subtract the two offsets
            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        },
        offsetParent: function () {
            return this.map(function () {
                var parent = this.offsetParent || document.body;
                while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
                    parent = parent.offsetParent;
                return parent;
            });
        }
    };

    // for now
    $.fn.detach = $.fn.remove;

    // Generate the `width` and `height` functions

    ['width', 'height'].forEach(function (dimension) {
        var dimensionProperty =
            dimension.replace(/./, function (m) {
                return m[0].toUpperCase();
            });

        $.fn[dimension] = function (value) {
            var offset, el = this[0];
            if (value === undefined) {
                if (isWindow(el)) {
                    return  el['inner' + dimensionProperty];
                } else if (isDocument(el)) {
                    return el.documentElement['scroll' + dimensionProperty];
                } else {
                    //支持隐藏元素获取获取宽度高度
                    if (el && el.style && el.style.display == 'none') {
                        var clone = $(el).clone().insertAfter($(el)).show();
                        var val = clone.offset()[dimension];
                        clone.remove();
                        return val;
                    } else {
                        offset = $(this).offset();
                        return  offset ? offset[dimension] : 0;
                    }
                }

//                return isWindow(el) ? el['inner' + dimensionProperty] :
//                    isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
//                        (offset = this.offset()) && offset[dimension];
            }
            else {
                return this.each(function (idx) {
                    el = $(this);
                    el.css(dimension, funcArg(this, value, idx, el[dimension]()));
                });
            }
        };
    });

    function traverseNode(node, fun) {
        fun(node);
        for (var i = 0, len = node.childNodes.length; i < len; i++)
            traverseNode(node.childNodes[i], fun);
    }

    // Generate the `after`, `prepend`, `before`, `append`,
    // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
    adjacencyOperators.forEach(function (operator, operatorIndex) {
        var inside = operatorIndex % 2; //=> prepend, append

        $.fn[operator] = function () {
            // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
            var argType, nodes = $.map(arguments, function (arg) {
                    argType = type(arg);
                    return argType == "object" || argType == "array" || arg === null ?
                        arg : zepto.fragment(arg);
                }),
                parent, copyByClone = this.length > 1;
            if (nodes.length < 1) return this;

            return this.each(function (_, target) {
                parent = inside ? target : target.parentNode;

                // convert all methods to a "before" operation
                target = operatorIndex === 0 ? target.nextSibling :
                        operatorIndex == 1 ? target.firstChild :
                        operatorIndex == 2 ? target :
                    null;

                var parentInDocument = $.contains(document.documentElement, parent);

                nodes.forEach(function (node) {
                    if (copyByClone) node = node.cloneNode(true);
                    else if (!parent) return $(node).remove();

                    parent.insertBefore(node, target);
                    if (parentInDocument) traverseNode(node, function (el) {
                        if (el.nodeName !== null && el.nodeName.toUpperCase() === 'SCRIPT' &&
                            (!el.type || el.type === 'text/javascript') && !el.src)
                            window['eval'].call(window, el.innerHTML);
                    });
                });
            });
        };

        // after    => insertAfter
        // prepend  => prependTo
        // before   => insertBefore
        // append   => appendTo
        $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
            $(html)[operator](this);
            return this;
        };
    });

    zepto.Z.prototype = Z.prototype = $.fn;

    // Export internal API functions in the `$.zepto` namespace
    zepto.uniq = uniq;
    zepto.deserializeValue = deserializeValue;
    $.zepto = zepto;

    return $;
})();

// If `$` is not yet defined, point it to `Zepto`
window.Zepto = Zepto;
window.$ === undefined && (window.$ = Zepto);
window.TVUI && (window.TVUI.$ = Zepto);


;
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false*/

(function (root, factory) {
    var mustache = {};
    factory(mustache);
    root.View = mustache;
    /*    if (typeof exports === "object" && exports) {
     factory(exports); // CommonJS
     } else {
     var mustache = {};
     factory(mustache);
     if (typeof define === "function" && define.amd) {
     define(mustache); // AMD
     } else {
     root.Mustache = mustache; // <script>
     }
     }*/
}(TVUI, function (mustache) {

    var whiteRe = /\s*/;
    var spaceRe = /\s+/;
    var nonSpaceRe = /\S/;
    var eqRe = /\s*=/;
    var curlyRe = /\s*\}/;
    var tagRe = /#|\^|\/|>|\{|&|=|!/;

    // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
    // See https://github.com/janl/mustache.js/issues/189
    var RegExp_test = RegExp.prototype.test;

    function testRegExp(re, string) {
        return RegExp_test.call(re, string);
    }

    function isWhitespace(string) {
        return !testRegExp(nonSpaceRe, string);
    }

    var Object_toString = Object.prototype.toString;
    var isArray = Array.isArray || function (object) {
        return Object_toString.call(object) === '[object Array]';
    };

    function isFunction(object) {
        return typeof object === 'function';
    }

    function escapeRegExp(string) {
        return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    }

    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    function escapeTags(tags) {
        if (!isArray(tags) || tags.length !== 2) {
            throw new Error('Invalid tags: ' + tags);
        }

        return [
            new RegExp(escapeRegExp(tags[0]) + "\\s*"),
            new RegExp("\\s*" + escapeRegExp(tags[1]))
        ];
    }

    /**
     * Breaks up the given `template` string into a tree of tokens. If the `tags`
     * argument is given here it must be an array with two string values: the
     * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
     * course, the default is to use mustaches (i.e. mustache.tags).
     *
     * A token is an array with at least 4 elements. The first element is the
     * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
     * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
     * all template text that appears outside a symbol this element is "text".
     *
     * The second element of a token is its "value". For mustache tags this is
     * whatever else was inside the tag besides the opening symbol. For text tokens
     * this is the text itself.
     *
     * The third and fourth elements of the token are the start and end indices
     * in the original template of the token, respectively.
     *
     * Tokens that are the root node of a subtree contain two more elements: an
     * array of tokens in the subtree and the index in the original template at which
     * the closing tag for that section begins.
     */
    function parseTemplate(template, tags) {
        tags = tags || mustache.tags;
        template = template || '';

        if (typeof tags === 'string') {
            tags = tags.split(spaceRe);
        }

        var tagRes = escapeTags(tags);
        var scanner = new Scanner(template);

        var sections = [];     // Stack to hold section tokens
        var tokens = [];       // Buffer to hold the tokens
        var spaces = [];       // Indices of whitespace tokens on the current line
        var hasTag = false;    // Is there a {{tag}} on the current line?
        var nonSpace = false;  // Is there a non-space char on the current line?

        // Strips all whitespace tokens array for the current line
        // if there was a {{#tag}} on it and otherwise only space.
        function stripSpace() {
            if (hasTag && !nonSpace) {
                while (spaces.length) {
                    delete tokens[spaces.pop()];
                }
            } else {
                spaces = [];
            }

            hasTag = false;
            nonSpace = false;
        }

        var start, type, value, chr, token, openSection;
        while (!scanner.eos()) {
            start = scanner.pos;

            // Match any text between tags.
            value = scanner.scanUntil(tagRes[0]);
            if (value) {
                for (var i = 0, len = value.length; i < len; ++i) {
                    chr = value.charAt(i);

                    if (isWhitespace(chr)) {
                        spaces.push(tokens.length);
                    } else {
                        nonSpace = true;
                    }

                    tokens.push(['text', chr, start, start + 1]);
                    start += 1;

                    // Check for whitespace on the current line.
                    if (chr === '\n') {
                        stripSpace();
                    }
                }
            }

            // Match the opening tag.
            if (!scanner.scan(tagRes[0])) break;
            hasTag = true;

            // Get the tag type.
            type = scanner.scan(tagRe) || 'name';
            scanner.scan(whiteRe);

            // Get the tag value.
            if (type === '=') {
                value = scanner.scanUntil(eqRe);
                scanner.scan(eqRe);
                scanner.scanUntil(tagRes[1]);
            } else if (type === '{') {
                value = scanner.scanUntil(new RegExp('\\s*' + escapeRegExp('}' + tags[1])));
                scanner.scan(curlyRe);
                scanner.scanUntil(tagRes[1]);
                type = '&';
            } else {
                value = scanner.scanUntil(tagRes[1]);
            }

            // Match the closing tag.
            if (!scanner.scan(tagRes[1])) {
                throw new Error('Unclosed tag at ' + scanner.pos);
            }

            token = [ type, value, start, scanner.pos ];
            tokens.push(token);

            if (type === '#' || type === '^') {
                sections.push(token);
            } else if (type === '/') {
                // Check section nesting.
                openSection = sections.pop();

                if (!openSection) {
                    throw new Error('Unopened section "' + value + '" at ' + start);
                }
                if (openSection[1] !== value) {
                    throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
                }
            } else if (type === 'name' || type === '{' || type === '&') {
                nonSpace = true;
            } else if (type === '=') {
                // Set the tags for the next time around.
                tagRes = escapeTags(tags = value.split(spaceRe));
            }
        }

        // Make sure there are no open sections when we're done.
        openSection = sections.pop();
        if (openSection) {
            throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
        }

        return nestTokens(squashTokens(tokens));
    }

    /**
     * Combines the values of consecutive text tokens in the given `tokens` array
     * to a single token.
     */
    function squashTokens(tokens) {
        var squashedTokens = [];

        var token, lastToken;
        for (var i = 0, len = tokens.length; i < len; ++i) {
            token = tokens[i];

            if (token) {
                if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
                    lastToken[1] += token[1];
                    lastToken[3] = token[3];
                } else {
                    squashedTokens.push(token);
                    lastToken = token;
                }
            }
        }

        return squashedTokens;
    }

    /**
     * Forms the given array of `tokens` into a nested tree structure where
     * tokens that represent a section have two additional items: 1) an array of
     * all tokens that appear in that section and 2) the index in the original
     * template that represents the end of that section.
     */
    function nestTokens(tokens) {
        var nestedTokens = [];
        var collector = nestedTokens;
        var sections = [];

        var token, section;
        for (var i = 0, len = tokens.length; i < len; ++i) {
            token = tokens[i];

            switch (token[0]) {
                case '#':
                case '^':
                    collector.push(token);
                    sections.push(token);
                    collector = token[4] = [];
                    break;
                case '/':
                    section = sections.pop();
                    section[5] = token[2];
                    collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
                    break;
                default:
                    collector.push(token);
            }
        }

        return nestedTokens;
    }

    /**
     * A simple string scanner that is used by the template parser to find
     * tokens in template strings.
     */
    function Scanner(string) {
        this.string = string;
        this.tail = string;
        this.pos = 0;
    }

    /**
     * Returns `true` if the tail is empty (end of string).
     */
    Scanner.prototype.eos = function () {
        return this.tail === "";
    };

    /**
     * Tries to match the given regular expression at the current position.
     * Returns the matched text if it can match, the empty string otherwise.
     */
    Scanner.prototype.scan = function (re) {
        var match = this.tail.match(re);

        if (match && match.index === 0) {
            var string = match[0];
            this.tail = this.tail.substring(string.length);
            this.pos += string.length;
            return string;
        }

        return "";
    };

    /**
     * Skips all text until the given regular expression can be matched. Returns
     * the skipped string, which is the entire tail if no match can be made.
     */
    Scanner.prototype.scanUntil = function (re) {
        var index = this.tail.search(re), match;

        switch (index) {
            case -1:
                match = this.tail;
                this.tail = "";
                break;
            case 0:
                match = "";
                break;
            default:
                match = this.tail.substring(0, index);
                this.tail = this.tail.substring(index);
        }

        this.pos += match.length;

        return match;
    };

    /**
     * Represents a rendering context by wrapping a view object and
     * maintaining a reference to the parent context.
     */
    function Context(view, parentContext) {
        this.view = view == null ? {} : view;
        this.cache = { '.': this.view };
        this.parent = parentContext;
    }

    /**
     * Creates a new context using the given view with this context
     * as the parent.
     */
    Context.prototype.push = function (view) {
        return new Context(view, this);
    };

    /**
     * Returns the value of the given name in this context, traversing
     * up the context hierarchy if the value is absent in this context's view.
     */
    Context.prototype.lookup = function (name) {
        var value;
        if (name in this.cache) {
            value = this.cache[name];
        } else {
            var context = this;

            while (context) {
                if (name.indexOf('.') > 0) {
                    value = context.view;

                    var names = name.split('.'), i = 0;
                    while (value != null && i < names.length) {
                        value = value[names[i++]];
                    }
                } else {
                    value = context.view[name];
                }

                if (value != null) break;

                context = context.parent;
            }

            this.cache[name] = value;
        }

        if (isFunction(value)) {
            value = value.call(this.view);
        }

        return value;
    };

    /**
     * A Writer knows how to take a stream of tokens and render them to a
     * string, given a context. It also maintains a cache of templates to
     * avoid the need to parse the same template twice.
     */
    function Writer() {
        this.cache = {};
    }

    /**
     * Clears all cached templates in this writer.
     */
    Writer.prototype.clearCache = function () {
        this.cache = {};
    };

    /**
     * Parses and caches the given `template` and returns the array of tokens
     * that is generated from the parse.
     */
    Writer.prototype.parse = function (template, tags) {
        var cache = this.cache;
        var tokens = cache[template];

        if (tokens == null) {
            tokens = cache[template] = parseTemplate(template, tags);
        }

        return tokens;
    };

    /**
     * High-level method that is used to render the given `template` with
     * the given `view`.
     *
     * The optional `partials` argument may be an object that contains the
     * names and templates of partials that are used in the template. It may
     * also be a function that is used to load partial templates on the fly
     * that takes a single argument: the name of the partial.
     */
    Writer.prototype.render = function (template, view, partials) {
        var tokens = this.parse(template);
        var context = (view instanceof Context) ? view : new Context(view);
        return this.renderTokens(tokens, context, partials, template);
    };

    /**
     * Low-level method that renders the given array of `tokens` using
     * the given `context` and `partials`.
     *
     * Note: The `originalTemplate` is only ever used to extract the portion
     * of the original template that was contained in a higher-order section.
     * If the template doesn't use higher-order sections, this argument may
     * be omitted.
     */
    Writer.prototype.renderTokens = function (tokens, context, partials, originalTemplate) {
        var buffer = '';

        // This function is used to render an arbitrary template
        // in the current context by higher-order sections.
        var self = this;

        function subRender(template) {
            return self.render(template, context, partials);
        }

        var token, value;
        for (var i = 0, len = tokens.length; i < len; ++i) {
            token = tokens[i];

            switch (token[0]) {
                case '#':
                    value = context.lookup(token[1]);
                    if (!value) continue;

                    if (isArray(value)) {
                        for (var j = 0, jlen = value.length; j < jlen; ++j) {
                            buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
                        }
                    } else if (typeof value === 'object' || typeof value === 'string') {
                        buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
                    } else if (isFunction(value)) {
                        if (typeof originalTemplate !== 'string') {
                            throw new Error('Cannot use higher-order sections without the original template');
                        }

                        // Extract the portion of the original template that the section contains.
                        value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

                        if (value != null) buffer += value;
                    } else {
                        buffer += this.renderTokens(token[4], context, partials, originalTemplate);
                    }

                    break;
                case '^':
                    value = context.lookup(token[1]);

                    // Use JavaScript's definition of falsy. Include empty arrays.
                    // See https://github.com/janl/mustache.js/issues/186
                    if (!value || (isArray(value) && value.length === 0)) {
                        buffer += this.renderTokens(token[4], context, partials, originalTemplate);
                    }

                    break;
                case '>':
                    if (!partials) continue;
                    value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
                    if (value != null) buffer += this.renderTokens(this.parse(value), context, partials, value);
                    break;
                case '&':
                    value = context.lookup(token[1]);
                    if (value != null) buffer += value;
                    break;
                case 'name':
                    value = context.lookup(token[1]);
                    if (value != null) buffer += mustache.escape(value);
                    break;
                case 'text':
                    buffer += token[1];
                    break;
            }
        }

        return buffer;
    };

    mustache.name = "mustache.js";
    mustache.version = "0.8.1";
    mustache.tags = [ "{{", "}}" ];

    // All high-level mustache.* functions use this writer.
    var defaultWriter = new Writer();

    /**
     * Clears all cached templates in the default writer.
     */
    mustache.clearCache = function () {
        return defaultWriter.clearCache();
    };

    /**
     * Parses and caches the given template in the default writer and returns the
     * array of tokens it contains. Doing this ahead of time avoids the need to
     * parse templates on the fly as they are rendered.
     */
    mustache.parse = function (template, tags) {
        return defaultWriter.parse(template, tags);
    };

    /**
     * Renders the `template` with the given `view` and `partials` using the
     * default writer.
     */
    mustache.render = function (template, view, partials) {
        return defaultWriter.render(template, view, partials);
    };

    // This is here for backwards compatibility with 0.4.x.
    mustache.to_html = function (template, view, partials, send) {
        var result = mustache.render(template, view, partials);

        if (isFunction(send)) {
            send(result);
        } else {
            return result;
        }
    };

    // Export the escaping function so that the user may override it.
    // See https://github.com/janl/mustache.js/issues/244
    mustache.escape = escapeHtml;

    // Export these mainly for testing, but also for advanced usage.
    mustache.Scanner = Scanner;
    mustache.Context = Context;
    mustache.Writer = Writer;

}));
;
(function ($, TVUI) {
    var emptyArray = [],
        slice = emptyArray.slice;

    var Util = {
        slice: slice,
        encode: encodeURIComponent,
        // 以便用户重写默认全局解码函数
        decode: decodeURIComponent,
        /**
         * 作用域代理函数
         * @param func
         * @param obj
         * @returns {Function}
         */
        proxy: function (func, obj) {
            var args = slice.call(arguments, 2); //截取附加参数
            return function () {
                var innerArgs = slice.call(arguments); //获取全部fn参数
                var fianlArgs = innerArgs.concat(args); //合并参数
                return func.apply(obj, fianlArgs);
            };
        },
        /**
         * 判断是否一个类数组
         * @param obj
         * @returns {boolean}
         */
        likeArray: function (obj) {
            if (typeof obj === 'undefined') {
                return false;
            }

            var length = obj.length,
                type = $.type(obj);

            if ($.isWindow(obj)) {
                return false;
            }

            if (obj.nodeType === 1 && length) {
                return true;
            }

            return type === "array" || type !== "function" &&
                ( length === 0 || typeof length === "number" && type === 'object' && length > 0 && ( length - 1 ) in obj );

        },
        /**
         * 把伪数组转换成真数组，常用来转换元素集合和arguments
         * @param args
         * @returns {Array}
         */
        makeArray: function (args) {
            return Array.prototype.slice.call(args);
        },
        queryToJson: function (str, sep, eq) {
            //兼容最常用的 parse(location.search);
            var obj = {};
            str = str.replace(/^[^\?]*\?/, "");
            sep = sep || "&";
            eq = eq || "=";
            var arr, self = this, reg = new RegExp("(?:^|\\" + sep + ")([^\\" + eq + "\\" + sep + "]+)(?:\\" + eq + "([^\\" + sep + "]*))?", "g");
            while ((arr = reg.exec(str)) !== null) {
                if (arr[1] !== str) {
                    obj[self.decode(arr[1])] = self.decode(arr[2] || "");
                }
            }

            return obj;
        },
        getParam: function (name, url) {
            if (url) {
                return this.queryToJson(url)[name];
            } else {
                if (!this.__queryCache) {
                    this.__queryCache = this.queryToJson(location.search);
                }
                return this.__queryCache[name];
            }
        },
        param: function (obj, sep, eq) {
            var i, arr = [], self = this;
            sep = sep || "&";
            eq = eq || "=";
            for (i in obj) {
                if (obj.hasOwnProperty(i) && obj[i] !== null) {
                    arr.push(self.encode(i) + (obj[i] === "" ? "" : eq + self.encode(obj[i])));
                }
            }
            return arr.join(sep);
        },
        getFileName: function (pathName) {
            var path = pathName || location.pathname,
                start = path.lastIndexOf('/') + 1,
                end = path.lastIndexOf('.');
            return path.substring(start, end);
        },
        log: function (a, b, c, d, e) {
            //四川机顶盒有console，但不支持 console.log.apply
            if (!window.DataAccess && typeof console !== 'undefined' && console.log) {
                try {
                    console.log.apply(console, slice.call(arguments));
                } catch (err) {
                    switch (arguments.length) {
                        case 0:
                            console.log();
                            break;
                        case 1:
                            console.log(a);
                            break;
                        case 2:
                            console.log(a, b);
                            break;
                        case 3:
                            console.log(a, b, c);
                            break;
                        case 4:
                            console.log(a, b, c, d);
                            break;
                        case 5:
                            console.log(a, b, c, d, e);
                            break;
                    }
                }
            }
        },
        guid: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }).toUpperCase();
        },
        /**
         * 数字前面补零
         * @param num  原始数字
         * @param n  几位数
         * @returns {*}
         */
        pad: function (num, n) {
            var len = num.toString().length;
            while (len < n) {
                num = '0' + num;
                len++;
            }
            return num;
        },
        /**
         * 循环从数组中取出指定数量项
         * @param data
         * @param num 取几项
         * @param index 在中间的是第几项，从0开始
         * @returns {Array}
         */
        range: function (data, num, index) {
            var len = data.length,
                count = parseInt((num - 1) / 2),
                result = [],
                left = count,
                right = num - left - 1,
                i,
                j;

            i = j = index;
            result.push(data[index]);

            while (left > 0) {
                i--;
                i = i < 0 ? len - 1 : i;
                result.unshift(data[i]);
                left--;
            }

            while (right > 0) {
                j++;
                j = j > len - 1 ? 0 : j;
                result.push(data[j]);
                right--;

            }
            return result;
        },
        /**
         * 循环从数组中取出指定数量项
         * @param data
         * @param num 取几项
         * @param index 左边第一项是第几个
         * @returns {Array}
         */
        rangeLeft: function (data, num, index) {
            var len = data.length,
                result = [],
                right = data.length >= num ? num - 1 : data.length - 1,
                i = index;

            result.push(data[index]);

            while (right > 0) {
                i++;
                i = i > len - 1 ? 0 : i;
                result.push(data[i]);
                right--;
            }

            return result;
        },
        /**
         * 从数组中取出指定数量项
         * @param data
         * @param num 取几项
         * @param index 当前是第几个
         * @returns {Array}
         */
        rangeFixed: function (data, num, index) {
            var left = ((num - 1) / 2) | 0;
            left = index - left < 0 ? 0 : index - left;
            var right = left + num - 1, total = data.length, result = [];
            if (total > num) {
                while (left > total - num) {
                    if (left > 0) {
                        left--;
                    }
                    right--;
                }
            } else {
                left = 0;
                right = total - 1;
            }
            for (var i = left; i <= right; i++) {
                result.push(data[i]);
            }
            return result;
        },
        timeout: function (func, time, obj) {
            return setTimeout(this.proxy(func, obj), time);
        },
        date: function (dateStr, format, options) {
            if (!dateStr) {
                return (new Date());
            }
            var obj = null;
            if (typeof dateStr === 'string' && /Date/.test(dateStr)) {
                var d = dateStr.replace(/\//g, '');
                obj = eval('(new ' + d + ')');
            } else {
                obj = typeof dateStr === 'string' ? new Date(dateStr.replace(/-/g, '/')) : dateStr;
            }

            var setting = {
                y: 0, //年
                M: 0, // 月
                d: 0, //日
                h: 0, //时
                m: 0, //分
                s: 0 //秒
            };

            $.extend(setting, options || {});

            obj = new Date(setting.y + obj.getFullYear(),
                setting.M + obj.getMonth(),
                setting.d + obj.getDate(),
                setting.h + obj.getHours(),
                setting.m + obj.getMinutes(),
                setting.s + obj.getSeconds());
            var o = {
                "M+": obj.getMonth() + 1,
                "d+": obj.getDate(),
                "h+": obj.getHours(),
                "m+": obj.getMinutes(),
                "s+": obj.getSeconds(),
                "q+": Math.floor((obj.getMonth() + 3) / 3),
                "S": obj.getMilliseconds()
            };
            if (format) {
                if (/(y+)/.test(format)) {
                    format = format.replace(RegExp.$1,
                        RegExp.$1.length == 4 ?
                            obj.getFullYear() :
                            (obj.getFullYear() + "").substr(4 - RegExp.$1.length));
                }
                for (var k in o) {
                    if (new RegExp("(" + k + ")").test(format)) {
                        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                            o[k] :
                            ("00" + o[k]).substr(("" + o[k]).length));
                    }
                }
                return format;
            }
            else {
                return obj;
            }
        },
        tpl: function (template, data) {
            if (!template) {
                return;
            }
            template = template.replace(/%7B/gi, '{').replace(/%7D/gi, '}');

            var regex = /\{\$(\w+)\}/g,
                html = [];
            var replace = function (obj) {
                return template.replace(regex, function (str, match) {
                    if (match in obj) {
                        return obj[match];
                    }
                    else {
                        return str;
                    }
                });
            };

            if ($.isArray(data)) {
                for (var i = 0, len = data.length; i < len; i++) {
                    var item = data[i];
                    item._index = i;
                    html.push(replace(item));
                }
            } else {
                html.push(replace(data));
            }
            return html.join('');

        },
        getCharCount: function (str) {
            if (str) {
                return str.replace(/[^\x00-\xff]/g, "xx").length;
            } else {
                return -1;
            }
        },
        subStr: function (str, len) {
            var newLength = 0,
                newStr = "",
                chineseRegex = /[^\x00-\xff]/g,
                singleChar = "",
                strLength = str.replace(chineseRegex, "**").length;
            for (var i = 0; i < strLength; i++) {
                singleChar = str.charAt(i).toString();
                if (singleChar.match(chineseRegex) !== null) {
                    newLength += 2;
                }
                else {
                    newLength++;
                }
                if (newLength > len) {
                    break;
                }
                newStr += singleChar;
            }

            if (strLength > len) {
                newStr += "..";
            }
            return newStr;
        },
        /**
         * 获取机顶盒类型，个人不建议使用这个方法做适配，推荐用能力检测
         * @returns {string}
         */
        getSTBType: function () {
            if (window.DataAccess && window.SysSetting) {
                return 'gd'; //广东STB
            } else if (window.DataAccess && window.FileManager) {
                return 'sc';//四川STB
            } else {
                return null; //电脑浏览器
            }

        }

    };

    /**
    * 是否广东机顶盒
    */
    Util.isGD = Util.getSTBType() == 'gd';

    /**
     * 是否四川机顶盒
     */
    Util.isSC = Util.getSTBType() == 'sc';

    TVUI.Util = Util;

})(Zepto, TVUI);
;
/**
 * 按键常量
 * @type {{}}
 */
TVUI.Key = {

    //遥控器按键
    NUM0: 48, //0x0030,  数字键0
    NUM1: 49, //0x0031,  数字键1
    NUM2: 50, //0x0032,  数字键2
    NUM3: 51, //0x0033,  数字键3
    NUM4: 52, //0x0034,  数字键4
    NUM5: 53, //0x0035,  数字键5
    NUM6: 54, //0x0036,  数字键6
    NUM7: 55, //0x0037,  数字键7
    NUM8: 56, //0x0038,  数字键8
    NUM9: 57, //0x0039,  数字键9
    EXIT: 27, //0x0003,  取消/退出键,即CANCEL
    CHANNEL_DOWN: 91, //0x01AC,  遥控器上的频道减少键
    CHANNEL_UP: 93, //0x01AB,  遥控器上的频道增加键
    RED: 320, //0x0193,  遥控器上的功能键COLORED_KEY_0,RocME中代表红色按键
    YELLOW: 322, //0x0194,  遥控器上的功能键COLORED_KEY_1,RocME中代表黄色按键
    BLUE: 323,  //0x0195,  遥控器上的功能键COLORED_KEY_2,RocME中代表蓝色按键
    GREEN: 321,  //0x0196,  遥控器上的功能键COLORED_KEY_3,RocME中代表绿色按键
    EPG: 69, //458   //0x01CA,  遥控器上的节目指南键,预告键,即GUIDE
    INFO: 73,  //0x01C9,  遥控器上的信息键
    MENU: 72,  //0x01D4,  遥控器上的菜单键
    VOLUME_MUTE: 67,   //0x01C1,  遥控器上的静音键
    SELECT: 13,  //0x000D,  遥控器上的确定键,即OK
    VOLUME_DOWN: 45, //0x01C0,  遥控器上音量减小键
    VOLUME_UP: 61, //0x01BF,  遥控器上的音量增大键
    DOWN: 83,  //0x0028,  遥控器上的向下键
    UP: 87,  //0x0026,  遥控器上的向上键
    LEFT: 65,  //0x0025,  遥控器上的向左键
    RIGHT: 68, //0x0027,  遥控器上的向右键
    POWER: 19,  //0xFFFF,  遥控器上的指示关机与开机键
    PAGE_UP: 306, //0x0021,  遥控器上的向上翻页键
    PAGE_DOWN: 307,  //0x0022,  遥控器上的向下翻页键
    TRACK: 86, //0x0197,  遥控器上的声道键,即AUDIO
    LIKE: 76, //0x01CB,  遥控器上的字幕键/频道喜爱键,即TELETEXT
    BACK: 8, //0x0280,  遥控器上的返回键,即TOGGLE
    PROGRAM_LIST: 641, //0x0281,  遥控器上的频道列表键或咨询键,即PROG_LIST
    TV_RADIO: 642, //0x0282,  遥控器上的指示"电视/音频广播"键
    NVOD: 315, //0x0283,  遥控器上的卡信息或点播键,交互键, 即CARD_INFO
    MAIL: 77, //0x0284,  遥控器上的邮件键
    STAR: 318, //星号键
    POUND: 319,  //#键
    INVALID: 90513,  //0x0201,  未知按键码，SMSX自定义
    STATE: 514,   //0x0202,  遥控器上的状态键，SMSX自定义
    DC: 515, //0x0203,  遥控器上的数据广播键，SMSX自定义
    SORT: 516,  //0x0204,  遥控器上的节目分类键，SMSX自定义
    GAME: 517,  //0x0205,  遥控器上的游戏键，SMSX自定义
    LAST_CHANNEL: 314, //0x0208,  遥控器上的电视回看键，SMSX自定义
    PAUSE: 59, //0x0211,  遥控器上的暂停按键，SMSX自定义
    HOMEPAGE: 72, //0x0213,  遥控器上的主页面键，SMSX自定义
    MOSAIC: 532,  //0x0214,  遥控器上的马赛克键，SMSX自定义
    STOCK: 533, //0x0215,  遥控器上的股票键，SMSX自定义
    VIDEO: 313,  //0x0216,  遥控器上的电视键，SMSX自定义
    AUDIO: 535, //0x0217,  遥控器上的广播键，SMSX自定义
    PLAY: 39, //0x0309,  天津项目中代表 :  [播放] 键
    STOP: 47, //0x0306,  天津项目中代表 :  [停止] 键
    FUN1: 518, //0x0206,  天津项目中代表 :  [视讯] 键
    FUN2: 519,  //0x0207,  天津项目中代表 :  [点播] 键
    FUN3: 769, //20769   //0x0301,  天津项目中代表 :  [股票] 键
    FUN4: 770, //20770   //0x0302,  天津项目中代表 :  [信箱] 键
    FUN5: 771, //0x0303,  天津项目中代表 :  [步进] 键
    FUN6: 772,  //0x0304,  天津项目中代表 :  [上一单元] 键
    FUN7: 773,  //0x0305,  天津项目中代表 :  [下一单元] 键
    FUN9: 44, //0x0307,  天津项目中代表 :  [快退] 键
    FUN10: 46, //0x0308,  天津项目中代表 :  [快进] 键
    FUN12: 59,  //0x030A,  天津项目中代表 :  [暂停/时移] 键
    FUN13: 82, //0x030B,  天津项目中代表 :  [录制] 键
    FUN14: 780, //0x030C,  天津项目中代表 :  [ V+/PIP移动 ] 键
    FUN15: 781, //0x030D,  天津项目中代表 :  [ V-/PIP互换 ] 键
    FUN16: 782,  //0x030E,  天津项目中代表 :  [PIP ] 键
    FUN17: 783, //0x030F,  天津项目中代表 :  [预定] 键
    FUN18: 784, //0x0310,  天津项目中代表 :  [全部] 键
    FUN19: 785,  //0x0311,  天津项目中代表 :  [] 键
    FUN20: 319,  //0x0312,  天津项目中代表 :  # 键


    //系统事件
    DVB_SEARCH_FINISH: 10001, // 自动、手动或全频段搜索已完毕
    DVB_SEARCH_FAILED: 10002, // 自动、手动或全频段搜索失败
    DVB_SEARCH_START: 10003, // 开始搜索某个频点
    DVB_SEARCH_SERVICE_READY: 10004, // 在当前频点下,已经搜索到service
    DVB_SEARCH_STOP: 10005,  // 成功终止频道搜索
    DVB_TUNE_SUCCESS: 10031, // 成功锁定频点
    DVB_TUNE_FAILED: 10032, // 锁频失败
    DVB_NIT_CHANGED: 10041, // NIT版本变化
    DVB_NIT_NETWORK_DESCRIPTOR_READY: 10042,  // 已获取到NIT表的某个Network_Descriptor值
    DVB_NIT_TS_DESCRIPTOR_READY: 10043, // 已获取到NIT表的某个Transport_Descriptor值
    DVB_NIT_TABLE_READY: 10044,  // 已获取到整个NIT表内容
    DVB_BAT_BOUQUET_DESCRIPTOR_READY: 10081,  // 已获取到BAT表的某个Bouquet_Descriptor值
    DVB_BAT_TS_DESCRIPTOR_READY: 10082,   // 已获取到BAT表的某个Transport_Descriptor值
    DVB_SDT_SERVICE_DESCRIPTOR_READY: 10091, // 已获取到SDT表的某个Service_Descriptor的值
    DATA_DEL_ALL_SUCC: 10101, // 成功清除A、B、D区中PSI/SI数据
    DATA_DEL_ALL_FAILED: 10102,  // 无法清除A、B、D区中PSI/SI数据
    DATA_DEL_TMP_SUCC: 10103, // 成功清除D区PSI/SI数据
    DATA_DEL_TMP_FAILED: 10104,  // 无法清除D区PSI/SI数据
    DATA_UPDATE_SUCC: 10105,  // 成功用D区更新A区数据
    DATA_UPDATE_FAILED: 10106,  // 无法用D区更新A区数据
    DATA_REVERT_SUCC: 10107,   // 成功用B区更换A区数据
    DATA_REVERT_FAILED: 10108,  // 无法用B区更换A区数据
    DATA_SAVE_SUCC: 10109, // 成功将A区数据写入B区
    DATA_SAVE_FAILED: 10110, // 无法将A区数据写入B区
    DATA_BACKUP_SUCC: 10111,  // 成功将B区数据备份到C区
    DATA_BACKUP_FAILED: 10112,  // 无法将B区数据备份到C区
    DATA_RESTORE_SUCC: 10113, // 成功恢复A、B区数据
    DATA_RESTORE_FAILED: 10114, // 无法恢复A、B区数据
    EPG_SEARCH_SUCC: 10201, // 成功完成EPG搜索
    EPG_SEARCH_STOP_WHEN_RST_TO_MAX: 10202, // 搜索结果达到255个,搜索自动停止
    EPG_SEARCH_TIMEOUT: 10203, // 搜索EPG超时
    EPG_ACTUAL_PF_READY: 10204,  // 当前频点actual PF信息收取完毕.如果当前频道PF信息更新,则会再次发送此消息.
    EPG_OTHER_PF_READY: 10205,  // 当前频点other PF信息收取完毕.
    EPG_ACTUAL_SCHEDULE_READY: 10206,  // 当前频点actual schedule信息收取完毕.
    EPG_OTHER_SCHEDULE_READY: 10207,  // 当前频点other schedule信息收取完毕.
    DVB_EIT_EVENT_DESCRIPTOR_READY: 10208,  // 已获取到EIT表的某个Event_Descriptor的值
    NVOD_REFEVENT_READY: 10221,   // 接收NVOD参考事件成功,如果当前NVOD参考业务PF信息更新,则会再次发送此消息.
    NVOD_REFEVENT_TIMEOUT: 10222, // NVOD参考事件接收超时
    NVOD_TISHIEVENT_READY: 10223,  // 接收NVOD时移事件成功.
    NVOD_TISHIEVENT_TIMEOUT: 10224,  // NVOD时移事件接收超时
    NVOD_TISHIEVENT_END: 10225,   // NVOD时移事件结束
    CA_SMARTCARD_INSERT: 10401,  // 智能卡已插入
    CA_SMARTCARD_EVULSION: 10402, // 智能卡已拔出
    CA_MSG_INFO: 10403,    // CA 的提示信息,为CA指定(CA_INFO)
    CA_MSG_ALARM: 10404, // CA 的警告信息,为CA指定(CA_ALARM)
    CA_MSG_COMMAND: 10405,  // CA 的命令信息,为CA指定(CA_COMMAND)
    CA_MSG_STATUS: 10406,   // CA的状态信息,为CA指定(CA_STATUS)
    NETWORK_CONNECTED: 10501,  // 网线已插上
    NETWORK_DISCONNECTED: 10502,  // 网线已断开
    LAN_NETWORK_CONNECTED: 10503, // LAN模式网络已连接.
    LAN_NETWORK_DISCONNECTED: 10504,  // LAN模式网络已断开.
    LAN_NETWORK_DHCP_ENABLE_SUCCESS: 10508, // DHCP功能启用成功
    LAN_NETWORK_DHCP_ENABLE_TIMEOUT: 10509, // DHCP功能启用超时
    NTPTIME_SYNC_SUCC: 10521, // 网络NTP时间同步成功.
    NTPTIME_SYNC_TIMEOUT: 10522,  // 网络 NTP时间同步超时.
    PING_RESPONSE: 10523,  // PING命令响应.
    IP_UPDATED: 10524,    // IP地址有更新
    WRITE_FLASH_SUCC: 10601, // Flash写入成功
    OTA_FORCE_UPGRADE: 10701,   // OTA强制升级信息
    OTA_MANUAL_UPGRADE: 10702,  // OTA手动升级信息
    OTA_ANALY_UPGRADE_DATA: 10703,  // OTA 获取并分析升级数据
    OTA_ANALY_NIT_SUCCESS: 10704,  // OTA 获取并分析NIT成功
    OTA_ANALY_NIT_FAILED: 10705,  // OTA 获取并分析NIT失败
    OTA_ANALY_PAT_SUCCESS: 10706,  // OTA 获取并分析PAT成功
    OTA_ANALY_PAT_FAILED: 10707,  // OTA 获取并分析PAT失败
    OTA_ANALY_PMT_SUCCESS: 10708,  // OTA 获取并分析PMT成功
    OTA_ANALY_PMT_FAILED: 10709,   // OTA 获取并分析PMT失败
    OTA_BURNING: 10710, // OTA 烧录升级参数到flash
    OTA_BURNING_SUCCESS: 10711,  // OTA 烧录升级参数到flash成功
    OTA_BURNING_FAILED: 10712,  // OTA 烧录升级参数到flash失败
    OTA_UPDATE_SUCCESS: 10713,  // OTA 升级参数获取成功,重启升级
    OTA_NO_UPDGRADE_INFO: 10714,  // 未检测到OTA升级信息
    ORDERD_EVENT_WILL_START: 10801,  // 用户预定的节目将要开始  （该消息在预订节目开始前N分钟触发，N由数据访问接口中的bookedInformTime字段值指定）
    ORDERD_EVENT_START: 10802, // 用户预定的节目开始
    VOD_END_OF_STREAM: 10901,
    VOD_BEGIN_OF_STREAM: 10902,
    VOD_S1_ANNOUNCE_TERMINATE: 10903,
    VOD_C1_ANNOUNCE_TERMINATE: 10904,
    VOD_EXCEPTION: 11000,
    CAEXT_INQUIRE_IPP: 11701, // IPP即时购买提示框
    CAEXT_HIDDEN_PROGRAM: 11702,   // 隐藏节目不能观看的提示框
    VOD_EXTINIT_OVER: 20004,
    EMAIL: 11536,


    //************ 主应用自定义消息 *************
    SEARCH_DEL_TEMP_FAILED: 80001, //删除缓存失败
    SEARCH_FAILED: 80002,  //搜索失败
    SEARCH_STOP: 80012, //成功停止
    SEARCH_SAVE_FAILED: 80006,  //保存失败
    SEARCH_SAVE_SUCC: 80007,  //保存成功
    SEARCH_TUNE_FAILED: 80008, //锁频失败
    SEARCH_TUNE_SUCC: 80009, //锁频成功
    SEARCH_READY: 80010 //搜索到节目
};

//兼容浏览器和机顶盒
if (!window.DataAccess) {
    TVUI.Key.DOWN = 40;
    TVUI.Key.UP = 38;
    TVUI.Key.LEFT = 37;
    TVUI.Key.RIGHT = 39;
    TVUI.Key.BACK = 32;
    TVUI.Key.PAGE_UP = 33;
    TVUI.Key.PAGE_DOWN = 34;
};
TVUI.Lang = {
    zh: {
        T_1: '确定',
        T_2: '取消',
        T_3: '关闭',
        T_4: '退出',
        T_5: '播放',
        T_6: '续播',
        T_7: '锁频失败',
        T_8: '无法在当前频点找到节目描述信息,请联系客服96956.',
        T_9: '不可用媒资',
        T_10: '网络繁忙，请稍候!',
        T_11: '无权限操作',
        T_12: '推流会话中断,请联系客服电话96956,错误码:C1-10909-',
        T_13: '点播失败,是否重新点播?',
        T_14: '点播会话中断,请联系客服电话96956,错误码:S1-10904-',
        T_15: '提示'
    },
    en: {
        T_1: 'OK',
        T_2: 'Cancel',
        T_3: 'Close',
        T_4: 'Exit',
        T_5: 'Play',
        T_6: 'Resume',
        T_7: 'Locking frequency failed',
        T_8: 'Program information in not found , pls call 96956.',
        T_9: 'Not available media resources!',
        T_10: 'The network is busy, pls wait!',
        T_11: 'No permission to operate.',
        T_12: 'Flow session is interrupted,pls call 96956, error code:C1-10909-',
        T_13: 'On demand failed, whether to replay or not?',
        T_14: 'On demand session is interrupted,pls call 96956,error code:S1-10904-',
        T_15: 'Prompt'
    }
};

//提供方法给外部继承
TVUI.Lang.extend = function (lang) {
    Zepto.extend(TVUI.Lang, lang || {});
};
;
/**
 * ajax 模块，扩展Zepto，暂时不支持jsonp
 *ex：
 * 1) $.ajax(options);
 *
 *    options:{
 *          type: 'GET',
 *          url: '',
 *          data: null,
 *          success: empty,
 *          error: empty,
 *          complete: empty,
 *          timeout: 0,
 *          cache: true,
 *          dataType: 'text',
 *          headers: null,
 *          async: true
 *    }
 *
 *
 * 2) $.get(url [,data] [,callback] [,dataType]);
 * 3) $.post(url [,data] [,callback] [,dataType]);
 * 4) $.getJSON(url [,data] [,callback]);
 * 5) $.getScript(url [,callback]);
 */
(function (TVUI) {
    var util = TVUI.Util,
        $ = TVUI.$,
        name,
        scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i,
        jsonType = 'application/json',
        htmlType = 'text/html',
        blankRE = /^\s*$/;

    function empty() {
    }


    var accepts = {
        script: 'text/javascript, application/javascript, application/x-javascript',
        json: jsonType,
        xml: 'application/xml, text/xml',
        html: htmlType,
        text: 'text/plain'
    };

    function xmlHttp() {
        return new window.XMLHttpRequest();
    }

    function mimeToDataType(mime) {
        if (mime) mime = mime.split(';', 2)[0];
        return mime && ( mime == htmlType ? 'html' :
                mime == jsonType ? 'json' :
            scriptTypeRE.test(mime) ? 'script' :
                xmlTypeRE.test(mime) && 'xml' ) || 'text';
    }

    function appendQuery(url, query) {
        if (query === '') return url;
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    }


    function ajax(options) {

        var settings = $.extend({
            type: 'GET',
            url: '',
            data: null,
            success: empty,
            error: empty,
            complete: empty,
            timeout: 0,
            cache: true,
            dataType: 'text',
            headers: null,
            async: true
        }, options || {});

        var abortTimeout,
            dataType = settings.dataType,
          //  hasPlaceholder = /\?.+=\?/.test(settings.url),
            mime = accepts[dataType],
            headers = { },
            setHeader = function (name, value) {
                headers[name.toLowerCase()] = [name, value];
            },
            xhr = xmlHttp(),
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            nativeSetHeader = xhr.setRequestHeader;

        if ((mime = settings.mimeType || mime)) {
            if (mime.indexOf(',') > -1) {
                mime = mime.split(',', 2)[0];
            }
            xhr.overrideMimeType && xhr.overrideMimeType(mime);
        }

        if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET')) {
            setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');
        }

        if (settings.headers) {
            for (name in settings.headers) {
                setHeader(name, settings.headers[name]);
            }
        }


        if (typeof settings.data === 'object') {
            settings.data = util.param(settings.data);
        }

        if (settings.data && settings.type.toUpperCase() == 'GET') {
            settings.url = appendQuery(settings.url, settings.data);
            //delete settings.data;
        }

        if (settings.cache === false) {
            settings.url = appendQuery(settings.url, '_=' + (new Date()).getTime());
        }


        xhr.setRequestHeader = setHeader;

        xhr.onreadystatechange = function () {

            if (xhr.readyState == 4) {
                xhr.onreadystatechange = empty;
                clearTimeout(abortTimeout);
                var result, error = false;
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status === 0 && protocol == 'file:')) {

                    dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'));
                    result = xhr.responseText;
                    try {
                        // http://perfectionkills.com/global-eval-what-are-the-options/
                        if (dataType == 'script') {
                            eval(result + '');
                        }
                        else if (dataType == 'xml') {
                            result = xhr.responseXML;
                        }
                        else if (dataType == 'json') {
                            result = blankRE.test(result) ? null : JSON.parse(result);
                        }
                    } catch (err) {
                        error = err;
                    }

                    if (error) {
                        settings.error(error, 'parsererror', xhr, settings);
                    }
                    else {
                        settings.success(result, xhr, settings);
                    }
                    settings.complete(xhr.status, xhr, settings);

                } else {
                    settings.error(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings);
                    settings.complete(xhr.status, xhr, settings);
                }
            }

        };

        if (settings.timeout > 0) {
            abortTimeout = setTimeout(function () {
                alert('timeout');
                xhr.onreadystatechange = empty;
                xhr.abort();
                settings.error(null, 'timeout', xhr, settings);
            }, settings.timeout);
        }

        xhr.open(settings.type, settings.url, settings.async, '', '');
        for (name in headers) {
            nativeSetHeader.apply(xhr, headers[name]);
        }


        try {
            xhr.send(settings.data ? settings.data : null);
        } catch (err) {
        }


        return xhr;

    }

    function parseArguments(url, data, success, dataType) {
        if ($.isFunction(data)) {
            dataType = success;
            success = data;
            data = undefined;
        }
        if (!$.isFunction(success)) {
            dataType = success;
            success = undefined;
        }
        return {
            url: url,
            data: data,
            success: success,
            dataType: dataType
        };
    }

    $.extend(TVUI.$,{
        ajax: ajax,
        // url, data, success, dataType
        get: function () {
            return ajax(parseArguments.apply(null, arguments));
        },
        // url, data, success, dataType
        post: function () {
            var options = parseArguments.apply(null, arguments);
            options.type = 'POST';
            return ajax(options);
        },
        // url, data, success
        getJSON: function () {
            var options = parseArguments.apply(null, arguments);
            options.dataType = 'json';
            return ajax(options);
        },
        getScript: function () {
            var options = parseArguments.apply(null, arguments);
            options.dataType = 'script';
            options.cache = false;
            return ajax(options);
        }
    });


})(TVUI);;
/**
 * 事件模块，提供dom事件绑定和删除功能
 */
(function ($, TVUI, window) {
    var Event,

    //长按键时间, 按住键超过这个时间连续触发，常用音量和换台
        _longKeyTime = 500,

    //连续触发时间间隔
        _interval = 200,

    //组合键计算时间
        _comKeyTime = 2000,

    //document对象
        _doc = window.document,

    //事件句柄缓存对象,所有绑定的事件都保存在这里，格式：[{type: type, handler: handler, scope: scope}]
        _handlers = {},

    //键值字典
        _key = TVUI.Key,

        _eventMap = {
            'load': window,
            'unload': window,
            'beforeunload': window,
            'keyup': _doc,
            'keydown': _doc,
            'keypress': _doc
        },

        /**
         * dom事件绑定函数
         * @param type 事件名称，如：keyup、keydown
         * @param handler 事件句柄函数
         * @param scope 作用域，就是handler中的 this 指向的对象
         * @returns {TVUI.uuid|*} 返回唯一的标识id
         */
        addEvent = function (type, handler, scope) {
            _handlers[++TVUI.uuid] = {type: type, handler: handler, scope: scope};
            (_eventMap[type] || _doc).addEventListener(type, handler, false);
            return TVUI.uuid;
        },

        /**
         * 删除dom事件
         * @param type  事件名称
         * @param handler 事件句柄
         *
         * ex：
         * 1）、removeEvent(type, handler) 删除具体一个事件
         * 2）、removeEvent(type) 删除指定一类事件，例如要删除keyup的全部事件 removeEvent('keyup')
         * 3) 、removeEvent()  删除所有事件
         */
        removeEvent = function (type, handler) {
            var key, evt;
            if (type) {
                //有传递删除事件类型
                if (handler) {
                    //有传递删除事件回调函数
                    _doc.removeEventListener(type, handler, false);
                    for (key in _handlers) {
                        evt = _handlers[key];
                        if (evt.type == type && evt.handler == handler) {
                            delete _handlers[key];
                            break;
                        }
                    }
                } else {
                    //没有传递事件回调函数，即删除该事件类型的全部事件
                    for (key in _handlers) {
                        evt = _handlers[key];
                        if (evt.type == type) {
                            _doc.removeEventListener(evt.type, evt.handler, false);
                            delete _handlers[evt];
                        }
                    }

                }
            } else {
                //删除所有事件
                for (key in _handlers) {
                    evt = _handlers[key];
                    _doc.removeEventListener(evt.type, evt.handler, false);
                }
                _handlers = {};
            }

        },
        /**
         * 根据事件唯一标识id删除事件
         * @param id
         */
        removeEventById = function (id) {
            var evt = _handlers[id] || {};
            _doc.removeEventListener(evt.type, evt.handler, false);
            delete _handlers[id];
        },
        /**
         * 阻止事件默认行为
         * @param evt
         * @returns {boolean}
         */
        preventDefault = function (evt) {
            if (evt && evt.preventDefault) {
                evt.preventDefault();
            }
            else {
                window.event.returnValue = false;
            }
            return false;
        },
        /**
         * 根据keyCode模拟一个dom事件对象
         * @param keyCode
         * @returns {{preventDefault: preventDefault, keyCode: *, which: *}}
         */
        createEvent = function (keyCode) {
            var evt = {
                preventDefault: function () {
                },
                keyCode: keyCode,
                which: keyCode
            };
            return evt;
        },
        /**
         * 修复事件对象，　由于浏览器，中间件对原生事件对象的不同，在这里做适配处理
         * @param evt
         * @returns {*|Event}
         */
        fixEvent = function (evt) {
            //对浏览器的事件兼容
            var e = evt || window.event;

            //对中间件事件对象的支持
            e.type = e.type || null;
            e.which = e.keyCode = e.which || e.keyCode || null;
            e.modifiers = e.modifiers || null;
            return e;
        };

    Event = {
        preventDefault: preventDefault,
        /**
         * dom事件绑定函数
         * @param type 事件名称，如：keyup、keydown
         * @param handler 事件句柄函数
         * @param scope 作用域，就是handler中的 this 指向的对象
         * @returns {TVUI.uuid|*} 返回唯一的标识id
         */
        on: function (type, handler, scope) {
            return addEvent(type, function (evt) {
                handler && handler.call(scope || handler, fixEvent(evt));
            });
        },
        /**
         * 删除dom事件
         * @param type  事件名称
         * @param handler 事件句柄
         *
         * ex：
         * 1）、off(type, handler) 删除具体一个事件
         * 2）、off(type) 删除指定一类事件，例如要删除keyup的全部事件 off('keyup')
         * 3) 、off()  删除所有事件
         * 4）、off(id) 删除指定id标识的事件
         * 5）、off(ids) 删除指定id标识数组的事件
         */
        off: function (type, handler) {
            var t = $.type(type);
            if (t === 'number') {
                removeEventById(type);
            } else if (t === 'array') {
                for (var i = 0, len = type.length; i < len; i++) {
                    arguments.callee(type[i]);
                }
            } else {
                removeEvent.apply(removeEvent, arguments);
            }
        },
        /**
         * 触发事件
         * @param type 事件名称
         * @param keyCode 模拟事件keyCode
         *
         */
        fire: function (type, keyCode) {
            for (var key in _handlers) {
                var e = _handlers[key];
                if (e.type == type) {
                    e.handler.call(e.scope, createEvent(keyCode));
                }
            }
        },
        /**
         * 按键事件，不需要长按连续触发的，建议使用这个绑定方式，提高性能
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {TVUI.uuid|*} 事件唯一标识
         */
        onPress: function (callback, scope) {
            return this.on('keyup', callback, scope);
        },
        /**
         * 按键事件，这种绑定方式支持长按连续触发
         * @param code 按键的keyCode
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {*[]} 事件唯一标识数组
         */
        onKey: function (code, callback, scope) {
            var tick1, tick2, diff, timer1 = null, timer2 = null, downId, upId;
            downId = this.on('keydown', function (e) {
                if (e.which == code) {
                    tick1 = (new Date()).getTime();
                    if (!timer1) {
                        timer1 = setTimeout(function () {
                            timer2 = setInterval(function () {
                                callback && callback.call(scope, e);
                            }, _interval);

                        }, _longKeyTime);
                    }
                }
            }, scope);

            upId = this.on('keyup', function (e) {
                clearTimeout(timer1);
                clearInterval(timer2);
                timer1 = timer2 = null;
                tick2 = (new Date()).getTime();
                diff = tick2 - tick1;
                //如果按住键的时间没达到长键值，即触发常规按键
                if (diff < _longKeyTime) {
                    if (e.which == code) {
                        callback && callback.call(scope, e);
                    }
                }
            }, scope);
            return [downId, upId];
        },
        /**
         * 绑定多个按键事件
         * @param codes 按键keyCode数组
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {Array} 事件唯一标识数组
         */
        onKeys: function (codes, callback, scope) {
            var self = this, ids = [];
            $.each(codes, function (i, n) {
                ids = ids.concat(self.onKey(n, callback, scope));
            });
            return ids;
        },
        /**
         * 确定键事件
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {*[]} 事件唯一标识数组
         */
        onOk: function (callback, scope) {
            return this.onKey(_key.SELECT, callback, scope);
        },
        /**
         * 方向左键事件
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {*[]} 事件唯一标识数组
         */
        onLeft: function (callback, scope) {
            return this.onKey(_key.LEFT, callback, scope);
        },
        /**
         * 方向右键事件
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {*[]} 事件唯一标识数组
         */
        onRight: function (callback, scope) {
            return this.onKey(_key.RIGHT, callback, scope);
        },
        /**
         * 方向上键事件
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {*[]} 事件唯一标识数组
         */
        onUp: function (callback, scope) {
            return this.onKey(_key.UP, callback, scope);
        },
        /**
         * 方向下键事件
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {*[]} 事件唯一标识数组
         */
        onDown: function (callback, scope) {
            return this.onKey(_key.DOWN, callback, scope);
        },
        /**
         * 同时绑定 上下左右 键事件
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象，并且有direction属性标识按键的方向
         * @param scope 作用域
         * @returns {Array} 事件唯一标识数组
         */
        onMove: function (callback, scope) {
            var keys = [_key.UP, _key.RIGHT, _key.DOWN, _key.LEFT];
            return this.onKeys(keys, function (e) {
                switch (e.which) {
                    case _key.UP:
                        e.direction = 'up';
                        callback && callback.call(scope, e.direction, e);
                        break;
                    case _key.RIGHT:
                        e.direction = 'right';
                        callback && callback.call(scope, e.direction, e);
                        break;
                    case _key.DOWN:
                        e.direction = 'down';
                        callback && callback.call(scope, e.direction, e);
                        break;
                    case _key.LEFT:
                        e.direction = 'left';
                        callback && callback.call(scope, e.direction, e);
                        break;
                }
            }, scope);
        },
        /**
         * 绑定数字键 0~9 事件
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象，并且有number属性标识按键的数字
         * @param scope 作用域
         * @returns {TVUI.uuid|*} 事件唯一标识
         */
        onNumber: function (callback, scope) {
            return this.on('keyup', function (e) {
                if (e.which >= _key.NUM0 && e.which <= _key.NUM9) {
                    e.number = parseInt(e.which - _key.NUM0, 10);
                    callback && callback.call(scope, e);
                }
            }, scope);
        },
        /**
         * 组合按键事件，例如 96956 这类的事件
         * @param codes 组合的keyCode数组
         * @param callback 事件回调函数，回调函数参数是事件对象，就是fixEvent后的对象
         * @param scope 作用域
         * @returns {TVUI.uuid|*} 事件唯一标识
         */
        onComKey: function (codes, callback, scope) {
            var _event = {};
            _event.timerId = null;
            _event.keyTime = null;
            _event._lastKeys = [];
            return this.on('keyup', function (e) {
                clearTimeout(_event.timerId);
                var now = (new Date()).getTime();
                if (!_event.keyTime || now - _event.keyTime < _comKeyTime) {
                    _event._lastKeys.push(e.which);
                    _event.keyTime = now;
                }
                if (codes.join(',') == _event._lastKeys.join(',')) {
                    e.comKeys = codes;
                    _event._lastKeys = [];
                    _event.keyTime = null;
                    callback && callback.call(scope, e);
                }
                _event.timerId = setTimeout(function () {
                    _event._lastKeys = [];
                    _event.keyTime = null;
                }, _comKeyTime);

            }, scope);
        },
        /**
         * 数字组合键，例如输入频道号
         * @param change 数字改变时回调，参数 num 数值
         * @param callback 完成时回调，参数 num 数值
         * @param scope 作用域
         * @returns {Array} 事件唯一标识数组
         */
        onComNumber: function (change, callback, scope) {
            var _event = {}, evt1, evt2, evtArray = [];
            _event.timerId = null;
            _event.keyTime = null;
            _event._lastKeys = [];
            evt1 = this.onNumber(function (e) {
                clearTimeout(_event.timerId);
                var now = (new Date()).getTime();
                if (!_event.keyTime || now - _event.keyTime < _comKeyTime) {
                    _event._lastKeys.push(e.number);
                    _event.keyTime = now;
                    change && change.call(scope, _event._lastKeys.join(''), e);
                }
                _event.timerId = setTimeout(function () {
                    callback && callback.call(scope, _event._lastKeys.join(''), e);
                    _event._lastKeys = [];
                    _event.keyTime = null;
                }, _comKeyTime);
            }, scope);

            evt2 = this.onOk(function (e) {
                if (_event._lastKeys.length > 0) {
                    clearTimeout(_event.timerId);
                    callback && callback.call(scope, _event._lastKeys.join(''), e);
                    _event._lastKeys = [];
                    _event.keyTime = null;
                }
            }, scope);
            return evtArray.concat(evt1).concat(evt2);
        },
        /**
         * 绑定系统事件
         * @param callback 事件回调函数，回调函数参数是事件对象
         * @param scope 作用域
         * @returns {TVUI.uuid|*} 事件唯一标识
         */
        onSystem: function (callback, scope) {
            return this.on('systemevent', function (e) {
                callback && callback.call(scope, e);
            }, scope);
        }
    };


    TVUI.Event = Event;

})(Zepto, TVUI, window);;
/**
 * 类构建模块
 */

(function ($, TVUI) {

    var util = TVUI.Util;

    /**
     * 类构建工厂函数
     * @param parent  父类，可选
     * @returns {_class}
     * @constructor
     *
     * ex：
     * 1） Class() 创建一个类
     * 2） Class(parent) 创建一个类，并继承parent类
     * 3） Class.create() 创建一个类
     * 4)  Class.create(includeObj) 创建一类，并添加实例方法
     * 5） Class.create(includeObj, parent) 创建一个类，继承parent，并添加实例方法
     */
    function Class(parent) {
        function _class() {
            //实例化时执行初始化
            this._init.apply(this, arguments);
            this.init.apply(this, arguments);
        }

        /**
         * 底层初始化函数，自动运行
         * @private
         */
        _class.prototype._init = function () {
        };
        /**
         * 初始化函数，自动在_init执行后执行
         */
        _class.prototype.init = function () {
        };

        if (parent) {
            var F = function () {
            };
            $.extend(true, F.prototype, parent.prototype);
            _class.prototype = new F();
            _class.prototype.parent = parent;
        }
        /**
         * 添加实例方法函数
         * @param obj 方法集合对象
         * @returns {_class}
         *
         * ex：
         *  var Person = Class();
         *  Person.include({
         *      say : function(){
         *          //to do something
         *      }
         *  })
         *
         *  var person = new Person();
         *  person.say(); // 这样person就有了say的方法
         */
        _class.include = function (obj) {
            var included = obj.included;
            delete obj.included;
            $.extend(_class.prototype, obj, true);
            included && included(_class);
            return this;
        };

        /**
         * 添加静态方法
         * @param obj 静态方法集合对象
         * @returns {_class}
         *
         * ex:
         * var Person = Class();
         * Person.extend({
         *    say : function(){
         *      //to do something
         *    }
         * });
         * Person.say(); // Person拥有了say的方法
         */
        _class.extend = function (obj) {
            var extended = obj.extended;
            delete obj.extended;
            $.extend(true, _class, obj);
            extended && extended(_class);
            return this;
        };

        /**
         * 代理函数，用做替换函数的作用域
         * @param func 要提供作用域的函数，在func函数内部的this指向实例
         * @param args 可选，附加参数
         * @returns {*}
         */
        _class.proxy = function (func, args) {
            return util.proxy(func, this, args);
        };

        /**
         * 代理多个函数
         * ex:
         *  this.proxyAll('func1', 'func2', .......);
         */
        _class.proxyAll = function () {
            var arr = util.slice.call(arguments);
            for (var i = 0, len = arr.length; i < len; i++) {
                this[arr[i]] = this.proxy(this[arr[i]]);
            }
        };
        //给实例也添加代理方法
        _class.prototype.proxy = _class.proxy;
        _class.prototype.proxyAll = _class.proxyAll;

        return _class;
    }

    /**
     * 类构建快捷方式
     * @param include 可选，实例方法集合
     * @param parent 可选，父类
     * @returns {*}
     */
    Class.create = function (include, parent) {
        return Class(parent).include(include || {});
    };

    TVUI.Class = Class;

})(Zepto, TVUI);

;
/**
 * 基类模块，提供基础功能的对象
 */
(function ($, TVUI) {
    var util = TVUI.Util,
        Class = TVUI.Class,
        Event = TVUI.Event;

    //自定义事件
    var customEvent = {

        /**
         *绑定自定义事件
         * @param ev  事件名称
         * @param callback 回调函数
         * @returns {_event} 对象
         * ex：
         * 1） on('event1', callback)
         * 2) on('event1 event2', callback) 绑定多个事件，空格隔开
         */
        on: function (ev, callback) {
            //可以侦听多个事件，用空格隔开
            var evs = ev.split(" ");
            //创建_callbacks对象，除非它已经存在了
            var calls = this._callbacks || (this._callbacks = {});
            for (var i = 0; i < evs.length; i++) {
                //针对给定的事件key创建一个数组，除非这个数组已经存在
                //然后将回调函数追加到这个数组中
                (this._callbacks[evs[i]] || (this._callbacks[evs[i]] = [])).push(callback);
            }
            return this;
        },
        /**
         * 触发事件, 第一个参数是事件名称
         * 调用举例 fire(eventName, param1, param2.....)
         * @returns {boolean} 是否已经触发
         */
        fire: function () {
            //将arguments对象转换成真正的数组
            var args = util.makeArray(arguments);
            //拿出第一个参数，即事件名称
            var ev = args.shift();
            var list, calls, i, l;
            //如果不存在_callbacks对象，则返回
            if (!(calls = this._callbacks)) {
                return false;
            }
            //如果不包含给定事件对应的数组，也返回
            if (!(list = this._callbacks[ev])) {
                return false;
            }
            //触发数组中的回调
            for (i = 0, l = list.length; i < l; i++) {
                if (list[i].apply(this, args) === false) {
                    break;
                }
            }
            return true;
        },
        /**
         * 销毁事件
         * @param ev  事件名称，可选，为空即销毁对象的所有事件
         * @param callback  句柄，可选
         * @returns {_event}
         *
         * ex:
         * 1) off('event1', callback) 删除对象指定一个事件
         * 2) off('event1') 删除对象指定一类事件
         * 3) off() 删除改对象的全部事件
         */
        off: function (ev, callback) {
            //如果不传入事件名称，即把所有事件都清除
            if (!ev) {
                this._callbacks = {};
                return this;
            }
            var list, calls, i, l;
            //如果不存在_callbacks对象，则返回
            if (!(calls = this._callbacks)) {
                return this;
            }
            //如果不包含给定事件对应的数组，也返回
            if (!(list = this._callbacks[ev])) {
                return this;
            }
            //如果不存入回调函数，即把该事件对应的数组全部清空
            if (!callback) {
                delete this._callbacks[ev];
                return this;
            }
            //删除指定事件名称和回调的事件
            for (i = 0, l = list.length; i < l; i++) {
                if (callback === list[i]) {
                    list.splice(i, 1);
                    break;
                }
            }
            return this;
        }
    };

    /**
     * 基类
     * @type {*}
     */
    var Base = Class.create({
        /**
         * 底层初始化函数
         * @private
         */
        _init: function () {
            /**
             * 对象唯一id标识
             * @type {number}
             */
            this.id = ++TVUI.uuid;

            /**
             * 事件标识id数组，绑定的事件id将记录在这里，用作销毁
             * @type {Array}
             * @private
             */
            this.__eventIdArray = [];

            /**
             * 状态，是否激活的，如果非激活的，不接收dom事件
             * @type {boolean}
             * @private
             */
            this._active = true;
        },
        /**
         * 注册事件，缓存事件的id
         * @param id  事件id标识
         */
        registerEvent: function (id) {
            this.__eventIdArray = this.__eventIdArray.concat(id);
        },
        /**
         * 销毁对象
         */
        destroy: function () {
            //触发销毁事件
            this.fire('destroy', this);
            Event.off(this.__eventIdArray);
            this.off();
        },
        /**
         * 激活对象
         * @param index 可选，第几个菜单项获得焦点
         */
        active: function (index) {
            this._active = true;

            //触发激活事件
            this.fire('active', this, index);
        },
        /**
         * 取消激活
         */
        unActive: function () {
            this._active = false;

            //触发取消激活事件
            this.fire('unActive', this);
        }
    });

    //类实例添加自定义事件支持
    Base.include(customEvent);

    //类对象添加自定义事件支持
    Base.extend(customEvent);

    TVUI.Base = Base;

})(Zepto, TVUI);;
/**
 * 中间件通讯模块，适配中间api
 */
(function (TVUI, JSON) {
    var util = TVUI.Util,
        key = TVUI.Key,
        $ = TVUI.$;

    var empty = function () {
        },
        noop = function () {
            util.log(arguments);
        },
        isSTB = !!window.DataAccess && !!window.SysSetting;


    /**
     * DataAccess 适配
     * @type {{info: info, save: save, revert: revert, volume: volume, volumn: volumn}}
     */
    var da = {
        /**
         * 适配中间件的DataAccess.getInfo (ClassName,InfoName) 和  DataAccess.setInfo (ClassName,InfoName,InfoValue)
         * @param className 字符串，分类名
         * @param infoName 字符串，要设置的数据名称
         * @param infoValue 字符串，要设置的数据值
         * @returns {*}
         *
         * ex：
         * 1) TVUI.API.DataAccess.info(className, infoName, infoValue) 设置
         * 2）TVUI.API.DataAccess.info(className, infoName) 读取
         */
        info: function (className, infoName, infoValue) {
            if (!isSTB) {
                util.log('msg:', 'DataAccess undefined. do: da.info');
                return '';
            }
            if (infoValue) {
                DataAccess.setInfo(className, infoName, infoValue);
                this.save(className, infoName);
            } else {
                return  DataAccess.getInfo(className, infoName);
            }
        },
        /**
         * 将内存中的指定数据写入Flash
         * @param className 字符串，分类名
         * @param infoName 字符串，要设置的数据名称
         */
        save: function (className, infoName) {
            if (typeof DataAccess == 'undefined') {
                util.log('msg:', 'DataAccess undefined. do:da.save');
            } else {
                DataAccess.save(className, infoName);
            }
        },
        /**
         * 将Flash中的指定数据读取到内存
         * @param className 字符串，分类名
         * @param infoName 字符串，要设置的数据名称
         */
        revert: function (className, infoName) {
            if (typeof DataAccess == 'undefined') {
                util.log('msg:', 'DataAccess undefined do:da.revert');
            } else {
                DataAccess.revert(className, infoName);
            }
        },
        /**
         * 设置音量
         * @param val
         * @returns {Number} 数值 0~32
         */
        volume: function (val) {
            if ($.type(val) == 'number' || $.type(val) == 'string') {
                val = val > 32 ? 32 : val;
                val = val < 0 ? 0 : val;
                this.info('MediaSetting', 'OutputVolumn', val);
                //clearTimeout(this._volTimeId);
                //var self = this;
                //this._volTimeId = setTimeout(function () {
                //   self.save('MediaSetting', 'OutputVolumn');
                //}, 1000);
                this.info("VodApp", "QAMName4", val);
            } else {
                return parseInt(this.info('MediaSetting', 'OutputVolumn'), 10);
            }
        },
        /**
         * 设置音量，和volume是一样的，为了兼容中间的错别字
         * @param val
         * @returns {Number}
         */
        volumn: function (val) {
            return this.volume(val);
        }
    };

    /**
     * 适配中间件的 SysSetting
     * @type {{env: env, envJSON: envJSON, sendEvent: sendEvent, getEventInfo: getEventInfo, clear: clear}}
     */
    var sysSetting = {
        /**
         * 适配 SysSetting.setEnv(variantName,value)、SysSetting.getEnv(variantName)、SysSetting.deleteEnv(variantName)
         * @param name 全局变量名称
         * @param value 全局变量值
         * @returns {*}
         *
         * ex：
         * 1） TVUI.API.SysSetting.env(name,value) 设置
         * 2)  TVUI.API.SysSetting.env(name) 获取
         * 3)  TVUI.API.SysSetting.env(name,null)  删除
         */
        env: function (name, value) {
            if (typeof SysSetting != 'undefined') {
                if (value) {
                    SysSetting.setEnv(name, String(value));
                } else if (value === null) {
                    SysSetting.deleteEnv(name);
                } else {
                    return  SysSetting.getEnv(name);
                }
            } else {
                if (value) {
                    sessionStorage && sessionStorage.setItem(name, value);
                    // util.setCookie(name, value, 0);
                } else if (value === null) {
                    sessionStorage && sessionStorage.removeItem(name);
                    //util.delCookie(name);
                } else {
                    if (window.sessionStorage) {
                        return sessionStorage.getItem(name);
                    } else {
                        return "";
                    }
                    //return  util.getCookie(name);
                }
            }
        },
        /**
         * 以JSON的格式，适配以上 env 的功能
         * @param name
         * @param value  JSON格式数据或null
         * @returns {*}
         *
         * ex:
         * 用法同上
         */
        envJSON: function (name, value) {
            if (value) {
                if (typeof value === 'object') {
                    this.env(name, JSON.stringify(value));
                } else {
                    throw Error('evnJSON param require JSON');
                }
            } else {
                if (value === null) {
                    this.env(name, null);
                } else {
                    var result = this.env(name);
                    return result ? JSON.parse(result) : null;
                }

            }
        },
        /**
         * 从应用层向中间件发送虚拟消息，中间件仍旧通过type，which，modifiers属性得知其是虚拟消息
         * @param type 虚拟消息分类
         * @param which 虚拟的消息代码值，数值型（16位二进制存储，十进制方式使用）
         * @param modifiers 虚拟消息的扩展属性值
         * @returns {*} 数值型，1为成功发送虚拟消息，0为发送失败
         */
        sendEvent: function (type, which, modifiers) {
            if (typeof SysSetting != 'undefined') {
                return SysSetting.sendEvent(type, which, modifiers);
            }
        },
        /**
         * 根据Id指针，取出内存中保存的消息属性的字符串内容
         * @param id 字符串内容的指针，数值型
         * @returns {*} 字符串内容
         */
        getEventInfo: function (id) {
            if (typeof SysSetting != 'undefined') {
                return SysSetting.getEventInfo(id);
            } else {
                return "";
            }
        },
        /**
         * 清空全局环境变量数据
         */
        clear: function () {
            if (typeof SysSetting != 'undefined') {
                SysSetting.deleteallEnv();
            } else {
                sessionStorage && sessionStorage.clear();
            }

        }

    };

    /**
     *  适配 CA接口
     *  ex:
     *
     *  TVUI.API.CA.icNo
     *  ...
     *  覆盖全部CA的属性，名称和中间件规范一致
     */
    var ca = (function () {
        var _ca = window.CA || {};

        return {
            name: _ca.name || '',
            icNo: _ca.icNo || '',
            pinLocked: _ca.pinLocked || true,
            version: _ca.version || '',
            regionCode: _ca.regionCode || 0,
            changePin: _ca.changePin || noop,
            setRating: _ca.setRating || noop,
            getRating: _ca.getRating || noop,
            setWorkTime: _ca.setWorkTime || noop,
            getWorkTime: _ca.getWorkTime || noop,
            getOperators: _ca.getOperators || noop,
            getWallets: _ca.getWallets || noop,
            getEntitles: _ca.getEntitles || noop,
            getMails: _ca.getMails || noop,
            getViewedIPPs: _ca.getViewedIPPs || noop,
            getInquireIPP: _ca.getInquireIPP || noop,
            cancelInquireIPP: _ca.cancelInquireIPP || noop
        };
    })();

    /**
     * 适配 Network对象
     */
    var network = (function () {
        var _nw = window.Network || {};
        return {
            // host: _nw.host || '',
            //同洲盒子误认host是关键字，解释到host会死机（无解决方案），暂时去掉
            ethernets: _nw.ethernets || {},

            /**
             * 获取设备状态
             */
            getDeviceState: _nw.getDeviceState || noop,
            /**
             * 判断网络是否链接
             * @returns {boolean}
             */
            isEnable: function () {
                if (isSTB) {
                    var eth0 = _nw.getDeviceState('eth0'),
                        cm = _nw.getDeviceState('cm');
                    //状态为101或者201才是网络连接正常，但是创维的盒子拿到的状态是：1196176512
                    if (eth0 > 300 || cm > 300) {
                        return true;
                    } else {
                        return eth0 == 101 || cm == 201;
                    }
                }
                return true;
            }
        };
    })();

    /**
     * 适配 FileSystem对象
     * @type {{download: download, getFile: getFile, createFile: createFile, removeDir: removeDir}}
     */
    var fileSystem = {
        /**
         * 下载远程文件
         * @param options
         * ex:
         *
         * TVUI.API.FileSystem.download({
         *    path : 'http://192.168.1.1/file.js', //文件路径
         *    timeout : 5,  //超时时间,单位秒
         *    dataType: 'text', //返回的数据类型，支持 text 和 json
         *    success : function(data){
         *         //data 根据 dataType 返回
         *    },
         *    error : function(msg){
         *      //msg 错误信息
         *    }
         * });
         *
         */
        download: function (options) {
            if (!isSTB) {
                options.error && options.error();
                return;
            }
            var opt = {
                path: '', //文件路径
                timeout: 5,//超时时间
                dataType: 'text', //返回文件类型
                success: empty, //成功回调
                error: empty  //失败回调
            };
            $.extend(opt, options);
            var maskId, timerId;
            TVUI.Event.on('systemevent', function (e) {
                var msg;
                switch (parseInt(e.which)) {
                    //下载成功
                    case 10151:
                        clearTimeout(timerId);
                        var fileObj = FileSystem.getRemoteFile(maskId);
                        //以文本形式打开
                        if (fileObj.open(1) == 1) {
                            msg = fileObj.readAllfile();
                            if (opt.dataType == 'json') {
                                try {
                                    msg = JSON.parse(msg);
                                } catch (err) {
                                    opt.error(err);
                                }
                            }
                            fileObj.close();
                            opt.success(msg, fileObj);
                            FileSystem.killObject(fileObj);
                        } else {
                            opt.error("文件打开失败");
                        }
                        break;
                    //文件不存在
                    case 10152:
                        clearTimeout(timerId);
                        msg = '前端不存在要下载的文件';
                        opt.error(msg);
                        break;
                    case 10153:
                        clearTimeout(timerId);
                        msg = '文件下载失败';
                        opt.error(msg);
                        break;
                    case 10154:
                        clearTimeout(timerId);
                        msg = '下载超时';
                        opt.error(msg);
                        break;
                }
            });
            maskId = FileSystem.downloadRemoteFile(opt.path, opt.timeout);
            if (opt.timeout > 0) {
                timerId = setTimeout(function () {
                    opt.error('下载超时');
                }, opt.timeout * 1000);
            }
        },
        /**
         * 读取一个文件内容
         * @param path 文件路径
         * @param callback 成功回调，参数是文件的文本信息
         * @param error  错误回调
         * @returns {*} 如果获取成功，返回获取文件的File对象；如果文件不存在，返回-1；如果因为其它原因导致获取文件失败，返回0
         */
        getFile: function (path, callback, error) {
            if (!isSTB) {
                error && error('不支持');
                return;
            }
            var file = FileSystem.getFile(path);
            if (file == -1) {
                error && error('文件不存在');

            } else if (file === 0) {
                error && error('获取文件失败');
            } else {
                if (file.open(1) == 1) {
                    var msg = file.readAllfile();
                    file.close();
                    callback && callback(msg, file);
                    FileSystem.killObject(file);
                } else {
                    error && error('文件打开失败');
                }
            }
            return file;
        },
        /**
         * 创建一个文件，如果文件名称存在，即覆盖
         * @param content 文件文本内容
         * @param savePath 保存路径
         * @returns {*} 如果创建File对象成功，返回该File对象；如果创建失败，返回0。
         */
        createFile: function (content, savePath) {
            if (!isSTB) return;
            var fileObj = FileSystem.createFile();
            if (fileObj !== 0 && fileObj.open(1) == 1) {
                fileObj.writeFile(content);
                fileObj.close();
                var ret = fileObj.saveAs(savePath);
                FileSystem.killObject(fileObj);
                return ret;
            }
            return 0;
        },
        /**
         * 删除一个目录及其所有内容
         * @param path 字符串，要删除的目录的路径
         * @param callback 成功回调
         */
        removeDir: function (path, callback) {
            if (!isSTB) return;
            var arr = path.split('/');
            if (arr[arr.length - 1] === '') {
                arr.pop();
            }
            path = arr.join('/');
            TVUI.Event.on('systemevent', function (e) {
                if (parseInt(e.which) == 10160 && parseInt(e.modifiers) == 1) {
                    callback && callback();
                }
            });
            if (FileSystem.existDirectory(path) == 1) {
                FileSystem.deleteDirectory(path);
            }

        }
    };

    /**
     * 适配 user.channels
     * @type {{getChannelByServiceId: getChannelByServiceId, getDVBServiceByServiceId: getDVBServiceByServiceId, isSupportPlayback: isSupportPlayback}}
     * @private
     */
    var _user = {
        /**
         * 根据业务ID来获取对应的频道对象
         * @param ServiceId 数值型，频道所对应的业务的ID，取值范围0-65535
         * @returns {*} user.channel对象
         */
        getChannelByServiceId: function (ServiceId) {
            if (isSTB) {
                return user.channels.getChannelByServiceId(ServiceId);
            } else {
                return null;
            }
        },
        /**
         *  根据业务ID来获取对应的DVBService对象
         * @param ServiceId
         * @returns {*}  DVBService对象
         */
        getDVBServiceByServiceId: function (ServiceId) {
            var channel = this.getChannelByServiceId(ServiceId);
            if (channel) {
                return channel.getService();
            } else {
                return null;
            }
        },
        /**
         * 判断是否支持回看， 集团不是用这种方式判断，因为channelId不同
         * @param ServiceId
         * @returns {boolean}
         */
        isSupportPlayback: function (ServiceId) {
            var DVBService = this.getDVBServiceByServiceId(ServiceId);
            if (DVBService) {
                return !!DVBService.supportPlayback;
            }
            return false;
        }
    };

//节目指南搜索只能是单线程，这里要做列队处理
    var epgCache = {}, //结果缓存
        epgTaskList = [],//列队数组
        epgTaskRunning = false;//运行标识

    /**
     * 适配 EPG对象
     * @type {{search: search, searchProgramsByServiceId: searchProgramsByServiceId}}
     */
    var epg = {
        /**
         * 搜索节目指南
         * @param options
         * ex:
         * TVUI.API.EPG.search({
         *      serviceId : 102, 业务ID，数值型
         *      mask : 1, 由0x01(actual PF)、0x02(actual schedule)、0x04(other PF)、0x08(other schedule)中的一个或多个相加组成，如0x03(0x01+0x02)就代表要搜索actual PF和actual schedule的数据
         *      timeout: 10, 搜索EPG信息的超时时间，数值型，单位为秒
         *      startDate: 0, 搜索开始日志，当前日志的相对值，如：0 是今天，1 是明天
         *      days : 1 , 搜索天数
         *      complete : function(data){
         *           //data 节目单数据
         *      }
         * });
         */
        search: function (options) {
            epgTaskList.push(options);
            if (!epgTaskRunning) {
                epgTaskRunning = true;
                this.searchProgramsByServiceId(epgTaskList.shift());
            }
        },
        /**
         * 底层搜索方法，不建议用，用search 就可以
         * @param options
         */
        searchProgramsByServiceId: function (options) {
            if (!isSTB) return;
            var opt = {
                serviceId: '',
                mask: 1,
                timeout: 10,
                //数值型，取值范围0-30
                startDate: 0,
                //数值型，取值范围1-10，默认为7
                days: 1,
                complete: noop
            };

            $.extend(opt, options);

            var maskId, obj,
                timerId = null,
                self = arguments.callee,
                cacheKey = [opt.serviceId, opt.mask, opt.startDate, opt.days].join('_'),
                cache = epgCache[cacheKey],
                complete = function (msg) {
                    opt.complete(msg);
                    //列队还有内容，执行下一个
                    if (epgTaskList.length > 0) {
                        self(epgTaskList.shift());
                    } else {
                        epgTaskRunning = false;
                    }
                };

            if (cache) {
                complete(cache);
            } else {
                TVUI.Event.onSystem(function (e) {
                    //机顶盒会有bug modifiers不一定等于maskId
                   // if (e.modifiers == maskId) {
                        switch (parseInt(e.which)) {
                            //成功完成EPG搜索
                            case key.EPG_SEARCH_SUCC:
                            //索结果达到255个事件信息时，系统自动停止搜索
                            case key.EPG_SEARCH_STOP_WHEN_RST_TO_MAX:
                            //搜索超时
                            case key.EPG_SEARCH_TIMEOUT:
                                clearTimeout(timerId);
                                obj = EPG.getSearchResult(maskId);
                                epgCache[cacheKey] = obj;
                                complete(obj);
                                break;
                        }
                   // }
                });
                da.info('DVBSetting', 'EPGStartDate', String(opt.startDate));
                da.info('DVBSetting', 'EPGNumdays', String(opt.days));
                maskId = EPG.searchProgramsByServiceId(opt.serviceId, opt.mask, opt.timeout);
                timerId = setTimeout(function () {
                    complete([]);
                }, (opt.timeout + 1) * 1000);
            }
        }
    };


    TVUI.API = {
        DataAccess: da,
        SysSetting: sysSetting,
        CA: ca,
        Network: network,
        FileSystem: fileSystem,
        user: _user,
        EPG: epg
    };

})(TVUI, JSON);;
/**
 * 页面模块
 *  v1.2.0 更新
 *  1、删除enableBack参数，代替功能使用 unload回调处理
 *  2。增加历史记录操作几个静态方法
 */
(function (TVUI, $) {

    var setting = TVUI.API.SysSetting,
        Event = TVUI.Event,
        Key = TVUI.Key,
        util = TVUI.Util;

    /**
     * 页面类, 继承Base
     * @type {*}
     * ex:
     *  所有参数都是可选的
     *
     */
    var Page = TVUI.Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                //语言
                lang: 'zh',

                //页面名称，必须，而且要唯一
                name: 'page_' + this.id,

                //页面url，默认当前访问的页面
                url: location.href,

                //是否记录浏览页面历史
                history: true,

                //是否阻止页面默认事件
                preventDefault: true,

                //是否首页
                home: false,

                //页面层级，如果大于0，即启用按层级别记录浏览历史
                level: 0,

                //在无历史记录时的后退地址
                backUrl: null,

                //页面返回、退出时，return  false 时不执行返回、退出
                unload: function (obj, type) {
                    return true;
                }


            }, options || {});

            /**
             * 属性：页面名称
             */
            this.name = o.name;

            //页面缓存key
            this.cacheKey = Page.cacheKey + this.name;

            /**
             * 属性：页面缓存
             * @type {{}}
             */
            this.cache = {};

            /**
             * 属性：页面url参数对象
             * @type {*|String|{}}
             */
            this.params = util.queryToJson(o.url) || {};

            /**
             * 属性：页面语言
             */
            this.lang = this.params.lang || setting.env(Page.langKey) || o.lang;

            this.url = o.url;

            /**
             * 页面包含的面板集合
             * @type {{}}
             */
            this.panels = {};

            /**
             * 当前激活的面板
             * @type {null}
             */
            this.activePanel = null;

            this.level = o.level;

            if (o.preventDefault) {
                //阻止按键默认行为
                document.onkeyup = document.onkeydown = document.onkeypress = function () {
                    return false;
                };
            }

            //记录backUrl
            if (o.backUrl) {
                setting.env(Page.backUrlKey, o.backUrl);
            }

            //如果来源是页面是不存在，本地文件系统页面跳进来的referrer可能为空
            if (!document.referrer) {
                Page.clearHistory();
            }

            this.addHistory();
            this.loadCache();
            this.events();
        },
        addHistory: function () {
            var o = this.options;
            o.history && Page.addHistory({
                name: this.name,
                url: this.url,
                home: o.home,
                level: this.level
            });
        },
        /**
         * 跳转
         * @param url 跳转页面地址
         * @param param 参数对象，可选
         *
         */
        go: function (url, param) {
            if (!url) return;

            if (param) {
                var str = util.param(param);
                url += url.indexOf('?') > -1 ? '&' + str : '?' + str;
            }
            this.fire('unload', this, url);
            this.isUnload = true;
            this.fire('go', url);
            location.href = url;


        },
        back: function () {
            var history = Page.backHistory();
            //有历史记录，按历史记录返回
            if (history) {
                this.fire('back', history.url);
                this.go(history.url);
            } else {
                var backUrl = setting.env(Page.backUrlKey);
                //有backUrl，按backUrl返回
                if (backUrl) {
                    setting.env(Page.backUrlKey, null);
                    this.fire('back', Page.backUrlKey);
                    this.go(backUrl);
                } else {
                    //都没有，触发默认事件
                    this.fire('defaultBack');
                }
            }
        },
        exit: function () {
            var history = Page.homeHistory();
            //如果首页标识记录，调转到首页
            if (history) {
                this.fire('exit', history.url);
                this.go(history.url);
            } else {
                //没有首页标识，即返回
                this.back();
            }
        },
        refresh: function () {
            this.fire('unload', this, this.url);
            this.isUnload = true;
            this.fire('refresh');
            location.reload();
        },
        /**
         * 读取页面缓存
         */
        loadCache: function () {
            var name = this.cacheKey,
                record = setting.envJSON(name);
            $.extend(this.cache, record || {});
            //读出附加参数后，清除缓存
            setting.envJSON(name, null);
        },
        /**
         * 设置缓存
         * @param obj
         */
        setCache: function (obj) {
            $.extend(this.cache, obj || {});
        },
        /**
         * 获取缓存
         * @returns {{}|Page.cache|*}
         */
        getCache: function () {
            return this.cache;
        },
        /**
         * 清空缓存
         */
        clearCache: function () {
            this.cache = {};
        },
        /**
         * 保存缓存，在页面unload时自动执行
         */
        saveCache: function () {
            var name = this.cacheKey;
            if (!$.isEmptyObject(this.cache)) {
                setting.envJSON(name, this.cache);
            } else {
                setting.envJSON(name, null);
            }
        },
        /**
         * 设置语言
         * @param lang  zh 或 en
         */
        setLang: function (lang) {
            this.lang = lang || 'zh';
            setting.env(Page.langKey, this.lang);
            this.fire('setLang', lang);
        },
        /**
         * 增加 panel
         *
         * ex:
         *
         * page.addPanel(panel1,panel2,.......);
         */
        addPanel: function () {
            var panels = arguments, self = this;
            for (var i = 0, len = panels.length; i < len; i++) {
                (function (panel) {
                    //判断要增加的panel是否已经添加，未增加过即执行增加
                    if (panel && panel.id && !self.panels[panel.id]) {
                        panel.on('active', function (obj) {
                            //当panel激活时，其他panel设置为非活动状态
                            for (var key in self.panels) {
                                if (self.panels.hasOwnProperty(key) && panel.id != key) {
                                    self.panels[key].unActive();
                                }
                            }
                            //记录当前活动的panel是哪个
                            self.activePanel = obj;
                        });
                        self.panels[panel.id] = panel;
                    }
                })(panels[i]);
            }
        },
        events: function () {
            var o = this.options;
            this.registerEvent(Event.onPress(function (evt) {
                if (!this._active) return;
                switch (evt.which) {
                    case Key.BLUE:
                        TVUI.debug && this.refresh();
                        break;
                    case Key.EXIT:
                        o.unload(this, 'exit') && this.exit();
                        break;
                    case Key.BACK:
                        o.unload(this, 'back') && this.back();
                        break;
                }

            }, this));

            //96956按键
            this.registerEvent(Event.onComKey([Key.NUM9, Key.NUM6, Key.NUM9, Key.NUM5, Key.NUM6], function () {
                if (!this._active) return;
                this.go("ui://factory/index.html");
            }, this));

            //5个1键清空缓存并刷新页面
            this.registerEvent(Event.onComKey([Key.NUM1, Key.NUM1, Key.NUM1, Key.NUM1, Key.NUM1], function () {
                if (TVUI.debug) {
                    setting.clear();
                    alert('成功清空缓存');
                    this.refresh();
                }
            }, this));


            /**
             * 兼容浏览器和机顶盒原生unload， 浏览器unload事件是屏蔽的，但机顶盒是允许的，如果已经触发了unload，不再触发
             */
            TVUI.Event.on('unload', function () {
                if (!this.isUnload) {
                    this.fire('unload');
                    this.isUnload = true;
                }
            }, this);

            this.on('unload', this.saveCache, this);

            //当页面被激活时，恢复当前活动的panel
            this.on('active', function () {
                if (this.activePanel) {
                    this.activePanel._active = true;
                    if (this.activePanel.pager) {
                        this.activePanel.pager._active = true;
                    }
                }
            });

            this.on('unActive', function () {
                for (var key in this.panels) {
                    if (this.panels.hasOwnProperty(key)) {
                        var panel = this.panels[key];
                        //先找出页面中哪个panel是活动的，并记录下来起来
                        if (!this.activePanel && panel._active) {
                            this.activePanel = panel;
                        }
                        //把页面全部panel都设置为非活动
                        panel._active = false;
                        if (panel.pager) {
                            panel.pager._active = false;
                        }
                    }
                }
            });


        }

    }, TVUI.Base);

    Page.extend({
        //历史记录缓存Key
        historyCacheKey: 'sw_history',
        //页面缓存Key
        cacheKey: 'sw_cache_',
        //语言版本缓存key
        langKey: 'sw_lang',
        //后退url缓存key
        backUrlKey: 'backUrl',
        //浏览历史数据
        history: [],
        /**
         * 添加历史记录
         * @param item
         */
        addHistory: function (item) {
            //向从机顶盒缓存获取当前的历史记录
            var history = setting.envJSON(this.historyCacheKey) || [],
                length = history.length,
                lastItem;
            if (length > 0) {
                lastItem = history[length - 1];
                //如果最后一项记录和当前页面url不相同，即记录并更新机顶盒缓存
                if (lastItem.url != item.url) {

                    history = $.grep(history, function (n) {
                        //如果和当前页面是同一个页面，删除它
                        if (n.name == item.name && n.url == item.url) {
                            return false;
                        } else {
                            //如果没开启层级，记录历史，如果开启层级，删除比当前层级高的记录
                            return n.level === 0 || (n.level > 0 && n.level < item.level);
                        }
                    });

                    history.push(item);

                    //按等级从小到大排序
                    history.sort(function (a, b) {
                        return a.level - b.level;
                    });

                    //todo：去重


                }
            } else {
                history.push(item);
            }
            this.history = history;
            setting.envJSON(this.historyCacheKey, history);
        },
        /**
         * 清空历史记录
         */
        clearHistory: function () {
            this.history = [];
            setting.envJSON(this.historyCacheKey, null);
        },
        /**
         * 获取前一个历史记录
         * @returns {*}
         */
        backHistory: function () {
            var history = this.history;
            if (history.length > 1) {
                history.pop();
                setting.envJSON(this.historyCacheKey, history);
                return history[history.length - 1];
            }
            return null;
        },
        /**
         * 获取首页历史记录
         * @returns {*}
         */
        homeHistory: function () {
            var history = this.history.slice(0),
                homePages;
            history.pop();
            homePages = $.grep(history, function (n) {
                return n.home;
            });
            if (homePages.length > 0) {
                var i = history.length - 1,
                    item;
                while (i >= 0) {
                    item = history.pop();
                    if (item.home) {
                        setting.envJSON(this.historyCacheKey, history);
                        return item;
                    } else {
                        --i;
                    }
                }
            }
            return null;
        }

    });


    TVUI.Page = Page;

})(TVUI, Zepto);;
/**
 *  面板模块，提供菜单功能
 *  v1.2.0 更新
 *  1、增加 leaveLeft, leaveRight, leaveUp, leaveDown 4个事件
 *
 */
(function (TVUI) {
    var Panel,
        $ = TVUI.$,
        Class = TVUI.Class,
        Event = TVUI.Event,
        Util = TVUI.Util,
        Base = TVUI.Base;

    /**
     * 面板类，继承Base
     * @type {*}
     */
    Panel = Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                active: true,
                //初始激活状态

                cols: 0,
                //列数

                data: [],
                //菜单数组或dom集合

                disabled: [],
                //禁用单元格索引，从0开始计算，例如要禁用第一个和第三个，设置 disabled :[0,2]

                focusIndex: 0,
                //初始焦点位置索引，从0开始计算

                focusClass: 'focus',
                //焦点样式className

                selectClass: 'select',
                //确定后的菜单样式className

                leaveClass: 'leave',
                //离开panel的菜单className

                loop: false,
                //是否循环

                pager: null,
                //Pager实例

                textSelector: null,
                //截取文字所在位置的选择器

                textChar: -1,
                //截取多少个字符，一个中文按2个字符计算，-1表示不截取

                textAttrName: 'data-text'
                //截取文字属性名称

            }, options || {});
            /**
             * 激活状态
             */
            this._active = o.active;
            /**
             * 数据
             */
            this.data = o.data;
            /**
             * 禁用单元格
             */
            this.disabled = o.disabled;
            /**
             * 当前焦点所在索引
             */
            this.focusIndex = o.focusIndex;
            /**
             * 列数
             */
            this.cols = o.cols;
            /**
             * 行数
             * @type {number}
             */
            this.rows = Math.ceil(this.data.length / this.cols);
            /**
             * 是否循环
             */
            this.loop = o.loop;
            /**
             * Pager实例
             */
            this.pager = o.pager;
            this.setEmptyCell();
            this.events();
            if (this.pager) {
                this.pager._active = this._active;
            }
            setTimeout(this.proxy(function () {
                //如果是初始是活动状态并且没有执行过focus时，运行。 延时是为了能够接收到事件
                (this._active && !this.__initFocus) && this.focus(this.focusIndex);
            }), 0);

        },
        /**
         * 重置Panel
         * @param data 数据
         * @param focusIndex 焦点索引,可选
         * @param cols 列数，可选
         */
        reset: function (data, focusIndex, cols) {
            this.data = data;
            this.cols = cols || this.cols;
            this.focusIndex = focusIndex > 0 ? focusIndex : 0;
            this.rows = Math.ceil(this.data.length / this.cols);
            this.disabled = [];
            this.setEmptyCell();
            this.fire('reset', data, focusIndex, cols);
        },
        /**
         * 设置没数据的单元格
         */
        setEmptyCell: function () {
            var cellCount = this.rows * this.cols;
            for (var i = this.data.length; i < cellCount; i++) {
                this.disable(i);
            }
        },
        /**
         * 索引转换成单元格
         * @param index
         * @returns {*[]}
         */
        indexToCell: function (index) {
            var r = parseInt(index / this.cols),
                c = index % this.cols;
            return [r, c];
        },
        /**
         * 单元格转换成索引
         * @param cell
         * @returns {*}
         */
        cellToIndex: function (cell) {
            return cell[0] * this.cols + cell[1];
        },
        /**
         * 禁用单元格
         * @param idx 单元格索引
         */
        disable: function (idx) {
            this.disabled.push(idx);
            //这里setTimeout 是为了实例化立刻返回实例，使事件能在初始化时就能侦听
            setTimeout(this.proxy(function () {
                this.fire('disable', idx, this);
            }), 0);
        },
        /**
         * 取消禁用单元格
         * @param idx 单元格索引
         */
        enable: function (idx) {
            this.disabled = $.grep(this.disabled, function (n) {
                return n != idx;
            });
            this.fire('enable', idx, this);
        },
        /**
         * 验证单元格是否可用
         * @param cell
         * @returns {boolean}
         */
        validate: function (cell) {
            var disabled = this.disabled,
                result = false,
                index = this.cellToIndex(cell);
            for (var i = 0, len = disabled.length; i < len; i++) {
                if (disabled[i] == index) {
                    result = true;
                    break;
                }
            }
            return result;
        },
        /**
         * 演示触发离开事件，私有方法
         * @param pos 离开方向
         * @param cell 单元格
         */
        delayLeave: function (pos, cell) {
            //解决多个panel切换事件bug
            setTimeout(this.proxy(function () {
                this.leave(pos, this.cellToIndex(cell));
            }), 20);
        },
        leave: function (pos, index) {
            if (pos == 'down' && index > this.data.length - 1) {
                this.blur();
                this.focus(this.data.length - 1);
            } else {
                var map = {
                        'left': 'leaveLeft',
                        'right': 'leaveRight',
                        'up': 'leaveUp',
                        'down': 'leaveDown'
                    },
                    cell = this.indexToCell(index);
                this.fire('leave', pos, cell, this._active, this);
                this.fire(map[pos], cell, index, this._active, this);
            }
        },

        _nextRight: function (cell) {
            var r = cell[0], c = cell[1] + 1;
            if (c > this.cols - 1) { // 超出边界
                this.delayLeave('right', cell);
                if (this.loop) {
                    c = 0;
                } else {
                    return cell;
                }
            }
            return this.validate([r, c]) ? this._nextRight([r, c]) : [r, c];
        },
        _nextLeft: function (cell) {
            var r = cell[0], c = cell[1] - 1;
            if (c < 0) {
                this.delayLeave('left', cell);
                if (this.loop) {
                    c = this.cols - 1;
                } else {
                    return cell;
                }
            }
            return this.validate([r, c]) ? this._nextLeft([r, c]) : [r, c];
        },
        _nextUp: function (cell) {
            var r = cell[0] - 1, c = cell[1];
            if (r < 0) {
                this.delayLeave('up', cell);
                if (this.loop) {
                    r = this.rows - 1;
                } else {
                    return cell;
                }
            }
            return this.validate([r, c]) ? this._nextUp([r, c]) : [r, c];
        },
        _nextDown: function (cell) {
            var r = cell[0] + 1, c = cell[1];
            if (r > this.rows - 1) {
                this.delayLeave('down', cell);
                if (this.loop) {
                    r = 0;
                } else {
                    return cell;
                }
            }
            return this.validate([r, c]) ? this._nextDown([r, c]) : [r, c];
        },
        /**
         * 移动到下一个单元格
         * @param cell 当前单元格
         * @param direction 移动方向
         */
        next: function (cell, direction) {
            if (!this.validate(cell)) {
                var next, oldIndex, newIndex;
                switch (direction) {
                    case "left":
                        next = this._nextLeft(cell);
                        break;
                    case "down":
                        next = this._nextDown(cell);
                        break;
                    case "right":
                        next = this._nextRight(cell);
                        break;
                    case "up":
                        next = this._nextUp(cell);
                        break;
                }
                newIndex = this.cellToIndex(next);

                if ((this.focusIndex != newIndex) && !this.validate(next)) {
                    oldIndex = this.cellToIndex(cell);
                    this.blur(oldIndex, direction);
                    this.focus(newIndex, direction);
                }
            }
        },
        /**
         * 选择单元格
         * @param index 单元格索引
         */
        select: function (index) {
            var data = this.data,
                dataItem = data[index];
            if (dataItem) {
                this.fire('select', index, dataItem, this);
            }
        },
        /**
         * 获取焦点
         * @param idx 单元格索引
         */
        focus: function (idx) {
            var data = this.data,
                dataItem = data[idx];
            this.focusIndex = idx;
            if (dataItem) {
                this.fire('focus', idx, dataItem, this);
            }
            //标识初始化已经执行过
            this.__initFocus = true;


        },
        /**
         *  自动获取焦点
         * @param type 可选，0：初始化时，1：向下翻页时，2：向上翻页时
         *
         */
        autoFocus: function (type) {
            this.blur();
            switch (type) {
                case 0:
                    this.focus(this.options.focusIndex);
                    break;
                case 1:
                    this.focus(0);
                    break;
                case 2:
                    this.focus(this.data.length - 1);
                    break;
                default :
                    this.focus(this.focusIndex);
                    break;
            }
        },
        /**
         * 失去焦点
         */
        blur: function () {
            var data = this.data,
                idx = this.focusIndex,
                dataItem = data[idx];
            if (dataItem) {
                this.blurIndex = idx;
                this.fire('blur', this.blurIndex, dataItem, this);
            }
        },
        events: function () {
            //处理移动事件
            this.registerEvent(Event.onMove(function (position) {
                if (!this._active) return;
                var cell = this.indexToCell(this.focusIndex);
                this.next(cell, position);
            }, this));

            //处理确定键事件
            this.registerEvent(Event.onOk(function () {
                if (!this._active) return;
                this.select(this.focusIndex);
            }, this));

            this.on('focus', function (index, obj) {
                if (obj && obj.nodeType) {
                    $(obj).addClass(this.options.focusClass);
                    this.marquee(obj);
                }
                this.move(this.pager, index);
            });

            this.on('blur', function (index, obj) {
                if (obj && obj.nodeType) {
                    $(obj).removeClass(this.options.focusClass);
                    this.unMarquee(obj);
                }
            });

            this.on('select', function (index, obj) {
                if (obj && obj.nodeType) {
                    $(obj).addClass(this.options.selectClass);
                }
            });

            this.on('leave', function (d, cell) {
                this.blurIndex = this.leaveIndex = this.cellToIndex(cell);
                if (this.pager) {
                    var async = this.pager.async,
                        type = this.pager.type;

                    if ((!async && d == 'down') || (async && d == 'down' && (type == 1 || type == 3)) || (async && d == 'right' && (type == 2 || type == 3))) {
                        this.pager.next();
                    } else if ((!async && d == 'up') || (async && d == 'up' && (type == 1 || type == 3)) || (async && d == 'left' && (type == 2 || type == 3))) {
                        this.pager.prev();
                    }

                }
            });

            this.on('active', function (panel, index) {
                var obj = this.data[this.leaveIndex];
                if (obj && obj.nodeType) {
                    $(obj).removeClass(this.options.leaveClass);
                }
                this.blur();

                index = index === undefined ? this.focusIndex : index;
                this.focus(index);
                this.leaveIndex = null;
                this.pager && this.pager.active();
            });

            this.on('unActive', function () {
                var obj = this.data[this.leaveIndex];
                if (obj && obj.nodeType) {
                    $(obj).addClass(this.options.leaveClass);
                }
                this.blur();
                this.pager && this.pager.unActive();
            });

        },
        marquee: function (el) {
            var o = this.options,
                selector = o.textSelector,
                name = o.textAttrName,
                chars = o.textChar;
            if (chars > -1) {
                var $el = selector ? $(el).find(selector) : $(el),
                    text = $el.attr(name);
                if (Util.getCharCount(text) > chars) {
                    $el.html('<marquee>' + text + '</marquee>');
                }
            }
        },
        unMarquee: function (el) {
            var o = this.options,
                selector = o.textSelector,
                name = o.textAttrName,
                chars = o.textChar;

            if (chars > -1) {
                var $el = selector ? $(el).find(selector) : $(el),
                    text = $el.attr(name);
                if (Util.getCharCount(text) > chars) {
                    $el.html(Util.subStr(text, chars));
                }
            }
        },
        /**
         * 设置分页游标
         * @param pager
         * @param i
         */
        move: function (pager, i) {
            if (pager) {
                var blurIndex = pager.blurIndex,
                    itemIndex = pager.async ? (pager.pageIndex * pager.pageSize + i) : i,
                    type = 0;
                type = blurIndex > i ? 2 : type;
                type = blurIndex < i ? 1 : type;
                pager.move(itemIndex, type);
            }
        }

    }, Base);

    TVUI.Panel = Panel;

})(TVUI);
;
/**
 * 分页模块
 * v1.2.0
 */
(function (TVUI) {
    var Pager,
        $ = TVUI.$,
        Class = TVUI.Class,
        Event = TVUI.Event,
        Key = TVUI.Key,
        Base = TVUI.Base;
    /**
     * 分页类
     * @type {*}
     */
    Pager = Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                total: 1,
                //数据记录数

                pageSize: 10,
                //每页多少条

                pageIndex: 0,
                //初始显示第几页，从0开始计算

                type : 0,
                //异步分页方式：0：不与panel关联分页，1：垂直分页，2：水平翻页，3：垂直水平都翻页

                async: false
                //是否异步分页，同步分页是只通过设置html位移来试下分页，异步是动态创建html

            }, options || {});
            this.total = o.total;
            this.pageSize = o.pageSize;
            this.pageCount = Math.ceil(this.total / this.pageSize);
            this.pageIndex = o.pageIndex;
            this.async = o.async;
            this.type = o.type;
            this.itemIndex = this.pageSize * this.pageIndex;
            this.events();
            this.change(this.pageIndex, 0);
        },
        events: function () {

            this.registerEvent(Event.onPress(function (evt) {
                if (!this._active) return;
                switch (evt.which) {
                    case Key.PAGE_DOWN:
                        this.next();
                        break;
                    case Key.PAGE_UP:
                        this.prev();
                        break;
                }
            }, this));

        },
        /**
         * 内部方法，不建议调用
         * @param index
         * @param type
         */
        move: function (index, type) {
            this.itemIndex = index;
            this.fire('move', this.itemIndex, this);
            var pageIndex = Math.floor(this.itemIndex / this.pageSize);
            if (pageIndex != this.pageIndex) {
                this.change(pageIndex, type);
            }
        },
        moveNext: function () {
            if (this.itemIndex < this.total - 1) {
                this.move(++this.itemIndex, 1);
            }
        },
        movePrev: function () {
            if (this.itemIndex > 0 && this.total > 0) {
                this.move(--this.itemIndex, 2);
            }
        },
        /**
         * 重置分页，在记录数改变的时候，需要执行重置
         * @param total 记录数
         * @param pageSize  页面大小，可选
         * @param pageIndex 现在第几页，可选
         */
        reset: function (total, pageSize, pageIndex) {
            this.total = total;
            this.pageSize = pageSize || this.pageSize;
            this.pageCount = Math.ceil(this.total / this.pageSize);
            this.pageIndex = pageIndex >= 0 ? pageIndex : this.pageIndex;
            this.itemIndex = this.pageSize * this.pageIndex;
            this.fire('reset', total, pageSize, this.pageIndex);
        },

        /**
         * 翻页
         * @param pageIndex 切换到第几页
         * @param type 分页方式，可选， 0:初始化，1：向下翻，2：向上翻
         */
        change: function (pageIndex, type) {
            if (pageIndex >= 0 && pageIndex < this.pageCount) {
                this.pageIndex = pageIndex;
                this.itemIndex = this.pageSize * this.pageIndex;
            }
            setTimeout(this.proxy(this.delayChange, type), 20);
        },
        /**
         * 内部方法，不建议调用
         * @param type
         */
        delayChange: function (type) {
            //如果type未定义，是手动触发的，默认设置为1
            if (typeof type == 'undefined') {
                type = 1;
            }
            this.fire('change', this.pageIndex, type, this);
        },
        /**
         * 下一页
         */
        next: function () {
            if (this.pageIndex < this.pageCount - 1) {
                this.change(++this.pageIndex, 1);
                this.fire('next', this.pageIndex, this);
            }
        },
        /**
         * 上一页
         */
        prev: function () {
            if (this.pageIndex > 0) {
                this.change(--this.pageIndex, 2);
                this.fire('prev', this.pageIndex, this);
            }
        },
        /**
         * 第一页
         */
        first: function () {
            this.change(0, 2);
        },
        /**
         * 最后一页
         */
        last: function () {
            this.change(this.pageCount - 1, 1);
        }
    }, Base);

    TVUI.Pager = Pager;

})(TVUI);
;
(function (TVUI) {
    var ScrollBar,
        $ = TVUI.$,
        Key = TVUI.Key,
        Class = TVUI.Class,
        Base = TVUI.Base,
        Event = TVUI.Event;


    ScrollBar = Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                //可视区选择器或元素对象
                view: null,

                //滚动内容选择器或元素对象
                content: null,

                //滚动条轨道选择器或元素对象
                track: null,

                //滚动条柄选择器或元素对象
                handle: 'span',

                //Panel 实例
                panel: null,

                //内容每次滚动的距离，单位像素，没有panel时才有效
                scrollLength: 100,

                //自动按比例计算句柄高度
                handleHeight: null

            }, options || {});

            /**
             * panel实例
             */
            this.panel = o.panel;
            /**
             * 可视区对象
             * @type {*|HTMLElement}
             */
            this.$view = $(o.view);
            /**
             * 内容对象
             * @type {*|HTMLElement}
             */
            this.$content = $(o.content);
            /**
             * 滚动条轨道对象
             * @type {*|HTMLElement}
             */
            this.$track = $(o.track);
            /**
             * 滚动条句柄对象
             * @type {*|HTMLElement}
             */
            this.$handle = $(o.handle);
            /**
             * 当前滚动到第几步
             * @type {number}
             */
            this.currentStep = 0;
            this.reset();
            this.events();
        },
        reset: function (contentHeight) {
            /**
             * 可视区高度
             */
            this.viewHeight = this.$view.height();

            if (this.panel && this.panel.pager && this.panel.pager.async === true) {
                /**
                 * 内容区高度
                 * @type {*|number}
                 */
                this.contentHeight = contentHeight || this.panel.pager.pageCount * this.viewHeight;
            } else {
                this.contentHeight = contentHeight || this.$content.height();
            }
            /**
             * 内容需要滚动的长度
             * @type {number}
             */
            this.scrollHeight = Math.max(this.contentHeight - this.viewHeight, 0);
            this.scrollHeight > 0 ? this.show() : this.hide();

            /**
             * 滚动轨道的高度
             */

            this.trackHeight = this.trackHeight || this.$track.height();
            /**
             * 滚动句柄的高度
             */
            this.handleHeight = this.getHandleHeight(this.contentHeight);

            this.$handle.height(this.handleHeight);
            /**
             * 总共需要滚动多少步
             */
            this.scrollSteps = this.getScrollSteps();
            /**
             * 内容区每一步滚动的距离
             * @type {number}
             */
            this.perContent = this.scrollSteps > 0 ? this.scrollHeight / this.scrollSteps : 0;
            /**
             * 滚动条需要滚动的距离
             * @type {number}
             */
            this.scrollTrackHeight = this.trackHeight - this.handleHeight;
            /**
             * 滚动条每一步要滚滚东的距离
             * @type {number}
             */
            this.perScroller = this.scrollSteps > 0 ? this.scrollTrackHeight / this.scrollSteps : 0;

            this.pageCount = Math.ceil(this.contentHeight / this.viewHeight);
        },
        /**
         * 计算得到滚动句柄的高度
         * @param contentHeight
         * @returns {number}
         */
        getHandleHeight: function (contentHeight) {
            return this.options.handleHeight || Math.max(this.trackHeight * (this.viewHeight / contentHeight), 10);
        },
        /**
         * 计算需要滚动多少步
         * @returns {*}
         */
        getScrollSteps: function () {
            if (this.panel) {
                if (this.panel.pager && this.panel.pager.async === true) {
                    return this.panel.indexToCell(this.panel.pager.total - 1)[0];
                } else {
                    return this.panel.rows - 1;
                }
            } else {
                return Math.ceil(this.scrollHeight / this.options.scrollLength);
            }
        },
        /**
         * 隐藏滚动条
         */
        hide: function () {
            this.$track.hide();
            this.fire('hide', this);
        },
        /**
         * 显示滚动条
         */
        show: function () {
            this.$track.show();
            this.fire('show', this);
        },
        /**
         * 执行滚动
         * @param step
         */
        scroll: function (step) {
            var content = this.perContent * step,
                bar = this.perScroller * step;
            bar = bar > this.scrollTrackHeight ? this.scrollTrackHeight : bar;
            content = content > this.scrollHeight ? this.scrollHeight : content;
            this.setTransform(this.$handle, bar);
            if (!this.panel) {
                this.setTransform(this.$content, -content);
            }
            this.currentStep = step;

            this.fire('scroll', bar, content, step);
        },
        /**
         * 向下滚
         */
        next: function () {
            if (this.currentStep < this.scrollSteps) {
                this.scroll(++this.currentStep);
            }
        },
        /**
         * 向上滚
         */
        prev: function () {
            if (this.currentStep > 0) {
                this.scroll(--this.currentStep);
            }
        },
        events: function () {
            if (this.panel) {
                var self = this,
                    pageRows = self.panel.indexToCell(this.panel.pager.pageSize - 1)[0] + 1;

                this.panel.on('focus', function (i) {
                    if (self.panel.pager && self.panel.pager.async === true) {
                        var index = self.panel.pager.pageIndex * pageRows + self.panel.indexToCell(i)[0];
                        self.scroll(index);
                    } else {
                        self.scroll(self.panel.indexToCell(i)[0]);
                    }

                });

                this.panel.on('reset', function () {
                    self.reset();
                    if (self.panel.pager && self.panel.pager.async === false) {
                        var val = -(self.viewHeight * self.panel.pager.pageIndex);
                        self.setTransform(self.$content, val);
                        self.scroll(self.panel.pager.itemIndex);
                    }
                });

                if (this.panel.pager) {
                    this.panel.pager.on('change', function (pageIndex, type) {
                        if (self.panel.pager.async) {
                            var dataIndex = type == 2 ? self.panel.data.length - 1 : 0;
                            var step = pageIndex * pageRows + self.panel.indexToCell(dataIndex)[0];
                            var bar = self.perScroller * step;
                            bar = bar > self.scrollTrackHeight ? self.scrollTrackHeight : bar;
                            self.setTransform(self.$handle, bar);
                        } else {
                            var val = -(self.viewHeight * pageIndex);
                            self.setTransform(self.$content, val);
                        }
                    });
                }

            } else {
                this.pageCount = Math.ceil(this.contentHeight / this.viewHeight);
                this.pageSize = Math.ceil(this.viewHeight / this.options.scrollLength);
                this.pageIndex = 0;
                this.registerEvent(Event.onMove(function (d) {
                    switch (d) {
                        case 'up':
                            this.prev();
                            break;
                        case 'down':
                            this.next();
                            break;
                    }
                }, this));
                this.registerEvent(Event.onPress(function (evt) {
                    switch (evt.which) {
                        case Key.PAGE_DOWN:
                            this.pageIndex < this.pageCount - 1 ? ++this.pageIndex : this.pageCount - 1;
                            this.scroll(this.pageIndex * this.pageSize);
                            break;
                        case Key.PAGE_UP:
                            this.pageIndex > 0 ? --this.pageIndex : 0;
                            this.scroll(this.pageIndex * this.pageSize);
                            break;
                    }
                }, this));
            }

        },
        setTransform: function (el, val) {
            el.css({
                'transform': 'translate3d(0,' + val + 'px,0)',
                '-webkit-transform': 'translate3d(0,' + val + 'px,0)'
            });
        }

    }, Base);

    TVUI.ScrollBar = ScrollBar;

})(TVUI);;
/**
 * 对话框组件
 */
(function (TVUI) {

    var Dialog,
        Class = TVUI.Class,
        Base = TVUI.Base,
        Util = TVUI.Util,
        Panel = TVUI.Panel,
        Lang = TVUI.Lang,
        $ = TVUI.$;

    Dialog = Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                //标题
                title: '',
                //对话框内容
                content: '',
                //宽度,
                width: 300,
                //高度，如不设置，即自动
                height: null,
                //自定义css className
                theme: '',
                // 格式 [{text:'确定',handler:function(){},theme:'ok'}]
                btns: {},
                //多少毫秒后自动关闭
                timeout: null,
                //页面实例
                page: null,
                //按钮获得焦点时的className
                btnFocusClass: 'focus',
                mask: true,
                auto: true
            }, options || {});
            this.clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
            this.clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
            this.btns = o.btns;
            this.page = o.page;
            this.render();
            this.setPanel();
            o.auto ? this.show() : this.hide();
            if (o.timeout) {
                Util.timeout(function () {
                    this.destroy();
                }, o.timeout, this);
            }
        },
        render: function () {
            var o = this.options,
                html,
                btnHtml = [],
                template = '<div class="dialog-inner"><div class="dialog-title">{$title}</div>' +
                    '<div class="dialog-content">{$content}</div>' +
                    '<div class="dialog-btns">{$btns}</div></div>';

            //按钮html模版
            var btnTpl = '<div class="dialog-btn {$theme}"><span>{$name}</span></div>';
            //生成按钮html
            $.each(o.btns, function (i, n) {
                btnHtml.push(Util.tpl(btnTpl, {
                    name: n.text,
                    theme: n.theme || ''
                }));
            });
            //生成对话框html
            html = Util.tpl(template, {
                title: o.title,
                content: o.content,
                btns: btnHtml.join('')
            });

            if (o.mask) {
                this.mask = $('<div>');
                this.mask.attr('class', 'dialog-mask');
                $(document.body).append(this.mask);
            }

            this.el = $('<div>').html(html).attr('class', ' dialog ' + o.theme);
            //如果有传入高度
            if (o.height) {
                this.el.height(parseInt(o.height) + 'px');
            }
            $(document.body).append(this.el);

            //计算left、top 自动居中
            var left = (this.clientWidth - o.width) / 2,
                top = (this.clientHeight - (o.height || this.el.height())) / 2;
            this.el.css({
                'left': left + 'px',
                'top': top + 'px',
                'position': 'absolute',
                'width': parseInt(o.width) + 'px',
                'z-index': ++Dialog.zIndex
            });
        },
        setPanel: function () {
            var $btns = this.el.find('.dialog-btn'),
                self = this;
            this.panel = new Panel({
                cols: $btns.length,
                data: $btns
            });
            this.panel.on('select', function (i) {
                self.btns[i].handler && self.btns[i].handler(self);
            });
        },
        show: function () {
            this.page && this.page.unActive();
            this.mask && this.mask.show();
            this.el.show();
            this.fire('show', this);
        },
        hide: function () {
            this.page && this.page.active();
            this.mask && this.mask.hide();
            this.el.hide();
            this.fire('hide', this);
        },
        destroy: function () {
            this.parent.prototype.destroy.apply(this, arguments);
            this.panel.destroy();
            this.el.remove();
            this.mask && this.mask.remove();
            this.page && this.page.active();
        }
    }, Base);

    Dialog.alert = function (page, content, callback, timeout) {
        var d = new Dialog({
            content: content,
            title: Lang[page.lang].T_15,
            width: 400,
            btns: [
                {text: Lang[page.lang].T_1, handler: function (obj) {
                    callback && callback(obj);
                    callback = null;
                    obj.destroy();
                }}
            ],
            theme: 'dialog-alert',
            page: page,
            timeout: timeout || null
        });
        d.on('destroy', function () {
            callback && callback(d);
        });
        return d;
    };

    Dialog.confirm = function (page, content, okCallback, cancelCallback) {
        return  new Dialog({
            content: content,
            title: '',
            width: 400,
            btns: [
                {text: Lang[page.lang].T_1, handler: function (obj) {
                    okCallback && okCallback(obj);
                    obj.destroy();
                }, theme: 'dialog-btn-ok'},
                {text: Lang[page.lang].T_2, handler: function (obj) {
                    cancelCallback && cancelCallback(obj);
                    obj.destroy();
                }, theme: 'dialog-btn-cancel'}
            ],
            theme: 'dialog-confirm',
            page: page
        });
    };

    Dialog.tip = function (content, timeout) {
        return  new Dialog({
            content: content,
            title: '',
            theme: 'dialog-tip',
            timeout: timeout || 5000
        });
    };

    Dialog.zIndex = 100;
    TVUI.Dialog = Dialog;
})(TVUI);
;
/**
 * 播放器模块
 * v1.2.0
 *
 */
(function (TVUI) {
    var Player,
        Key = TVUI.Key,
        Lang = TVUI.Lang,
        Api = TVUI.API,
        $ = TVUI.$,
        Event = TVUI.Event,
        Log = TVUI.Log,
        Util = TVUI.Util;

    Player = TVUI.Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                //播放内容类型 Video 或 Audio
                type: 'video',

                //是否全屏
                fullScreen: false,

                //视频宽度
                width: 400,

                //视频高度
                height: 300,

                //位置左
                left: 0,

                //位置右
                top: 0,

                //页面实例
                page: null,

                //是否设置body透明
                transparent: true,

                //数值型，取1表示将画面保持在暂停前最后一帧，取0表示将画面设为黑场
                pauseMode: 1,
                //是否在页面unload时自动销毁播放器
                autoDestroy: true,

                //是否需要辅助层
                helper: false
            }, options || {});


            /**
             * 播放速度倍数
             * @type {number}
             */
            this.pace = 1;
            /**
             * 播放内容类型
             */
            this.type = o.type;
            /**
             * 页面实例
             */
            this.page = o.page;
            /**
             * 音量缓存key
             * @type {string}
             * @private
             */
                //已经不再使用
                // this._volumnCacheKey = 'sw_volumn';
                //计数器，用来判断服务是否可用
            this._disableCount = 0;
            /**
             * 蛋清播放文件的索引，只对http方式有效
             * @type {number}
             */
            this.playingIndex = 0;
            /**
             * 播放状态，是否正在播放中
             * @type {boolean}
             */
            this.isPlaying = false;
            /**
             * 播放文件列表
             * @type {Array}
             */
            this.fileList = [];
            /**
             * 暂停方式 取1表示将画面保持在暂停前最后一帧，取0表示将画面设为黑场
             * @type {number|player.pauseMode|b.options.pauseMode|Player.options.pauseMode|b.pauseMode|Player.pauseMode}
             */
            this.pauseMode = o.pauseMode;
            /**
             * 当前的音量值
             */
            this._volumn = this._initVolumn();

            //适配页面效果，在机顶盒上是无效
            this._createDom(o.fullScreen, o.left, o.top, o.width, o.height);
            this.createPlayer();
            this._event();
        },
        _initVolumn: function () {
            var cache = Api.DataAccess.info("VodApp", "QAMName4");
            //var cache = Api.SysSetting.env(this._volumnCacheKey);
            if (cache) {
                Api.DataAccess.volume(cache);
            } else {
                cache = Api.DataAccess.volume(16);
                Api.DataAccess.info("VodApp", "QAMName4", cache);
                //Api.SysSetting.env(this._volumnCacheKey, cache);
            }
            this.fire('initVolume', cache);
            return parseInt(cache, 10);
        },
        _createDom: function (fullScreen, x, y, w, h) {
            var div = $('<div>');
            if (fullScreen) {
                w = document.documentElement.clientWidth || document.body.clientWidth;
                h = document.documentElement.clientHeight || document.body.clientHeight;
                x = y = 0;
            }
            div.css({
                'position': 'absolute',
                'width': w + 'px',
                'height': h + 'px',
                'top': y + 'px',
                'left': x + 'px',
                'color': '#fff'
            });
            this.el = div;
            if (this.options.transparent) {
                $(document.body).append(div).css({'background': 'transparent'});
            } else {
                $(document.body).append(div);
            }
            !this.options.helper && this.el.hide();
        },
        _event: function () {
            var self = this;
            //销毁
            if (this.page) {
                if (this.options.autoDestroy) {
                    this.page.on('unload', this.proxy(this.destroy));
                }

                this.page.on('active unActive', function () {
                    self._active = this._active;
                });
            }

            this.registerEvent(Event.onPress(function (evt) {
                if (!self._active) return;
                switch (parseInt(evt.which)) {
                    case Key.STOP: //停止
                        self.stop();
                        break;
                    case Key.PAUSE: //暂停
                        self.pause();
                        break;
                    case Key.PLAY:  //播放
                        self.play();
                        break;
                    case Key.VOLUME_MUTE:  //静音
                        self.mute();
                        break;
                    case Key.FUN9:  //快退
                        self.fastBackward();
                        break;
                    case Key.FUN10: //快进
                        self.fastForward();
                        break;
                    case Key.FUN20:    //视频画面格式切换
                        var aspect = self.aspect();
                        //6 是自动;
                        if (aspect == 6) {
                            aspect = 0;
                        }
                        aspect = aspect > 6 ? 0 : ++aspect;
                        self.aspect(aspect);
                        break;
                }
            }));
            //音量+
            this.registerEvent(Event.onKey(Key.VOLUME_UP, function () {
                if (!self._active) return;
                self.volume(1);
            }));
            //音量-
            this.registerEvent(Event.onKey(Key.VOLUME_DOWN, function () {
                if (!self._active) return;
                self.volume(-1);
            }));
            //系统事件
            this.registerEvent(Event.onSystem(function (e) {
                if (!self._active) return;

                var which = parseInt(e.which, 10),
                    ext = e.modifiers,
                    page = self.page,
                //根据Id指针，取出内存中保存的消息属性的字符串内容
                    eventExtArr = Api.SysSetting.getEventInfo(ext).split(","),
                    code = Math.floor(eventExtArr[1]);
                //log(which, ext, eventExtArr);
                switch (which) {
                    case 10031: //成功锁定频点
                        var ts = DVB.currentTS; //获取当前频点的传输流对象
                        self.fire('locked', ts);
                        break;
                    case 10032: //锁频失败
                        self.fire('error', Lang[page.lang].T_7, which);
                        break;
                    case 10901: //当前媒体已播放到末尾（仅用于本地媒体播放）
                        self.fire('playEnd');
                        self.playNext();
                        break;
                    case 10905: //收到Session Manager的NGOD-S1 Announce请求
                        break;
                    case 10921: //根据NGOD-S1 Session Setup响应的destination字段信息，在对应频点的PAT表中无法找到对应节目的PMT描述
                        self.fire('error', Lang[page.lang].T_8, which);
                        break;
                    case 10903: //收到Session Manager返回的NGOD-S1 Session Set up响应
                        switch (code) {
                            case 754:
                                //不可用媒资
                                self.fire('error', Lang[page.lang].T_9, which, code);
                                break;
                            default:
                                //网络繁忙
                                if (code != 200) {
                                    self.fire('error', Lang[page.lang].T_10, which, code);
                                }
                                break;
                        }
                        break;
                    case 10913: //发出NGOD-S1 Session Teardown请求后已过10秒，尚未收到session manager的响应
                        self._disableCount++;
                        break;
                    case 10906: //收到Session Manager返回的NGOD-S1 Ping响应
                        self._disableCount = 0;
                        break;
                    case 10907: //收到推流服务器返回的NGOD-C1 Play响应
                    case 10908: //收到推流服务器返回的NGOD-C1 Pause响应
                        switch (code) {
                            case 200:
                                if (which == 10907) {
                                    //设置播放点,等待setPoint状态
                                    //todo:这里可能要做处理
                                }
                                break;
                            case 403:
                                //无权限操作
                                self.fire('error', Lang[page.lang].T_11, which, code);
                                break;
                            case 754:
                                //不可用媒资
                                self.fire('error', Lang[page.lang].T_9, which, code);
                                break;
                            default:
                                if (code >= 400 && code <= 778 && code != 455) {
                                    //网络繁忙
                                    self.fire('error', Lang[page.lang].T_10, which, code);
                                }
                                break;
                        }
                        break;
                    case 10910: //收到推流服务器返回的NGOD-C1 Get Parameter响应
                        self._disableCount = 0;
                        break;
                    case 10909: //收到推流服务器的NGOD- C1 Announce请求
                        switch (code) {
                            case 403:
                                //无权限操作
                                self.fire('error', Lang[page.lang].T_11, which, code);
                                break;
                            case 2101: //rtsp 流结束
                                self.fire('rtspEnd', which, code);
                                break;
                            case 2104: //rtsp 流开始
                                self.fire('rtspStart', which, code);
                                break;
                            case 5402:
                                //推流会话中断
                                self.fire('error', Lang[page.lang].T_12, which, code);
                                break;
                        }
                        break;
                    case 10915: //发出NGOD-C1 Play请求后已过10秒，尚未收到推流服务器的响应
                        self._disableCount++;
                        break;
                    case 10912: //发出NGOD-S1 Session Setup请求后已过10秒，尚未收到session manager的响应
                        //点播失败,是否重新点播
                        self.fire('error', Lang[page.lang].T_13, which);
                        break;
                    case 10904: //收到Session Manager返回的NGOD-S1 Session Teardown响应
                        if (code != 200) {
                            //点播会话中断
                            self.fire('error', Lang[page.lang].T_14, which, code);
                        }
                        break;
                    case 10914: //发出NGOD-S1 Ping请求后已过10秒，尚未收到session manager的响应
                        self._disableCount++;
                        if (self._disableCount > 20) {
                            self.fire('error', Lang[page.lang].T_14, which);
                        }
                        break;
                    case 10917: //发出NGOD-C1 Get Parameter请求后已过10秒，尚未收到推流服务器的响应
                        self._disableCount++;
                        if (self._disableCount > 20) {
                            self.fire('error', Lang[page.lang].T_14, which);
                        }
                        break;
                    case 11702:
                        //隐藏不能播放节目的提示
                        // self.trigger('error', '不能播放节目', which);
                        break;
                    default:
                        //永新世博CA
                        if (which >= 11301 && which <= 11328) {
                            self.fire('error', eventExtArr[0], which);
                        }
                        //数码视讯CA
                        if (which >= 11501 && which <= 11585) {
                            self.fire('error', eventExtArr[0], which);
                        }
                        break;

                }

            }));

        },
        setPosition: function (fullScreen, x, y, w, h) {
            if (this.type == 'video') {
                var position = [];
                position.push(Number(fullScreen));
                position.push(x);
                position.push(y);
                position.push(w);
                position.push(h);
                this.player.position = position.join(',');
            } else {
                this.player.position = '0,0,0,1,1';
            }
        },
        /**
         * 创建播放器
         */
        createPlayer: function () {
            var o = this.options;
            if (window.MediaPlayer) {
                this.player = new MediaPlayer();
                this.instanceId = Api.SysSetting.env('sw_player_id');
                if (this.instanceId) {
                    this.player.bindPlayerInstance(parseInt(this.instanceId));
                } else {
                    this.instanceId = this.player.createPlayerInstance(o.type, o.type == 'video' ? 2 : 0);
                    Api.SysSetting.env('sw_player_id', String(this.instanceId));
                }
                this.setPosition(o.fullScreen, o.left, o.top, o.width, o.height);
            } else {
                //这里做浏览器提示，方便调试
                var fn = 'isMute|isDVBVideo|setPace|setPosition|DVBSrc|VODSrc|UDPSrc|src|play|pause|refresh|destroy|stop|mute|getLength|point|aspect|mode|fastForward|slowForward|fastBackward|slowBackward|volumnUp|volumnDown|active|multiSrc|next'.split('|');
                var self = this;
                $.each(fn, function (i, n) {
                    self[n] = function () {
                        var arr = Util.makeArray(arguments);
                        arr.unshift('player.' + n + '(');
                        arr.push(')');
                        Util.log.apply(Util, arr);
                        self.el.html(arr.join(''));
                        return true;
                    };
                });
                this.el.css({'background': '#000'});
            }
        },
        /**
         * 销毁播放器
         * @returns {*}
         */
        destroy: function (mode) {
            this.parent.prototype.destroy.apply(this, arguments);
            //this.player.pause($.type(mode) == 'number' ? mode : this.pauseMode);
            Api.SysSetting.env('sw_player_id', null);
            //销毁播放器默认设置为黑场模式
            Api.DataAccess.info("MediaSetting", "PauseMode", $.type(mode) == 'number' ? mode : this.pauseMode);
            //销毁播放器
            return this.player.releasePlayerInstance();
        },
        /**
         * 设置播放资源，支持 file http delivery rtsp udp 方式
         * @param file
         */
        src: function (file) {
            var re = /(file:\/\/|http:\/\/|delivery:\/\/|rtsp:\/\/|udp:\/\/)/i;
            if (re.test(file)) {
                this.fileList = [];
                this.fileList.push(file);
                //由于this.palyer.source是不能读的，会导致死机，play方法已经注释了读取，这里需要标识播放状态才能更换直播频道
                this.isPlaying = false;
            } else {
                throw new Error('文件地址不正确');
            }
        },
        /**
         * 设置多个播放资源，只对http方式
         * @param files
         */
        multiSrc: function (files) {
            this.fileList = files;
        },
        /**
         * 设置DVB播放资源
         * @param options
         * @constructor
         */
        DVBSrc: function (options) {
            // delivery://Frequency.SymbolRate.Modulation.ProgramNumber.VideoPID.AudioPID
            var defaultValue = {
                //频点频率，单位KHz
                Frequency: '',
                //符号率，单位KSymbol/s，可填0，系统取默认值为6875
                SymbolRate: 0,
                //Modulation为调制方式，可填0，系统取默认值64QAM
                Modulation: 0,
                //业务ID号
                ProgramNumber: '',
                //视频PID，可填0，系统默认取该业务下PID值最小的视频流，如果该业务为纯音频业务，该值为0
                VideoPID: 0,
                //音频PID，可填0，系统默认取该业务下PID值最小的音频流
                AudioPID: 0,

                //播放类型，2为音频，其他为视频
                ServiceType: null
            };
            var o = $.extend(defaultValue, options),
                src = [];
            if (!o.Frequency || !o.ProgramNumber) {
                throw new Error('缺少参数');
            }
            if (o.ServiceType) {
                this.serviceType = o.ServiceType;
            }
            src.push(o.Frequency);
            src.push(o.SymbolRate);
            src.push(o.Modulation);
            src.push(o.ProgramNumber);
            src.push(o.VideoPID);
            src.push(o.AudioPID);
            var source = 'delivery://' + src.join('.');
            this.src(source);
        },
        /**
         * 设置VOD播放资源
         * @param options
         * @constructor
         */
        VODSrc: function (options) {
            // rtsp://<session-manager-path>:<session-manager-port>/;purchaseToken=<purchase-token>;serverId=<server-id>
            var defaultValue = {
                //前端session manager服务器的IP地址或者域名
                path: '',
                //前端session manager服务器的通讯端口
                port: '',
                //购买令牌，由鉴权结果返回
                token: '',
                //前端Navigation Server服务器的IP地址
                serverId: ''
            };
            var o = $.extend(defaultValue, options);
            if (!o.path || !o.port || !o.token || !o.serverId) {
                throw new Error('缺少参数');
            }
            var source = 'rtsp://' + o.path + ':' + o.port + '/;purchaseToken=' + o.token + ';serverId=' + o.serverId;
            this.src(source);
        },
        /**
         * 设置UDP播放资源
         * @param options
         * @constructor
         */
        UDPSrc: function (options) {
            //udp://MulticastAddress:UDPPort:ProgramNumber:VideoPID:AudioPID
            var defaultValue = {
                //MulticastAddress为发送组播地址,当前端使用UDP单播时，MulticastAddress为“0.0.0.0”，当前端使用UDP组播时，MulticastAddress为发送组播地址
                address: '0.0.0.0',
                //UDP端口号
                port: '',
                //业务ID号
                ProgramNumber: '',
                //视频PID，可填0，系统默认取该业务下PID值最小的视频流，如果该业务为纯音频业务，该值为0
                VideoPID: 0,
                //音频PID，可填0，系统默认取该业务下PID值最小的音频流
                AudioPID: 0
            };
            var o = $.extend(defaultValue, options),
                src = [];
            if (!o.ProgramNumber) {
                throw new Error('缺少参数');
            }
            src.push(o.address);
            src.push(o.port);
            src.push(o.ProgramNumber);
            src.push(o.VideoPID);
            src.push(o.AudioPID);
            var source = 'udp://' + src.join(':');
            this.src(source);
        },
        /**
         * 开始播放资源
         */
        play: function () {
            //已经在播放，即刷新,
            if (this.isPlaying) {
                this.pace = 1;
                this.player.pace = this.pace;

                var src = this.fileList[this.playingIndex];
                //避免相同的资源刷新后重头开始播放
                //if (this.player.source != src) {
                //    this.player.source = src;
                //}
                this.player.refresh();
                this.fire('play', 1/*, this.player.source*/);//同洲机顶盒1.0版本中间件，读取player.source値，会造成机顶盒死机
            } else {
                this.player.source = this.fileList[this.playingIndex];
                this.isPlaying = true;
                this.pace = 1;
                this.player.pace = this.pace;//快进快退状态重新播放一个视频，默认恢复为1
                var ret = this.player.play();
                //播放时设置的position没有更新，不知道是不是播放器的bug， 暂时用刷新来解决(只有http方式才有这个问题)
                // setTimeout(this.proxy(function () {
                //this.player.pause();
                //this.player.play();
                //  }), 10);
                this.fire('play', ret/*, this.player.source*/);
            }
        },
        /**
         * 播放下一个资源
         */
        playNext: function () {
            var count = this.fileList.length,
                index = this.playingIndex;
            // log('playNext', count, count);
            //如果还有未播放文件，继续播放下一个
            if (index < count - 1) {
                ++this.playingIndex;
                this.stop();
                this.play();
            } else {
                //没有播放文件
                this.fire('allEnd', this.player);
            }
        },
        /**
         * 暂停
         * @returns {*}
         */
        pause: function (mode) {
            this.fire('pause');
            return this.player.pause(typeof mode === 'undefined' ? this.pauseMode : mode);
        },
        /**
         * 停止
         * @returns {*}
         */
        stop: function (mode) {
            this.isPlaying = false;
            this.fire('stop');
            return this.player.pause(typeof mode === 'undefined' ? this.pauseMode : mode);
        },
        /**
         * 设置音量
         * @param val 0 - 32
         */
        volume: function (val) {
            switch (val) {
                case 1:
                    this._volumn = this._volumn >= 32 ? 32 : ++this._volumn;
                    break;
                case -1:
                    this._volumn = this._volumn <= 0 ? 0 : --this._volumn;
                    break;
                default :
                    this._volumn = val;
                    break;
            }
            Api.DataAccess.volumn(this._volumn);
            //Api.SysSetting.env(this._volumnCacheKey, this._volumn);
            this.fire('volume', this._volumn);
        },

        /**
         * 静音设置
         */
        mute: function () {
            var isMute = !!this.player.getMute();
            if (!isMute) {
                this.player.audioMute();
            } else {
                this.player.audioUnmute();
            }
            this.fire('mute', !isMute);
        },
        /**
         * 是否静音
         * @returns {boolean}
         */
        isMute: function () {
            return !!this.player.getMute();
        },
        /**
         * 获取影片的长度
         * @param flag 是否转换成秒
         * @returns {*}
         */
        getLength: function (flag) {
            var timeStr = this.player.getMediaDuration(),
                timeArray = timeStr.split(':');
            //当Source属性为本地媒体文件时，该方法返回正播放媒体的总时长；当Source属性为DVB广播频道、NGOD-VOD、IP-UDP码流时，该方法返回“0”。
            //是否转换成秒
            if (flag) {
                if (timeArray.length == 3) {
                    //时间换算成秒
                    return parseInt(timeArray[0]) * 3600 + parseInt(timeArray[1]) * 60 + parseInt(timeArray[2]);
                } else {
                    return 0;
                }
            } else {
                //数字不够两位补零
                var newArray = $.map(timeArray, function (n) {
                    return Util.pad(n, 2);
                });
                return newArray.join(':');
            }
        },
        /**
         * 获取播放的时间，返回时间格式
         * @returns {string|*}
         */
        getPlayTime: function () {
            var total = this.point(),
                hours = parseInt(total / 3600),
                minute = parseInt((total - hours * 3600) / 60),
                second = total - hours * 3600 - minute * 60,
                array = [hours, minute, second];
            var newArray = $.map(array, function (n) {
                return Util.pad(n, 2);
            });
            return newArray.join(':');
        },
        /**
         * 获取或设置影片播放事件，单位是秒
         * @param second
         * @returns {*}
         */
        point: function (second) {
            if (second !== undefined && $.type(parseInt(second)) == 'number') {
                //设置媒体的播放点,数值型，只读，单位为秒
                this.player.point = second;
            } else {
                return this.player.currentPoint;
            }
        },
        /**
         * 刷新
         */
        refresh: function () {
            this.player.refresh();
        },
        /**
         *  切换视频画面格式，1为16:9，2为4:3 combined播放模式，3为4:3 Pan-Scan 播放模式，4为4:3 Letter-Box 播放模式，5为全屏模式，6为Auto，默认值为Auto。
         * @param mode
         * @returns {*|MediaPlayer.videoAspect|number|Player.player.videoAspect}
         */
        aspect: function (mode) {
            //功能：视频画面格式，1为16:9，2为4:3 combined播放模式，3为4:3 Pan-Scan 播放模式，4为4:3 Letter-Box 播放模式，5为全屏模式，6为Auto，默认值为Auto。
            if (mode) {
                this.player.videoAspect = mode;
                this.fire('aspect', mode);
            } else {
                return this.player.videoAspect;
            }
        },
        /**
         * 切换视频制式，只接受以下的输入值：1为PAL，2为NTSC，3为SECAM，4为Auto，默认值为4
         * @param mode
         * @returns {*|Player.player.videoMode}
         */
        mode: function (mode) {
            //视频制式，只接受以下的输入值：1为PAL，2为NTSC，3为SECAM，4为Auto，默认值为4
            if (mode) {
                this.player.videoMode = mode;
            } else {
                return this.player.videoMode;
            }
        },
        /**
         * 设置播放速度
         * @param pace 倍数，1、2、4、8、16、32、-1、-2、-4、-8、-16、-32
         */
        setPace: function (pace) {
            this.player.pace = this.pace = pace;
            this.refresh();
            if (pace > 1) {
                this.fire('fastForward', this.pace);
            } else if (pace < -1) {
                this.fire('fastBackward', this.pace);
            }
            this.fire('pace', this.pace);
        },
        /**
         * 快进
         */
        fastForward: function () {
            if (this.pace == 1) {
                this.pace = 12;
            } else if (this.pace == 12) {
                this.pace = 32;
            } else if (this.pace == 32) {
                this.pace = 1;
            } else {
                this.pace = 12;
            }
            /*
             if (this.pace < 1) {
             this.pace = 1;
             } else {
             this.pace *= 2;
             if (this.pace > 32) {
             this.pace = 1;
             }
             }
             */
            this.player.pace = this.pace;
            this.refresh();
            this.fire('fastForward', this.pace);
        },
        /**
         * 快退
         */
        fastBackward: function () {
            if (this.pace == 1) {
                this.pace = -12;
            } else if (this.pace == -12) {
                this.pace = -32;
            } else if (this.pace == -32) {
                this.pace = 1;
            } else {
                this.pace = -12;
            }
            /*
             if (this.pace >= 0) {
             this.pace = -1;
             } else if (this.pace < 0) {
             this.pace *= 2;
             if (this.pace < -32) {
             this.pace = 1;
             }
             }
             */
            this.player.pace = this.pace;
            this.refresh();
            this.fire('fastBackward', this.pace);
        },
        /**
         * 判断当前播放的视频是否 视频流
         * @returns {boolean}
         */
        isDVBVideo: function () {
            // 视频信号：[2,4]、[4,27]; 音频：[4]

            // 音频=2，视频!=2
            if (this.serviceType) {
                return this.serviceType != 2;
            } else {
                var eleStreams = this.player.eleStreams || [];
                if (eleStreams.length == 1 && eleStreams[0].eleStreamType == 4) {
                    return false;
                } else {
                    for (var i = 0, len = eleStreams.length; i < len; i++) {
                        if (eleStreams[i].eleStreamType == 2 || eleStreams[i].eleStreamType == 4) {
                            return true;
                        }
                    }
                }
                return false;
            }

        }
    }, TVUI.Base);

    TVUI.Player = Player;

})(TVUI);
;
/**
 * 延时加载图片组件
 */
(function ($, TVUI) {

    var LazyLoad = TVUI.Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                //可视区选择器
                view: document.body,

                //内容区选择器
                el: document.body,

                //占位图片
                placeholder: 'theme/common/img/space.gif',

                //加载图片阀值，即图片在距离可视区多少像素时开始加载
                threshold: 100,

                //是否替换content中的图片src值
                replaceSrc: false,

                //是否异步加载content
                async: false,

                //内容html
                content: '',

                //滚动条实例
                scrollBar: null
            }, options || {});

            /**
             * 内容区对象
             * @type {*|HTMLElement}
             */
            this.el = $(o.el);
            /**
             * 可视区对象
             * @type {*|HTMLElement}
             */
            this.view = $(o.view);
            /**
             * 占位图片
             */
            this.placeholder = o.placeholder;
            /**
             * 阀值
             * @type {number|lazyload.threshold|jt.threshold|touch.threshold}
             */
            this.threshold = o.threshold;
            /**
             * 内容
             */
            this.content = o.content;
            this.async = o.async;
            this.replaceSrc = o.replaceSrc;
            this.scrollBar = o.scrollBar;

            /**
             * 可视区的位置
             */
            this.parentOffset = this.view.offset();
            this.render();
            this.imgs = this.el.find('img');
            this.events();
            this.load();
        },
        render: function () {
            //如果是异步加载内容
            if (this.content && this.async) {

                //需要替换src的原始值
                if (this.replaceSrc) {
                    var r1 = /<img [^>]*src=['"]([^'"]+)[^>]*>/gi,
                        r2 = /src=['"]([^'"]+)['"]/gi,
                        placeholder = this.placeholder;

                    this.content = this.content.replace(r1, function (img) {
                        return img.replace(r2, function (src) {
                            return 'data-' + src + ' src="' + placeholder + '"';
                        });
                    });
                }
                this.el.html(this.content);
            }
        },
        events: function () {
            var self = this;
            if (this.scrollBar) {
                this.scrollBar.on('scroll', function () {
                    self.load();
                });

                this.imgs.each(function (i, img) {
                    //图片加载完成时要重置滚动条
                    img.onload = function () {
                        self.scrollBar.reset();
                    };
                });
            }
        },
        load: function () {
            var self = this,
                parent = this.parentOffset,
                view = parent.top + parent.height;

            this.imgs.each(function (i, img) {
                //已经加载完成的图片不需要再加载
                if (img.className.indexOf('J_load') === -1) {
                    var $img = $(img),
                        offset = $img.offset(),
                        src = $img.attr('data-src');
                    if (offset.top - self.threshold < view) {
                        $img.attr('src', src).addClass('J_load');
                    }
                }
            });
        }


    }, TVUI.Base);


    TVUI.LazyLoad = LazyLoad;
})(Zepto, TVUI);;
/**
 * loading 模块
 */
(function (TVUI, $) {

    var Loading = {
        /**
         * 配置项
         */
        __config: {
            template: '<div class="tvui-loading"><span>加载中...</span></div>',
            appendTo: document.body,
            width: 300,
            height: 50
        },
        /**
         * 显示loading
         */
        show: function () {
            if (!this.el) {
                var c = this.__config;
                this.el = $(c.template);
                this.parent = $(c.appendTo);
                var ofs = this.parent.offset();
                this.el.css({
                    width: c.width,
                    height: c.height,
                    position: 'absolute',
                    left: (ofs.width - c.width) / 2,
                    top: (ofs.height - c.height) / 2
                });
                this.el.appendTo(this.parent);
            }
            this.el.show();
        },
        /**
         * 隐藏loading
         */
        hide: function () {
            this.el.hide();
        },
        /**
         * 设置配置项
         * @param config
         */
        config: function (config) {
            $.extend(this.__config, config || {});
            this.el = null;
            this.parent = null;
        }
    };

    TVUI.Loading = Loading;

})(TVUI, Zepto);;
/**
 * 幻灯片组件
 */
(function (TVUI, $) {

    var Slide = TVUI.Class.create({

        init: function (options) {
            var o = this.options = $.extend({

                el: document.body,

                //图片数组
                data: [],

                //初始显示第几个
                index: 0,

                //切换间隔时间
                interval: 5000,

                //自动开始切换
                auto: true,

                focusClass: 'focus',

                active: true

            }, options || {});
            this.el = $(o.el);
            this.data = o.data;
            this.currentIndex = o.index;
            this.total = this.data.length;
            this._active = o.active;
            this._active && this.focus();
            this.options.auto && this.start();
            this.change(this.currentIndex);
            this.events();

        },
        change: function (index) {
            if (!this.img) {
                this.img = new Image();
                this.el.append(this.img);
            }
            this.img.src = this.data[index];
            this.fire('change', index);
        },
        next: function () {
            var last = this.data.length - 1;
            if (this.currentIndex < last) {
                ++this.currentIndex;
            }
            this.change(this.currentIndex);
        },
        prev: function () {
            if (this.currentIndex > 0) {
                --this.currentIndex;
            }
            this.change(this.currentIndex);
        },
        start: function () {
            this.stop();
            var self = this;
            this.timer = setInterval(function () {
                self.currentIndex = self.currentIndex >= self.total - 1 ? 0 : ++self.currentIndex;
                self.change(self.currentIndex);
            }, this.options.interval);
        },
        stop: function () {
            clearInterval(this.timer);
        },
        focus: function () {
            this.el.addClass(this.options.focusClass);
            this.fire('focus');
        },
        blur: function () {
            this.el.removeClass(this.options.focusClass);
            this.fire('blur');
        },
        select: function () {
            this.fire('select', this.currentIndex, this.data[this.currentIndex]);
        },
        events: function () {
            var _this = this;

            this.registerEvent(TVUI.Event.onOk(function () {
                this._active && this.select();
            }, this));

            this.on('active', function () {
                _this.focus();
            });

            this.on('unActive', function () {
                _this.blur();
            });
        }
    }, TVUI.Base);

    TVUI.Slide = Slide;

})(TVUI, Zepto);;
/**
 * 导航组件模块
 */
(function (TVUI, $) {

    var Nav = TVUI.Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                //数据数组
                data: [],

                //模版
                template: '<ul>{{#data}}<li>{{name}}</li>{{/data}}</ul>',

                //列表项元素选择器
                itemSelector: 'li',

                type: 1, //排列方式： 1水平，2垂直

                //列表项尺寸，如果是水平排列方式，就是宽度，如果是垂直排列方式，就是高度
                itemSize: 100,

                //列表容器选择器
                container: document.body,

                //只显示几项
                viewCount: 5,

                //panel参数选项，不需要设置data和cols
                panelOptions: {}
            }, options || {});

            this.setData(o.data);
            this.template = o.template;
            this.container = $(o.container);
        },
        /**
         * 设置数据
         * @param data 数组
         */
        setData: function (data) {
            this.data = {data: data || []};
        },
        /**
         * 修改模版
         * @param template
         */
        setTemplate: function (template) {
            this.template = template;
        },
        /**
         * 渲染页面
         */
        render: function () {
            var o = this.options;
            var html = TVUI.View.render(this.template, this.data);
            this.el = $(html);
            this.items = this.el.find(o.itemSelector);
            o.type == 1 ?
                this.el.width(this.items.length * o.itemSize) :
                this.el.height(this.items.length * o.itemSize);
            this.container.empty();
            this.container.append(this.el);
            this.setPanel();
        },
        setPanel: function () {
            if (this.panel) {
                this.panel.reset(this.items, 0);
            } else {
                var o = this.options,
                    events = ['focus', 'blur', 'select', 'active', 'unActive', 'leave'],
                    _this = this,
                    panelOptions = $.extend(o.panelOptions, {
                        data: this.items,
                        cols: o.type == 1 ? this.items.length : 1
                    });
                this.panel = new TVUI.Panel(panelOptions);

                this.panel.on('focus initFixed', function (i) {
                    var array = TVUI.Util.rangeFixed(_this.items, o.viewCount, i),
                        itemIndex = _this.items.indexOf(array[0]),
                        val = -o.itemSize * itemIndex,
                        cssObject = o.type == 1 ? {
                            'transform': 'translate3d(' + val + 'px,0,0)',
                            '-webkit-transform': 'translate3d(' + val + 'px,0,0)'
                        } : {
                            'transform': 'translate3d(0,' + val + 'px,0)',
                            '-webkit-transform': 'translate3d(0,' + val + 'px,0)'
                        };
                    _this.el.css(cssObject);
                });

                $.each(events, function (i, n) {
                    _this[n] = function () {
                        _this.panel[n].apply(_this.panel, arguments);
                    };
                    _this.panel.on(n, function () {
                        var array = TVUI.Util.makeArray(arguments);
                        array.unshift(n);
                        _this.fire.apply(_this, array);
                    });
                });

                this.panel.on('active unActive', function () {
                    _this._active = _this.panel._active;
                });
            }


        },
        /**
         * 重置
         * @param data
         */
        reset: function (data) {
            this.setData(data || []);
            this.render();
            this.fire('reset', data);
        },
        /**
         * 销毁组件
         */
        destroy: function () {
            this.panel && this.panel.destroy();
            this.el && this.el.remove();
            this.items = null;
            this.parent.prototype.destroy.call(this);
        }
    }, TVUI.Base);

    TVUI.Nav = Nav;

})(TVUI, Zepto);;
/**
 * 列表组件
 */

(function (TVUI, $) {

    var List = TVUI.Class.create({
        init: function (options) {
            var o = this.options = $.extend({
                //数据数组
                data: [],

                //列表模版
                template: '<ul>{{#data}}<li>{{name}}</li>{{/data}}</ul>',

                //滚动条模版
                scrollTemplate: '<div class="tvui-scrollBar"><span></span></div>',

                //容器选择器
                container: document.body,

                //列表项选择器
                itemSelector: 'li',

                //滚动条柄选择器
                scrollHandleSelector: 'span',

                //布局几列
                cols: 0,

                //列表项总数
                total: 0,

                //初始展示页码索引
                pageIndex: 0,

                //每页显示几项
                pageSize: 10,

                //初始第几项聚焦，如果是异步分页，每页都是从0开始计算
                focusIndex: 0,

                //是否异步分页
                async: false,

                //分页方式，0：不与panel关联分页，1：垂直分页，2：水平翻页，3：垂直水平都翻页
                type: 1,

                //是否显示滚动条
                scrollBar: true,

                //初始是否活动状态
                active: true,

                //截取文字所在位置的选择器
                textSelector: null,

                //截取多少个字符，一个中文按2个字符计算，-1表示不截取
                textChar: -1,

                //截取文字属性名称
                textAttrName: 'data-text'


            }, options || {});
            /**
             * 组件容器元素
             * @type {*|HTMLElement}
             */
            this.container = $(o.container);
            /**
             * 列表模版，模版采用mustache引擎
             */
            this.template = o.template;
            /**
             * 滚动条元素
             * @type {*|HTMLElement}
             */
            this.$track = $(o.scrollTemplate);
            /**
             * 滚动条句柄元素
             */
            this.$handle = this.$track.find(o.scrollHandleSelector);
            this._active = o.active;
            this.setData(o.data);
        },
        /**
         * 修改数据
         * @param data
         */
        setData: function (data) {
            this.data = {data: data || []};
            this.fire('setData', data);
        },
        /**
         * 渲染列表
         */
        render: function () {
            var o = this.options;
            var html = TVUI.View.render(this.template, this.data);
            var $content = $(html);
            this.items = $content.find(o.itemSelector);
            //如果已经执行过渲染，修改属性
            if (this.isRender) {
                this.$content.remove();
                this.$content = $content;
                this.container.prepend(this.$content);
            } else {
                //第一次执行，创建属性
                this.container.empty();
                this.$content = $content;
                this.container.append(this.$content);
                //是否渲染滚动条
                if (o.scrollBar) {
                    this.container.append(this.$track);
                } else {
                    this.$track.hide();
                }
                this.setPanel();
            }
            //标识已经执行过渲染
            this.isRender = true;
        },
        /**
         * 设置关联组件
         */
        setPanel: function () {
            var events = ['focus', 'blur', 'select', 'active', 'unActive', 'leave'],
                o = this.options,
                _this = this;

            this.pager = new TVUI.Pager({
                total: o.total,
                pageIndex: o.pageIndex,
                pageSize: o.pageSize,
                async: o.async,
                type: o.type
            });

            this.panel = new TVUI.Panel({
                data: this.items,
                cols: o.cols,
                focusIndex: o.focusIndex,
                pager: this.pager,
                active: o.active,
                textSelector: o.textSelector,
                textChar: o.textChar,
                textAttrName: o.textAttrName
            });

            this.scrollBar = new TVUI.ScrollBar({
                view: this.container,
                content: this.$content,
                track: this.$track,
                handle: this.$handle,
                panel: this.panel
            });

            $.each(events, function (i, n) {
                _this[n] = function () {
                    _this.panel[n].apply(_this.panel, arguments);
                };
                _this.panel.on(n, function () {
                    var array = TVUI.Util.makeArray(arguments);
                    array.unshift(n);
                    _this.fire.apply(_this, array);
                });
            });
            this.pager.on('change', function (pageIndex, type) {
                _this.fire('pager', pageIndex, type);
            });
            this.panel.on('active unActive', function () {
                _this._active = _this.panel._active;
            });
        },
        /**
         * 重置列表，数据或模版改变后需要执行重置
         * @param data
         * @param total
         * @param pageIndex
         * @param focusIndex
         */
        reset: function (data, total, pageIndex, focusIndex) {
            pageIndex = pageIndex || 0;
            focusIndex = focusIndex || 0;
            var o = this.options;
            this.setData(data);
            this.render();
            this.pager && this.pager.reset(total, o.pageSize, pageIndex);
            this.panel && this.panel.reset(this.items, focusIndex);
            if (this.scrollBar) {
                this.scrollBar.$content = this.$content;
                this.scrollBar.reset();
            }
            if (this.panel && this._active) {
                this.panel.autoFocus();
            }

            this.fire('reset', data, total, pageIndex, focusIndex);
        },
        /**
         * 切换分页
         * @param pageIndex
         */
        change: function (pageIndex) {
            this.pager && this.pager.change(pageIndex);
        },
        /**
         * 聚焦
         * @param type 可选，0：初始化时，1：向下翻页时，2：向上翻页时
         */
        autoFocus: function (type) {
            if (this.panel && this.panel._active) {
                this.panel.autoFocus(type);
            }
        },
        /**
         * 销毁组件
         */
        destroy: function () {
            this.pager && this.pager.destroy();
            this.panel && this.panel.destroy();
            this.scrollBar && this.scrollBar.destroy();
            this.$content && this.$content.remove();
            this.$track && this.$track.remove();
            this.parent.prototype.destroy.call(this);
        }

    }, TVUI.Base);

    TVUI.List = List;

})(TVUI, Zepto);;
(function (TVUI) {
    var util = TVUI.Util,
        Event = TVUI.Event,
        $ = TVUI.$,
        isShow = false,
        box,
        log = function () {
            var args = util.makeArray(arguments);
            var msg = [];
            $.each(args, function (i, n) {
                if (typeof n == 'object') {
                    try {
                        msg.push(JSON.stringify(n));
                    } catch (e) {
                        msg.push(n);
                    }
                } else {
                    msg.push(n);
                }
            });
            var div = $('<div>').css({
                "border-bottom": "1px dashed #666",
                "padding": "10px"
            });
            isShow = true;
            div.html(msg.join(" | "));
            if(box) {
                box.show();
                box.append(div);
            }
            util.log.apply(util, arguments);
        };

    //星号键
    Event.onKey(318, function () {
        if(TVUI.debug) {
            isShow = !isShow;
            if (isShow) {
                box.show();
            } else {
                box.hide();
            }
        }
    });

    //信息键，清空log
    Event.onKey(73, function () {
        TVUI.debug && box.empty();
    });

    window.onerror = function () {
        //log.apply(log, arguments);
        // return true;
    };
    TVUI.Log = log;

    $(function(){
        if(TVUI.debug) {
            box = $('#debugbox');
            if (box.length === 0) {
                box = $('<div>').attr('id', 'debugbox');
                box.css({
                    "position": "absolute",
                    "z-index": "9999",
                    "width": "90%",
                    "height": "90%",
                    "background": "#fff",
                    "color": "#000",
                    "left": "50px",
                    "top": "20px",
                    "border": "5px solid red",
                    "font-size": "18px",
                    "word-break": "break-all",
                    "display": "none"
                });
                $('body').append(box);
            }
        }
    });

})(TVUI);



;
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.io=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

module.exports = _dereq_('./lib/');

},{"./lib/":2}],2:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var url = _dereq_('./url');
var parser = _dereq_('socket.io-parser');
var Manager = _dereq_('./manager');
var debug = _dereq_('debug')('socket.io-client');

/**
 * Module exports.
 */

module.exports = exports = lookup;

/**
 * Managers cache.
 */

var cache = exports.managers = {};

/**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */

function lookup(uri, opts) {
  if (typeof uri == 'object') {
    opts = uri;
    uri = undefined;
  }

  opts = opts || {};

  var parsed = url(uri);
  var source = parsed.source;
  var id = parsed.id;
  var path = parsed.path;
  var sameNamespace = (cache[id] && cache[id].nsps[path] &&
                       path == cache[id].nsps[path].nsp);
  var newConnection = opts.forceNew || opts['force new connection'] ||
                      false === opts.multiplex || sameNamespace;

  var io;

  if (newConnection) {
    debug('ignoring socket cache for %s', source);
    io = Manager(source, opts);
  } else {
    if (!cache[id]) {
      debug('new io instance for %s', source);
      cache[id] = Manager(source, opts);
    }
    io = cache[id];
  }

  return io.socket(parsed.path);
}

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = parser.protocol;

/**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */

exports.connect = lookup;

/**
 * Expose constructors for standalone build.
 *
 * @api public
 */

exports.Manager = _dereq_('./manager');
exports.Socket = _dereq_('./socket');

},{"./manager":3,"./socket":5,"./url":6,"debug":10,"socket.io-parser":44}],3:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var url = _dereq_('./url');
var eio = _dereq_('engine.io-client');
var Socket = _dereq_('./socket');
var Emitter = _dereq_('component-emitter');
var parser = _dereq_('socket.io-parser');
var on = _dereq_('./on');
var bind = _dereq_('component-bind');
var object = _dereq_('object-component');
var debug = _dereq_('debug')('socket.io-client:manager');
var indexOf = _dereq_('indexof');
var Backoff = _dereq_('backo2');

/**
 * Module exports
 */

module.exports = Manager;

/**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */

function Manager(uri, opts){
  if (!(this instanceof Manager)) return new Manager(uri, opts);
  if (uri && ('object' == typeof uri)) {
    opts = uri;
    uri = undefined;
  }
  opts = opts || {};

  opts.path = opts.path || '/socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.randomizationFactor(opts.randomizationFactor || 0.5);
  this.backoff = new Backoff({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor()
  });
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.readyState = 'closed';
  this.uri = uri;
  this.connected = [];
  this.encoding = false;
  this.packetBuffer = [];
  this.encoder = new parser.Encoder();
  this.decoder = new parser.Decoder();
  this.autoConnect = opts.autoConnect !== false;
  if (this.autoConnect) this.open();
}

/**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */

Manager.prototype.emitAll = function() {
  this.emit.apply(this, arguments);
  for (var nsp in this.nsps) {
    this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
  }
};

/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */

Manager.prototype.updateSocketIds = function(){
  for (var nsp in this.nsps) {
    this.nsps[nsp].id = this.engine.id;
  }
};

/**
 * Mix in `Emitter`.
 */

Emitter(Manager.prototype);

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnection = function(v){
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionAttempts = function(v){
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelay = function(v){
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  this.backoff && this.backoff.setMin(v);
  return this;
};

Manager.prototype.randomizationFactor = function(v){
  if (!arguments.length) return this._randomizationFactor;
  this._randomizationFactor = v;
  this.backoff && this.backoff.setJitter(v);
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelayMax = function(v){
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  this.backoff && this.backoff.setMax(v);
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.timeout = function(v){
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */

Manager.prototype.maybeReconnectOnOpen = function() {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect();
  }
};


/**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */

Manager.prototype.open =
Manager.prototype.connect = function(fn){
  debug('readyState %s', this.readyState);
  if (~this.readyState.indexOf('open')) return this;

  debug('opening %s', this.uri);
  this.engine = eio(this.uri, this.opts);
  var socket = this.engine;
  var self = this;
  this.readyState = 'opening';
  this.skipReconnect = false;

  // emit `open`
  var openSub = on(socket, 'open', function() {
    self.onopen();
    fn && fn();
  });

  // emit `connect_error`
  var errorSub = on(socket, 'error', function(data){
    debug('connect_error');
    self.cleanup();
    self.readyState = 'closed';
    self.emitAll('connect_error', data);
    if (fn) {
      var err = new Error('Connection error');
      err.data = data;
      fn(err);
    } else {
      // Only do this if there is no fn to handle the error
      self.maybeReconnectOnOpen();
    }
  });

  // emit `connect_timeout`
  if (false !== this._timeout) {
    var timeout = this._timeout;
    debug('connect attempt will timeout after %d', timeout);

    // set timer
    var timer = setTimeout(function(){
      debug('connect attempt timed out after %d', timeout);
      openSub.destroy();
      socket.close();
      socket.emit('error', 'timeout');
      self.emitAll('connect_timeout', timeout);
    }, timeout);

    this.subs.push({
      destroy: function(){
        clearTimeout(timer);
      }
    });
  }

  this.subs.push(openSub);
  this.subs.push(errorSub);

  return this;
};

/**
 * Called upon transport open.
 *
 * @api private
 */

Manager.prototype.onopen = function(){
  debug('open');

  // clear old subs
  this.cleanup();

  // mark as open
  this.readyState = 'open';
  this.emit('open');

  // add new subs
  var socket = this.engine;
  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
};

/**
 * Called with data.
 *
 * @api private
 */

Manager.prototype.ondata = function(data){
  this.decoder.add(data);
};

/**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */

Manager.prototype.ondecoded = function(packet) {
  this.emit('packet', packet);
};

/**
 * Called upon socket error.
 *
 * @api private
 */

Manager.prototype.onerror = function(err){
  debug('error', err);
  this.emitAll('error', err);
};

/**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */

Manager.prototype.socket = function(nsp){
  var socket = this.nsps[nsp];
  if (!socket) {
    socket = new Socket(this, nsp);
    this.nsps[nsp] = socket;
    var self = this;
    socket.on('connect', function(){
      socket.id = self.engine.id;
      if (!~indexOf(self.connected, socket)) {
        self.connected.push(socket);
      }
    });
  }
  return socket;
};

/**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */

Manager.prototype.destroy = function(socket){
  var index = indexOf(this.connected, socket);
  if (~index) this.connected.splice(index, 1);
  if (this.connected.length) return;

  this.close();
};

/**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */

Manager.prototype.packet = function(packet){
  debug('writing packet %j', packet);
  var self = this;

  if (!self.encoding) {
    // encode, then write to engine with result
    self.encoding = true;
    this.encoder.encode(packet, function(encodedPackets) {
      for (var i = 0; i < encodedPackets.length; i++) {
        self.engine.write(encodedPackets[i]);
      }
      self.encoding = false;
      self.processPacketQueue();
    });
  } else { // add packet to the queue
    self.packetBuffer.push(packet);
  }
};

/**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */

Manager.prototype.processPacketQueue = function() {
  if (this.packetBuffer.length > 0 && !this.encoding) {
    var pack = this.packetBuffer.shift();
    this.packet(pack);
  }
};

/**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */

Manager.prototype.cleanup = function(){
  var sub;
  while (sub = this.subs.shift()) sub.destroy();

  this.packetBuffer = [];
  this.encoding = false;

  this.decoder.destroy();
};

/**
 * Close the current socket.
 *
 * @api private
 */

Manager.prototype.close =
Manager.prototype.disconnect = function(){
  this.skipReconnect = true;
  this.backoff.reset();
  this.readyState = 'closed';
  this.engine && this.engine.close();
};

/**
 * Called upon engine close.
 *
 * @api private
 */

Manager.prototype.onclose = function(reason){
  debug('close');
  this.cleanup();
  this.backoff.reset();
  this.readyState = 'closed';
  this.emit('close', reason);
  if (this._reconnection && !this.skipReconnect) {
    this.reconnect();
  }
};

/**
 * Attempt a reconnection.
 *
 * @api private
 */

Manager.prototype.reconnect = function(){
  if (this.reconnecting || this.skipReconnect) return this;

  var self = this;

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    debug('reconnect failed');
    this.backoff.reset();
    this.emitAll('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.backoff.duration();
    debug('will wait %dms before reconnect attempt', delay);

    this.reconnecting = true;
    var timer = setTimeout(function(){
      if (self.skipReconnect) return;

      debug('attempting reconnect');
      self.emitAll('reconnect_attempt', self.backoff.attempts);
      self.emitAll('reconnecting', self.backoff.attempts);

      // check again for the case socket closed in above events
      if (self.skipReconnect) return;

      self.open(function(err){
        if (err) {
          debug('reconnect attempt error');
          self.reconnecting = false;
          self.reconnect();
          self.emitAll('reconnect_error', err.data);
        } else {
          debug('reconnect success');
          self.onreconnect();
        }
      });
    }, delay);

    this.subs.push({
      destroy: function(){
        clearTimeout(timer);
      }
    });
  }
};

/**
 * Called upon successful reconnect.
 *
 * @api private
 */

Manager.prototype.onreconnect = function(){
  var attempt = this.backoff.attempts;
  this.reconnecting = false;
  this.backoff.reset();
  this.updateSocketIds();
  this.emitAll('reconnect', attempt);
};

},{"./on":4,"./socket":5,"./url":6,"backo2":7,"component-bind":8,"component-emitter":9,"debug":10,"engine.io-client":11,"indexof":40,"object-component":41,"socket.io-parser":44}],4:[function(_dereq_,module,exports){

/**
 * Module exports.
 */

module.exports = on;

/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

function on(obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function(){
      obj.removeListener(ev, fn);
    }
  };
}

},{}],5:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var parser = _dereq_('socket.io-parser');
var Emitter = _dereq_('component-emitter');
var toArray = _dereq_('to-array');
var on = _dereq_('./on');
var bind = _dereq_('component-bind');
var debug = _dereq_('debug')('socket.io-client:socket');
var hasBin = _dereq_('has-binary');

/**
 * Module exports.
 */

module.exports = exports = Socket;

/**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */

var events = {
  connect: 1,
  connect_error: 1,
  connect_timeout: 1,
  disconnect: 1,
  error: 1,
  reconnect: 1,
  reconnect_attempt: 1,
  reconnect_failed: 1,
  reconnect_error: 1,
  reconnecting: 1
};

/**
 * Shortcut to `Emitter#emit`.
 */

var emit = Emitter.prototype.emit;

/**
 * `Socket` constructor.
 *
 * @api public
 */

function Socket(io, nsp){
  this.io = io;
  this.nsp = nsp;
  this.json = this; // compat
  this.ids = 0;
  this.acks = {};
  if (this.io.autoConnect) this.open();
  this.receiveBuffer = [];
  this.sendBuffer = [];
  this.connected = false;
  this.disconnected = true;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Subscribe to open, close and packet events
 *
 * @api private
 */

Socket.prototype.subEvents = function() {
  if (this.subs) return;

  var io = this.io;
  this.subs = [
    on(io, 'open', bind(this, 'onopen')),
    on(io, 'packet', bind(this, 'onpacket')),
    on(io, 'close', bind(this, 'onclose'))
  ];
};

/**
 * "Opens" the socket.
 *
 * @api public
 */

Socket.prototype.open =
Socket.prototype.connect = function(){
  if (this.connected) return this;

  this.subEvents();
  this.io.open(); // ensure open
  if ('open' == this.io.readyState) this.onopen();
  return this;
};

/**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.send = function(){
  var args = toArray(arguments);
  args.unshift('message');
  this.emit.apply(this, args);
  return this;
};

/**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */

Socket.prototype.emit = function(ev){
  if (events.hasOwnProperty(ev)) {
    emit.apply(this, arguments);
    return this;
  }

  var args = toArray(arguments);
  var parserType = parser.EVENT; // default
  if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
  var packet = { type: parserType, data: args };

  // event ack callback
  if ('function' == typeof args[args.length - 1]) {
    debug('emitting packet with ack id %d', this.ids);
    this.acks[this.ids] = args.pop();
    packet.id = this.ids++;
  }

  if (this.connected) {
    this.packet(packet);
  } else {
    this.sendBuffer.push(packet);
  }

  return this;
};

/**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.packet = function(packet){
  packet.nsp = this.nsp;
  this.io.packet(packet);
};

/**
 * Called upon engine `open`.
 *
 * @api private
 */

Socket.prototype.onopen = function(){
  debug('transport is open - connecting');

  // write connect packet if necessary
  if ('/' != this.nsp) {
    this.packet({ type: parser.CONNECT });
  }
};

/**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */

Socket.prototype.onclose = function(reason){
  debug('close (%s)', reason);
  this.connected = false;
  this.disconnected = true;
  delete this.id;
  this.emit('disconnect', reason);
};

/**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onpacket = function(packet){
  if (packet.nsp != this.nsp) return;

  switch (packet.type) {
    case parser.CONNECT:
      this.onconnect();
      break;

    case parser.EVENT:
      this.onevent(packet);
      break;

    case parser.BINARY_EVENT:
      this.onevent(packet);
      break;

    case parser.ACK:
      this.onack(packet);
      break;

    case parser.BINARY_ACK:
      this.onack(packet);
      break;

    case parser.DISCONNECT:
      this.ondisconnect();
      break;

    case parser.ERROR:
      this.emit('error', packet.data);
      break;
  }
};

/**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onevent = function(packet){
  var args = packet.data || [];
  debug('emitting event %j', args);

  if (null != packet.id) {
    debug('attaching ack callback to event');
    args.push(this.ack(packet.id));
  }

  if (this.connected) {
    emit.apply(this, args);
  } else {
    this.receiveBuffer.push(args);
  }
};

/**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */

Socket.prototype.ack = function(id){
  var self = this;
  var sent = false;
  return function(){
    // prevent double callbacks
    if (sent) return;
    sent = true;
    var args = toArray(arguments);
    debug('sending ack %j', args);

    var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
    self.packet({
      type: type,
      id: id,
      data: args
    });
  };
};

/**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onack = function(packet){
  debug('calling ack %s with %j', packet.id, packet.data);
  var fn = this.acks[packet.id];
  fn.apply(this, packet.data);
  delete this.acks[packet.id];
};

/**
 * Called upon server connect.
 *
 * @api private
 */

Socket.prototype.onconnect = function(){
  this.connected = true;
  this.disconnected = false;
  this.emit('connect');
  this.emitBuffered();
};

/**
 * Emit buffered events (received and emitted).
 *
 * @api private
 */

Socket.prototype.emitBuffered = function(){
  var i;
  for (i = 0; i < this.receiveBuffer.length; i++) {
    emit.apply(this, this.receiveBuffer[i]);
  }
  this.receiveBuffer = [];

  for (i = 0; i < this.sendBuffer.length; i++) {
    this.packet(this.sendBuffer[i]);
  }
  this.sendBuffer = [];
};

/**
 * Called upon server disconnect.
 *
 * @api private
 */

Socket.prototype.ondisconnect = function(){
  debug('server disconnect (%s)', this.nsp);
  this.destroy();
  this.onclose('io server disconnect');
};

/**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */

Socket.prototype.destroy = function(){
  if (this.subs) {
    // clean subscriptions to avoid reconnections
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy();
    }
    this.subs = null;
  }

  this.io.destroy(this);
};

/**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.close =
Socket.prototype.disconnect = function(){
  if (this.connected) {
    debug('performing disconnect (%s)', this.nsp);
    this.packet({ type: parser.DISCONNECT });
  }

  // remove socket from pool
  this.destroy();

  if (this.connected) {
    // fire events
    this.onclose('io client disconnect');
  }
  return this;
};

},{"./on":4,"component-bind":8,"component-emitter":9,"debug":10,"has-binary":36,"socket.io-parser":44,"to-array":48}],6:[function(_dereq_,module,exports){
(function (global){

/**
 * Module dependencies.
 */

var parseuri = _dereq_('parseuri');
var debug = _dereq_('debug')('socket.io-client:url');

/**
 * Module exports.
 */

module.exports = url;

/**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */

function url(uri, loc){
  var obj = uri;

  // default to window.location
  var loc = loc || global.location;
  if (null == uri) uri = loc.protocol + '//' + loc.host;

  // relative path support
  if ('string' == typeof uri) {
    if ('/' == uri.charAt(0)) {
      if ('/' == uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.hostname + uri;
      }
    }

    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug('protocol-less url %s', uri);
      if ('undefined' != typeof loc) {
        uri = loc.protocol + '//' + uri;
      } else {
        uri = 'https://' + uri;
      }
    }

    // parse
    debug('parse %s', uri);
    obj = parseuri(uri);
  }

  // make sure we treat `localhost:80` and `localhost` equally
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80';
    }
    else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443';
    }
  }

  obj.path = obj.path || '/';

  // define unique id
  obj.id = obj.protocol + '://' + obj.host + ':' + obj.port;
  // define href
  obj.href = obj.protocol + '://' + obj.host + (loc && loc.port == obj.port ? '' : (':' + obj.port));

  return obj;
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"debug":10,"parseuri":42}],7:[function(_dereq_,module,exports){

/**
 * Expose `Backoff`.
 */

module.exports = Backoff;

/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */

function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 10000;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}

/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */

Backoff.prototype.duration = function(){
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand =  Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};

/**
 * Reset the number of attempts.
 *
 * @api public
 */

Backoff.prototype.reset = function(){
  this.attempts = 0;
};

/**
 * Set the minimum duration
 *
 * @api public
 */

Backoff.prototype.setMin = function(min){
  this.ms = min;
};

/**
 * Set the maximum duration
 *
 * @api public
 */

Backoff.prototype.setMax = function(max){
  this.max = max;
};

/**
 * Set the jitter
 *
 * @api public
 */

Backoff.prototype.setJitter = function(jitter){
  this.jitter = jitter;
};


},{}],8:[function(_dereq_,module,exports){
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

},{}],9:[function(_dereq_,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],10:[function(_dereq_,module,exports){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    if (!window.DataAccess && typeof console !== 'undefined' && console.log) {

      // This hackery is required for IE8
      // where `console.log` doesn't have 'apply'
      window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
    }
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

},{}],11:[function(_dereq_,module,exports){

module.exports =  _dereq_('./lib/');

},{"./lib/":12}],12:[function(_dereq_,module,exports){

module.exports = _dereq_('./socket');

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = _dereq_('engine.io-parser');

},{"./socket":13,"engine.io-parser":25}],13:[function(_dereq_,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var transports = _dereq_('./transports');
var Emitter = _dereq_('component-emitter');
var debug = _dereq_('debug')('engine.io-client:socket');
var index = _dereq_('indexof');
var parser = _dereq_('engine.io-parser');
var parseuri = _dereq_('parseuri');
var parsejson = _dereq_('parsejson');
var parseqs = _dereq_('parseqs');

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Noop function.
 *
 * @api private
 */

function noop(){}

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket(uri, opts){
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if (uri && 'object' == typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = parseuri(uri);
    opts.host = uri.host;
    opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  }

  this.secure = null != opts.secure ? opts.secure :
    (global.location && 'https:' == location.protocol);

  if (opts.host) {
    var pieces = opts.host.split(':');
    opts.hostname = pieces.shift();
    if (pieces.length) {
      opts.port = pieces.pop();
    } else if (!opts.port) {
      // if no port is specified manually, use the protocol default
      opts.port = this.secure ? '443' : '80';
    }
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (global.location ? location.hostname : 'localhost');
  this.port = opts.port || (global.location && location.port ?
       location.port :
       (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' == typeof this.query) this.query = parseqs.decode(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.jsonp = false !== opts.jsonp;
  this.forceBase64 = !!opts.forceBase64;
  this.enablesXDR = !!opts.enablesXDR;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = opts.timestampRequests;
  this.transports = opts.transports || ['polling', 'websocket'];
  this.readyState = '';
  this.writeBuffer = [];
  this.callbackBuffer = [];
  this.policyPort = opts.policyPort || 843;
  this.rememberUpgrade = opts.rememberUpgrade || false;
  this.binaryType = null;
  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;

  // SSL options for Node.js client
  this.pfx = opts.pfx || null;
  this.key = opts.key || null;
  this.passphrase = opts.passphrase || null;
  this.cert = opts.cert || null;
  this.ca = opts.ca || null;
  this.ciphers = opts.ciphers || null;
  this.rejectUnauthorized = opts.rejectUnauthorized || null;

  this.open();
}

Socket.priorWebsocketSuccess = false;

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = _dereq_('./transport');
Socket.transports = _dereq_('./transports');
Socket.parser = _dereq_('engine.io-parser');

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    agent: this.agent,
    hostname: this.hostname,
    port: this.port,
    secure: this.secure,
    path: this.path,
    query: query,
    forceJSONP: this.forceJSONP,
    jsonp: this.jsonp,
    forceBase64: this.forceBase64,
    enablesXDR: this.enablesXDR,
    timestampRequests: this.timestampRequests,
    timestampParam: this.timestampParam,
    policyPort: this.policyPort,
    socket: this,
    pfx: this.pfx,
    key: this.key,
    passphrase: this.passphrase,
    cert: this.cert,
    ca: this.ca,
    ciphers: this.ciphers,
    rejectUnauthorized: this.rejectUnauthorized
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */
Socket.prototype.open = function () {
  var transport;
  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') != -1) {
    transport = 'websocket';
  } else if (0 == this.transports.length) {
    // Emit error on next tick so it can be listened to
    var self = this;
    setTimeout(function() {
      self.emit('error', 'No transports available');
    }, 0);
    return;
  } else {
    transport = this.transports[0];
  }
  this.readyState = 'opening';

  // Retry with the next transport if the transport is disabled (jsonp: false)
  var transport;
  try {
    transport = this.createTransport(transport);
  } catch (e) {
    this.transports.shift();
    this.open();
    return;
  }

  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function(transport){
  debug('setting transport %s', transport.name);
  var self = this;

  if (this.transport) {
    debug('clearing existing transport %s', this.transport.name);
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
  .on('drain', function(){
    self.onDrain();
  })
  .on('packet', function(packet){
    self.onPacket(packet);
  })
  .on('error', function(e){
    self.onError(e);
  })
  .on('close', function(){
    self.onClose('transport close');
  });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 })
    , failed = false
    , self = this;

  Socket.priorWebsocketSuccess = false;

  function onTransportOpen(){
    if (self.onlyBinaryUpgrades) {
      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
      failed = failed || upgradeLosesBinary;
    }
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' == msg.type && 'probe' == msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);
        if (!transport) return;
        Socket.priorWebsocketSuccess = 'websocket' == transport.name;

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' == self.readyState) return;
          debug('changing transport and sending upgrade packet');

          cleanup();

          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          self.emit('upgrade', transport);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('upgradeError', err);
      }
    });
  }

  function freezeTransport() {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    cleanup();

    transport.close();
    transport = null;
  }

  //Handle any error that happens while probing
  function onerror(err) {
    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    freezeTransport();

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('upgradeError', error);
  }

  function onTransportClose(){
    onerror("transport closed");
  }

  //When the socket is closed while we're probing
  function onclose(){
    onerror("socket closed");
  }

  //When the socket is upgraded while we're probing
  function onupgrade(to){
    if (transport && to.name != transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      freezeTransport();
    }
  }

  //Remove all listeners on the transport and on self
  function cleanup(){
    transport.removeListener('open', onTransportOpen);
    transport.removeListener('error', onerror);
    transport.removeListener('close', onTransportClose);
    self.removeListener('close', onclose);
    self.removeListener('upgrading', onupgrade);
  }

  transport.once('open', onTransportOpen);
  transport.once('error', onerror);
  transport.once('close', onTransportClose);

  this.once('close', onclose);
  this.once('upgrading', onupgrade);

  transport.open();

};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  Socket.priorWebsocketSuccess = 'websocket' == this.transport.name;
  this.emit('open');
  this.flush();

  // we check for `readyState` in case an `open`
  // listener already closed the socket
  if ('open' == this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(parsejson(packet.data));
        break;

      case 'pong':
        this.setPing();
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.emit('error', err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  // In case open handler closes socket
  if  ('closed' == this.readyState) return;
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' == self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api public
*/

Socket.prototype.ping = function () {
  this.sendPacket('ping');
};

/**
 * Called on `drain` event
 *
 * @api private
 */

Socket.prototype.onDrain = function() {
  for (var i = 0; i < this.prevBufferLen; i++) {
    if (this.callbackBuffer[i]) {
      this.callbackBuffer[i]();
    }
  }

  this.writeBuffer.splice(0, this.prevBufferLen);
  this.callbackBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (this.writeBuffer.length == 0) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' != this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, fn) {
  this.sendPacket('message', msg, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, fn) {
  if ('closing' == this.readyState || 'closed' == this.readyState) {
    return;
  }

  var packet = { type: type, data: data };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  this.callbackBuffer.push(fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.readyState = 'closing';

    var self = this;

    function close() {
      self.onClose('forced close');
      debug('socket closing - telling transport to close');
      self.transport.close();
    }

    function cleanupAndClose() {
      self.removeListener('upgrade', cleanupAndClose);
      self.removeListener('upgradeError', cleanupAndClose);
      close();
    }

    function waitForUpgrade() {
      // wait for upgrade to finish since we can't send packets while pausing a transport
      self.once('upgrade', cleanupAndClose);
      self.once('upgradeError', cleanupAndClose);
    }

    if (this.writeBuffer.length) {
      this.once('drain', function() {
        if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      });
    } else if (this.upgrading) {
      waitForUpgrade();
    } else {
      close();
    }
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  Socket.priorWebsocketSuccess = false;
  this.emit('error', err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' == this.readyState || 'open' == this.readyState || 'closing' == this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // clean buffers in next tick, so developers can still
    // grab the buffers on `close` event
    setTimeout(function() {
      self.writeBuffer = [];
      self.callbackBuffer = [];
      self.prevBufferLen = 0;
    }, 0);

    // stop event from firing again for transport
    this.transport.removeAllListeners('close');

    // ensure transport won't stay open
    this.transport.close();

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit close event
    this.emit('close', reason, desc);
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i<j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./transport":14,"./transports":15,"component-emitter":9,"debug":22,"engine.io-parser":25,"indexof":40,"parsejson":32,"parseqs":33,"parseuri":34}],14:[function(_dereq_,module,exports){
/**
 * Module dependencies.
 */

var parser = _dereq_('engine.io-parser');
var Emitter = _dereq_('component-emitter');

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
  this.socket = opts.socket;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * A counter used to prevent collisions in the timestamps used
 * for cache busting.
 */

Transport.timestamps = 0;

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' == this.readyState || '' == this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function(packets){
  if ('open' == this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function(data){
  var packet = parser.decodePacket(data, this.socket.binaryType);
  this.onPacket(packet);
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};

},{"component-emitter":9,"engine.io-parser":25}],15:[function(_dereq_,module,exports){
(function (global){
/**
 * Module dependencies
 */

var XMLHttpRequest = _dereq_('xmlhttprequest');
var XHR = _dereq_('./polling-xhr');
var JSONP = _dereq_('./polling-jsonp');
var websocket = _dereq_('./websocket');

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling(opts){
  var xhr;
  var xd = false;
  var xs = false;
  var jsonp = false !== opts.jsonp;

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname != location.hostname || port != opts.port;
    xs = opts.secure != isSSL;
  }

  opts.xdomain = xd;
  opts.xscheme = xs;
  xhr = new XMLHttpRequest(opts);

  if ('open' in xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    if (!jsonp) throw new Error('JSONP disabled');
    return new JSONP(opts);
  }
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling-jsonp":16,"./polling-xhr":17,"./websocket":19,"xmlhttprequest":20}],16:[function(_dereq_,module,exports){
(function (global){

/**
 * Module requirements.
 */

var Polling = _dereq_('./polling');
var inherit = _dereq_('component-inherit');

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;
var rEscapedNewline = /\\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Callbacks count.
 */

var index = 0;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  this.query = this.query || {};

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    if (!global.___eio) global.___eio = [];
    callbacks = global.___eio;
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;

  // prevent spurious errors from being emitted when the window is unloaded
  if (global.document && global.addEventListener) {
    global.addEventListener('beforeunload', function () {
      if (self.script) self.script.onerror = empty;
    }, false);
  }
}

/**
 * Inherits from Polling.
 */

inherit(JSONPPolling, Polling);

/*
 * JSONP only supports binary as base64 encoded strings
 */

JSONPPolling.prototype.supportsBinary = false;

/**
 * Closes the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
    this.iframe = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
  var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
  script.onerror = function(e){
    self.onError('jsonp poll error',e);
  };

  var insertAt = document.getElementsByTagName('script')[0];
  insertAt.parentNode.insertBefore(script, insertAt);
  this.script = script;

  var isUAgecko = 'undefined' != typeof navigator && /gecko/i.test(navigator.userAgent);
  
  if (isUAgecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  }

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="'+ self.iframeId +'">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  }

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
  data = data.replace(rEscapedNewline, '\\\n');
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch(e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function(){
      if (self.iframe.readyState == 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":18,"component-inherit":21}],17:[function(_dereq_,module,exports){
(function (global){
/**
 * Module requirements.
 */

var XMLHttpRequest = _dereq_('xmlhttprequest');
var Polling = _dereq_('./polling');
var Emitter = _dereq_('component-emitter');
var inherit = _dereq_('component-inherit');
var debug = _dereq_('debug')('engine.io-client:polling-xhr');

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Empty function
 */

function empty(){}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR(opts){
  Polling.call(this, opts);

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = opts.hostname != global.location.hostname ||
      port != opts.port;
    this.xs = opts.secure != isSSL;
  }
}

/**
 * Inherits from Polling.
 */

inherit(XHR, Polling);

/**
 * XHR supports binary
 */

XHR.prototype.supportsBinary = true;

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function(opts){
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.xs = this.xs;
  opts.agent = this.agent || false;
  opts.supportsBinary = this.supportsBinary;
  opts.enablesXDR = this.enablesXDR;

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function(data, fn){
  var isBinary = typeof data !== 'string' && data !== undefined;
  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
  var self = this;
  req.on('success', fn);
  req.on('error', function(err){
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function(){
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function(data){
    self.onData(data);
  });
  req.on('error', function(err){
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request(opts){
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.xs = !!opts.xs;
  this.async = false !== opts.async;
  this.data = undefined != opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.isBinary = opts.isBinary;
  this.supportsBinary = opts.supportsBinary;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  this.create();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function(){
  var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  var xhr = this.xhr = new XMLHttpRequest(opts);
  var self = this;

  try {
    debug('xhr open %s: %s', this.method, this.uri);
    xhr.open(this.method, this.uri, this.async);
    if (this.supportsBinary) {
      // This has to be done after open because Firefox is stupid
      // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
      xhr.responseType = 'arraybuffer';
    }

    if ('POST' == this.method) {
      try {
        if (this.isBinary) {
          xhr.setRequestHeader('Content-type', 'application/octet-stream');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        }
      } catch (e) {}
    }

    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    if (this.hasXDR()) {
      xhr.onload = function(){
        self.onLoad();
      };
      xhr.onerror = function(){
        self.onError(xhr.responseText);
      };
    } else {
      xhr.onreadystatechange = function(){
        if (4 != xhr.readyState) return;
        if (200 == xhr.status || 1223 == xhr.status) {
          self.onLoad();
        } else {
          // make sure the `error` event handler that's user-set
          // does not throw in the same tick and gets caught here
          setTimeout(function(){
            self.onError(xhr.status);
          }, 0);
        }
      };
    }

    debug('xhr data %s', this.data);
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly fhrom the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function() {
      self.onError(e);
    }, 0);
    return;
  }

  if (global.document) {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function(){
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function(data){
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function(err){
  this.emit('error', err);
  this.cleanup(true);
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function(fromError){
  if ('undefined' == typeof this.xhr || null === this.xhr) {
    return;
  }
  // xmlhttprequest
  if (this.hasXDR()) {
    this.xhr.onload = this.xhr.onerror = empty;
  } else {
    this.xhr.onreadystatechange = empty;
  }

  if (fromError) {
    try {
      this.xhr.abort();
    } catch(e) {}
  }

  if (global.document) {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Called upon load.
 *
 * @api private
 */

Request.prototype.onLoad = function(){
  var data;
  try {
    var contentType;
    try {
      contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];
    } catch (e) {}
    if (contentType === 'application/octet-stream') {
      data = this.xhr.response;
    } else {
      if (!this.supportsBinary) {
        data = this.xhr.responseText;
      } else {
        data = 'ok';
      }
    }
  } catch (e) {
    this.onError(e);
  }
  if (null != data) {
    this.onData(data);
  }
};

/**
 * Check if it has XDomainRequest.
 *
 * @api private
 */

Request.prototype.hasXDR = function(){
  return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function(){
  this.cleanup();
};

/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */

if (global.document) {
  Request.requestsCount = 0;
  Request.requests = {};
  if (global.attachEvent) {
    global.attachEvent('onunload', unloadHandler);
  } else if (global.addEventListener) {
    global.addEventListener('beforeunload', unloadHandler, false);
  }
}

function unloadHandler() {
  for (var i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":18,"component-emitter":9,"component-inherit":21,"debug":22,"xmlhttprequest":20}],18:[function(_dereq_,module,exports){
/**
 * Module dependencies.
 */

var Transport = _dereq_('../transport');
var parseqs = _dereq_('parseqs');
var parser = _dereq_('engine.io-parser');
var inherit = _dereq_('component-inherit');
var debug = _dereq_('debug')('engine.io-client:polling');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Is XHR2 supported?
 */

var hasXHR2 = (function() {
  var XMLHttpRequest = _dereq_('xmlhttprequest');
  var xhr = new XMLHttpRequest({ xdomain: false });
  return null != xhr.responseType;
})();

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling(opts){
  var forceBase64 = (opts && opts.forceBase64);
  if (!hasXHR2 || forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function(){
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function(onPause){
  var pending = 0;
  var self = this;

  this.readyState = 'pausing';

  function pause(){
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function(){
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function(){
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function(){
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function(data){
  var self = this;
  debug('polling got data %s', data);
  var callback = function(packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' == self.readyState) {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' == packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  };

  // decode payload
  parser.decodePayload(data, this.socket.binaryType, callback);

  // if an event did not trigger closing
  if ('closed' != this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' == this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function(){
  var self = this;

  function close(){
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' == this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  var callbackfn = function() {
    self.writable = true;
    self.emit('drain');
  };

  var self = this;
  parser.encodePayload(packets, this.supportsBinary, function(data) {
    self.doWrite(data, callbackfn);
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced
  if (false !== this.timestampRequests) {
    query[this.timestampParam] = +new Date + '-' + Transport.timestamps++;
  }

  if (!this.supportsBinary && !query.sid) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // avoid port if default for schema
  if (this.port && (('https' == schema && this.port != 443) ||
     ('http' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  return schema + '://' + this.hostname + port + this.path + query;
};

},{"../transport":14,"component-inherit":21,"debug":22,"engine.io-parser":25,"parseqs":33,"xmlhttprequest":20}],19:[function(_dereq_,module,exports){
/**
 * Module dependencies.
 */

var Transport = _dereq_('../transport');
var parser = _dereq_('engine.io-parser');
var parseqs = _dereq_('parseqs');
var inherit = _dereq_('component-inherit');
var debug = _dereq_('debug')('engine.io-client:websocket');

/**
 * `ws` exposes a WebSocket-compatible interface in
 * Node, or the `WebSocket` or `MozWebSocket` globals
 * in the browser.
 */

var WebSocket = _dereq_('ws');

/**
 * Module exports.
 */

module.exports = WS;

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS(opts){
  var forceBase64 = (opts && opts.forceBase64);
  if (forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/*
 * WebSockets support binary
 */

WS.prototype.supportsBinary = true;

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function(){
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var self = this;
  var uri = this.uri();
  var protocols = void(0);
  var opts = { agent: this.agent };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  this.ws = new WebSocket(uri, protocols, opts);

  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }

  this.ws.binaryType = 'arraybuffer';
  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function(){
  var self = this;

  this.ws.onopen = function(){
    self.onOpen();
  };
  this.ws.onclose = function(){
    self.onClose();
  };
  this.ws.onmessage = function(ev){
    self.onData(ev.data);
  };
  this.ws.onerror = function(e){
    self.onError('websocket error', e);
  };
};

/**
 * Override `onData` to use a timer on iOS.
 * See: https://gist.github.com/mloughran/2052006
 *
 * @api private
 */

if ('undefined' != typeof navigator
  && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
  WS.prototype.onData = function(data){
    var self = this;
    setTimeout(function(){
      Transport.prototype.onData.call(self, data);
    }, 0);
  };
}

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  for (var i = 0, l = packets.length; i < l; i++) {
    parser.encodePacket(packets[i], this.supportsBinary, function(data) {
      //Sometimes the websocket has already been closed but the browser didn't
      //have a chance of informing us about it yet, in that case send will
      //throw an error
      try {
        self.ws.send(data);
      } catch (e){
        debug('websocket closed before onclose event');
      }
    });
  }

  function ondrain() {
    self.writable = true;
    self.emit('drain');
  }
  // fake drain
  // defer to next tick to allow Socket to clear writeBuffer
  setTimeout(ondrain, 0);
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function(){
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function(){
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' == schema && this.port != 443)
    || ('ws' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = +new Date;
  }

  // communicate binary support capabilities
  if (!this.supportsBinary) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  return schema + '://' + this.hostname + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function(){
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};

},{"../transport":14,"component-inherit":21,"debug":22,"engine.io-parser":25,"parseqs":33,"ws":35}],20:[function(_dereq_,module,exports){
// browser shim for xmlhttprequest module
var hasCORS = _dereq_('has-cors');

module.exports = function(opts) {
  var xdomain = opts.xdomain;

  // scheme must be same when usign XDomainRequest
  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
  var xscheme = opts.xscheme;

  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
  // https://github.com/Automattic/engine.io-client/pull/217
  var enablesXDR = opts.enablesXDR;

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' != typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  // Use XDomainRequest for IE8 if enablesXDR is true
  // because loading bar keeps flashing when using jsonp-polling
  // https://github.com/yujiosaka/socke.io-ie8-loading-example
  try {
    if ('undefined' != typeof XDomainRequest && !xscheme && enablesXDR) {
      return new XDomainRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new ActiveXObject('Microsoft.XMLHTTP');
    } catch(e) { }
  }
}

},{"has-cors":38}],21:[function(_dereq_,module,exports){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
},{}],22:[function(_dereq_,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = _dereq_('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (!window.DataAccess && window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  if (!window.DataAccess && typeof console !== 'undefined' && console.log) {
    // This hackery is required for IE8,
    // where the `console.log` function doesn't have 'apply'
    return 'object' == typeof console
        && 'function' == typeof console.log
        && Function.prototype.apply.call(console.log, console, arguments);
  }else{
    return false;
  }
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      localStorage.removeItem('debug');
    } else {
      localStorage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = localStorage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

},{"./debug":23}],23:[function(_dereq_,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = _dereq_('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    if (!window.DataAccess && typeof console !== 'undefined' && console.log) {
      var logFn = enabled.log || exports.log || console.log.bind(console);
      logFn.apply(self, args);
    }
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":24}],24:[function(_dereq_,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 's':
      return n * s;
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],25:[function(_dereq_,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var keys = _dereq_('./keys');
var hasBinary = _dereq_('has-binary');
var sliceBuffer = _dereq_('arraybuffer.slice');
var base64encoder = _dereq_('base64-arraybuffer');
var after = _dereq_('after');
var utf8 = _dereq_('utf8');

/**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */

var isAndroid = navigator.userAgent.match(/Android/i);

/**
 * Check if we are running in PhantomJS.
 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
 * https://github.com/ariya/phantomjs/issues/11395
 * @type boolean
 */
var isPhantomJS = /PhantomJS/i.test(navigator.userAgent);

/**
 * When true, avoids using Blobs to encode payloads.
 * @type boolean
 */
var dontSendBlobs = isAndroid || isPhantomJS;

/**
 * Current protocol version.
 */

exports.protocol = 3;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Create a blob api even for blob builder when vendor prefixes exist
 */

var Blob = _dereq_('blob');

/**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */

exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
  if ('function' == typeof supportsBinary) {
    callback = supportsBinary;
    supportsBinary = false;
  }

  if ('function' == typeof utf8encode) {
    callback = utf8encode;
    utf8encode = null;
  }

  var data = (packet.data === undefined)
    ? undefined
    : packet.data.buffer || packet.data;

  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
    return encodeArrayBuffer(packet, supportsBinary, callback);
  } else if (Blob && data instanceof global.Blob) {
    return encodeBlob(packet, supportsBinary, callback);
  }

  // might be an object with { base64: true, data: dataAsBase64String }
  if (data && data.base64) {
    return encodeBase64Object(packet, callback);
  }

  // Sending data as a utf-8 string
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
  }

  return callback('' + encoded);

};

function encodeBase64Object(packet, callback) {
  // packet data is an object { base64: true, data: dataAsBase64String }
  var message = 'b' + exports.packets[packet.type] + packet.data.data;
  return callback(message);
}

/**
 * Encode packet helpers for binary types
 */

function encodeArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var data = packet.data;
  var contentArray = new Uint8Array(data);
  var resultBuffer = new Uint8Array(1 + data.byteLength);

  resultBuffer[0] = packets[packet.type];
  for (var i = 0; i < contentArray.length; i++) {
    resultBuffer[i+1] = contentArray[i];
  }

  return callback(resultBuffer.buffer);
}

function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var fr = new FileReader();
  fr.onload = function() {
    packet.data = fr.result;
    exports.encodePacket(packet, supportsBinary, true, callback);
  };
  return fr.readAsArrayBuffer(packet.data);
}

function encodeBlob(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  if (dontSendBlobs) {
    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
  }

  var length = new Uint8Array(1);
  length[0] = packets[packet.type];
  var blob = new Blob([length.buffer, packet.data]);

  return callback(blob);
}

/**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */

exports.encodeBase64Packet = function(packet, callback) {
  var message = 'b' + exports.packets[packet.type];
  if (Blob && packet.data instanceof Blob) {
    var fr = new FileReader();
    fr.onload = function() {
      var b64 = fr.result.split(',')[1];
      callback(message + b64);
    };
    return fr.readAsDataURL(packet.data);
  }

  var b64data;
  try {
    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
  } catch (e) {
    // iPhone Safari doesn't let you apply with typed arrays
    var typed = new Uint8Array(packet.data);
    var basic = new Array(typed.length);
    for (var i = 0; i < typed.length; i++) {
      basic[i] = typed[i];
    }
    b64data = String.fromCharCode.apply(null, basic);
  }
  message += global.btoa(b64data);
  return callback(message);
};

/**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data, binaryType, utf8decode) {
  // String data
  if (typeof data == 'string' || data === undefined) {
    if (data.charAt(0) == 'b') {
      return exports.decodeBase64Packet(data.substr(1), binaryType);
    }

    if (utf8decode) {
      try {
        data = utf8.decode(data);
      } catch (e) {
        return err;
      }
    }
    var type = data.charAt(0);

    if (Number(type) != type || !packetslist[type]) {
      return err;
    }

    if (data.length > 1) {
      return { type: packetslist[type], data: data.substring(1) };
    } else {
      return { type: packetslist[type] };
    }
  }

  var asArray = new Uint8Array(data);
  var type = asArray[0];
  var rest = sliceBuffer(data, 1);
  if (Blob && binaryType === 'blob') {
    rest = new Blob([rest]);
  }
  return { type: packetslist[type], data: rest };
};

/**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */

exports.decodeBase64Packet = function(msg, binaryType) {
  var type = packetslist[msg.charAt(0)];
  if (!global.ArrayBuffer) {
    return { type: type, data: { base64: true, data: msg.substr(1) } };
  }

  var data = base64encoder.decode(msg.substr(1));

  if (binaryType === 'blob' && Blob) {
    data = new Blob([data]);
  }

  return { type: type, data: data };
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets, supportsBinary, callback) {
  if (typeof supportsBinary == 'function') {
    callback = supportsBinary;
    supportsBinary = null;
  }

  var isBinary = hasBinary(packets);

  if (supportsBinary && isBinary) {
    if (Blob && !dontSendBlobs) {
      return exports.encodePayloadAsBlob(packets, callback);
    }

    return exports.encodePayloadAsArrayBuffer(packets, callback);
  }

  if (!packets.length) {
    return callback('0:');
  }

  function setLengthHeader(message) {
    return message.length + ':' + message;
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function(message) {
      doneCallback(null, setLengthHeader(message));
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(results.join(''));
  });
};

/**
 * Async array map using after
 */

function map(ary, each, done) {
  var result = new Array(ary.length);
  var next = after(ary.length, done);

  var eachWithIndex = function(i, el, cb) {
    each(el, function(error, msg) {
      result[i] = msg;
      cb(error, result);
    });
  };

  for (var i = 0; i < ary.length; i++) {
    eachWithIndex(i, ary[i], next);
  }
}

/*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, binaryType, callback) {
  if (typeof data != 'string') {
    return exports.decodePayloadAsBinary(data, binaryType, callback);
  }

  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var packet;
  if (data == '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = ''
    , n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (':' != chr) {
      length += chr;
    } else {
      if ('' == length || (length != (n = Number(length)))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg, binaryType, true);

        if (err.type == packet.type && err.data == packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      }

      // advance cursor
      i += n;
      length = '';
    }
  }

  if (length != '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

/**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */

exports.encodePayloadAsArrayBuffer = function(packets, callback) {
  if (!packets.length) {
    return callback(new ArrayBuffer(0));
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(data) {
      return doneCallback(null, data);
    });
  }

  map(packets, encodeOne, function(err, encodedPackets) {
    var totalLength = encodedPackets.reduce(function(acc, p) {
      var len;
      if (typeof p === 'string'){
        len = p.length;
      } else {
        len = p.byteLength;
      }
      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
    }, 0);

    var resultArray = new Uint8Array(totalLength);

    var bufferIndex = 0;
    encodedPackets.forEach(function(p) {
      var isString = typeof p === 'string';
      var ab = p;
      if (isString) {
        var view = new Uint8Array(p.length);
        for (var i = 0; i < p.length; i++) {
          view[i] = p.charCodeAt(i);
        }
        ab = view.buffer;
      }

      if (isString) { // not true binary
        resultArray[bufferIndex++] = 0;
      } else { // true binary
        resultArray[bufferIndex++] = 1;
      }

      var lenStr = ab.byteLength.toString();
      for (var i = 0; i < lenStr.length; i++) {
        resultArray[bufferIndex++] = parseInt(lenStr[i]);
      }
      resultArray[bufferIndex++] = 255;

      var view = new Uint8Array(ab);
      for (var i = 0; i < view.length; i++) {
        resultArray[bufferIndex++] = view[i];
      }
    });

    return callback(resultArray.buffer);
  });
};

/**
 * Encode as Blob
 */

exports.encodePayloadAsBlob = function(packets, callback) {
  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(encoded) {
      var binaryIdentifier = new Uint8Array(1);
      binaryIdentifier[0] = 1;
      if (typeof encoded === 'string') {
        var view = new Uint8Array(encoded.length);
        for (var i = 0; i < encoded.length; i++) {
          view[i] = encoded.charCodeAt(i);
        }
        encoded = view.buffer;
        binaryIdentifier[0] = 0;
      }

      var len = (encoded instanceof ArrayBuffer)
        ? encoded.byteLength
        : encoded.size;

      var lenStr = len.toString();
      var lengthAry = new Uint8Array(lenStr.length + 1);
      for (var i = 0; i < lenStr.length; i++) {
        lengthAry[i] = parseInt(lenStr[i]);
      }
      lengthAry[lenStr.length] = 255;

      if (Blob) {
        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
        doneCallback(null, blob);
      }
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(new Blob(results));
  });
};

/*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */

exports.decodePayloadAsBinary = function (data, binaryType, callback) {
  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var bufferTail = data;
  var buffers = [];

  var numberTooLong = false;
  while (bufferTail.byteLength > 0) {
    var tailArray = new Uint8Array(bufferTail);
    var isString = tailArray[0] === 0;
    var msgLength = '';

    for (var i = 1; ; i++) {
      if (tailArray[i] == 255) break;

      if (msgLength.length > 310) {
        numberTooLong = true;
        break;
      }

      msgLength += tailArray[i];
    }

    if(numberTooLong) return callback(err, 0, 1);

    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
    msgLength = parseInt(msgLength);

    var msg = sliceBuffer(bufferTail, 0, msgLength);
    if (isString) {
      try {
        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
      } catch (e) {
        // iPhone Safari doesn't let you apply to typed arrays
        var typed = new Uint8Array(msg);
        msg = '';
        for (var i = 0; i < typed.length; i++) {
          msg += String.fromCharCode(typed[i]);
        }
      }
    }

    buffers.push(msg);
    bufferTail = sliceBuffer(bufferTail, msgLength);
  }

  var total = buffers.length;
  buffers.forEach(function(buffer, i) {
    callback(exports.decodePacket(buffer, binaryType, true), i, total);
  });
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./keys":26,"after":27,"arraybuffer.slice":28,"base64-arraybuffer":29,"blob":30,"has-binary":36,"utf8":31}],26:[function(_dereq_,module,exports){

/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};

},{}],27:[function(_dereq_,module,exports){
module.exports = after

function after(count, callback, err_cb) {
    var bail = false
    err_cb = err_cb || noop
    proxy.count = count

    return (count === 0) ? callback() : proxy

    function proxy(err, result) {
        if (proxy.count <= 0) {
            throw new Error('after called too many times')
        }
        --proxy.count

        // after first error, rest are passed to err_cb
        if (err) {
            bail = true
            callback(err)
            // future error callbacks will go to error handler
            callback = err_cb
        } else if (proxy.count === 0 && !bail) {
            callback(null, result)
        }
    }
}

function noop() {}

},{}],28:[function(_dereq_,module,exports){
/**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */

module.exports = function(arraybuffer, start, end) {
  var bytes = arraybuffer.byteLength;
  start = start || 0;
  end = end || bytes;

  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

  if (start < 0) { start += bytes; }
  if (end < 0) { end += bytes; }
  if (end > bytes) { end = bytes; }

  if (start >= bytes || start >= end || bytes === 0) {
    return new ArrayBuffer(0);
  }

  var abv = new Uint8Array(arraybuffer);
  var result = new Uint8Array(end - start);
  for (var i = start, ii = 0; i < end; i++, ii++) {
    result[ii] = abv[i];
  }
  return result.buffer;
};

},{}],29:[function(_dereq_,module,exports){
/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(chars){
  "use strict";

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = chars.indexOf(base64[i]);
      encoded2 = chars.indexOf(base64[i+1]);
      encoded3 = chars.indexOf(base64[i+2]);
      encoded4 = chars.indexOf(base64[i+3]);

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");

},{}],30:[function(_dereq_,module,exports){
(function (global){
/**
 * Create a blob builder even when vendor prefixes exist
 */

var BlobBuilder = global.BlobBuilder
  || global.WebKitBlobBuilder
  || global.MSBlobBuilder
  || global.MozBlobBuilder;

/**
 * Check if Blob constructor is supported
 */

var blobSupported = (function() {
  try {
    var b = new Blob(['hi']);
    return b.size == 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if BlobBuilder is supported
 */

var blobBuilderSupported = BlobBuilder
  && BlobBuilder.prototype.append
  && BlobBuilder.prototype.getBlob;

function BlobBuilderConstructor(ary, options) {
  options = options || {};

  var bb = new BlobBuilder();
  for (var i = 0; i < ary.length; i++) {
    bb.append(ary[i]);
  }
  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
};

module.exports = (function() {
  if (blobSupported) {
    return global.Blob;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
})();

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],31:[function(_dereq_,module,exports){
(function (global){
/*! http://mths.be/utf8js v2.0.0 by @mathias */
;(function(root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	// Taken from http://mths.be/punycode
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	// Taken from http://mths.be/punycode
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = '';
		while (++index < length) {
			value = array[index];
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}

	/*--------------------------------------------------------------------------*/

	function createByte(codePoint, shift) {
		return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
	}

	function encodeCodePoint(codePoint) {
		if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
			return stringFromCharCode(codePoint);
		}
		var symbol = '';
		if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
			symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
		}
		else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
			symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
			symbol += createByte(codePoint, 6);
		}
		else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
			symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
		return symbol;
	}

	function utf8encode(string) {
		var codePoints = ucs2decode(string);

		// console.log(JSON.stringify(codePoints.map(function(x) {
		// 	return 'U+' + x.toString(16).toUpperCase();
		// })));

		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = '';
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint);
		}
		return byteString;
	}

	/*--------------------------------------------------------------------------*/

	function readContinuationByte() {
		if (byteIndex >= byteCount) {
			throw Error('Invalid byte index');
		}

		var continuationByte = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		if ((continuationByte & 0xC0) == 0x80) {
			return continuationByte & 0x3F;
		}

		// If we end up here, it’s not a continuation byte
		throw Error('Invalid continuation byte');
	}

	function decodeSymbol() {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;

		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
		}

		if (byteIndex == byteCount) {
			return false;
		}

		// Read first byte
		byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}

		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			var byte2 = readContinuationByte();
			codePoint = ((byte1 & 0x1F) << 6) | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
			if (codePoint >= 0x0800) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
				(byte3 << 0x06) | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}

		throw Error('Invalid UTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;
	function utf8decode(byteString) {
		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol()) !== false) {
			codePoints.push(tmp);
		}
		return ucs2encode(codePoints);
	}

	/*--------------------------------------------------------------------------*/

	var utf8 = {
		'version': '2.0.0',
		'encode': utf8encode,
		'decode': utf8decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return utf8;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = utf8;
		} else { // in Narwhal or RingoJS v0.7.0-
			var object = {};
			var hasOwnProperty = object.hasOwnProperty;
			for (var key in utf8) {
				hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.utf8 = utf8;
	}

}(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],32:[function(_dereq_,module,exports){
(function (global){
/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

var rvalidchars = /^[\],:{}\s]*$/;
var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
var rtrimLeft = /^\s+/;
var rtrimRight = /\s+$/;

module.exports = function parsejson(data) {
  if ('string' != typeof data || !data) {
    return null;
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

  // Attempt to parse using the native JSON parser first
  if (global.JSON && JSON.parse) {
    return JSON.parse(data);
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@')
      .replace(rvalidtokens, ']')
      .replace(rvalidbraces, ''))) {
    return (new Function('return ' + data))();
  }
};
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],33:[function(_dereq_,module,exports){
/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */

exports.encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */

exports.decode = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};

},{}],34:[function(_dereq_,module,exports){
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
    var src = str,
        b = str.indexOf('['),
        e = str.indexOf(']');

    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }

    var m = re.exec(str || ''),
        uri = {},
        i = 14;

    while (i--) {
        uri[parts[i]] = m[i] || '';
    }

    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }

    return uri;
};

},{}],35:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var global = (function() { return this; })();

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

},{}],36:[function(_dereq_,module,exports){
(function (global){

/*
 * Module requirements.
 */

var isArray = _dereq_('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      if (obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (obj.hasOwnProperty(key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"isarray":37}],37:[function(_dereq_,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],38:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var global = _dereq_('global');

/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = 'XMLHttpRequest' in global &&
    'withCredentials' in new global.XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}

},{"global":39}],39:[function(_dereq_,module,exports){

/**
 * Returns `this`. Execute this without a "context" (i.e. without it being
 * attached to an object of the left-hand side), and `this` points to the
 * "global" scope of the current JS execution.
 */

module.exports = (function () { return this; })();

},{}],40:[function(_dereq_,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],41:[function(_dereq_,module,exports){

/**
 * HOP ref.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Return own keys in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.keys = Object.keys || function(obj){
  var keys = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Return own values in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.values = function(obj){
  var vals = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

exports.merge = function(a, b){
  for (var key in b) {
    if (has.call(b, key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Return length of `obj`.
 *
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.length = function(obj){
  return exports.keys(obj).length;
};

/**
 * Check if `obj` is empty.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api public
 */

exports.isEmpty = function(obj){
  return 0 == exports.length(obj);
};
},{}],42:[function(_dereq_,module,exports){
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host'
  , 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
  var m = re.exec(str || '')
    , uri = {}
    , i = 14;

  while (i--) {
    uri[parts[i]] = m[i] || '';
  }

  return uri;
};

},{}],43:[function(_dereq_,module,exports){
(function (global){
/*global Blob,File*/

/**
 * Module requirements
 */

var isArray = _dereq_('isarray');
var isBuf = _dereq_('./is-buffer');

/**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */

exports.deconstructPacket = function(packet){
  var buffers = [];
  var packetData = packet.data;

  function _deconstructPacket(data) {
    if (!data) return data;

    if (isBuf(data)) {
      var placeholder = { _placeholder: true, num: buffers.length };
      buffers.push(data);
      return placeholder;
    } else if (isArray(data)) {
      var newData = new Array(data.length);
      for (var i = 0; i < data.length; i++) {
        newData[i] = _deconstructPacket(data[i]);
      }
      return newData;
    } else if ('object' == typeof data && !(data instanceof Date)) {
      var newData = {};
      for (var key in data) {
        newData[key] = _deconstructPacket(data[key]);
      }
      return newData;
    }
    return data;
  }

  var pack = packet;
  pack.data = _deconstructPacket(packetData);
  pack.attachments = buffers.length; // number of binary 'attachments'
  return {packet: pack, buffers: buffers};
};

/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */

exports.reconstructPacket = function(packet, buffers) {
  var curPlaceHolder = 0;

  function _reconstructPacket(data) {
    if (data && data._placeholder) {
      var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
      return buf;
    } else if (isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        data[i] = _reconstructPacket(data[i]);
      }
      return data;
    } else if (data && 'object' == typeof data) {
      for (var key in data) {
        data[key] = _reconstructPacket(data[key]);
      }
      return data;
    }
    return data;
  }

  packet.data = _reconstructPacket(packet.data);
  packet.attachments = undefined; // no longer useful
  return packet;
};

/**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

exports.removeBlobs = function(data, callback) {
  function _removeBlobs(obj, curKey, containingObject) {
    if (!obj) return obj;

    // convert any blob
    if (global.Blob && obj instanceof Blob)  {
      pendingBlobs++;

      // async filereader
      var fileReader = new FileReader();
      fileReader.onload = function() { // this.result == arraybuffer
        if (containingObject) {
          containingObject[curKey] = this.result;
        }
        else {
          bloblessData = this.result;
        }

        // if nothing pending its callback time
        if(! --pendingBlobs) {
          callback(bloblessData);
        }
      };

      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
    } else if (isArray(obj)) { // handle array
      for (var i = 0; i < obj.length; i++) {
        _removeBlobs(obj[i], i, obj);
      }
    } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
      for (var key in obj) {
        _removeBlobs(obj[key], key, obj);
      }
    }
  }

  var pendingBlobs = 0;
  var bloblessData = data;
  _removeBlobs(bloblessData);
  if (!pendingBlobs) {
    callback(bloblessData);
  }
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./is-buffer":45,"isarray":46}],44:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var debug = _dereq_('debug')('socket.io-parser');
var json = _dereq_('json3');
var isArray = _dereq_('isarray');
var Emitter = _dereq_('component-emitter');
var binary = _dereq_('./binary');
var isBuf = _dereq_('./is-buffer');

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = 4;

/**
 * Packet types.
 *
 * @api public
 */

exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'BINARY_EVENT',
  'ACK',
  'BINARY_ACK',
  'ERROR'
];

/**
 * Packet type `connect`.
 *
 * @api public
 */

exports.CONNECT = 0;

/**
 * Packet type `disconnect`.
 *
 * @api public
 */

exports.DISCONNECT = 1;

/**
 * Packet type `event`.
 *
 * @api public
 */

exports.EVENT = 2;

/**
 * Packet type `ack`.
 *
 * @api public
 */

exports.ACK = 3;

/**
 * Packet type `error`.
 *
 * @api public
 */

exports.ERROR = 4;

/**
 * Packet type 'binary event'
 *
 * @api public
 */

exports.BINARY_EVENT = 5;

/**
 * Packet type `binary ack`. For acks with binary arguments.
 *
 * @api public
 */

exports.BINARY_ACK = 6;

/**
 * Encoder constructor.
 *
 * @api public
 */

exports.Encoder = Encoder;

/**
 * Decoder constructor.
 *
 * @api public
 */

exports.Decoder = Decoder;

/**
 * A socket.io Encoder instance
 *
 * @api public
 */

function Encoder() {}

/**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */

Encoder.prototype.encode = function(obj, callback){
  debug('encoding packet %j', obj);

  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    encodeAsBinary(obj, callback);
  }
  else {
    var encoding = encodeAsString(obj);
    callback([encoding]);
  }
};

/**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */

function encodeAsString(obj) {
  var str = '';
  var nsp = false;

  // first is type
  str += obj.type;

  // attachments if we have them
  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    str += obj.attachments;
    str += '-';
  }

  // if we have a namespace other than `/`
  // we append it followed by a comma `,`
  if (obj.nsp && '/' != obj.nsp) {
    nsp = true;
    str += obj.nsp;
  }

  // immediately followed by the id
  if (null != obj.id) {
    if (nsp) {
      str += ',';
      nsp = false;
    }
    str += obj.id;
  }

  // json data
  if (null != obj.data) {
    if (nsp) str += ',';
    str += json.stringify(obj.data);
  }

  debug('encoded %j as %s', obj, str);
  return str;
}

/**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */

function encodeAsBinary(obj, callback) {

  function writeEncoding(bloblessData) {
    var deconstruction = binary.deconstructPacket(bloblessData);
    var pack = encodeAsString(deconstruction.packet);
    var buffers = deconstruction.buffers;

    buffers.unshift(pack); // add packet info to beginning of data list
    callback(buffers); // write all the buffers
  }

  binary.removeBlobs(obj, writeEncoding);
}

/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */

function Decoder() {
  this.reconstructor = null;
}

/**
 * Mix in `Emitter` with Decoder.
 */

Emitter(Decoder.prototype);

/**
 * Decodes an ecoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */

Decoder.prototype.add = function(obj) {
  var packet;
  if ('string' == typeof obj) {
    packet = decodeString(obj);
    if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
      this.reconstructor = new BinaryReconstructor(packet);

      // no attachments, labeled binary but no binary data to follow
      if (this.reconstructor.reconPack.attachments == 0) {
        this.emit('decoded', packet);
      }
    } else { // non-binary full packet
      this.emit('decoded', packet);
    }
  }
  else if (isBuf(obj) || obj.base64) { // raw binary data
    if (!this.reconstructor) {
      throw new Error('got binary data when not reconstructing a packet');
    } else {
      packet = this.reconstructor.takeBinaryData(obj);
      if (packet) { // received final buffer
        this.reconstructor = null;
        this.emit('decoded', packet);
      }
    }
  }
  else {
    throw new Error('Unknown type: ' + obj);
  }
};

/**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */

function decodeString(str) {
  var p = {};
  var i = 0;

  // look up type
  p.type = Number(str.charAt(0));
  if (null == exports.types[p.type]) return error();

  // look up attachments if type binary
  if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
    p.attachments = '';
    while (str.charAt(++i) != '-') {
      p.attachments += str.charAt(i);
    }
    p.attachments = Number(p.attachments);
  }

  // look up namespace (if any)
  if ('/' == str.charAt(i + 1)) {
    p.nsp = '';
    while (++i) {
      var c = str.charAt(i);
      if (',' == c) break;
      p.nsp += c;
      if (i + 1 == str.length) break;
    }
  } else {
    p.nsp = '/';
  }

  // look up id
  var next = str.charAt(i + 1);
  if ('' != next && Number(next) == next) {
    p.id = '';
    while (++i) {
      var c = str.charAt(i);
      if (null == c || Number(c) != c) {
        --i;
        break;
      }
      p.id += str.charAt(i);
      if (i + 1 == str.length) break;
    }
    p.id = Number(p.id);
  }

  // look up json data
  if (str.charAt(++i)) {
    try {
      p.data = json.parse(str.substr(i));
    } catch(e){
      return error();
    }
  }

  debug('decoded %s as %j', str, p);
  return p;
}

/**
 * Deallocates a parser's resources
 *
 * @api public
 */

Decoder.prototype.destroy = function() {
  if (this.reconstructor) {
    this.reconstructor.finishedReconstruction();
  }
};

/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */

function BinaryReconstructor(packet) {
  this.reconPack = packet;
  this.buffers = [];
}

/**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */

BinaryReconstructor.prototype.takeBinaryData = function(binData) {
  this.buffers.push(binData);
  if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
    this.finishedReconstruction();
    return packet;
  }
  return null;
};

/**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */

BinaryReconstructor.prototype.finishedReconstruction = function() {
  this.reconPack = null;
  this.buffers = [];
};

function error(data){
  return {
    type: exports.ERROR,
    data: 'parser error'
  };
}

},{"./binary":43,"./is-buffer":45,"component-emitter":9,"debug":10,"isarray":46,"json3":47}],45:[function(_dereq_,module,exports){
(function (global){

module.exports = isBuf;

/**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */

function isBuf(obj) {
  return (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],46:[function(_dereq_,module,exports){
module.exports=_dereq_(37)
},{}],47:[function(_dereq_,module,exports){
/*! JSON v3.2.6 | http://bestiejs.github.io/json3 | Copyright 2012-2013, Kit Cambridge | http://kit.mit-license.org */
;(function (window) {
  // Convenience aliases.
  var getClass = {}.toString, isProperty, forEach, undef;

  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // Detect native implementations.
  var nativeJSON = typeof JSON == "object" && JSON;

  // Set up the JSON 3 namespace, preferring the CommonJS `exports` object if
  // available.
  var JSON3 = typeof exports == "object" && exports && !exports.nodeType && exports;

  if (JSON3 && nativeJSON) {
    // Explicitly delegate to the native `stringify` and `parse`
    // implementations in CommonJS environments.
    JSON3.stringify = nativeJSON.stringify;
    JSON3.parse = nativeJSON.parse;
  } else {
    // Export for web browsers, JavaScript engines, and asynchronous module
    // loaders, using the global `JSON` object if available.
    JSON3 = window.JSON = nativeJSON || {};
  }

  // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
  var isExtended = new Date(-3509827334573292);
  try {
    // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
    // results for certain dates in Opera >= 10.53.
    isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
      // Safari < 2.0.2 stores the internal millisecond time value correctly,
      // but clips the values returned by the date methods to the range of
      // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
      isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
  } catch (exception) {}

  // Internal: Determines whether the native `JSON.stringify` and `parse`
  // implementations are spec-compliant. Based on work by Ken Snyder.
  function has(name) {
    if (has[name] !== undef) {
      // Return cached feature test result.
      return has[name];
    }

    var isSupported;
    if (name == "bug-string-char-index") {
      // IE <= 7 doesn't support accessing string characters using square
      // bracket notation. IE 8 only supports this for primitives.
      isSupported = "a"[0] != "a";
    } else if (name == "json") {
      // Indicates whether both `JSON.stringify` and `JSON.parse` are
      // supported.
      isSupported = has("json-stringify") && has("json-parse");
    } else {
      var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
      // Test `JSON.stringify`.
      if (name == "json-stringify") {
        var stringify = JSON3.stringify, stringifySupported = typeof stringify == "function" && isExtended;
        if (stringifySupported) {
          // A test function object with a custom `toJSON` method.
          (value = function () {
            return 1;
          }).toJSON = value;
          try {
            stringifySupported =
              // Firefox 3.1b1 and b2 serialize string, number, and boolean
              // primitives as object literals.
              stringify(0) === "0" &&
              // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
              // literals.
              stringify(new Number()) === "0" &&
              stringify(new String()) == '""' &&
              // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
              // does not define a canonical JSON representation (this applies to
              // objects with `toJSON` properties as well, *unless* they are nested
              // within an object or array).
              stringify(getClass) === undef &&
              // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
              // FF 3.1b3 pass this test.
              stringify(undef) === undef &&
              // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
              // respectively, if the value is omitted entirely.
              stringify() === undef &&
              // FF 3.1b1, 2 throw an error if the given value is not a number,
              // string, array, object, Boolean, or `null` literal. This applies to
              // objects with custom `toJSON` methods as well, unless they are nested
              // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
              // methods entirely.
              stringify(value) === "1" &&
              stringify([value]) == "[1]" &&
              // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
              // `"[null]"`.
              stringify([undef]) == "[null]" &&
              // YUI 3.0.0b1 fails to serialize `null` literals.
              stringify(null) == "null" &&
              // FF 3.1b1, 2 halts serialization if an array contains a function:
              // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
              // elides non-JSON values from objects and arrays, unless they
              // define custom `toJSON` methods.
              stringify([undef, getClass, null]) == "[null,null,null]" &&
              // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
              // where character escape codes are expected (e.g., `\b` => `\u0008`).
              stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
              // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
              stringify(null, value) === "1" &&
              stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
              // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
              // serialize extended years.
              stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
              // The milliseconds are optional in ES 5, but required in 5.1.
              stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
              // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
              // four-digit years instead of six-digit years. Credits: @Yaffle.
              stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
              // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
              // values less than 1000. Credits: @Yaffle.
              stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
          } catch (exception) {
            stringifySupported = false;
          }
        }
        isSupported = stringifySupported;
      }
      // Test `JSON.parse`.
      if (name == "json-parse") {
        var parse = JSON3.parse;
        if (typeof parse == "function") {
          try {
            // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
            // Conforming implementations should also coerce the initial argument to
            // a string prior to parsing.
            if (parse("0") === 0 && !parse(false)) {
              // Simple parsing test.
              value = parse(serialized);
              var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
              if (parseSupported) {
                try {
                  // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                  parseSupported = !parse('"\t"');
                } catch (exception) {}
                if (parseSupported) {
                  try {
                    // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                    // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                    // certain octal literals.
                    parseSupported = parse("01") !== 1;
                  } catch (exception) {}
                }
                if (parseSupported) {
                  try {
                    // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                    // points. These environments, along with FF 3.1b1 and 2,
                    // also allow trailing commas in JSON objects and arrays.
                    parseSupported = parse("1.") !== 1;
                  } catch (exception) {}
                }
              }
            }
          } catch (exception) {
            parseSupported = false;
          }
        }
        isSupported = parseSupported;
      }
    }
    return has[name] = !!isSupported;
  }

  if (!has("json")) {
    // Common `[[Class]]` name aliases.
    var functionClass = "[object Function]";
    var dateClass = "[object Date]";
    var numberClass = "[object Number]";
    var stringClass = "[object String]";
    var arrayClass = "[object Array]";
    var booleanClass = "[object Boolean]";

    // Detect incomplete support for accessing string characters by index.
    var charIndexBuggy = has("bug-string-char-index");

    // Define additional utility methods if the `Date` methods are buggy.
    if (!isExtended) {
      var floor = Math.floor;
      // A mapping between the months of the year and the number of days between
      // January 1st and the first of the respective month.
      var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      // Internal: Calculates the number of days between the Unix epoch and the
      // first day of the given month.
      var getDay = function (year, month) {
        return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
      };
    }

    // Internal: Determines if a property is a direct property of the given
    // object. Delegates to the native `Object#hasOwnProperty` method.
    if (!(isProperty = {}.hasOwnProperty)) {
      isProperty = function (property) {
        var members = {}, constructor;
        if ((members.__proto__ = null, members.__proto__ = {
          // The *proto* property cannot be set multiple times in recent
          // versions of Firefox and SeaMonkey.
          "toString": 1
        }, members).toString != getClass) {
          // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
          // supports the mutable *proto* property.
          isProperty = function (property) {
            // Capture and break the object's prototype chain (see section 8.6.2
            // of the ES 5.1 spec). The parenthesized expression prevents an
            // unsafe transformation by the Closure Compiler.
            var original = this.__proto__, result = property in (this.__proto__ = null, this);
            // Restore the original prototype chain.
            this.__proto__ = original;
            return result;
          };
        } else {
          // Capture a reference to the top-level `Object` constructor.
          constructor = members.constructor;
          // Use the `constructor` property to simulate `Object#hasOwnProperty` in
          // other environments.
          isProperty = function (property) {
            var parent = (this.constructor || constructor).prototype;
            return property in this && !(property in parent && this[property] === parent[property]);
          };
        }
        members = null;
        return isProperty.call(this, property);
      };
    }

    // Internal: A set of primitive types used by `isHostType`.
    var PrimitiveTypes = {
      'boolean': 1,
      'number': 1,
      'string': 1,
      'undefined': 1
    };

    // Internal: Determines if the given object `property` value is a
    // non-primitive.
    var isHostType = function (object, property) {
      var type = typeof object[property];
      return type == 'object' ? !!object[property] : !PrimitiveTypes[type];
    };

    // Internal: Normalizes the `for...in` iteration algorithm across
    // environments. Each enumerated key is yielded to a `callback` function.
    forEach = function (object, callback) {
      var size = 0, Properties, members, property;

      // Tests for bugs in the current environment's `for...in` algorithm. The
      // `valueOf` property inherits the non-enumerable flag from
      // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
      (Properties = function () {
        this.valueOf = 0;
      }).prototype.valueOf = 0;

      // Iterate over a new instance of the `Properties` class.
      members = new Properties();
      for (property in members) {
        // Ignore all properties inherited from `Object.prototype`.
        if (isProperty.call(members, property)) {
          size++;
        }
      }
      Properties = members = null;

      // Normalize the iteration algorithm.
      if (!size) {
        // A list of non-enumerable properties inherited from `Object.prototype`.
        members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
        // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
        // properties.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == functionClass, property, length;
          var hasProperty = !isFunction && typeof object.constructor != 'function' && isHostType(object, 'hasOwnProperty') ? object.hasOwnProperty : isProperty;
          for (property in object) {
            // Gecko <= 1.0 enumerates the `prototype` property of functions under
            // certain conditions; IE does not.
            if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
              callback(property);
            }
          }
          // Manually invoke the callback for each non-enumerable property.
          for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
        };
      } else if (size == 2) {
        // Safari <= 2.0.4 enumerates shadowed properties twice.
        forEach = function (object, callback) {
          // Create a set of iterated properties.
          var members = {}, isFunction = getClass.call(object) == functionClass, property;
          for (property in object) {
            // Store each property name to prevent double enumeration. The
            // `prototype` property of functions is not enumerated due to cross-
            // environment inconsistencies.
            if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
              callback(property);
            }
          }
        };
      } else {
        // No bugs detected; use the standard `for...in` algorithm.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == functionClass, property, isConstructor;
          for (property in object) {
            if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
              callback(property);
            }
          }
          // Manually invoke the callback for the `constructor` property due to
          // cross-environment inconsistencies.
          if (isConstructor || isProperty.call(object, (property = "constructor"))) {
            callback(property);
          }
        };
      }
      return forEach(object, callback);
    };

    // Public: Serializes a JavaScript `value` as a JSON string. The optional
    // `filter` argument may specify either a function that alters how object and
    // array members are serialized, or an array of strings and numbers that
    // indicates which properties should be serialized. The optional `width`
    // argument may be either a string or number that specifies the indentation
    // level of the output.
    if (!has("json-stringify")) {
      // Internal: A map of control characters and their escaped equivalents.
      var Escapes = {
        92: "\\\\",
        34: '\\"',
        8: "\\b",
        12: "\\f",
        10: "\\n",
        13: "\\r",
        9: "\\t"
      };

      // Internal: Converts `value` into a zero-padded string such that its
      // length is at least equal to `width`. The `width` must be <= 6.
      var leadingZeroes = "000000";
      var toPaddedString = function (width, value) {
        // The `|| 0` expression is necessary to work around a bug in
        // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
        return (leadingZeroes + (value || 0)).slice(-width);
      };

      // Internal: Double-quotes a string `value`, replacing all ASCII control
      // characters (characters with code unit values between 0 and 31) with
      // their escaped equivalents. This is an implementation of the
      // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
      var unicodePrefix = "\\u00";
      var quote = function (value) {
        var result = '"', index = 0, length = value.length, isLarge = length > 10 && charIndexBuggy, symbols;
        if (isLarge) {
          symbols = value.split("");
        }
        for (; index < length; index++) {
          var charCode = value.charCodeAt(index);
          // If the character is a control character, append its Unicode or
          // shorthand escape sequence; otherwise, append the character as-is.
          switch (charCode) {
            case 8: case 9: case 10: case 12: case 13: case 34: case 92:
              result += Escapes[charCode];
              break;
            default:
              if (charCode < 32) {
                result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                break;
              }
              result += isLarge ? symbols[index] : charIndexBuggy ? value.charAt(index) : value[index];
          }
        }
        return result + '"';
      };

      // Internal: Recursively serializes an object. Implements the
      // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
      var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
        var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
        try {
          // Necessary for host object support.
          value = object[property];
        } catch (exception) {}
        if (typeof value == "object" && value) {
          className = getClass.call(value);
          if (className == dateClass && !isProperty.call(value, "toJSON")) {
            if (value > -1 / 0 && value < 1 / 0) {
              // Dates are serialized according to the `Date#toJSON` method
              // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
              // for the ISO 8601 date time string format.
              if (getDay) {
                // Manually compute the year, month, date, hours, minutes,
                // seconds, and milliseconds if the `getUTC*` methods are
                // buggy. Adapted from @Yaffle's `date-shim` project.
                date = floor(value / 864e5);
                for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                date = 1 + date - getDay(year, month);
                // The `time` value specifies the time within the day (see ES
                // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                // to compute `A modulo B`, as the `%` operator does not
                // correspond to the `modulo` operation for negative numbers.
                time = (value % 864e5 + 864e5) % 864e5;
                // The hours, minutes, seconds, and milliseconds are obtained by
                // decomposing the time within the day. See section 15.9.1.10.
                hours = floor(time / 36e5) % 24;
                minutes = floor(time / 6e4) % 60;
                seconds = floor(time / 1e3) % 60;
                milliseconds = time % 1e3;
              } else {
                year = value.getUTCFullYear();
                month = value.getUTCMonth();
                date = value.getUTCDate();
                hours = value.getUTCHours();
                minutes = value.getUTCMinutes();
                seconds = value.getUTCSeconds();
                milliseconds = value.getUTCMilliseconds();
              }
              // Serialize extended years correctly.
              value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                // Months, dates, hours, minutes, and seconds should have two
                // digits; milliseconds should have three.
                "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                // Milliseconds are optional in ES 5.0, but required in 5.1.
                "." + toPaddedString(3, milliseconds) + "Z";
            } else {
              value = null;
            }
          } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
            // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
            // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
            // ignores all `toJSON` methods on these objects unless they are
            // defined directly on an instance.
            value = value.toJSON(property);
          }
        }
        if (callback) {
          // If a replacement function was provided, call it to obtain the value
          // for serialization.
          value = callback.call(object, property, value);
        }
        if (value === null) {
          return "null";
        }
        className = getClass.call(value);
        if (className == booleanClass) {
          // Booleans are represented literally.
          return "" + value;
        } else if (className == numberClass) {
          // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
          // `"null"`.
          return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
        } else if (className == stringClass) {
          // Strings are double-quoted and escaped.
          return quote("" + value);
        }
        // Recursively serialize objects and arrays.
        if (typeof value == "object") {
          // Check for cyclic structures. This is a linear search; performance
          // is inversely proportional to the number of unique nested objects.
          for (length = stack.length; length--;) {
            if (stack[length] === value) {
              // Cyclic structures cannot be serialized by `JSON.stringify`.
              throw TypeError();
            }
          }
          // Add the object to the stack of traversed objects.
          stack.push(value);
          results = [];
          // Save the current indentation level and indent one additional level.
          prefix = indentation;
          indentation += whitespace;
          if (className == arrayClass) {
            // Recursively serialize array elements.
            for (index = 0, length = value.length; index < length; index++) {
              element = serialize(index, value, callback, properties, whitespace, indentation, stack);
              results.push(element === undef ? "null" : element);
            }
            result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
          } else {
            // Recursively serialize object members. Members are selected from
            // either a user-specified list of property names, or the object
            // itself.
            forEach(properties || value, function (property) {
              var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
              if (element !== undef) {
                // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                // is not the empty string, let `member` {quote(property) + ":"}
                // be the concatenation of `member` and the `space` character."
                // The "`space` character" refers to the literal space
                // character, not the `space` {width} argument provided to
                // `JSON.stringify`.
                results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
              }
            });
            result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
          }
          // Remove the object from the traversed object stack.
          stack.pop();
          return result;
        }
      };

      // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
      JSON3.stringify = function (source, filter, width) {
        var whitespace, callback, properties, className;
        if (typeof filter == "function" || typeof filter == "object" && filter) {
          if ((className = getClass.call(filter)) == functionClass) {
            callback = filter;
          } else if (className == arrayClass) {
            // Convert the property names array into a makeshift set.
            properties = {};
            for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
          }
        }
        if (width) {
          if ((className = getClass.call(width)) == numberClass) {
            // Convert the `width` to an integer and create a string containing
            // `width` number of space characters.
            if ((width -= width % 1) > 0) {
              for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
            }
          } else if (className == stringClass) {
            whitespace = width.length <= 10 ? width : width.slice(0, 10);
          }
        }
        // Opera <= 7.54u2 discards the values associated with empty string keys
        // (`""`) only if they are used directly within an object member list
        // (e.g., `!("" in { "": 1})`).
        return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
      };
    }

    // Public: Parses a JSON source string.
    if (!has("json-parse")) {
      var fromCharCode = String.fromCharCode;

      // Internal: A map of escaped control characters and their unescaped
      // equivalents.
      var Unescapes = {
        92: "\\",
        34: '"',
        47: "/",
        98: "\b",
        116: "\t",
        110: "\n",
        102: "\f",
        114: "\r"
      };

      // Internal: Stores the parser state.
      var Index, Source;

      // Internal: Resets the parser state and throws a `SyntaxError`.
      var abort = function() {
        Index = Source = null;
        throw SyntaxError();
      };

      // Internal: Returns the next token, or `"$"` if the parser has reached
      // the end of the source string. A token may be a string, number, `null`
      // literal, or Boolean literal.
      var lex = function () {
        var source = Source, length = source.length, value, begin, position, isSigned, charCode;
        while (Index < length) {
          charCode = source.charCodeAt(Index);
          switch (charCode) {
            case 9: case 10: case 13: case 32:
              // Skip whitespace tokens, including tabs, carriage returns, line
              // feeds, and space characters.
              Index++;
              break;
            case 123: case 125: case 91: case 93: case 58: case 44:
              // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
              // the current position.
              value = charIndexBuggy ? source.charAt(Index) : source[Index];
              Index++;
              return value;
            case 34:
              // `"` delimits a JSON string; advance to the next character and
              // begin parsing the string. String tokens are prefixed with the
              // sentinel `@` character to distinguish them from punctuators and
              // end-of-string tokens.
              for (value = "@", Index++; Index < length;) {
                charCode = source.charCodeAt(Index);
                if (charCode < 32) {
                  // Unescaped ASCII control characters (those with a code unit
                  // less than the space character) are not permitted.
                  abort();
                } else if (charCode == 92) {
                  // A reverse solidus (`\`) marks the beginning of an escaped
                  // control character (including `"`, `\`, and `/`) or Unicode
                  // escape sequence.
                  charCode = source.charCodeAt(++Index);
                  switch (charCode) {
                    case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                      // Revive escaped control characters.
                      value += Unescapes[charCode];
                      Index++;
                      break;
                    case 117:
                      // `\u` marks the beginning of a Unicode escape sequence.
                      // Advance to the first character and validate the
                      // four-digit code point.
                      begin = ++Index;
                      for (position = Index + 4; Index < position; Index++) {
                        charCode = source.charCodeAt(Index);
                        // A valid sequence comprises four hexdigits (case-
                        // insensitive) that form a single hexadecimal value.
                        if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                          // Invalid Unicode escape sequence.
                          abort();
                        }
                      }
                      // Revive the escaped character.
                      value += fromCharCode("0x" + source.slice(begin, Index));
                      break;
                    default:
                      // Invalid escape sequence.
                      abort();
                  }
                } else {
                  if (charCode == 34) {
                    // An unescaped double-quote character marks the end of the
                    // string.
                    break;
                  }
                  charCode = source.charCodeAt(Index);
                  begin = Index;
                  // Optimize for the common case where a string is valid.
                  while (charCode >= 32 && charCode != 92 && charCode != 34) {
                    charCode = source.charCodeAt(++Index);
                  }
                  // Append the string as-is.
                  value += source.slice(begin, Index);
                }
              }
              if (source.charCodeAt(Index) == 34) {
                // Advance to the next character and return the revived string.
                Index++;
                return value;
              }
              // Unterminated string.
              abort();
            default:
              // Parse numbers and literals.
              begin = Index;
              // Advance past the negative sign, if one is specified.
              if (charCode == 45) {
                isSigned = true;
                charCode = source.charCodeAt(++Index);
              }
              // Parse an integer or floating-point value.
              if (charCode >= 48 && charCode <= 57) {
                // Leading zeroes are interpreted as octal literals.
                if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                  // Illegal octal literal.
                  abort();
                }
                isSigned = false;
                // Parse the integer component.
                for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                // Floats cannot contain a leading decimal point; however, this
                // case is already accounted for by the parser.
                if (source.charCodeAt(Index) == 46) {
                  position = ++Index;
                  // Parse the decimal component.
                  for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                  if (position == Index) {
                    // Illegal trailing decimal.
                    abort();
                  }
                  Index = position;
                }
                // Parse exponents. The `e` denoting the exponent is
                // case-insensitive.
                charCode = source.charCodeAt(Index);
                if (charCode == 101 || charCode == 69) {
                  charCode = source.charCodeAt(++Index);
                  // Skip past the sign following the exponent, if one is
                  // specified.
                  if (charCode == 43 || charCode == 45) {
                    Index++;
                  }
                  // Parse the exponential component.
                  for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                  if (position == Index) {
                    // Illegal empty exponent.
                    abort();
                  }
                  Index = position;
                }
                // Coerce the parsed value to a JavaScript number.
                return +source.slice(begin, Index);
              }
              // A negative sign may only precede numbers.
              if (isSigned) {
                abort();
              }
              // `true`, `false`, and `null` literals.
              if (source.slice(Index, Index + 4) == "true") {
                Index += 4;
                return true;
              } else if (source.slice(Index, Index + 5) == "false") {
                Index += 5;
                return false;
              } else if (source.slice(Index, Index + 4) == "null") {
                Index += 4;
                return null;
              }
              // Unrecognized token.
              abort();
          }
        }
        // Return the sentinel `$` character if the parser has reached the end
        // of the source string.
        return "$";
      };

      // Internal: Parses a JSON `value` token.
      var get = function (value) {
        var results, hasMembers;
        if (value == "$") {
          // Unexpected end of input.
          abort();
        }
        if (typeof value == "string") {
          if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
            // Remove the sentinel `@` character.
            return value.slice(1);
          }
          // Parse object and array literals.
          if (value == "[") {
            // Parses a JSON array, returning a new JavaScript array.
            results = [];
            for (;; hasMembers || (hasMembers = true)) {
              value = lex();
              // A closing square bracket marks the end of the array literal.
              if (value == "]") {
                break;
              }
              // If the array literal contains elements, the current token
              // should be a comma separating the previous element from the
              // next.
              if (hasMembers) {
                if (value == ",") {
                  value = lex();
                  if (value == "]") {
                    // Unexpected trailing `,` in array literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each array element.
                  abort();
                }
              }
              // Elisions and leading commas are not permitted.
              if (value == ",") {
                abort();
              }
              results.push(get(value));
            }
            return results;
          } else if (value == "{") {
            // Parses a JSON object, returning a new JavaScript object.
            results = {};
            for (;; hasMembers || (hasMembers = true)) {
              value = lex();
              // A closing curly brace marks the end of the object literal.
              if (value == "}") {
                break;
              }
              // If the object literal contains members, the current token
              // should be a comma separator.
              if (hasMembers) {
                if (value == ",") {
                  value = lex();
                  if (value == "}") {
                    // Unexpected trailing `,` in object literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each object member.
                  abort();
                }
              }
              // Leading commas are not permitted, object property names must be
              // double-quoted strings, and a `:` must separate each property
              // name and value.
              if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                abort();
              }
              results[value.slice(1)] = get(lex());
            }
            return results;
          }
          // Unexpected token encountered.
          abort();
        }
        return value;
      };

      // Internal: Updates a traversed object member.
      var update = function(source, property, callback) {
        var element = walk(source, property, callback);
        if (element === undef) {
          delete source[property];
        } else {
          source[property] = element;
        }
      };

      // Internal: Recursively traverses a parsed JSON object, invoking the
      // `callback` function for each value. This is an implementation of the
      // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
      var walk = function (source, property, callback) {
        var value = source[property], length;
        if (typeof value == "object" && value) {
          // `forEach` can't be used to traverse an array in Opera <= 8.54
          // because its `Object#hasOwnProperty` implementation returns `false`
          // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
          if (getClass.call(value) == arrayClass) {
            for (length = value.length; length--;) {
              update(value, length, callback);
            }
          } else {
            forEach(value, function (property) {
              update(value, property, callback);
            });
          }
        }
        return callback.call(source, property, value);
      };

      // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
      JSON3.parse = function (source, callback) {
        var result, value;
        Index = 0;
        Source = "" + source;
        result = get(lex());
        // If a JSON string contains multiple tokens, it is invalid.
        if (lex() != "$") {
          abort();
        }
        // Reset the parser state.
        Index = Source = null;
        return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
      };
    }
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}(this));

},{}],48:[function(_dereq_,module,exports){
module.exports = toArray

function toArray(list, index) {
    var array = []

    index = index || 0

    for (var i = index || 0; i < list.length; i++) {
        array[i - index] = list[i]
    }

    return array
}

},{}]},{},[1])
(1)
});


;
(function ($, TVUI, global) {

    var ETV = {
            version: '1.0.0'
        },
        CA = {
            GZ: [1, 999], //广州
            SZ: [1000, 1199],//深圳
            ZH: [1200, 1399], //珠海
            ST: [1400, 1599],//汕头
            FS: [1600, 2099], //佛山
            SG: [2200, 2399],//韶关
            ZJ: [2400, 2599],//湛江
            ZQ: [2600, 2799],//肇庆
            JM: [2800, 2999],//江门
            MM: [3000, 3199],//茂名
            HZ: [3200, 3399],//惠州
            MZ: [3400, 3599],//梅州
            SW: [3600, 3799],// 汕尾
            HY: [3800, 3999],//河源
            YJ: [4000, 4199],//阳江
            QY: [4200, 4399],//清远
            DG: [4400, 5399],//东莞
            ZS: [5400, 6399],//中山
            CZ: [6400, 6599],//潮州
            JY: [6600, 6799],//揭阳
            YF: [6800, 6999]//云浮
        },
    //app加载器缓存
        _AppLoaders = {};

    ETV.CA = CA;

    ETV.client = new Date().getTime();

    //配置信息
    ETV.__config = {
        //WebsSocket服务器地址
        socket: 'http://172.16.1.55:8011/',

        //apps目录地址
        apps: 'http://172.16.1.10/APPS/',

        //socket.io 地址,可以不配置已经合并在文件etv.engine.min.js
        socketIO: 'http://172.16.1.10/APPS/engine/js/socket.io/socket.io.min.js',

        //app启动js地址
        loader: 'http://172.16.1.10/APPS/engine/js/loader.min.js',

        seajs: 'http://172.16.1.10/APPS/engine/js/sea.js',

        //缺省的icNo
        icNo: '8002002601164723',

        areaCode: '',

        activeClassName: 'etv-app-active',

        //消息常量
        message: {
            INSTALL: {type: 1, msg: 'installed'},
            SHOW: {type: 2, msg: 'showed'},
            HIDE: {type: 3, msg: 'hided'},
            DESTROY: {type: 4, msg: 'destroyed'},
            UNINSTALL: {type: 5, msg: 'uninstalled'},
            UPDATE: {type: 6, msg: 'updated'}
        },
        playState: {
            INIT: 0, //播放器等待播放
            PLAYING: 1, //播放中
            PAUSE: 2, //暂停
            STOP: 3,//停止
            FF: 4,//快进
            FR: 5, //快退
            VOLUME: 6
        }
    };

    /**
     * 修改配置函数
     * @param options
     */
    ETV.config = function (options) {
        $.extend(ETV.__config, options || {});
    };

    /**
     * 引擎对象类
     * @type {{init: init, tasks: tasks, connectSocket: connectSocket, sendStatus: sendStatus, sendMessage: sendMessage, setStatus: setStatus, getStatus: getStatus, setPlayState: setPlayState, setChannelId: setChannelId, setAssetId: setAssetId, setPoint: setPoint, getLoader: getLoader, findLoader: findLoader, getLoaders: getLoaders}}
     */
    ETV.Engine = {
        /**
         * 初始化引擎
         * @param status {icNo, account, areaCode, pageId, columnId, channelId, assetId} 可选
         */
        init: function (status) {
            /**
             * 终端和应用状态 {icNo, areaCode, pageId, columnId, channelId, assetId} 可选
             */
            this.status = $.extend({
                icNo: TVUI.API.CA.icNo || ETV.__config.icNo,
                areaCode: TVUI.API.DataAccess.info('VodApp', 'QAMName1') || ETV.__config.areaCode,
                pageId: '',
                columnId: '',
                channelId: '',
                assetId: ''
            }, status || {});

            var key = 'webSocketServers';

            var servers = TVUI.API.SysSetting.envJSON(key);

            if (servers) {
                this.randomServers(servers, function (server) {
                    ETV.__config.socket = server;
                    ETV.Engine.connectSocket();
                });
            } else {
                this.JSONP(ETV.__config.socket + 'servers', 'servers', function (servers) {
                    if (servers) {
                        TVUI.API.SysSetting.envJSON(key, servers);
                        ETV.Engine.randomServers(servers, function (server) {
                            ETV.__config.socket = server;
                            ETV.Engine.connectSocket();
                        });
                    }
                });
            }


        },

        randomServers: function (servers, callback) {

            (function () {
                var _self = arguments.callee;
                var server = 'http://' + servers[parseInt(Math.random() * servers.length)] + '/';
                ETV.Engine.JSONP(server + 'check', 'check', function (ok) {
                    if (ok) {
                        callback(server);
                    } else {
                        _self();
                    }
                }, function (e) {
                    _self();
                });

            })();


        },

        JSONP: function (src, name, callback, error, timeout) {
            timeout = timeout || 5000;

            var head = document.getElementsByTagName('head')[0],
                script = document.createElement('script'),
                isCallback = false;

            window['__callback__' + name] = function (msg) {
                try {
                    callback && callback(msg);
                } catch (e) {
                    error && error(e);
                }
                delete window['__callback__' + name];
                head.removeChild(script);
            };

            var timerId = setTimeout(function () {
                isCallback = true;
                clearTimeout(timerId);
                head.removeChild(script);
                error && error('timeout');
            }, timeout);

            script.onload = function () {
                if (!isCallback) {
                    isCallback = true;
                    clearTimeout(timerId);
                }
            };
            script.src = src;
            head.appendChild(script);

        },
        /**
         * 连接WebSocket和侦听服务器指令
         */
        connectSocket: function () {
            var _this = this;
            var handler = function (io) {
                var socket = ETV.Engine.socket = io.connect(ETV.__config.socket);
                socket.on('install', function (app, mapping) {
                    _this.fire('install', app, mapping);
                });
                socket.on('show', function (app, mapping) {
                    _this.fire('show', app, mapping);
                });
                socket.on('hide', function (appId, mapping) {
                    _this.fire('hide', appId, mapping);
                });
                socket.on('destroy', function (appId, mapping) {
                    _this.fire('destroy', appId, mapping);
                });
                socket.on('uninstall', function (appId, mapping) {
                    _this.fire('uninstall', appId, mapping);
                });
                socket.on('update', function (appId, mapping) {
                    _this.fire('update', appId, mapping);
                });

                //如果成功连接，即发送终端状态
                socket.on('connect', function () {
                    _this.fire('socketConnect');
                    _this.sendStatus();
                });

                //触发app引擎准备就绪事件
                _this.fire('ready');

            };

            //如果状态发送变化，发送状态到服务器
            this.on('change', function () {
                _this.sendStatus();
            });

            //如果页面已经加载了socket.io,不需要重复加载，马上连接WebSocket
            if (window.io) {
                handler(io);
            } else {
                $.getScript(ETV.__config.socketIO, function () {
                    handler(io);
                });
            }
        },
        /**
         * 向服务器发送状态
         */
        sendStatus: function () {
            this.socket.emit('status', this.status);
        },
        /**
         * 向服务器发送消息
         * @param message
         */
        sendMessage: function (message) {
            this.socket.emit('message', message);
        },
        /**
         * 设置状态
         * @param status
         */
        setStatus: function (status) {
            this.status = $.extend(this.status, status || {});
            this.fire('change', this.status);
        },

        /**
         * 获取状态
         * @returns {*}
         */
        getStatus: function () {
            return this.status;
        },

        /**
         * 设置播放器播放状态
         * @param state
         */
        setPlayState: function (state) {
            if (this.playState !== state) {
                this.playState = state;
                this.fire('playState', this.playState);
            }
        },
        /**
         * 设置状态的频道id
         * @param id
         */
        setChannelId: function (id) {
            if (this.status.channelId !== id) {
                this.status.channelId = id;
                this.fire('change', this.status);
            }
        },
        /**
         * 设置状态的媒资id
         * @param id
         */
        setAssetId: function (id) {
            if (this.status.assetId !== id) {
                this.status.assetId = id;
                this.fire('change', this.status);
            }
        },
        /**
         * 设置状态媒资的播放时间点
         * @param point
         */
        setPoint: function (point) {
            if (this.currentPoint !== point) {
                this.currentPoint = point;
                this.fire('point', this.currentPoint);
            }
        },

        /**
         * 获取app加载器，如果不存在即创建
         * @param app
         * @returns {*|ETV.Loader}
         */
        getLoader: function (app) {
            return _AppLoaders[app.appId] || new ETV.Loader(app);
        },
        /**
         * 根据appId查找Loader
         * @param appId
         * @returns {*}
         */
        findLoader: function (appId) {
            return _AppLoaders[appId];
        },
        /**
         * 获取当前页面全部加载器
         * @returns {{}}
         */
        getLoaders: function () {
            return _AppLoaders;
        },
        /**
         * 判断策略是否和状态匹配
         * @param mapping
         * @returns {boolean}
         */
        isMatch: function (mapping) {
            var status = this.status;
            var match = true;
            delete mapping.deployId;
            delete mapping.profileId;
            $.each(mapping, function (key, value) {
                if (value) {
                    if (key == 'areaCode') {
                        match = value == ETV.Util.getCA(status[key]);
                    } else {
                        match = value == status[key];
                    }
                }
            });
            return match;

        },

        /**
         * 修复主应用和引擎的事件冲突
         */
        fixMainAppEvent: function () {

            // 先复制主应用可能用到的事件
            var keyUpHandler = document.onkeyup || function () {
                };
            var keyDownHandler = document.onkeydown || function () {
                };
            var keyPressHandler = document.onkeypress || function () {
                };

            //清除主应用的事件处理函数
            document.onkeyup = document.onkeydown = document.onkeypress = null;


            //用来触发还原主应用的事件
            var fireEvent = function (e, handler) {
                var keyCodes = [];
                //遍历当前页面的正在启动的app
                $.each(_AppLoaders, function (id, loader) {
                        //如果app是活动状态，就需要判断是否有注册按键
                        if (loader._active) {
                            //拿到app的事件按键键值，并合并成数组
                            keyCodes = keyCodes.concat(loader.keyCodes);
                        }
                    }
                );
                //如果当前事件的按键键值不在数组里，就触发主应用原来的事件
                if ($.inArray(e.which, keyCodes) == -1) {
                    handler(e);
                }
            };

            TVUI.Event.on('keydown', function (e) {
                fireEvent(e, keyDownHandler);
            });

            TVUI.Event.on('keyup', function (e) {
                fireEvent(e, keyUpHandler);
                fireEvent(e, keyPressHandler);
            });


        },

        /**
         * 销毁所有app
         */
        clearLoaders: function () {
            $.each(_AppLoaders, function (id, loader) {
                loader && loader.destroy();
            });
        }
    };

    $.extend(ETV.Engine, TVUI.Base);

    /**
     * 辅助工具函数
     * @type {{}}
     */
    ETV.Util = {
        /**
         * 在页面上创建iframe
         */
        appendFrame: function (iframe) {
            document.body.appendChild(iframe);
            var contentWindow = iframe.contentWindow;
            var doc = contentWindow.document,
                onload = 'var d = document;d.getElementsByTagName(\'head\')[0].appendChild(d.createElement(\'script\')).src=\'' + ETV.__config.loader + '\'';
            doc.open().write('<body onload="' + onload + '">');
            doc.close();
            iframe.style.cssText = 'position: absolute;top:-1px;left:-1px; width:1px;height:1px; border:none; display:none;z-index:9999;';
            return contentWindow;
        },
        /**
         * 加载html
         * @param file
         * @param basePath
         * @param contentWindow
         * @param callback
         */
        loadHTML: function (file, basePath, contentWindow, callback) {
            if (file) {
                var url = /^http\:\/\//.test(file) ? file : basePath + file;
                if (contentWindow.document) {
                    $.get(url, function (html) {
                        contentWindow.document.body.innerHTML = html;
                        callback && callback();
                    });
                }
            }
        },
        /**
         * 加载css
         * @param files
         * @param basePath
         * @param contentWindow
         */
        loadCSS: function (files, basePath, contentWindow) {
            if (files && files.length > 0) {
                if (contentWindow.document) {
                    var head = contentWindow.document.getElementsByTagName('head')[0];
                    files = $.isArray(files) ? files : [files];
                    $.each(files, function (i, item) {
                        var link = contentWindow.document.createElement('link'),
                            url = /^http\:\/\//.test(item) ? item : basePath + item;
                        link.setAttribute('rel', 'stylesheet');
                        link.setAttribute('href', url);
                        head.appendChild(link);
                    });
                }
            }
        },
        /**
         * 加载js
         * @param files
         * @param basePath
         * @param contentWindow
         */
        loadScript: function (files, basePath, contentWindow) {
            if (files && files.length > 0) {
                files = $.isArray(files) ? files : [files];
                $.each(files, function (i, item) {
                    var url = /^http\:\/\//.test(item) ? item : basePath + item;
                    contentWindow.seajs.use(url, function (app) {
                        contentWindow.__etv_app__ = app;
                        if (app && app.init) {
                            app.init();
                        }
                    });
                });
            }
        },
        /**
         * 加载页面
         * @param page
         * @param AppLoader
         */
        loadPage: function (page, AppLoader) {
            ETV.Util.loadHTML(page.html, AppLoader.basePath, AppLoader.contentWindow, function () {
                ETV.Util.loadScript(page.js, AppLoader.basePath, AppLoader.contentWindow);
            });
            ETV.Util.loadCSS(page.css, AppLoader.basePath, AppLoader.contentWindow);
        },
        /**
         * 转成成数组
         * @param val
         * @returns {*}
         */
        toArray: function (val) {
            return $.isArray(val) ? val : ((val || val === 0) ? [val] : []);
        },
        /**
         * 时间格式数组转换成秒表示数组
         * @param timeArray
         * @returns {Array}
         */
        timeArrayToSecondArray: function (timeArray) {
            var seconds = [];
            $.each(timeArray, function (i, n) {
                seconds.push(TVUI.Util.date(n).getTime() / 1000);
            });
            return seconds;
        },
        /**
         * 获取package url
         * @param url
         * @returns {*}
         */
        getPackageUrl: function (url) {
            return url.indexOf('http://') > -1 ? url : ETV.__config.apps + url;
        },
        /**
         * 获取CA标识
         * @param areaCode
         * @returns {*}
         */
        getCA: function (areaCode) {
            var _this = this;
            if (this.__ca) {
                return this.__ca;
            } else {
                $.each(CA, function (key, array) {
                    if (areaCode >= array[0] && areaCode <= array[1]) {
                        _this.__ca = key;
                        return false;
                    }
                });
                return this.__ca || '';
            }
        }
    };


    /**
     * 加载器类
     */
    ETV.Loader = TVUI.Class.create({
        /**
         * 构造函数
         * @param app ｛appId, appPackage, width, height, left, top, active, auto, startTime, stopTime, activeKey, showKey, playState,startPoint, stopPoint｝
         */
        init: function (app) {
            this.setAttr(app);
            this._active = false;
            this.isShow = false;
            this.iframe = document.createElement('iframe');
            this.contentWindow = null;
            this.status = ETV.Engine.status;

            //状态：0 初始化，1安装，2显示，3隐藏，4销毁，5卸载
            this.state = 0;

            this._events();
            this.setAuto();
            //记录加载器
            _AppLoaders[app.appId] = this;
            ETV.Engine.fire('appInit', this);

        },
        /**
         * 设置属性
         * @param app
         */
        setAttr: function (app) {
            this.app = app;
            this.appId = app.appId;
            this.auto = !!app.auto;
            //显示时间数组
            this.startTime = ETV.Util.timeArrayToSecondArray(ETV.Util.toArray(app.startTime));

            //销毁时间数组
            this.stopTime = ETV.Util.timeArrayToSecondArray(ETV.Util.toArray(app.stopTime));

            //显示播放器相对时间数组
            this.startPoint = ETV.Util.toArray(app.startPoint);

            //销毁播放器相对时间数组
            this.stopPoint = ETV.Util.toArray(app.stopPoint);

            this.playState = app.playState || [];

            this.showKey = parseInt(app.showKey) || null;
            this.activeKey = parseInt(app.activeKey) || null;

            this.basePath = ETV.Util.getPackageUrl(this.app.appPackage.replace('package.json', ''));

            this.keyCodes = [];
        },

        /**
         * 更新应用
         * @param app
         */
        update: function (app) {
            this.setAttr(app);
            this.offset({
                width: parseInt(app.width || 0),
                height: parseInt(app.height || 0),
                left: parseInt(app.left || 0),
                top: parseInt(app.top || 0)
            });
            clearInterval(this.__startId);
            clearInterval(this.__stopId);
            this.setAuto();
            this.fire('update');
            this.sendMessage('UPDATE');
        },
        /**
         * 设置iframe的位置、大小
         * @param offset
         * @returns {*}
         */
        offset: function (offset) {
            if (offset) {
                $(this.iframe).css(offset);
            } else {
                return $(this.iframe).offset();
            }
        },
        /**
         * 向服务器发送消息
         * @param appId
         * @param msg
         */
        sendMessage: function (msg) {


            if (typeof msg === 'string') {
                var message = ETV.__config.message[msg];

                if (message) {
                    var status = this.status;
                    message.appId = this.appId;
                    $.extend(message, status);
                    ETV.Engine.sendMessage(message);
                } else {
                    ETV.Engine.sendMessage(msg);
                }
            } else {
                ETV.Engine.sendMessage(msg);
            }

        },
        /**
         * 执行安装
         */
        install: function () {
            //只有在初始化状态时才能安装，避免相同的app多次安装
            if (this.state === 0) {
                this.state = 1;
                var app = this.app;
                this.contentWindow = ETV.Util.appendFrame(this.iframe);
                this.offset({
                    width: parseInt(app.width || 0),
                    height: parseInt(app.height || 0),
                    left: parseInt(app.left || 0),
                    top: parseInt(app.top || 0)
                });
                this.inject();
                this.fire('install');
                this.sendMessage('INSTALL');
                ETV.Engine.fire('appInstall', this);
            }

        },
        /**
         * 显示app
         */
        show: function () {
            if (this.state === 2) return;
            this.state === 0 && this.install();
            this.iframe.style.display = 'block';
            this.state = 2;
            this.sendMessage('SHOW');
            this.isShow = true;
            this.fire('show');
            ETV.Engine.fire('appShow', this);

        },
        /**
         * 隐藏app
         */
        hide: function () {
            if (this.state === 3) return;

            this.state = 3;
            this.iframe.style.display = 'none';
            this.sendMessage('HIDE');
            this.isShow = false;
            this.fire('hide');
            ETV.Engine.fire('appHide', this);
        },
        /**
         * 销毁app
         */
        destroy: function () {

            if (this.state === 4) return;

            this.state = 4;
            //如果应用有实现销毁接口，执行销毁
            if (this.contentWindow.__etv_app__ && this.contentWindow.__etv_app__.destroy) {
                this.contentWindow.__etv_app__.destroy();
            }
            if (this.iframe.parentNode) {
                this.iframe.parentNode.removeChild(this.iframe);
            }

            this.isShow = false;
            this.iframe = null;
            this.contentWindow = null;
            clearInterval(this.__startId);
            clearInterval(this.__stopId);
            this.unBind();
            delete _AppLoaders[this.appId];
            this.sendMessage('DESTROY');
            ETV.Engine.fire('appDestroy', this);
            this.parent.prototype.destroy.apply(this, arguments);
        },
        /**
         * 卸载app
         */
        uninstall: function () {
            if (this.state === 5) return;
            this.state = 5;
            this.isShow = false;
            this.destroy();
            //todo: uninstall
            this.sendMessage('UNINSTALL');
            ETV.Engine.fire('appUninstall', this);
        },
        /**
         * 注入变量，iframe内调用不到中间件，要把对象注入进去
         */
        inject: function () {

            var o = {
                AppLoader: this
            };
            /*
             var cw = this.contentWindow;
             if (!cw.DataAccess) o.DataAccess = window.DataAccess;
             if (!cw.SysSetting) o.SysSetting = window.SysSetting;
             if (!cw.CA) o.CA = window.CA;
             if (!cw.Network) o.Network = window.Network;
             if (!cw.user) o.user = window.user;
             if (!cw.EPG) o.EPG = window.EPG;
             */
            o.AppLoader.seajs = ETV.__config.seajs;
            $.extend(this.contentWindow, o);
        },
        /**
         * 运行app
         */
        appInit: function () {
            var self = this;
            if (this.packageJSON) {
                self.keyCodes = self.packageJSON.keyCode || [];
                ETV.Util.loadPage(this.packageJSON.main, this);
            } else {
                $.getJSON(ETV.Util.getPackageUrl(this.app.appPackage), function (json) {
                    if (json) {
                        self.packageJSON = json;
                        self.keyCodes = self.packageJSON.keyCode || [];
                        json.main && ETV.Util.loadPage(self.packageJSON.main, self);
                    }
                });
            }
        },

        /**
         * 根据时间自动展示
         */
        autoShowByTime: function () {
            var _this = this,
                startTimeArray = this.startTime;
            //自动开始显示
            if (startTimeArray && startTimeArray.length > 0) {
                _this.__startId = setInterval(function () {
                    var nowSecond = parseInt((new Date()).getTime() / 1000);
                    $.each(startTimeArray, function (i, start) {
                        if (nowSecond == start) {
                            _this.show();
                            return false;
                        }
                    });
                }, 1000);
            }
        },
        /**
         * 根据时间自动销毁
         */
        autoHideByTime: function () {
            var _this = this,
                stopTimeArray = this.stopTime;
            if (stopTimeArray && stopTimeArray.length > 0) {
                _this.__stopId = setInterval(function () {
                    var nowSecond = parseInt((new Date()).getTime() / 1000);
                    $.each(stopTimeArray, function (i, stop) {
                        if (nowSecond == stop) {
                            _this.hide();
                            return false;
                        }
                    });
                }, 1000);
            }
        },
        /**
         * 根据播放器point自动显示和销毁
         * @param currentPoint
         */
        autoByPoint: function (currentPoint) {
            if (currentPoint) {
                var _this = this;
                $.each(this.startPoint, function (i, point) {
                    if (point == currentPoint) {
                        _this.show();
                        return false;
                    }
                });
                $.each(this.stopPoint, function (i, point) {
                    if (point == currentPoint) {
                        _this.hide();
                        return false;
                    }
                });
            }
        },
        autoByPlayState: function (state) {
            var playState = this.playState;
            if (playState && playState.length > 0) {
                var isMatch = false;
                for (var i = 0, len = this.playState.length; i < len; i++) {
                    if (state == this.playState[i]) {
                        isMatch = true;
                        break;
                    }
                }
                isMatch ? this.show() : this.hide();
            }
        },

        /**
         * 自动展示和销毁
         */
        setAuto: function () {
            if (this.auto) {
                //如果设置了自动，并且设置了一个时间条件，即开始自动任务，否则立即展示
                if (this.startTime.length > 0 || this.stopTime.length > 0 || this.startPoint.length > 0 || this.stopPoint.length > 0) {
                    this.autoShowByTime();
                    this.autoHideByTime();
                } else {
                    this.show();
                }
            }
        },

        /**
         * 调转页面
         * @param url
         * @param param
         */
        go: function (url, param) {
            if (!url) return;

            if (param) {
                var str = util.param(param);
                url += url.indexOf('?') > -1 ? '&' + str : '?' + str;
            }
            this.fire('go', url);
            top.location.href = url;
        },

        /**
         * 事件处理
         * @private
         */
        _events: function () {
            var _this = this;
            //传递按键事件
            this.registerEvent(TVUI.Event.on('keydown', function (e) {
                //todo：需要增加功能是否只为指定的按键传递事件，现在是全部按键都传递
                this._active && this.contentWindow.TVUI.Event.fire('keydown', e.which);
            }, this));

            this.registerEvent(TVUI.Event.on('keyup', function (e) {
                this._active && this.contentWindow.TVUI.Event.fire('keyup', e.which);
            }, this));

            //只允许同时一个app处于活动状态
            this.on('active', function () {
                $.each(_AppLoaders, function (appId, loader) {
                    if (_this.app.appId != appId) {
                        loader.unActive();
                    }
                });
                _this.iframe.className = ETV.__config.activeClassName;
                ETV.Engine.fire('appActive', _this);
            });

            this.on('unActive', function () {
                _this.iframe.className = '';
                var hasActive = false;
                $.each(_AppLoaders, function (appId, loader) {
                    if (loader._active) {
                        hasActive = true;
                        return false;
                    }
                });
                ETV.Engine.fire('appUnActive', _this);
                !hasActive && ETV.Engine.fire('appAllUnActive', _this);
            });

            //当引擎状态发送变化时，同步加载器的状态
            this.bind('change', function (status) {
                _this.status = status;
                _this.fire('status', status);
            });

            this.bind('point', function (point) {
                _this.autoByPoint(point);
                _this.fire('point', point);
            });

            this.bind('playState', function (state) {
                _this.autoByPlayState(state);
                _this.fire('playState', state);
            });


            //如果设置了app展示后自动激活
            this.on('show', function () {
                _this.app.active && _this.active();
            });

            this.on('hide', function () {
                _this.unActive();
            });

            this.registerEvent(TVUI.Event.on('keyup', function (e) {
                switch (e.which) {
                    case _this.showKey:
                        _this.isShow ? _this.hide() : _this.show();
                        break;
                    case _this.activeKey:
                        //在显示时才能控制活动状态
                        if (_this.isShow) {
                            _this._active ? _this.unActive() : _this.active();
                        }
                        break;
                }
            }));

            //窗体unload时触发事件
            if (top && top.window) {
                //todo：侦听了事件，销毁时未销毁事件句柄，有机会导致内存泄漏，待优化
                top.window.addEventListener('unload', function () {
                    _this.fire('unload');
                    _this.destroy();
                }, false);
            }


        },

        /**
         * 绑定引擎事件, 有待TVUI 1.2 改进
         * @param eventName
         * @param callback
         */
        bind: function (eventName, callback) {
            if (!this.__eventHandlers) {
                this.__eventHandlers = {};
            }
            this.__eventHandlers[++TVUI.uuid] = {
                name: eventName,
                callback: callback
            };
            ETV.Engine.on.call(ETV.Engine, eventName, callback);

        },
        /**
         * 删除引擎事件，有待TVUI 1.2 改进
         * @param id
         */
        unBind: function (id) {
            if (id) {
                var handler = this.__eventHandlers[id];
                handler && ETV.Engine.off(handler.name, handler.callback);
            } else {
                $.each(this.__eventHandlers || {}, function (id, handler) {
                    ETV.Engine.off(handler.name, handler.callback);
                });
            }
        },

        /**
         * 注册按键
         * @param code
         */
        addKey: function (codes) {
            var codeArray = $.isArray(codes) ? codes : [codes],
                self = this;
            $.each(codeArray, function (i, code) {
                if ($.inArray(code, self.keyCodes) == -1) {
                    self.keyCodes.push(code);
                }
            });

        },
        /**
         * 删除按键
         * @param code
         */
        removeKey: function (codes) {
            var codeArray = $.isArray(codes) ? codes : [codes],
                self = this;
            $.each(codeArray, function (i, code) {
                self.keyCodes = $.grep(self.keyCodes, function (n) {
                    return n != code;
                });
            });
        }

    }, TVUI.Base);


    //处理安装指令
    ETV.Engine.on('install', function (apps, mapping) {

        apps = $.isArray(apps) ? apps : [apps];
        if (!mapping || (mapping && ETV.Engine.isMatch(mapping))) {
            $.each(apps, function (i, app) {
                ETV.Engine.getLoader(app).install();
            });
        }
    });

    //处理显示指令
    ETV.Engine.on('show', function (apps, mapping) {

        if (!mapping || (mapping && ETV.Engine.isMatch(mapping))) {
            apps = $.isArray(apps) ? apps : [app];
            $.each(apps, function (i, app) {
                ETV.Engine.getLoader(app).show();
            });
        }
    });

    //处理隐藏指令
    ETV.Engine.on('hide', function (appIds, mapping) {
        if (!mapping || (mapping && ETV.Engine.isMatch(mapping))) {
            appIds = $.isArray(appIds) ? appIds : [appIds];
            $.each(appIds, function (i, appId) {
                var loader = ETV.Engine.findLoader(appId);
                loader && loader.hide();
            });
        }
    });

    //处理销毁指令
    ETV.Engine.on('destroy', function (appIds, mapping) {
        if (!mapping || (mapping && ETV.Engine.isMatch(mapping))) {
            appIds = $.isArray(appIds) ? appIds : [appIds];
            $.each(appIds, function (i, app) {
                var loader = typeof app == 'object' ? ETV.Engine.findLoader(app.appId) : ETV.Engine.findLoader(app);
                loader && loader.destroy();
            });
        }

    });

    //处理卸载指令
    ETV.Engine.on('uninstall', function (appIds, mapping) {
        if (!mapping || (mapping && ETV.Engine.isMatch(mapping))) {
            appIds = $.isArray(appIds) ? appIds : [appIds];
            $.each(appIds, function (i, app) {
                var loader = typeof app == 'object' ? ETV.Engine.findLoader(app.appId) : ETV.Engine.findLoader(app);
                loader && loader.uninstall();
            });
        }
    });

    //处理更新指令
    ETV.Engine.on('update', function (apps, mapping) {
        if (!mapping || (mapping && ETV.Engine.isMatch(mapping))) {
            apps = $.isArray(apps) ? apps : [apps];
            $.each(apps, function (i, app) {
                var loader = ETV.Engine.findLoader(app.appId);
                if (loader) {
                    loader.destroy();
                }
                ETV.Engine.getLoader(app).install();
            });
        }
    });


    global.ETV = ETV;

    ETV.Engine.fixMainAppEvent();

    if (window.define) {
        define(function (require, exports, module) {
            module.exports = ETV;
        });
    }

})(Zepto, TVUI, this);