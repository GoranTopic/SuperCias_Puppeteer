
/*
 * this is an example of the code that is 
 * run when the user changes the numebr of rows per table
 *
 */

function(b){
    if(!$(this).hasClass("ui-state-disabled")){ 
        // if it is not disabled
        // a is the paginator objcte inside the tableDocumentosHenerales widget
        a.setRowsPerPage(parseInt($(this).val())
        )
    }
}


// this is the code for function setRowsPerPage
function(b){
    var c = this.cfg.rows * this.cfg.page,
        a = parseInt( c / b );
    this.cfg.rows = b;
    this.cfg.pageCount = Math.ceil(
        this.cfg.rowCount / this.cfg.rows
    );
    this.cfg.page=-1;
    this.setPage(a)
}
