if (!PrimeFaces.dialog) {
    PrimeFaces.dialog = {};
    PrimeFaces.dialog.DialogHandler = {
        openDialog: function(f) {
            var h = this.findRootWindow()
              , k = f.sourceComponentId + "_dlg";
            if (h.document.getElementById(k)) {
                return
            }
            var j = f.sourceComponentId.replace(/:/g, "_") + "_dlgwidget"
              , d = f.options.styleClass || ""
              , e = $('<div id="' + k + '" class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-shadow ui-hidden-container ui-overlay-hidden ' + d + '" data-pfdlgcid="' + f.pfdlgcid + '" data-widgetvar="' + j + '"></div>').append('<div class="ui-dialog-titlebar ui-widget-header ui-helper-clearfix ui-corner-top"><span class="ui-dialog-title"></span></div>');
            var g = e.children(".ui-dialog-titlebar");
            if (f.options.closable !== false) {
                g.append('<a class="ui-dialog-titlebar-icon ui-dialog-titlebar-close ui-corner-all" href="#" role="button"><span class="ui-icon ui-icon-closethick"></span></a>')
            }
            if (f.options.minimizable) {
                g.append('<a class="ui-dialog-titlebar-icon ui-dialog-titlebar-minimize ui-corner-all" href="#" role="button"><span class="ui-icon ui-icon-minus"></span></a>')
            }
            if (f.options.maximizable) {
                g.append('<a class="ui-dialog-titlebar-icon ui-dialog-titlebar-maximize ui-corner-all" href="#" role="button"><span class="ui-icon ui-icon-extlink"></span></a>')
            }
            e.append('<div class="ui-dialog-content ui-widget-content ui-df-content" style="height: auto;"><iframe style="border:0 none" frameborder="0"/></div>');
            e.appendTo(h.document.body);
            var c = e.find("iframe")
              , b = f.url.indexOf("?") === -1 ? "?" : "&"
              , a = f.url.indexOf("pfdlgcid") === -1 ? f.url + b + "pfdlgcid=" + f.pfdlgcid : f.url
              , i = f.options.contentWidth || 640;
            c.width(i);
            if (f.options.iframeTitle) {
                c.attr("title", f.options.iframeTitle)
            }
            c.on("load", function() {
                var q = $(this)
                  , m = q.contents().find("title")
                  , p = false;
                if (f.options.headerElement) {
                    var o = PrimeFaces.escapeClientId(f.options.headerElement)
                      , l = c.contents().find(o);
                    if (l.length) {
                        m = l;
                        p = true
                    }
                }
                if (!q.data("initialized")) {
                    PrimeFaces.cw.call(h.PrimeFaces, "DynamicDialog", j, {
                        id: k,
                        position: f.options.position || "center",
                        sourceComponentId: f.sourceComponentId,
                        sourceWidgetVar: f.sourceWidgetVar,
                        onHide: function() {
                            var t = this
                              , s = this.content.children("iframe");
                            if (s.get(0).contentWindow.PrimeFaces) {
                                this.destroyIntervalId = setInterval(function() {
                                    if (s.get(0).contentWindow.PrimeFaces.ajax.Queue.isEmpty()) {
                                        clearInterval(t.destroyIntervalId);
                                        s.attr("src", "about:blank");
                                        t.jq.remove()
                                    }
                                }, 10)
                            } else {
                                s.attr("src", "about:blank");
                                t.jq.remove()
                            }
                            h.PF[j] = undefined
                        },
                        modal: f.options.modal,
                        resizable: f.options.resizable,
                        hasIframe: true,
                        draggable: f.options.draggable,
                       width: f.options.width,
                        height: f.options.height,
                        minimizable: f.options.minimizable,
                        maximizable: f.options.maximizable,
                        headerElement: f.options.headerElement,
                        responsive: f.options.responsive,
                        closeOnEscape: f.options.closeOnEscape
                    })
                }
                var r = h.PF(j).titlebar.children("span.ui-dialog-title");
                if (m.length > 0) {
                    if (p) {
                        r.append(m);
                        m.show()
                    } else {
                        r.text(m.text())
                    }
                    c.attr("title", r.text())
                }
                var n = null;
                if (f.options.contentHeight) {
                    n = f.options.contentHeight
                } else {
                    n = q.get(0).contentWindow.document.body.scrollHeight + (PrimeFaces.env.browser.webkit ? 5 : 25)
                }
                q.css("height", n);
                c.data("initialized", true);
                h.PF(j).show()
            }).attr("src", a)
        },
        closeDialog: function(cfg) {
            var rootWindow = this.findRootWindow()
              , dlgs = $(rootWindow.document.body).children('div.ui-dialog[data-pfdlgcid="' + cfg.pfdlgcid + '"]').not("[data-queuedforremoval]")
              , dlgsLength = dlgs.length
              , dlg = dlgs.eq(dlgsLength - 1)
              , parentDlg = dlgsLength > 1 ? dlgs.eq(dlgsLength - 2) : null
              , dlgWidget = rootWindow.PF(dlg.data("widgetvar"))
              , sourceWidgetVar = dlgWidget.cfg.sourceWidgetVar
              , sourceComponentId = dlgWidget.cfg.sourceComponentId
              , dialogReturnBehavior = null
              , windowContext = null;
            dlg.attr("data-queuedforremoval", true);
            if (parentDlg) {
                var parentDlgFrame = parentDlg.find("> .ui-dialog-content > iframe").get(0)
                  , windowContext = parentDlgFrame.contentWindow || parentDlgFrame;
                sourceWidget = windowContext.PF(sourceWidgetVar)
            } else {
                windowContext = rootWindow
            }
            if (sourceWidgetVar) {
                var sourceWidget = windowContext.PF(sourceWidgetVar);
                dialogReturnBehavior = sourceWidget.cfg.behaviors ? sourceWidget.cfg.behaviors.dialogReturn : null
            } else {
                if (sourceComponentId) {
                    var dialogReturnBehaviorStr = $(windowContext.document.getElementById(sourceComponentId)).data("dialogreturn");
                    if (dialogReturnBehaviorStr) {
                        dialogReturnBehavior = windowContext.eval("(function(ext){this." + dialogReturnBehaviorStr + "})")
                    }
                }
            }
            if (dialogReturnBehavior) {
                var ext = {
                    params: [{
                        name: sourceComponentId + "_pfdlgcid",
                        value: cfg.pfdlgcid
                    }]
                };
                dialogReturnBehavior.call(windowContext, ext)
            }
            dlgWidget.hide()
        },
        showMessageInDialog: function(b) {
            if (!this.messageDialog) {
                var a = $('<div id="primefacesmessagedlg" class="ui-message-dialog ui-dialog ui-widget ui-widget-content ui-corner-all ui-shadow ui-hidden-container"/>').append('<div class="ui-dialog-titlebar ui-widget-header ui-helper-clearfix ui-corner-top"><span class="ui-dialog-title"></span><a class="ui-dialog-titlebar-icon ui-dialog-titlebar-close ui-corner-all" href="#" role="button"><span class="ui-icon ui-icon-closethick"></span></a></div><div class="ui-dialog-content ui-widget-content" style="height: auto;"></div>').appendTo(document.body);
                PrimeFaces.cw("Dialog", "primefacesmessagedialog", {
                    id: "primefacesmessagedlg",
                    modal: true,
                    draggable: false,
                    resizable: false,
                    showEffect: "fade",
                    hideEffect: "fade"
                });
                this.messageDialog = PF("primefacesmessagedialog");
                this.messageDialog.titleContainer = this.messageDialog.titlebar.children("span.ui-dialog-title")
            }
            this.messageDialog.titleContainer.text(b.summary);
            this.messageDialog.content.html("").append('<span class="ui-dialog-message ui-messages-' + b.severity.split(" ")[0].toLowerCase() + '-icon" />').append(b.detail);
            this.messageDialog.show()
        },
        confirm: function(a) {
            if (PrimeFaces.confirmDialog) {
                PrimeFaces.confirmSource = (typeof (a.source) === "string") ? $(PrimeFaces.escapeClientId(a.source)) : $(a.source);
                PrimeFaces.confirmDialog.showMessage(a)
            } else {
                PrimeFaces.warn("No global confirmation dialog available.")
            }
        },
        findRootWindow: function() {
            var a = window;
            while (a.frameElement) {
                var b = a.parent;
                if (b.PF === undefined) {
                    break
                }
                a = b
            }
            return a
        }
    }
}
;PrimeFaces.widget.AccordionPanel = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        this.stateHolder = $(this.jqId + "_active");
        this.headers = this.jq.children(".ui-accordion-header");
        this.panels = this.jq.children(".ui-accordion-content");
        this.cfg.rtl = this.jq.hasClass("ui-accordion-rtl");
        this.cfg.expandedIcon = "ui-icon-triangle-1-s";
        this.cfg.collapsedIcon = this.cfg.rtl ? "ui-icon-triangle-1-w" : "ui-icon-triangle-1-e";
        this.initActive();
        this.bindEvents();
        if (this.cfg.dynamic && this.cfg.cache) {
            this.markLoadedPanels()
        }
    },
    initActive: function() {
        if (this.cfg.multiple) {
            this.cfg.active = [];
            if (this.stateHolder.val().length > 0) {
                var a = this.stateHolder.val().split(",");
                for (var b = 0; b < a.length; b++) {
                    this.cfg.active.push(parseInt(a[b]))
                }
            }
        } else {
            this.cfg.active = parseInt(this.stateHolder.val())
        }
    },
    bindEvents: function() {
        var a = this;
        this.headers.mouseover(function() {
            var b = $(this);
            if (!b.hasClass("ui-state-active") && !b.hasClass("ui-state-disabled")) {
                b.addClass("ui-state-hover")
            }
        }).mouseout(function() {
            var b = $(this);
            if (!b.hasClass("ui-state-active") && !b.hasClass("ui-state-disabled")) {
                b.removeClass("ui-state-hover")
            }
        }).click(function(d) {
            var c = $(this);
            if (!c.hasClass("ui-state-disabled")) {
                var b = a.headers.index(c);
                if (c.hasClass("ui-state-active")) {
                    a.unselect(b)
                } else {
                    a.select(b);
                    $(this).trigger("focus.accordion")
                }
            }
            d.preventDefault()
        });
        this.bindKeyEvents()
    },
    bindKeyEvents: function() {
        this.headers.on("focus.accordion", function() {
            $(this).addClass("ui-tabs-outline")
        }).on("blur.accordion", function() {
            $(this).removeClass("ui-tabs-outline")
        }).on("keydown.accordion", function(c) {
            var b = $.ui.keyCode
              , a = c.which;
            if (a === b.SPACE || a === b.ENTER || a === b.NUMPAD_ENTER) {
                $(this).trigger("click");
                c.preventDefault()
            }
        })
    },
    markLoadedPanels: function() {
        if (this.cfg.multiple) {
            for (var a = 0; a < this.cfg.active.length; a++) {
                if (this.cfg.active[a] >= 0) {
                    this.markAsLoaded(this.panels.eq(this.cfg.active[a]))
                }
            }
        } else {
            if (this.cfg.active >= 0) {
                this.markAsLoaded(this.panels.eq(this.cfg.active))
            }
        }
    },
    select: function(c) {
        var b = this.panels.eq(c);
        if (this.cfg.onTabChange) {
            var a = this.cfg.onTabChange.call(this, b);
            if (a === false) {
                return false
            }
        }
        var d = this.cfg.dynamic && !this.isLoaded(b);
        if (this.cfg.multiple) {
            this.addToSelection(c)
        } else {
            this.cfg.active = c
        }
        this.saveState();
        if (d) {
            this.loadDynamicTab(b)
        } else {
            if (this.cfg.controlled) {
                if (this.hasBehavior("tabChange")) {
                    this.fireTabChangeEvent(b)
                }
            } else {
                this.show(b);
                if (this.hasBehavior("tabChange")) {
                    this.fireTabChangeEvent(b)
                }
            }
        }
        return true
    },
    unselect: function(a) {
        if (this.cfg.controlled) {
            if (this.hasBehavior("tabClose")) {
                this.fireTabCloseEvent(a)
            }
        } else {
            this.hide(a);
            if (this.hasBehavior("tabClose")) {
                this.fireTabCloseEvent(a)
            }
        }
    },
    show: function(c) {
        var b = this;
        if (!this.cfg.multiple) {
            var d = this.headers.filter(".ui-state-active");
            d.children(".ui-icon").removeClass(this.cfg.expandedIcon).addClass(this.cfg.collapsedIcon);
            d.attr("aria-selected", false);
            d.attr("aria-expanded", false).removeClass("ui-state-active ui-corner-top").addClass("ui-corner-all").next().attr("aria-hidden", true).slideUp(function() {
                if (b.cfg.onTabClose) {
                    b.cfg.onTabClose.call(b, c)
                }
            })
        }
        var a = c.prev();
        a.attr("aria-selected", true);
        a.attr("aria-expanded", true).addClass("ui-state-active ui-corner-top").removeClass("ui-state-hover ui-corner-all").children(".ui-icon").removeClass(this.cfg.collapsedIcon).addClass(this.cfg.expandedIcon);
        c.attr("aria-hidden", false).slideDown("normal", function() {
            b.postTabShow(c)
        })
    },
    hide: function(c) {
        var a = this
          , b = this.panels.eq(c)
          , d = b.prev();
        d.attr("aria-selected", false);
        d.attr("aria-expanded", false).children(".ui-icon").removeClass(this.cfg.expandedIcon).addClass(this.cfg.collapsedIcon);
        d.removeClass("ui-state-active ui-corner-top").addClass("ui-corner-all");
        b.attr("aria-hidden", true).slideUp(function() {
            if (a.cfg.onTabClose) {
                a.cfg.onTabClose.call(a, b)
            }
        });
        this.removeFromSelection(c);
        this.saveState()
    },
    loadDynamicTab: function(a) {
        var c = this
          , b = {
            source: this.id,
            process: this.id,
            update: this.id,
            params: [{
                name: this.id + "_contentLoad",
                value: true
            }, {
                name: this.id + "_newTab",
                value: a.attr("id")
            }, {
                name: this.id + "_tabindex",
                value: parseInt(a.index() / 2)
            }],
            onsuccess: function(g, e, f) {
                PrimeFaces.ajax.Response.handle(g, e, f, {
                    widget: c,
                    handle: function(h) {
                        a.html(h);
                        if (this.cfg.cache) {
                            this.markAsLoaded(a)
                        }
                    }
                });
                return true
            },
            oncomplete: function() {
                c.show(a)
            }
        };
        if (this.hasBehavior("tabChange")) {
            var d = this.cfg.behaviors.tabChange;
            d.call(this, b)
        } else {
            PrimeFaces.ajax.AjaxRequest(b)
        }
    },
    fireTabChangeEvent: function(a) {
        var d = this.cfg.behaviors.tabChange
          , b = {
            params: [{
                name: this.id + "_newTab",
                value: a.attr("id")
            }, {
                name: this.id + "_tabindex",
                value: parseInt(a.index() / 2)
            }]
        };
        if (this.cfg.controlled) {
            var c = this;
            b.oncomplete = function(g, e, f) {
                if (f.access && !f.validationFailed) {
                    c.show(a)
                }
            }
        }
        d.call(this, b)
    },
    fireTabCloseEvent: function(b) {
        var a = this.panels.eq(b)
          , d = this.cfg.behaviors.tabClose
          , c = {
            params: [{
                name: this.id + "_tabId",
                value: a.attr("id")
            }, {
                name: this.id + "_tabindex",
                value: parseInt(b)
            }]
        };
        if (this.cfg.controlled) {
            var e = this;
            c.oncomplete = function(h, f, g) {
                if (g.access && !g.validationFailed) {
                    e.hide(b)
                }
            }
        }
        d.call(this, c)
    },
    markAsLoaded: function(a) {
        a.data("loaded", true)
    },
    isLoaded: function(a) {
        return a.data("loaded") == true
    },
    addToSelection: function(a) {
        this.cfg.active.push(a)
    },
    removeFromSelection: function(a) {
        this.cfg.active = $.grep(this.cfg.active, function(b) {
            return b != a
        })
    },
    saveState: function() {
        if (this.cfg.multiple) {
            this.stateHolder.val(this.cfg.active.join(","))
        } else {
            this.stateHolder.val(this.cfg.active)
        }
    },
    postTabShow: function(a) {
        if (this.cfg.onTabShow) {
            this.cfg.onTabShow.call(this, a)
        }
        PrimeFaces.invokeDeferredRenders(this.id)
    }
});

// this is the widget thst suton complete companies name use,
// I need to find where and how it is requesting the suggestiong
PrimeFaces.widget.AutoComplete = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        this.panelId = this.jqId + "_panel";
        this.input = $(this.jqId + "_input");
        this.hinput = $(this.jqId + "_hinput");
        this.panel = this.jq.children(this.panelId);
        this.dropdown = this.jq.children(".ui-button");
        this.active = true;
        this.cfg.pojo = this.hinput.length == 1;
        this.cfg.minLength = this.cfg.minLength != undefined ? this.cfg.minLength : 1;
        this.cfg.cache = this.cfg.cache || false;
        this.cfg.resultsMessage = this.cfg.resultsMessage || " results are available, use up and down arrow keys to navigate";
        this.cfg.ariaEmptyMessage = this.cfg.emptyMessage || "No search results are available.";
        this.cfg.dropdownMode = this.cfg.dropdownMode || "blank";
        this.cfg.autoHighlight = (this.cfg.autoHighlight === undefined) ? true : this.cfg.autoHighlight;
        this.cfg.myPos = this.cfg.myPos || "left top";
        this.cfg.atPos = this.cfg.atPos || "left bottom";
        this.cfg.active = (this.cfg.active === false) ? false : true;
        this.cfg.dynamic = this.cfg.dynamic === true ? true : false;
        this.cfg.autoSelection = this.cfg.autoSelection === false ? false : true;
        this.suppressInput = true;
        this.touchToDropdownButton = false;
        this.isTabPressed = false;
        this.isDynamicLoaded = false;
        if (this.cfg.cache) {
            this.initCache()
        }
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        this.hinput.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        if (this.cfg.multiple) {
            this.setupMultipleMode();
            this.multiItemContainer.data("primefaces-overlay-target", true).find("*").data("primefaces-overlay-target", true);
            if (this.cfg.selectLimit >= 0 && this.multiItemContainer.children("li.ui-autocomplete-token").length === this.cfg.selectLimit) {
                this.input.hide();
                this.disableDropdown()
            }
        } else {
            PrimeFaces.skinInput(this.input);
            this.input.data("primefaces-overlay-target", true).find("*").data("primefaces-overlay-target", true);
            this.dropdown.data("primefaces-overlay-target", true).find("*").data("primefaces-overlay-target", true)
        }
        this.bindStaticEvents();
        if (this.cfg.behaviors) {
            PrimeFaces.attachBehaviors(this.input, this.cfg.behaviors)
        }
        if (this.cfg.forceSelection) {
            this.setupForceSelection()
        }
        if (this.panel.length) {
            this.appendPanel()
        }
        if (this.cfg.itemtip) {
            this.itemtip = $('<div id="' + this.id + '_itemtip" class="ui-autocomplete-itemtip ui-state-highlight ui-widget ui-corner-all ui-shadow"></div>').appendTo(document.body);
            this.cfg.itemtipMyPosition = this.cfg.itemtipMyPosition || "left top";
            this.cfg.itemtipAtPosition = this.cfg.itemtipAtPosition || "right bottom";
            this.cfg.checkForScrollbar = (this.cfg.itemtipAtPosition.indexOf("right") !== -1)
        }
        this.input.attr("aria-autocomplete", "list");
        this.jq.attr("role", "application");
        this.jq.append('<span role="status" aria-live="polite" class="ui-autocomplete-status ui-helper-hidden-accessible"></span>');
        this.status = this.jq.children(".ui-autocomplete-status")
    },
    appendPanel: function() {
        var a = this.cfg.appendTo ? PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.appendTo) : $(document.body);
        if (!a.is(this.jq)) {
            a.children(this.panelId).remove();
            this.panel.appendTo(a)
        }
    },
    initCache: function() {
        this.cache = {};
        var a = this;
        this.cacheTimeout = setInterval(function() {
            a.clearCache()
        }, this.cfg.cacheTimeout)
    },
    clearCache: function() {
        this.cache = {}
    },
    setupMultipleMode: function() {
        var b = this;
        this.multiItemContainer = this.jq.children("ul");
        this.inputContainer = this.multiItemContainer.children(".ui-autocomplete-input-token");
        this.multiItemContainer.hover(function() {
            $(this).addClass("ui-state-hover")
        }, function() {
            $(this).removeClass("ui-state-hover")
        }).click(function() {
            b.input.focus()
        });
        this.input.focus(function() {
            b.multiItemContainer.addClass("ui-state-focus")
        }).blur(function(c) {
            b.multiItemContainer.removeClass("ui-state-focus")
        });
        var a = "> li.ui-autocomplete-token > .ui-autocomplete-token-icon";
        this.multiItemContainer.off("click", a).on("click", a, null, function(c) {
            if (b.multiItemContainer.children("li.ui-autocomplete-token").length === b.cfg.selectLimit) {
                b.input.css("display", "inline");
                b.enableDropdown()
            }
            b.removeItem(c, $(this).parent())
        })
    },
    bindStaticEvents: function() {
        var a = this;
        this.bindKeyEvents();
        this.bindDropdownEvents();
        if (PrimeFaces.env.browser.mobile) {
            this.dropdown.bind("touchstart", function() {
                a.touchToDropdownButton = true
            })
        }
        this.hideNS = "mousedown." + this.id;
        $(document.body).off(this.hideNS).on(this.hideNS, function(c) {
            if (a.panel.is(":hidden")) {
                return
            }
            var b = $(c.target);
            if (a.panel.has(b).length == 0) {
                if (a.itemtip) {
                    if (a.itemtip.has(b).length == 0) {
                        a.hide()
                    }
                } else {
                    a.hide()
                }
            }
        });
        this.resizeNS = "resize." + this.id;
        $(window).off(this.resizeNS).on(this.resizeNS, function(b) {
            if (a.panel.is(":visible")) {
                a.alignPanel()
            }
        })
    },
    bindDropdownEvents: function() {
        var a = this;
        this.dropdown.mouseover(function() {
            $(this).addClass("ui-state-hover")
        }).mouseout(function() {
            $(this).removeClass("ui-state-hover")
        }).mousedown(function() {
            if (a.active) {
                $(this).addClass("ui-state-active")
            }
        }).mouseup(function() {
            if (a.active) {
                $(this).removeClass("ui-state-active");
                a.searchWithDropdown();
                a.input.focus()
            }
        }).focus(function() {
            $(this).addClass("ui-state-focus")
        }).blur(function() {
            $(this).removeClass("ui-state-focus")
        }).keydown(function(d) {
            var c = $.ui.keyCode
              , b = d.which;
            if (b === c.SPACE || b === c.ENTER || b === c.NUMPAD_ENTER) {
                $(this).addClass("ui-state-active")
            }
        }).keyup(function(d) {
            var c = $.ui.keyCode
              , b = d.which;
            if (b === c.SPACE || b === c.ENTER || b === c.NUMPAD_ENTER) {
                $(this).removeClass("ui-state-active");
                a.searchWithDropdown();
                a.input.focus();
                d.preventDefault();
                d.stopPropagation()
            }
        })
    },
    disableDropdown: function() {
        if (this.dropdown.length) {
            this.dropdown.off().prop("disabled", true).addClass("ui-state-disabled")
        }
    },
    enableDropdown: function() {
        if (this.dropdown.length && this.dropdown.prop("disabled")) {
            this.bindDropdownEvents();
            this.dropdown.prop("disabled", false).removeClass("ui-state-disabled")
        }
    },
    bindKeyEvents: function() {
        var a = this;
        if (this.cfg.queryEvent !== "enter") {
            this.input.on("input propertychange", function(b) {
                a.processKeyEvent(b)
            })
        }
        this.input.on("keyup.autoComplete", function(f) {
            var d = $.ui.keyCode
              , b = f.which;
            if (PrimeFaces.env.isIE(9) && (b === d.BACKSPACE || b === d.DELETE)) {
                a.processKeyEvent(f)
            }
            if (a.cfg.queryEvent === "enter" && (b === d.ENTER || b === d.NUMPAD_ENTER)) {
                if (a.itemSelectedWithEnter) {
                    a.itemSelectedWithEnter = false
                } else {
                    a.search(a.input.val())
                }
            }
            if (a.panel.is(":visible")) {
                if (b === d.ESCAPE) {
                    a.hide()
                } else {
                    if (b === d.UP || b === d.DOWN) {
                        var c = a.items.filter(".ui-state-highlight");
                        if (c.length) {
                            a.displayAriaStatus(c.data("item-label"))
                        }
                    }
                }
            }
            a.checkMatchedItem = true;
            a.isTabPressed = false
        }).on("keydown.autoComplete", function(g) {
            var f = $.ui.keyCode;
            a.suppressInput = false;
            if (a.panel.is(":visible")) {
                var d = a.items.filter(".ui-state-highlight");
                switch (g.which) {
                case f.UP:
                    var c = d.length == 0 ? a.items.eq(0) : d.prevAll(".ui-autocomplete-item:first");
                    if (c.length == 1) {
                        d.removeClass("ui-state-highlight");
                        c.addClass("ui-state-highlight");
                        if (a.cfg.scrollHeight) {
                            PrimeFaces.scrollInView(a.panel, c)
                        }
                        if (a.cfg.itemtip) {
                            a.showItemtip(c)
                        }
                    }
                    g.preventDefault();
                    break;
                case f.DOWN:
                    var b = d.length == 0 ? a.items.eq(0) : d.nextAll(".ui-autocomplete-item:first");
                    if (b.length == 1) {
                        d.removeClass("ui-state-highlight");
                        b.addClass("ui-state-highlight");
                        if (a.cfg.scrollHeight) {
                            PrimeFaces.scrollInView(a.panel, b)
                        }
                        if (a.cfg.itemtip) {
                            a.showItemtip(b)
                        }
                    }
                    g.preventDefault();
                    break;
                case f.ENTER:
                case f.NUMPAD_ENTER:
                    if (a.timeout) {
                        a.deleteTimeout()
                    }
                    if (d.length > 0) {
                        d.click();
                        a.itemSelectedWithEnter = true
                    }
                    g.preventDefault();
                    g.stopPropagation();
                    break;
                case 18:
                case 224:
                    break;
                case f.TAB:
                    if (d.length) {
                        d.trigger("click")
                    }
                    a.hide();
                    a.isTabPressed = true;
                    break
                }
            } else {
                switch (g.which) {
                case f.TAB:
                    if (a.timeout) {
                        a.deleteTimeout()
                    }
                    a.isTabPressed = true;
                    break;
                case f.ENTER:
                case f.NUMPAD_ENTER:
                    if (a.cfg.queryEvent === "enter" || (a.timeout > 0) || a.querying) {
                        g.preventDefault()
                    }
                    break;
                case f.BACKSPACE:
                    if (a.cfg.multiple && !a.input.val().length) {
                        a.removeItem(g, $(this).parent().prev());
                        g.preventDefault()
                    }
                    break
                }
            }
        }).on("paste.autoComplete", function() {
            a.suppressInput = false;
            a.checkMatchedItem = true
        })
    },
    bindDynamicEvents: function() {
        var a = this;
        this.items.on("mouseover", function() {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                a.items.filter(".ui-state-highlight").removeClass("ui-state-highlight");
                b.addClass("ui-state-highlight");
                if (a.cfg.itemtip) {
                    a.showItemtip(b)
                }
            }
        }).on("click", function(b) { 
            // this is the functio that get triggered when selecting a value wihth a click
            var i = $(this)
              , e = i.attr("data-item-value")
              , g = i.hasClass("ui-autocomplete-moretext")
              , h = PrimeFaces.escapeHTML(e.replace(/\"/g, "'"));
            if (g) {
                a.input.focus();
                a.invokeMoreTextBehavior()
            } else {
                if (a.cfg.multiple) {
                    var j = false;
                    if (a.cfg.unique) {
                        j = a.multiItemContainer.children("li[data-token-value='" + h + "']").length != 0
                    }
                    if (!j) {
                        var d = i.attr("data-item-class");
                        var f = '<li data-token-value="' + h;
                        f += '"class="ui-autocomplete-token ui-state-active ui-corner-all ui-helper-hidden';
                        f += (d === "" ? "" : " " + d) + '">';
                        f += '<span class="ui-autocomplete-token-icon ui-icon ui-icon-close" />';
                        f += '<span class="ui-autocomplete-token-label">' + i.attr("data-item-label") + "</span></li>";
                        a.inputContainer.before(f);
                        a.multiItemContainer.children(".ui-helper-hidden").fadeIn();
                        a.input.val("");
                        a.hinput.append('<option value="' + h + '" selected="selected"></option>');
                        if (a.multiItemContainer.children("li.ui-autocomplete-token").length >= a.cfg.selectLimit) {
                            a.input.css("display", "none").blur();
                            a.disableDropdown()
                        }
                        a.invokeItemSelectBehavior(b, e)
                    }
                } else {
                    a.input.val(i.attr("data-item-label"));
                    this.currentText = a.input.val();
                    this.previousText = a.input.val();
                    if (a.cfg.pojo) {
                        a.hinput.val(e)
                    }
                    if (PrimeFaces.env.isLtIE(10)) {
                        var c = a.input.val().length;
                        a.input.setSelection(c, c)
                    } //
                    a.invokeItemSelectBehavior(b, e)
                }
                if (!a.isTabPressed) {
                    a.input.focus()
                }
            }
            a.hide()
        }).on("mousedown", function() {
            a.checkMatchedItem = false
        });
        if (PrimeFaces.env.browser.mobile) {
            this.items.bind("touchstart", function() {
                if (!a.touchToDropdownButton) {
                    a.itemClick = true
                }
            })
        }
    },
    processKeyEvent: function(d) {
        var c = this;
        if (c.suppressInput) {
            d.preventDefault();
            return
        }
        if (PrimeFaces.env.browser.mobile) {
            c.touchToDropdownButton = false;
            if (c.itemClick) {
                c.itemClick = false;
                return
            }
        }
        var b = c.input.val();
        if (c.cfg.pojo && !c.cfg.multiple) {
            c.hinput.val(b)
        }
        if (!b.length) {
            c.hide();
            c.deleteTimeout()
        }
        if (b.length >= c.cfg.minLength) {
            if (c.timeout) {
                c.deleteTimeout()
            }
            var a = c.cfg.delay;
            c.timeout = setTimeout(function() {
                c.timeout = null;
                c.search(b)
            }, a)
        } else {
            if (b.length === 0) {
                if (c.timeout) {
                    c.deleteTimeout()
                }
                c.fireClearEvent()
            }
        }
    },
    showItemtip: function(c) {
        if (c.hasClass("ui-autocomplete-moretext")) {
            this.itemtip.hide()
        } else {
            var b;
            if (c.is("li")) {
                b = c.next(".ui-autocomplete-itemtip-content")
            } else {
                if (c.children("td:last").hasClass("ui-autocomplete-itemtip-content")) {
                    b = c.children("td:last")
                } else {
                    this.itemtip.hide();
                    return
                }
            }
            this.itemtip.html(b.html()).css({
                left: "",
                top: "",
                "z-index": ++PrimeFaces.zindex,
                width: b.outerWidth()
            }).position({
                my: this.cfg.itemtipMyPosition,
                at: this.cfg.itemtipAtPosition,
                of: c
            });
            if (this.cfg.checkForScrollbar) {
                if (this.panel.innerHeight() < this.panel.children(".ui-autocomplete-items").outerHeight(true)) {
                    var a = this.panel.offset();
                    this.itemtip.css("left", a.left + this.panel.outerWidth())
                }
            }
            this.itemtip.show()
        }
    },
    showSuggestions: function(c) {
        this.items = this.panel.find(".ui-autocomplete-item");
        this.items.attr("role", "option");
        if (this.cfg.grouping) {
            this.groupItems()
        }
        this.bindDynamicEvents();
        var e = this
          , b = this.panel.is(":hidden");
        if (b) {
            this.show()
        } else {
            this.alignPanel()
        }
        if (this.items.length > 0) {
            var d = this.items.eq(0);
            if (this.cfg.autoHighlight && d.length) {
                d.addClass("ui-state-highlight")
            }
            if (this.panel.children().is("ul") && c.length > 0) {
                this.items.filter(":not(.ui-autocomplete-moretext)").each(function() {
                    var g = $(this)
                      , i = g.html()
                      , f = new RegExp(PrimeFaces.escapeRegExp(c),"gi")
                      , h = i.replace(f, '<span class="ui-autocomplete-query">$&</span>');
                    g.html(h)
                })
            }
            if (this.cfg.forceSelection) {
                this.currentItems = [];
                this.items.each(function(f, g) {
                    e.currentItems.push($(g).attr("data-item-label"))
                })
            }
            if (this.cfg.autoHighlight && this.cfg.itemtip && d.length === 1) {
                this.showItemtip(d)
            }
            this.displayAriaStatus(this.items.length + this.cfg.resultsMessage)
        } else {
            if (this.cfg.emptyMessage) {
                var a = '<div class="ui-autocomplete-emptyMessage ui-widget">' + this.cfg.emptyMessage + "</div>";
                this.panel.html(a)
            } else {
                this.panel.hide()
            }
            this.displayAriaStatus(this.cfg.ariaEmptyMessage)
        }
    },
    searchWithDropdown: function() {
        if (this.cfg.dropdownMode === "current") {
            this.search(this.input.val())
        } else {
            this.search("")
        }
    },
    search: function(c) { // i think this is where it it is quering the name suggestions
        if (!this.cfg.active || c === undefined || c === null) {
            return
        }
        if (this.cfg.cache && this.cache[c]) {
            this.panel.html(this.cache[c]);
            this.showSuggestions(c);
            return
        }
        if (!this.active) {
            return
        }
        this.querying = true;
        var d = this;
        if (this.cfg.itemtip) {
            this.itemtip.hide()
        }
        var b = {
            source: this.id,
            process: this.id,
            update: this.id,
            formId: this.cfg.formId,
            onsuccess: function(g, e, f) { // this is the functions that searchs for the sugestion
                PrimeFaces.ajax.Response.handle(g, e, f, {
                    widget: d,
                    handle: function(h) {
                        if (this.cfg.dynamic && !this.isDynamicLoaded) {
                            this.panel = $(h);
                            this.appendPanel();
                            h = this.panel.get(0).innerHTML
                        } else {
                            this.panel.html(h)
                        }
                        if (this.cfg.cache) {
                            this.cache[c] = h
                        }
                        this.showSuggestions(c)
                    }
                });
                return true
            },
            oncomplete: function() {
                d.querying = false;
                d.isDynamicLoaded = true
            }
        };
        b.params = [{
            name: this.id + "_query",
            value: c
        }];
        if (this.cfg.dynamic && !this.isDynamicLoaded) {
            b.params.push({
                name: this.id + "_dynamicload",
                value: true
            })
        }
        if (this.hasBehavior("query")) {
            var a = this.cfg.behaviors.query;
            a.call(this, b)
        } else {
            PrimeFaces.ajax.AjaxRequest(b)
        }
    },
    show: function() {
        this.alignPanel();
        if (this.cfg.effect) {
            this.panel.show(this.cfg.effect, {}, this.cfg.effectDuration)
        } else {
            this.panel.show()
        }
    },
    hide: function() {
        this.panel.hide();
        this.panel.css("height", "auto");
        if (this.cfg.itemtip) {
            this.itemtip.hide()
        }
    },
    invokeItemSelectBehavior: function(b, d) {
        // this should bet the function that selects a compnay in the server 
        // and return a captchan... i should dig deeper
        if (this.cfg.behaviors) { // this cfg is a global widget obj. short 4 config?
            var c = this.cfg.behaviors.itemSelect; // this could be the itemSelect selected
            // or a function, or both
            if (c) { // could make sense that is making sure it is selected
                var a = {
                    params: [{
                        name: this.id + "_itemSelect", // is the id of the item to select
                        value: d // d is is th name of the company 
                    }]
                };
                c.call(this, a) // looks like it sending a request, where c is the function 
                //a the paramters
            }
        }
    },
    invokeItemUnselectBehavior: function(c, d) {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.itemUnselect;
            if (a) {
                var b = {
                    params: [{
                        name: this.id + "_itemUnselect",
                        value: d
                    }]
                };
                a.call(this, b)
            }
        }
    },
    invokeMoreTextBehavior: function() {
        if (this.cfg.behaviors) {
            var b = this.cfg.behaviors.moreText;
            if (b) {
                var a = {
                    params: [{
                        name: this.id + "_moreText",
                        value: true
                    }]
                };
                b.call(this, a)
            }
        }
    },
    removeItem: function(c, b) {
        var e = b.attr("data-token-value")
          , a = this.multiItemContainer.children("li.ui-autocomplete-token").index(b)
          , d = this;
        this.hinput.children("option").eq(a).remove();
        b.fadeOut("fast", function() {
            var f = $(this);
            f.remove();
            d.invokeItemUnselectBehavior(c, e)
        })
    },
    setupForceSelection: function() {
        this.currentItems = [this.input.val()];
        var a = this;
        this.input.blur(function() {
            var f = $(this).val()
              , d = false;
            for (var c = 0; c < a.currentItems.length; c++) {
                var b = a.currentItems[c];
                if (b) {
                    b = b.replace(/\r?\n/g, "")
                }
                if (b === f) {
                    d = true;
                    break
                }
            }
            if (!d) {
                a.input.val("");
                if (!a.cfg.multiple) {
                    a.hinput.val("")
                }
            }
            if (a.cfg.autoSelection && d && a.checkMatchedItem && a.items && !a.isTabPressed && !a.itemSelectedWithEnter) {
                var e = a.items.filter('[data-item-label="' + f + '"]');
                if (e.length) {
                    e.click()
                }
            }
            a.checkMatchedItem = false
        })
    },
    disable: function() {
        this.input.addClass("ui-state-disabled").prop("disabled", true);
        if (this.dropdown.length) {
            this.dropdown.addClass("ui-state-disabled").prop("disabled", true)
        }
    },
    enable: function() {
        this.input.removeClass("ui-state-disabled").prop("disabled", false);
        if (this.dropdown.length) {
            this.dropdown.removeClass("ui-state-disabled").prop("disabled", false)
        }
    },
    close: function() {
        this.hide()
    },
    deactivate: function() {
        this.active = false
    },
    activate: function() {
        this.active = true
    },
    alignPanel: function() {
        var c = null;
        if (this.cfg.multiple) {
            c = this.multiItemContainer.innerWidth() - (this.input.position().left - this.multiItemContainer.position().left)
        } else {
            if (this.panel.is(":visible")) {
                c = this.panel.children(".ui-autocomplete-items").outerWidth()
            } else {
                this.panel.css({
                    visibility: "hidden",
                    display: "block"
                });
                c = this.panel.children(".ui-autocomplete-items").outerWidth();
                this.panel.css({
                    visibility: "visible",
                    display: "none"
                })
            }
            var b = this.input.outerWidth();
            if (c < b) {
                c = b
            }
        }
        if (this.cfg.scrollHeight) {
            var a = this.panel.is(":hidden") ? this.panel.height() : this.panel.children().height();
            if (a > this.cfg.scrollHeight) {
                this.panel.height(this.cfg.scrollHeight)
            } else {
                this.panel.css("height", "auto")
            }
        }
        this.panel.css({
            left: "",
            top: "",
            width: c,
            "z-index": ++PrimeFaces.zindex
        });
        if (this.panel.parent().is(this.jq)) {
            this.panel.css({
                left: 0,
                top: this.jq.innerHeight()
            })
        } else {
            this.panel.position({
                my: this.cfg.myPos,
                at: this.cfg.atPos,
                of: this.cfg.multiple ? this.jq : this.input,
                collision: "flipfit"
            })
        }
    },
    displayAriaStatus: function(a) {
        this.status.html("<div>" + a + "</div>")
    },
    groupItems: function() {
        var b = this;
        if (this.items.length) {
            this.itemContainer = this.panel.children(".ui-autocomplete-items");
            var a = this.items.eq(0);
            if (!a.hasClass("ui-autocomplete-moretext")) {
                this.currentGroup = a.data("item-group");
                var c = a.data("item-group-tooltip");
                a.before(this.getGroupItem(b.currentGroup, b.itemContainer, c))
            }
            this.items.filter(":not(.ui-autocomplete-moretext)").each(function(e) {
                var f = b.items.eq(e)
                  , g = f.data("item-group")
                  , d = f.data("item-group-tooltip");
                if (b.currentGroup !== g) {
                    b.currentGroup = g;
                    f.before(b.getGroupItem(g, b.itemContainer, d))
                }
            })
        }
    },
    getGroupItem: function(d, a, c) {
        var b = null;
        if (a.is(".ui-autocomplete-table")) {
            if (!this.colspan) {
                this.colspan = this.items.eq(0).children("td").length
            }
            b = $('<tr class="ui-autocomplete-group ui-widget-header"><td colspan="' + this.colspan + '">' + d + "</td></tr>")
        } else {
            b = $('<li class="ui-autocomplete-group ui-autocomplete-list-item ui-widget-header">' + d + "</li>")
        }
        if (b) {
            b.attr("title", c)
        }
        return b
    },
    deleteTimeout: function() {
        clearTimeout(this.timeout);
        this.timeout = null
    },
    fireClearEvent: function() {
        if (this.hasBehavior("clear")) {
            var a = this.cfg.behaviors.clear;
            a.call(this)
        }
    }
});



PrimeFaces.widget.BlockUI = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this.cfg = a;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.block = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.block);
        this.content = $(this.jqId);
        this.cfg.animate = (this.cfg.animate === false) ? false : true;
        this.cfg.blocked = (this.cfg.blocked === true) ? true : false;
        this.render();
        if (this.cfg.triggers) {
            this.bindTriggers()
        }
        if (this.cfg.blocked) {
            this.show()
        }
        this.removeScriptElement(this.id)
    },
    refresh: function(a) {
        this.blocker.remove();
        this.block.children(".ui-blockui-content").remove();
        $(document).off("pfAjaxSend." + this.id + " pfAjaxComplete." + this.id);
        this._super(a)
    },
    bindTriggers: function() {
        var a = this;
        $(document).on("pfAjaxSend." + this.id, function(f, g, c) {
            var d = $.type(c.source) === "string" ? c.source : c.source.name;
            var b = PrimeFaces.expressions.SearchExpressionFacade.resolveComponents(a.cfg.triggers);
            if ($.inArray(d, b) !== -1 && !a.cfg.blocked) {
                a.show()
            }
        });
        $(document).on("pfAjaxComplete." + this.id, function(f, g, c) {
            var d = $.type(c.source) === "string" ? c.source : c.source.name;
            var b = PrimeFaces.expressions.SearchExpressionFacade.resolveComponents(a.cfg.triggers);
            if ($.inArray(d, b) !== -1 && !a.cfg.blocked) {
                a.hide()
            }
        })
    },
    show: function() {
        this.blocker.css("z-index", ++PrimeFaces.zindex);
        for (var b = 0; b < this.block.length; b++) {
            var a = $(this.blocker[b])
              , c = $(this.content[b]);
            c.css({
                left: (a.width() - c.outerWidth()) / 2,
                top: (a.height() - c.outerHeight()) / 2,
                "z-index": ++PrimeFaces.zindex
            })
        }
        if (this.cfg.animate) {
            this.blocker.fadeIn()
        } else {
            this.blocker.show()
        }
        if (this.hasContent()) {
            if (this.cfg.animate) {
                this.content.fadeIn()
            } else {
                this.content.show()
            }
        }
        this.block.attr("aria-busy", true)
    },
    hide: function() {
        if (this.cfg.animate) {
            this.blocker.fadeOut()
        } else {
            this.blocker.hide()
        }
        if (this.hasContent()) {
            if (this.cfg.animate) {
                this.content.fadeOut()
            } else {
                this.content.hide()
            }
        }
        this.block.attr("aria-busy", false)
    },
    render: function() {
        this.blocker = $('<div id="' + this.id + '_blocker" class="ui-blockui ui-widget-overlay ui-helper-hidden"></div>');
        if (this.cfg.styleClass) {
            this.blocker.addClass(this.cfg.styleClass)
        }
        if (this.block.hasClass("ui-corner-all")) {
            this.blocker.addClass("ui-corner-all")
        }
        if (this.block.length > 1) {
            this.content = this.content.clone()
        }
        this.block.css("position", "relative").attr("aria-busy", this.cfg.blocked).append(this.blocker).append(this.content);
        if (this.block.length > 1) {
            this.blocker = $(PrimeFaces.escapeClientId(this.id + "_blocker"));
            this.content = this.block.children(".ui-blockui-content")
        }
    },
    hasContent: function() {
        return this.content.contents().length > 0
    }
});
PrimeFaces.widget.Calendar = PrimeFaces.widget.BaseWidget.extend({
    init: function(b) {
        this._super(b);
        this.input = $(this.jqId + "_input");
        this.jqEl = this.cfg.popup ? this.input : $(this.jqId + "_inline");
        var a = this;
        this.configureLocale();
        this.bindDateSelectListener();
        this.bindViewChangeListener();
        this.bindCloseListener();
        this.cfg.beforeShowDay = function(h) {
            if (a.cfg.preShowDay) {
                return a.cfg.preShowDay(h)
            } else {
                if (a.cfg.disabledWeekends) {
                    return $.datepicker.noWeekends(h)
                } else {
                    return [true, ""]
                }
            }
        }
        ;
        var f = this.hasTimePicker();
        if (f) {
            this.configureTimePicker()
        }
        if (this.cfg.popup) {
            PrimeFaces.skinInput(this.jqEl);
            if (this.cfg.behaviors) {
                PrimeFaces.attachBehaviors(this.jqEl, this.cfg.behaviors)
            }
            this.cfg.beforeShow = function(h, j) {
                if (a.refocusInput) {
                    a.refocusInput = false;
                    return false
                }
                setTimeout(function() {
                    $("#ui-datepicker-div").addClass("ui-input-overlay").css("z-index", ++PrimeFaces.zindex);
                    if (a.cfg.showTodayButton === false) {
                        $(h).datepicker("widget").find(".ui-datepicker-current").hide()
                    }
                }, 1);
                if (PrimeFaces.env.touch && !a.input.attr("readonly") && a.cfg.showOn && a.cfg.showOn === "button") {
                    $(this).prop("readonly", true)
                }
                var i = a.cfg.preShow;
                if (i) {
                    return a.cfg.preShow.call(a, h, j)
                }
            }
        }
        if (PrimeFaces.env.touch && !this.input.attr("readonly") && this.cfg.showOn && this.cfg.showOn === "button") {
            this.cfg.onClose = function(i, h) {
                $(this).attr("readonly", false)
            }
        }
        if (f) {
            if (this.cfg.timeOnly) {
                this.jqEl.timepicker(this.cfg)
            } else {
                this.jqEl.datetimepicker(this.cfg)
            }
        } else {
            this.jqEl.datepicker(this.cfg)
        }
        if (this.cfg.popup && this.cfg.showOn) {
            var e = this.jqEl.siblings(".ui-datepicker-trigger:button");
            e.attr("aria-label", PrimeFaces.getAriaLabel("calendar.BUTTON")).attr("aria-haspopup", true).html("").addClass("ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only").append('<span class="ui-button-icon-left ui-icon ui-icon-calendar"></span><span class="ui-button-text">ui-button</span>');
            var g = this.jqEl.attr("title");
            if (g) {
                e.attr("title", g)
            }
            if (this.cfg.disabled) {
                e.addClass("ui-state-disabled")
            }
            var d = this.cfg.buttonTabindex || this.jqEl.attr("tabindex");
            if (d) {
                e.attr("tabindex", d)
            }
            PrimeFaces.skinButton(e);
            $("#ui-datepicker-div").addClass("ui-shadow");
            this.jq.addClass("ui-trigger-calendar")
        }
        if (this.cfg.popup) {
            this.jq.data("primefaces-overlay-target", this.id).find("*").data("primefaces-overlay-target", this.id)
        }
        if (!this.cfg.popup && this.cfg.showTodayButton === false) {
            this.jqEl.parent().find(".ui-datepicker-current").hide()
        }
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        if (this.cfg.mask) {
            var c = {
                placeholder: this.cfg.maskSlotChar || "_",
                autoclear: this.cfg.maskAutoClear
            };
            this.input.mask(this.cfg.mask, c)
        }
    },
    refresh: function(a) {
        if (a.popup && $.datepicker._lastInput && (a.id + "_input") === $.datepicker._lastInput.id) {
            $.datepicker._hideDatepicker()
        }
        this.init(a)
    },
    configureLocale: function() {
        var a = PrimeFaces.locales[this.cfg.locale];
        if (a) {
            for (var b in a) {
                this.cfg[b] = a[b]
            }
        }
    },
    bindDateSelectListener: function() {
        var a = this;
        this.cfg.onSelect = function() {
            if (a.cfg.popup) {
                a.fireDateSelectEvent();
                if (a.cfg.focusOnSelect) {
                    a.refocusInput = true;
                    a.jqEl.focus();
                    if (!(a.cfg.showOn && a.cfg.showOn === "button")) {
                        a.jqEl.off("click.calendar").on("click.calendar", function() {
                            $(this).datepicker("show")
                        })
                    }
                    setTimeout(function() {
                        a.refocusInput = false
                    }, 10)
                }
            } else {
                var b = a.cfg.timeOnly ? "" : $.datepicker.formatDate(a.cfg.dateFormat, a.getDate());
                if (a.cfg.timeFormat) {
                    b += " " + a.jqEl.find(".ui_tpicker_time_input")[0].value
                }
                a.input.val(b);
                a.fireDateSelectEvent()
            }
        }
    },
    fireDateSelectEvent: function() {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.dateSelect;
            if (a) {
                a.call(this)
            }
        }
    },
    bindViewChangeListener: function() {
        if (this.hasBehavior("viewChange")) {
            var a = this;
            this.cfg.onChangeMonthYear = function(b, c) {
                a.fireViewChangeEvent(b, c)
            }
        }
    },
    fireViewChangeEvent: function(b, c) {
        if (this.cfg.behaviors) {
            var d = this.cfg.behaviors.viewChange;
            if (d) {
                var a = {
                    params: [{
                        name: this.id + "_month",
                        value: c
                    }, {
                        name: this.id + "_year",
                        value: b
                    }]
                };
                d.call(this, a)
            }
        }
    },
    bindCloseListener: function() {
        if (this.hasBehavior("close")) {
            var a = this;
            this.cfg.onClose = function() {
                a.fireCloseEvent()
            }
        }
    },
    fireCloseEvent: function() {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.close;
            if (a) {
                a.call(this)
            }
        }
    },
    configureTimePicker: function() {
        var b = this.cfg.dateFormat
          , a = b.toLowerCase().indexOf("h");
        this.cfg.dateFormat = b.substring(0, a - 1);
        this.cfg.timeFormat = b.substring(a, b.length);
        if (this.cfg.timeFormat.indexOf("TT") != -1) {
            this.cfg.ampm = true
        }
        if (this.cfg.minDate) {
            this.cfg.minDate = $.datepicker.parseDateTime(this.cfg.dateFormat, this.cfg.timeFormat, this.cfg.minDate, {}, {})
        }
        if (this.cfg.maxDate) {
            this.cfg.maxDate = $.datepicker.parseDateTime(this.cfg.dateFormat, this.cfg.timeFormat, this.cfg.maxDate, {}, {})
        }
        if (!this.cfg.showButtonPanel) {
            this.cfg.showButtonPanel = false
        }
        if (this.cfg.controlType == "custom" && this.cfg.timeControlObject) {
            this.cfg.controlType = this.cfg.timeControlObject
        }
        if (this.cfg.showHour) {
            this.cfg.showHour = (this.cfg.showHour == "true") ? true : false
        }
        if (this.cfg.showMinute) {
            this.cfg.showMinute = (this.cfg.showMinute == "true") ? true : false
        }
        if (this.cfg.showSecond) {
            this.cfg.showSecond = (this.cfg.showSecond == "true") ? true : false
        }
        if (this.cfg.showMillisec) {
            this.cfg.showMillisec = (this.cfg.showMillisec == "true") ? true : false
        }
    },
    hasTimePicker: function() {
        return this.cfg.dateFormat.toLowerCase().indexOf("h") != -1
    },
    setDate: function(a) {
        this.jqEl.datetimepicker("setDate", a)
    },
    getDate: function() {
        return this.jqEl.datetimepicker("getDate")
    },
    enable: function() {
        this.jqEl.datetimepicker("enable")
    },
    disable: function() {
        this.jqEl.datetimepicker("disable")
    }
});
PrimeFaces.widget.Carousel = PrimeFaces.widget.DeferredWidget.extend({
    init: function(a) {
        this._super(a);
        this.viewport = this.jq.children(".ui-carousel-viewport");
        this.itemsContainer = this.viewport.children(".ui-carousel-items");
        this.items = this.itemsContainer.children("li");
        this.itemsCount = this.items.length;
        this.header = this.jq.children(".ui-carousel-header");
        this.prevNav = this.header.children(".ui-carousel-prev-button");
        this.nextNav = this.header.children(".ui-carousel-next-button");
        this.pageLinks = this.header.find("> .ui-carousel-page-links > .ui-carousel-page-link");
        this.dropdown = this.header.children(".ui-carousel-dropdown");
        this.mobileDropdown = this.header.children(".ui-carousel-mobiledropdown");
        this.stateholder = $(this.jqId + "_page");
        if (this.cfg.toggleable) {
            this.toggler = $(this.jqId + "_toggler");
            this.toggleStateHolder = $(this.jqId + "_collapsed");
            this.toggleableContent = this.jq.find(" > .ui-carousel-viewport > .ui-carousel-items, > .ui-carousel-footer")
        }
        this.cfg.numVisible = this.cfg.numVisible || 3;
        this.cfg.firstVisible = this.cfg.firstVisible || 0;
        this.columns = this.cfg.numVisible;
        this.first = this.cfg.firstVisible;
        this.cfg.effectDuration = this.cfg.effectDuration || 500;
        this.cfg.circular = this.cfg.circular || false;
        this.cfg.breakpoint = this.cfg.breakpoint || 640;
        this.page = parseInt(this.first / this.columns);
        this.totalPages = Math.ceil(this.itemsCount / this.cfg.numVisible);
        if (this.cfg.stateful) {
            this.stateKey = "carousel-" + this.id;
            this.restoreState()
        }
        this.renderDeferred()
    },
    _render: function() {
        this.updateNavigators();
        this.bindEvents();
        if (this.cfg.vertical) {
            this.calculateItemHeights()
        } else {
            if (this.cfg.responsive) {
                this.refreshDimensions()
            } else {
                this.calculateItemWidths(this.columns);
                this.jq.width(this.jq.width());
                this.updateNavigators()
            }
        }
        if (this.cfg.collapsed) {
            this.toggleableContent.hide()
        }
    },
    calculateItemWidths: function() {
        var b = this.items.eq(0);
        if (b.length) {
            var a = b.outerWidth(true) - b.width();
            this.items.width((this.viewport.innerWidth() - a * this.columns) / this.columns)
        }
    },
    calculateItemHeights: function() {
        var f = this.items.eq(0);
        if (f.length) {
            if (!this.cfg.responsive) {
                this.items.width(f.width());
                this.jq.width(this.jq.width());
                var e = 0;
                for (var c = 0; c < this.items.length; c++) {
                    var d = this.items.eq(c)
                      , a = d.height();
                    if (e < a) {
                        e = a
                    }
                }
                this.items.height(e)
            }
            var b = ((f.outerHeight(true) - f.outerHeight()) / 2) * (this.cfg.numVisible);
            this.viewport.height((f.outerHeight() * this.cfg.numVisible) + b);
            this.updateNavigators();
            this.itemsContainer.css("top", -1 * (this.viewport.innerHeight() * this.page))
        }
    },
    refreshDimensions: function() {
        var a = $(window);
        if (a.width() <= this.cfg.breakpoint) {
            this.columns = 1;
            this.calculateItemWidths(this.columns);
            this.totalPages = this.itemsCount;
            this.mobileDropdown.show();
            this.pageLinks.hide()
        } else {
            this.columns = this.cfg.numVisible;
            this.calculateItemWidths();
            this.totalPages = Math.ceil(this.itemsCount / this.cfg.numVisible);
            this.mobileDropdown.hide();
            this.pageLinks.show()
        }
        this.page = parseInt(this.first / this.columns);
        this.updateNavigators();
        this.itemsContainer.css("left", (-1 * (this.viewport.innerWidth() * this.page)))
    },
    bindEvents: function() {
        var b = this;
        this.prevNav.on("click", function() {
            if (b.page !== 0) {
                b.setPage(b.page - 1)
            } else {
                if (b.cfg.circular) {
                    b.setPage(b.totalPages - 1)
                }
            }
        });
        this.nextNav.on("click", function() {
            var c = (b.page === (b.totalPages - 1));
            if (!c) {
                b.setPage(b.page + 1)
            } else {
                if (b.cfg.circular) {
                    b.setPage(0)
                }
            }
        });
        this.itemsContainer.swipe({
            swipe: function(c, d) {
                if (d === "left") {
                    if (b.page === (b.totalPages - 1)) {
                        if (b.cfg.circular) {
                            b.setPage(0)
                        }
                    } else {
                        b.setPage(b.page + 1)
                    }
                } else {
                    if (d === "right") {
                        if (b.page === 0) {
                            if (b.cfg.circular) {
                                b.setPage(b.totalPages - 1)
                            }
                        } else {
                            b.setPage(b.page - 1)
                        }
                    }
                }
            },
            excludedElements: "button, input, select, textarea, a, .noSwipe"
        });
        if (this.pageLinks.length) {
            this.pageLinks.on("click", function(c) {
                b.setPage($(this).index());
                c.preventDefault()
            })
        }
        this.header.children("select").on("change", function() {
            b.setPage(parseInt($(this).val()) - 1)
        });
        if (this.cfg.autoplayInterval) {
            this.cfg.circular = true;
            this.startAutoplay()
        }
        if (this.cfg.responsive) {
            var a = "resize." + this.id;
            $(window).off(a).on(a, function() {
                if (b.cfg.vertical) {
                    b.calculateItemHeights()
                } else {
                    b.refreshDimensions()
                }
            })
        }
        if (this.cfg.toggleable) {
            this.toggler.on("mouseover.carouselToggler", function() {
                $(this).addClass("ui-state-hover")
            }).on("mouseout.carouselToggler", function() {
                $(this).removeClass("ui-state-hover")
            }).on("click.carouselToggler", function(c) {
                b.toggle();
                c.preventDefault()
            })
        }
    },
    updateNavigators: function() {
        if (!this.cfg.circular) {
            if (this.page === 0) {
                this.prevNav.addClass("ui-state-disabled");
                this.nextNav.removeClass("ui-state-disabled")
            } else {
                if (this.page === (this.totalPages - 1)) {
                    this.prevNav.removeClass("ui-state-disabled");
                    this.nextNav.addClass("ui-state-disabled")
                } else {
                    this.prevNav.removeClass("ui-state-disabled");
                    this.nextNav.removeClass("ui-state-disabled")
                }
            }
        }
        if (this.pageLinks.length) {
            this.pageLinks.filter(".ui-icon-radio-on").removeClass("ui-icon-radio-on");
            this.pageLinks.eq(this.page).addClass("ui-icon-radio-on")
        }
        if (this.dropdown.length) {
            this.dropdown.val(this.page + 1)
        }
        if (this.mobileDropdown.length) {
            this.mobileDropdown.val(this.page + 1)
        }
    },
    setPage: function(c) {
        if (c !== this.page && !this.itemsContainer.is(":animated")) {
            var b = this
              , a = this.cfg.vertical ? {
                top: -1 * (this.viewport.innerHeight() * c)
            } : {
                left: -1 * (this.viewport.innerWidth() * c)
            };
            a.easing = this.cfg.easing;
            this.itemsContainer.animate(a, {
                duration: this.cfg.effectDuration,
                easing: this.cfg.easing,
                complete: function() {
                    b.page = c;
                    b.first = b.page * b.columns;
                    b.updateNavigators();
                    b.stateholder.val(b.page);
                    if (b.cfg.stateful) {
                        b.saveState()
                    }
                }
            })
        }
    },
    startAutoplay: function() {
        var a = this;
        this.interval = setInterval(function() {
            if (a.page === (a.totalPages - 1)) {
                a.setPage(0)
            } else {
                a.setPage(a.page + 1)
            }
        }, this.cfg.autoplayInterval)
    },
    stopAutoplay: function() {
        clearInterval(this.interval)
    },
    toggle: function() {
        if (this.cfg.collapsed) {
            this.expand()
        } else {
            this.collapse()
        }
        PrimeFaces.invokeDeferredRenders(this.id)
    },
    expand: function() {
        this.toggleState(false, "ui-icon-plusthick", "ui-icon-minusthick");
        this.slideDown()
    },
    collapse: function() {
        this.toggleState(true, "ui-icon-minusthick", "ui-icon-plusthick");
        this.slideUp()
    },
    slideUp: function() {
        this.toggleableContent.slideUp(this.cfg.toggleSpeed, "easeInOutCirc")
    },
    slideDown: function() {
        this.toggleableContent.slideDown(this.cfg.toggleSpeed, "easeInOutCirc")
    },
    toggleState: function(c, b, a) {
        this.toggler.children("span.ui-icon").removeClass(b).addClass(a);
        this.cfg.collapsed = c;
        this.toggleStateHolder.val(c);
        if (this.cfg.stateful) {
            this.saveState()
        }
    },
    restoreState: function() {
        var carouselStateAsString = PrimeFaces.getCookie(this.stateKey) || "first: null, collapsed: null";
        this.carouselState = eval("({" + carouselStateAsString + "})");
        this.first = this.carouselState.first || this.first;
        this.page = parseInt(this.first / this.columns);
        this.stateholder.val(this.page);
        if (this.cfg.toggleable && (this.carouselState.collapsed === false || this.carouselState.collapsed === true)) {
            this.cfg.collapsed = !this.carouselState.collapsed;
            this.toggle()
        }
    },
    saveState: function() {
        var a = "first:" + this.first;
        if (this.cfg.toggleable) {
            a += ", collapsed: " + this.toggleStateHolder.val()
        }
        PrimeFaces.setCookie(this.stateKey, a, {
            path: "/"
        })
    },
    clearState: function() {
        if (this.cfg.stateful) {
            PrimeFaces.deleteCookie(this.stateKey, {
                path: "/"
            })
        }
    }
});
PrimeFaces.widget.ColumnToggler = PrimeFaces.widget.DeferredWidget.extend({
    init: function(b) {
        this._super(b);
        this.table = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.datasource);
        this.trigger = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.trigger);
        this.tableId = this.table.attr("id");
        this.hasFrozenColumn = this.table.hasClass("ui-datatable-frozencolumn");
        this.hasStickyHeader = this.table.hasClass("ui-datatable-sticky");
        var a = PrimeFaces.escapeClientId(this.tableId);
        if (this.hasFrozenColumn) {
            this.thead = $(a + "_frozenThead," + a + "_scrollableThead");
            this.tbody = $(a + "_frozenTbody," + a + "_scrollableTbody");
            this.tfoot = $(a + "_frozenTfoot," + a + "_scrollableTfoot");
            this.frozenColumnCount = this.thead.eq(0).children("tr").length
        } else {
            this.thead = $(a + "_head");
            this.tbody = $(a + "_data");
            this.tfoot = $(a + "_foot")
        }
        this.visible = false;
        this.render();
        this.bindEvents()
    },
    refresh: function(a) {
        var b = $("[id=" + a.id.replace(/:/g, "\\:") + "]");
        if (b.length > 1) {
            $(document.body).children(this.jqId).remove()
        }
        this.widthAligned = false;
        this.init(a)
    },
    render: function() {
        this.columns = this.thead.find("> tr > th:not(.ui-static-column)");
        this.panel = $("<div></div>").attr("id", this.cfg.id).attr("role", "dialog").addClass("ui-columntoggler ui-widget ui-widget-content ui-shadow ui-corner-all").append('<ul class="ui-columntoggler-items" role="group"></ul>').appendTo(document.body);
        this.itemContainer = this.panel.children("ul");
        var a = this.tableId + "_columnTogglerState";
        this.togglerStateHolder = $('<input type="hidden" id="' + a + '" name="' + a + '" autocomplete="off" />');
        this.table.append(this.togglerStateHolder);
        this.togglerState = [];
        for (var f = 0; f < this.columns.length; f++) {
            var c = this.columns.eq(f)
              , g = c.hasClass("ui-helper-hidden")
              , h = g ? "ui-chkbox-box ui-widget ui-corner-all ui-state-default" : "ui-chkbox-box ui-widget ui-corner-all ui-state-default ui-state-active"
              , k = (g) ? "ui-chkbox-icon ui-icon ui-icon-blank" : "ui-chkbox-icon ui-icon ui-icon-check"
              , l = c.children(".ui-column-title").text();
            this.hasPriorityColumns = c.is('[class*="ui-column-p-"]');
            var n = $('<li class="ui-columntoggler-item"><div class="ui-chkbox ui-widget"><div class="ui-helper-hidden-accessible"><input type="checkbox" role="checkbox"></div><div class="' + h + '"><span class="' + k + '"></span></div></div><label>' + l + "</label></li>").data("column", c.attr("id"));
            if (this.hasPriorityColumns) {
                var b = c.attr("class").split(" ");
                for (var e = 0; e < b.length; e++) {
                    var d = b[e]
                      , m = d.indexOf("ui-column-p-");
                    if (m !== -1) {
                        n.addClass(d.substring(m, m + 13))
                    }
                }
            }
            if (!g) {
                n.find("> .ui-chkbox > .ui-helper-hidden-accessible > input").prop("checked", true).attr("aria-checked", true)
            }
            n.appendTo(this.itemContainer);
            this.togglerState.push(c.attr("id") + "_" + !g)
        }
        this.togglerStateHolder.val(this.togglerState.join(","));
        this.closer = $('<a href="#" class="ui-columntoggler-close"><span class="ui-icon ui-icon-close"></span></a>').attr("aria-label", PrimeFaces.getAriaLabel("columntoggler.CLOSE")).prependTo(this.panel);
        if (this.panel.outerHeight() > 200) {
            this.panel.height(200)
        }
        this.hide()
    },
    bindEvents: function() {
        var c = this
          , b = "mousedown." + this.id
          , a = "resize." + this.id;
        this.trigger.off("click.ui-columntoggler").on("click.ui-columntoggler", function(d) {
            if (c.visible) {
                c.hide()
            } else {
                c.show()
            }
        });
        this.itemContainer.find("> .ui-columntoggler-item > .ui-chkbox > .ui-chkbox-box").on("mouseover.columnToggler", function() {
            var d = $(this);
            if (!d.hasClass("ui-state-active")) {
                d.addClass("ui-state-hover")
            }
        }).on("mouseout.columnToggler", function() {
            $(this).removeClass("ui-state-hover")
        }).on("click.columnToggler", function(d) {
            c.toggle($(this));
            d.preventDefault()
        });
        this.itemContainer.find("> .ui-columntoggler-item > label").on("click.selectCheckboxMenu", function(d) {
            c.toggle($(this).prev().children(".ui-chkbox-box"));
            PrimeFaces.clearSelection();
            d.preventDefault()
        });
        this.closer.on("click", function(d) {
            c.hide();
            c.trigger.focus();
            d.preventDefault()
        });
        this.bindKeyEvents();
        $(document.body).off(b).on(b, function(f) {
            if (!c.visible) {
                return
            }
            var d = $(f.target);
            if (c.trigger.is(d) || c.trigger.has(d).length) {
                return
            }
            var g = c.panel.offset();
            if (f.pageX < g.left || f.pageX > g.left + c.panel[0].offsetWidth || f.pageY < g.top || f.pageY > g.top + c.panel[0].offsetHeight) {
                c.hide()
            }
        });
        $(window).off(a).on(a, function() {
            if (c.visible) {
                c.alignPanel()
            }
        })
    },
    bindKeyEvents: function() {
        var b = this
          , a = this.itemContainer.find("> li > div.ui-chkbox > div.ui-helper-hidden-accessible > input");
        this.trigger.on("focus.columnToggler", function() {
            $(this).addClass("ui-state-focus")
        }).on("blur.columnToggler", function() {
            $(this).removeClass("ui-state-focus")
        }).on("keydown.columnToggler", function(f) {
            var d = $.ui.keyCode
              , c = f.which;
            switch (c) {
            case d.ENTER:
            case d.NUMPAD_ENTER:
                if (b.visible) {
                    b.hide()
                } else {
                    b.show()
                }
                f.preventDefault();
                break;
            case d.TAB:
                if (b.visible) {
                    b.itemContainer.children("li:not(.ui-state-disabled):first").find("div.ui-helper-hidden-accessible > input").trigger("focus");
                    f.preventDefault()
                }
                break
            }
        });
        a.on("focus.columnToggler", function() {
            var c = $(this)
              , d = c.parent().next();
            if (c.prop("checked")) {
                d.removeClass("ui-state-active")
            }
            d.addClass("ui-state-focus")
        }).on("blur.columnToggler", function(f) {
            var c = $(this)
              , d = c.parent().next();
            if (c.prop("checked")) {
                d.addClass("ui-state-active")
            }
            d.removeClass("ui-state-focus")
        }).on("keydown.columnToggler", function(d) {
            if (d.which === $.ui.keyCode.TAB) {
                var c = $(this).closest("li").index();
                if (d.shiftKey) {
                    if (c === 0) {
                        b.closer.focus()
                    } else {
                        a.eq(c - 1).focus()
                    }
                } else {
                    if (c === (b.columns.length - 1) && !d.shiftKey) {
                        b.closer.focus()
                    } else {
                        a.eq(c + 1).focus()
                    }
                }
                d.preventDefault()
            }
        }).on("change.columnToggler", function(f) {
            var c = $(this)
              , d = c.parent().next();
            if (c.prop("checked")) {
                b.check(d);
                d.removeClass("ui-state-active")
            } else {
                b.uncheck(d)
            }
        });
        this.closer.on("keydown.columnToggler", function(f) {
            var c = f.which
              , d = $.ui.keyCode;
            if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
                b.hide();
                b.trigger.focus();
                f.preventDefault()
            } else {
                if (c === d.TAB) {
                    if (f.shiftKey) {
                        a.eq(b.columns.length - 1).focus()
                    } else {
                        a.eq(0).focus()
                    }
                    f.preventDefault()
                }
            }
        })
    },
    toggle: function(a) {
        if (a.hasClass("ui-state-active")) {
            this.uncheck(a)
        } else {
            this.check(a)
        }
    },
    check: function(j) {
        j.addClass("ui-state-active").removeClass("ui-state-hover").children(".ui-chkbox-icon").addClass("ui-icon-check").removeClass("ui-icon-blank");
        var c = $(document.getElementById(j.closest("li.ui-columntoggler-item").data("column")))
          , e = c.index() + 1
          , h = this.hasFrozenColumn ? (c.hasClass("ui-frozen-column") ? this.thead.eq(0) : this.thead.eq(1)) : this.thead
          , d = this.hasFrozenColumn ? (c.hasClass("ui-frozen-column") ? this.tbody.eq(0) : this.tbody.eq(1)) : this.tbody
          , i = this.hasFrozenColumn ? (c.hasClass("ui-frozen-column") ? this.tfoot.eq(0) : this.tfoot.eq(1)) : this.tfoot;
        var g = h.children("tr")
          , b = g.find("th:nth-child(" + e + ")")
          , f = j.prev().children("input");
        f.prop("checked", true).attr("aria-checked", true);
        b.removeClass("ui-helper-hidden");
        $(PrimeFaces.escapeClientId(b.attr("id") + "_clone")).removeClass("ui-helper-hidden");
        d.children("tr").find("td:nth-child(" + e + ")").removeClass("ui-helper-hidden");
        i.children("tr").find("td:nth-child(" + e + ")").removeClass("ui-helper-hidden");
        if (this.hasFrozenColumn) {
            var a = g.children("th");
            if (a.length !== a.filter(".ui-helper-hidden").length) {
                h.closest("td").removeClass("ui-helper-hidden")
            }
            if (!c.hasClass("ui-frozen-column")) {
                e += this.frozenColumnCount
            }
        }
        if (this.hasStickyHeader) {
            $(PrimeFaces.escapeClientId(b.attr("id"))).removeClass("ui-helper-hidden")
        }
        this.changeTogglerState(c, true);
        this.fireToggleEvent(true, (e - 1));
        this.updateColspan()
    },
    uncheck: function(j) {
        j.removeClass("ui-state-active").children(".ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check");
        var c = $(document.getElementById(j.closest("li.ui-columntoggler-item").data("column")))
          , f = c.index() + 1
          , h = this.hasFrozenColumn ? (c.hasClass("ui-frozen-column") ? this.thead.eq(0) : this.thead.eq(1)) : this.thead
          , d = this.hasFrozenColumn ? (c.hasClass("ui-frozen-column") ? this.tbody.eq(0) : this.tbody.eq(1)) : this.tbody
          , i = this.hasFrozenColumn ? (c.hasClass("ui-frozen-column") ? this.tfoot.eq(0) : this.tfoot.eq(1)) : this.tfoot;
        var g = h.children("tr")
          , b = g.find("th:nth-child(" + f + ")")
          , e = j.prev().children("input");
        e.prop("checked", false).attr("aria-checked", false);
        b.addClass("ui-helper-hidden");
        $(PrimeFaces.escapeClientId(b.attr("id") + "_clone")).addClass("ui-helper-hidden");
        d.children("tr").find("td:nth-child(" + f + ")").addClass("ui-helper-hidden");
        i.children("tr").find("td:nth-child(" + f + ")").addClass("ui-helper-hidden");
        if (this.hasFrozenColumn) {
            var a = g.children("th");
            if (a.length === a.filter(":hidden").length) {
                h.closest("td").addClass("ui-helper-hidden")
            }
            if (!c.hasClass("ui-frozen-column")) {
                f += this.frozenColumnCount
            }
        }
        if (this.hasStickyHeader) {
            $(PrimeFaces.escapeClientId(b.attr("id"))).addClass("ui-helper-hidden")
        }
        this.changeTogglerState(c, false);
        this.fireToggleEvent(false, (f - 1));
        this.updateColspan()
    },
    alignPanel: function() {
        this.panel.css({
            left: "",
            top: "",
            "z-index": ++PrimeFaces.zindex
        }).position({
            my: "left top",
            at: "left bottom",
            of: this.trigger
        });
        if (this.hasPriorityColumns) {
            if (this.panel.outerWidth() <= this.trigger.outerWidth()) {
                this.panel.css("width", "auto")
            }
            this.widthAligned = false
        }
        if (!this.widthAligned && (this.panel.outerWidth() < this.trigger.outerWidth())) {
            this.panel.width(this.trigger.width());
            this.widthAligned = true
        }
    },
    show: function() {
        this.alignPanel();
        this.panel.show();
        this.visible = true;
        this.trigger.attr("aria-expanded", true);
        this.closer.trigger("focus")
    },
    hide: function() {
        this.panel.fadeOut("fast");
        this.visible = false;
        this.trigger.attr("aria-expanded", false)
    },
    fireToggleEvent: function(e, c) {
        if (this.cfg.behaviors) {
            var b = this.cfg.behaviors.toggle;
            if (b) {
                var a = e ? "VISIBLE" : "HIDDEN"
                  , d = {
                    params: [{
                        name: this.id + "_visibility",
                        value: a
                    }, {
                        name: this.id + "_index",
                        value: c
                    }]
                };
                b.call(this, d)
            }
        }
    },
    updateColspan: function() {
        var a = this.tbody.children("tr:first");
        if (a && a.hasClass("ui-datatable-empty-message")) {
            var b = this.itemContainer.find("> .ui-columntoggler-item > .ui-chkbox > .ui-chkbox-box.ui-state-active");
            if (b.length) {
                a.children("td").removeClass("ui-helper-hidden").attr("colspan", b.length)
            } else {
                a.children("td").addClass("ui-helper-hidden")
            }
        }
    },
    changeTogglerState: function(e, d) {
        if (e && e.length) {
            var c = this.togglerStateHolder.val()
              , f = e.attr("id")
              , a = f + "_" + !d
              , b = f + "_" + d;
            this.togglerStateHolder.val(c.replace(a, b))
        }
    }
});
PrimeFaces.widget.Dashboard = PrimeFaces.widget.BaseWidget.extend({
    init: function(b) {
        this._super(b);
        this.cfg.connectWith = this.jqId + " .ui-dashboard-column";
        this.cfg.placeholder = "ui-state-hover";
        this.cfg.forcePlaceholderSize = true;
        this.cfg.revert = false;
        this.cfg.handle = ".ui-panel-titlebar";
        var a = this;
        if (this.cfg.behaviors) {
            var c = this.cfg.behaviors.reorder;
            if (c) {
                this.cfg.update = function(h, g) {
                    if (this === g.item.parent()[0]) {
                        var f = g.item.parent().children().filter(":not(script):visible").index(g.item)
                          , i = g.item.parent().parent().children().index(g.item.parent());
                        var d = {
                            params: [{
                                name: a.id + "_reordered",
                                value: true
                            }, {
                                name: a.id + "_widgetId",
                                value: g.item.attr("id")
                            }, {
                                name: a.id + "_itemIndex",
                                value: f
                            }, {
                                name: a.id + "_receiverColumnIndex",
                                value: i
                            }]
                        };
                        if (g.sender) {
                            d.params.push({
                                name: a.id + "_senderColumnIndex",
                                value: g.sender.parent().children().index(g.sender)
                            })
                        }
                        c.call(a, d)
                    }
                }
            }
        }
        $(this.jqId + " .ui-dashboard-column").sortable(this.cfg)
    }
});
PrimeFaces.widget.DataGrid = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        this.cfg.formId = $(this.jqId).closest("form").attr("id");
        this.content = $(this.jqId + "_content");
        if (this.cfg.paginator) {
            this.setupPaginator()
        }
    },
    setupPaginator: function() {
        var a = this;
        this.cfg.paginator.paginate = function(b) {
            a.handlePagination(b)
        }
        ;
        this.paginator = new PrimeFaces.widget.Paginator(this.cfg.paginator)
    },
    handlePagination: function(d) {
        var c = this
          , b = {
            source: this.id,
            update: this.id,
            process: this.id,
            formId: this.cfg.formId,
            params: [{
                name: this.id + "_pagination",
                value: true
            }, {
                name: this.id + "_first",
                value: d.first
            }, {
                name: this.id + "_rows",
                value: d.rows
            }],
            onsuccess: function(g, e, f) {
                PrimeFaces.ajax.Response.handle(g, e, f, {
                    widget: c,
                    handle: function(h) {
                        this.content.html(h)
                    }
                });
                return true
            },
            oncomplete: function() {
                c.paginator.cfg.page = d.page;
                c.paginator.updateUI()
            }
        };
        if (this.hasBehavior("page")) {
            var a = this.cfg.behaviors.page;
            a.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    getPaginator: function() {
        return this.paginator
    }
});
PrimeFaces.widget.DataList = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        this.cfg.formId = $(this.jqId).parents("form:first").attr("id");
        this.content = $(this.jqId + "_content");
        if (this.cfg.paginator) {
            this.setupPaginator()
        }
    },
    setupPaginator: function() {
        var a = this;
        this.cfg.paginator.paginate = function(b) {
            a.handlePagination(b)
        }
        ;
        this.paginator = new PrimeFaces.widget.Paginator(this.cfg.paginator)
    },
    handlePagination: function(d) {
        var c = this
          , b = {
            source: this.id,
            update: this.id,
            process: this.id,
            formId: this.cfg.formId,
            params: [{
                name: this.id + "_pagination",
                value: true
            }, {
                name: this.id + "_first",
                value: d.first
            }, {
                name: this.id + "_rows",
                value: d.rows
            }],
            onsuccess: function(g, e, f) {
                PrimeFaces.ajax.Response.handle(g, e, f, {
                    widget: c,
                    handle: function(h) {
                        this.content.html(h)
                    }
                });
                return true
            },
            oncomplete: function() {
                c.paginator.cfg.page = d.page;
                c.paginator.updateUI()
            }
        };
        if (this.hasBehavior("page")) {
            var a = this.cfg.behaviors.page;
            a.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    getPaginator: function() {
        return this.paginator
    }
});
PrimeFaces.widget.DataScroller = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        this.content = this.jq.children("div.ui-datascroller-content");
        this.list = this.content.children("ul");
        this.loaderContainer = this.content.children("div.ui-datascroller-loader");
        this.loadStatus = $('<div class="ui-datascroller-loading"></div>');
        this.loading = false;
        this.allLoaded = false;
        this.cfg.offset = 0;
        this.cfg.mode = this.cfg.mode || "document";
        this.cfg.buffer = (100 - this.cfg.buffer) / 100;
        if (this.cfg.loadEvent === "scroll") {
            this.bindScrollListener()
        } else {
            this.loadTrigger = this.loaderContainer.children();
            this.bindManualLoader()
        }
    },
    bindScrollListener: function() {
        var d = this;
        if (this.cfg.mode === "document") {
            var c = $(window)
              , b = $(document)
              , d = this
              , a = "scroll." + this.id;
            c.off(a).on(a, function() {
                if (c.scrollTop() >= ((b.height() * d.cfg.buffer) - c.height()) && d.shouldLoad()) {
                    d.load()
                }
            })
        } else {
            this.content.on("scroll", function() {
                var g = this.scrollTop
                  , f = this.scrollHeight
                  , e = this.clientHeight;
                if ((g >= ((f * d.cfg.buffer) - (e))) && d.shouldLoad()) {
                    d.load()
                }
            })
        }
    },
    bindManualLoader: function() {
        var a = this;
        this.loadTrigger.on("click.dataScroller", function(b) {
            a.load();
            b.preventDefault()
        })
    },
    load: function() {
        this.loading = true;
        this.cfg.offset += this.cfg.chunkSize;
        this.loadStatus.appendTo(this.loaderContainer);
        if (this.loadTrigger) {
            this.loadTrigger.hide()
        }
        var b = this
          , a = {
            source: this.id,
            process: this.id,
            update: this.id,
            global: false,
            params: [{
                name: this.id + "_load",
                value: true
            }, {
                name: this.id + "_offset",
                value: this.cfg.offset
            }],
            onsuccess: function(e, c, d) {
                PrimeFaces.ajax.Response.handle(e, c, d, {
                    widget: b,
                    handle: function(f) {
                        this.list.append(f)
                    }
                });
                return true
            },
            oncomplete: function() {
                b.loading = false;
                b.allLoaded = (b.cfg.offset + b.cfg.chunkSize) >= b.cfg.totalSize;
                b.loadStatus.remove();
                if (b.loadTrigger && !b.allLoaded) {
                    b.loadTrigger.show()
                }
            }
        };
        PrimeFaces.ajax.AjaxRequest(a)
    },
    shouldLoad: function() {
        return (!this.loading && !this.allLoaded)
    }
});
PrimeFaces.widget.DataTable = PrimeFaces.widget.DeferredWidget.extend({
    SORT_ORDER: {
        ASCENDING: 1,
        DESCENDING: -1,
        UNSORTED: 0
    },
    init: function(a) {
        this._super(a);
        this.thead = this.getThead();
        this.tbody = this.getTbody();
        this.tfoot = this.getTfoot();
        if (this.cfg.paginator) {
            this.bindPaginator()
        }
        this.bindSortEvents();
        if (this.cfg.rowHover) {
            this.setupRowHover()
        }
        if (this.cfg.selectionMode) {
            this.setupSelection()
        }
        if (this.cfg.filter) {
            this.setupFiltering()
        }
        if (this.cfg.expansion) {
            this.expansionProcess = [];
            this.bindExpansionEvents()
        }
        if (this.cfg.editable) {
            this.bindEditEvents()
        }
        if (this.cfg.draggableRows) {
            this.makeRowsDraggable()
        }
        if (this.cfg.reflow) {
            this.initReflow()
        }
        if (this.cfg.groupColumnIndexes) {
            this.groupRows();
            this.bindToggleRowGroupEvents()
        }
        if (this.cfg.multiViewState && this.cfg.resizableColumns) {
            this.resizableStateHolder = $(this.jqId + "_resizableColumnState");
            this.resizableState = [];
            if (this.resizableStateHolder.attr("value")) {
                this.resizableState = this.resizableStateHolder.val().split(",")
            }
        }
        this.updateEmptyColspan();
        this.renderDeferred()
    },
    _render: function() {
        if (this.cfg.scrollable) {
            this.setupScrolling()
        }
        if (this.cfg.resizableColumns) {
            this.setupResizableColumns()
        }
        if (this.cfg.draggableColumns) {
            this.setupDraggableColumns()
        }
        if (this.cfg.stickyHeader) {
            this.setupStickyHeader()
        }
        if (this.cfg.onRowClick) {
            this.bindRowClick()
        }
    },
    getThead: function() {
        return $(this.jqId + "_head")
    },
    getTbody: function() {
        return $(this.jqId + "_data")
    },
    getTfoot: function() {
        return $(this.jqId + "_foot")
    },
    updateData: function(c, a) {
        var b = (a === undefined) ? true : a;
        if (b) {
            this.tbody.html(c)
        } else {
            this.tbody.append(c)
        }
        this.postUpdateData()
    },
    postUpdateData: function() {
        if (this.cfg.draggableRows) {
            this.makeRowsDraggable()
        }
        if (this.cfg.reflow) {
            this.initReflow()
        }
        if (this.cfg.groupColumnIndexes) {
            this.groupRows();
            this.bindToggleRowGroupEvents()
        }
    },
    refresh: function(a) {
        this.columnWidthsFixed = false;
        this.init(a)
    },
    bindPaginator: function() {
        var a = this;
        this.cfg.paginator.paginate = function(c) {
            if (a.cfg.clientCache) {
                a.loadDataWithCache(c)
            } else {
                a.paginate(c)
            }
        }
        ;
        this.paginator = new PrimeFaces.widget.Paginator(this.cfg.paginator);
        if (this.cfg.clientCache) {
            this.cacheRows = this.paginator.getRows();
            var b = {
                first: this.paginator.getFirst(),
                rows: this.paginator.getRows(),
                page: this.paginator.getCurrentPage()
            };
            this.clearCacheMap();
            this.fetchNextPage(b)
        }
    },
    bindSortEvents: function() {
        var f = this
          , b = false;
        this.cfg.tabindex = this.cfg.tabindex || "0";
        this.headers = this.thead.find("> tr > th");
        this.sortableColumns = this.headers.filter(".ui-sortable-column");
        this.sortableColumns.attr("tabindex", this.cfg.tabindex);
        this.ascMessage = PrimeFaces.getAriaLabel("datatable.sort.ASC");
        this.descMessage = PrimeFaces.getAriaLabel("datatable.sort.DESC");
        this.reflowDD = $(this.jqId + "_reflowDD");
        if (this.cfg.multiSort) {
            this.sortMeta = []
        }
        for (var c = 0; c < this.sortableColumns.length; c++) {
            var e = this.sortableColumns.eq(c)
              , g = e.children("span.ui-sortable-column-icon")
              , d = null
              , a = e.attr("aria-label");
            if (e.hasClass("ui-state-active")) {
                if (g.hasClass("ui-icon-triangle-1-n")) {
                    d = this.SORT_ORDER.ASCENDING;
                    e.attr("aria-label", this.getSortMessage(a, this.descMessage));
                    if (!b) {
                        e.attr("aria-sort", "ascending");
                        b = true
                    }
                } else {
                    d = this.SORT_ORDER.DESCENDING;
                    e.attr("aria-label", this.getSortMessage(a, this.ascMessage));
                    if (!b) {
                        e.attr("aria-sort", "descending");
                        b = true
                    }
                }
                if (f.cfg.multiSort) {
                    f.addSortMeta({
                        col: e.attr("id"),
                        order: d
                    })
                }
                f.updateReflowDD(e, d)
            } else {
                d = this.SORT_ORDER.UNSORTED;
                e.attr("aria-label", this.getSortMessage(a, this.ascMessage));
                if (!b && c == (this.sortableColumns.length - 1)) {
                    this.sortableColumns.eq(0).attr("aria-sort", "other");
                    b = true
                }
            }
            e.data("sortorder", d)
        }
        this.sortableColumns.on("mouseenter.dataTable", function() {
            var h = $(this);
            if (!h.hasClass("ui-state-active")) {
                h.addClass("ui-state-hover")
            }
        }).on("mouseleave.dataTable", function() {
            var h = $(this);
            if (!h.hasClass("ui-state-active")) {
                h.removeClass("ui-state-hover")
            }
        }).on("blur.dataTable", function() {
            $(this).removeClass("ui-state-focus")
        }).on("focus.dataTable", function() {
            $(this).addClass("ui-state-focus")
        }).on("keydown.dataTable", function(j) {
            var h = j.which
              , i = $.ui.keyCode;
            if ((h === i.ENTER || h === i.NUMPAD_ENTER) && $(j.target).is(":not(:input)")) {
                $(this).trigger("click.dataTable", (j.metaKey || j.ctrlKey));
                j.preventDefault()
            }
        }).on("click.dataTable", function(l, j) {
            if (!f.shouldSort(l, this)) {
                return
            }
            PrimeFaces.clearSelection();
            var k = $(this)
              , h = k.data("sortorder")
              , i = (h === f.SORT_ORDER.UNSORTED) ? f.SORT_ORDER.ASCENDING : -1 * h
              , m = l.metaKey || l.ctrlKey || j;
            if (f.cfg.multiSort) {
                if (m) {
                    f.addSortMeta({
                        col: k.attr("id"),
                        order: i
                    });
                    f.sort(k, i, true)
                } else {
                    f.sortMeta = [];
                    f.addSortMeta({
                        col: k.attr("id"),
                        order: i
                    });
                    f.sort(k, i)
                }
            } else {
                f.sort(k, i)
            }
            if (f.cfg.scrollable) {
                $(PrimeFaces.escapeClientId(k.attr("id") + "_clone")).trigger("focus")
            }
            f.updateReflowDD(k, i)
        });
        if (this.reflowDD && this.cfg.reflow) {
            PrimeFaces.skinSelect(this.reflowDD);
            this.reflowDD.change(function(j) {
                var k = $(this).val().split("_")
                  , i = f.sortableColumns.eq(parseInt(k[0]))
                  , h = parseInt(k[1]);
                i.data("sortorder", h);
                i.trigger("click.dataTable")
            })
        }
    },
    getSortMessage: function(a, c) {
        var b = a ? a.split(":")[0] : "";
        return b + ": " + c
    },
    shouldSort: function(b, a) {
        if (this.isEmpty()) {
            return false
        }
        var c = $(b.target);
        if (c.closest(".ui-column-customfilter", a).length) {
            return false
        }
        return c.is("th,span")
    },
    addSortMeta: function(a) {
        this.sortMeta = $.grep(this.sortMeta, function(b) {
            return b.col !== a.col
        });
        this.sortMeta.push(a)
    },
    setupFiltering: function() {
        var b = this
          , a = this.thead.find("> tr > th.ui-filter-column");
        this.cfg.filterEvent = this.cfg.filterEvent || "keyup";
        this.cfg.filterDelay = this.cfg.filterDelay || 300;
        a.children(".ui-column-filter").each(function() {
            var c = $(this);
            if (c.is("input:text")) {
                PrimeFaces.skinInput(c);
                b.bindTextFilter(c)
            } else {
                PrimeFaces.skinSelect(c);
                b.bindChangeFilter(c)
            }
        })
    },
    bindTextFilter: function(a) {
        if (this.cfg.filterEvent === "enter") {
            this.bindEnterKeyFilter(a)
        } else {
            this.bindFilterEvent(a)
        }
    },
    bindChangeFilter: function(a) {
        var b = this;
        a.change(function() {
            b.filter()
        })
    },
    bindEnterKeyFilter: function(a) {
        var b = this;
        a.bind("keydown", function(f) {
            var c = f.which
              , d = $.ui.keyCode;
            if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
                f.preventDefault()
            }
        }).bind("keyup", function(f) {
            var c = f.which
              , d = $.ui.keyCode;
            if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
                b.filter();
                f.preventDefault()
            }
        })
    },
    bindFilterEvent: function(a) {
        var b = this;
        a.on("keydown.dataTable-blockenter", function(f) {
            var c = f.which
              , d = $.ui.keyCode;
            if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
                f.preventDefault()
            }
        }).on("input", function() {
            if (this.value == "") {
                b.filter()
            }
        }).on(this.cfg.filterEvent + ".dataTable", function(f) {
            var c = f.which
              , d = $.ui.keyCode
              , g = [d.END, d.HOME, d.LEFT, d.RIGHT, d.UP, d.DOWN, d.TAB, 16, 17, 18, 91, 92, 93, d.ESCAPE, d.PAGE_UP, d.PAGE_DOWN, 19, 20, 44, 144, 145];
            if (g.indexOf(c) > -1) {
                return
            }
            if (b.filterTimeout) {
                clearTimeout(b.filterTimeout)
            }
            b.filterTimeout = setTimeout(function() {
                b.filter();
                b.filterTimeout = null
            }, b.cfg.filterDelay)
        })
    },
    setupRowHover: function() {
        var a = "> tr.ui-widget-content";
        if (!this.cfg.selectionMode) {
            this.bindRowHover(a)
        }
    },
    setupSelection: function() {
        this.selectionHolder = this.jqId + "_selection";
        this.cfg.rowSelectMode = this.cfg.rowSelectMode || "new";
        this.rowSelector = "> tr.ui-widget-content.ui-datatable-selectable";
        this.cfg.disabledTextSelection = this.cfg.disabledTextSelection === false ? false : true;
        this.rowSelectorForRowClick = this.cfg.rowSelector || "td:not(.ui-column-unselectable),span:not(.ui-c)";
        var a = $(this.selectionHolder).val();
        this.selection = (a === "") ? [] : a.split(",");
        this.originRowIndex = 0;
        this.cursorIndex = null;
        this.bindSelectionEvents()
    },
    bindSelectionEvents: function() {
        if (this.cfg.selectionMode === "radio") {
            this.bindRadioEvents()
        } else {
            if (this.cfg.selectionMode === "checkbox") {
                this.bindCheckboxEvents();
                this.updateHeaderCheckbox();
                if (this.cfg.rowSelectMode !== "checkbox") {
                    this.bindRowEvents()
                }
            } else {
                this.bindRowEvents()
            }
        }
    },
    bindRowEvents: function() {
        var a = this;
        this.bindRowHover(this.rowSelector);
        this.tbody.off("click.dataTable mousedown.dataTable", this.rowSelector).on("mousedown.dataTable", this.rowSelector, null, function(b) {
            a.mousedownOnRow = true
        }).on("click.dataTable", this.rowSelector, null, function(b) {
            a.onRowClick(b, this);
            a.mousedownOnRow = false
        });
        if (this.hasBehavior("rowDblselect")) {
            this.tbody.off("dblclick.dataTable", this.rowSelector).on("dblclick.dataTable", this.rowSelector, null, function(b) {
                a.onRowDblclick(b, $(this))
            })
        }
        this.bindSelectionKeyEvents()
    },
    bindSelectionKeyEvents: function() {
        var a = this;
        this.getFocusableTbody().on("focus", function(b) {
            if (!a.mousedownOnRow) {
                a.focusedRow = a.tbody.children("tr.ui-widget-content.ui-datatable-selectable.ui-state-highlight").eq(0);
                if (a.focusedRow.length == 0) {
                    a.focusedRow = a.tbody.children("tr.ui-widget-content.ui-datatable-selectable").eq(0)
                }
                a.highlightFocusedRow();
                if (a.cfg.scrollable) {
                    PrimeFaces.scrollInView(a.scrollBody, a.focusedRow)
                }
            }
        }).on("blur", function() {
            if (a.focusedRow) {
                a.unhighlightFocusedRow();
                a.focusedRow = null
            }
        }).on("keydown", function(f) {
            var d = $.ui.keyCode
              , b = f.which;
            if ($(f.target).is(":input") && a.cfg.editable) {
                return
            }
            if (a.focusedRow) {
                switch (b) {
                case d.UP:
                    var g = a.focusedRow.prev("tr.ui-widget-content.ui-datatable-selectable");
                    if (g.length) {
                        a.unhighlightFocusedRow();
                        a.focusedRow = g;
                        a.highlightFocusedRow();
                        if (a.cfg.scrollable) {
                            PrimeFaces.scrollInView(a.scrollBody, a.focusedRow)
                        }
                    }
                    f.preventDefault();
                    break;
                case d.DOWN:
                    var c = a.focusedRow.next("tr.ui-widget-content.ui-datatable-selectable");
                    if (c.length) {
                        a.unhighlightFocusedRow();
                        a.focusedRow = c;
                        a.highlightFocusedRow();
                        if (a.cfg.scrollable) {
                            PrimeFaces.scrollInView(a.scrollBody, a.focusedRow)
                        }
                    }
                    f.preventDefault();
                    break;
                case d.ENTER:
                case d.NUMPAD_ENTER:
                case d.SPACE:
                    f.target = a.focusedRow.children().eq(0).get(0);
                    a.onRowClick(f, a.focusedRow.get(0));
                    f.preventDefault();
                    break;
                default:
                    break
                }
            }
        })
    },
    highlightFocusedRow: function() {
        this.focusedRow.addClass("ui-state-hover")
    },
    unhighlightFocusedRow: function() {
        this.focusedRow.removeClass("ui-state-hover")
    },
    assignFocusedRow: function(a) {
        this.focusedRow = a
    },
    bindRowHover: function(a) {
        this.tbody.off("mouseenter.dataTable mouseleave.dataTable", a).on("mouseenter.dataTable", a, null, function() {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                b.addClass("ui-state-hover")
            }
        }).on("mouseleave.dataTable", a, null, function() {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                b.removeClass("ui-state-hover")
            }
        })
    },
    bindRadioEvents: function() {
        var c = this
          , b = "> tr.ui-widget-content:not(.ui-datatable-empty-message) > td.ui-selection-column :radio";
        if (this.cfg.nativeElements) {
            this.tbody.off("click.dataTable", b).on("click.dataTable", b, null, function(f) {
                var d = $(this);
                if (!d.prop("checked")) {
                    c.selectRowWithRadio(d)
                }
            })
        } else {
            var a = "> tr.ui-widget-content:not(.ui-datatable-empty-message) > td.ui-selection-column .ui-radiobutton .ui-radiobutton-box";
            this.tbody.off("click.dataTable mouseover.dataTable mouseout.dataTable", a).on("mouseover.dataTable", a, null, function() {
                var d = $(this);
                if (!d.hasClass("ui-state-disabled") && !d.hasClass("ui-state-active")) {
                    d.addClass("ui-state-hover")
                }
            }).on("mouseout.dataTable", a, null, function() {
                var d = $(this);
                d.removeClass("ui-state-hover")
            }).on("click.dataTable", a, null, function() {
                var d = $(this)
                  , f = d.hasClass("ui-state-active")
                  , e = d.hasClass("ui-state-disabled");
                if (!e && !f) {
                    c.selectRowWithRadio(d)
                }
            })
        }
        this.tbody.off("focus.dataTable blur.dataTable change.dataTable", b).on("focus.dataTable", b, null, function() {
            var d = $(this)
              , e = d.parent().next();
            if (d.prop("checked")) {
                e.removeClass("ui-state-active")
            }
            e.addClass("ui-state-focus")
        }).on("blur.dataTable", b, null, function() {
            var d = $(this)
              , e = d.parent().next();
            if (d.prop("checked")) {
                e.addClass("ui-state-active")
            }
            e.removeClass("ui-state-focus")
        }).on("change.dataTable", b, null, function() {
            var d = c.tbody.find(b).filter(":checked")
              , e = d.parent().next();
            c.selectRowWithRadio(e)
        })
    },
    bindCheckboxEvents: function() {
        var b = this
          , c = "> tr.ui-widget-content.ui-datatable-selectable > td.ui-selection-column :checkbox";
        if (this.cfg.nativeElements) {
            this.checkAllToggler = this.thead.find("> tr > th.ui-selection-column > :checkbox");
            this.checkAllTogglerInput = this.checkAllToggler;
            this.checkAllToggler.on("click", function() {
                b.toggleCheckAll()
            });
            this.tbody.off("click.dataTable", c).on("click.dataTable", c, null, function(f) {
                var d = $(this);
                if (d.prop("checked")) {
                    b.selectRowWithCheckbox(d)
                } else {
                    b.unselectRowWithCheckbox(d)
                }
            })
        } else {
            this.checkAllToggler = this.thead.find("> tr > th.ui-selection-column > .ui-chkbox.ui-chkbox-all > .ui-chkbox-box");
            this.checkAllTogglerInput = this.checkAllToggler.prev().children(":checkbox");
            this.checkAllToggler.on("mouseover", function() {
                var d = $(this);
                if (!d.hasClass("ui-state-disabled") && !d.hasClass("ui-state-active")) {
                    d.addClass("ui-state-hover")
                }
            }).on("mouseout", function() {
                $(this).removeClass("ui-state-hover")
            }).on("click", function() {
                var d = $(this);
                if (!d.hasClass("ui-state-disabled")) {
                    b.toggleCheckAll()
                }
            });
            var a = "> tr.ui-widget-content.ui-datatable-selectable > td.ui-selection-column .ui-chkbox .ui-chkbox-box";
            this.tbody.off("mouseover.dataTable mouseover.dataTable click.dataTable", a).on("mouseover.dataTable", a, null, function() {
                var d = $(this);
                if (!d.hasClass("ui-state-active")) {
                    d.addClass("ui-state-hover")
                }
            }).on("mouseout.dataTable", a, null, function() {
                $(this).removeClass("ui-state-hover")
            }).on("click.dataTable", a, null, function() {
                var e = $(this)
                  , d = e.hasClass("ui-state-active");
                if (d) {
                    b.unselectRowWithCheckbox(e)
                } else {
                    b.selectRowWithCheckbox(e)
                }
            })
        }
        this.tbody.off("focus.dataTable blur.dataTable change.dataTable", c).on("focus.dataTable", c, null, function() {
            var d = $(this)
              , e = d.parent().next();
            if (d.prop("checked")) {
                e.removeClass("ui-state-active")
            }
            e.addClass("ui-state-focus")
        }).on("blur.dataTable", c, null, function() {
            var d = $(this)
              , e = d.parent().next();
            if (d.prop("checked")) {
                e.addClass("ui-state-active")
            }
            e.removeClass("ui-state-focus")
        }).on("change.dataTable", c, null, function(g) {
            var d = $(this)
              , f = d.parent().next();
            if (d.prop("checked")) {
                b.selectRowWithCheckbox(f)
            } else {
                b.unselectRowWithCheckbox(f)
            }
        });
        this.checkAllTogglerInput.on("focus.dataTable", function(g) {
            var d = $(this)
              , f = d.parent().next();
            if (!f.hasClass("ui-state-disabled")) {
                if (d.prop("checked")) {
                    f.removeClass("ui-state-active")
                }
                f.addClass("ui-state-focus")
            }
        }).on("blur.dataTable", function(g) {
            var d = $(this)
              , f = d.parent().next();
            if (d.prop("checked")) {
                f.addClass("ui-state-active")
            }
            f.removeClass("ui-state-focus")
        }).on("change.dataTable", function(g) {
            var d = $(this)
              , f = d.parent().next();
            if (!f.hasClass("ui-state-disabled")) {
                if (!d.prop("checked")) {
                    f.addClass("ui-state-active")
                }
                b.toggleCheckAll();
                if (d.prop("checked")) {
                    f.removeClass("ui-state-active").addClass("ui-state-focus")
                }
            }
        })
    },
    toggleRow: function(b) {
        if (b && !this.isRowTogglerClicked) {
            var a = b.find("> td > div.ui-row-toggler");
            this.toggleExpansion(a)
        }
        this.isRowTogglerClicked = false
    },
    bindExpansionEvents: function() {
        var b = this
          , a = "> tr > td > div.ui-row-toggler";
        this.tbody.off("click.datatable-expansion", a).on("click.datatable-expansion", a, null, function() {
            b.isRowTogglerClicked = true;
            b.toggleExpansion($(this))
        }).on("keydown.datatable-expansion", a, null, function(f) {
            var c = f.which
              , d = $.ui.keyCode;
            if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
                b.toggleExpansion($(this));
                f.preventDefault()
            }
        })
    },
    bindContextMenu: function(e, f, b, a) {
        var d = b + " tbody.ui-datatable-data > tr.ui-widget-content";
        var c = a.event + ".datatable";
        this.contextMenuWidget = e;
        $(document).off(c, d).on(c, d, null, function(j) {
            var k = $(this);
            if (f.cfg.selectionMode && k.hasClass("ui-datatable-selectable")) {
                f.onRowRightClick(j, this, a.selectionMode);
                e.show(j)
            } else {
                if (f.cfg.editMode === "cell") {
                    var i = $(j.target)
                      , h = i.is("td.ui-editable-column") ? i : i.parents("td.ui-editable-column:first");
                    if (f.contextMenuCell) {
                        f.contextMenuCell.removeClass("ui-state-highlight")
                    }
                    f.contextMenuClick = true;
                    f.contextMenuCell = h;
                    f.contextMenuCell.addClass("ui-state-highlight");
                    e.show(j)
                } else {
                    if (k.hasClass("ui-datatable-empty-message")) {
                        e.show(j)
                    }
                }
            }
        });
        if (this.cfg.scrollable) {
            var g = this;
            this.scrollBody.off("scroll.dataTable-contextmenu").on("scroll.dataTable-contextmenu", function() {
                if (g.contextMenuWidget.jq.is(":visible")) {
                    g.contextMenuWidget.hide()
                }
            })
        }
    },
    bindRowClick: function() {
        var b = this
          , a = "> tr.ui-widget-content:not(.ui-expanded-row-content)";
        this.tbody.off("click.dataTable-rowclick", a).on("click.dataTable-rowclick", a, null, function(d) {
            var c = $(d.target)
              , f = c.is("tr.ui-widget-content") ? c : c.closest("tr.ui-widget-content");
            b.cfg.onRowClick.call(this, f)
        })
    },
    initReflow: function() {
        var b = this.thead.find("> tr > th");
        for (var c = 0; c < b.length; c++) {
            var d = b.eq(c)
              , a = d.find(".ui-reflow-headertext:first").text()
              , e = d.children(".ui-column-title")
              , f = (a && a.length) ? a : e.text();
            this.tbody.find("> tr:not(.ui-datatable-empty-message) > td:nth-child(" + (c + 1) + ")").prepend('<span class="ui-column-title">' + f + "</span>")
        }
    },
    setupScrolling: function() {
        this.scrollHeader = this.jq.children(".ui-datatable-scrollable-header");
        this.scrollBody = this.jq.children(".ui-datatable-scrollable-body");
        this.scrollFooter = this.jq.children(".ui-datatable-scrollable-footer");
        this.scrollStateHolder = $(this.jqId + "_scrollState");
        this.scrollHeaderBox = this.scrollHeader.children("div.ui-datatable-scrollable-header-box");
        this.scrollFooterBox = this.scrollFooter.children("div.ui-datatable-scrollable-footer-box");
        this.headerTable = this.scrollHeaderBox.children("table");
        this.bodyTable = this.cfg.virtualScroll ? this.scrollBody.children("div").children("table") : this.scrollBody.children("table");
        this.footerTable = this.scrollFooter.children("table");
        this.footerCols = this.scrollFooter.find("> .ui-datatable-scrollable-footer-box > table > tfoot > tr > td");
        this.percentageScrollHeight = this.cfg.scrollHeight && (this.cfg.scrollHeight.indexOf("%") !== -1);
        this.percentageScrollWidth = this.cfg.scrollWidth && (this.cfg.scrollWidth.indexOf("%") !== -1);
        var d = this
          , c = this.getScrollbarWidth() + "px";
        if (this.cfg.scrollHeight) {
            if (this.percentageScrollHeight) {
                this.adjustScrollHeight()
            }
            if (this.hasVerticalOverflow()) {
                this.scrollHeaderBox.css("margin-right", c);
                this.scrollFooterBox.css("margin-right", c)
            }
        }
        this.fixColumnWidths();
        if (this.cfg.scrollWidth) {
            if (this.percentageScrollWidth) {
                this.adjustScrollWidth()
            } else {
                this.setScrollWidth(parseInt(this.cfg.scrollWidth))
            }
        }
        this.cloneHead();
        this.restoreScrollState();
        if (this.cfg.liveScroll) {
            this.scrollOffset = 0;
            this.cfg.liveScrollBuffer = (100 - this.cfg.liveScrollBuffer) / 100;
            this.shouldLiveScroll = true;
            this.loadingLiveScroll = false;
            this.allLoadedLiveScroll = d.cfg.scrollStep >= d.cfg.scrollLimit
        }
        if (this.cfg.virtualScroll) {
            var e = this.bodyTable.children("tbody").children("tr.ui-widget-content");
            if (e) {
                var a = e.eq(0).hasClass("ui-datatable-empty-message")
                  , f = d.cfg.scrollLimit;
                if (a) {
                    f = 1;
                    d.bodyTable.css("top", "0px")
                }
                this.rowHeight = e.outerHeight();
                this.scrollBody.children("div").css("height", parseFloat((f * this.rowHeight + 1) + "px"))
            }
        }
        this.scrollBody.on("scroll.dataTable", function() {
            var k = d.scrollBody.scrollLeft();
            d.scrollHeaderBox.css("margin-left", -k);
            d.scrollFooterBox.css("margin-left", -k);
            if (d.cfg.virtualScroll) {
                var h = this;
                clearTimeout(d.scrollTimeout);
                d.scrollTimeout = setTimeout(function() {
                    var n = d.scrollBody.outerHeight()
                      , m = d.bodyTable.outerHeight()
                      , p = d.rowHeight * d.cfg.scrollStep
                      , l = parseFloat((d.cfg.scrollLimit * d.rowHeight) + "px")
                      , o = (l / p) || 1;
                    if (h.scrollTop + n > parseFloat(d.bodyTable.css("top")) + m || h.scrollTop < parseFloat(d.bodyTable.css("top"))) {
                        var q = Math.floor((h.scrollTop * o) / (h.scrollHeight)) + 1;
                        d.loadRowsWithVirtualScroll(q);
                        d.bodyTable.css("top", ((q - 1) * p) + "px")
                    }
                }, 200)
            } else {
                if (d.shouldLiveScroll) {
                    var j = Math.ceil(this.scrollTop)
                      , i = this.scrollHeight
                      , g = this.clientHeight;
                    if ((j >= ((i * d.cfg.liveScrollBuffer) - (g))) && d.shouldLoadLiveScroll()) {
                        d.loadLiveRows()
                    }
                }
            }
            d.saveScrollState()
        });
        this.scrollHeader.on("scroll.dataTable", function() {
            d.scrollHeader.scrollLeft(0)
        });
        this.scrollFooter.on("scroll.dataTable", function() {
            d.scrollFooter.scrollLeft(0)
        });
        var b = "resize." + this.id;
        $(window).unbind(b).bind(b, function() {
            if (d.jq.is(":visible")) {
                if (d.percentageScrollHeight) {
                    d.adjustScrollHeight()
                }
                if (d.percentageScrollWidth) {
                    d.adjustScrollWidth()
                }
            }
        })
    },
    shouldLoadLiveScroll: function() {
        return (!this.loadingLiveScroll && !this.allLoadedLiveScroll)
    },
    cloneHead: function() {
        this.theadClone = this.thead.clone();
        this.theadClone.find("th").each(function() {
            var c = $(this);
            c.attr("id", c.attr("id") + "_clone");
            $(this).children().not(".ui-column-title").remove()
        });
        this.theadClone.removeAttr("id").addClass("ui-datatable-scrollable-theadclone").height(0).prependTo(this.bodyTable);
        if (this.sortableColumns.length) {
            this.sortableColumns.removeAttr("tabindex").off("blur.dataTable focus.dataTable keydown.dataTable");
            var b = this.theadClone.find("> tr > th")
              , a = b.filter(".ui-sortable-column");
            b.each(function() {
                var d = $(this)
                  , c = d.attr("id").split("_clone")[0];
                if (d.hasClass("ui-sortable-column")) {
                    d.data("original", c)
                }
                $(PrimeFaces.escapeClientId(c)).width(d[0].style.width)
            });
            a.on("blur.dataTable", function() {
                $(PrimeFaces.escapeClientId($(this).data("original"))).removeClass("ui-state-focus")
            }).on("focus.dataTable", function() {
                $(PrimeFaces.escapeClientId($(this).data("original"))).addClass("ui-state-focus")
            }).on("keydown.dataTable", function(f) {
                var c = f.which
                  , d = $.ui.keyCode;
                if ((c === d.ENTER || c === d.NUMPAD_ENTER) && $(f.target).is(":not(:input)")) {
                    $(PrimeFaces.escapeClientId($(this).data("original"))).trigger("click.dataTable", (f.metaKey || f.ctrlKey));
                    f.preventDefault()
                }
            })
        }
    },
    adjustScrollHeight: function() {
        var d = this.jq.parent().innerHeight() * (parseInt(this.cfg.scrollHeight) / 100)
          , f = this.jq.children(".ui-datatable-header").outerHeight(true)
          , b = this.jq.children(".ui-datatable-footer").outerHeight(true)
          , c = (this.scrollHeader.outerHeight(true) + this.scrollFooter.outerHeight(true))
          , e = this.paginator ? this.paginator.getContainerHeight(true) : 0
          , a = (d - (c + e + f + b));
        if (this.cfg.virtualScroll) {
            this.scrollBody.css("max-height", a)
        } else {
            this.scrollBody.height(a)
        }
    },
    adjustScrollWidth: function() {
        var a = parseInt((this.jq.parent().innerWidth() * (parseInt(this.cfg.scrollWidth) / 100)));
        this.setScrollWidth(a)
    },
    setOuterWidth: function(a, b) {
        var c = a.outerWidth() - a.width();
        a.width(b - c)
    },
    setScrollWidth: function(a) {
        var b = this;
        this.jq.children(".ui-widget-header").each(function() {
            b.setOuterWidth($(this), a)
        });
        this.scrollHeader.width(a);
        this.scrollBody.css("margin-right", 0).width(a);
        this.scrollFooter.width(a)
    },
    alignScrollBody: function() {
        var a = this.hasVerticalOverflow() ? this.getScrollbarWidth() + "px" : "0px";
        this.scrollHeaderBox.css("margin-right", a);
        this.scrollFooterBox.css("margin-right", a)
    },
    getScrollbarWidth: function() {
        if (!this.scrollbarWidth) {
            this.scrollbarWidth = PrimeFaces.env.browser.webkit ? "15" : PrimeFaces.calculateScrollbarWidth()
        }
        return this.scrollbarWidth
    },
    hasVerticalOverflow: function() {
        return (this.cfg.scrollHeight && this.bodyTable.outerHeight() > this.scrollBody.outerHeight())
    },
    restoreScrollState: function() {
        var a = this.scrollStateHolder.val()
          , b = a.split(",");
        this.scrollBody.scrollLeft(b[0]);
        this.scrollBody.scrollTop(b[1])
    },
    saveScrollState: function() {
        var a = this.scrollBody.scrollLeft() + "," + this.scrollBody.scrollTop();
        this.scrollStateHolder.val(a)
    },
    clearScrollState: function() {
        this.scrollStateHolder.val("0,0")
    },
    fixColumnWidths: function() {
        var d = this;
        if (!this.columnWidthsFixed) {
            if (this.cfg.scrollable) {
                this.scrollHeader.find("> .ui-datatable-scrollable-header-box > table > thead > tr > th").each(function() {
                    var i = $(this)
                      , f = i.index()
                      , e = i[0].style
                      , g = e.width || i.width();
                    if (d.cfg.multiViewState && d.resizableStateHolder && d.resizableStateHolder.attr("value")) {
                        g = (d.findColWidthInResizableState(i.attr("id")) || g)
                    }
                    i.width(g);
                    if (d.footerCols.length > 0) {
                        var h = d.footerCols.eq(f);
                        h.width(g)
                    }
                })
            } else {
                var b = this.jq.find("> .ui-datatable-tablewrapper > table > thead > tr > th")
                  , a = b.filter(":visible")
                  , c = b.filter(":hidden");
                this.setColumnsWidth(a);
                this.setColumnsWidth(c)
            }
            this.columnWidthsFixed = true
        }
    },
    setColumnsWidth: function(a) {
        if (a.length) {
            var b = this;
            a.each(function() {
                var c = $(this)
                  , e = c[0].style
                  , d = e.width || c.width();
                if (b.cfg.multiViewState && b.resizableStateHolder && b.resizableStateHolder.attr("value")) {
                    d = (b.findColWidthInResizableState(c.attr("id")) || d)
                }
                c.width(d)
            })
        }
    },
    loadLiveRows: function() {
        if (this.liveScrollActive || (this.scrollOffset + this.cfg.scrollStep > this.cfg.scrollLimit)) {
            return
        }
        this.liveScrollActive = true;
        this.scrollOffset += this.cfg.scrollStep;
        if (this.scrollOffset === this.cfg.scrollLimit) {
            this.shouldLiveScroll = false
        }
        var b = this
          , a = {
            source: this.id,
            process: this.id,
            update: this.id,
            formId: this.cfg.formId,
            params: [{
                name: this.id + "_scrolling",
                value: true
            }, {
                name: this.id + "_skipChildren",
                value: true
            }, {
                name: this.id + "_scrollOffset",
                value: this.scrollOffset
            }, {
                name: this.id + "_encodeFeature",
                value: true
            }],
            onsuccess: function(e, c, d) {
                PrimeFaces.ajax.Response.handle(e, c, d, {
                    widget: b,
                    handle: function(f) {
                        this.updateData(f, false);
                        this.liveScrollActive = false
                    }
                });
                return true
            },
            oncomplete: function(e, c, d) {
                if (typeof d.totalRecords !== "undefined") {
                    b.cfg.scrollLimit = d.totalRecords
                }
                b.loadingLiveScroll = false;
                b.allLoadedLiveScroll = (b.scrollOffset + b.cfg.scrollStep) >= b.cfg.scrollLimit
            }
        };
        PrimeFaces.ajax.Request.handle(a)
    },
    loadRowsWithVirtualScroll: function(b) {
        if (this.virtualScrollActive) {
            return
        }
        this.virtualScrollActive = true;
        var c = this
          , d = (b - 1) * this.cfg.scrollStep
          , a = {
            source: this.id,
            process: this.id,
            update: this.id,
            formId: this.cfg.formId,
            params: [{
                name: this.id + "_scrolling",
                value: true
            }, {
                name: this.id + "_skipChildren",
                value: true
            }, {
                name: this.id + "_first",
                value: d
            }, {
                name: this.id + "_encodeFeature",
                value: true
            }],
            onsuccess: function(g, e, f) {
                PrimeFaces.ajax.Response.handle(g, e, f, {
                    widget: c,
                    handle: function(h) {
                        this.updateData(h);
                        this.virtualScrollActive = false
                    }
                });
                return true
            },
            oncomplete: function(g, e, f) {
                if (typeof f.totalRecords !== "undefined") {
                    c.cfg.scrollLimit = f.totalRecords
                }
            }
        };
        PrimeFaces.ajax.Request.handle(a)
    },
    paginate: function(d) {
        var c = this
          , b = {
            source: this.id,
            update: this.id,
            process: this.id,
            formId: this.cfg.formId,
            params: [{
                name: this.id + "_pagination",
                value: true
            }, {
                name: this.id + "_first",
                value: d.first
            }, {
                name: this.id + "_rows",
                value: d.rows
            }, {
                name: this.id + "_skipChildren",
                value: true
            }, {
                name: this.id + "_encodeFeature",
                value: true
            }],
            onsuccess: function(g, e, f) {
                PrimeFaces.ajax.Response.handle(g, e, f, {
                    widget: c,
                    handle: function(h) {
                        this.updateData(h);
                        if (this.checkAllToggler) {
                            this.updateHeaderCheckbox()
                        }
                        if (this.cfg.scrollable) {
                            this.alignScrollBody()
                        }
                        if (this.cfg.clientCache) {
                            this.cacheMap[d.first] = h
                        }
                    }
                });
                return true
            },
            oncomplete: function(g, e, f) {
                c.paginator.cfg.page = d.page;
                if (f && typeof f.totalRecords !== "undefined") {
                    c.paginator.updateTotalRecords(f.totalRecords)
                } else {
                    c.paginator.updateUI()
                }
            }
        };
        if (this.hasBehavior("page")) {
            var a = this.cfg.behaviors.page;
            a.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    fetchNextPage: function(d) {
        var b = d.rows
          , e = d.first
          , c = this
          , a = {
            source: this.id,
            process: this.id,
            update: this.id,
            global: false,
            params: [{
                name: this.id + "_skipChildren",
                value: true
            }, {
                name: this.id + "_encodeFeature",
                value: true
            }, {
                name: this.id + "_first",
                value: e
            }, {
                name: this.id + "_rows",
                value: b
            }, {
                name: this.id + "_pagination",
                value: true
            }, {
                name: this.id + "_clientCache",
                value: true
            }],
            onsuccess: function(h, f, g) {
                PrimeFaces.ajax.Response.handle(h, f, g, {
                    widget: c,
                    handle: function(j) {
                        if (j.length) {
                            var i = e + b;
                            c.cacheMap[i] = j
                        }
                    }
                });
                return true
            }
        };
        PrimeFaces.ajax.Request.handle(a)
    },
    updatePageState: function(c) {
        var b = this
          , a = {
            source: this.id,
            process: this.id,
            update: this.id,
            global: false,
            params: [{
                name: this.id + "_pagination",
                value: true
            }, {
                name: this.id + "_encodeFeature",
                value: true
            }, {
                name: this.id + "_pageState",
                value: true
            }, {
                name: this.id + "_first",
                value: c.first
            }, {
                name: this.id + "_rows",
                value: c.rows
            }],
            onsuccess: function(f, d, e) {
                PrimeFaces.ajax.Response.handle(f, d, e, {
                    widget: b,
                    handle: function(g) {}
                });
                return true
            }
        };
        PrimeFaces.ajax.Request.handle(a)
    },
    sort: function(d, a, f) {
        var e = this
          , b = {
            source: this.id,
            update: this.id,
            process: this.id,
            params: [{
                name: this.id + "_sorting",
                value: true
            }, {
                name: this.id + "_skipChildren",
                value: true
            }, {
                name: this.id + "_encodeFeature",
                value: true
            }],
            onsuccess: function(i, g, h) {
                PrimeFaces.ajax.Response.handle(i, g, h, {
                    widget: e,
                    handle: function(j) {
                        this.updateData(j)
                    }
                });
                return true
            },
            oncomplete: function(q, j, m) {
                var p = e.getPaginator();
                if (m && m.totalRecords) {
                    e.cfg.scrollLimit = m.totalRecords;
                    if (p && p.cfg.rowCount !== m.totalRecords) {
                        p.setTotalRecords(m.totalRecords)
                    }
                }
                if (!m.validationFailed) {
                    if (p) {
                        p.setPage(0, true)
                    }
                    var g = e.sortableColumns.filter(".ui-state-active");
                    if (g.length) {
                        g.removeAttr("aria-sort")
                    } else {
                        e.sortableColumns.eq(0).removeAttr("aria-sort")
                    }
                    if (!f) {
                        for (var k = 0; k < g.length; k++) {
                            var h = $(g.get(k))
                              , n = h.attr("aria-label");
                            h.attr("aria-label", e.getSortMessage(n, e.ascMessage));
                            $(PrimeFaces.escapeClientId(h.attr("id") + "_clone")).removeAttr("aria-sort").attr("aria-label", e.getSortMessage(n, e.ascMessage))
                        }
                        g.data("sortorder", e.SORT_ORDER.UNSORTED).removeClass("ui-state-active").find(".ui-sortable-column-icon").removeClass("ui-icon-triangle-1-n ui-icon-triangle-1-s")
                    }
                    d.data("sortorder", a).removeClass("ui-state-hover").addClass("ui-state-active");
                    var l = d.find(".ui-sortable-column-icon")
                      , o = d.attr("aria-label");
                    if (a === e.SORT_ORDER.DESCENDING) {
                        l.removeClass("ui-icon-triangle-1-n").addClass("ui-icon-triangle-1-s");
                        d.attr("aria-sort", "descending").attr("aria-label", e.getSortMessage(o, e.ascMessage));
                        $(PrimeFaces.escapeClientId(d.attr("id") + "_clone")).attr("aria-sort", "descending").attr("aria-label", e.getSortMessage(o, e.ascMessage))
                    } else {
                        if (a === e.SORT_ORDER.ASCENDING) {
                            l.removeClass("ui-icon-triangle-1-s").addClass("ui-icon-triangle-1-n");
                            d.attr("aria-sort", "ascending").attr("aria-label", e.getSortMessage(o, e.descMessage));
                            $(PrimeFaces.escapeClientId(d.attr("id") + "_clone")).attr("aria-sort", "ascending").attr("aria-label", e.getSortMessage(o, e.descMessage))
                        }
                    }
                }
                if (e.cfg.virtualScroll) {
                    e.bodyTable.css("top", "0px");
                    e.scrollBody.scrollTop(0);
                    e.clearScrollState()
                } else {
                    if (e.cfg.liveScroll) {
                        e.scrollOffset = 0;
                        e.liveScrollActive = false;
                        e.shouldLiveScroll = true;
                        e.loadingLiveScroll = false;
                        e.allLoadedLiveScroll = e.cfg.scrollStep >= e.cfg.scrollLimit
                    }
                }
                if (e.cfg.clientCache) {
                    e.clearCacheMap()
                }
                e.updateHiddenHeaders()
            }
        };
        if (f) {
            b.params.push({
                name: this.id + "_multiSorting",
                value: true
            });
            b.params.push({
                name: this.id + "_sortKey",
                value: e.joinSortMetaOption("col")
            });
            b.params.push({
                name: this.id + "_sortDir",
                value: e.joinSortMetaOption("order")
            })
        } else {
            b.params.push({
                name: this.id + "_sortKey",
                value: d.attr("id")
            });
            b.params.push({
                name: this.id + "_sortDir",
                value: a
            })
        }
        if (this.hasBehavior("sort")) {
            var c = this.cfg.behaviors.sort;
            c.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    joinSortMetaOption: function(b) {
        var c = "";
        for (var a = 0; a < this.sortMeta.length; a++) {
            c += this.sortMeta[a][b];
            if (a !== (this.sortMeta.length - 1)) {
                c += ","
            }
        }
        return c
    },
    filter: function() {
        var c = this
          , a = {
            source: this.id,
            update: this.id,
            process: this.id,
            formId: this.cfg.formId,
            params: [{
                name: this.id + "_filtering",
                value: true
            }, {
                name: this.id + "_encodeFeature",
                value: true
            }],
            onsuccess: function(f, d, e) {
                PrimeFaces.ajax.Response.handle(f, d, e, {
                    widget: c,
                    handle: function(g) {
                        this.updateData(g);
                        if (this.cfg.scrollable) {
                            this.alignScrollBody()
                        }
                        if (this.isCheckboxSelectionEnabled()) {
                            this.updateHeaderCheckbox()
                        }
                    }
                });
                return true
            },
            oncomplete: function(h, d, f) {
                var j = c.getPaginator();
                if (f && typeof f.totalRecords !== "undefined") {
                    c.cfg.scrollLimit = f.totalRecords;
                    if (j) {
                        j.setTotalRecords(f.totalRecords)
                    }
                }
                if (c.cfg.clientCache) {
                    c.clearCacheMap()
                }
                if (c.cfg.virtualScroll) {
                    var g = c.bodyTable.children("tbody").children("tr.ui-widget-content");
                    if (g) {
                        var e = g.eq(0).hasClass("ui-datatable-empty-message")
                          , i = c.cfg.scrollLimit;
                        if (e) {
                            i = 1
                        }
                        c.bodyTable.css("top", "0px");
                        c.scrollBody.scrollTop(0);
                        c.clearScrollState();
                        c.rowHeight = g.outerHeight();
                        c.scrollBody.children("div").css({
                            height: parseFloat((i * c.rowHeight + 1) + "px")
                        })
                    }
                } else {
                    if (c.cfg.liveScroll) {
                        c.scrollOffset = 0;
                        c.liveScrollActive = false;
                        c.shouldLiveScroll = true;
                        c.loadingLiveScroll = false;
                        c.allLoadedLiveScroll = c.cfg.scrollStep >= c.cfg.scrollLimit
                    }
                }
                c.updateHiddenHeaders()
            }
        };
        if (this.hasBehavior("filter")) {
            var b = this.cfg.behaviors.filter;
            b.call(this, a)
        } else {
            PrimeFaces.ajax.AjaxRequest(a)
        }
    },
    onRowClick: function(e, d, a) {
        if ($(e.target).is(this.rowSelectorForRowClick)) {
            var g = $(d)
              , c = g.hasClass("ui-state-highlight")
              , f = e.metaKey || e.ctrlKey
              , b = e.shiftKey;
            this.assignFocusedRow(g);
            if (c && f) {
                this.unselectRow(g, a)
            } else {
                if (this.isSingleSelection() || (this.isMultipleSelection() && e && !f && !b && this.cfg.rowSelectMode === "new")) {
                    this.unselectAllRows()
                }
                if (this.isMultipleSelection() && e && e.shiftKey) {
                    this.selectRowsInRange(g)
                } else {
                    if (this.cfg.rowSelectMode === "add" && c) {
                        this.unselectRow(g, a)
                    } else {
                        this.originRowIndex = g.index();
                        this.cursorIndex = null;
                        this.selectRow(g, a)
                    }
                }
            }
            if (this.cfg.disabledTextSelection) {
                PrimeFaces.clearSelection()
            }
        }
    },
    onRowDblclick: function(a, c) {
        if (this.cfg.disabledTextSelection) {
            PrimeFaces.clearSelection()
        }
        if ($(a.target).is("td,span:not(.ui-c)")) {
            var b = this.getRowMeta(c);
            this.fireRowSelectEvent(b.key, "rowDblselect")
        }
    },
    onRowRightClick: function(c, b, f) {
        var e = $(b)
          , d = this.getRowMeta(e)
          , a = e.hasClass("ui-state-highlight");
        this.assignFocusedRow(e);
        if (f === "single" || !a) {
            this.unselectAllRows()
        }
        this.selectRow(e, true);
        this.fireRowSelectEvent(d.key, "contextMenu");
        if (this.cfg.disabledTextSelection) {
            PrimeFaces.clearSelection()
        }
    },
    findRow: function(a) {
        var b = a;
        if (PrimeFaces.isNumber(a)) {
            b = this.tbody.children("tr:eq(" + a + ")")
        }
        return b
    },
    selectRowsInRange: function(f) {
        var c = this.tbody.children()
          , e = this.getRowMeta(f)
          , d = this;
        if (this.cursorIndex !== null) {
            var g = this.cursorIndex
              , a = g > this.originRowIndex ? c.slice(this.originRowIndex, g + 1) : c.slice(g, this.originRowIndex + 1);
            a.each(function(h, j) {
                d.unselectRow($(j), true)
            })
        }
        this.cursorIndex = f.index();
        var b = this.cursorIndex > this.originRowIndex ? c.slice(this.originRowIndex, this.cursorIndex + 1) : c.slice(this.cursorIndex, this.originRowIndex + 1);
        b.each(function(h, j) {
            d.selectRow($(j), true)
        });
        this.fireRowSelectEvent(e.key, "rowSelect")
    },
    selectRow: function(b, a) {
        var d = this.findRow(b)
          , c = this.getRowMeta(d);
        this.highlightRow(d);
        if (this.isCheckboxSelectionEnabled()) {
            if (this.cfg.nativeElements) {
                d.children("td.ui-selection-column").find(":checkbox").prop("checked", true)
            } else {
                this.selectCheckbox(d.children("td.ui-selection-column").find("> div.ui-chkbox > div.ui-chkbox-box"))
            }
            this.updateHeaderCheckbox()
        }
        this.addSelection(c.key);
        this.writeSelections();
        if (!a) {
            this.fireRowSelectEvent(c.key, "rowSelect")
        }
    },
    unselectRow: function(b, a) {
        var d = this.findRow(b)
          , c = this.getRowMeta(d);
        this.unhighlightRow(d);
        if (this.isCheckboxSelectionEnabled()) {
            if (this.cfg.nativeElements) {
                d.children("td.ui-selection-column").find(":checkbox").prop("checked", false)
            } else {
                this.unselectCheckbox(d.children("td.ui-selection-column").find("> div.ui-chkbox > div.ui-chkbox-box"))
            }
            this.updateHeaderCheckbox()
        }
        this.removeSelection(c.key);
        this.writeSelections();
        if (!a) {
            this.fireRowUnselectEvent(c.key, "rowUnselect")
        }
    },
    highlightRow: function(a) {
        a.removeClass("ui-state-hover").addClass("ui-state-highlight").attr("aria-selected", true)
    },
    unhighlightRow: function(a) {
        a.removeClass("ui-state-highlight").attr("aria-selected", false)
    },
    fireRowSelectEvent: function(d, a) {
        if (this.cfg.behaviors) {
            var c = this.cfg.behaviors[a];
            if (c) {
                var b = {
                    params: [{
                        name: this.id + "_instantSelectedRowKey",
                        value: d
                    }]
                };
                c.call(this, b)
            }
        }
    },
    fireRowUnselectEvent: function(d, b) {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors[b];
            if (a) {
                var c = {
                    params: [{
                        name: this.id + "_instantUnselectedRowKey",
                        value: d
                    }]
                };
                a.call(this, c)
            }
        }
    },
    selectRowWithRadio: function(a) {
        var c = a.closest("tr")
          , b = this.getRowMeta(c);
        this.unselectAllRows();
        if (!this.cfg.nativeElements) {
            this.selectRadio(a)
        }
        this.highlightRow(c);
        this.addSelection(b.key);
        this.writeSelections();
        this.fireRowSelectEvent(b.key, "rowSelectRadio")
    },
    selectRowWithCheckbox: function(b, a) {
        var d = b.closest("tr")
          , c = this.getRowMeta(d);
        this.highlightRow(d);
        if (!this.cfg.nativeElements) {
            this.selectCheckbox(b)
        }
        this.addSelection(c.key);
        this.writeSelections();
        if (!a) {
            this.updateHeaderCheckbox();
            this.fireRowSelectEvent(c.key, "rowSelectCheckbox")
        }
    },
    unselectRowWithCheckbox: function(b, a) {
        var d = b.closest("tr")
          , c = this.getRowMeta(d);
        this.unhighlightRow(d);
        if (!this.cfg.nativeElements) {
            this.unselectCheckbox(b)
        }
        this.removeSelection(c.key);
        this.uncheckHeaderCheckbox();
        this.writeSelections();
        if (!a) {
            this.fireRowUnselectEvent(c.key, "rowUnselectCheckbox")
        }
    },
    unselectAllRows: function() {
        var c = this.tbody.children("tr.ui-state-highlight")
          , a = this.isCheckboxSelectionEnabled()
          , e = this.isRadioSelectionEnabled();
        for (var b = 0; b < c.length; b++) {
            var d = c.eq(b);
            this.unhighlightRow(d);
            if (a) {
                if (this.cfg.nativeElements) {
                    d.children("td.ui-selection-column").find(":checkbox").prop("checked", false)
                } else {
                    this.unselectCheckbox(d.children("td.ui-selection-column").find("> div.ui-chkbox > div.ui-chkbox-box"))
                }
            } else {
                if (e) {
                    if (this.cfg.nativeElements) {
                        d.children("td.ui-selection-column").find(":radio").prop("checked", false)
                    } else {
                        this.unselectRadio(d.children("td.ui-selection-column").find("> div.ui-radiobutton > div.ui-radiobutton-box"))
                    }
                }
            }
        }
        if (a) {
            this.uncheckHeaderCheckbox()
        }
        this.selection = [];
        this.writeSelections()
    },
    selectAllRowsOnPage: function() {
        var b = this.tbody.children("tr");
        for (var a = 0; a < b.length; a++) {
            var c = b.eq(a);
            this.selectRow(c, true)
        }
    },
    unselectAllRowsOnPage: function() {
        var b = this.tbody.children("tr");
        for (var a = 0; a < b.length; a++) {
            var c = b.eq(a);
            this.unselectRow(c, true)
        }
    },
    selectAllRows: function() {
        this.selectAllRowsOnPage();
        this.selection = new Array("@all");
        this.writeSelections()
    },
    toggleCheckAll: function() {
        if (this.cfg.nativeElements) {
            var d = this.tbody.find("> tr.ui-datatable-selectable > td.ui-selection-column > :checkbox:visible")
              , c = this.checkAllToggler.prop("checked")
              , e = this;
            d.each(function() {
                if (c) {
                    var f = $(this);
                    f.prop("checked", true);
                    e.selectRowWithCheckbox(f, true)
                } else {
                    var f = $(this);
                    f.prop("checked", false);
                    e.unselectRowWithCheckbox(f, true)
                }
            })
        } else {
            var d = this.tbody.find("> tr.ui-datatable-selectable > td.ui-selection-column .ui-chkbox-box:visible")
              , c = this.checkAllToggler.hasClass("ui-state-active")
              , e = this;
            if (c) {
                this.checkAllToggler.removeClass("ui-state-active").children("span.ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check");
                this.checkAllTogglerInput.prop("checked", false).attr("aria-checked", false);
                d.each(function() {
                    e.unselectRowWithCheckbox($(this), true)
                })
            } else {
                this.checkAllToggler.addClass("ui-state-active").children("span.ui-chkbox-icon").removeClass("ui-icon-blank").addClass("ui-icon-check");
                this.checkAllTogglerInput.prop("checked", true).attr("aria-checked", true);
                d.each(function() {
                    e.selectRowWithCheckbox($(this), true)
                })
            }
        }
        this.writeSelections();
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.toggleSelect;
            if (a) {
                var b = {
                    params: [{
                        name: this.id + "_checked",
                        value: !c
                    }]
                };
                a.call(this, b)
            }
        }
    },
    selectCheckbox: function(a) {
        if (!a.hasClass("ui-state-focus")) {
            a.addClass("ui-state-active")
        }
        a.children("span.ui-chkbox-icon:first").removeClass("ui-icon-blank").addClass(" ui-icon-check");
        a.prev().children("input").prop("checked", true).attr("aria-checked", true)
    },
    unselectCheckbox: function(a) {
        a.removeClass("ui-state-active");
        a.children("span.ui-chkbox-icon:first").addClass("ui-icon-blank").removeClass("ui-icon-check");
        a.prev().children("input").prop("checked", false).attr("aria-checked", false)
    },
    selectRadio: function(a) {
        a.removeClass("ui-state-hover");
        if (!a.hasClass("ui-state-focus")) {
            a.addClass("ui-state-active")
        }
        a.children(".ui-radiobutton-icon").addClass("ui-icon-bullet").removeClass("ui-icon-blank");
        a.prev().children("input").prop("checked", true)
    },
    unselectRadio: function(a) {
        a.removeClass("ui-state-active").children(".ui-radiobutton-icon").addClass("ui-icon-blank").removeClass("ui-icon-bullet");
        a.prev().children("input").prop("checked", false)
    },
    toggleExpansion: function(b) {
        var d = b.closest("tr")
          , g = this.getRowMeta(d).index
          , f = b.hasClass("ui-icon")
          , e = b.children("span")
          , a = f ? b.hasClass("ui-icon-circle-triangle-s") : b.children("span").eq(0).hasClass("ui-helper-hidden")
          , c = this;
        if ($.inArray(g, this.expansionProcess) === -1) {
            this.expansionProcess.push(g);
            if (a) {
                if (f) {
                    b.addClass("ui-icon-circle-triangle-e").removeClass("ui-icon-circle-triangle-s").attr("aria-expanded", false)
                } else {
                    e.eq(0).removeClass("ui-helper-hidden");
                    e.eq(1).addClass("ui-helper-hidden")
                }
                this.collapseRow(d);
                c.expansionProcess = $.grep(c.expansionProcess, function(h) {
                    return (h !== g)
                });
                this.fireRowCollapseEvent(d)
            } else {
                if (this.cfg.rowExpandMode === "single") {
                    this.collapseAllRows()
                }
                if (f) {
                    b.addClass("ui-icon-circle-triangle-s").removeClass("ui-icon-circle-triangle-e").attr("aria-expanded", true)
                } else {
                    e.eq(0).addClass("ui-helper-hidden");
                    e.eq(1).removeClass("ui-helper-hidden")
                }
                this.loadExpandedRowContent(d)
            }
        }
    },
    loadExpandedRowContent: function(e) {
        var a = e.next(".ui-expanded-row-content");
        if (a.length > 0) {
            a.remove()
        }
        var d = this
          , f = this.getRowMeta(e).index
          , b = {
            source: this.id,
            process: this.id,
            update: this.id,
            formId: this.cfg.formId,
            params: [{
                name: this.id + "_rowExpansion",
                value: true
            }, {
                name: this.id + "_expandedRowIndex",
                value: f
            }, {
                name: this.id + "_encodeFeature",
                value: true
            }, {
                name: this.id + "_skipChildren",
                value: true
            }],
            onsuccess: function(i, g, h) {
                PrimeFaces.ajax.Response.handle(i, g, h, {
                    widget: d,
                    handle: function(j) {
                        if (j && $.trim(j).length) {
                            e.addClass("ui-expanded-row");
                            this.displayExpandedRow(e, j)
                        }
                    }
                });
                return true
            },
            oncomplete: function() {
                d.expansionProcess = $.grep(d.expansionProcess, function(g) {
                    return g !== f
                })
            }
        };
        if (this.hasBehavior("rowToggle")) {
            var c = this.cfg.behaviors.rowToggle;
            c.call(this, b)
        } else {
            PrimeFaces.ajax.AjaxRequest(b)
        }
    },
    displayExpandedRow: function(b, a) {
        b.after(a)
    },
    fireRowCollapseEvent: function(c) {
        var d = this.getRowMeta(c).index;
        if (this.hasBehavior("rowToggle")) {
            var a = {
                params: [{
                    name: this.id + "_collapsedRowIndex",
                    value: d
                }]
            };
            var b = this.cfg.behaviors.rowToggle;
            b.call(this, a)
        }
    },
    collapseRow: function(a) {
        a.removeClass("ui-expanded-row").next(".ui-expanded-row-content").hide()
    },
    collapseAllRows: function() {
        var a = this;
        this.getExpandedRows().each(function() {
            var f = $(this);
            a.collapseRow(f);
            var c = f.children("td");
            for (var b = 0; b < c.length; b++) {
                var d = c.eq(b)
                  , e = d.children(".ui-row-toggler");
                if (e.length > 0) {
                    if (e.hasClass("ui-icon")) {
                        e.addClass("ui-icon-circle-triangle-e").removeClass("ui-icon-circle-triangle-s")
                    } else {
                        var g = e.children("span");
                        g.eq(0).removeClass("ui-helper-hidden");
                        g.eq(1).addClass("ui-helper-hidden")
                    }
                    break
                }
            }
        })
    },
    getExpandedRows: function() {
        return this.tbody.children(".ui-expanded-row")
    },
    bindEditEvents: function() {
        var d = this;
        this.cfg.cellSeparator = this.cfg.cellSeparator || " ";
        this.cfg.saveOnCellBlur = (this.cfg.saveOnCellBlur === false) ? false : true;
        if (this.cfg.editMode === "row") {
            var a = "> tr > td > div.ui-row-editor > a";
            this.tbody.off("click.datatable focus.datatable blur.datatable", a).on("click.datatable", a, null, function(g) {
                var f = $(this)
                  , h = f.closest("tr");
                if (f.hasClass("ui-row-editor-pencil")) {
                    d.switchToRowEdit(h);
                    f.hide().siblings().show()
                } else {
                    if (f.hasClass("ui-row-editor-check")) {
                        d.saveRowEdit(h)
                    } else {
                        if (f.hasClass("ui-row-editor-close")) {
                            d.cancelRowEdit(h)
                        }
                    }
                }
                g.preventDefault()
            }).on("focus.datatable", a, null, function(f) {
                $(this).addClass("ui-row-editor-outline")
            }).on("blur.datatable", a, null, function(f) {
                $(this).removeClass("ui-row-editor-outline")
            })
        } else {
            if (this.cfg.editMode === "cell") {
                var c = "> tr > td.ui-editable-column"
                  , b = (this.cfg.editInitEvent !== "click") ? this.cfg.editInitEvent + ".datatable-cell click.datatable-cell" : "click.datatable-cell";
                this.tbody.off(b, c).on(b, c, null, function(g) {
                    d.incellClick = true;
                    var f = $(this);
                    if (!f.hasClass("ui-cell-editing") && g.type === d.cfg.editInitEvent) {
                        d.showCellEditor($(this));
                        if (d.cfg.editInitEvent === "dblclick") {
                            d.incellClick = false
                        }
                    }
                });
                $(document).off("click.datatable-cell-blur" + this.id).on("click.datatable-cell-blur" + this.id, function(g) {
                    var f = $(g.target);
                    if (!d.incellClick && (f.is(".ui-input-overlay") || f.closest(".ui-input-overlay").length || f.closest(".ui-datepicker-buttonpane").length)) {
                        d.incellClick = true
                    }
                    if (!d.incellClick && d.currentCell && !d.contextMenuClick && !$.datepicker._datepickerShowing) {
                        if (d.cfg.saveOnCellBlur) {
                            d.saveCell(d.currentCell)
                        } else {
                            d.doCellEditCancelRequest(d.currentCell)
                        }
                    }
                    d.incellClick = false;
                    d.contextMenuClick = false
                })
            }
        }
    },
    switchToRowEdit: function(c) {
        this.showRowEditors(c);
        if (this.hasBehavior("rowEditInit")) {
            var b = this.cfg.behaviors.rowEditInit
              , d = this.getRowMeta(c).index;
            var a = {
                params: [{
                    name: this.id + "_rowEditIndex",
                    value: d
                }]
            };
            b.call(this, a)
        }
    },
    showRowEditors: function(a) {
        a.addClass("ui-state-highlight ui-row-editing").children("td.ui-editable-column").each(function() {
            var b = $(this);
            b.find(".ui-cell-editor-output").hide();
            b.find(".ui-cell-editor-input").show()
        })
    },
    cellEditInit: function(a) {
        var g = this.getRowMeta(a.closest("tr"))
          , e = a.children(".ui-cell-editor")
          , d = a.index()
          , f = this;
        if (this.cfg.scrollable && this.cfg.frozenColumns) {
            d = (this.scrollTbody.is(a.closest("tbody"))) ? (d + f.cfg.frozenColumns) : d
        }
        var c = g.index + "," + d;
        if (g.key) {
            c = c + "," + g.key
        }
        var b = {
            source: this.id,
            process: this.id,
            update: this.id,
            global: false,
            params: [{
                name: this.id + "_encodeFeature",
                value: true
            }, {
                name: this.id + "_cellEditInit",
                value: true
            }, {
                name: this.id + "_cellInfo",
                value: c
            }],
            onsuccess: function(j, h, i) {
                PrimeFaces.ajax.Response.handle(j, h, i, {
                    widget: f,
                    handle: function(k) {
                        e.children(".ui-cell-editor-input").html(k)
                    }
                });
                return true
            },
            oncomplete: function(j, h, i) {
                a.data("edit-events-bound", false);
                f.showCurrentCell(a)
            }
        };
        if (this.hasBehavior("cellEditInit")) {
            this.cfg.behaviors.cellEditInit.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    showCellEditor: function(d) {
        this.incellClick = true;
        var a = null;
        if (d) {
            a = d;
            if (this.contextMenuCell) {
                this.contextMenuCell.parent().removeClass("ui-state-highlight")
            }
        } else {
            a = this.contextMenuCell
        }
        var b = a.find("> .ui-cell-editor > .ui-cell-editor-input");
        if (b.length !== 0 && b.children().length === 0 && this.cfg.editMode === "cell") {
            this.cellEditInit(a)
        } else {
            this.showCurrentCell(a)
        }
    },
    showCurrentCell: function(j) {
        var f = this;
        if (this.currentCell) {
            if (this.cfg.saveOnCellBlur) {
                this.saveCell(this.currentCell)
            } else {
                if (!this.currentCell.is(j)) {
                    this.doCellEditCancelRequest(this.currentCell)
                }
            }
        }
        this.currentCell = j;
        var b = j.children("div.ui-cell-editor")
          , a = b.children("div.ui-cell-editor-output")
          , k = b.children("div.ui-cell-editor-input")
          , d = k.find(":input:enabled")
          , e = d.length > 1;
        j.addClass("ui-state-highlight ui-cell-editing");
        a.hide();
        k.show();
        d.eq(0).focus().select();
        if (e) {
            var h = [];
            for (var c = 0; c < d.length; c++) {
                var g = d.eq(c);
                if (g.is(":checkbox")) {
                    h.push(g.val() + "_" + g.is(":checked"))
                } else {
                    h.push(g.val())
                }
            }
            j.data("multi-edit", true);
            j.data("old-value", h)
        } else {
            j.data("multi-edit", false);
            j.data("old-value", d.eq(0).val())
        }
        if (!j.data("edit-events-bound")) {
            j.data("edit-events-bound", true);
            d.on("keydown.datatable-cell", function(o) {
                var n = $.ui.keyCode
                  , m = o.shiftKey
                  , l = o.which
                  , i = $(this);
                if (l === n.ENTER || l == n.NUMPAD_ENTER) {
                    f.saveCell(j);
                    o.preventDefault()
                } else {
                    if (l === n.TAB) {
                        if (e) {
                            var p = m ? i.index() - 1 : i.index() + 1;
                            if (p < 0 || (p === d.length) || i.parent().hasClass("ui-inputnumber") || i.parent().hasClass("ui-helper-hidden-accessible")) {
                                f.tabCell(j, !m)
                            } else {
                                d.eq(p).focus()
                            }
                        } else {
                            f.tabCell(j, !m)
                        }
                        o.preventDefault()
                    } else {
                        if (l === n.ESCAPE) {
                            f.doCellEditCancelRequest(j);
                            o.preventDefault()
                        }
                    }
                }
            }).on("focus.datatable-cell click.datatable-cell", function(i) {
                f.currentCell = j
            })
        }
    },
    tabCell: function(a, f) {
        var d = f ? a.nextAll("td.ui-editable-column:first") : a.prevAll("td.ui-editable-column:first");
        if (d.length == 0) {
            var e = f ? a.parent().next() : a.parent().prev();
            d = f ? e.children("td.ui-editable-column:first") : e.children("td.ui-editable-column:last")
        }
        var g = d.children("div.ui-cell-editor")
          , h = g.children("div.ui-cell-editor-input");
        if (h.length) {
            var c = h.find(":input")
              , b = c.filter(":disabled");
            if (c.length === b.length) {
                this.tabCell(d, f);
                return
            }
        }
        this.showCellEditor(d)
    },
    saveCell: function(k) {
        var f = k.find("div.ui-cell-editor-input :input:enabled")
          , d = false
          , a = k.data("valid")
          , g = this;
        if (k.data("multi-edit")) {
            var j = k.data("old-value");
            for (var e = 0; e < f.length; e++) {
                var h = f.eq(e)
                  , b = h.val();
                if (h.is(":checkbox")) {
                    var c = b + "_" + h.is(":checked");
                    if (c != j[e]) {
                        d = true;
                        break
                    }
                } else {
                    if (b != j[e]) {
                        d = true;
                        break
                    }
                }
            }
        } else {
            d = (f.eq(0).val() != k.data("old-value"))
        }
        if (d || !a) {
            g.doCellEditRequest(k)
        } else {
            g.viewMode(k)
        }
        if (this.cfg.saveOnCellBlur) {
            this.currentCell = null
        }
    },
    viewMode: function(a) {
        var b = a.children("div.ui-cell-editor")
          , d = b.children("div.ui-cell-editor-input")
          , c = b.children("div.ui-cell-editor-output");
        a.removeClass("ui-cell-editing ui-state-error ui-state-highlight");
        c.show();
        d.hide();
        a.removeData("old-value").removeData("multi-edit");
        if (this.cfg.cellEditMode === "lazy") {
            d.children().remove()
        }
    },
    doCellEditRequest: function(a) {
        var h = this.getRowMeta(a.closest("tr"))
          , e = a.children(".ui-cell-editor")
          , f = e.attr("id")
          , d = a.index()
          , g = this;
        if (this.cfg.scrollable && this.cfg.frozenColumns) {
            d = (this.scrollTbody.is(a.closest("tbody"))) ? (d + g.cfg.frozenColumns) : d
        }
        var c = h.index + "," + d;
        if (h.key) {
            c = c + "," + h.key
        }
        var b = {
            source: this.id,
            process: this.id,
            update: this.id,
            params: [{
                name: this.id + "_encodeFeature",
                value: true
            }, {
                name: this.id + "_cellInfo",
                value: c
            }, {
                name: f,
                value: f
            }],
            onsuccess: function(k, i, j) {
                PrimeFaces.ajax.Response.handle(k, i, j, {
                    widget: g,
                    handle: function(l) {
                        e.children(".ui-cell-editor-output").html(l)
                    }
                });
                return true
            },
            oncomplete: function(k, i, j) {
                if (j.validationFailed) {
                    a.data("valid", false);
                    a.addClass("ui-state-error")
                } else {
                    a.data("valid", true);
                    g.viewMode(a)
                }
                if (g.cfg.clientCache) {
                    g.clearCacheMap()
                }
            }
        };
        if (this.hasBehavior("cellEdit")) {
            this.cfg.behaviors.cellEdit.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    doCellEditCancelRequest: function(a) {
        var g = this.getRowMeta(a.closest("tr"))
          , e = a.children(".ui-cell-editor")
          , d = a.index()
          , f = this;
        if (this.cfg.scrollable && this.cfg.frozenColumns) {
            d = (this.scrollTbody.is(a.closest("tbody"))) ? (d + f.cfg.frozenColumns) : d
        }
        var c = g.index + "," + d;
        if (g.key) {
            c = c + "," + g.key
        }
        this.currentCell = null;
        var b = {
            source: this.id,
            process: this.id,
            update: this.id,
            params: [{
                name: this.id + "_encodeFeature",
                value: true
            }, {
                name: this.id + "_cellEditCancel",
                value: true
            }, {
                name: this.id + "_cellInfo",
                value: c
            }],
            onsuccess: function(j, h, i) {
                PrimeFaces.ajax.Response.handle(j, h, i, {
                    widget: f,
                    handle: function(k) {
                        e.children(".ui-cell-editor-input").html(k)
                    }
                });
                return true
            },
            oncomplete: function(j, h, i) {
                f.viewMode(a);
                a.data("edit-events-bound", false);
                if (f.cfg.clientCache) {
                    f.clearCacheMap()
                }
            }
        };
        if (this.hasBehavior("cellEditCancel")) {
            this.cfg.behaviors.cellEditCancel.call(this, b)
        } else {
            PrimeFaces.ajax.Request.handle(b)
        }
    },
    saveRowEdit: function(a) {
        this.doRowEditRequest(a, "save")
    },
    cancelRowEdit: function(a) {
        this.doRowEditRequest(a, "cancel")
    },
    doRowEditRequest: function(a, d) {
        var f = a.closest("tr")
          , g = this.getRowMeta(f).index
          , b = f.hasClass("ui-expanded-row")
          , e = this
          , c = {
            source: this.id,
            process: this.id,
            update: this.id,
            formId: this.cfg.formId,
            params: [{
                name: this.id + "_rowEditIndex",
                value: this.getRowMeta(f).index
            }, {
                name: this.id + "_rowEditAction",
                value: d
            }, {
                name: this.id + "_encodeFeature",
                value: true
            }],
            onsuccess: function(j, h, i) {
                PrimeFaces.ajax.Response.handle(j, h, i, {
                    widget: e,
                    handle: function(k) {
                        if (b) {
                            this.collapseRow(f)
                        }
                        this.updateRow(f, k)
                    }
                });
                return true
            },
            oncomplete: function(j, h, i) {
                if (i && i.validationFailed) {
                    e.invalidateRow(g)
                }
                if (e.cfg.clientCache) {
                    e.clearCacheMap()
                }
            }
        };
        if (d === "save") {
            this.getRowEditors(f).each(function() {
                c.params.push({
                    name: this.id,
                    value: this.id
                })
            })
        }
        if (d === "save" && this.hasBehavior("rowEdit")) {
            this.cfg.behaviors.rowEdit.call(this, c)
        } else {
            if (d === "cancel" && this.hasBehavior("rowEditCancel")) {
                this.cfg.behaviors.rowEditCancel.call(this, c)
            } else {
                PrimeFaces.ajax.Request.handle(c)
            }
        }
    },
    updateRow: function(b, a) {
        b.replaceWith(a)
    },
    invalidateRow: function(a) {
        var b = (this.paginator) ? (a % this.paginator.getRows()) : a;
        this.tbody.children("tr").eq(b).addClass("ui-widget-content ui-row-editing ui-state-error")
    },
    getRowEditors: function(a) {
        return a.find("div.ui-cell-editor")
    },
    getPaginator: function() {
        return this.paginator
    },
    writeSelections: function() {
        $(this.selectionHolder).val(this.selection.join(","))
    },
    isSingleSelection: function() {
        return this.cfg.selectionMode == "single"
    },
    isMultipleSelection: function() {
        return this.cfg.selectionMode == "multiple" || this.isCheckboxSelectionEnabled()
    },
    clearSelection: function() {
        this.selection = [];
        $(this.selectionHolder).val("")
    },
    isSelectionEnabled: function() {
        return this.cfg.selectionMode != undefined || this.cfg.columnSelectionMode != undefined
    },
    isCheckboxSelectionEnabled: function() {
        return this.cfg.selectionMode === "checkbox"
    },
    isRadioSelectionEnabled: function() {
        return this.cfg.selectionMode === "radio"
    },
    clearFilters: function() {
        var a = this.thead.find("> tr > th.ui-filter-column > .ui-column-filter");
        if (a.length == 0) {
            return
        }
        a.val("");
        $(this.jqId + "\\:globalFilter").val("");
        this.filter()
    },
    setupResizableColumns: function() {
        this.cfg.resizeMode = this.cfg.resizeMode || "fit";
        this.fixColumnWidths();
        this.hasColumnGroup = this.hasColGroup();
        if (this.hasColumnGroup) {
            this.addGhostRow()
        }
        if (!this.cfg.liveResize) {
            this.resizerHelper = $('<div class="ui-column-resizer-helper ui-state-highlight"></div>').appendTo(this.jq)
        }
        this.addResizers();
        var a = this.thead.find("> tr > th > span.ui-column-resizer")
          , b = this;
        a.draggable({
            axis: "x",
            start: function(d, e) {
                e.helper.data("originalposition", e.helper.offset());
                if (b.cfg.liveResize) {
                    b.jq.css("cursor", "col-resize")
                } else {
                    var f = b.cfg.stickyHeader ? b.clone : b.thead
                      , c = b.cfg.scrollable ? b.scrollBody.height() : f.parent().height() - f.height() - 1;
                    if (b.cfg.stickyHeader) {
                        c = c - b.relativeHeight
                    }
                    b.resizerHelper.height(c);
                    b.resizerHelper.show()
                }
            },
            drag: function(c, d) {
                if (b.cfg.liveResize) {
                    b.resize(c, d)
                } else {
                    b.resizerHelper.offset({
                        left: d.helper.offset().left + d.helper.width() / 2,
                        top: b.thead.offset().top + b.thead.height()
                    })
                }
            },
            stop: function(c, d) {
                d.helper.css({
                    left: "",
                    top: "0px"
                });
                if (b.cfg.liveResize) {
                    b.jq.css("cursor", "default")
                } else {
                    b.resize(c, d);
                    b.resizerHelper.hide()
                }
                if (b.cfg.resizeMode === "expand") {
                    setTimeout(function() {
                        b.fireColumnResizeEvent(d.helper.parent())
                    }, 5)
                } else {
                    b.fireColumnResizeEvent(d.helper.parent())
                }
                if (b.cfg.stickyHeader) {
                    b.reclone()
                }
            },
            containment: this.cfg.resizeMode === "expand" ? "document" : this.jq
        })
    },
    fireColumnResizeEvent: function(b) {
        if (this.hasBehavior("colResize")) {
            var a = {
                source: this.id,
                process: this.id,
                params: [{
                    name: this.id + "_colResize",
                    value: true
                }, {
                    name: this.id + "_columnId",
                    value: b.attr("id")
                }, {
                    name: this.id + "_width",
                    value: parseInt(b.width())
                }, {
                    name: this.id + "_height",
                    value: parseInt(b.height())
                }]
            };
            this.cfg.behaviors.colResize.call(this, a)
        }
    },
    hasColGroup: function() {
        return this.thead.children("tr").length > 1
    },
    addGhostRow: function() {
        var e = this.tbody.find("tr:first");
        if (e.hasClass("ui-datatable-empty-message")) {
            return
        }
        var b = e.children("td")
          , a = b.length
          , g = "";
        for (var c = 0; c < a; c++) {
            var d = b.eq(c).width() + 1
              , f = this.id + "_ghost_" + c;
            if (this.cfg.multiViewState && this.resizableStateHolder.attr("value")) {
                d = (this.findColWidthInResizableState(f) || d)
            }
            g += '<th id="' + f + '" style="height:0px;border-bottom-width: 0px;border-top-width: 0px;padding-top: 0px;padding-bottom: 0px;outline: 0 none; width:' + d + 'px" class="ui-resizable-column"></th>'
        }
        this.thead.prepend("<tr>" + g + "</tr>");
        if (this.cfg.scrollable) {
            this.theadClone.prepend("<tr>" + g + "</tr>");
            this.footerTable.children("tfoot").prepend("<tr>" + g + "</tr>")
        }
    },
    findGroupResizer: function(b) {
        for (var a = 0; a < this.groupResizers.length; a++) {
            var c = this.groupResizers.eq(a);
            if (c.offset().left === b.helper.data("originalposition").left) {
                return c
            }
        }
        return null
    },
    addResizers: function() {
        var a = this.thead.find("> tr > th.ui-resizable-column");
        a.prepend('<span class="ui-column-resizer">&nbsp;</span>');
        if (this.cfg.resizeMode === "fit") {
            a.filter(":last-child").children("span.ui-column-resizer").hide()
        }
        if (this.hasColumnGroup) {
            this.groupResizers = this.thead.find("> tr:first > th > .ui-column-resizer")
        }
    },
    resize: function(b, l) {
        var d, f, k = null, e = null, g = null, o = (this.cfg.resizeMode === "expand"), p = this.thead.parent(), i = this;
        if (this.hasColumnGroup) {
            var q = this.findGroupResizer(l);
            if (!q) {
                return
            }
            d = q.parent()
        } else {
            d = l.helper.parent()
        }
        var m = d.children(".ui-column-title");
        if (PrimeFaces.env.isIE()) {
            m.css("display", "none")
        }
        var f = d.nextAll(":visible:first");
        if (this.cfg.liveResize) {
            k = d.outerWidth() - (b.pageX - d.offset().left),
            e = (d.width() - k),
            g = (f.width() + k)
        } else {
            k = (l.position.left - l.originalPosition.left),
            e = (d.width() + k),
            g = (f.width() - k)
        }
        var a = parseInt(d.css("min-width"));
        a = (a == 0) ? 15 : a;
        if (PrimeFaces.env.isIE()) {
            m.css("display", "")
        }
        if ((e > a && g > a) || (o && e > a)) {
            if (o) {
                p.width(p.width() + k);
                setTimeout(function() {
                    d.width(e);
                    i.updateResizableState(d, f, p, e, null)
                }, 1)
            } else {
                d.width(e);
                f.width(g);
                this.updateResizableState(d, f, p, e, g)
            }
            if (this.cfg.scrollable) {
                var j = this.theadClone.parent()
                  , n = d.index();
                if (o) {
                    j.width(j.width() + k);
                    this.footerTable.width(this.footerTable.width() + k);
                    setTimeout(function() {
                        if (i.hasColumnGroup) {
                            i.theadClone.find("> tr:first").children("th").eq(n).width(e);
                            i.footerTable.find("> tfoot > tr:first").children("th").eq(n).width(e)
                        } else {
                            i.theadClone.find(PrimeFaces.escapeClientId(d.attr("id") + "_clone")).width(e);
                            i.footerCols.eq(n).width(e)
                        }
                    }, 1)
                } else {
                    if (this.hasColumnGroup) {
                        this.theadClone.find("> tr:first").children("th").eq(n).width(e);
                        this.theadClone.find("> tr:first").children("th").eq(n + 1).width(g);
                        this.footerTable.find("> tfoot > tr:first").children("th").eq(n).width(e);
                        this.footerTable.find("> tfoot > tr:first").children("th").eq(n + 1).width(g)
                    } else {
                        this.theadClone.find(PrimeFaces.escapeClientId(d.attr("id") + "_clone")).width(e);
                        this.theadClone.find(PrimeFaces.escapeClientId(f.attr("id") + "_clone")).width(g);
                        if (this.footerCols.length > 0) {
                            var h = this.footerCols.eq(n)
                              , c = h.next();
                            h.width(e);
                            c.width(g)
                        }
                    }
                }
            }
        }
    },
    removeSelection: function(a) {
        this.selection = $.grep(this.selection, function(b) {
            return b != a
        })
    },
    addSelection: function(a) {
        if (!this.isSelected(a)) {
            this.selection.push(a)
        }
    },
    isSelected: function(a) {
        return PrimeFaces.inArray(this.selection, a)
    },
    getRowMeta: function(b) {
        var a = {
            index: b.data("ri"),
            key: b.attr("data-rk")
        };
        return a
    },
    setupDraggableColumns: function() {
        this.orderStateHolder = $(this.jqId + "_columnOrder");
        this.saveColumnOrder();
        this.dragIndicatorTop = $('<span class="ui-icon ui-icon-arrowthick-1-s" style="position:absolute"/></span>').hide().appendTo(this.jq);
        this.dragIndicatorBottom = $('<span class="ui-icon ui-icon-arrowthick-1-n" style="position:absolute"/></span>').hide().appendTo(this.jq);
        var a = this;
        $(this.jqId + " thead th").draggable({
            appendTo: "body",
            opacity: 0.75,
            cursor: "move",
            scope: this.id,
            cancel: ":input,.ui-column-resizer",
            start: function(b, c) {
                c.helper.css("z-index", ++PrimeFaces.zindex)
            },
            drag: function(e, g) {
                var i = g.helper.data("droppable-column");
                if (i) {
                    var d = i.offset()
                      , b = d.top - 10
                      , c = d.top + i.height() + 8
                      , f = null;
                    if (e.originalEvent.pageX >= d.left + (i.width() / 2)) {
                        var h = i.next();
                        if (h.length == 1) {
                            f = h.offset().left - 9
                        } else {
                            f = i.offset().left + i.innerWidth() - 9
                        }
                        g.helper.data("drop-location", 1)
                    } else {
                        f = d.left - 9;
                        g.helper.data("drop-location", -1)
                    }
                    a.dragIndicatorTop.offset({
                        left: f,
                        top: b - 3
                    }).show();
                    a.dragIndicatorBottom.offset({
                        left: f,
                        top: c - 3
                    }).show()
                }
            },
            stop: function(b, c) {
                a.dragIndicatorTop.css({
                    left: 0,
                    top: 0
                }).hide();
                a.dragIndicatorBottom.css({
                    left: 0,
                    top: 0
                }).hide()
            },
            helper: function() {
                var c = $(this)
                  , b = $('<div class="ui-widget ui-state-default" style="padding:4px 10px;text-align:center;"></div>');
                b.width(c.width());
                b.height(c.height());
                b.html(c.html());
                return b.get(0)
            }
        }).droppable({
            hoverClass: "ui-state-highlight",
            tolerance: "pointer",
            scope: this.id,
            over: function(b, c) {
                c.helper.data("droppable-column", $(this))
            },
            drop: function(c, k) {
                var o = k.draggable
                  , g = k.helper.data("drop-location")
                  , h = $(this)
                  , f = null
                  , m = null;
                var l = a.tbody.find("> tr:not(.ui-expanded-row-content) > td:nth-child(" + (o.index() + 1) + ")")
                  , n = a.tbody.find("> tr:not(.ui-expanded-row-content) > td:nth-child(" + (h.index() + 1) + ")");
                if (a.tfoot.length) {
                    var b = a.tfoot.find("> tr > td")
                      , f = b.eq(o.index())
                      , m = b.eq(h.index())
                }
                if (g > 0) {
                    if (a.cfg.resizableColumns) {
                        if (h.next().length) {
                            h.children("span.ui-column-resizer").show();
                            o.children("span.ui-column-resizer").hide()
                        }
                    }
                    o.insertAfter(h);
                    l.each(function(p, q) {
                        $(this).insertAfter(n.eq(p))
                    });
                    if (f && m) {
                        f.insertAfter(m)
                    }
                    if (a.cfg.scrollable) {
                        var i = $(document.getElementById(o.attr("id") + "_clone"))
                          , e = $(document.getElementById(h.attr("id") + "_clone"));
                        i.insertAfter(e)
                    }
                } else {
                    o.insertBefore(h);
                    l.each(function(p, q) {
                        $(this).insertBefore(n.eq(p))
                    });
                    if (f && m) {
                        f.insertBefore(m)
                    }
                    if (a.cfg.scrollable) {
                        var i = $(document.getElementById(o.attr("id") + "_clone"))
                          , e = $(document.getElementById(h.attr("id") + "_clone"));
                        i.insertBefore(e)
                    }
                }
                a.saveColumnOrder();
                if (a.cfg.behaviors) {
                    var j = a.cfg.behaviors.colReorder;
                    if (j) {
                        var d = null;
                        if (a.cfg.multiViewState) {
                            d = {
                                params: [{
                                    name: this.id + "_encodeFeature",
                                    value: true
                                }]
                            }
                        }
                        j.call(a, d)
                    }
                }
            }
        })
    },
    saveColumnOrder: function() {
        var a = []
          , b = $(this.jqId + " thead:first th");
        b.each(function(c, d) {
            a.push($(d).attr("id"))
        });
        this.orderStateHolder.val(a.join(","))
    },
    makeRowsDraggable: function() {
        var b = this
          , a = this.cfg.rowDragSelector || "td,span:not(.ui-c)";
        this.tbody.sortable({
            placeholder: "ui-datatable-rowordering ui-state-active",
            cursor: "move",
            handle: a,
            appendTo: document.body,
            start: function(c, d) {
                d.helper.css("z-index", ++PrimeFaces.zindex)
            },
            helper: function(h, j) {
                var e = j.children()
                  , g = $('<div class="ui-datatable ui-widget"><table><tbody class="ui-datatable-data"></tbody></table></div>')
                  , d = j.clone()
                  , c = d.children();
                for (var f = 0; f < c.length; f++) {
                    c.eq(f).width(e.eq(f).width())
                }
                d.appendTo(g.find("tbody"));
                return g
            },
            update: function(e, f) {
                var d = f.item.data("ri")
                  , g = b.paginator ? b.paginator.getFirst() + f.item.index() : f.item.index();
                b.syncRowParity();
                var c = {
                    source: b.id,
                    process: b.id,
                    params: [{
                        name: b.id + "_rowreorder",
                        value: true
                    }, {
                        name: b.id + "_fromIndex",
                        value: d
                    }, {
                        name: b.id + "_toIndex",
                        value: g
                    }, {
                        name: this.id + "_skipChildren",
                        value: true
                    }]
                };
                if (b.hasBehavior("rowReorder")) {
                    b.cfg.behaviors.rowReorder.call(b, c)
                } else {
                    PrimeFaces.ajax.Request.handle(c)
                }
            },
            change: function(c, d) {
                if (b.cfg.scrollable) {
                    PrimeFaces.scrollInView(b.scrollBody, d.placeholder)
                }
            }
        })
    },
    syncRowParity: function() {
        var b = this.tbody.children("tr.ui-widget-content")
          , d = this.paginator ? this.paginator.getFirst() : 0;
        for (var a = d; a < b.length; a++) {
            var c = b.eq(a);
            c.data("ri", a).removeClass("ui-datatable-even ui-datatable-odd");
            if (a % 2 === 0) {
                c.addClass("ui-datatable-even")
            } else {
                c.addClass("ui-datatable-odd")
            }
        }
    },
    isEmpty: function() {
        return this.tbody.children("tr.ui-datatable-empty-message").length === 1
    },
    getSelectedRowsCount: function() {
        return this.isSelectionEnabled() ? this.selection.length : 0
    },
    updateHeaderCheckbox: function() {
        if (this.isEmpty()) {
            this.uncheckHeaderCheckbox();
            this.disableHeaderCheckbox()
        } else {
            var b, d, c, a;
            if (this.cfg.nativeElements) {
                b = this.tbody.find("> tr > td.ui-selection-column > :checkbox");
                c = b.filter(":enabled");
                a = b.filter(":disabled");
                d = c.filter(":checked")
            } else {
                b = this.tbody.find("> tr > td.ui-selection-column .ui-chkbox-box");
                c = b.filter(":not(.ui-state-disabled)");
                a = b.filter(".ui-state-disabled");
                d = c.prev().children(":checked")
            }
            if (c.length && c.length === d.length) {
                this.checkHeaderCheckbox()
            } else {
                this.uncheckHeaderCheckbox()
            }
            if (b.length === a.length) {
                this.disableHeaderCheckbox()
            } else {
                this.enableHeaderCheckbox()
            }
        }
    },
    checkHeaderCheckbox: function() {
        if (this.cfg.nativeElements) {
            this.checkAllToggler.prop("checked", true)
        } else {
            this.checkAllToggler.addClass("ui-state-active").children("span.ui-chkbox-icon").removeClass("ui-icon-blank").addClass("ui-icon-check");
            this.checkAllTogglerInput.prop("checked", true).attr("aria-checked", true)
        }
    },
    uncheckHeaderCheckbox: function() {
        if (this.cfg.nativeElements) {
            this.checkAllToggler.prop("checked", false)
        } else {
            this.checkAllToggler.removeClass("ui-state-active").children("span.ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check");
            this.checkAllTogglerInput.prop("checked", false).attr("aria-checked", false)
        }
    },
    disableHeaderCheckbox: function() {
        if (this.cfg.nativeElements) {
            this.checkAllToggler.prop("disabled", true)
        } else {
            this.checkAllToggler.addClass("ui-state-disabled")
        }
    },
    enableHeaderCheckbox: function() {
        if (this.cfg.nativeElements) {
            this.checkAllToggler.prop("disabled", false)
        } else {
            this.checkAllToggler.removeClass("ui-state-disabled")
        }
    },
    setupStickyHeader: function() {
        var b = this.thead.parent()
          , f = b.offset()
          , d = $(window)
          , c = this
          , e = "scroll." + this.id
          , a = "resize.sticky-" + this.id;
        this.stickyContainer = $('<div class="ui-datatable ui-datatable-sticky ui-widget"><table></table></div>');
        this.clone = this.thead.clone(false);
        this.stickyContainer.children("table").append(this.thead);
        b.prepend(this.clone);
        this.stickyContainer.css({
            position: "absolute",
            width: b.outerWidth(),
            top: f.top,
            left: f.left,
            "z-index": ++PrimeFaces.zindex
        });
        this.jq.prepend(this.stickyContainer);
        if (this.cfg.resizableColumns) {
            this.relativeHeight = 0
        }
        d.off(e).on(e, function() {
            var h = d.scrollTop()
              , g = b.offset();
            if (h > g.top) {
                c.stickyContainer.css({
                    position: "fixed",
                    top: "0px"
                }).addClass("ui-shadow ui-sticky");
                if (c.cfg.resizableColumns) {
                    c.relativeHeight = h - g.top
                }
                if (h >= (g.top + c.tbody.height())) {
                    c.stickyContainer.hide()
                } else {
                    c.stickyContainer.show()
                }
            } else {
                c.stickyContainer.css({
                    position: "absolute",
                    top: g.top
                }).removeClass("ui-shadow ui-sticky");
                if (c.stickyContainer.is(":hidden")) {
                    c.stickyContainer.show()
                }
                if (c.cfg.resizableColumns) {
                    c.relativeHeight = 0
                }
            }
        }).off(a).on(a, function() {
            c.stickyContainer.width(b.outerWidth())
        });
        this.clone.find(".ui-column-filter").prop("disabled", true)
    },
    getFocusableTbody: function() {
        return this.tbody
    },
    reclone: function() {
        this.clone.remove();
        this.clone = this.thead.clone(false);
        this.jq.find(".ui-datatable-tablewrapper > table").prepend(this.clone)
    },
    addRow: function() {
        var b = this
          , a = {
            source: this.id,
            process: this.id,
            update: this.id,
            params: [{
                name: this.id + "_addrow",
                value: true
            }, {
                name: this.id + "_skipChildren",
                value: true
            }, {
                name: this.id + "_encodeFeature",
                value: true
            }],
            onsuccess: function(e, c, d) {
                PrimeFaces.ajax.Response.handle(e, c, d, {
                    widget: b,
                    handle: function(f) {
                        this.tbody.append(f)
                    }
                });
                return true
            }
        };
        PrimeFaces.ajax.Request.handle(a)
    },
    clearCacheMap: function() {
        this.cacheMap = {}
    },
    loadDataWithCache: function(e) {
        var a = false;
        if (this.cacheRows != e.rows) {
            this.clearCacheMap();
            this.cacheRows = e.rows;
            a = true
        }
        var d = e.first
          , c = e.rows + d
          , b = this.cfg.paginator.pageCount * e.rows
          , f = (!this.cacheMap[c]) && c < b;
        if (this.cacheMap[d] && !a) {
            this.updateData(this.cacheMap[d]);
            this.paginator.cfg.page = e.page;
            this.paginator.updateUI();
            if (!f) {
                this.updatePageState(e)
            }
        } else {
            this.paginate(e)
        }
        if (f) {
            this.fetchNextPage(e)
        }
    },
    updateReflowDD: function(d, c) {
        if (this.reflowDD && this.cfg.reflow) {
            var a = this.reflowDD.children("option")
              , b = c > 0 ? 0 : 1;
            a.filter(":selected").prop("selected", false);
            a.filter('[value="' + d.index() + "_" + b + '"]').prop("selected", true)
        }
    },
    groupRows: function() {
        this.rows = this.tbody.children("tr");
        for (var a = 0; a < this.cfg.groupColumnIndexes.length; a++) {
            this.groupRow(this.cfg.groupColumnIndexes[a])
        }
        this.rows.children("td.ui-duplicated-column").remove()
    },
    groupRow: function(b) {
        var d = null
          , a = null
          , h = null;
        for (var c = 0; c < this.rows.length; c++) {
            var g = this.rows.eq(c);
            var e = g.children("td").eq(b);
            var f = e.text();
            if (a != f) {
                d = c;
                a = f;
                h = 1
            } else {
                e.addClass("ui-duplicated-column");
                h++
            }
            if (d != null && h > 1) {
                this.rows.eq(d).children("td").eq(b).attr("rowspan", h)
            }
        }
    },
    bindToggleRowGroupEvents: function() {
        var b = this.tbody.children("tr.ui-rowgroup-header")
          , a = b.find("> td:first > a.ui-rowgroup-toggler");
        a.off("click.dataTable-rowgrouptoggler").on("click.dataTable-rowgrouptoggler", function(g) {
            var d = $(this)
              , c = d.children(".ui-rowgroup-toggler-icon")
              , f = d.closest("tr.ui-rowgroup-header");
            if (c.hasClass("ui-icon-circle-triangle-s")) {
                d.attr("aria-expanded", false);
                c.addClass("ui-icon-circle-triangle-e").removeClass("ui-icon-circle-triangle-s");
                f.nextUntil("tr.ui-rowgroup-header").hide()
            } else {
                d.attr("aria-expanded", true);
                c.addClass("ui-icon-circle-triangle-s").removeClass("ui-icon-circle-triangle-e");
                f.nextUntil("tr.ui-rowgroup-header").show()
            }
            g.preventDefault()
        })
    },
    updateEmptyColspan: function() {
        var a = this.tbody.children("tr:first");
        if (a && a.hasClass("ui-datatable-empty-message")) {
            var d = this.thead.find("> tr:first th:not(.ui-helper-hidden)")
              , e = 0;
            for (var b = 0; b < d.length; b++) {
                var c = d.eq(b);
                if (c.is("[colspan]")) {
                    e += parseInt(c.attr("colspan"))
                } else {
                    e++
                }
            }
            a.children("td").attr("colspan", e)
        }
    },
    updateResizableState: function(c, h, r, f, k) {
        if (this.cfg.multiViewState) {
            var p = (this.cfg.resizeMode === "expand")
              , n = c.attr("id")
              , d = h.attr("id")
              , b = this.id + "_tableWidthState"
              , l = n + "_" + f
              , g = d + "_" + k
              , j = b + "_" + parseInt(r.css("width"))
              , q = false
              , m = false
              , o = false;
            for (var e = 0; e < this.resizableState.length; e++) {
                var a = this.resizableState[e];
                if (a.indexOf(n) === 0) {
                    this.resizableState[e] = l;
                    q = true
                } else {
                    if (!p && a.indexOf(d) === 0) {
                        this.resizableState[e] = g;
                        m = true
                    } else {
                        if (p && a.indexOf(b) === 0) {
                            this.resizableState[e] = j;
                            o = true
                        }
                    }
                }
            }
            if (!q) {
                this.resizableState.push(l)
            }
            if (!p && !m) {
                this.resizableState.push(g)
            }
            if (p && !o) {
                this.resizableState.push(j)
            }
            this.resizableStateHolder.val(this.resizableState.join(","))
        }
    },
    findColWidthInResizableState: function(c) {
        for (var a = 0; a < this.resizableState.length; a++) {
            var b = this.resizableState[a];
            if (b.indexOf(c) === 0) {
                return b.substring(b.lastIndexOf("_") + 1, b.length)
            }
        }
    },
    updateHiddenHeaders: function() {
        if (this.headers) {
            var a = this;
            this.headers.filter(".ui-helper-hidden").each(function() {
                var b = $(this);
                a.tbody.find("> tr > td:nth-child(" + (b.index() + 1) + ")").addClass("ui-helper-hidden")
            })
        }
    }
});
PrimeFaces.widget.FrozenDataTable = PrimeFaces.widget.DataTable.extend({
    setupScrolling: function() {
        this.scrollLayout = this.jq.find("> table > tbody > tr > td.ui-datatable-frozenlayout-right");
        this.frozenLayout = this.jq.find("> table > tbody > tr > td.ui-datatable-frozenlayout-left");
        this.scrollContainer = this.jq.find("> table > tbody > tr > td.ui-datatable-frozenlayout-right > .ui-datatable-scrollable-container");
        this.frozenContainer = this.jq.find("> table > tbody > tr > td.ui-datatable-frozenlayout-left > .ui-datatable-frozen-container");
        this.scrollHeader = this.scrollContainer.children(".ui-datatable-scrollable-header");
        this.scrollHeaderBox = this.scrollHeader.children("div.ui-datatable-scrollable-header-box");
        this.scrollBody = this.scrollContainer.children(".ui-datatable-scrollable-body");
        this.scrollFooter = this.scrollContainer.children(".ui-datatable-scrollable-footer");
        this.scrollFooterBox = this.scrollFooter.children("div.ui-datatable-scrollable-footer-box");
        this.scrollStateHolder = $(this.jqId + "_scrollState");
        this.scrollHeaderTable = this.scrollHeaderBox.children("table");
        this.scrollBodyTable = this.cfg.virtualScroll ? this.scrollBody.children("div").children("table") : this.scrollBody.children("table");
        this.scrollThead = this.thead.eq(1);
        this.scrollTbody = this.tbody.eq(1);
        this.scrollFooterTable = this.scrollFooterBox.children("table");
        this.scrollFooterCols = this.scrollFooter.find("> .ui-datatable-scrollable-footer-box > table > tfoot > tr > td");
        this.frozenHeader = this.frozenContainer.children(".ui-datatable-scrollable-header");
        this.frozenBody = this.frozenContainer.children(".ui-datatable-scrollable-body");
        this.frozenBodyTable = this.cfg.virtualScroll ? this.frozenBody.children("div").children("table") : this.frozenBody.children("table");
        this.frozenThead = this.thead.eq(0);
        this.frozenTbody = this.tbody.eq(0);
        this.frozenFooter = this.frozenContainer.children(".ui-datatable-scrollable-footer");
        this.frozenFooterTable = this.frozenFooter.find("> .ui-datatable-scrollable-footer-box > table");
        this.frozenFooterCols = this.frozenFooter.find("> .ui-datatable-scrollable-footer-box > table > tfoot > tr > td");
        this.percentageScrollHeight = this.cfg.scrollHeight && (this.cfg.scrollHeight.indexOf("%") !== -1);
        this.percentageScrollWidth = this.cfg.scrollWidth && (this.cfg.scrollWidth.indexOf("%") !== -1);
        this.frozenThead.find("> tr > th").addClass("ui-frozen-column");
        var c = this
          , b = this.getScrollbarWidth() + "px";
        if (this.cfg.scrollHeight) {
            if (this.percentageScrollHeight) {
                this.adjustScrollHeight()
            }
            if (this.hasVerticalOverflow()) {
                this.scrollHeaderBox.css("margin-right", b);
                this.scrollFooterBox.css("margin-right", b)
            }
        }
        if (this.cfg.selectionMode) {
            this.scrollTbody.removeAttr("tabindex")
        }
        this.fixColumnWidths();
        if (this.cfg.scrollWidth) {
            if (this.percentageScrollWidth) {
                this.adjustScrollWidth()
            } else {
                this.setScrollWidth(parseInt(this.cfg.scrollWidth))
            }
            if (this.hasVerticalOverflow()) {
                if (PrimeFaces.env.browser.webkit === true) {
                    this.frozenBody.append('<div style="height:' + b + ';border:1px solid transparent"></div>')
                } else {
                    this.frozenBodyTable.css("margin-bottom", b)
                }
            }
        }
        this.cloneHead();
        this.restoreScrollState();
        if (this.cfg.liveScroll) {
            this.scrollOffset = 0;
            this.cfg.liveScrollBuffer = (100 - this.cfg.liveScrollBuffer) / 100;
            this.shouldLiveScroll = true;
            this.loadingLiveScroll = false;
            this.allLoadedLiveScroll = c.cfg.scrollStep >= c.cfg.scrollLimit
        }
        if (this.cfg.virtualScroll) {
            var d = this.scrollTbody.children("tr.ui-widget-content");
            if (d) {
                this.rowHeight = d.outerHeight();
                this.scrollBody.children("div").css("height", parseFloat((this.cfg.scrollLimit * this.rowHeight) + "px"));
                this.frozenBody.children("div").css("height", parseFloat((this.cfg.scrollLimit * this.rowHeight) + "px"))
            }
        }
        this.scrollBody.scroll(function() {
            var i = c.scrollBody.scrollLeft()
              , h = c.scrollBody.scrollTop();
            c.scrollHeaderBox.css("margin-left", -i);
            c.scrollFooterBox.css("margin-left", -i);
            c.frozenBody.scrollTop(h);
            if (c.cfg.virtualScroll) {
                var f = this;
                clearTimeout(c.scrollTimeout);
                c.scrollTimeout = setTimeout(function() {
                    var l = c.scrollBody.outerHeight()
                      , k = c.scrollBodyTable.outerHeight()
                      , n = c.rowHeight * c.cfg.scrollStep
                      , j = parseFloat((c.cfg.scrollLimit * c.rowHeight) + "px")
                      , m = (j / n) || 1;
                    if (f.scrollTop + l > parseFloat(c.scrollBodyTable.css("top")) + k || f.scrollTop < parseFloat(c.scrollBodyTable.css("top"))) {
                        var o = Math.floor((f.scrollTop * m) / (f.scrollHeight)) + 1;
                        c.loadRowsWithVirtualScroll(o);
                        c.scrollBodyTable.css("top", ((o - 1) * n) + "px");
                        c.frozenBodyTable.css("top", ((o - 1) * n) + "px")
                    }
                }, 200)
            } else {
                if (c.shouldLiveScroll) {
                    var h = Math.ceil(this.scrollTop)
                      , g = this.scrollHeight
                      , e = this.clientHeight;
                    if ((h >= ((g * c.cfg.liveScrollBuffer) - (e))) && c.shouldLoadLiveScroll()) {
                        c.loadLiveRows()
                    }
                }
            }
            c.saveScrollState()
        });
        var a = "resize." + this.id;
        $(window).unbind(a).bind(a, function() {
            if (c.jq.is(":visible")) {
                if (c.percentageScrollHeight) {
                    c.adjustScrollHeight()
                }
                if (c.percentageScrollWidth) {
                    c.adjustScrollWidth()
                }
            }
        })
    },
    cloneHead: function() {
        this.frozenTheadClone = this.frozenThead.clone();
        this.frozenTheadClone.find("th").each(function() {
            var a = $(this);
            a.attr("id", a.attr("id") + "_clone");
            $(this).children().not(".ui-column-title").remove()
        });
        this.frozenTheadClone.removeAttr("id").addClass("ui-datatable-scrollable-theadclone").height(0).prependTo(this.frozenBodyTable);
        this.scrollTheadClone = this.scrollThead.clone();
        this.scrollTheadClone.find("th").each(function() {
            var a = $(this);
            a.attr("id", a.attr("id") + "_clone");
            $(this).children().not(".ui-column-title").remove()
        });
        this.scrollTheadClone.removeAttr("id").addClass("ui-datatable-scrollable-theadclone").height(0).prependTo(this.scrollBodyTable)
    },
    hasVerticalOverflow: function() {
        return this.scrollBodyTable.outerHeight() > this.scrollBody.outerHeight()
    },
    adjustScrollHeight: function() {
        var d = this.jq.parent().innerHeight() * (parseInt(this.cfg.scrollHeight) / 100)
          , f = this.jq.children(".ui-datatable-header").outerHeight(true)
          , b = this.jq.children(".ui-datatable-footer").outerHeight(true)
          , c = (this.scrollHeader.innerHeight() + this.scrollFooter.innerHeight())
          , e = this.paginator ? this.paginator.getContainerHeight(true) : 0
          , a = (d - (c + e + f + b));
        if (this.cfg.virtualScroll) {
            this.scrollBody.css("max-height", a);
            this.frozenBody.css("max-height", a)
        } else {
            this.scrollBody.height(a);
            this.frozenBody.height(a)
        }
    },
    adjustScrollWidth: function() {
        var b = this.jq.parent().innerWidth() - this.frozenLayout.innerWidth()
          , a = parseInt((b * (parseInt(this.cfg.scrollWidth) / 100)));
        this.setScrollWidth(a)
    },
    setScrollWidth: function(b) {
        var c = this
          , a = b + this.frozenLayout.width();
        this.jq.children(".ui-widget-header").each(function() {
            c.setOuterWidth($(this), a)
        });
        this.scrollHeader.width(b);
        this.scrollBody.css("margin-right", 0).width(b);
        this.scrollFooter.width(b)
    },
    fixColumnWidths: function() {
        if (!this.columnWidthsFixed) {
            if (this.cfg.scrollable) {
                this._fixColumnWidths(this.scrollHeader, this.scrollFooterCols, this.scrollColgroup);
                this._fixColumnWidths(this.frozenHeader, this.frozenFooterCols, this.frozenColgroup)
            } else {
                this.jq.find("> .ui-datatable-tablewrapper > table > thead > tr > th").each(function() {
                    var a = $(this)
                      , c = a[0].style
                      , b = c.width || a.width();
                    a.width(b)
                })
            }
            this.columnWidthsFixed = true
        }
    },
    _fixColumnWidths: function(b, a) {
        b.find("> .ui-datatable-scrollable-header-box > table > thead > tr > th").each(function() {
            var g = $(this)
              , d = g.index()
              , c = g[0].style
              , e = c.width || g.width();
            g.width(e);
            if (a.length > 0) {
                var f = a.eq(d);
                f.width(e)
            }
        })
    },
    updateData: function(d, g) {
        var m = $("<table><tbody>" + d + "</tbody></table>")
          , o = m.find("> tbody > tr")
          , j = (g === undefined) ? true : g;
        if (j) {
            this.frozenTbody.children().remove();
            this.scrollTbody.children().remove()
        }
        var c = this.frozenTbody.children("tr:first")
          , k = c.length ? c.children("td").length : this.cfg.frozenColumns;
        for (var e = 0; e < o.length; e++) {
            var n = o.eq(e)
              , b = n.children("td")
              , l = this.copyRow(n)
              , h = this.copyRow(n);
            if (n.hasClass("ui-datatable-empty-message")) {
                var a = b.attr("colspan")
                  , f = b.clone();
                l.append(b.attr("colspan", this.cfg.frozenColumns));
                h.append(f.attr("colspan", (a - this.cfg.frozenColumns)))
            } else {
                l.append(b.slice(0, k));
                h.append(b.slice(k))
            }
            this.frozenTbody.append(l);
            this.scrollTbody.append(h)
        }
        this.postUpdateData()
    },
    copyRow: function(a) {
        return $("<tr></tr>").data("ri", a.data("ri")).attr("data-rk", a.data("rk")).addClass(a.attr("class")).attr("role", "row")
    },
    getThead: function() {
        return $(this.jqId + "_frozenThead," + this.jqId + "_scrollableThead")
    },
    getTbody: function() {
        return $(this.jqId + "_frozenTbody," + this.jqId + "_scrollableTbody")
    },
    getTfoot: function() {
        return $(this.jqId + "_frozenTfoot," + this.jqId + "_scrollableTfoot")
    },
    bindRowHover: function(a) {
        var b = this;
        this.tbody.off("mouseover.datatable mouseout.datatable", a).on("mouseover.datatable", a, null, function() {
            var c = $(this)
              , d = b.getTwinRow(c);
            if (!c.hasClass("ui-state-highlight")) {
                c.addClass("ui-state-hover");
                d.addClass("ui-state-hover")
            }
        }).on("mouseout.datatable", a, null, function() {
            var c = $(this)
              , d = b.getTwinRow(c);
            if (!c.hasClass("ui-state-highlight")) {
                c.removeClass("ui-state-hover");
                d.removeClass("ui-state-hover")
            }
        })
    },
    getTwinRow: function(b) {
        var a = (this.tbody.index(b.parent()) === 0) ? this.tbody.eq(1) : this.tbody.eq(0);
        return a.children().eq(b.index())
    },
    highlightRow: function(a) {
        this._super(a);
        this._super(this.getTwinRow(a))
    },
    unhighlightRow: function(a) {
        this._super(a);
        this._super(this.getTwinRow(a))
    },
    displayExpandedRow: function(b, a) {
        var d = this.getTwinRow(b);
        b.after(a);
        var c = b.next();
        c.show();
        d.after('<tr class="ui-expanded-row-content ui-widget-content"><td></td></tr>');
        d.next().children("td").attr("colspan", d.children("td").length).height(c.children("td").height())
    },
    collapseRow: function(a) {
        this._super(a);
        this._super(this.getTwinRow(a))
    },
    getExpandedRows: function() {
        return this.frozenTbody.children(".ui-expanded-row")
    },
    showRowEditors: function(a) {
        this._super(a);
        this._super(this.getTwinRow(a))
    },
    updateRow: function(g, e) {
        var d = $("<table><tbody>" + e + "</tbody></table>")
          , b = d.find("> tbody > tr")
          , c = b.children("td")
          , a = this.copyRow(b)
          , f = this.copyRow(b)
          , h = this.getTwinRow(g);
        a.append(c.slice(0, this.cfg.frozenColumns));
        f.append(c.slice(this.cfg.frozenColumns));
        g.replaceWith(a);
        h.replaceWith(f)
    },
    invalidateRow: function(a) {
        this.frozenTbody.children("tr").eq(a).addClass("ui-widget-content ui-row-editing ui-state-error");
        this.scrollTbody.children("tr").eq(a).addClass("ui-widget-content ui-row-editing ui-state-error")
    },
    getRowEditors: function(a) {
        return a.find("div.ui-cell-editor").add(this.getTwinRow(a).find("div.ui-cell-editor"))
    },
    findGroupResizer: function(a) {
        var b = this._findGroupResizer(a, this.frozenGroupResizers);
        if (b) {
            return b
        } else {
            return this._findGroupResizer(a, this.scrollGroupResizers)
        }
    },
    _findGroupResizer: function(c, a) {
        for (var b = 0; b < a.length; b++) {
            var d = a.eq(b);
            if (d.offset().left === c.helper.data("originalposition").left) {
                return d
            }
        }
        return null
    },
    addResizers: function() {
        var b = this.frozenThead.find("> tr > th.ui-resizable-column")
          , a = this.scrollThead.find("> tr > th.ui-resizable-column");
        b.prepend('<span class="ui-column-resizer">&nbsp;</span>');
        a.prepend('<span class="ui-column-resizer">&nbsp;</span>');
        if (this.cfg.resizeMode === "fit") {
            b.filter(":last-child").addClass("ui-frozen-column-last");
            a.filter(":last-child").children("span.ui-column-resizer").hide()
        }
        if (this.hasColumnGroup) {
            this.frozenGroupResizers = this.frozenThead.find("> tr:first > th > .ui-column-resizer");
            this.scrollGroupResizers = this.scrollThead.find("> tr:first > th > .ui-column-resizer")
        }
    },
    resize: function(s, o) {
        var u = null
          , j = null
          , k = null
          , q = null
          , c = (this.cfg.resizeMode === "expand");
        if (this.hasColumnGroup) {
            var r = this.findGroupResizer(o);
            if (!r) {
                return
            }
            u = r.parent()
        } else {
            u = o.helper.parent()
        }
        var h = u.next();
        var n = u.index()
          , b = u.hasClass("ui-frozen-column-last");
        if (this.cfg.liveResize) {
            j = u.outerWidth() - (s.pageX - u.offset().left),
            k = (u.width() - j),
            q = (h.width() + j)
        } else {
            j = (o.position.left - o.originalPosition.left),
            k = (u.width() + j),
            q = (h.width() - j)
        }
        var m = parseInt(u.css("min-width"));
        m = (m == 0) ? 15 : m;
        var f = (c && k > m) || (b ? (k > m) : (k > m && q > m));
        if (f) {
            var i = u.hasClass("ui-frozen-column")
              , l = i ? this.frozenTheadClone : this.scrollTheadClone
              , a = i ? this.frozenThead.parent() : this.scrollThead.parent()
              , e = l.parent()
              , y = i ? this.frozenFooterCols : this.scrollFooterCols
              , x = i ? this.frozenFooterTable : this.scrollFooterTable
              , g = this;
            if (c) {
                if (b) {
                    this.frozenLayout.width(this.frozenLayout.width() + j)
                }
                var p = a.width()
                  , d = e.width()
                  , v = x.width();
                a.width(p + j);
                e.width(d + j);
                x.width(v + j);
                setTimeout(function() {
                    u.width(k);
                    if (g.hasColumnGroup) {
                        l.find("> tr:first").children("th").eq(n).width(k);
                        x.find("> tfoot > tr:first").children("th").eq(n).width(k)
                    } else {
                        l.find(PrimeFaces.escapeClientId(u.attr("id") + "_clone")).width(k);
                        y.eq(n).width(k)
                    }
                }, 1)
            } else {
                if (b) {
                    this.frozenLayout.width(this.frozenLayout.width() + j)
                }
                u.width(k);
                h.width(q);
                if (this.hasColumnGroup) {
                    l.find("> tr:first").children("th").eq(n).width(k);
                    l.find("> tr:first").children("th").eq(n + 1).width(q);
                    x.find("> tfoot > tr:first").children("th").eq(n).width(k);
                    x.find("> tfoot > tr:first").children("th").eq(n + 1).width(q)
                } else {
                    l.find(PrimeFaces.escapeClientId(u.attr("id") + "_clone")).width(k);
                    l.find(PrimeFaces.escapeClientId(h.attr("id") + "_clone")).width(q);
                    if (y.length > 0) {
                        var w = y.eq(n)
                          , t = w.next();
                        w.width(k);
                        t.width(q)
                    }
                }
            }
        }
    },
    hasColGroup: function() {
        return this.frozenThead.children("tr").length > 1 || this.scrollThead.children("tr").length > 1
    },
    addGhostRow: function() {
        this._addGhostRow(this.frozenTbody, this.frozenThead, this.frozenTheadClone, this.frozenFooter.find("table"), "ui-frozen-column");
        this._addGhostRow(this.scrollTbody, this.scrollThead, this.scrollTheadClone, this.scrollFooterTable)
    },
    _addGhostRow: function(g, e, f, h, c) {
        var b = g.find("tr:first").children("td")
          , a = b.length
          , j = ""
          , k = c ? "ui-resizable-column " + c : "ui-resizable-column";
        for (var d = 0; d < a; d++) {
            j += '<th style="height:0px;border-bottom-width: 0px;border-top-width: 0px;padding-top: 0px;padding-bottom: 0px;outline: 0 none;width:' + b.eq(d).width() + 'px" class="' + k + '"></th>'
        }
        e.prepend("<tr>" + j + "</tr>");
        if (this.cfg.scrollable) {
            f.prepend("<tr>" + j + "</tr>");
            h.children("tfoot").prepend("<tr>" + j + "</tr>")
        }
    },
    getFocusableTbody: function() {
        return this.tbody.eq(0)
    },
    highlightFocusedRow: function() {
        this._super();
        this.getTwinRow(this.focusedRow).addClass("ui-state-hover")
    },
    unhighlightFocusedRow: function() {
        this._super();
        this.getTwinRow(this.focusedRow).removeClass("ui-state-hover")
    },
    assignFocusedRow: function(a) {
        this._super(a);
        if (!a.parent().attr("tabindex")) {
            this.frozenTbody.trigger("focus")
        }
    },
    saveColumnOrder: function() {
        var a = []
          , b = $(this.jqId + "_frozenThead:first th," + this.jqId + "_scrollableThead:first th");
        b.each(function(c, d) {
            a.push($(d).attr("id"))
        });
        this.orderStateHolder.val(a.join(","))
    }
});
PrimeFaces.widget.Dialog = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        this.content = this.jq.children(".ui-dialog-content");
        this.titlebar = this.jq.children(".ui-dialog-titlebar");
        this.footer = this.jq.find(".ui-dialog-footer");
        this.icons = this.titlebar.children(".ui-dialog-titlebar-icon");
        this.closeIcon = this.titlebar.children(".ui-dialog-titlebar-close");
        this.minimizeIcon = this.titlebar.children(".ui-dialog-titlebar-minimize");
        this.maximizeIcon = this.titlebar.children(".ui-dialog-titlebar-maximize");
        this.blockEvents = "focus." + this.id + " mousedown." + this.id + " mouseup." + this.id;
        this.resizeNS = "resize." + this.id;
        this.cfg.absolutePositioned = this.jq.hasClass("ui-dialog-absolute");
        this.jqEl = this.jq[0];
        this.positionInitialized = false;
        this.cfg.width = this.cfg.width || "auto";
        this.cfg.height = this.cfg.height || "auto";
        this.cfg.draggable = this.cfg.draggable === false ? false : true;
        this.cfg.resizable = this.cfg.resizable === false ? false : true;
        this.cfg.minWidth = this.cfg.minWidth || 150;
        this.cfg.minHeight = this.cfg.minHeight || this.titlebar.outerHeight();
        this.cfg.position = this.cfg.position || "center";
        this.parent = this.jq.parent();
        this.initSize();
        this.bindEvents();
        if (this.cfg.draggable) {
            this.setupDraggable()
        }
        if (this.cfg.resizable) {
            this.setupResizable()
        }
        if (this.cfg.appendTo) {
            this.parent = this.jq.parent();
            this.targetParent = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.appendTo);
            if (!this.parent.is(this.targetParent)) {
                this.jq.appendTo(this.targetParent)
            }
        }
        if ($(document.body).children(".ui-dialog-docking-zone").length === 0) {
            $(document.body).append('<div class="ui-dialog-docking-zone"></div>')
        }
        var b = $(this.jqId + "_modal");
        if (b.length > 0) {
            b.remove()
        }
        this.applyARIA();
        if (this.cfg.visible) {
            this.show()
        }
        if (this.cfg.responsive) {
            this.bindResizeListener()
        }
    },
    refresh: function(a) {
        this.positionInitialized = false;
        this.loaded = false;
        $(document).off("keydown.dialog_" + a.id);
        if (a.appendTo) {
            var b = $("[id=" + a.id.replace(/:/g, "\\:") + "]");
            if (b.length > 1) {
                PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(a.appendTo).children(this.jqId).remove()
            }
        }
        if (this.minimized) {
            var c = $(document.body).children(".ui-dialog-docking-zone");
            if (c.length && c.children(this.jqId).length) {
                this.removeMinimize();
                c.children(this.jqId).remove()
            }
        }
        this.minimized = false;
        this.maximized = false;
        this.init(a)
    },
    destroy: function() {
        this._super();
        if (this.cfg.responsive) {
            this.unbindResizeListener()
        }
    },
    initSize: function() {
        this.jq.css({
            width: this.cfg.width,
            height: "auto"
        });
        this.content.height(this.cfg.height);
        if (this.cfg.fitViewport) {
            this.fitViewport()
        }
    },
    fitViewport: function() {
        var f = $(window).height();
        var e = this.jq.outerHeight(true) - this.jq.outerHeight();
        var b = this.titlebar.outerHeight(true);
        var a = this.content.innerHeight() - this.content.height();
        var c = this.footer.outerHeight(true) || 0;
        var d = f - (e + b + a + c);
        this.content.css("max-height", d + "px")
    },
    enableModality: function() {
        var b = this
          , a = $(document);
        $(document.body).append('<div id="' + this.id + '_modal" class="ui-widget-overlay ui-dialog-mask"></div>').children(this.jqId + "_modal").css("z-index", this.jq.css("z-index") - 1);
        a.on("keydown." + this.id, function(e) {
            var f = $(e.target);
            if (e.which === $.ui.keyCode.TAB) {
                var d = b.jq.find(":tabbable").add(b.footer.find(":tabbable"));
                if (d.length) {
                    var g = d.filter(":first")
                      , c = d.filter(":last")
                      , h = null;
                    if (g.is(":radio")) {
                        h = d.filter('[name="' + g.attr("name") + '"]').filter(":checked");
                        if (h.length > 0) {
                            g = h
                        }
                    }
                    if (c.is(":radio")) {
                        h = d.filter('[name="' + c.attr("name") + '"]').filter(":checked");
                        if (h.length > 0) {
                            c = h
                        }
                    }
                    if (f.is(document.body)) {
                        g.focus(1);
                        e.preventDefault()
                    } else {
                        if (e.target === c[0] && !e.shiftKey) {
                            g.focus(1);
                            e.preventDefault()
                        } else {
                            if (e.target === g[0] && e.shiftKey) {
                                c.focus(1);
                                e.preventDefault()
                            }
                        }
                    }
                }
            } else {
                if (!f.is(document.body) && (f.zIndex() < b.jq.zIndex())) {
                    e.preventDefault()
                }
            }
        }).on(this.blockEvents, function(c) {
            if ($(c.target).zIndex() < b.jq.zIndex()) {
                c.preventDefault()
            }
        })
    },
    disableModality: function() {
        $(document.body).children(this.jqId + "_modal").remove();
        $(document).off(this.blockEvents).off("keydown." + this.id)
    },
    show: function() {
        if (this.isVisible()) {
            return
        }
        if (!this.loaded && this.cfg.dynamic) {
            this.loadContents()
        } else {
            if (this.cfg.fitViewport) {
                this.fitViewport()
            }
            if (this.positionInitialized === false) {
                this.jqEl.style.visibility = "hidden";
                this.jqEl.style.display = "block";
                this.initPosition();
                this.jqEl.style.display = "none";
                this.jqEl.style.visibility = "visible"
            }
            this._show()
        }
    },
    _show: function() {
        this.moveToTop();
        if (this.cfg.absolutePositioned) {
            var a = $(window).scrollTop();
            this.jq.css("top", parseFloat(this.jq.css("top")) + (a - this.lastScrollTop) + "px");
            this.lastScrollTop = a
        }
        if (this.cfg.showEffect) {
            var b = this;
            this.jq.show(this.cfg.showEffect, null, "normal", function() {
                b.postShow()
            })
        } else {
            this.jq.show();
            this.postShow()
        }
        if (this.cfg.modal) {
            this.enableModality()
        }
    },
    postShow: function() {
        this.fireBehaviorEvent("open");
        PrimeFaces.invokeDeferredRenders(this.id);
        if (this.cfg.onShow) {
            this.cfg.onShow.call(this)
        }
        this.jq.attr({
            "aria-hidden": false,
            "aria-live": "polite"
        });
        this.applyFocus()
    },
    hide: function() {
        if (!this.isVisible()) {
            return
        }
        if (this.cfg.hideEffect) {
            var a = this;
            this.jq.hide(this.cfg.hideEffect, null, "normal", function() {
                if (a.cfg.modal) {
                    a.disableModality()
                }
                a.onHide()
            })
        } else {
            this.jq.hide();
            if (this.cfg.modal) {
                this.disableModality()
            }
            this.onHide()
        }
    },
    applyFocus: function() {
        if (this.cfg.focus) {
            PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.focus).focus()
        } else {
            this.jq.find(":not(:submit):not(:button):not(:radio):not(:checkbox):input:visible:enabled:first").focus()
        }
    },
    bindEvents: function() {
        var a = this;
        this.jq.mousedown(function(b) {
            if (!$(b.target).data("primefaces-overlay-target")) {
                a.moveToTop()
            }
        });
        this.icons.on("mouseover", function() {
            $(this).addClass("ui-state-hover")
        }).on("mouseout", function() {
            $(this).removeClass("ui-state-hover")
        }).on("focus", function() {
            $(this).addClass("ui-state-focus")
        }).on("blur", function() {
            $(this).removeClass("ui-state-focus")
        });
        this.closeIcon.on("click", function(b) {
            a.hide();
            b.preventDefault()
        });
        this.maximizeIcon.click(function(b) {
            a.toggleMaximize();
            b.preventDefault()
        });
        this.minimizeIcon.click(function(b) {
            a.toggleMinimize();
            b.preventDefault()
        });
        if (this.cfg.closeOnEscape) {
            $(document).on("keydown.dialog_" + this.id, function(d) {
                var c = $.ui.keyCode
                  , b = parseInt(a.jq.css("z-index")) === PrimeFaces.zindex;
                if (d.which === c.ESCAPE && a.isVisible() && b) {
                    a.hide()
                }
            })
        }
    },
    setupDraggable: function() {
        var a = this;
        this.jq.draggable({
            cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
            handle: ".ui-dialog-titlebar",
            containment: a.cfg.absolutePositioned ? "document" : "window",
            stop: function(d, e) {
                if (a.hasBehavior("move")) {
                    var b = a.cfg.behaviors.move;
                    var c = {
                        params: [{
                            name: a.id + "_top",
                            value: e.offset.top
                        }, {
                            name: a.id + "_left",
                            value: e.offset.left
                        }]
                    };
                    b.call(a, c)
                }
            }
        })
    },
    setupResizable: function() {
        var a = this;
        this.jq.resizable({
            handles: "n,s,e,w,ne,nw,se,sw",
            minWidth: this.cfg.minWidth,
            minHeight: this.cfg.minHeight,
            alsoResize: this.content,
            containment: "document",
            start: function(b, c) {
                a.jq.data("offset", a.jq.offset());
                if (a.cfg.hasIframe) {
                    a.iframeFix = $('<div style="position:absolute;background-color:transparent;width:100%;height:100%;top:0;left:0;"></div>').appendTo(a.content)
                }
            },
            stop: function(b, c) {
                a.jq.css("position", "fixed");
                if (a.cfg.hasIframe) {
                    a.iframeFix.remove()
                }
            }
        });
        this.resizers = this.jq.children(".ui-resizable-handle")
    },
    initPosition: function() {
        var c = this;
        this.jq.css({
            left: 0,
            top: 0
        });
        if (/(center|left|top|right|bottom)/.test(this.cfg.position)) {
            this.cfg.position = this.cfg.position.replace(",", " ");
            this.jq.position({
                my: "center",
                at: this.cfg.position,
                collision: "fit",
                of: window,
                using: function(h) {
                    var e = h.left < 0 ? 0 : h.left
                      , f = h.top < 0 ? 0 : h.top
                      , g = $(window).scrollTop();
                    if (c.cfg.absolutePositioned) {
                        f += g;
                        c.lastScrollTop = g
                    }
                    $(this).css({
                        left: e,
                        top: f
                    })
                }
            })
        } else {
            var b = this.cfg.position.split(",")
              , a = $.trim(b[0])
              , d = $.trim(b[1]);
            this.jq.offset({
                left: a,
                top: d
            })
        }
        this.positionInitialized = true
    },
    onHide: function(a, b) {
        this.fireBehaviorEvent("close");
        this.jq.attr({
            "aria-hidden": true,
            "aria-live": "off"
        });
        if (this.cfg.onHide) {
            this.cfg.onHide.call(this, a, b)
        }
    },
    moveToTop: function() {
        this.jq.css("z-index", ++PrimeFaces.zindex)
    },
    toggleMaximize: function() {
        if (this.minimized) {
            this.toggleMinimize()
        }
        if (this.maximized) {
            this.jq.removeClass("ui-dialog-maximized");
            this.restoreState();
            this.maximizeIcon.children(".ui-icon").removeClass("ui-icon-newwin").addClass("ui-icon-extlink");
            this.maximized = false;
            this.fireBehaviorEvent("restoreMaximize")
        } else {
            this.saveState();
            var b = $(window);
            this.jq.addClass("ui-dialog-maximized").css({
                width: b.width() - 6,
                height: b.height()
            }).offset({
                top: b.scrollTop(),
                left: b.scrollLeft()
            });
            var a = this.content.innerHeight() - this.content.height();
            this.content.css({
                width: "auto",
                height: this.jq.height() - this.titlebar.outerHeight() - a
            });
            this.maximizeIcon.removeClass("ui-state-hover").children(".ui-icon").removeClass("ui-icon-extlink").addClass("ui-icon-newwin");
            this.maximized = true;
            this.fireBehaviorEvent("maximize")
        }
    },
    toggleMinimize: function() {
        var a = true
          , c = $(document.body).children(".ui-dialog-docking-zone");
        if (this.maximized) {
            this.toggleMaximize();
            a = false
        }
        var b = this;
        if (this.minimized) {
            this.removeMinimize();
            this.fireBehaviorEvent("restoreMinimize")
        } else {
            this.saveState();
            if (a) {
                this.jq.effect("transfer", {
                    to: c,
                    className: "ui-dialog-minimizing"
                }, 500, function() {
                    b.dock(c);
                    b.jq.addClass("ui-dialog-minimized")
                })
            } else {
                this.dock(c);
                this.jq.addClass("ui-dialog-minimized")
            }
        }
    },
    dock: function(a) {
        a.css("z-index", this.jq.css("z-index"));
        this.jq.appendTo(a).css("position", "static");
        this.jq.css({
            height: "auto",
            width: "auto",
            "float": "left"
        });
        this.content.hide();
        this.minimizeIcon.removeClass("ui-state-hover").children(".ui-icon").removeClass("ui-icon-minus").addClass("ui-icon-plus");
        this.minimized = true;
        if (this.cfg.resizable) {
            this.resizers.hide()
        }
        this.fireBehaviorEvent("minimize")
    },
    saveState: function() {
        this.state = {
            width: this.jq.width(),
            height: this.jq.height(),
            contentWidth: this.content.width(),
            contentHeight: this.content.height()
        };
        var a = $(window);
        this.state.offset = this.jq.offset();
        this.state.windowScrollLeft = a.scrollLeft();
        this.state.windowScrollTop = a.scrollTop()
    },
    restoreState: function() {
        this.jq.width(this.state.width).height(this.state.height);
        this.content.width(this.state.contentWidth).height(this.state.contentHeight);
        var a = $(window);
        this.jq.offset({
            top: this.state.offset.top + (a.scrollTop() - this.state.windowScrollTop),
            left: this.state.offset.left + (a.scrollLeft() - this.state.windowScrollLeft)
        })
    },
    loadContents: function() {
        var c = this
          , a = {
            source: this.id,
            process: this.id,
            update: this.id,
            params: [{
                name: this.id + "_contentLoad",
                value: true
            }],
            onsuccess: function(f, d, e) {
                PrimeFaces.ajax.Response.handle(f, d, e, {
                    widget: c,
                    handle: function(g) {
                        this.content.html(g)
                    }
                });
                return true
            },
            oncomplete: function() {
                c.loaded = true;
                c.show()
            }
        };
        if (this.hasBehavior("loadContent")) {
            var b = this.cfg.behaviors.loadContent;
            b.call(this, a)
        } else {
            PrimeFaces.ajax.Request.handle(a)
        }
    },
    applyARIA: function() {
        this.jq.attr({
            role: "dialog",
            "aria-labelledby": this.id + "_title",
            "aria-hidden": !this.cfg.visible
        });
        this.titlebar.children("a.ui-dialog-titlebar-icon").attr("role", "button")
    },
    isVisible: function() {
        return this.jq.is(":visible")
    },
    bindResizeListener: function() {
        var a = this;
        $(window).on(this.resizeNS, function() {
            if (a.cfg.fitViewport) {
                a.fitViewport()
            }
            if (a.isVisible()) {
                a.initPosition()
            } else {
                a.positionInitialized = false
            }
        })
    },
    unbindResizeListener: function() {
        $(window).off(this.resizeNS)
    },
    fireBehaviorEvent: function(b) {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors[b];
            if (a) {
                a.call(this)
            }
        }
    },
    removeMinimize: function() {
        this.jq.appendTo(this.parent).removeClass("ui-dialog-minimized").css({
            position: "fixed",
            "float": "none"
        });
        this.restoreState();
        this.content.show();
        this.minimizeIcon.removeClass("ui-state-hover").children(".ui-icon").removeClass("ui-icon-plus").addClass("ui-icon-minus");
        this.minimized = false;
        if (this.cfg.resizable) {
            this.resizers.show()
        }
    }
});
PrimeFaces.widget.ConfirmDialog = PrimeFaces.widget.Dialog.extend({
    init: function(a) {
        a.draggable = false;
        a.resizable = false;
        a.modal = true;
        if (!a.appendTo && a.global) {
            a.appendTo = "@(body)"
        }
        this._super(a);
        this.title = this.titlebar.children(".ui-dialog-title");
        this.message = this.content.children(".ui-confirm-dialog-message");
        this.icon = this.content.children(".ui-confirm-dialog-severity");
        if (this.cfg.global) {
            PrimeFaces.confirmDialog = this;
            this.jq.on("click.ui-confirmdialog", ".ui-confirmdialog-yes, .ui-confirmdialog-no", null, function(d) {
                var c = $(this);
                if (c.hasClass("ui-confirmdialog-yes") && PrimeFaces.confirmSource) {
                    var b = new Function("event",PrimeFaces.confirmSource.data("pfconfirmcommand"));
                    b.call(PrimeFaces.confirmSource.get(0), d);
                    PrimeFaces.confirmDialog.hide();
                    PrimeFaces.confirmSource = null
                } else {
                    if (c.hasClass("ui-confirmdialog-no")) {
                        PrimeFaces.confirmDialog.hide();
                        PrimeFaces.confirmSource = null
                    }
                }
                d.preventDefault()
            })
        }
    },
    applyFocus: function() {
        this.jq.find(":button,:submit").filter(":visible:enabled").eq(0).focus()
    },
    showMessage: function(msg) {
        if (msg.beforeShow) {
            eval(msg.beforeShow)
        }
        var icon = (msg.icon === "null") ? "ui-icon-alert" : msg.icon;
        this.icon.removeClass().addClass("ui-icon ui-confirm-dialog-severity " + icon);
        if (msg.header) {
            this.title.text(msg.header)
        }
        if (msg.message) {
            if (msg.escape) {
                this.message.text(msg.message)
            } else {
                this.message.html(msg.message)
            }
        }
        this.show()
    }
});
PrimeFaces.widget.DynamicDialog = PrimeFaces.widget.Dialog.extend({
    show: function() {
        if (this.jq.hasClass("ui-overlay-visible")) {
            return
        }
        if (this.positionInitialized === false) {
            this.initPosition()
        }
        this._show()
    },
    _show: function() {
        this.jq.removeClass("ui-overlay-hidden").addClass("ui-overlay-visible").css({
            display: "none",
            visibility: "visible"
        });
        this.moveToTop();
        this.jq.show();
        this.postShow();
        if (this.cfg.modal) {
            this.enableModality()
        }
    }
});
PrimeFaces.widget.Draggable = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this.cfg = a;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.jq = $(PrimeFaces.escapeClientId(this.cfg.target));
        if (this.cfg.appendTo) {
            this.cfg.appendTo = PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.appendTo)
        }
        this.jq.draggable(this.cfg);
        this.removeScriptElement(this.id)
    }
});
PrimeFaces.widget.Droppable = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this.cfg = a;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.jq = $(PrimeFaces.escapeClientId(this.cfg.target));
        this.bindDropListener();
        this.jq.droppable(this.cfg);
        this.removeScriptElement(this.id)
    },
    bindDropListener: function() {
        var a = this;
        this.cfg.drop = function(c, d) {
            if (a.cfg.onDrop) {
                a.cfg.onDrop.call(a, c, d)
            }
            if (a.cfg.behaviors) {
                var e = a.cfg.behaviors.drop;
                if (e) {
                    var b = {
                        params: [{
                            name: a.id + "_dragId",
                            value: d.draggable.attr("id")
                        }, {
                            name: a.id + "_dropId",
                            value: a.cfg.target
                        }]
                    };
                    e.call(a, b)
                }
            }
        }
    }
});
PrimeFaces.widget.Effect = PrimeFaces.widget.BaseWidget.extend({
    init: function(b) {
        this.cfg = b;
        this.id = this.cfg.id;
        this.jqId = PrimeFaces.escapeClientId(this.id);
        this.source = $(PrimeFaces.escapeClientId(this.cfg.source));
        var a = this;
        this.runner = function() {
            if (a.timeoutId) {
                clearTimeout(a.timeoutId)
            }
            a.timeoutId = setTimeout(a.cfg.fn, a.cfg.delay)
        }
        ;
        if (this.cfg.event == "load") {
            this.runner.call()
        } else {
            this.source.bind(this.cfg.event, this.runner)
        }
        this.removeScriptElement(this.id)
    }
});
PrimeFaces.widget.Fieldset = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        this.legend = this.jq.children(".ui-fieldset-legend");
        var b = this;
        if (this.cfg.toggleable) {
            this.content = this.jq.children(".ui-fieldset-content");
            this.toggler = this.legend.children(".ui-fieldset-toggler");
            this.stateHolder = $(this.jqId + "_collapsed");
            this.legend.on("click", function(c) {
                b.toggle(c)
            }).on("mouseover", function() {
                b.legend.toggleClass("ui-state-hover")
            }).on("mouseout", function() {
                b.legend.toggleClass("ui-state-hover")
            }).on("mousedown", function() {
                b.legend.toggleClass("ui-state-active")
            }).on("mouseup", function() {
                b.legend.toggleClass("ui-state-active")
            }).on("focus", function() {
                b.legend.toggleClass("ui-state-focus")
            }).on("blur", function() {
                b.legend.toggleClass("ui-state-focus")
            }).on("keydown", function(f) {
                var c = f.which
                  , d = $.ui.keyCode;
                if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
                    b.toggle(f);
                    f.preventDefault()
                }
            })
        }
    },
    toggle: function(b) {
        this.updateToggleState(this.cfg.collapsed);
        var a = this;
        this.content.slideToggle(this.cfg.toggleSpeed, "easeInOutCirc", function() {
            if (a.cfg.behaviors) {
                var c = a.cfg.behaviors.toggle;
                if (c) {
                    c.call(a)
                }
            }
        });
        PrimeFaces.invokeDeferredRenders(this.id)
    },
    updateToggleState: function(a) {
        if (a) {
            this.toggler.removeClass("ui-icon-plusthick").addClass("ui-icon-minusthick")
        } else {
            this.toggler.removeClass("ui-icon-minusthick").addClass("ui-icon-plusthick")
        }
        this.cfg.collapsed = !a;
        this.stateHolder.val(!a)
    }
});
PrimeFaces.widget.InputText = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        PrimeFaces.skinInput(this.jq)
    },
    disable: function() {
        this.jq.prop("disabled", true).addClass("ui-state-disabled")
    },
    enable: function() {
        this.jq.prop("disabled", false).removeClass("ui-state-disabled")
    }
});
PrimeFaces.widget.InputTextarea = PrimeFaces.widget.DeferredWidget.extend({
    init: function(a) {
        this._super(a);
        if (this.cfg.autoResize) {
            this.renderDeferred()
        } else {
            this._render()
        }
    },
    _render: function() {
        PrimeFaces.skinInput(this.jq);
        if (this.cfg.autoComplete) {
            this.setupAutoComplete()
        }
        if (this.cfg.counter) {
            this.counter = this.cfg.counter ? $(PrimeFaces.escapeClientId(this.cfg.counter)) : null;
            this.cfg.counterTemplate = this.cfg.counterTemplate || "{0}";
            this.updateCounter()
        }
        if (this.cfg.maxlength) {
            this.applyMaxlength()
        }
        if (this.cfg.autoResize) {
            this.setupAutoResize()
        }
    },
    refresh: function(a) {
        if (a.autoComplete) {
            $(PrimeFaces.escapeClientId(a.id + "_panel")).remove()
        }
        this.init(a)
    },
    setupAutoResize: function() {
        autosize(this.jq)
    },
    applyMaxlength: function() {
        var a = this;
        this.jq.on("keyup.inputtextarea-maxlength", function(d) {
            var c = a.normalizeNewlines(a.jq.val())
              , b = c.length;
            if (b > a.cfg.maxlength) {
                a.jq.val(c.substr(0, a.cfg.maxlength))
            }
        });
        if (a.counter) {
            this.jq.on("keyup.inputtextarea-counter", function(b) {
                a.updateCounter()
            })
        }
    },
    updateCounter: function() {
        var d = this.normalizeNewlines(this.jq.val())
          , c = d.length;
        if (this.counter) {
            var b = this.cfg.maxlength - c;
            if (b < 0) {
                b = 0
            }
            var a = this.cfg.counterTemplate.replace("{0}", b);
            this.counter.html(a)
        }
    },
    normalizeNewlines: function(a) {
        return a.replace(/(\r\n|\r|\n)/g, "\r\n")
    },
    setupAutoComplete: function() {
        var c = '<div id="' + this.id + '_panel" class="ui-autocomplete-panel ui-widget-content ui-corner-all ui-helper-hidden ui-shadow"></div>'
          , a = this;
        this.panel = $(c).appendTo(document.body);
        this.jq.keyup(function(g) {
            var f = $.ui.keyCode;
            switch (g.which) {
            case f.UP:
            case f.LEFT:
            case f.DOWN:
            case f.RIGHT:
            case f.ENTER:
            case f.NUMPAD_ENTER:
            case f.TAB:
            case f.SPACE:
            case 17:
            case 18:
            case f.ESCAPE:
            case 224:
                break;
            default:
                var d = a.extractQuery();
                if (d && d.length >= a.cfg.minQueryLength) {
                    if (a.timeout) {
                        a.clearTimeout(a.timeout)
                    }
                    a.timeout = setTimeout(function() {
                        a.search(d)
                    }, a.cfg.queryDelay)
                }
                break
            }
        }).keydown(function(j) {
            var d = a.panel.is(":visible")
              , i = $.ui.keyCode;
            switch (j.which) {
            case i.UP:
            case i.LEFT:
                if (d) {
                    var h = a.items.filter(".ui-state-highlight")
                      , g = h.length == 0 ? a.items.eq(0) : h.prev();
                    if (g.length == 1) {
                        h.removeClass("ui-state-highlight");
                        g.addClass("ui-state-highlight");
                        if (a.cfg.scrollHeight) {
                            PrimeFaces.scrollInView(a.panel, g)
                        }
                    }
                    j.preventDefault()
                } else {
                    a.clearTimeout()
                }
                break;
            case i.DOWN:
            case i.RIGHT:
                if (d) {
                    var h = a.items.filter(".ui-state-highlight")
                      , f = h.length == 0 ? a.items.eq(0) : h.next();
                    if (f.length == 1) {
                        h.removeClass("ui-state-highlight");
                        f.addClass("ui-state-highlight");
                        if (a.cfg.scrollHeight) {
                            PrimeFaces.scrollInView(a.panel, f)
                        }
                    }
                    j.preventDefault()
                } else {
                    a.clearTimeout()
                }
                break;
            case i.ENTER:
            case i.NUMPAD_ENTER:
                if (d) {
                    a.items.filter(".ui-state-highlight").trigger("click");
                    j.preventDefault()
                } else {
                    a.clearTimeout()
                }
                break;
            case i.SPACE:
            case 17:
            case 18:
            case i.BACKSPACE:
            case i.ESCAPE:
            case 224:
                a.clearTimeout();
                if (d) {
                    a.hide()
                }
                break;
            case i.TAB:
                a.clearTimeout();
                if (d) {
                    a.items.filter(".ui-state-highlight").trigger("click");
                    a.hide()
                }
                break
            }
        });
        $(document.body).bind("mousedown.ui-inputtextarea", function(d) {
            if (a.panel.is(":hidden")) {
                return
            }
            var f = a.panel.offset();
            if (d.target === a.jq.get(0)) {
                return
            }
            if (d.pageX < f.left || d.pageX > f.left + a.panel.width() || d.pageY < f.top || d.pageY > f.top + a.panel.height()) {
                a.hide()
            }
        });
        var b = "resize." + this.id;
        $(window).unbind(b).bind(b, function() {
            if (a.panel.is(":visible")) {
                a.hide()
            }
        });
        this.setupDialogSupport()
    },
    bindDynamicEvents: function() {
        var a = this;
        this.items.bind("mouseover", function() {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                a.items.filter(".ui-state-highlight").removeClass("ui-state-highlight");
                b.addClass("ui-state-highlight")
            }
        }).bind("click", function(d) {
            var c = $(this)
              , e = c.attr("data-item-value")
              , b = e.substring(a.query.length);
            a.jq.focus();
            a.jq.insertText(b, a.jq.getSelection().start, true);
            a.invokeItemSelectBehavior(d, e);
            a.hide()
        })
    },
    invokeItemSelectBehavior: function(b, d) {
        if (this.cfg.behaviors) {
            var c = this.cfg.behaviors.itemSelect;
            if (c) {
                var a = {
                    params: [{
                        name: this.id + "_itemSelect",
                        value: d
                    }]
                };
                c.call(this, a)
            }
        }
    },
    clearTimeout: function() {
        if (this.timeout) {
            clearTimeout(this.timeout)
        }
        this.timeout = null
    },
    extractQuery: function() {
        var b = this.jq.getSelection().end
          , a = /\S+$/.exec(this.jq.get(0).value.slice(0, b))
          , c = a ? a[0] : null;
        return c
    },
    search: function(b) {
        this.query = b;
        var c = this
          , a = {
            source: this.id,
            update: this.id,
            process: this.id,
            params: [{
                name: this.id + "_query",
                value: b
            }],
            onsuccess: function(f, d, e) {
                PrimeFaces.ajax.Response.handle(f, d, e, {
                    widget: c,
                    handle: function(g) {
                        this.panel.html(g);
                        this.items = c.panel.find(".ui-autocomplete-item");
                        this.bindDynamicEvents();
                        if (this.items.length > 0) {
                            this.items.eq(0).addClass("ui-state-highlight");
                            if (this.cfg.scrollHeight && this.panel.height() > this.cfg.scrollHeight) {
                                this.panel.height(this.cfg.scrollHeight)
                            }
                            if (this.panel.is(":hidden")) {
                                this.show()
                            } else {
                                this.alignPanel()
                            }
                        } else {
                            this.panel.hide()
                        }
                    }
                });
                return true
            }
        };
        PrimeFaces.ajax.Request.handle(a)
    },
    alignPanel: function() {
        var b = this.jq.getCaretPosition()
          , a = this.jq.offset();
        this.panel.css({
            left: a.left + b.left,
            top: a.top + b.top,
            width: this.jq.innerWidth(),
            "z-index": ++PrimeFaces.zindex
        })
    },
    show: function() {
        this.alignPanel();
        this.panel.show()
    },
    hide: function() {
        this.panel.hide()
    },
    setupDialogSupport: function() {
        var a = this.jq.parents(".ui-dialog:first");
        if (a.length == 1) {
            this.panel.css("position", "fixed")
        }
    }
});
PrimeFaces.widget.SelectOneMenu = PrimeFaces.widget.DeferredWidget.extend({
    init: function(a) {
        this._super(a);
        this.panelId = this.jqId + "_panel";
        this.input = $(this.jqId + "_input");
        this.focusInput = $(this.jqId + "_focus");
        this.label = this.jq.find(".ui-selectonemenu-label");
        this.menuIcon = this.jq.children(".ui-selectonemenu-trigger");
        this.panelParent = this.cfg.appendTo ? PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.appendTo) : $(document.body);
        if (!this.panelParent.is(this.jq)) {
            this.panelParent.children(this.panelId).remove()
        }
        this.panel = $(this.panelId);
        this.disabled = this.jq.hasClass("ui-state-disabled");
        this.itemsWrapper = this.panel.children(".ui-selectonemenu-items-wrapper");
        this.options = this.input.children("option");
        this.cfg.effect = this.cfg.effect || "fade";
        this.cfg.effectSpeed = this.cfg.effectSpeed || "normal";
        this.cfg.autoWidth = this.cfg.autoWidth === false ? false : true;
        this.cfg.dynamic = this.cfg.dynamic === true ? true : false;
        this.isDynamicLoaded = false;
        if (this.cfg.dynamic) {
            var b = this.options.filter(":selected")
              , c = this.cfg.editable ? this.label.val() : b.text();
            this.setLabel(c)
        } else {
            this.initContents();
            this.bindItemEvents()
        }
        this.triggers = this.cfg.editable ? this.jq.find(".ui-selectonemenu-trigger") : this.jq.find(".ui-selectonemenu-trigger, .ui-selectonemenu-label");
        this.triggers.data("primefaces-overlay-target", true).find("*").data("primefaces-overlay-target", true);
        if (!this.disabled) {
            this.bindEvents();
            this.bindConstantEvents();
            this.appendPanel()
        }
        if (PrimeFaces.env.touch) {
            this.focusInput.attr("readonly", true)
        }
        this.renderDeferred()
    },
    initContents: function() {
        this.itemsContainer = this.itemsWrapper.children(".ui-selectonemenu-items");
        this.items = this.itemsContainer.find(".ui-selectonemenu-item");
        this.optGroupsSize = this.itemsContainer.children("li.ui-selectonemenu-item-group").length;
        var f = this
          , d = this.options.filter(":selected")
          , e = this.items.eq(d.index());
        this.options.filter(":disabled").each(function() {
            f.items.eq($(this).index()).addClass("ui-state-disabled")
        });
        if (this.cfg.editable) {
            var b = this.label.val();
            if (b === d.text()) {
                this.highlightItem(e)
            } else {
                this.items.eq(0).addClass("ui-state-highlight");
                this.customInput = true;
                this.customInputVal = b
            }
        } else {
            this.highlightItem(e)
        }
        if (this.cfg.syncTooltip) {
            this.syncTitle(d)
        }
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
        for (var c = 0; c < this.items.length; c++) {
            this.items.eq(c).attr("id", this.id + "_" + c)
        }
        var a = e.attr("id");
        this.jq.attr("aria-owns", this.itemsContainer.attr("id"));
        this.focusInput.attr("aria-autocomplete", "list").attr("aria-activedescendant", a).attr("aria-describedby", a).attr("aria-disabled", this.disabled);
        this.itemsContainer.attr("aria-activedescendant", a)
    },
    _render: function() {
        var a = this.jq.attr("style")
          , b = a && a.indexOf("width") != -1;
        if (this.cfg.autoWidth && !b) {
            this.jq.css("min-width", this.input.outerWidth())
        }
    },
    refresh: function(a) {
        this.panelWidthAdjusted = false;
        this._super(a)
    },
    appendPanel: function() {
        if (!this.panelParent.is(this.jq)) {
            this.panel.appendTo(this.panelParent)
        }
    },
    alignPanelWidth: function() {
        if (!this.panelWidthAdjusted) {
            var a = this.jq.outerWidth();
            if (this.panel.outerWidth() < a) {
                this.panel.width(a)
            }
            this.panelWidthAdjusted = true
        }
    },
    bindEvents: function() {
        var a = this;
        if (PrimeFaces.env.browser.webkit) {
            this.input.on("focus", function() {
                setTimeout(function() {
                    a.focusInput.trigger("focus.ui-selectonemenu")
                }, 2)
            })
        }
        this.triggers.mouseenter(function() {
            if (!a.jq.hasClass("ui-state-focus")) {
                a.jq.addClass("ui-state-hover");
                a.menuIcon.addClass("ui-state-hover")
            }
        }).mouseleave(function() {
            a.jq.removeClass("ui-state-hover");
            a.menuIcon.removeClass("ui-state-hover")
        }).click(function(b) {
            if (a.panel.is(":hidden")) {
                a.show()
            } else {
                a.hide();
                a.revert();
                a.changeAriaValue(a.getActiveItem())
            }
            a.jq.removeClass("ui-state-hover");
            a.menuIcon.removeClass("ui-state-hover");
            a.focusInput.trigger("focus.ui-selectonemenu");
            b.preventDefault()
        });
        this.focusInput.on("focus.ui-selectonemenu", function() {
            a.jq.addClass("ui-state-focus");
            a.menuIcon.addClass("ui-state-focus")
        }).on("blur.ui-selectonemenu", function() {
            a.jq.removeClass("ui-state-focus");
            a.menuIcon.removeClass("ui-state-focus")
        });
        if (this.cfg.editable) {
            this.label.change(function(b) {
                a.triggerChange(true);
                a.callHandleMethod(a.handleLabelChange, b)
            })
        }
        this.bindKeyEvents();
        if (this.cfg.filter) {
            this.cfg.initialHeight = this.itemsWrapper.height();
            this.setupFilterMatcher();
            this.filterInput = this.panel.find("> div.ui-selectonemenu-filter-container > input.ui-selectonemenu-filter");
            PrimeFaces.skinInput(this.filterInput);
            this.bindFilterEvents()
        }
    },
    bindItemEvents: function() {
        var a = this;
        this.items.filter(":not(.ui-state-disabled)").on("mouseover.selectonemenu", function() {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                $(this).addClass("ui-state-hover")
            }
        }).on("mouseout.selectonemenu", function() {
            $(this).removeClass("ui-state-hover")
        }).on("click.selectonemenu", function() {
            a.revert();
            a.selectItem($(this));
            a.changeAriaValue($(this))
        })
    },
    bindConstantEvents: function() {
        var b = this
          , a = "mousedown." + this.id;
        $(document).off(a).on(a, function(c) {
            if (b.panel.is(":hidden")) {
                return
            }
            var d = b.panel.offset();
            if (c.target === b.label.get(0) || c.target === b.menuIcon.get(0) || c.target === b.menuIcon.children().get(0)) {
                return
            }
            if (c.pageX < d.left || c.pageX > d.left + b.panel.width() || c.pageY < d.top || c.pageY > d.top + b.panel.height()) {
                b.hide();
                setTimeout(function() {
                    b.revert();
                    b.changeAriaValue(b.getActiveItem())
                }, 2)
            }
        });
        this.resizeNS = "resize." + this.id;
        this.unbindResize();
        this.bindResize()
    },
    bindResize: function() {
        var a = this;
        $(window).bind(this.resizeNS, function(b) {
            if (a.panel.is(":visible")) {
                a.alignPanel()
            }
        })
    },
    unbindResize: function() {
        $(window).unbind(this.resizeNS)
    },
    unbindEvents: function() {
        this.items.off();
        this.triggers.off();
        this.input.off();
        this.focusInput.off();
        this.label.off()
    },
    revert: function() {
        if (this.cfg.editable && this.customInput) {
            this.setLabel(this.customInputVal);
            this.items.filter(".ui-state-active").removeClass("ui-state-active");
            this.items.eq(0).addClass("ui-state-active")
        } else {
            this.highlightItem(this.items.eq(this.preShowValue.index()))
        }
    },
    highlightItem: function(a) {
        this.items.filter(".ui-state-highlight").removeClass("ui-state-highlight");
        if (a.length > 0) {
            a.addClass("ui-state-highlight");
            this.setLabel(a.data("label"))
        }
    },
    triggerChange: function(a) {
        this.changed = false;
        this.input.trigger("change");
        if (!a) {
            this.value = this.options.filter(":selected").val()
        }
    },
    triggerItemSelect: function() {
        if (this.cfg.behaviors) {
            var a = this.cfg.behaviors.itemSelect;
            if (a) {
                a.call(this)
            }
        }
    },
    selectItem: function(f, b) {
        var e = this.options.eq(this.resolveItemIndex(f))
          , d = this.options.filter(":selected")
          , a = e.val() == d.val()
          , c = null;
        if (this.cfg.editable) {
            c = (!a) || (e.text() != this.label.val())
        } else {
            c = !a
        }
        if (c) {
            this.highlightItem(f);
            this.input.val(e.val());
            this.triggerChange();
            if (this.cfg.editable) {
                this.customInput = false
            }
            if (this.cfg.syncTooltip) {
                this.syncTitle(e)
            }
        }
        if (!b) {
            this.focusInput.focus();
            this.triggerItemSelect()
        }
        if (this.panel.is(":visible")) {
            this.hide()
        }
    },
    syncTitle: function(b) {
        var a = this.items.eq(b.index()).attr("title");
        if (a) {
            this.jq.attr("title", this.items.eq(b.index()).attr("title"))
        } else {
            this.jq.removeAttr("title")
        }
    },
    resolveItemIndex: function(a) {
        if (this.optGroupsSize === 0) {
            return a.index()
        } else {
            return a.index() - a.prevAll("li.ui-selectonemenu-item-group").length
        }
    },
    bindKeyEvents: function() {
        var a = this;
        this.focusInput.on("keydown.ui-selectonemenu", function(d) {
            var c = $.ui.keyCode
              , b = d.which;
            switch (b) {
            case c.UP:
            case c.LEFT:
                a.callHandleMethod(a.highlightPrev, d);
                break;
            case c.DOWN:
            case c.RIGHT:
                a.callHandleMethod(a.highlightNext, d);
                break;
            case c.ENTER:
            case c.NUMPAD_ENTER:
                a.handleEnterKey(d);
                break;
            case c.TAB:
                a.handleTabKey();
                break;
            case c.ESCAPE:
                a.handleEscapeKey(d);
                break;
            case c.SPACE:
                a.handleSpaceKey(d);
                break
            }
        }).on("keyup.ui-selectonemenu", function(g) {
            var f = $.ui.keyCode
              , d = g.which;
            switch (d) {
            case f.UP:
            case f.LEFT:
            case f.DOWN:
            case f.RIGHT:
            case f.ENTER:
            case f.NUMPAD_ENTER:
            case f.TAB:
            case f.ESCAPE:
            case f.SPACE:
            case f.HOME:
            case f.PAGE_DOWN:
            case f.PAGE_UP:
            case f.END:
            case f.DELETE:
            case 16:
            case 17:
            case 18:
            case 19:
            case 20:
            case 44:
            case 45:
            case 91:
            case 92:
            case 93:
            case 144:
            case 145:
                break;
            default:
                if (d >= 112 && d <= 123) {
                    break
                }
                var i = $(this).val()
                  , c = null
                  , h = g.metaKey || g.ctrlKey || g.shiftKey;
                if (!h) {
                    clearTimeout(a.searchTimer);
                    c = a.options.filter(function() {
                        var e = $(this);
                        return (e.is(":not(:disabled)") && (e.text().toLowerCase().indexOf(i.toLowerCase()) === 0))
                    });
                    if (c.length) {
                        var b = a.items.eq(c.index());
                        if (a.panel.is(":hidden")) {
                            a.selectItem(b)
                        } else {
                            a.highlightItem(b);
                            PrimeFaces.scrollInView(a.itemsWrapper, b)
                        }
                    }
                    a.searchTimer = setTimeout(function() {
                        a.focusInput.val("")
                    }, 1000)
                }
                break
            }
        })
    },
    bindFilterEvents: function() {
        var a = this;
        this.filterInput.on("keyup.ui-selectonemenu", function(d) {
            var c = $.ui.keyCode
              , b = d.which;
            switch (b) {
            case c.UP:
            case c.LEFT:
            case c.DOWN:
            case c.RIGHT:
            case c.ENTER:
            case c.NUMPAD_ENTER:
            case c.TAB:
            case c.ESCAPE:
            case c.SPACE:
            case c.HOME:
            case c.PAGE_DOWN:
            case c.PAGE_UP:
            case c.END:
            case 16:
            case 17:
            case 18:
            case 91:
            case 92:
            case 93:
            case 20:
                break;
            default:
                if (b >= 112 && b <= 123) {
                    break
                }
                var f = d.metaKey || d.ctrlKey;
                if (!f) {
                    a.filter($(this).val())
                }
                break
            }
        }).on("keydown.ui-selectonemenu", function(d) {
            var c = $.ui.keyCode
              , b = d.which;
            switch (b) {
            case c.UP:
                a.highlightPrev(d);
                break;
            case c.DOWN:
                a.highlightNext(d);
                break;
            case c.ENTER:
            case c.NUMPAD_ENTER:
                a.handleEnterKey(d);
                d.stopPropagation();
                break;
            case c.TAB:
                a.handleTabKey();
                break;
            case c.ESCAPE:
                a.handleEscapeKey(d);
                break;
            case c.SPACE:
                a.handleSpaceKey(d);
                break;
            default:
                break
            }
        }).on("paste.ui-selectonemenu", function() {
            setTimeout(function() {
                a.filter(a.filterInput.val())
            }, 2)
        })
    },
    highlightNext: function(b) {
        var c = this.getActiveItem()
          , a = this.panel.is(":hidden") ? c.nextAll(":not(.ui-state-disabled,.ui-selectonemenu-item-group):first") : c.nextAll(":not(.ui-state-disabled,.ui-selectonemenu-item-group):visible:first");
        if (b.altKey) {
            this.show()
        } else {
            if (a.length === 1) {
                if (this.panel.is(":hidden")) {
                    this.selectItem(a)
                } else {
                    this.highlightItem(a);
                    PrimeFaces.scrollInView(this.itemsWrapper, a)
                }
                this.changeAriaValue(a)
            }
        }
        b.preventDefault()
    },
    highlightPrev: function(b) {
        var c = this.getActiveItem()
          , a = this.panel.is(":hidden") ? c.prevAll(":not(.ui-state-disabled,.ui-selectonemenu-item-group):first") : c.prevAll(":not(.ui-state-disabled,.ui-selectonemenu-item-group):visible:first");
        if (a.length === 1) {
            if (this.panel.is(":hidden")) {
                this.selectItem(a)
            } else {
                this.highlightItem(a);
                PrimeFaces.scrollInView(this.itemsWrapper, a)
            }
            this.changeAriaValue(a)
        }
        b.preventDefault()
    },
    handleEnterKey: function(a) {
        if (this.panel.is(":visible")) {
            this.selectItem(this.getActiveItem())
        }
        a.preventDefault()
    },
    handleSpaceKey: function(a) {
        var b = $(a.target);
        if (b.is("input") && b.hasClass("ui-selectonemenu-filter")) {
            return
        }
        if (this.panel.is(":hidden")) {
            this.show()
        } else {
            this.hide();
            this.revert();
            this.changeAriaValue(this.getActiveItem())
        }
        a.preventDefault()
    },
    handleEscapeKey: function(a) {
        if (this.panel.is(":visible")) {
            this.revert();
            this.hide()
        }
        a.preventDefault()
    },
    handleTabKey: function() {
        if (this.panel.is(":visible")) {
            this.selectItem(this.getActiveItem())
        }
    },
    handleLabelChange: function(a) {
        this.customInput = true;
        this.customInputVal = $(a.target).val();
        this.items.filter(".ui-state-active").removeClass("ui-state-active");
        this.items.eq(0).addClass("ui-state-active")
    },
    show: function() {
        this.callHandleMethod(this._show, null)
    },
    _show: function() {
        var a = this;
        this.alignPanel();
        this.panel.css("z-index", ++PrimeFaces.zindex);
        if ($.browser.msie && /^[6,7]\.[0-9]+/.test($.browser.version)) {
            this.panel.parent().css("z-index", PrimeFaces.zindex - 1)
        }
        if (this.cfg.effect !== "none") {
            this.panel.show(this.cfg.effect, {}, this.cfg.effectSpeed, function() {
                PrimeFaces.scrollInView(a.itemsWrapper, a.getActiveItem());
                if (a.cfg.filter) {
                    a.focusFilter()
                }
            })
        } else {
            this.panel.show();
            PrimeFaces.scrollInView(this.itemsWrapper, this.getActiveItem());
            if (a.cfg.filter) {
                this.focusFilter(10)
            }
        }
        this.preShowValue = this.options.filter(":selected");
        this.focusInput.attr("aria-expanded", true);
        this.jq.attr("aria-expanded", true)
    },
    hide: function() {
        if ($.browser.msie && /^[6,7]\.[0-9]+/.test($.browser.version)) {
            this.panel.parent().css("z-index", "")
        }
        this.panel.css("z-index", "").hide();
        this.focusInput.attr("aria-expanded", false);
        this.jq.attr("aria-expanded", false)
    },
    focus: function() {
        this.focusInput.focus()
    },
    focusFilter: function(a) {
        if (a) {
            var b = this;
            setTimeout(function() {
                b.focusFilter()
            }, a)
        } else {
            this.filterInput.focus()
        }
    },
    blur: function() {
        this.focusInput.blur()
    },
    disable: function() {
        if (!this.disabled) {
            this.disabled = true;
            this.jq.addClass("ui-state-disabled");
            this.input.attr("disabled", "disabled");
            if (this.cfg.editable) {
                this.label.attr("disabled", "disabled")
            }
            this.unbindEvents()
        }
    },
    enable: function() {
        if (this.disabled) {
            this.disabled = false;
            this.jq.removeClass("ui-state-disabled");
            this.input.removeAttr("disabled");
            if (this.cfg.editable) {
                this.label.removeAttr("disabled")
            }
            this.bindEvents();
            this.bindItemEvents()
        }
    },
    alignPanel: function() {
        this.alignPanelWidth();
        if (this.panel.parent().is(this.jq)) {
            this.panel.css({
                left: 0,
                top: this.jq.innerHeight()
            })
        } else {
            this.panel.css({
                left: "",
                top: ""
            }).position({
                my: "left top",
                at: "left bottom",
                of: this.jq,
                collision: "flipfit"
            })
        }
    },
    setLabel: function(c) {
        var b = this.getLabelToDisplay(c);
        if (this.cfg.editable) {
            if (c === "&nbsp;") {
                this.label.val("")
            } else {
                this.label.val(b)
            }
        } else {
            var a = this.label.data("placeholder");
            if (a == null) {
                a = "&nbsp;"
            }
            if (c === "&nbsp;") {
                if (a != "&nbsp;") {
                    this.label.text(a);
                    this.label.addClass("ui-state-disabled")
                } else {
                    this.label.html(a)
                }
            } else {
                this.label.removeClass("ui-state-disabled");
                this.label.text(b)
            }
        }
    },
    selectValue: function(b) {
        var a = this.options.filter('[value="' + b + '"]');
        this.selectItem(this.items.eq(a.index()), true)
    },
    getActiveItem: function() {
        return this.items.filter(".ui-state-highlight")
    },
    setupFilterMatcher: function() {
        this.cfg.filterMatchMode = this.cfg.filterMatchMode || "startsWith";
        this.filterMatchers = {
            startsWith: this.startsWithFilter,
            contains: this.containsFilter,
            endsWith: this.endsWithFilter,
            custom: this.cfg.filterFunction
        };
        this.filterMatcher = this.filterMatchers[this.cfg.filterMatchMode]
    },
    startsWithFilter: function(b, a) {
        return b.indexOf(a) === 0
    },
    containsFilter: function(b, a) {
        return b.indexOf(a) !== -1
    },
    endsWithFilter: function(b, a) {
        return b.indexOf(a, b.length - a.length) !== -1
    },
    filter: function(j) {
        this.cfg.initialHeight = this.cfg.initialHeight || this.itemsWrapper.height();
        var h = this.cfg.caseSensitive ? $.trim(j) : $.trim(j).toLowerCase();
        if (h === "") {
            this.items.filter(":hidden").show();
            this.itemsContainer.children(".ui-selectonemenu-item-group").show()
        } else {
            for (var c = 0; c < this.options.length; c++) {
                var d = this.options.eq(c)
                  , b = this.cfg.caseSensitive ? d.text() : d.text().toLowerCase()
                  , l = this.items.eq(c);
                if (l.hasClass("ui-noselection-option")) {
                    l.hide()
                } else {
                    if (this.filterMatcher(b, h)) {
                        l.show()
                    } else {
                        l.hide()
                    }
                }
            }
            var a = this.itemsContainer.children(".ui-selectonemenu-item-group");
            for (var e = 0; e < a.length; e++) {
                var k = a.eq(e);
                if (e === (a.length - 1)) {
                    if (k.nextAll().filter(":visible").length === 0) {
                        k.hide()
                    } else {
                        k.show()
                    }
                } else {
                    if (k.nextUntil(".ui-selectonemenu-item-group").filter(":visible").length === 0) {
                        k.hide()
                    } else {
                        k.show()
                    }
                }
            }
        }
        var f = this.items.filter(":visible:not(.ui-state-disabled):first");
        if (f.length) {
            this.highlightItem(f)
        }
        if (this.itemsContainer.height() < this.cfg.initialHeight) {
            this.itemsWrapper.css("height", "auto")
        } else {
            this.itemsWrapper.height(this.cfg.initialHeight)
        }
        this.alignPanel()
    },
    getSelectedValue: function() {
        return this.input.val()
    },
    getSelectedLabel: function() {
        return this.options.filter(":selected").text()
    },
    getLabelToDisplay: function(a) {
        if (this.cfg.labelTemplate && a !== "&nbsp;") {
            return this.cfg.labelTemplate.replace("{0}", a)
        }
        return a
    },
    changeAriaValue: function(a) {
        var b = a.attr("id");
        this.focusInput.attr("aria-activedescendant", b).attr("aria-describedby", b);
        this.itemsContainer.attr("aria-activedescendant", b)
    },
    dynamicPanelLoad: function() {
        var b = this
          , a = {
            source: this.id,
            process: this.id,
            update: this.id,
            global: false,
            params: [{
                name: this.id + "_dynamicload",
                value: true
            }],
            onsuccess: function(e, c, d) {
                PrimeFaces.ajax.Response.handle(e, c, d, {
                    widget: b,
                    handle: function(i) {
                        var h = $($.parseHTML(i));
                        var g = h.filter("ul");
                        b.itemsWrapper.empty();
                        b.itemsWrapper.append(g);
                        var f = h.filter("select");
                        b.input.replaceWith(f)
                    }
                });
                return true
            },
            oncomplete: function(e, c, d) {
                b.isDynamicLoaded = true;
                b.input = $(b.jqId + "_input");
                b.options = b.input.children("option");
                b.initContents();
                b.bindItemEvents()
            }
        };
        PrimeFaces.ajax.Request.handle(a)
    },
    callHandleMethod: function(b, c) {
        var d = this;
        if (this.cfg.dynamic && !this.isDynamicLoaded) {
            this.dynamicPanelLoad();
            var a = setInterval(function() {
                if (d.isDynamicLoaded) {
                    b.call(d, c);
                    clearInterval(a)
                }
            }, 10)
        } else {
            b.call(this, c)
        }
    }
});
PrimeFaces.widget.SelectOneRadio = PrimeFaces.widget.BaseWidget.extend({
    init: function(b) {
        this._super(b);
        if (this.cfg.custom) {
            this.originalInputs = this.jq.find(":radio");
            this.inputs = $('input:radio[name="' + this.id + '"].ui-radio-clone');
            this.outputs = this.inputs.parent().next(".ui-radiobutton-box");
            this.labels = $();
            for (var e = 0; e < this.outputs.length; e++) {
                this.labels = this.labels.add('label[for="' + this.outputs.eq(e).parent().attr("id") + '"]')
            }
            for (var e = 0; e < this.inputs.length; e++) {
                var c = this.inputs.eq(e)
                  , a = c.data("itemindex")
                  , d = this.originalInputs.eq(a);
                c.val(d.val());
                if (d.is(":checked")) {
                    c.prop("checked", true).parent().next().addClass("ui-state-active").children(".ui-radiobutton-icon").addClass("ui-icon-bullet").removeClass("ui-icon-blank")
                }
            }
        } else {
            this.outputs = this.jq.find(".ui-radiobutton-box");
            this.inputs = this.jq.find(":radio");
            this.labels = this.jq.find("label")
        }
        this.enabledInputs = this.inputs.filter(":not(:disabled)");
        this.checkedRadio = this.outputs.filter(".ui-state-active");
        this.bindEvents();
        this.inputs.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    bindEvents: function() {
        var a = this;
        this.outputs.filter(":not(.ui-state-disabled)").on("mouseover.selectOneRadio", function() {
            $(this).addClass("ui-state-hover")
        }).on("mouseout.selectOneRadio", function() {
            $(this).removeClass("ui-state-hover")
        }).on("click.selectOneRadio", function() {
            var c = $(this)
              , b = c.prev().children(":radio");
            if (!c.hasClass("ui-state-active")) {
                a.unselect(a.checkedRadio);
                a.select(c);
                b.trigger("click");
                b.trigger("change")
            } else {
                b.trigger("click")
            }
        });
        this.labels.filter(":not(.ui-state-disabled)").on("click.selectOneRadio", function(d) {
            var c = $(PrimeFaces.escapeClientId($(this).attr("for")))
              , b = null;
            if (c.is(":input")) {
                b = c.parent().next()
            } else {
                b = c.children(".ui-radiobutton-box")
            }
            b.trigger("click.selectOneRadio");
            d.preventDefault()
        });
        this.enabledInputs.on("focus.selectOneRadio", function() {
            var b = $(this)
              , c = b.parent().next();
            if (b.prop("checked")) {
                c.removeClass("ui-state-active")
            }
            c.addClass("ui-state-focus")
        }).on("blur.selectOneRadio", function() {
            var b = $(this)
              , c = b.parent().next();
            if (b.prop("checked")) {
                c.addClass("ui-state-active")
            }
            c.removeClass("ui-state-focus")
        }).on("keydown.selectOneRadio", function(h) {
            var i = $(this)
              , f = i.parent().next()
              , g = a.enabledInputs.index(i)
              , m = a.enabledInputs.length
              , l = $.ui.keyCode
              , j = h.which;
            switch (j) {
            case l.UP:
            case l.LEFT:
                var c = (g === 0) ? a.enabledInputs.eq((m - 1)) : a.enabledInputs.eq(--g)
                  , k = c.parent().next();
                i.blur();
                a.unselect(f);
                a.select(k);
                c.trigger("focus").trigger("change");
                h.preventDefault();
                break;
            case l.DOWN:
            case l.RIGHT:
                var d = (g === (m - 1)) ? a.enabledInputs.eq(0) : a.enabledInputs.eq(++g)
                  , b = d.parent().next();
                i.blur();
                a.unselect(f);
                a.select(b);
                d.trigger("focus").trigger("change");
                h.preventDefault();
                break;
            case l.SPACE:
                if (!i.prop("checked")) {
                    a.select(f);
                    i.trigger("focus").trigger("change")
                }
                h.preventDefault();
                break
            }
        })
    },
    unselect: function(a) {
        a.prev().children(":radio").prop("checked", false);
        a.removeClass("ui-state-active").children(".ui-radiobutton-icon").removeClass("ui-icon-bullet").addClass("ui-icon-blank")
    },
    select: function(a) {
        this.checkedRadio = a;
        a.addClass("ui-state-active").children(".ui-radiobutton-icon").addClass("ui-icon-bullet").removeClass("ui-icon-blank");
        a.prev().children(":radio").prop("checked", true)
    },
    unbindEvents: function(a) {
        if (a) {
            a.off();
            a.parent().nextAll(".ui-radiobutton-box").off();
            this.labels.filter("label[for='" + a.attr("id") + "']").off()
        } else {
            this.inputs.off();
            this.labels.off();
            this.outputs.off()
        }
    },
    disable: function(c) {
        if (c == null) {
            this.inputs.attr("disabled", "disabled");
            this.labels.addClass("ui-state-disabled");
            this.outputs.addClass("ui-state-disabled");
            this.unbindEvents()
        } else {
            var a = this.inputs.eq(c)
              , b = this.labels.filter("label[for='" + a.attr("id") + "']");
            a.attr("disabled", "disabled").parent().nextAll(".ui-radiobutton-box").addClass("ui-state-disabled");
            b.addClass("ui-state-disabled");
            this.unbindEvents(a)
        }
    },
    enable: function(c) {
        if (c == null) {
            this.inputs.removeAttr("disabled");
            this.labels.removeClass("ui-state-disabled");
            this.outputs.removeClass("ui-state-disabled")
        } else {
            var a = this.inputs.eq(c)
              , b = this.labels.filter("label[for='" + a.attr("id") + "']");
            a.removeAttr("disabled").parent().nextAll(".ui-radiobutton-box").removeClass("ui-state-disabled");
            b.removeClass("ui-state-disabled")
        }
        this.bindEvents()
    }
});
PrimeFaces.widget.SelectBooleanCheckbox = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        this.input = $(this.jqId + "_input");
        this.box = this.jq.find(".ui-chkbox-box");
        this.icon = this.box.children(".ui-chkbox-icon");
        this.itemLabel = this.jq.find(".ui-chkbox-label");
        this.disabled = this.input.is(":disabled");
        var b = this;
        if (!this.disabled) {
            this.box.on("mouseover.selectBooleanCheckbox", function() {
                b.box.addClass("ui-state-hover")
            }).on("mouseout.selectBooleanCheckbox", function() {
                b.box.removeClass("ui-state-hover")
            }).on("click.selectBooleanCheckbox", function() {
                b.input.trigger("click")
            });
            this.input.on("focus.selectBooleanCheckbox", function() {
                if ($(this).prop("checked")) {
                    b.box.removeClass("ui-state-active")
                }
                b.box.addClass("ui-state-focus")
            }).on("blur.selectBooleanCheckbox", function() {
                if ($(this).prop("checked")) {
                    b.box.addClass("ui-state-active")
                }
                b.box.removeClass("ui-state-focus")
            }).on("change.selectBooleanCheckbox", function(c) {
                if (b.isChecked()) {
                    b.box.addClass("ui-state-active").children(".ui-chkbox-icon").removeClass("ui-icon-blank").addClass("ui-icon-check")
                } else {
                    b.box.removeClass("ui-state-active").children(".ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check")
                }
            });
            this.itemLabel.click(function() {
                b.toggle();
                b.input.trigger("focus")
            })
        }
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    toggle: function() {
        if (this.isChecked()) {
            this.uncheck()
        } else {
            this.check()
        }
    },
    isChecked: function() {
        return this.input.prop("checked")
    },
    check: function() {
        if (!this.isChecked()) {
            this.input.prop("checked", true).trigger("change");
            this.input.attr("aria-checked", true);
            this.box.addClass("ui-state-active").children(".ui-chkbox-icon").removeClass("ui-icon-blank").addClass("ui-icon-check")
        }
    },
    uncheck: function() {
        if (this.isChecked()) {
            this.input.prop("checked", false).trigger("change");
            this.input.attr("aria-checked", false);
            this.box.removeClass("ui-state-active").children(".ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check")
        }
    }
});
PrimeFaces.widget.SelectManyCheckbox = PrimeFaces.widget.BaseWidget.extend({
    init: function(b) {
        this._super(b);
        if (this.cfg.custom) {
            this.originalInputs = this.jq.find(":checkbox");
            this.inputs = $('input:checkbox[name="' + this.id + '"].ui-chkbox-clone');
            this.outputs = this.inputs.parent().next(".ui-chkbox-box");
            for (var e = 0; e < this.inputs.length; e++) {
                var c = this.inputs.eq(e)
                  , a = c.data("itemindex")
                  , d = this.originalInputs.eq(a);
                c.val(d.val());
                if (d.is(":checked")) {
                    c.prop("checked", true).parent().next().addClass("ui-state-active").children(".ui-chkbox-icon").addClass("ui-icon-check").removeClass("ui-icon-blank")
                }
            }
        } else {
            this.outputs = this.jq.find(".ui-chkbox-box:not(.ui-state-disabled)");
            this.inputs = this.jq.find(":checkbox:not(:disabled)")
        }
        this.enabledInputs = this.inputs.filter(":not(:disabled)");
        this.bindEvents();
        this.inputs.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    bindEvents: function() {
        this.outputs.filter(":not(.ui-state-disabled)").on("mouseover", function() {
            $(this).addClass("ui-state-hover")
        }).on("mouseout", function() {
            $(this).removeClass("ui-state-hover")
        }).on("click", function() {
            var b = $(this)
              , a = b.prev().children(":checkbox");
            a.trigger("click");
            if ($.browser.msie && parseInt($.browser.version) < 9) {
                a.trigger("change")
            }
        });
        this.enabledInputs.on("focus", function() {
            var a = $(this)
              , b = a.parent().next();
            if (a.prop("checked")) {
                b.removeClass("ui-state-active")
            }
            b.addClass("ui-state-focus")
        }).on("blur", function() {
            var a = $(this)
              , b = a.parent().next();
            if (a.prop("checked")) {
                b.addClass("ui-state-active")
            }
            b.removeClass("ui-state-focus")
        }).on("change", function(d) {
            var a = $(this)
              , c = a.parent().next()
              , f = a.is(":focus")
              , b = a.is(":disabled");
            if (b) {
                return
            }
            if (a.is(":checked")) {
                c.children(".ui-chkbox-icon").removeClass("ui-icon-blank").addClass("ui-icon-check");
                if (!f) {
                    c.addClass("ui-state-active")
                }
            } else {
                c.removeClass("ui-state-active").children(".ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check")
            }
        })
    }
});
PrimeFaces.widget.SelectListbox = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        this.input = $(this.jqId + "_input"),
        this.listContainer = this.jq.children(".ui-selectlistbox-listcontainer");
        this.listElement = this.listContainer.children(".ui-selectlistbox-list");
        this.options = $(this.input).children("option");
        this.allItems = this.listElement.find(".ui-selectlistbox-item");
        this.items = this.allItems.filter(":not(.ui-state-disabled)");
        var b = this.options.filter(":selected:not(:disabled)");
        if (b.length) {
            PrimeFaces.scrollInView(this.listContainer, this.items.eq(b.eq(0).index()))
        }
        this.bindEvents();
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    bindEvents: function() {
        var a = this;
        this.items.on("mouseover.selectListbox", function() {
            var b = $(this);
            if (!b.hasClass("ui-state-highlight")) {
                b.addClass("ui-state-hover")
            }
        }).on("mouseout.selectListbox", function() {
            $(this).removeClass("ui-state-hover")
        }).on("dblclick.selectListbox", function(b) {
            a.input.trigger("dblclick");
            PrimeFaces.clearSelection();
            b.preventDefault()
        });
        this.input.on("focus.selectListbox", function() {
            a.jq.addClass("ui-state-focus")
        }).on("blur.selectListbox", function() {
            a.jq.removeClass("ui-state-focus")
        });
        if (this.cfg.filter) {
            this.filterInput = this.jq.find("> div.ui-selectlistbox-filter-container > input.ui-selectlistbox-filter");
            PrimeFaces.skinInput(this.filterInput);
            this.filterInput.on("keyup.selectListbox", function(b) {
                a.filter(this.value)
            });
            this.setupFilterMatcher()
        }
    },
    unselectAll: function() {
        this.items.removeClass("ui-state-highlight ui-state-hover");
        this.options.filter(":selected").prop("selected", false)
    },
    selectItem: function(a) {
        a.addClass("ui-state-highlight").removeClass("ui-state-hover");
        this.options.eq(a.index()).prop("selected", true)
    },
    unselectItem: function(a) {
        a.removeClass("ui-state-highlight");
        this.options.eq(a.index()).prop("selected", false)
    },
    setupFilterMatcher: function() {
        this.cfg.filterMatchMode = this.cfg.filterMatchMode || "startsWith";
        this.filterMatchers = {
            startsWith: this.startsWithFilter,
            contains: this.containsFilter,
            endsWith: this.endsWithFilter,
            custom: this.cfg.filterFunction
        };
        this.filterMatcher = this.filterMatchers[this.cfg.filterMatchMode]
    },
    startsWithFilter: function(b, a) {
        return b.indexOf(a) === 0
    },
    containsFilter: function(b, a) {
        return b.indexOf(a) !== -1
    },
    endsWithFilter: function(b, a) {
        return b.indexOf(a, b.length - a.length) !== -1
    },
    filter: function(e) {
        var f = this.cfg.caseSensitive ? $.trim(e) : $.trim(e).toLowerCase();
        if (f === "") {
            this.items.filter(":hidden").show()
        } else {
            for (var a = 0; a < this.options.length; a++) {
                var c = this.options.eq(a)
                  , b = this.cfg.caseSensitive ? c.text() : c.text().toLowerCase()
                  , d = this.items.eq(a);
                if (this.filterMatcher(b, f)) {
                    d.show()
                } else {
                    d.hide()
                }
            }
        }
    }
});
PrimeFaces.widget.SelectOneListbox = PrimeFaces.widget.SelectListbox.extend({
    bindEvents: function() {
        this._super();
        var a = this;
        if (!this.cfg.disabled) {
            this.items.on("click.selectListbox", function(d) {
                var b = $(this)
                  , c = a.items.filter(".ui-state-highlight");
                if (b.index() !== c.index()) {
                    if (c.length) {
                        a.unselectItem(c)
                    }
                    a.selectItem(b);
                    a.input.trigger("change")
                }
                a.input.trigger("click");
                PrimeFaces.clearSelection();
                d.preventDefault()
            })
        }
    }
});
PrimeFaces.widget.SelectManyMenu = PrimeFaces.widget.SelectListbox.extend({
    init: function(a) {
        this._super(a);
        this.allItems.filter(".ui-state-highlight").find("> .ui-chkbox > .ui-chkbox-box").addClass("ui-state-active")
    },
    bindEvents: function() {
        this._super();
        var a = this;
        if (!this.cfg.disabled) {
            this.items.on("click.selectListbox", function(h) {
                if (a.checkboxClick) {
                    a.checkboxClick = false;
                    return
                }
                var m = $(this)
                  , c = a.items.filter(".ui-state-highlight")
                  , j = (h.metaKey || h.ctrlKey)
                  , b = (!j && c.length === 1 && c.index() === m.index());
                if (!h.shiftKey) {
                    if (!j && !a.cfg.showCheckbox) {
                        a.unselectAll()
                    }
                    if (j && m.hasClass("ui-state-highlight")) {
                        a.unselectItem(m)
                    } else {
                        a.selectItem(m);
                        a.cursorItem = m
                    }
                } else {
                    if (a.cursorItem) {
                        a.unselectAll();
                        var k = m.index()
                          , n = a.cursorItem.index()
                          , l = (k > n) ? n : k
                          , g = (k > n) ? (k + 1) : (n + 1);
                        for (var f = l; f < g; f++) {
                            var d = a.allItems.eq(f);
                            if (d.is(":visible") && !d.hasClass("ui-state-disabled")) {
                                a.selectItem(d)
                            }
                        }
                    } else {
                        a.selectItem(m);
                        a.cursorItem = m
                    }
                }
                if (!b) {
                    a.input.trigger("change")
                }
                a.input.trigger("click");
                PrimeFaces.clearSelection();
                h.preventDefault()
            });
            if (this.cfg.showCheckbox) {
                this.checkboxes = this.jq.find(".ui-selectlistbox-item:not(.ui-state-disabled) div.ui-chkbox > div.ui-chkbox-box");
                this.checkboxes.on("mouseover.selectManyMenu", function(c) {
                    var b = $(this);
                    if (!b.hasClass("ui-state-active")) {
                        b.addClass("ui-state-hover")
                    }
                }).on("mouseout.selectManyMenu", function(b) {
                    $(this).removeClass("ui-state-hover")
                }).on("click.selectManyMenu", function(c) {
                    a.checkboxClick = true;
                    var b = $(this).closest(".ui-selectlistbox-item");
                    if (b.hasClass("ui-state-highlight")) {
                        a.unselectItem(b)
                    } else {
                        a.selectItem(b)
                    }
                    a.input.trigger("change")
                })
            }
        }
    },
    selectAll: function() {
        for (var a = 0; a < this.items.length; a++) {
            this.selectItem(this.items.eq(a))
        }
    },
    unselectAll: function() {
        for (var a = 0; a < this.items.length; a++) {
            this.unselectItem(this.items.eq(a))
        }
    },
    selectItem: function(a) {
        this._super(a);
        if (this.cfg.showCheckbox) {
            this.selectCheckbox(a.find("div.ui-chkbox-box"))
        }
    },
    unselectItem: function(a) {
        this._super(a);
        if (this.cfg.showCheckbox) {
            this.unselectCheckbox(a.find("div.ui-chkbox-box"))
        }
    },
    selectCheckbox: function(a) {
        a.removeClass("ui-state-hover").addClass("ui-state-active").children("span.ui-chkbox-icon").removeClass("ui-icon-blank").addClass("ui-icon-check")
    },
    unselectCheckbox: function(a) {
        a.removeClass("ui-state-active").children("span.ui-chkbox-icon").addClass("ui-icon-blank").removeClass("ui-icon-check")
    }
});
PrimeFaces.widget.CommandButton = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        PrimeFaces.skinButton(this.jq)
    },
    disable: function() {
        this.jq.removeClass("ui-state-hover ui-state-focus ui-state-active").addClass("ui-state-disabled").attr("disabled", "disabled")
    },
    enable: function() {
        this.jq.removeClass("ui-state-disabled").removeAttr("disabled")
    }
});
PrimeFaces.widget.Button = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        PrimeFaces.skinButton(this.jq)
    },
    disable: function() {
        this.jq.removeClass("ui-state-hover ui-state-focus ui-state-active").addClass("ui-state-disabled").attr("disabled", "disabled")
    },
    enable: function() {
        this.jq.removeClass("ui-state-disabled").removeAttr("disabled")
    }
});
PrimeFaces.widget.SelectManyButton = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        this.buttons = this.jq.children("div:not(.ui-state-disabled)");
        this.inputs = this.jq.find(":checkbox:not(:disabled)");
        this.bindEvents();
        this.inputs.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    bindEvents: function() {
        var a = this;
        this.buttons.on("mouseover", function() {
            var b = $(this);
            if (!b.hasClass("ui-state-active")) {
                b.addClass("ui-state-hover")
            }
        }).on("mouseout", function() {
            $(this).removeClass("ui-state-hover")
        }).on("click", function(d) {
            var c = $(this)
              , b = c.children(":checkbox");
            if (c.hasClass("ui-state-active")) {
                c.addClass("ui-state-hover")
            } else {
                c.removeClass("ui-state-hover")
            }
            b.trigger("focus").trigger("click")
        });
        this.inputs.on("focus", function() {
            var b = $(this)
              , c = b.parent();
            c.addClass("ui-state-focus")
        }).on("blur", function() {
            var b = $(this)
              , c = b.parent();
            c.removeClass("ui-state-focus")
        }).on("change", function() {
            var b = $(this)
              , c = b.parent();
            if (b.prop("checked")) {
                c.addClass("ui-state-active")
            } else {
                c.removeClass("ui-state-active")
            }
        }).on("click", function(b) {
            b.stopPropagation()
        })
    },
    select: function(a) {
        a.children(":checkbox").prop("checked", true).change()
    },
    unselect: function(a) {
        a.children(":checkbox").prop("checked", false).change()
    }
});
PrimeFaces.widget.SelectOneButton = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        this.buttons = this.jq.children("div:not(.ui-state-disabled)");
        this.inputs = this.jq.find(":radio:not(:disabled)");
        this.cfg.unselectable = this.cfg.unselectable === false ? false : true;
        this.bindEvents();
        this.inputs.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    bindEvents: function() {
        var a = this;
        this.buttons.on("mouseover", function() {
            var b = $(this);
            b.addClass("ui-state-hover")
        }).on("mouseout", function() {
            $(this).removeClass("ui-state-hover")
        }).on("click", function() {
            var c = $(this)
              , b = c.children(":radio");
            if (c.hasClass("ui-state-active") || b.prop("checked")) {
                a.unselect(c)
            } else {
                a.select(c)
            }
        });
        this.buttons.on("focus.selectOneButton", function() {
            var b = $(this);
            b.addClass("ui-state-focus")
        }).on("blur.selectOneButton", function() {
            var b = $(this);
            b.removeClass("ui-state-focus")
        }).on("keydown.selectOneButton", function(g) {
            var f = $.ui.keyCode
              , d = g.which;
            if (d === f.SPACE || d === f.ENTER || d === f.NUMPAD_ENTER) {
                var c = $(this)
                  , b = c.children(":radio");
                if (b.prop("checked")) {
                    a.unselect(c)
                } else {
                    a.select(c)
                }
                g.preventDefault()
            }
        })
    },
    select: function(a) {
        this.buttons.filter(".ui-state-active").removeClass("ui-state-active ui-state-hover").children(":radio").prop("checked", false);
        a.addClass("ui-state-active").children(":radio").prop("checked", true);
        this.triggerChange()
    },
    unselect: function(a) {
        if (this.cfg.unselectable) {
            a.removeClass("ui-state-active ui-state-hover").children(":radio").prop("checked", false).change();
            this.triggerChange()
        }
    },
    triggerChange: function() {
        if (this.cfg.change) {
            this.cfg.change.call(this)
        }
        if (this.hasBehavior("change")) {
            var a = this.cfg.behaviors.change;
            if (a) {
                a.call(this)
            }
        }
    },
    disable: function() {
        this.buttons.removeClass("ui-state-hover ui-state-focus ui-state-active").addClass("ui-state-disabled").attr("disabled", "disabled")
    },
    enable: function() {
        this.buttons.removeClass("ui-state-disabled").removeAttr("disabled")
    }
});
PrimeFaces.widget.SelectBooleanButton = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        this.input = $(this.jqId + "_input");
        this.disabled = this.input.is(":disabled");
        this.icon = this.jq.children(".ui-button-icon-left");
        var b = this;
        if (!this.disabled) {
            this.jq.on("mouseover", function() {
                if (!b.jq.hasClass("ui-state-active")) {
                    b.jq.addClass("ui-state-hover")
                }
            }).on("mouseout", function() {
                b.jq.removeClass("ui-state-hover")
            }).on("click", function() {
                b.toggle();
                b.input.trigger("focus")
            })
        }
        this.input.on("focus", function() {
            b.jq.addClass("ui-state-focus")
        }).on("blur", function() {
            b.jq.removeClass("ui-state-focus")
        }).on("keydown", function(d) {
            var c = $.ui.keyCode;
            if (d.which === c.SPACE) {
                d.preventDefault()
            }
        }).on("keyup", function(d) {
            var c = $.ui.keyCode;
            if (d.which === c.SPACE) {
                b.toggle();
                d.preventDefault()
            }
        });
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id)
    },
    toggle: function() {
        if (!this.disabled) {
            if (this.input.prop("checked")) {
                this.uncheck()
            } else {
                this.check()
            }
        }
    },
    check: function() {
        if (!this.disabled) {
            this.input.prop("checked", true);
            this.jq.addClass("ui-state-active").children(".ui-button-text").html(this.cfg.onLabel);
            if (this.icon.length > 0) {
                this.icon.removeClass(this.cfg.offIcon).addClass(this.cfg.onIcon)
            }
            this.input.trigger("change")
        }
    },
    uncheck: function() {
        if (!this.disabled) {
            this.input.prop("checked", false);
            this.jq.removeClass("ui-state-active").children(".ui-button-text").html(this.cfg.offLabel);
            if (this.icon.length > 0) {
                this.icon.removeClass(this.cfg.onIcon).addClass(this.cfg.offIcon)
            }
            this.input.trigger("change")
        }
    }
});
PrimeFaces.widget.SelectCheckboxMenu = PrimeFaces.widget.BaseWidget.extend({
    init: function(a) {
        this._super(a);
        this.labelContainer = this.jq.find(".ui-selectcheckboxmenu-label-container");
        this.label = this.jq.find(".ui-selectcheckboxmenu-label");
        this.menuIcon = this.jq.children(".ui-selectcheckboxmenu-trigger");
        this.triggers = this.jq.find(".ui-selectcheckboxmenu-trigger, .ui-selectcheckboxmenu-label");
        this.disabled = this.jq.hasClass("ui-state-disabled");
        this.inputs = this.jq.find(":checkbox");
        this.panelId = this.id + "_panel";
        this.labelId = this.id + "_label";
        this.keyboardTarget = $(this.jqId + "_focus");
        this.tabindex = this.keyboardTarget.attr("tabindex");
        this.cfg.showHeader = (this.cfg.showHeader === undefined) ? true : this.cfg.showHeader;
        this.cfg.dynamic = this.cfg.dynamic === true ? true : false;
        this.isDynamicLoaded = false;
        if (!this.disabled) {
            if (this.cfg.multiple) {
                this.triggers = this.jq.find(".ui-selectcheckboxmenu-trigger, .ui-selectcheckboxmenu-multiple-container")
            }
            if (!this.cfg.dynamic) {
                this._renderPanel()
            }
            this.bindEvents();
            this.bindKeyEvents();
            this.triggers.data("primefaces-overlay-target", true).find("*").data("primefaces-overlay-target", true);
            if (!this.cfg.multiple) {
                if (this.cfg.updateLabel) {
                    this.defaultLabel = this.label.text();
                    this.label.css({
                        "text-overflow": "ellipsis",
                        overflow: "hidden"
                    });
    
