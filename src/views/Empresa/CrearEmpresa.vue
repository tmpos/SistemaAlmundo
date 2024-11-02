<script setup>
import { ref, onMounted, nextTick, watchEffect } from 'vue';
import { vMaska } from "maska/vue"
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute(); 
import {enviarDatosPorPost,
  eliminarDatos, 
  obtenerIdsSeleccionados,
  borrarTodoslosDatos,
  lenguajeDataTable,
  nfecha,
  arrayToObjetoFromTabla,
  peticionesFetch,
  encryptarPassword,
  envioElectron,
  generarCodigoUnico,
  peticiones,
  toast,
  mensajetoast,
  lasMayusculas} from '../../funciones/funciones.js';
import Swal from 'sweetalert2'
/************************************************************************/
import FileUploader from '../../components/FileUploader.vue';
const rutaIMAGEN = ref('')
const urlIMAGEN = ref(null)
/************************************************************************/
//import {useDatosEmpresa} from '../../stores'
//const datosEmpresa = useDatosEmpresa();
const link = ref('');
const api = ref('');
const token = ref('');
const patronTelefono = ref('');
const linkImpresora = ref('');
const patroncedula = ref('');
const tokenCifrado = ref('');
const tokenCorto = ref('');
/************************************************************************/
const datoscamposEmpresa = ref({})
const codigoUnico = ref(generarCodigoUnico());
const fecha = ref(nfecha('fecha'));
const position = "top";
/************************************************************************/
const fetchAndSetupData = async () => {
    const jsonData = await arrayToObjetoFromTabla(link.value+api.value,tokenCifrado.value,'empresa');
    datoscamposEmpresa.value = jsonData;
datoscamposEmpresa.value.imagen = datoscamposEmpresa.value.imagen || generarCodigoUnico();
rutaIMAGEN.value = '../vista/img/empresa/'+datoscamposEmpresa.value.imagen;
};
/************************************************************************/
onMounted(async() => {
const datosJSON = await envioElectron('datosarchivo');
link.value = datosJSON.VITE_LINKURL;
api.value = datosJSON.VITE_LINK_API;
token.value = datosJSON.VITE_TOKEN;
patronTelefono.value = datosJSON.VITE_PATRON_TELEFONO;
linkImpresora.value = datosJSON.VITE_IMPRESORA_LOCAL;
patroncedula.value = datosJSON.VITE_PATRON_CEDULA;
tokenCorto.value = datosJSON.VITE_TOKEN_CORTO;
tokenCifrado.value = await encryptarPassword(token.value, 10);
/*if (!datosEmpresa.$state.nombre) {
    await datosEmpresa.inicializarDatosEmpresa(link.value+api.value);
  }*/
await fetchAndSetupData()
urlIMAGEN.value = link.value+api.value+"/subirunaimagen";
});
/************************************************************************/
async function enviarDatos(event) {
    event.preventDefault();
  const url = link.value+api.value+"/insertar/empresa";
  if (!datoscamposEmpresa.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Datos incompletos, no se puede Enviar.', life: 3000 });
    return;
  }
  if (datoscamposEmpresa.value.hasOwnProperty('created_at')) {
     datoscamposEmpresa.value.created_at = nfecha('timestamp')
     datoscamposEmpresa.value.updated_at = nfecha('timestamp')
    }
const imagen = await peticionesFetch(`${link.value}${api.value}`,'creardirectorio',{'ruta':rutaIMAGEN.value},tokenCifrado.value,'POST');
  const envioDatos = await enviarDatosPorPost(url, datoscamposEmpresa.value,tokenCifrado.value);
  if (envioDatos[0] == 'ok') {
     toast.add({ severity: 'success', summary: 'Éxito', detail: 'Datos Agregados con éxito.', life: 3000 });
await uploadImages()
Swal.fire({
  title: "Datos Agregados",
  text: "Que hacemos ahora?",
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Agregar Otro!",
  cancelButtonText: "No, Regresar al Inicio!",
 }).then(async(result) => {
  if (result.isConfirmed) {
      fetchAndSetupData()
} else if (result.dismiss === Swal.DismissReason.cancel) {
    router.push({ path: `/empresa` });
  }
})
  }else{
    toast.add({ severity: 'error', summary: 'Error', detail: 'Fallo al Agregar los datos.', life: 3000 });
  }
}
/************************************************************************/
  const handleUploadSuccess = (result) => {
  console.log('Upload successful:', result);
};
/************************************************************************/
const handleUploadError = (error) => {
  console.error('Upload failed:', error);
};
/************************************************************************/
const fileUpload = ref(null)
const uploadImages = async() => {
  if (fileUpload.value) {
    fileUpload.value.fnSubirIMG();
  }
};
/************************************************************************/
</script>
<template>
  <div class="container-fluid mt-5">
<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4">
  <div class="flex flex-wrap items-center justify-start space-x-2 space-y-2">
    <router-link class="btn btn-primary btn-sm mt-2 flex items-center" to="/empresa">
      <i class="pi pi-home p-1 text-lg"></i>
    </router-link>
  </div>
</div>
<section class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4">
    <form id="formularioActualizar" action="" method="">
         <div class="box-body">
          <div class="row" id="campos">
<div class="form-group " >
<label for="alertaAgregarDatos">ALERTA</label>
<input type="input" v-model="datoscamposEmpresa.alerta" name="alerta"  class="form-input " id="alertaAgregarDatos"   placeholder="alerta" maxlength="">
</div>
<div class="form-group " >
<label for="nombreAgregarDatos">NOMBRE</label>
<input type="input" v-model="datoscamposEmpresa.nombre" name="nombre"  class="form-input " id="nombreAgregarDatos"   placeholder="nombre" maxlength="">
</div>
<div class="form-group " >
<label for="legalAgregarDatos">LEGAL</label>
<input type="input" v-model="datoscamposEmpresa.legal" name="legal"  class="form-input " id="legalAgregarDatos"   placeholder="legal" maxlength="">
</div>
<div class="form-group " >
<label for="telefonoAgregarDatos">TELEFONO</label>
<input type="input" v-model="datoscamposEmpresa.telefono" name="telefono"  class="form-input " id="telefonoAgregarDatos"   placeholder="telefono" maxlength="">
</div>
<div class="form-group " >
<label for="emailAgregarDatos">EMAIL</label>
<input type="input" v-model="datoscamposEmpresa.email" name="email"  class="form-input " id="emailAgregarDatos"   placeholder="email" maxlength="">
</div>
<div class="form-group " >
<label for="direccionAgregarDatos">DIRECCION</label>
<input type="input" v-model="datoscamposEmpresa.direccion" name="direccion"  class="form-input " id="direccionAgregarDatos"   placeholder="direccion" maxlength="">
</div>
<div class="form-group " >
<label for="actualizacionAgregarDatos">ACTUALIZACION</label>
<input type="input" v-model="datoscamposEmpresa.actualizacion" name="actualizacion"  class="form-input " id="actualizacionAgregarDatos"   placeholder="actualizacion" maxlength="">
</div>
<div class="form-group " >
<label for="bloqueoAgregarDatos">BLOQUEO</label>
<input type="input" v-model="datoscamposEmpresa.bloqueo" name="bloqueo"  class="form-input " id="bloqueoAgregarDatos"   placeholder="bloqueo" maxlength="">
</div>
<div class="form-group " >
<label for="tokenAgregarDatos">TOKEN</label>
<input type="input" v-model="datoscamposEmpresa.token" name="token"  class="form-input " id="tokenAgregarDatos"   placeholder="token" maxlength="">
</div>
<div class="form-group " hidden>
<label for="created_atAgregarDatos">CREATED_AT</label>
<input type="input" v-model="datoscamposEmpresa.created_at" name="created_at"  class="form-input " id="created_atAgregarDatos"   placeholder="created_at" maxlength="">
</div>
<div class="form-group " hidden>
<label for="updated_atAgregarDatos">UPDATED_AT</label>
<input type="input" v-model="datoscamposEmpresa.updated_at" name="updated_at"  class="form-input " id="updated_atAgregarDatos"   placeholder="updated_at" maxlength="">
</div>
<div class="form-group " >
<label for="imagenAgregarDatos">IMAGEN</label>
 <FileUploader
    ref="fileUpload"
   :url-IMAGEN="urlIMAGEN"
   :ruta-IMAGEN="rutaIMAGEN"
   :autoUpload="false"
   @uploadSuccess="handleUploadSuccess"
   @uploadError="handleUploadError"
 />
</div>
<div class="form-group " hidden>
<label for="usuarioAgregarDatos">USUARIO</label>
<input type="input" v-model="datoscamposEmpresa.usuario" name="usuario"  class="form-input " id="usuarioAgregarDatos"   placeholder="usuario" maxlength="250">
</div>
<div class="form-group col-sm-12 mb-5 mt-5 flex justify-end">
  <button type="button" class="btn btn-primary btn-sm m-1 flex items-center" @click="enviarDatos">
    <i class="pi pi-check p-1 text-lg"></i>
    Guardar Datos
  </button>
</div>
  </div>
  </div>
   </form>
</section>
  </div>
</template>
<style scoped>
</style>
