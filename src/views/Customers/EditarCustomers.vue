
<script setup>
import { ref, onMounted, nextTick, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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
  generarTablaFromStringJSON,
  enviarSolicitudGet,
  generarCodigoUnico,
  peticiones,
  toast,
  mensajetoast,
  lasMayusculas} from '../../funciones/funciones.js';
import Swal from 'sweetalert2'
/************************************************************************/
import { useAppStore } from '@/stores/index';
 const store = useAppStore();
  const basic = ref({
    dateFormat: 'd/m/Y',
    position: store.rtlClass === 'rtl' ? 'auto right' : 'auto left',
  });
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
const todosLosCustomers = ref([]);
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
const agentsData = ref([])
const agentsNames = ref([])
/************************************************************************/
const branch_officeData = ref([])
const branch_officeDataNames = ref([])
/************************************************************************/
const fetchAllData = async () => {
    const response = await enviarSolicitudGet(`${link.value+api.value}/datosarray/customers`,tokenCifrado.value);
    const jsonData = response;
    todosLosCustomers.value = jsonData;
    datoscampos.value = jsonData.find(datos=>datos.id == route.params.id)
arrayIMG.value = await peticiones(link.value+api.value+'/peticionimagenes',{"origen":`${'../vista/img/customers/'+datoscampos.value.imagen}`},'POST',tokenCifrado.value)
additionalData.value = {ruta: '../vista/img/customers/'+datoscampos.value.imagen};
};
/************************************************************************/
async  function navigate(action) {
    const currentIndex = todosLosCustomers.value.findIndex(customers => customers.id == route.params.id);
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
            newIndex = currentIndex + 1 < todosLosCustomers.value.length ? currentIndex + 1 : currentIndex;
            break;
        case 'ultimo':
            newIndex = todosLosCustomers.value.length - 1;
            break;
        default:
            return;
    }
    datoscampos.value = todosLosCustomers.value[newIndex];
    if (datoscampos.value.imagen == '') {
        datoscampos.value.imagen = generarCodigoUnico();
        funcionActualizar()
    }
arrayIMG.value = await peticiones(link.value+api.value+'/peticionimagenes',{"origen":`${'../vista/img/customers/'+datoscampos.value.imagen}`},'POST',tokenCifrado.value)
additionalData.value = {ruta: '../vista/img/customers/'+datoscampos.value.imagen};
    router.push({ path: `/editarcustomers/${todosLosCustomers.value[newIndex].id}` });
}

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
await fetchAllData()
await fetchAgentes()
await fetchDestinos()
await fetchServicios()
await fetchMetodoContacto()
await fetchSucursal()
uploadUrl.value = link.value+api.value+"/subirunaimagen";
additionalData.value = {ruta: '../vista/img/customers/'+datoscampos.value.imagen};
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
  const url = link.value+api.value+"/actualizarcampos/customers";
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
    ruta:'../vista/img/customers/'+ruta,
    archivo:imagen,
  }
  const envioDatos = await enviarDatosPorPost(url, datos,tokenCifrado.value);
    if (envioDatos[0] == 'ok') {
         arrayIMG.value = await peticiones(link.value+api.value+'/peticionimagenes',{"origen":`../vista/img/customers/${ruta}`},'POST',tokenCifrado.value)
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
          `borrarporcampo/customers`,
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
          const currentIndex = todosLosCustomers.value.findIndex(
            (clientes) => clientes.id == route.params.id,
          );
          todosLosCustomers.value.splice(currentIndex, 1);
          if (todosLosCustomers.value.length === 0) {
            router.push({ path: "/clientes" });
            return;
          } else {
            let newIndex = currentIndex;
            if (currentIndex >= todosLosCustomers.value.length) {
              newIndex = todosLosCustomers.value.length - 1;
            }
            const nextId = todosLosCustomers.value[newIndex].id;
            router.push({ path: `/editarCustomers/${nextId}` });
            datoscampos.value = todosLosCustomers.value[newIndex];
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
  return `${link.value}/vista/img/customers/${datoscampos.value.imagen}/${imagen}`;
};
const esImagen = (imagen) => /.(jpg|jpeg|png|gif)$/i.test(imagen);
const esPdf = (imagen) => /.(pdf)$/i.test(imagen);
const esWord = (imagen) => /.(doc|docx)$/i.test(imagen);
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
  <router-link class="btn btn-primary btn-sm mt-2 flex items-center" to="/customers">
    <i class="pi pi-home p-1 text-lg"></i>
  </router-link>
<!--   <router-link class="btn btn-primary btn-sm flex items-center" to="/crearcustomers">
    <i class="pi pi-plus-circle p-1 text-lg"></i>
  </router-link> -->
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

  <button type="button" class="btn btn-primary btn-sm flex items-center" @click="funcionActualizar">
    <i class="pi pi-save p-1 text-lg"></i>
  </button>

  </div>
</div>
<section class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4">
    <form id="formularioActualizar" action="" method="">
         <div class="box-body">
          <div class="row grid grid-cols-12 gap-4" id="campos">
<div class="form-group " hidden>
<label for="id-Actualizador">{{t('ID')}}</label>
<input type="input" v-model="datoscampos.id" name="id"  class="form-input" id="id-Actualizador" readonly placeholder="id"  maxlength="11">
</div>

<div class="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3">
                    <label for="date">{{t('DATE')}}</label>
                    <flat-pickr v-model="datoscampos.date"  class="form-input " :config="basic"></flat-pickr>
            </div>
<div class="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-6">
                <label for="name">{{t('NAME')}}</label>
                <input type=""  v-mayuscula class="form-input " v-model="datoscampos.name" name="name" placeholder="name" id="actualizarname" />
            </div>
<div class="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3">
                    <label for="agent">{{t('AGENT')}}</label>
                    <multiselect
                     v-model="datoscampos.agent"
                      :options="agentesNombre"
                      class="custom-multiselect "
                      :searchable="true"
                      placeholder="Agent"
                      selected-label=""
                      select-label=""
                       v-mayuscula 
                      deselect-label=""
                    ></multiselect>

            </div>
<div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                <label for="email">{{t('EMAIL')}}</label>
                <input type=""   class="form-input " v-model="datoscampos.email" name="email" placeholder="email" id="actualizaremail" />
            </div>
<div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                <label for="phone">{{t('PHONE')}}</label>
                <input type=""   class="form-input " v-model="datoscampos.phone" name="phone" placeholder="phone" id="actualizarphone" />
            </div>
<div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                    <label for="branch_office">{{t('BRANCH_OFFICE')}}</label>
                    <multiselect
                     v-model="datoscampos.branch_office"
                      :options="sucursalNombre"
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
                     v-model="datoscampos.contact_method"
                      :options="metodoContactoNombre"
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
                     v-model="datoscampos.service_type"
                      :options="serviciosNombre"
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
                     v-model="datoscampos.destiny"
                      :options="destinosNombre"
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
                <input type=""   v-mayuscula class="form-input " v-model="datoscampos.city" name="city" placeholder="city" id="actualizarcity" />
            </div>
<div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                    <label for="date_in">{{t('DATE_IN')}}</label>
                    <flat-pickr v-model="datoscampos.date_in"   class="form-input " :config="basic"></flat-pickr>
            </div>
<div class="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                    <label for="date_out">{{t('DATE_OUT')}}</label>
                    <flat-pickr v-model="datoscampos.date_out"   class="form-input " :config="basic"></flat-pickr>
            </div>
<div class="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12">
                    <label for="carts">{{t('CARTS')}}</label>
     

 <div class="table-responsive">
                              <div v-html="generarTablaFromStringJSON(datoscampos.carts)" class="border p-3 rounded mb-2"></div>
                            </div>


                </div>
<div class="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12">
                    <label for="note">{{t('NOTE')}}</label>
                   <textarea id="actualizarnote"   v-model="datoscampos.note" name="note" rows="3" class="form-textarea " placeholder="Enter Note"></textarea>
                </div>

                
<!-- <div class="form-group col-span-12">
                <label for="imagen-Actualizador">{{ t('IMAGEN') }}</label>
                <FileUploader 
                  ref="fileUploaderRef"
                  :uploadUrl="uploadUrl" 
                  :additionalData="additionalData" 
                  :autoUpload="true" 
                  :onSuccess="handleSuccess"
                  :onError="handleError"
                  :showPreview="false"
                  class="undefined"
                  undefined
                />
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4 mt-2">
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
              </div> -->

<div class="form-group " hidden>
<label for="usuario-Actualizador">{{t('USUARIO')}}</label>
<input type="input" v-model="datoscampos.usuario" name="usuario"  class="form-input" id="usuario-Actualizador"  placeholder="usuario"  maxlength="250">
</div>
<div class="form-group col-span-12 mb-5 mt-5 flex justify-end">
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

