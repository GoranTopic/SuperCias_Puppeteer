export default () => {
    // Ajax, this should define the functionality between the request functions...
    // AB_MAPPING ?? what is AB?
    PrimeFaces.AB_MAPPING = {
        s: "source",
        f: "formId",
        p: "process",
        u: "update",
        e: "event",
        a: "async",
        g: "global",
        d: "delay",
        t: "timeout",
        sc: "skipChildren",
        iau: "ignoreAutoUpdate",
        ps: "partialSubmit",
        psf: "partialSubmitFilter",
        rv: "resetValues",
        fi: "fragmentId",
        fu: "fragmentUpdate",
        pa: "params",
        onst: "onstart",
        oner: "onerror",
        onsu: "onsuccess",
        onco: "oncomplete"
    };
    // ab again, now as a function, what doe it do?
    PrimeFaces.ab = function(a, c, make_changes=true) {
        // the parameter a is an object
        for (var b in a) {
            // a can be { "fi": something, "iau":something }
            if (!a.hasOwnProperty(b)) {
                continue
            }
            // if one of elements passed in Array a is a AB_MAPPING key
            if (this.AB_MAPPING[b]) {
                // so what we are doing here is saving the value of the AB_MAPPING object as the key fo the same object in a
                a[this.AB_MAPPING[b]] = a[b];
                // a will now be a["params"] = a['pa']
                delete a[b]
                // we delete the a['pa']
            }
        }
        // this is defined right below
        // a would be in the form of a = { "params": Something } 
        // c is never touched, only passed along to this aja.request.handle function
        PrimeFaces.ajax.Request.handle(a, c, make_changes)
    };
    //
    PrimeFaces.ajax = {
        VIEW_HEAD: "javax.faces.ViewHead",
        VIEW_BODY: "javax.faces.ViewBody",
        RESOURCE: "javax.faces.Resource",
        Utils: {
            loadStylesheets: function(b) {
                for (var a = 0; a < b.length; a++) {
                    $("head").append('<link type="text/css" rel="stylesheet" href="' + b[a] + '" />')
                }
            },
            loadScripts: function(b) {
                var a = function() {
                    var c = b.shift();
                    if (c) {
                        PrimeFaces.getScript(c, a)
                    }
                };
                a()
            },
            getContent: function(c) {
                var b = "";
                for (var a = 0; a < c.childNodes.length; a++) {
                    b += c.childNodes[a].nodeValue
                }
                return b
            },
            updateFormStateInput: function(b, g, j) {
                var e = $.trim(g);
                var a = null;
                if (j && j.pfSettings && j.pfSettings.portletForms) {
                    a = $(j.pfSettings.portletForms)
                } else {
                    a = $("form")
                }
                var h = "";
                if (j && j.pfArgs && j.pfArgs.parameterPrefix) {
                    h = j.pfArgs.parameterPrefix
                }
                for (var d = 0; d < a.length; d++) {
                    var c = a.eq(d);
                    if (c.attr("method") === "post") {
                        var f = c.children("input[name='" + h + b + "']");
                        if (f.length > 0) {
                            f.val(e)
                        } else {
                            c.append('<input type="hidden" name="' + h + b + '" value="' + e + '" autocomplete="off" />')
                        }
                    }
                }
            },
            updateHead: function(d) {
                var b = $.ajaxSetup()["cache"];
                $.ajaxSetup()["cache"] = true;
                var a = new RegExp("<head[^>]*>","gi").exec(d)[0];
                var c = d.indexOf(a) + a.length;
                $("head").html(d.substring(c, d.lastIndexOf("</head>")));
                $.ajaxSetup()["cache"] = b
            },
            updateBody: function(b) {
                var c = new RegExp("<body[^>]*>","gi").exec(b)[0];
                var a = b.indexOf(c) + c.length;
                $("body").html(b.substring(a, b.lastIndexOf("</body>")))
            },
            updateElement: function(d, b, c) {
                if (d.indexOf(PrimeFaces.VIEW_STATE) !== -1) {
                    PrimeFaces.ajax.Utils.updateFormStateInput(PrimeFaces.VIEW_STATE, b, c)
                } else {
                    if (d.indexOf(PrimeFaces.CLIENT_WINDOW) !== -1) {
                        PrimeFaces.ajax.Utils.updateFormStateInput(PrimeFaces.CLIENT_WINDOW, b, c)
                    } else {
                        if (d === PrimeFaces.VIEW_ROOT) {
                            var a = PrimeFaces.ajax.Utils;
                            window.PrimeFaces = null;
                            a.updateHead(b);
                            a.updateBody(b)
                        } else {
                            if (d === PrimeFaces.ajax.VIEW_HEAD) {
                                PrimeFaces.ajax.Utils.updateHead(b)
                            } else {
                                if (d === PrimeFaces.ajax.VIEW_BODY) {
                                    PrimeFaces.ajax.Utils.updateBody(b)
                                } else {
                                    if (d === PrimeFaces.ajax.RESOURCE) {
                                        $("head").append(b)
                                    } else {
                                        if (d === $("head")[0].id) {
                                            PrimeFaces.ajax.Utils.updateHead(b)
                                        } else {
                                            $(PrimeFaces.escapeClientId(d)).replaceWith(b)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        Queue: {
            delays: {},
            requests: new Array(),
            xhrs: new Array(),
            offer: function(a) {
                if (a.delay) {
                    var b = null
                        , d = this
                        , b = (typeof (a.source) === "string") ? a.source : $(a.source).attr("id")
                        , c = function() {
                            return setTimeout(function() {
                                d.requests.push(a);
                                if (d.requests.length === 1) {
                                    PrimeFaces.ajax.Request.send(a)
                                }
                            }, a.delay)
                        };
                    if (this.delays[b]) {
                        clearTimeout(this.delays[b].timeout);
                        this.delays[b].timeout = c()
                    } else {
                        this.delays[b] = {
                            timeout: c()
                        }
                    }
                } else {
                    this.requests.push(a);
                    if (this.requests.length === 1) {
                        PrimeFaces.ajax.Request.send(a)
                    }
                }
            },
            poll: function() {
                if (this.isEmpty()) {
                    return null
                }
                var b = this.requests.shift()
                    , a = this.peek();
                if (a) {
                    PrimeFaces.ajax.Request.send(a)
                }
                return b
            },
            peek: function() {
                if (this.isEmpty()) {
                    return null
                }
                return this.requests[0]
            },
            isEmpty: function() {
                return this.requests.length === 0
            },
            addXHR: function(a) {
                this.xhrs.push(a)
            },
            removeXHR: function(b) {
                var a = $.inArray(b, this.xhrs);
                if (a > -1) {
                    this.xhrs.splice(a, 1)
                }
            },
            abortAll: function() {
                for (var a = 0; a < this.xhrs.length; a++) {
                    this.xhrs[a].abort()
                }
                this.xhrs = new Array();
                this.requests = new Array()
            }
        },
        Request: {
            // this function is important...
            handle: function(a, b, make_changes) {
                console.log("from ajax.request(a,b)");
                console.log("a:", a);
                console.log("b:", b);
                a.ext = b; // is b an executable that we are stoing in a? 
                // earlyPostParamEvaluation is defined below
                if (PrimeFaces.settings.earlyPostParamEvaluation) {
                    a.earlyPostParams = PrimeFaces.ajax.Request.collectEarlyPostParams(a)
                }
                if (a.async) {
                    // async function?
                    PrimeFaces.ajax.Request.send(a, make_changes)
                } else {
                    // let's assume that the Queues are not async
                    PrimeFaces.ajax.Queue.offer(a)
                }
            },
            collectEarlyPostParams: function(b) {
                console.log("from ajax.collectEarlyPostParams(b)");
                console.log("b:", b);
                var c;
                var d;
                if (typeof (b.source) === "string") {
                    d = $(PrimeFaces.escapeClientId(b.source))
                } else {
                    d = $(b.source)
                }
                if (d.is(":input") && d.is(":not(:button)")) {
                    c = [];
                    if (d.is(":checkbox")) {
                        var a = $("input[name='" + d.attr("name") + "']").filter(":checked").serializeArray();
                        $.merge(c, a)
                    } else {
                        c.push({
                            name: d.attr("name"),
                            value: d.val()
                        })
                    }
                } else {
                    c = d.serializeArray()
                }
                return c
            },
            send: function(e, make_changes=true) {
                //console.log("from ajax.send(e)");
                //console.log("e:", e);
                PrimeFaces.debug("Initiating ajax request.");
                PrimeFaces.customFocus = false;
                var m = (e.global === true || e.global === undefined) ? true : false
                    , b = null
                    , f = null
                    , u = null;
                if (e.onstart) {
                    u = e.onstart.call(this, e)
                }
                if (e.ext && e.ext.onstart) {
                    u = e.ext.onstart.call(this, e)
                }
                if (u === false) {
                    PrimeFaces.debug("Ajax request cancelled by onstart callback.");
                    if (!e.async) {
                        PrimeFaces.ajax.Queue.poll()
                    }
                    return false
                }
                if (m) {
                    $(document).trigger("pfAjaxStart")
                }
                if (typeof (e.source) === "string") {
                    f = e.source
                } else {
                    f = $(e.source).attr("id")
                }
                if (e.formId) {
                    b = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(e.formId)
                } else {
                    var q = $(PrimeFaces.escapeClientId(f));
                    b = q.closest("form");
                    if (b.length === 0) {
                        b = $("form").eq(0)
                    }
                }
                PrimeFaces.debug("Form to post " + b.attr("id") + ".");
                var x = b.attr("action")
                    , s = b.children("input[name*='javax.faces.encodedURL']")
                    , g = [];
                var v = PrimeFaces.ajax.Request.extractParameterNamespace(b);
                var w = null;
                if (s.length > 0) {
                    w = 'form[id*="' + v + '"]';
                    x = s.val()
                }
                PrimeFaces.debug("URL to post " + x + ".");
                PrimeFaces.ajax.Request.addParam(g, PrimeFaces.PARTIAL_REQUEST_PARAM, true, v);
                PrimeFaces.ajax.Request.addParam(g, PrimeFaces.PARTIAL_SOURCE_PARAM, f, v);
                if (e.resetValues) {
                    PrimeFaces.ajax.Request.addParam(g, PrimeFaces.RESET_VALUES_PARAM, true, v)
                }
                if (e.ignoreAutoUpdate) {
                    PrimeFaces.ajax.Request.addParam(g, PrimeFaces.IGNORE_AUTO_UPDATE_PARAM, true, v)
                }
                if (e.skipChildren === false) {
                    PrimeFaces.ajax.Request.addParam(g, PrimeFaces.SKIP_CHILDREN_PARAM, false, v)
                }
                var r = PrimeFaces.ajax.Request.resolveComponentsForAjaxCall(e, "process");
                if (e.fragmentId) {
                    r.push(e.fragmentId)
                }
                var a = "@none";
                if (r.length > 0) {
                    a = r.join(" ")
                } else {
                    var j = PrimeFaces.ajax.Request.resolveComponentsForAjaxCall(e, "process");
                    j = $.trim(j);
                    if (j === "") {
                        a = "@all"
                    }
                }
                if (a !== "@none") {
                    PrimeFaces.ajax.Request.addParam(g, PrimeFaces.PARTIAL_PROCESS_PARAM, a, v)
                }
                var d = PrimeFaces.ajax.Request.resolveComponentsForAjaxCall(e, "update");
                if (e.fragmentId && e.fragmentUpdate) {
                    d.push(e.fragmentId)
                }
                if (d.length > 0) {
                    PrimeFaces.ajax.Request.addParam(g, PrimeFaces.PARTIAL_UPDATE_PARAM, d.join(" "), v)
                }
                if (e.event) {
                    PrimeFaces.ajax.Request.addParam(g, PrimeFaces.BEHAVIOR_EVENT_PARAM, e.event, v);
                    var l = e.event;
                    if (e.event === "valueChange") {
                        l = "change"
                    } else {
                        if (e.event === "action") {
                            l = "click"
                        }
                    }
                    PrimeFaces.ajax.Request.addParam(g, PrimeFaces.PARTIAL_EVENT_PARAM, l, v)
                } else {
                    PrimeFaces.ajax.Request.addParam(g, f, f, v)
                }
                if (e.params) {
                    PrimeFaces.ajax.Request.addParams(g, e.params, v)
                }
                if (e.ext && e.ext.params) {
                    PrimeFaces.ajax.Request.addParams(g, e.ext.params, v)
                }
                if (e.partialSubmit && a.indexOf("@all") === -1) {
                    var n = false
                        , h = e.partialSubmitFilter || ":input";
                    if (a.indexOf("@none") === -1) {
                        for (var o = 0; o < r.length; o++) {
                            var k = $(PrimeFaces.escapeClientId(r[o]));
                            var y = null;
                            if (k.is("form")) {
                                y = k.serializeArray();
                                n = true
                            } else {
                                if (k.is(":input")) {
                                    y = k.serializeArray()
                                } else {
                                    y = k.find(h).serializeArray()
                                }
                            }
                            $.merge(g, y)
                        }
                    }
                    if (!n) {
                        PrimeFaces.ajax.Request.addParamFromInput(g, PrimeFaces.VIEW_STATE, b, v);
                        PrimeFaces.ajax.Request.addParamFromInput(g, PrimeFaces.CLIENT_WINDOW, b, v);
                        PrimeFaces.ajax.Request.addParamFromInput(g, "dsPostWindowId", b, v);
                        PrimeFaces.ajax.Request.addParamFromInput(g, "dspwid", b, v)
                    }
                } else {
                    $.merge(g, b.serializeArray())
                }
                if (PrimeFaces.settings.earlyPostParamEvaluation && e.earlyPostParams) {
                    $.each(e.earlyPostParams, function(i, z) {
                        g = $.grep(g, function(B, A) {
                            if (B.name === z.name) {
                                return false
                            }
                            return true
                        })
                    });
                    $.merge(g, e.earlyPostParams)
                }
                var c = $.param(g);
                PrimeFaces.debug("Post Data:" + c);
                var p = {
                    url: x,
                    type: "POST",
                    cache: false,
                    dataType: "xml",
                    data: c,
                    portletForms: w,
                    source: e.source,
                    global: false,
                    beforeSend: function(z, i) {
                        z.setRequestHeader("Faces-Request", "partial/ajax");
                        z.pfSettings = i;
                        z.pfArgs = {};
                        PrimeFaces.nonAjaxPosted = false;
                        if (m) {
                            $(document).trigger("pfAjaxSend", [z, this])
                        }
                    }
                };
                if (e.timeout) {
                    p.timeout = e.timeout
                }
                // this is the acutla line that send the request
                var t = $.ajax(p).fail(function(A, i, z) {
                    if (e.onerror) {
                        e.onerror.call(this, A, i, z)
                    }
                    if (e.ext && e.ext.onerror) {
                        e.ext.onerror.call(this, A, i, z)
                    }
                    $(document).trigger("pfAjaxError", [A, this, z]);
                    PrimeFaces.error("Request return with error:" + i + ".")
                }).done(function(B, i, C) {
                    console.log("printing from the $.ajax(p).done funtion(B,i,c)");
                    console.log("B:", B);
                    console.log("i:", i);
                    console.log("C:", C);
                    PrimeFaces.debug("Response received succesfully.");
                    try {
                        var z;
                        if (e.onsuccess) {
                            z = e.onsuccess.call(this, B, i, C)
                        }
                        if (e.ext && e.ext.onsuccess && !z) {
                            z = e.ext.onsuccess.call(this, B, i, C)
                        }
                        if (m) {
                            $(document).trigger("pfAjaxSuccess", [C, this])
                        }
                        if (z) {
                            return
                        } else {
                            if(make_changes) PrimeFaces.ajax.Response.handle(B, i, C)
                        }
                    } catch (A) {
                        PrimeFaces.error(A)
                    }
                    PrimeFaces.debug("DOM is updated.")
                }).always(function(z, i, A) {
                    //console.log("printing from the $.ajax(p).always funtion(z,i,A)");
                    //console.log("z:", z);
                    //console.log("i:", i);
                    //console.log("A:", A);
                    PrimeFaces.debug("Response received succesfully.")
                    if (e.ext && e.ext.oncomplete) {
                        e.ext.oncomplete.call(this, A, i, A.pfArgs)
                    }
                    if (e.oncomplete) {
                        e.oncomplete.call(this, A, i, A.pfArgs)
                    }
                    if (m) {
                        $(document).trigger("pfAjaxComplete", [A, this])
                    }
                    PrimeFaces.debug("Response completed.");
                    PrimeFaces.ajax.Queue.removeXHR(A);
                    if (!e.async && !PrimeFaces.nonAjaxPosted) {
                        PrimeFaces.ajax.Queue.poll()
                    }
                });
                PrimeFaces.ajax.Queue.addXHR(t)
            },
            resolveExpressionsForAjaxCall: function(a, b) {
                var c = "";
                if (a[b]) {
                    c += a[b]
                }
                if (a.ext && a.ext[b]) {
                    c += " " + a.ext[b]
                }
                return c
            },
            resolveComponentsForAjaxCall: function(a, b) {
                var c = PrimeFaces.ajax.Request.resolveExpressionsForAjaxCall(a, b);
                return PrimeFaces.expressions.SearchExpressionFacade.resolveComponents(c)
            },
            addParam: function(c, a, b, d) {
                if (d || !a.indexOf(d) === 0) {
                    c.push({
                        name: d + a,
                        value: b
                    })
                } else {
                    c.push({
                        name: a,
                        value: b
                    })
                }
            },
            addParams: function(d, a, e) {
                for (var b = 0; b < a.length; b++) {
                    var c = a[b];
                    if (e && !c.name.indexOf(e) === 0) {
                        c.name = e + c.name
                    }
                    d.push(c)
                }
            },
            addParamFromInput: function(e, b, c, f) {
                var a = null;
                if (f) {
                    a = c.children("input[name*='" + b + "']")
                } else {
                    a = c.children("input[name='" + b + "']")
                }
                if (a && a.length > 0) {
                    var d = a.val();
                    PrimeFaces.ajax.Request.addParam(e, b, d, f)
                }
            },
            extractParameterNamespace: function(c) {
                var a = c.children("input[name*='" + PrimeFaces.VIEW_STATE + "']");
                if (a && a.length > 0) {
                    var b = a[0].name;
                    if (b.length > PrimeFaces.VIEW_STATE.length) {
                        return b.substring(0, b.indexOf(PrimeFaces.VIEW_STATE))
                    }
                }
                return null
            }
        },
        Response: {
            handle: function(h, e, m, b) {
                var n = h.getElementsByTagName("partial-response")[0];
                for (var g = 0; g < n.childNodes.length; g++) {
                    var a = n.childNodes[g];
                    switch (a.nodeName) {
                        case "redirect":
                            PrimeFaces.ajax.ResponseProcessor.doRedirect(a);
                            break;
                        case "changes":
                            var c = $(document.activeElement);
                            var k = c.attr("id");
                            var f;
                            if (c.length > 0 && c.is("input") && $.isFunction($.fn.getSelection)) {
                                f = c.getSelection()
                            }
                            for (var d = 0; d < a.childNodes.length; d++) {
                                var l = a.childNodes[d];
                                switch (l.nodeName) {
                                    case "update":
                                        PrimeFaces.ajax.ResponseProcessor.doUpdate(l, m, b);
                                        break;
                                    case "delete":
                                        PrimeFaces.ajax.ResponseProcessor.doDelete(l);
                                        break;
                                    case "insert":
                                        PrimeFaces.ajax.ResponseProcessor.doInsert(l);
                                        break;
                                    case "attributes":
                                        PrimeFaces.ajax.ResponseProcessor.doAttributes(l);
                                        break;
                                    case "eval":
                                        PrimeFaces.ajax.ResponseProcessor.doEval(l);
                                        break;
                                    case "extension":
                                        PrimeFaces.ajax.ResponseProcessor.doExtension(l, m);
                                        break
                                }
                            }
                            PrimeFaces.ajax.Response.handleReFocus(k, f);
                            PrimeFaces.ajax.Response.destroyDetachedWidgets();
                            break;
                        case "eval":
                            PrimeFaces.ajax.ResponseProcessor.doEval(a);
                            break;
                        case "extension":
                            PrimeFaces.ajax.ResponseProcessor.doExtension(a, m);
                            break;
                        case "error":
                            PrimeFaces.ajax.ResponseProcessor.doError(a, m);
                            break
                    }
                }
            },
            handleReFocus: function(d, b) {
                if (PrimeFaces.customFocus === false && d && d !== $(document.activeElement).attr("id")) {
                    var c = $(PrimeFaces.escapeClientId(d));
                    var a = function() {
                        c.focus();
                        if (b && b.start) {
                            c.setSelection(b.start, b.end)
                        }
                    };
                    if (c.length) {
                        a();
                        setTimeout(function() {
                            if (!c.is(":focus")) {
                                a()
                            }
                        }, 50)
                    }
                }
                PrimeFaces.customFocus = false
            },
            destroyDetachedWidgets: function() {
                for (var a = 0; a < PrimeFaces.detachedWidgets.length; a++) {
                    var d = PrimeFaces.detachedWidgets[a];
                    var b = PF(d);
                    if (b) {
                        if (b.isDetached()) {
                            PrimeFaces.widgets[d] = null;
                            b.destroy();
                        }
                    }
                }
                PrimeFaces.detachedWidgets = []
            }
        },
        ResponseProcessor: {
            doRedirect: function(b) {
                try {
                    window.location.assign(b.getAttribute("url"))
                } catch (a) {
                    PrimeFaces.warn("Error redirecting to URL: " + b.getAttribute("url"))
                }
            },
            doUpdate: function(c, d, a) {
                var e = c.getAttribute("id")
                    , b = PrimeFaces.ajax.Utils.getContent(c);
                if (a && a.widget && a.widget.id === e) {
                    a.handle.call(a.widget, b)
                } else {
                    PrimeFaces.ajax.Utils.updateElement(e, b, d)
                }
            },
            doEval: function(b) {
                var a = b.textContent || b.innerText || b.text;
                $.globalEval(a)
            },
            doExtension: function(d, e) {
                if (e) {
                    if (d.getAttribute("ln") === "primefaces" && d.getAttribute("type") === "args") {
                        var c = d.textContent || d.innerText || d.text;
                        if (e.pfArgs) {
                            var b = JSON.parse(c);
                            for (var a in b) {
                                e.pfArgs[a] = b[a]
                            }
                        } else {
                            e.pfArgs = JSON.parse(c)
                        }
                    }
                }
            },
            doError: function(a, b) {},
            doDelete: function(a) {
                var b = a.getAttribute("id");
                $(PrimeFaces.escapeClientId(b)).remove()
            },
            doInsert: function(d) {
                if (!d.childNodes) {
                    return false
                }
                for (var b = 0; b < d.childNodes.length; b++) {
                    var a = d.childNodes[b];
                    var f = a.getAttribute("id");
                    var e = $(PrimeFaces.escapeClientId(f));
                    var c = PrimeFaces.ajax.Utils.getContent(a);
                    if (a.nodeName === "after") {
                        $(c).insertAfter(e)
                    } else {
                        if (a.nodeName === "before") {
                            $(c).insertBefore(e)
                        }
                    }
                }
            },
            doAttributes: function(c) {
                if (!c.childNodes) {
                    return false
                }
                var g = c.getAttribute("id");
                var f = $(PrimeFaces.escapeClientId(g));
                for (var b = 0; b < c.childNodes.length; b++) {
                    var d = c.childNodes[b];
                    var a = d.getAttribute("name");
                    var e = d.getAttribute("value");
                    if (!a) {
                        return
                    }
                    if (!e || e === null) {
                        e = ""
                    }
                    f.attr(a, e)
                }
            }
        },
        AjaxRequest: function(a, b) {
            return PrimeFaces.ajax.Request.handle(a, b)
        }
    };
    $(window).on("beforeunload", function() {
        PrimeFaces.ajax.Queue.abortAll()
    })
}
