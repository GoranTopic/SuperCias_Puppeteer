export default () => {

    document.addEventListener(
        'pfAjaxComplete',
        function(){
            console.log('from eventListener pfAjaxComplete');
            console.log('a:', a);
            a.trigger("complete", arguments)
        },
        false
    ); 

    document.addEventListener(
        'pfAjaxStart',
        function(){
            console.log('from eventListener pfAjaxStart');
            console.log('a:', a);
            a.trigger("start", arguments)
        },
        false
    ); 

    document.addEventListener(
        'pfAjaxSuccess',
        function(){
            console.log('from eventListener pfAjaxSuccess');
            console.log('a:', a);
            a.trigger("success", arguments)
        },
        false
    ); 

    document.addEventListener(
        'pfAjaxError',
        function(){
            console.log('from eventListener pfAjaxError');
            console.log('a:', a);
            a.trigger("error", arguments)
        },
        false
    ); 
    
    let tabs =
        document.getElementsByClassName('ui-tabs-header ui-state-default ui-corner-top')
    for( let tab of tabs){
        tab.addEventListener(
            'click',
            function(d){
                // lol I don't know how to define it in event scope
                let a = window.PrimeFaces.widgets['widget_frmInformacionCompanias_tabViewDocumentacion'];
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
        )
    }



}
