/*
 * This is the code which the event listener run when
 * the user click on a new tab in the document table
 * */

function(d){
    console.log('printing from tab change event listener');
    // d must be the target
    console.log('d: ', d);
    var c=$(this); // c must be the table object
    console.log('c: ', c);
    // a is the tbale object -> PrimeFaces.widgets['widget_frmInformacionCompanias_tabViewDocumentacion']
    if($(d.target).is(":not(.ui-icon-close)")){ // 
        var b=a.headerContainer.index(c); // wha is a?
        console.log('b:', b)
        console.log('a:', a)
        // here we need to get b
        if(!c.hasClass("ui-state-disabled") && b!==a.cfg.selected ){
            a.select(b)
        }
    }
    d.preventDefault()
}

// this is the function of a.headerContainer.index
function(a){
    return (a)? 
        ("string"==typeof a)? 
        i.call(r(a),this[0]) : i.call(
            this,a.jquery? a[0] : a
        ) : this[0] && this[0].parentNode? 
        this.first().prevAll().length : -1
}
