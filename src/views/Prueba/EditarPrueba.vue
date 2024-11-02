<script setup>
import { ref, onMounted, nextTick, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute(); 
import { vMaska } from "maska/vue" 
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
  enviarSolicitudGet,
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
const fileUpload = ref(null);
const arrayIMG = ref([])
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
const position = "top";
/************************************************************************/
const datoscampos = ref({})
const codigoUnico = ref(generarCodigoUnico());
const fecha = ref(nfecha('fecha'));
const todosLosPrueba = ref([]);
/************************************************************************/
/************************************************************************/
const fetchAllData = async () => {
    const response = await enviarSolicitudGet(`${link.value+api.value}/datosarray/prueba`,tokenCifrado.value);
    const jsonData = response;
    todosLosPrueba.value = jsonData;
    datoscampos.value = jsonData.find(datos=>datos.id == route.params.id)
arrayIMG.value = await peticiones(link.value+api.value+'/peticionimagenes',{"origen":`${'../vista/img/prueba/'+datoscampos.value.imagen}`},'POST',tokenCifrado.value)
additionalData.value = {ruta: '../vista/img/prueba/'+datoscampos.value.imagen};
};
/************************************************************************/
async  function navigate(action) {
    const currentIndex = todosLosPrueba.value.findIndex(prueba => prueba.id == route.params.id);
    if (currentIndex === -1) return;
    let newIndex;
    switch (action) {
        case 'primero':
            newIndex = 0;
            break;
        case 'anterior':
            newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
            break;
        case 'siguiente':
            newIndex = currentIndex + 1 < todosLosPrueba.value.length ? currentIndex + 1 : currentIndex;
            break;
        case 'ultimo':
            newIndex = todosLosPrueba.value.length - 1;
            break;
        default:
            return;
    }
    datoscampos.value = todosLosPrueba.value[newIndex];
    if (datoscampos.value.imagen == '') {
        datoscampos.value.imagen = generarCodigoUnico();
        funcionActualizar()
    }
arrayIMG.value = await peticiones(link.value+api.value+'/peticionimagenes',{"origen":`${'../vista/img/prueba/'+datoscampos.value.imagen}`},'POST',tokenCifrado.value)
additionalData.value = {ruta: '../vista/img/prueba/'+datoscampos.value.imagen};
    router.push({ path: `/editarprueba/${todosLosPrueba.value[newIndex].id}` });
}
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
await fetchAllData()
uploadUrl.value = link.value+api.value+"/subirunaimagen";
additionalData.value = {ruta: '../vista/img/prueba/'+datoscampos.value.imagen};
});
/************************************************************************/
async function funcionActualizar(e) {
  e.preventDefault();
  if (fileUploaderRef.value && typeof fileUploaderRef.value.uploadFiles === 'function') {
    try {
      await fileUploaderRef.value.uploadFiles();
    } catch (error) {
      console.error('Error al subir archivos antes de actualizar:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Error al subir archivos antes de actualizar.', life: 3000 });
      return;
    }
  }
  const url = link.value+api.value+"/actualizarcampos/prueba";
  if (!datoscampos.value) {
    console.error("Datos incompletos, no se puede actualizar.");
    return;
  }
  if (datoscampos.value.hasOwnProperty('created_at')) {
      datoscampos.value.updated_at = nfecha('timestamp')
    }
  const envioDatos = await enviarDatosPorPost(url, datoscampos.value,tokenCifrado.value);
  if (envioDatos[0] == 'ok') {
     toast.add({ severity: 'success', summary: 'Éxito', detail: 'Datos Actualizados', life: 3000 });
  }else{
    toast.add({ severity: 'error', summary: 'Error', detail: 'Fallo al actualizar los datos.', life: 3000 });
  }
}
/************************************************************************/
const deleteImage = async(imagen) => {
   const ruta = datoscampos.value.imagen;
  const url = link.value+api.value+"/borrararchivo";
  const datos = {
    ruta:'../vista/img/prueba/'+ruta,
    archivo:imagen,
  }
  const envioDatos = await enviarDatosPorPost(url, datos,tokenCifrado.value);
    if (envioDatos[0] == 'ok') {
         arrayIMG.value = await peticiones(link.value+api.value+'/peticionimagenes',{"origen":`../vista/img/prueba/${ruta}`},'POST',tokenCifrado.value)
       toast.add({ severity: 'success', summary: 'Éxito', detail: 'Imagen Borrada', life: 3000 });
    }else{
      toast.add({ severity: 'error', summary: 'Error', detail: 'Fallo al Borrar la Imagen.', life: 3000 });
   }
};
/************************************************************************/
const fnEliminar = async () => {
  Swal.fire({
    title: "Introduce la contraseña",
    input: "password",
    inputPlaceholder: "Contraseña",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      const contrasenaIngresada = result.value;
      if (
        contrasenaIngresada === token.value ||
        contrasenaIngresada === tokenCorto.value
      ) {
        const datosFactura = await peticionesFetch(
          `${link.value}${api.value}`,
          `borrarporcampo/prueba`,
          { campo: "id", valor: datoscampos.value.id },
          tokenCifrado.value,
          "POST",
        );
        if (datosFactura[0] == "ok") {
          toast.add({
            severity: "success",
            summary: "Éxito",
            detail: "Datos eliminados correctamente",
            life: 3000,
          });
          const currentIndex = todosLosPrueba.value.findIndex(
            (clientes) => clientes.id == route.params.id,
          );
          todosLosPrueba.value.splice(currentIndex, 1);
          if (todosLosPrueba.value.length === 0) {
            router.push({ path: "/clientes" });
            return;
          } else {
            let newIndex = currentIndex;
            if (currentIndex >= todosLosPrueba.value.length) {
              newIndex = todosLosPrueba.value.length - 1;
            }
            const nextId = todosLosPrueba.value[newIndex].id;
            router.push({ path: `/editarPrueba/${nextId}` });
            datoscampos.value = todosLosPrueba.value[newIndex];
            pagosArray.value = JSON.parse(datoscampos.value.pagos);
            const datosFact = facturasArray.value.find(
              (fact) => fact.no_factura == datoscampos.value.no_factura,
            );
            if (datosFact) {
              productosArray.value = JSON.parse(datosFact.productos);
            }
          }
          await fetchAllData();
        } else {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: "Error al eliminar los datos",
            life: 3000,
          });
        }
      } else {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Contraseña incorrecta",
          life: 3000,
        });
      }
    }
  });
};
/************************************************************************/
const handleSuccess = async(data)=>{
          toast.add({
            severity: "success",
            summary: "Éxito",
            detail: "Archivos Subidos correctamente",
            life: 3000,
          });
await fetchAllData()
}
/************************************************************************/
const handleError = (error)=>{
          toast.add({
            severity: "error",
            summary: "Error",
            detail: "Error al Subir los Archivos",
            life: 3000,
          });
}
/************************************************************************/
const getImageSrc = (imagen) => {
  return `${link.value}/vista/img/prueba/${datoscampos.value.imagen}/${imagen}`;
};
const esImagen = (imagen) => /\.(jpg|jpeg|png|gif)$/i.test(imagen);
const esPdf = (imagen) => /\.(pdf)$/i.test(imagen);
const esWord = (imagen) => /\.(doc|docx)$/i.test(imagen);
const downloadImage = (imagen) => {
  const url = getImageSrc(imagen);
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.setAttribute('download', imagen);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
<template>
  <div class="container-fluid mt-5">
<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4">
  <div class="flex flex-wrap items-center justify-start space-x-2 space-y-2">
  <router-link class="btn btn-primary btn-sm mt-2 flex items-center" to="/prueba">
    <i class="pi pi-home p-1 text-lg"></i>
  </router-link>
  <router-link class="btn btn-primary btn-sm flex items-center" to="/crearprueba">
    <i class="pi pi-plus-circle p-1 text-lg"></i>
  </router-link>
  <button type="button" class="btn btn-primary btn-sm flex items-center" @click="fnBorrar">
    <i class="pi pi-trash p-1 text-lg"></i>
  </button>
  <button type="button" class="btn btn-primary btn-sm flex items-center" @click="navigate('primero')">
    <i class="pi pi-fast-backward p-1 text-lg"></i>
  </button>
  <button type="button" class="btn btn-primary btn-sm flex items-center" @click="navigate('anterior')">
    <i class="pi pi-step-backward p-1 text-lg"></i>
  </button>
  <button type="button" class="btn btn-primary btn-sm flex items-center" @click="navigate('siguiente')">
    <i class="pi pi-step-forward p-1 text-lg"></i>
  </button>
  <button type="button" class="btn btn-primary btn-sm flex items-center" @click="navigate('ultimo')">
    <i class="pi pi-fast-forward p-1 text-lg"></i>
  </button>
  </div>
</div>
<section class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4">
    <form id="formularioActualizar" action="" method="">
         <div class="box-body">
          <div class="row" id="campos">
<div class="form-group " hidden>
<label for="id-Actualizador">ID</label>
<input type="input" v-model="datoscampos.id" name="id"  class="form-input" id="id-Actualizador" readonly placeholder="id"  maxlength="11">
</div>
<div class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12" >
<label for="nombre-Actualizador">NOMBRE</label>
<input type="input" v-model="datoscampos.nombre" name="nombre"  class="form-input" id="nombre-Actualizador" v-mayuscula placeholder="nombre"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12" >
<label for="direccion-Actualizador">DIRECCION</label>
<textarea class="form-input " id="direccion-Actualizador" name="direccion" v-model="datoscampos.direccion" cols="30" rows="3" ></textarea>
</div>
<div class="form-group " hidden>
<label for="created_at-Actualizador">CREATED_AT</label>
<input type="input" v-model="datoscampos.created_at" name="created_at"  class="form-input" id="created_at-Actualizador"  placeholder="created_at"  maxlength="">
</div>
<div class="form-group " hidden>
<label for="updated_at-Actualizador">UPDATED_AT</label>
<input type="input" v-model="datoscampos.updated_at" name="updated_at"  class="form-input" id="updated_at-Actualizador"  placeholder="updated_at"  maxlength="">
</div>
<div class="form-group " >
<label for="imagen-Actualizador">IMAGEN</label>
    <FileUploader 
       ref="fileUploaderRef"
      :uploadUrl="uploadUrl" 
      :additionalData="additionalData" 
      :autoUpload="true" 
      :onSuccess="handleSuccess"
      :onError="handleError"
      :showPreview="false"
    />
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 mt-2">
    <div class="border rounded-lg shadow-md p-4" v-for="imagen in arrayIMG" :key="imagen">
      <div class="mb-3">
        <div class="relative mx-auto">
          <img 
            v-if="esImagen(imagen)"
            :src="getImageSrc(imagen)" 
            alt="Image" 
            class="w-full h-auto rounded-md object-cover"
          />
          <div v-else-if="esPdf(imagen)" class="flex justify-center">
            <i class="pi pi-file-pdf text-red-600 text-6xl"></i>
          </div>
          <div v-else-if="esWord(imagen)" class="flex justify-center">
            <i class="pi pi-file-word text-blue-600 text-6xl"></i>
          </div>
          <div v-else class="flex justify-center">
            <i class="pi pi-file text-gray-600 text-6xl"></i>
          </div>
        </div>
      </div>
      <div class="text-center mt-2">
        <button 
          class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center mb-2"
          @click.prevent="downloadImage(imagen)"
        >
          <i class="pi pi-download mr-2"></i> Descargar
        </button>
        <button 
          class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
          @click.prevent="deleteImage(imagen)"
        >
          <i class="pi pi-trash mr-2"></i> Eliminar
        </button>
      </div>
    </div>
  </div>
</div>
<div class="form-group " hidden>
<label for="usuario-Actualizador">USUARIO</label>
<input type="input" v-model="datoscampos.usuario" name="usuario"  class="form-input" id="usuario-Actualizador"  placeholder="usuario"  maxlength="250">
</div>
<div class="form-group col-sm-12 mb-5 mt-5 flex justify-end">
  <button type="button" class="btn btn-primary btn-sm m-1 flex items-center" @click="funcionActualizar">
    <i class="pi pi-check p-1 text-lg"></i>
    Actualizar Datos
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
