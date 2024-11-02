<script setup>
import { ref, onMounted, nextTick, watchEffect } from 'vue';
import { vMaska } from "maska/vue"
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();
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
const datoscamposLeads = ref({})
const codigoUnico = ref(generarCodigoUnico());
const fecha = ref(nfecha('fecha'));
const position = "top";
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
const fetchAndSetupData = async () => {
    const jsonData = await arrayToObjetoFromTabla(link.value+api.value,tokenCifrado.value,'leads');
    datoscamposLeads.value = jsonData;
datoscamposLeads.value.imagen = datoscamposLeads.value.imagen || generarCodigoUnico();
datoscamposLeads.value.date = datoscamposLeads.value.date || nfecha('fecha') ;

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
await fetchAgentes()
await fetchDestinos()
await fetchServicios()
await fetchMetodoContacto()
await fetchSucursal()
uploadUrl.value = link.value+api.value+"/subirunaimagen";
additionalData.value = {ruta: '../vista/img/leads/'+datoscamposLeads.value.imagen};
datoscamposLeads.value.agent = datoscamposLeads.value.agent || agentesNombre.value[0];
datoscamposLeads.value.branch_office = datoscamposLeads.value.branch_office || sucursalNombre.value[0];
datoscamposLeads.value.contact_method = datoscamposLeads.value.contact_method || metodoContactoNombre.value[0];
datoscamposLeads.value.service_type = datoscamposLeads.value.service_type || serviciosNombre.value[0];
datoscamposLeads.value.destiny = datoscamposLeads.value.destiny || destinosNombre.value[0];
datoscamposLeads.value.state = 'OPEN';


});
/************************************************************************/
async function enviarDatos(event) {
    event.preventDefault();
  const url = link.value+api.value+"/insertar/leads";
  if (!datoscamposLeads.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Datos incompletos, no se puede Enviar.', life: 3000 });
    return;
  }
  if (datoscamposLeads.value.hasOwnProperty('created_at')) {
     datoscamposLeads.value.created_at = nfecha('timestamp')
     datoscamposLeads.value.updated_at = nfecha('timestamp')
    }
const imagen = await peticionesFetch(`${link.value}${api.value}`,'creardirectorio',{'ruta':'../vista/img/leads/'+datoscamposLeads.value.imagen},tokenCifrado.value,'POST');
  const envioDatos = await enviarDatosPorPost(url, datoscamposLeads.value,tokenCifrado.value);
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
    router.push({ path: `/leads` });
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
                <router-link class="btn btn-primary btn-sm mt-2 flex items-center" to="/leads">
                    <i class="pi pi-home p-1 text-lg"></i>
                </router-link>
            </div>
        </div>
        <section class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4">
            <form id="formularioActualizar" action="" method="">
                <div class="box-body">
                    <div class="row grid grid-cols-12 gap-4" id="campos">
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
                            <label for="dateAgregarDatos">{{t('DATE')}}</label>
                            <flat-pickr v-model="datoscamposLeads.date" class="form-input" :config="basic"></flat-pickr>
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-8 lg:col-span-8 xl:col-span-8 2xl:col-span-8">
                            <label for="nameAgregarDatos">{{t('NAME')}}</label>
                            <input type="input" v-model="datoscamposLeads.name" name="name" class="form-input "
                                id="nameAgregarDatos" v-mayuscula placeholder="name" maxlength="250">
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
                            <label for="agentAgregarDatos">{{t('AGENT')}}</label>
                            <multiselect v-model="datoscamposLeads.agent" :options="agentesNombre"
                                class="custom-multiselect" :searchable="true" placeholder="Agent" selected-label=""
                                select-label="" deselect-label=""></multiselect>
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="emailAgregarDatos">{{t('EMAIL')}}</label>
                            <input type="input" v-model="datoscamposLeads.email" name="email" class="form-input "
                                id="emailAgregarDatos" placeholder="email" maxlength="250">
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="phoneAgregarDatos">{{t('PHONE')}}</label>
                            <input type="input" v-model="datoscamposLeads.phone" name="phone" class="form-input "
                                id="phoneAgregarDatos" placeholder="phone" maxlength="250">
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="branch_officeAgregarDatos">{{t('BRANCH_OFFICE')}}</label>
                            <multiselect v-model="datoscamposLeads.branch_office" :options="sucursalNombre"
                                class="custom-multiselect" :searchable="true" placeholder="Branch_office"
                                selected-label="" select-label="" deselect-label=""></multiselect>
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="contact_methodAgregarDatos">{{t('CONTACT_METHOD')}}</label>
                            <multiselect v-model="datoscamposLeads.contact_method" :options="metodoContactoNombre"
                                class="custom-multiselect" :searchable="true" placeholder="Contact_method"
                                selected-label="" select-label="" deselect-label=""></multiselect>
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="service_typeAgregarDatos">{{t('SERVICE_TYPE')}}</label>
                            <multiselect v-model="datoscamposLeads.service_type" :options="serviciosNombre"
                                class="custom-multiselect" :searchable="true" placeholder="Service_type"
                                selected-label="" select-label="" deselect-label=""></multiselect>
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="destinyAgregarDatos">{{t('DESTINY')}}</label>
                            <multiselect v-model="datoscamposLeads.destiny" :options="destinosNombre"
                                class="custom-multiselect" :searchable="true" placeholder="Destiny" selected-label=""
                                select-label="" deselect-label=""></multiselect>
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="city-Actualizador">{{t('CITY')}}</label>
                            <input type="input" v-model="datoscamposLeads.city" name="city" class="form-input"
                                id="city-Actualizador" v-mayuscula placeholder="city" maxlength="250">
                        </div>

                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="markupAgregarDatos">{{t('MARKUP')}}</label>
                            <input type="input" v-model="datoscamposLeads.markup" name="markup" class="form-input "
                                id="markupAgregarDatos" placeholder="markup" maxlength="250">
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                            <label for="stateAgregarDatos">{{t('STATE')}}</label>
                            <multiselect v-model="datoscamposLeads.state" :options="['OPEN','CLOSED']"
                                class="custom-multiselect" :searchable="true" placeholder="State" selected-label=""
                                select-label="" deselect-label=""></multiselect>
                        </div>
                        <div
                            class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12">
                            <label for="noteAgregarDatos">{{t('NOTE')}}</label>
                            <textarea class="form-input " v-model="datoscamposLeads.note" id="noteAgregarDatos"
                                name="note" cols="30" rows="3"></textarea>
                        </div>
                        <div class="form-group " hidden>
                            <label for="created_atAgregarDatos">{{t('CREATED_AT')}}</label>
                            <input type="input" v-model="datoscamposLeads.created_at" name="created_at"
                                class="form-input " id="created_atAgregarDatos" placeholder="created_at" maxlength="">
                        </div>
                        <div class="form-group " hidden>
                            <label for="updated_atAgregarDatos">{{t('UPDATED_AT')}}</label>
                            <input type="input" v-model="datoscamposLeads.updated_at" name="updated_at"
                                class="form-input " id="updated_atAgregarDatos" placeholder="updated_at" maxlength="">
                        </div>
                        <div class="form-group col-span-12">
                            <label for="imagenAgregarDatos">{{t('IMAGEN')}}</label>
                            <FileUploader ref="fileUploaderRef" :uploadUrl="uploadUrl" :additionalData="additionalData"
                                :autoUpload="false" :onSuccess="handleSuccess" :onError="handleError"
                                :showPreview="true" />
                        </div>
                        <div class="form-group " hidden>
                            <label for="usuarioAgregarDatos">{{t('USUARIO')}}</label>
                            <input type="input" v-model="datoscamposLeads.usuario" name="usuario" class="form-input "
                                id="usuarioAgregarDatos" placeholder="usuario" maxlength="250">
                        </div>
                        <div class="form-group col-span-12 mb-5 mt-5 flex justify-end">
                            <button type="button" class="btn btn-primary btn-sm m-1 flex items-center"
                                @click="enviarDatos">
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
