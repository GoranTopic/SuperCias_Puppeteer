// this is a custon auto complete widget,
// it is mean tot read by the browser to overwite the origial createWidget
export default () => {
    
    // overwrite create widget function
    window.PrimeFaces.createWidget = function(d, f, c) {
        // from an example I the response, d is a string, "Effect".
        // d semm to the name of the widget
        // f are the widgets, valiables? 
        // c is PrimaryFaces
        console.log('printing from createWidget function:')
        console.log('d:', d);
        console.log('f:', f);
        console.log('c:', c);
        c.widgetVar = f; // save the vaiables in c
        if (this.widget[d]) { // if we found a valid widget
            var e = this.widgets[f];
            if (e && (e.constructor === this.widget[d])) {
                e.refresh(c)
            } else {
                this.widgets[f] = new this.widget[d](c);
                // let add it to the window as well
                this.widgets[d] = this.widgets[f];
                if (this.settings.legacyWidgetNamespace) {
                    a[f] = this.widgets[f] // a is the window
                }
            }
        } else {// not valid widget name
            b.error("Widget not available: " + d)
        }
    }

}
