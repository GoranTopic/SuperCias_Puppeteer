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

}
