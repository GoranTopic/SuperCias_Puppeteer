function cargarPagina() {
    if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_BACK_FORWARD) {
        //PF('dlgProcesando').show(); // why is this commented out?
        // was it too fast for the page to show the loading bar?
        location.reload();
    } else {
        document.getElementById('frmBusquedaCompanias:parametroBusqueda_input').focus();
        return false;
    }
}

function mensaje(message, type){
    return '<div class="ui-messages-' + type + ' ui-corner-all">'+
        '<a href="#" class="ui-messages-close" onclick="$(this).parent().slideUp();return false;">'+
            '<span class="ui-icon ui-icon-close" />'+
        '</a>'+
        '<span class="ui-messages-' + type + '-icon" />'+
        '<ul>'+
            '<li>'+
                '<span class="ui-messages-' + type + '-summary">'+ message + '</span>'+
            '</li>'+
        '</ul>'+
    '</div>';
};

function validarSoloNumeros(evt){
    var code = (evt.which) ? evt.which : evt.keyCode;
    if(code==48 || code==49 || code==50 || code==51 || code==52 || code==53 || code==54 || code==55 || code==56 || code==57) {
        return true;
    } else {
        var divMensaje=document.getElementById('frmBusquedaCompanias:msgBusquedaCompanias');
        divMensaje.style.visibility= 'visible';
        divMensaje.innerHTML = mensaje('Los tipos de parámetros EXPEDIENTE o RUC solo admiten el ingreso de dígitos del 0 al 9','warn');
        return false;
    }
}

function validarSoloNumerosCaptcha(evt){
    var code = (evt.which) ? evt.which : evt.keyCode;
    if(code==48 || code==49 || code==50 || code==51 || code==52 || code==53 || code==54 || code==55 || code==56 || code==57) {
        return true;
    } else {
        var divMensaje=document.getElementById('frmBusquedaCompanias:msgBusquedaCompanias');
        divMensaje.style.visibility= 'visible';
        divMensaje.innerHTML = mensaje('Solo se admite el ingreso de dígitos del 0 al 9','warn');
        return false;
    }
}

function obtenerNavegador() {
    //alert(navigator.userAgent);
    if((navigator.userAgent.indexOf("Opera") != -1 || navigator.userAgent.indexOf('OPR')) != -1 ) {
        //alert('Opera');
        return 'Opera';
    } else if(navigator.userAgent.indexOf("Edg") != -1 ) {
        //alert('Edge');
        return 'Edge';
    } else if(navigator.userAgent.indexOf("Chrome") != -1 ) {
        //alert('Chrome');
        return 'Chrome';
    } else if(navigator.userAgent.indexOf("Safari") != -1) {
        //alert('Safari');
        return 'Safari';
    } else if(navigator.userAgent.indexOf("Firefox") != -1 ) {
        //alert('Firefox');
        return 'Firefox';
    } else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) {
        //alert('IE');
        return 'IE';
    }  else {
        //alert('unknown');
        return 'Chrome';
    }
}
