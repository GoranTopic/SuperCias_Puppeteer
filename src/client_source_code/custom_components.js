// this is a custon auto complete widget,
// it is mean tot read by the browser to overwite the origial AutoComplete wiget
export default () => {

    window.PrimeFaces.ab = function(a, c) {
        // the parameter a is an object
        console.log("printing from primefaces ab:");
        console.log("a", a);
        console.log("c", c);
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
        PrimeFaces.ajax.Request.handle(a, c)
    };


    window.PrimeFaces.widget.AutoComplete = window.PrimeFaces.widget.BaseWidget.extend({
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
            console.log('form invokeItemSelectBehavior:');
            console.log('b:', b);
            console.log('d:', d);
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




}
