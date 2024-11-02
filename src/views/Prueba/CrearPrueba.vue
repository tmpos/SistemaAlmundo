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
import LoadingOverlay from '../../Loading/LoadingOverlay.vue';
const loading = ref(false)
/************************************************************************/
import FileUploader from '../../components/FileUploader.vue';
const rutaIMAGEN = ref('')
const urlIMAGEN = ref(null)
const uploadUrl = ref(null)
const additionalData = ref(null)
const fileUploaderRef = ref(null);
/************************************************************************/
import {useDatosEmpresa} from '../../stores'
const datosEmpresa = useDatosEmpresa();
const link = ref('');
const api = ref('');
const token = ref('');
const patronTelefono = ref('');
const linkImpresora = ref('');
const patroncedula = ref('');
const tokenCifrado = ref('');
const tokenCorto = ref('');
/************************************************************************/
const datoscamposPrueba = ref({})
const codigoUnico = ref(generarCodigoUnico());
const fecha = ref(nfecha('fecha'));
const position = "top";
/************************************************************************/
const fetchAndSetupData = async () => {
    const jsonData = await arrayToObjetoFromTabla(link.value+api.value,tokenCifrado.value,'prueba');
    datoscamposPrueba.value = jsonData;
datoscamposPrueba.value.imagen = datoscamposPrueba.value.imagen || generarCodigoUnico();
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
await fetchAndSetupData()
uploadUrl.value = link.value+api.value+"/subirunaimagen";
additionalData.value = {ruta: '../vista/img/prueba/'+datoscamposPrueba.value.imagen};
});
/************************************************************************/
async function enviarDatos(event) {
    event.preventDefault();
  const url = link.value+api.value+"/insertar/prueba";
  if (!datoscamposPrueba.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Datos incompletos, no se puede Enviar.', life: 3000 });
    return;
  }
  if (datoscamposPrueba.value.hasOwnProperty('created_at')) {
     datoscamposPrueba.value.created_at = nfecha('timestamp')
     datoscamposPrueba.value.updated_at = nfecha('timestamp')
    }
const imagen = await peticionesFetch(`${link.value}${api.value}`,'creardirectorio',{'ruta':'../vista/img/prueba/'+datoscamposPrueba.value.imagen},tokenCifrado.value,'POST');
  const envioDatos = await enviarDatosPorPost(url, datoscamposPrueba.value,tokenCifrado.value);
  if (envioDatos[0] == 'ok') {
     toast.add({ severity: 'success', summary: 'Éxito', detail: 'Datos Agregados con éxito.', life: 3000 });
await uploadImages()
loading.value = false;
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
    router.push({ path: `/prueba` });
  }
})
  }else{
    toast.add({ severity: 'error', summary: 'Error', detail: 'Fallo al Agregar los datos.', life: 3000 });
  }
}
/************************************************************************/
  const handleSuccess = (result) => {
  console.log('Upload successful:', result);
};
/************************************************************************/
const handleError = (error) => {
  console.error('Upload failed:', error);
};
/************************************************************************/
const uploadImages = async () => {
  loading.value = true; 
  if (fileUploaderRef.value && typeof fileUploaderRef.value.uploadFiles === 'function') {
    try {
      await fileUploaderRef.value.uploadFiles(); 
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Archivos subidos correctamente.', life: 3000 });
    } catch (error) {
      console.error('Error al subir archivos:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Error al subir archivos.', life: 3000 });
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo acceder al componente de subida.', life: 3000 });
  }
};
/************************************************************************/
</script>
<template>
  <div class="container-fluid mt-5">
<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4">
  <div class="flex flex-wrap items-center justify-start space-x-2 space-y-2">
    <router-link class="btn btn-primary btn-sm mt-2 flex items-center" to="/prueba">
      <i class="pi pi-home p-1 text-lg"></i>
    </router-link>
  </div>
</div>
<section class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4">
    <form id="formularioActualizar" action="" method="">
         <div class="box-body">
          <div class="row" id="campos">
<div class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12" >
<label for="nombreAgregarDatos">NOMBRE</label>
<input type="input" v-model="datoscamposPrueba.nombre" name="nombre"  class="form-input " id="nombreAgregarDatos"  v-mayuscula placeholder="nombre" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12" >
<label for="direccionAgregarDatos">DIRECCION</label>
<textarea class="form-input " v-model="datoscamposPrueba.direccion" id="direccionAgregarDatos" name="direccion" cols="30" rows="3" ></textarea>
</div>
<div class="form-group " hidden>
<label for="created_atAgregarDatos">CREATED_AT</label>
<input type="input" v-model="datoscamposPrueba.created_at" name="created_at"  class="form-input " id="created_atAgregarDatos"   placeholder="created_at" maxlength="">
</div>
<div class="form-group " hidden>
<label for="updated_atAgregarDatos">UPDATED_AT</label>
<input type="input" v-model="datoscamposPrueba.updated_at" name="updated_at"  class="form-input " id="updated_atAgregarDatos"   placeholder="updated_at" maxlength="">
</div>
<div class="form-group " >
<label for="imagenAgregarDatos">IMAGEN</label>
    <FileUploader 
       ref="fileUploaderRef"
      :uploadUrl="uploadUrl" 
      :additionalData="additionalData" 
      :autoUpload="false" 
      :onSuccess="handleSuccess"
      :onError="handleError"
      :showPreview="true"
    /> 
</div>
<div class="form-group " hidden>
<label for="usuarioAgregarDatos">USUARIO</label>
<input type="input" v-model="datoscamposPrueba.usuario" name="usuario"  class="form-input " id="usuarioAgregarDatos"   placeholder="usuario" maxlength="250">
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
