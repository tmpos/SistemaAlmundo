<script setup lang="ts">
import { ref, onMounted, nextTick, watchEffect,computed } from 'vue';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import { useMeta } from '@/composables/use-meta';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogOverlay, TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue';
import Multiselect from '@suadelabs/vue3-multiselect';
import '@suadelabs/vue3-multiselect/dist/vue3-multiselect.css';
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
import axios from 'axios';
import { enviarDatosPorPost, eliminarDatos, obtenerIdsSeleccionados, borrarTodoslosDatos, nfecha, arrayToObjetoFromTabla, peticionesFetch, encryptarPassword, envioElectron,toast, crearTablaSiNoExiste, peticiones,generarCodigoUnico, lasMayusculas } from '../../funciones/funciones.js';
import Swal from 'sweetalert2'
import { vMaska } from "maska/vue"
import jsPDF from 'jspdf';
import 'jspdf-autotable';
/************************************************************************/
useMeta({ title: 'Export Table' });
const search = ref('');
/************************************************************************/
const usuarioLocal = ref({})
/************************************************************************/
const excelColumns = () => {
    return {
        Nombre: 'nombre',
        Direccion: 'direccion',
        Imagen: 'imagen',
        Usuario: 'usuario',
    };
};
/************************************************************************/
const cols = ref([
    { field: 'options', title: 'Options' },
    { field: 'nombre', title: 'Nombre' },
    { field: 'direccion', title: 'Direccion' },
    { field: 'imagen', title: 'Imagen' },
    { field: 'usuario', title: 'Usuario' },
]) || [];
/************************************************************************/
 const excelItems = () => {
     return datosTabla.value;
 };
const camposArray = ["nombre","direccion","imagen","usuario"];
/************************************************************************/
import { useDatosEmpresa } from '../../stores'
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
const selectedItems = ref([]);
/************************************************************************/
const position = ref('top');
const openPosition = (pos) => {
    position.value = pos;
    visible.value = true;
}
/************************************************************************/
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
const visible = ref(false);
const visiblecrear = ref(false);
const value = ref(null);
const id = ref(null);
const datoscampos = ref({});
const data = ref([]);
const searchQuery = ref('');
const PruebaEditar = ref(null);
/************************************************************************/
async function limpiarCamposCrear() {
datoscamposPrueba.value = {}
await campos();
}
/************************************************************************/
watchEffect(() => {
  if (visiblecrear.value) {
datoscamposPrueba.value.imagen = generarCodigoUnico();
additionalData.value = {ruta: '../vista/img/prueba/'+datoscamposPrueba.value.imagen};
  }
});
/************************************************************************/
const popoverVisible = ref<Record<number, boolean>>({});
const togglePopover = (id: number) => {
  popoverVisible.value = { ...popoverVisible.value, [id]: !popoverVisible.value[id] };
};
const dropdownOptions = ['Editar', 'Borrar'];
const selectOption = async(row: any, option: string) => {
  popoverVisible.value[row.id] = false;
  const datos = row;
  if(option === 'Editar'){
router.push({ path: `/editarprueba/${datos.id}` });
   }else if(option === 'Borrar'){
            Swal.fire({
                title: 'Introduce la contraseña',
                input: 'password',
                inputPlaceholder: 'Contraseña',
                showCancelButton: true,
                confirmButtonText: 'Eliminar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const contrasenaIngresada = result.value;
                    if (contrasenaIngresada === token.value || contrasenaIngresada === tokenCorto.value) {
                        const datosFactura = await peticionesFetch(`${link.value}${api.value}`, `borrarporcampo/prueba`, { campo: 'id', valor: datos.id }, tokenCifrado.value, 'POST');
                        if (datosFactura[0] == 'ok') {
                            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Datos eliminados correctamente', life: 3000 });
                            await fetchAndSetupData()
                        } else {
                            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar los datos', life: 3000 });
                        }
                    } else {
                        toast.add({ severity: 'error', summary: 'Error', detail: 'Contraseña incorrecta', life: 3000 });
                    }
                }
            });
  }
};
/************************************************************************/
const closeAllPopovers = (event: MouseEvent) => {
  const popoverElements = document.querySelectorAll('.popover-content, .btn');
  let clickedInside = false;
  popoverElements.forEach((element) => {
    if (element.contains(event.target as Node)) {
      clickedInside = true;
    }
  });
  if (!clickedInside) {
    popoverVisible.value = {};
  }
};
/************************************************************************/
const loadingdata = ref(false)
/*************************************************************************/
const datosTabla = ref([])
/*************************************************************************/
const fetchAndSetupData = async () => {
   try {
   loadingdata.value = true;
   const response = await peticionesFetch(
     `${link.value}${api.value}`, 
     'datosarray/prueba',
     {}, 
     tokenCifrado.value,
     'GET'
   );
   if (!response || response.error) {
     throw new Error('Error al obtener los datos');
   }
   datosTabla.value = response;
   } catch (error) {
   console.error('Error en la solicitud:', error.message);
   toast.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al cargar los datos.', life: 3000 });
   } finally {
   loadingdata.value = false;
   }
};
/************************************************************************/
async function campos() {
  const campos = await arrayToObjetoFromTabla(link.value+api.value, tokenCifrado.value, 'prueba', true,camposArray,'usuario');
  datoscamposPrueba.value = campos;
}
/************************************************************************/
onMounted(async () => {
const datosJSON = await envioElectron('datosarchivo');
link.value = datosJSON.VITE_LINKURL;
api.value = datosJSON.VITE_LINK_API;
token.value = datosJSON.VITE_TOKEN;
patronTelefono.value = datosJSON.VITE_PATRON_TELEFONO;
linkImpresora.value = datosJSON.VITE_IMPRESORA_LOCAL;
patroncedula.value = datosJSON.VITE_PATRON_CEDULA;
tokenCorto.value = datosJSON.VITE_TOKEN_CORTO;
tokenCifrado.value = await encryptarPassword(token.value, 10);
await crearTablaSiNoExiste(link.value, api.value, 'prueba', camposArray, tokenCifrado.value,toast);
//usuarioLocal.value = JSON.parse(window.localStorage.getItem('usuarioLocal'))[0] || {};
await fetchAndSetupData();
});
/************************************************************************/
  async function borrarTodo() {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Se borrarán los datos!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, de acuerdo",
        cancelButtonText: "No, cancelar"
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { value: password } = await Swal.fire({
                title: 'Introduce la contraseña',
                input: 'password',
                inputPlaceholder: 'Contraseña',
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar'
            });
            if (password) {
               if (password === token.value || password === tokenCorto.value) {
                    const envioDatos = await borrarTodoslosDatos(link.value + api.value + '/borrartodo', 'prueba', tokenCifrado.value);
                    if (envioDatos[0] == 'ok') {
                        fetchAndSetupData();
                        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Datos borrados', life: 3000 });
                    } else {
                        toast.add({ severity: 'error', summary: 'Error', detail: 'Fallo al borrar datos.', life: 3000 });
                   }
                } else {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Contraseña incorrecta', life: 3000 });
                }
            }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            toast.add({ severity: 'success', summary: 'No te preocupes', detail: 'Datos seguros', life: 3000 });
        }
    });
}
/************************************************************************/
async function funcionActualizar() {
  const url = link.value+api.value+"/actualizarcampos/prueba";
  if (!datoscampos.value) {
    console.error("Datos incompletos, no se puede actualizar.");
    return;
  }
  if (datoscampos.value.hasOwnProperty('created_at')) {
    datoscampos.value.updated_at = nfecha('timestamp');
  }
  const envioDatos = await enviarDatosPorPost(url, datoscampos.value, tokenCifrado.value);
  if (envioDatos[0] == 'ok') {
    visible.value = false;
    fetchAndSetupData();
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Datos Actualizados', life: 3000 });
  } else {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Fallo al actualizar los datos.', life: 3000 });
  }
}
/************************************************************************/
async function funcionCrear() {
  const url = link.value+api.value+"/insertar/prueba";
  if (datoscamposPrueba.value.hasOwnProperty('created_at')) {
    datoscamposPrueba.value.created_at = nfecha('timestamp');
    datoscamposPrueba.value.updated_at = nfecha('timestamp');
  }
  const envioDatos = await enviarDatosPorPost(url, datoscamposPrueba.value, tokenCifrado.value);
  if (envioDatos[0] == 'ok') {
    await fetchAndSetupData();
const imagen = await peticionesFetch(`${link.value}${api.value}`,'creardirectorio',{'ruta':rutaIMAGEN.value},tokenCifrado.value,'POST');
    await uploadImages();
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Datos Agregados', life: 3000 });
    limpiarCamposCrear();
    visiblecrear.value = false;
  } else {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Fallo al Agregar los datos.', life: 3000 });
  }
}
/************************************************************************/
async function borrarSeleccionados() {
  const ids = obtenerIdsSeleccionados(selectedItems.value);
    Swal.fire({
        title: "¿Estas Seguro?",
        text: "Se Borraran los Datos!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, de acuerdo!",
        cancelButtonText: "No, cancelar!",
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { value: password } = await Swal.fire({
                title: 'Introduce la contraseña',
                input: 'password',
                inputPlaceholder: 'Contraseña',
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar'
            });
            if (password) {
                if (password === token.value || password === tokenCorto.value) {
                    let exitoTotal = true;
                    if (ids.length > 0) {
                        for (const id of ids) {
                            try {
                                const envioDatos = await eliminarDatos(`${link.value}${api.value}/borrar/prueba`, id, tokenCifrado.value);
                            } catch (error) {
                                console.error(`Error al eliminar datos para ID: ${id}`, error);
                                exitoTotal = false;
                            }
                        }
                        if (exitoTotal) {
                            fetchAndSetupData();
                            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Datos Borrados', life: 3000 });
                        } else {
                            toast.add({ severity: 'error', summary: 'Error', detail: 'Fallo al Borrar los datos.', life: 3000 });
                        }
                    } else {
                        toast.add({ severity: 'error', summary: 'Error', detail: 'No hay datos para borrar', life: 3000 });
                    }
                } else {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Contraseña incorrecta', life: 3000 });
                }
            }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            toast.add({ severity: 'success', summary: 'No te preocupes', detail: 'Datos Seguros', life: 3000 });
        }
    });
}
/************************************************************************/
const filteredPrueba = computed(() => {
if (!searchQuery.value) return data.value;
return data.value.filter(busqueda => {
  return Object.values(busqueda).some(value =>
    String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
   );
  });
});
/************************************************************************/
const fnAwesomplete = ()=>{
}
const handleSelectComplete = async(selected)=>{
}
/************************************************************************/
const fnRouter = (ruta) => {
  router.push(ruta);
};
/************************************************************************/
    const uploadImages = async() => {
  if (fileUpload.value) {
    fileUpload.value.fnSubirIMG();
  }
};
/************************************************************************/
  const handleSuccess = async(result) => {
  arrayIMG.value = await peticiones(link.value+api.value+'/peticionimagenes',{"origen":`../vista/img/prueba/${datoscampos.value.imagen}`},'POST',tokenCifrado.value)
toast.add({ severity: 'success', summary: 'Éxito', detail: 'Imagen Subida Correctamente', life: 3000 });
};
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
const onRowSelect = async(event) => {
 router.push({ path: `/editarprueba/${event.id}` });
};
/************************************************************************/
function onSelectionChange(selection) {
  selectedItems.value = selection; 
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
/************************************************************************/
const generatePDF = () => {
  const doc = new jsPDF();
  const columns = [
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Direccion', dataKey: 'direccion' },
    { header: 'Imagen', dataKey: 'imagen' },
    { header: 'Usuario', dataKey: 'usuario' },
  ];
  const rows = datosTabla.value.map((item) => ({
  'nombre': item.nombre,
  'direccion': item.direccion,
  'imagen': item.imagen,
  'usuario': item.usuario,
  }));
  doc.autoTable({
    head: [columns.map(col => col.header)],
    body: rows.map(row => columns.map(col => row[col.dataKey])),
  });
  doc.save('tabla_prueba.pdf');
};
/************************************************************************/
</script>
<template>
  <div>
<div class="panel pb-1.5 mt-5">
<div class="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
    <div class="flex items-center flex-wrap">
        <button type="button" class="btn btn-primary btn-sm m-1" @click="fetchAndSetupData">
            <i class="pi pi-sync p-1 text-lg"></i>
        </button>
        <router-link class="btn btn-primary btn-sm m-1" to="/crearprueba">
            <i class="pi pi-plus-circle p-1 text-lg"></i>
        </router-link>
        <button type="button" class="btn btn-primary btn-sm m-1" @click="borrarSeleccionados">
            <i class="pi pi-trash p-1 text-lg"></i>
        </button>
        <vue3-json-excel class="btn btn-primary btn-sm m-1 cursor-pointer" name="table.xls" :fields="excelColumns()" :json-data="excelItems()">
            <i class="pi pi-file-excel p-1 text-lg"></i>
           </vue3-json-excel>
        <button type="button" class="btn btn-primary btn-sm m-1" @click="generatePDF">
           <i class="pi pi-file-pdf p-1 text-lg"></i>
        </button>
    </div>
    <div class="text-right">
        <input v-model="search" type="text" class="form-input " placeholder="Buscar..." />
    </div>
</div>
<div class="datatable">
<vue3-datatable
    :rows="datosTabla"
    :columns="cols"
    :totalRows="rows?.length"
    :sortable="true"
    :search="search"
    pageSize="20"
    hasCheckbox="true"
    :loading="loadingdata"
    :stickyHeader="true"
    @rowSelect="onSelectionChange"
    @rowClick="onRowSelect" 
    skin="whitespace-nowrap bh-table-hover"
    firstArrow='<i class="pi pi-fast-backward p-1 text-lg"></i>'
    lastArrow='<i class="pi pi-fast-forward p-1 text-lg"></i>'
    previousArrow='<i class="pi pi-step-backward p-1 text-lg"></i>'
    nextArrow='<i class="pi pi-step-forward p-1 text-lg"></i>'
  >
    <!-- Template personalizado para la columna 'options' -->
    <template #options="data">
      <div class="relative inline-block">
        <!-- Botón que abrirá el popover -->
        <button
          type="button"
          class="btn btn-primary"
          @click.stop="togglePopover(data.value.id)"
        >
          <i class="pi pi-bars"></i>
        </button>

        <!-- Popover con las opciones (solo visible si popoverVisible[id] es true) -->
        <div
          v-if="popoverVisible[data.value.id]"
          class="absolute z-10 mt-2 py-2 w-48 bg-white rounded-md shadow-lg"
        >
          <ul>
            <li
              v-for="option in dropdownOptions"
              :key="option"
              @click.stop="selectOption(data.value, option)"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              <!-- Mostrar el ícono correspondiente a la opción -->
              <i v-if="option === 'Editar'" class="pi pi-pencil text-blue-500"></i>
              <i v-if="option === 'Borrar'" class="pi pi-trash text-red-500"></i>
              {{ option }}
            </li>
          </ul>
        </div>
      </div>
    </template>
  </vue3-datatable>
            </div>      </div>
    </div>
</template>
<style scoped>
</style>
