/* this is te response from the server when selecting a company
 * it will send a captchan and you will send the conlay you want to qury, maybe.*/ 
/* this is the post payload that gets sent to the server when selecting a compnay */
javax.faces.partial.ajax=true&
    javax.faces.source=frmBusquedaCompanias%3AparametroBusqueda&
    javax.faces.partial.execute=frmBusquedaCompanias%3AparametroBusqueda&
    javax.faces.partial.render=frmBusquedaCompanias%3AparametroBusqueda+frmBusquedaCompanias%3ApanelCompaniaSeleccionada+frmBusquedaCompanias%3ApanelCaptcha+frmBusquedaCompanias%3AbtnConsultarCompania&
    javax.faces.behavior.event=itemSelect&
    javax.faces.partial.event=itemSelect&
    frmBusquedaCompanias%3AparametroBusqueda_itemSelect=136091+-+0992654449001+-+''+ETISA+CONSTRUCCIONES+''+S.A.&
    frmBusquedaCompanias=frmBusquedaCompanias&
    frmBusquedaCompanias%3AtipoBusqueda=3&
    frmBusquedaCompanias%3AparametroBusqueda_input=136091+-+0992654449001+-+''+ETISA+CONSTRUCCIONES+''+S.A.&
    frmBusquedaCompanias%3Abrowser=Chrome&
    frmBusquedaCompanias%3AaltoBrowser=943&
    frmBusquedaCompanias%3AanchoBrowser=751&
    frmBusquedaCompanias%3AmenuDispositivoMovil=hidden&
    javax.faces.ViewState=-4362825209107595723%3A7920168475529913534
/* this is the response from the server */
 <changes >
     <update id =" frmBusquedaCompanias:msgBusquedaCompanias" >
         <script id="frmBusquedaCompanias:j_idt16_s" type="text/javascript">
             PrimeFaces.cw(
             "Effect",
             "widget_frmBusquedaCompanias_j_idt16",{
                 id:"frmBusquedaCompanias:j_idt16",
                     source:"frmBusquedaCompanias:msgBusquedaCompanias",
                     event:"load",
                     delay:0,
                     fn:function(){
                         $(PrimeFaces.escapeClientId('frmBusquedaCompanias:msgBusquedaCompanias')).effect('pulsate',{},1000);
                     }
             }
             );
         </script>
         <div id="frmBusquedaCompanias:msgBusquedaCompanias" class="ui-messages ui-widget" style="width:650px;margin-left: auto;margin-right: auto;" aria-live="polite">
         </div>
     </update >

     <update id =" frmBusquedaCompanias:parametroBusqueda " >
         <span id="frmBusquedaCompanias:parametroBusqueda" class="ui-autocomplete">
             <input id="frmBusquedaCompanias:parametroBusqueda_input" name="frmBusquedaCompanias:parametroBusqueda_input" type="text" class="ui-autocomplete-input ui-inputfield ui-widget ui-state-default ui-corner-all" autocomplete="off" style="width:610px;text-transform:uppercase;" maxlength="50" placeholder="INGRESE EL NOMBRE" onkeypress="return true;" value="'' COMPAÑIA DE TRANSPORTE DE CARGA PESADA GAVIOTA OCCIDENTAL S.A. TRANSGA VIOCCIDEN ''" />
             <span id="frmBusquedaCompanias:parametroBusqueda_panel" class="ui-autocomplete-panel ui-widget-content ui-corner-all ui-helper-hidden ui-shadow ui-input-overlay" role="listbox" style="width:610px;">
             </span>
         </span>
         <script id="frmBusquedaCompanias:parametroBusqueda_s" type="text/javascript">
             PrimeFaces.cw(
             "AutoComplete",
             "widget_frmBusquedaCompanias_parametroBusqueda",{
                 id:"frmBusquedaCompanias:parametroBusqueda",
                     delay:200,
                     cache:true,
                     cacheTimeout:300000,
                     behaviors:{
                         itemSelect:function(ext,event) {
                             PrimeFaces.ab({
                                 s:"frmBusquedaCompanias:parametroBusqueda",
                                 e:"itemSelect",
                                 p:"frmBusquedaCompanias:parametroBusqueda",
                                 u:"frmBusquedaCompanias:parametroBusqueda frmBusquedaCompanias:panelCompaniaSeleccionada frmBusquedaCompanias:panelCaptcha frmBusquedaCompanias:btnConsultarCompania",
                                 onst:function(cfg){ PF('dlgProcesando').show();; },
                                 onco:function(xhr,status,args){
                                     PF('dlgProcesando').hide();
                                     document.getElementById('frmBusquedaCompanias:captcha').focus();;}
                             },ext);
                         }
                     }
             }
             );
         </script>
     </update>

     <update id =" frmBusquedaCompanias:panelCompaniaSeleccionada " >
         <span id="frmBusquedaCompanias:panelCompaniaSeleccionada">
             <div id="frmBusquedaCompanias:j_idt22" class="ui-panel ui-widget ui-widget-content ui-corner-all" data-widget="widget_frmBusquedaCompanias_j_idt22">
                 <div id="frmBusquedaCompanias:j_idt22_header" class="ui-panel-titlebar ui-widget-header ui-helper-clearfix ui-corner-all">
                     <span class="ui-panel-title">
                         Compañía seleccionada para consultar
                     </span>
                 </div>
                 <div id="frmBusquedaCompanias:j_idt22_content" class="ui-panel-content ui-widget-content">
                     <table>
                         <tbody>
                             <tr>
                                 <td><label id="frmBusquedaCompanias:j_idt24" class="ui-outputlabel ui-widget" style="font-weight:bold !important;">Expediente:</label></td>
                                 <td><label id="frmBusquedaCompanias:j_idt25" class="ui-outputlabel ui-widget" style="font-weight:bold !important;color:#ab00ab !important;">718391</label></td>
                             </tr>
                             <tr>
                                 <td><label id="frmBusquedaCompanias:j_idt26" class="ui-outputlabel ui-widget" style="font-weight:bold !important;">R.U.C.:</label></td>
                                 <td><label id="frmBusquedaCompanias:j_idt27" class="ui-outputlabel ui-widget" style="font-weight:bold !important;color:#ab00ab !important;">0993112429001</label></td>
                             </tr>
                             <tr>
                                 <td><label id="frmBusquedaCompanias:j_idt28" class="ui-outputlabel ui-widget" style="font-weight:bold !important;">Nombre:</label></td>
                                 <td><label id="frmBusquedaCompanias:j_idt29" class="ui-outputlabel ui-widget" style="font-weight:bold !important;color:#ab00ab !important;">
                                     '' COMPAÑIA DE TRANSPORTE DE CARGA PESADA GAVIOTA OCCIDENTAL S.A. TRANSGA VIOCCIDEN ''
                                 </label></td>
                             </tr>
                         </tbody>
                     </table>
                 </div>
             </div>
             <script id="frmBusquedaCompanias:j_idt22_s" type="text/javascript">
                 PrimeFaces.cw("Panel","widget_frmBusquedaCompanias_j_idt22",{id:"frmBusquedaCompanias:j_idt22"});
             </script>

         </span>
     </update >

     <update id =" frmBusquedaCompanias:panelCaptcha " >
         <span id="frmBusquedaCompaniaspanelCaptcha">
             <div id="frmBusquedaCompanias:j_idt30" class="ui-panel ui-widget ui-widget-content ui-corner-all" data-widget="widget_frmBusquedaCompanias_j_idt30">
                 <div id="frmBusquedaCompanias:j_idt30_header" class="ui-panel-titlebar ui-widget-header ui-helper-clearfix ui-corner-all">
                     <span class="ui-panel-title">
                         No soy un robot
                     </span>
                 </div>
                 <div id="frmBusquedaCompanias:j_idt30_content" class="ui-panel-content ui-widget-content">
                     <table>
                         <tbody>
                             <tr>
                                 <td>
                                     <input id="frmBusquedaCompanias:captcha" name="frmBusquedaCompanias:captcha" type="text" autocomplete="off" maxlength="6"
                                         placeholder="INGRESE EL NÚMERO CONTENIDO EN LA SIGUIENTE IMAGEN"
                                         onkeypress={ return validarSoloNumerosCaptcha(event) }
                                         style="width:350px;" aria-required="true" class="ui-inputfield ui-inputtext ui-widget ui-state-default ui-corner-all" />
                                     <script id="frmBusquedaCompanias:captcha_s" type="text/javascript">
                                         PrimeFaces.cw("InputText","widget_frmBusquedaCompanias_captcha",{id:"frmBusquedaCompanias:captcha"});
                                     </script>
                                 </td>
                             </tr>
                             <tr>
                                 <td><img id="frmBusquedaCompanias:captchaImage" src="https://appscvsconsultas.supercias.gob.ec/consultaCompanias/tmp/19975642863191271347361243989862.png" alt="" /></td>
                             </tr>
                         </tbody>
                     </table>
                 </div>
             </div>
             <script id="frmBusquedaCompanias:j_idt30_s" type="text/javascript">
                 PrimeFaces.cw("Panel","widget_frmBusquedaCompanias_j_idt30",{id:"frmBusquedaCompanias:j_idt30"});
             </script>
         </span>
     </update >
     <update id =" frmBusquedaCompanias:btnConsultarCompania " >
         <button id="frmBusquedaCompanias:btnConsultarCompania" name="frmBusquedaCompanias:btnConsultarCompania" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-left"
             onclick={
                 PrimeFaces.ab(
                     {s:&quot;frmBusquedaCompanias:btnConsultarCompania&quot;,p:&quot;frmBusquedaCompanias&quot;,
                         onst:function(cfg){PF('dlgProcesando').show();;},
                         onco:function(xhr,status,args){
                             PF('dlgProcesando').hide();
                             handleMostrarPaginaInformacionCompania(xhr,status,args);;
                         }
                     }
                 );return false;}
             style="font-size:9pt;border-radius:10px;" title="Haga clic aquí para realizar la consulta" type="submit">
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
         -5855920953311629791:7281284086771717357
     </update >
 </changes>
