/*
 * this is a code copy from the website function HandleVerificarCaptchan 
 * which run whe the button from a captachn query is pressed
 * it has been formated fo conveience
 * */



// this function only seem to read the response from 
function handleVerificarCaptcha(xhr,status,args) {
    if (args.captchaCorrecto) {
        PF('dlgCaptcha').hide();  
        //alert('Procesamiento correcto: ' + args.procesamientoCorrecto);
        if (args.procesamientoCorrecto) {
            PF('dlgCaptcha').hide();
            //alert('Ultima opcion seleccionada: ' + args.ultimaOpcionSeleccionada);
            if (args.ultimaOpcionSeleccionada == 'certificadoInformacionGeneral' || 
                args.ultimaOpcionSeleccionada == 'certificadoAdministradoresActuales' ||
                args.ultimaOpcionSeleccionada == 'certificadoAdministradoresAnteriores' ||
                args.ultimaOpcionSeleccionada == 'certificadoAccionistas' || 
                args.ultimaOpcionSeleccionada == 'kardexAccionistasEnFormatoPdf' ||
                args.ultimaOpcionSeleccionada == 'certificadoCumplimientoObligaciones' ||
                args.ultimaOpcionSeleccionada == 'nombramientoAdministrador' || 
                args.ultimaOpcionSeleccionada == 'informacionAnual' || 
                args.ultimaOpcionSeleccionada == 'documentoGeneral' || 
                args.ultimaOpcionSeleccionada == 'documentoJuridico' || 
                args.ultimaOpcionSeleccionada == 'documentoEconomico' || 
                args.ultimaOpcionSeleccionada == 'documentoValorAdeudado' || 
                args.ultimaOpcionSeleccionada == 'documentoValorPagado' ||
                args.ultimaOpcionSeleccionada == 'documentoNotificacionGeneral') {
                handleMostrarDialogoPresentarDocumentoPdf(xhr,status,args);  
            } else if (args.ultimaOpcionSeleccionada=='kardexAccionistasEnFormatoExcel') { 
                handleMostrarArchivoExcel(xhr,status,args) 
            } else if (args.ultimaOpcionSeleccionada=='detalleActoJuridico') { 
                handleMostrarDialogoDetalleActoJuridico(xhr,status,args)
            } else if (args.ultimaOpcionSeleccionada=='personaAdministradorActual') { 
                handleMostrarDialogoInformacionPersona(xhr,status,args)
            } else if (args.ultimaOpcionSeleccionada=='tabAdministradoresAnterioresPersona') {
                handleMostrarDialogoInformacionPersona(xhr,status,args)
            } 
        }
    }
}
