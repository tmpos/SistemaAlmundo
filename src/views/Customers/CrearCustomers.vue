
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
import { useAppStore } from '@/stores/index';
 const store = useAppStore();
  const basic = ref({
    dateFormat: 'Y-m-d',
    position: store.rtlClass === 'rtl' ? 'auto right' : 'auto left',
  });
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
const datoscamposCustomers = ref({})
const codigoUnico = ref(generarCodigoUnico());
const fecha = ref(nfecha('fecha'));
const position = "top";
/************************************************************************/
const fetchAndSetupData = async () => {
    const jsonData = await arrayToObjetoFromTabla(link.value+api.value,tokenCifrado.value,'customers');
    datoscamposCustomers.value = jsonData;
datoscamposCustomers.value.imagen = datoscamposCustomers.value.imagen || generarCodigoUnico();
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
additionalData.value = {ruta: '../vista/img/customers/'+datoscamposCustomers.value.imagen};
});
/************************************************************************/
async function enviarDatos(event) {
    event.preventDefault();
  
  const url = link.value+api.value+"/insertar/customers";

  const envioDatos = await enviarDatosPorPost(url, datoscamposCustomers.value,tokenCifrado.value);
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
    router.push({ path: `/customers` });
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
    <router-link class="btn btn-primary btn-sm mt-2 flex items-center" to="/customers">
      <i class="pi pi-home p-1 text-lg"></i>
    </router-link>
  </div>
</div>
<section class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4">
    <form id="formularioActualizar" action="" method="">
         <div class="box-body">
          <div class="row grid grid-cols-12 gap-4" id="campos">
<div class="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3">
                    <label for="date">{{t('DATE')}}</label>
                    <flat-pickr v-model="datoscamposCustomers.date" class="form-input " :config="basic"></flat-pickr>
            </div>
<div class="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-6">
                    <label for="name">{{t('NAME')}}</label>
                    <input type="" class="form-input "  v-mayuscula v-model="datoscamposCustomers.name" placeholder="name" name="crearname" id="name" />
                </div>
<div class="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3">
                    <label for="agent">{{t('AGENT')}}</label>
                    <multiselect
                     v-model="datoscamposCustomers.agent"
                      :options="['']"
                      class="custom-multiselect "
                      :searchable="true"
                      placeholder="Agent"
                      selected-label=""
                      select-label=""
                      deselect-label=""
                       v-mayuscula 
                    ></multiselect>
            </div>
<div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                    <label for="email">{{t('EMAIL')}}</label>
                    <input type="" class="form-input "   v-model="datoscamposCustomers.email" placeholder="email" name="crearemail" id="email" />
                </div>
<div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                    <label for="phone">{{t('PHONE')}}</label>
                    <input type="" class="form-input "   v-model="datoscamposCustomers.phone" placeholder="phone" name="crearphone" id="phone" />
                </div>
<div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                    <label for="branch_office">{{t('BRANCH_OFFICE')}}</label>
                    <multiselect
                     v-model="datoscamposCustomers.branch_office"
                      :options="['']"
                      class="custom-multiselect "
                      :searchable="true"
                      placeholder="Branch_office"
                      selected-label=""
                      select-label=""
                      deselect-label=""
                       
                    ></multiselect>
            </div>
<div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                    <label for="contact_method">{{t('CONTACT_METHOD')}}</label>
                    <multiselect
                     v-model="datoscamposCustomers.contact_method"
                      :options="['']"
                      class="custom-multiselect "
                      :searchable="true"
                      placeholder="Contact_method"
                      selected-label=""
                      select-label=""
                      deselect-label=""
                       
                    ></multiselect>
            </div>
<div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                    <label for="service_type">{{t('SERVICE_TYPE')}}</label>
                    <multiselect
                     v-model="datoscamposCustomers.service_type"
                      :options="['']"
                      class="custom-multiselect "
                      :searchable="true"
                      placeholder="Service_type"
                      selected-label=""
                      select-label=""
                      deselect-label=""
                       
                    ></multiselect>
            </div>
<div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                    <label for="destiny">{{t('DESTINY')}}</label>
                    <multiselect
                     v-model="datoscamposCustomers.destiny"
                      :options="['']"
                      class="custom-multiselect "
                      :searchable="true"
                      placeholder="Destiny"
                      selected-label=""
                      select-label=""
                      deselect-label=""
                       
                    ></multiselect>
            </div>
<div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                    <label for="city">{{t('CITY')}}</label>
                    <input type="" class="form-input "   v-mayuscula v-model="datoscamposCustomers.city" placeholder="city" name="crearcity" id="city" />
                </div>
<div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                    <label for="date_in">{{t('DATE_IN')}}</label>
                    <flat-pickr v-model="datoscamposCustomers.date_in" class="form-input " :config="basic"></flat-pickr>
            </div>
<div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                    <label for="date_out">{{t('DATE_OUT')}}</label>
                    <flat-pickr v-model="datoscamposCustomers.date_out" class="form-input " :config="basic"></flat-pickr>
            </div>
<div class="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12">
                    <label for="carts">{{t('CARTS')}}</label>
                   <textarea id="crearcarts" rows="3" class="form-textarea "   v-model="datoscamposCustomers.carts" placeholder="Carts"></textarea>
                </div>
<div class="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12">
                    <label for="note">{{t('NOTE')}}</label>
                   <textarea id="crearnote" rows="3" class="form-textarea "   v-model="datoscamposCustomers.note" placeholder="Note"></textarea>
                </div>
<div class="form-group col-span-12" >
<label for="imagenAgregarDatos">{{t('IMAGEN')}}</label>
    <FileUploader 
       ref="fileUploaderRef"
      :uploadUrl="uploadUrl" 
      :additionalData="additionalData" 
      :autoUpload="false" 
      :onSuccess="handleSuccess"
      :onError="handleError"
      :showPreview="true"
      class="undefined"
      undefined
    /> 
</div>
<div class="form-group " hidden>
<label for="created_atAgregarDatos">{{t('CREATED_AT')}}</label>
<input type="input" v-model="datoscamposCustomers.created_at" name="created_at"  class="form-input " id="created_atAgregarDatos"   placeholder="created_at" maxlength="">
</div>
<div class="form-group " hidden>
<label for="updated_atAgregarDatos">{{t('UPDATED_AT')}}</label>
<input type="input" v-model="datoscamposCustomers.updated_at" name="updated_at"  class="form-input " id="updated_atAgregarDatos"   placeholder="updated_at" maxlength="">
</div>


<div class="form-group " hidden>
<label for="usuarioAgregarDatos">{{t('USUARIO')}}</label>
<input type="input" v-model="datoscamposCustomers.usuario" name="usuario"  class="form-input " id="usuarioAgregarDatos"   placeholder="usuario" maxlength="250">
</div>
<div class="form-group col-span-12 mb-5 mt-5 flex justify-end">
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

