<script setup>
import { ref, onMounted, nextTick, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogOverlay } from '@headlessui/vue';
const router = useRouter();
const route = useRoute();
import { vMaska } from "maska/vue"
import Multiselect from '@suadelabs/vue3-multiselect';
import '@suadelabs/vue3-multiselect/dist/vue3-multiselect.css';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
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
const visibleConfirmar = ref(true)
/************************************************************************/
const agentesArray = ref([]);
const agentesNombre = ref([]);
const destinosArray = ref([]);
const destinosNombre = ref([]);
const serviciosArray = ref([]);
const serviciosNombre = ref([]);
const metodoContactoArray = ref([]);
const metodoContactoNombre = ref([]);
const sucursalArray = ref([]);
const sucursalNombre = ref([]);
/************************************************************************/
const datoscampos = ref({})
const codigoUnico = ref(generarCodigoUnico());
const fecha = ref(nfecha('fecha'));
const todosLosLeads = ref([]);
/************************************************************************/
/************************************************************************/
const fetchAllData = async () => {
    const response = await enviarSolicitudGet(`${link.value+api.value}/datosarray/leads`,tokenCifrado.value);
    const jsonData = response;
    todosLosLeads.value = jsonData;
    datoscampos.value = jsonData.find(datos=>datos.id == route.params.id)
arrayIMG.value = await peticiones(link.value+api.value+'/peticionimagenes',{"origen":`${'../vista/img/leads/'+datoscampos.value.imagen}`},'POST',tokenCifrado.value)
additionalData.value = {ruta: '../vista/img/leads/'+datoscampos.value.imagen};
};
/************************************************************************/
/************************************************************************/
const fetchAgentes = async () => {
    const response = await peticionesFetch(`${link.value}${api.value}`, `datosarray/agents`, {}, tokenCifrado.value, 'GET');
    const jsonData = response;
    agentesArray.value = jsonData;
    agentesNombre.value = jsonData.map(agente => agente.name)
};
/************************************************************************/
const fetchDestinos = async () => {
    const response = await peticionesFetch(`${link.value}${api.value}`, `datosarray/destinations`, {}, tokenCifrado.value, 'GET');
    const jsonData = response;
    destinosArray.value = jsonData;
    destinosNombre.value = jsonData.map(destino => destino.name)
};
/************************************************************************/
const fetchServicios = async () => {
    const response = await peticionesFetch(`${link.value}${api.value}`, `datosarray/services`, {}, tokenCifrado.value, 'GET');
    const jsonData = response;
    serviciosArray.value = jsonData;
    serviciosNombre.value = jsonData.map(destino => destino.name)
};
/************************************************************************/
const fetchMetodoContacto = async () => {
    const response = await peticionesFetch(`${link.value}${api.value}`, `datosarray/contact_method`, {}, tokenCifrado.value, 'GET');
    const jsonData = response;
    metodoContactoArray.value = jsonData;
    metodoContactoNombre.value = jsonData.map(destino => destino.name)
};
/************************************************************************/
const fetchSucursal = async () => {
    const response = await peticionesFetch(`${link.value}${api.value}`, `datosarray/branch_office`, {}, tokenCifrado.value, 'GET');
    const jsonData = response;
    sucursalArray.value = jsonData;
    sucursalNombre.value = jsonData.map(destino => destino.name)
};
/************************************************************************/
async  function navigate(action) {
    const currentIndex = todosLosLeads.value.findIndex(leads => leads.id == route.params.id);
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
            newIndex = currentIndex + 1 < todosLosLeads.value.length ? currentIndex + 1 : currentIndex;
            break;
        case 'ultimo':
            newIndex = todosLosLeads.value.length - 1;
            break;
        default:
            return;
    }
    datoscampos.value = todosLosLeads.value[newIndex];
    if (datoscampos.value.imagen == '') {
        datoscampos.value.imagen = generarCodigoUnico();
        funcionActualizar()
    }
arrayIMG.value = await peticiones(link.value+api.value+'/peticionimagenes',{"origen":`${'../vista/img/leads/'+datoscampos.value.imagen}`},'POST',tokenCifrado.value)
additionalData.value = {ruta: '../vista/img/leads/'+datoscampos.value.imagen};
    router.push({ path: `/editarleads/${todosLosLeads.value[newIndex].id}` });
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
await fetchAgentes()
await fetchDestinos()
await fetchServicios()
await fetchMetodoContacto()
await fetchSucursal()
uploadUrl.value = link.value+api.value+"/subirunaimagen";
additionalData.value = {ruta: '../vista/img/leads/'+datoscampos.value.imagen};
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
  const url = link.value+api.value+"/actualizarcampos/leads";
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
    ruta:'../vista/img/leads/'+ruta,
    archivo:imagen,
  }
  const envioDatos = await enviarDatosPorPost(url, datos,tokenCifrado.value);
    if (envioDatos[0] == 'ok') {
         arrayIMG.value = await peticiones(link.value+api.value+'/peticionimagenes',{"origen":`../vista/img/leads/${ruta}`},'POST',tokenCifrado.value)
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
          `borrarporcampo/leads`,
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
          const currentIndex = todosLosLeads.value.findIndex(
            (clientes) => clientes.id == route.params.id,
          );
          todosLosLeads.value.splice(currentIndex, 1);
          if (todosLosLeads.value.length === 0) {
            router.push({ path: "/clientes" });
            return;
          } else {
            let newIndex = currentIndex;
            if (currentIndex >= todosLosLeads.value.length) {
              newIndex = todosLosLeads.value.length - 1;
            }
            const nextId = todosLosLeads.value[newIndex].id;
            router.push({ path: `/editarLeads/${nextId}` });
            datoscampos.value = todosLosLeads.value[newIndex];
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
  return `${link.value}/vista/img/leads/${datoscampos.value.imagen}/${imagen}`;
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
/************************************************************************/
const fnConfirmarVenta = ()=>{
alert('ok')
}
/************************************************************************/
</script>
<template>
    <div class="container-fluid mt-5">
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4">
            <div class="flex flex-wrap items-center justify-start space-x-2 space-y-2">
                <router-link class="btn btn-primary btn-sm mt-2 flex items-center" to="/leads">
                    <i class="pi pi-home p-1 text-lg"></i>
                </router-link>
                <router-link class="btn btn-primary btn-sm flex items-center" to="/crearleads">
                    <i class="pi pi-plus-circle p-1 text-lg"></i>
                </router-link>
                <button type="button" class="btn btn-primary btn-sm flex items-center" @click="fnBorrar">
                    <i class="pi pi-trash p-1 text-lg"></i>
                </button>
<!--                 <button type="button" class="btn btn-primary btn-sm flex items-center" @click="navigate('primero')">
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
                </button> -->

               <button type="button" class="btn btn-secondary btn-sm flex items-center" @click="visibleConfirmar = true">
                    <i class="pi pi-check p-1 text-lg"></i> Confirmar Venta
                </button>


            </div>
        </div>
        <section class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4">
            <form id="formularioActualizar" action="" method="">
                <div class="box-body">
                    <div class="row grid grid-cols-12 gap-4" id="campos">
                        <div class="form-group " hidden>
                            <label for="id-Actualizador">{{t('ID')}}</label>
                            <input type="input" v-model="datoscampos.id" name="id" class="form-input"
                                id="id-Actualizador" placeholder="id" maxlength="11">
                        </div>
                          <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
                            <label for="date-Actualizador">{{t('DATE')}}</label>
                            <flat-pickr v-model="datoscampos.date" class="form-input" :config="basic"></flat-pickr>
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-8 lg:col-span-8 xl:col-span-8 2xl:col-span-8">
                            <label for="name-Actualizador">{{t('NAME')}}</label>
                            <input type="input" v-model="datoscampos.name" name="name" class="form-input"
                                id="name-Actualizador" v-mayuscula placeholder="name" maxlength="250">
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
                            <label for="agent-Actualizador">{{t('AGENT')}}</label>
                            <multiselect v-model="datoscampos.agent" :options="agentesNombre" class="custom-multiselect"
                                :searchable="true" placeholder="Agent" selected-label="" select-label=""
                                deselect-label=""></multiselect>
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="email-Actualizador">{{t('EMAIL')}}</label>
                            <input type="input" v-model="datoscampos.email" name="email" class="form-input"
                                id="email-Actualizador" placeholder="email" maxlength="250">
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="phone-Actualizador">{{t('PHONE')}}</label>
                            <input type="input" v-model="datoscampos.phone" name="phone" class="form-input"
                                id="phone-Actualizador" placeholder="phone" maxlength="250">
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="branch_office-Actualizador">{{t('BRANCH_OFFICE')}}</label>
                            <multiselect v-model="datoscampos.branch_office" :options="sucursalNombre"
                                class="custom-multiselect" :searchable="true" placeholder="Branch_office"
                                selected-label="" select-label="" deselect-label=""></multiselect>
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="contact_method-Actualizador">{{t('CONTACT_METHOD')}}</label>
                            <multiselect v-model="datoscampos.contact_method" :options="metodoContactoNombre"
                                class="custom-multiselect" :searchable="true" placeholder="Contact_method"
                                selected-label="" select-label="" deselect-label=""></multiselect>
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="service_type-Actualizador">{{t('SERVICE_TYPE')}}</label>
                            <multiselect v-model="datoscampos.service_type" :options="serviciosNombre"
                                class="custom-multiselect" :searchable="true" placeholder="Service_type"
                                selected-label="" select-label="" deselect-label=""></multiselect>
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="destiny-Actualizador">{{t('DESTINY')}}</label>
                            <multiselect v-model="datoscampos.destiny" :options="destinosNombre"
                                class="custom-multiselect" :searchable="true" placeholder="Destiny" selected-label=""
                                select-label="" deselect-label=""></multiselect>
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="city-Actualizador">{{t('CITY')}}</label>
                            <input type="input" v-model="datoscampos.city" name="city" class="form-input"
                                id="city-Actualizador" placeholder="city" maxlength="250">
                        </div>

                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="markup-Actualizador">{{t('MARKUP')}}</label>
                            <input type="input" v-model="datoscampos.markup" name="markup" class="form-input"
                                id="markup-Actualizador" placeholder="markup" maxlength="250">
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="state-Actualizador">{{t('STATE')}}</label>
                            <multiselect v-model="datoscampos.state" :options="['OPEN','CLOSED','SALED']"
                                class="custom-multiselect" :searchable="true" placeholder="State" selected-label=""
                                select-label="" deselect-label=""></multiselect>
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12">
                            <label for="note-Actualizador">{{t('NOTE')}}</label>
                            <textarea class="form-input " id="note-Actualizador" name="note" v-model="datoscampos.note"
                                cols="30" rows="3"></textarea>
                        </div>
                        <div class="form-group " hidden>
                            <label for="created_at-Actualizador">{{t('CREATED_AT')}}</label>
                            <input type="input" v-model="datoscampos.created_at" name="created_at" class="form-input"
                                id="created_at-Actualizador" placeholder="created_at" maxlength="">
                        </div>
                        <div class="form-group " hidden>
                            <label for="updated_at-Actualizador">{{t('UPDATED_AT')}}</label>
                            <input type="input" v-model="datoscampos.updated_at" name="updated_at" class="form-input"
                                id="updated_at-Actualizador" placeholder="updated_at" maxlength="">
                        </div>
                        <div class="form-group col-span-12">
                            <label for="imagen-Actualizador">{{t('IMAGEN')}}</label>
                            <FileUploader ref="fileUploaderRef" :uploadUrl="uploadUrl" :additionalData="additionalData"
                                :autoUpload="true" :onSuccess="handleSuccess" :onError="handleError"
                                :showPreview="false" />
                            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 mt-2">
                                <div class="border rounded-lg shadow-md p-4" v-for="imagen in arrayIMG" :key="imagen">
                                    <div class="mb-3">
                                        <div class="relative mx-auto">
                                            <img v-if="esImagen(imagen)" :src="getImageSrc(imagen)" alt="Image"
                                                class="w-full h-auto rounded-md object-cover" />
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
                                            @click.prevent="downloadImage(imagen)">
                                            <i class="pi pi-download mr-2"></i> Descargar
                                        </button>
                                        <button
                                            class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                                            @click.prevent="deleteImage(imagen)">
                                            <i class="pi pi-trash mr-2"></i> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-group " hidden>
                            <label for="usuario-Actualizador">{{t('USUARIO')}}</label>
                            <input type="input" v-model="datoscampos.usuario" name="usuario" class="form-input"
                                id="usuario-Actualizador" placeholder="usuario" maxlength="250">
                        </div>
                        <div class="form-group col-span-12 mb-5 mt-5 flex justify-end">
                            <button type="button" class="btn btn-primary btn-sm m-1 flex items-center"
                                @click="funcionActualizar">
                                <i class="pi pi-check p-1 text-lg"></i>
                                Actualizar Datos
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </section>
    </div>





 <TransitionRoot appear :show="visibleConfirmar" as="template">
     <Dialog as="div" @close="visibleConfirmar = false" class="relative z-50">
       <TransitionChild
         as="template"
         enter="duration-300 ease-out"
         enter-from="opacity-0"
         enter-to="opacity-100"
         leave="duration-200 ease-in"
         leave-from="opacity-100"
         leave-to="opacity-0"
       >
 <DialogOverlay class="fixed inset-0 bg-[black]/60" />
       </TransitionChild>
        <div class="fixed inset-0 overflow-y-auto">
         <div class="flex min-h-full items-start justify-center px-4 py-8">
           <DialogPanel class="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-5xl text-black dark:text-white-dark animate__animated animate__slideInDown" >

             <button type="button" class="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" @click="visibleConfirmar = false">
               <svg> ... </svg>
             </button>
             <div class="text-lg font-bold bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Confirmación de Venta</div>
             <div class="p-5">
             
                    <div class="row grid grid-cols-12 gap-4" id="campos">

                        <div class="form-group col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4" >
                            <label for="id-Actualizador">{{t('CART NUMBER')}}</label>
                            <input type="input" v-model="datoscampos.id" name="id" class="form-input"
                                id="id-Actualizador" placeholder="id" maxlength="11">
                        </div>
                          <div
                            class="form-group col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="date-Actualizador">{{t('DATE IN')}}</label>
                            <flat-pickr v-model="datoscampos.date" class="form-input" :config="basic"></flat-pickr>
                        </div>

                          <div
                            class="form-group col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="date-Actualizador">{{t('DATE OUT')}}</label>
                            <flat-pickr v-model="datoscampos.date" class="form-input" :config="basic"></flat-pickr>
                        </div>

                          <div
                            class="form-group col-span-12">
                            <label for="date-Actualizador">{{t('VOUCHER')}}</label>
                            <FileUploader ref="fileUploaderRef" :uploadUrl="uploadUrl" :additionalData="additionalData"
                                :autoUpload="true" :onSuccess="handleSuccess" :onError="handleError"
                                :showPreview="false" />
                        </div>


             </div>
              
               <div class="flex justify-end items-center mt-8">
                <button type="button" @click="visibleConfirmar = false" class="btn btn-outline-danger">Cerrar</button>
                <button type="button" @click="funcionActualizar" class="btn btn-primary ltr:ml-4 rtl:mr-4">Actualizar</button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>


</template>
<style scoped>
</style>
