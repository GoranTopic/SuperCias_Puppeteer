// this is the response from clicking on the nombres radio seletecor
// this updates a tag, however, it is jus tin ther form of a script, doe this has to already exits?
    <update id =" frmBusquedaCompanias:msgBusquedaCompanias " >
        <script id="frmBusquedaCompanias:j_idt16_s" type="text/javascript">
            PrimeFaces.cw(
            "Effect",
            "widget_frmBusquedaCompanias_j_idt16",
            {
                id:"frmBusquedaCompanias:j_idt16",
                    source:"frmBusquedaCompanias:msgBusquedaCompanias",
                    event:"load",
                    delay:0,
                    fn:function(){ // if this function getting the client id and the seaching the dom for it?
                        $( PrimeFaces.escapeClientId('frmBusquedaCompanias:msgBusquedaCompanias') )
                            .effect( // this seem to be js native function
                                'pulsate',
                                {},
                                1000
                            );
                    }
            }
            );
        </script>
        <div id="frmBusquedaCompanias:msgBusquedaCompanias" class="ui-messages ui-widget" style="width:650px;margin-left: auto;margin-right: auto;" aria-live="polite"></div>
    </update >

<update id =" frmBusquedaCompanias:parametroBusqueda " >
    <span id="frmBusquedaCompanias:parametroBusqueda" class="ui-autocomplete">
        <input id="frmBusquedaCompanias:parametroBusqueda_input" name="frmBusquedaCompanias:parametroBusqueda_input" type="text" 
            class="ui-autocomplete-input ui-inputfield ui-widget ui-state-default ui-corner-all" autocomplete="off" style="width:610px;text-transform:uppercase;" maxlength="50" 
            placeholder="INGRESE EL NOMBRE" onkeypress="return true;" value="" />
        <span id="frmBusquedaCompanias:parametroBusqueda_panel" class="ui-autocomplete-panel ui-widget-content ui-corner-all ui-helper-hidden ui-shadow ui-input-overlay" role="listbox" 
            style="width:610px;">
        </span>
    </span>
    <script id="frmBusquedaCompanias:parametroBusqueda_s" type="text/javascript">
        PrimeFaces.cw(
        "AutoComplete",
        "widget_frmBusquedaCompanias_parametroBusqueda",
        { id:"frmBusquedaCompanias:parametroBusqueda", // if i dig into the AutoComplete widget
                delay:200, // I should get he function which queries the name autocompletion
                cache:true,
                cacheTimeout:300000,
                behaviors:{
                    itemSelect: function(ext,event) { // this is the function that i need to run got select a suggestion
                        // howeve wheer is the input of the name of the compay id? the definition fot this function can be found in core.js:675
                        PrimeFaces.ab( {
                            s:"frmBusquedaCompanias:parametroBusqueda", // source
                            e:"itemSelect", // event
                            p:"frmBusquedaCompanias:parametroBusqueda",// process
                            u:"frmBusquedaCompanias:parametroBusqueda frmBusquedaCompanias:panelCompaniaSeleccionada frmBusquedaCompanias:panelCaptcha frmBusquedaCompanias:btnConsultarCompania", // update
                            onst: function(cfg){ // on start callback
                                PF('dlgProcesando').show();;
                            },
                            onco: function(xhr,status,args){ // on complete callback
                                PF('dlgProcesando').hide();
                                document.getElementById('frmBusquedaCmpanias:captcha')
                                    .focus();;
                            }
                        }, ext);
                    }
                }
        }
        );
    </script>
</update>

<update id =" frmBusquedaCompanias:panelCompaniaSeleccionada" >
    <span id="frmBusquedaCompanias:panelCompaniaSeleccionada"> </span>
</update>

<update id =" frmBusquedaCompanias:panelCaptcha " >
    <span id="frmBusquedaCompanias:panelCaptcha"></span>
</update >

// this is what happedn when the user clicks the search button
<update id =" frmBusquedaCompanias:btnConsultarCompania" >
    <button id="frmBusquedaCompanias:btnConsultarCompania" name="frmBusquedaCompanias:btnConsultarCompania" 
        class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-left ui-state-disabled" 
        // this is code in the form of a string!
        onclick={
            PrimeFaces.ab( {
                s:&quot;frmBusquedaCompanias:btnConsultarCompania&quot;,
                p:&quot;frmBusquedaCompanias&quot;,
                onst: function(cfg){
                    PF('dlgProcesando').show();;
                },
                onco: function(xhr,status,args){
                    PF('dlgProcesando').hide(); 
                    // this is the fuction that triggers the loading of the company page. 
                    // but where is the definition of this function?
                    // what are th parameters?
                    // this function just checks for he values in arg if it is valiadated and set loacation to  args
                    handleMostrarPaginaInformacionCompania(xhr,status,args);;
                }
            } );
            return false;
        }
        style="font-size:9pt;border-radius:10px;" title="Haga clic aquí para realizar la consulta" type="submit" disabled="disabled">
        <span class="ui-button-icon-left ui-icon ui-c btn-consultar">
        </span>
        <span class="ui-button-text ui-c">
            Consultar
        </span>
    </button>
    <script id="frmBusquedaCompanias:btnConsultarCompania_s" type="text/javascript">
        PrimeFaces.cw("CommandButton","widget_frmBusquedaCompanias_btnConsultarCompania",{id:"frmBusquedaCompanias:btnConsultarCompania"});
    </script>
</update >
<update id =" javax.faces.ViewState " >
    3016068898793583544:-8761820575580992768
</update >
