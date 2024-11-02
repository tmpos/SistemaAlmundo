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
/************************************************************************/

/************************************************************************/
useMeta({ title: 'Export Table' });
const search = ref('');
/************************************************************************/
const usuarioLocal = ref({})
/************************************************************************/
const excelColumns = () => {
    return {
        Nombre: 'nombre',
        Cedula: 'cedula',
        Telefono: 'telefono',
        Email: 'email',
        Password: 'password',
        Direccion: 'direccion',
        Whatsapp: 'whatsapp',
        Genero: 'genero',
        Estado_civil: 'estado_civil',
        Apodo: 'apodo',
        Fecha_nacimiento: 'fecha_nacimiento',
        Edad: 'edad',
        Precio_fijado: 'precio_fijado',
        Empresa: 'empresa',
        Cargo: 'cargo',
        Telefono_empresa: 'telefono_empresa',
        Direccion_empresa: 'direccion_empresa',
        Codigo: 'codigo',
        N_comercial: 'n_comercial',
        Rnc: 'rnc',
        Activo: 'activo',
        Token: 'token',
        Nota: 'nota',
        Agente: 'agente',
        Nombre_empresa: 'nombre_empresa',
        Usuario: 'usuario',
    };
};
/************************************************************************/
const cols = ref([
    { field: 'options', title: 'Options' },
    { field: 'nombre', title: 'Nombre' },
    { field: 'cedula', title: 'Cedula' },
    { field: 'telefono', title: 'Telefono' },
    { field: 'email', title: 'Email' },
    { field: 'password', title: 'Password' },
    { field: 'direccion', title: 'Direccion' },
    { field: 'whatsapp', title: 'Whatsapp' },
    { field: 'genero', title: 'Genero' },
    { field: 'estado_civil', title: 'Estado_civil' },
    { field: 'apodo', title: 'Apodo' },
    { field: 'fecha_nacimiento', title: 'Fecha_nacimiento' },
    { field: 'edad', title: 'Edad' },
    { field: 'precio_fijado', title: 'Precio_fijado' },
    { field: 'empresa', title: 'Empresa' },
    { field: 'cargo', title: 'Cargo' },
    { field: 'telefono_empresa', title: 'Telefono_empresa' },
    { field: 'direccion_empresa', title: 'Direccion_empresa' },
    { field: 'codigo', title: 'Codigo' },
    { field: 'n_comercial', title: 'N_comercial' },
    { field: 'rnc', title: 'Rnc' },
    { field: 'activo', title: 'Activo' },
    { field: 'token', title: 'Token' },
    { field: 'nota', title: 'Nota' },
    { field: 'agente', title: 'Agente' },
    { field: 'nombre_empresa', title: 'Nombre_empresa' },
    { field: 'usuario', title: 'Usuario' },
]) || [];
/************************************************************************/
 const excelItems = () => {
     return datosTabla.value;
 };
const camposArray = ["nombre","cedula","telefono","email","password","direccion","whatsapp","genero","estado_civil","apodo","fecha_nacimiento","edad","precio_fijado","empresa","cargo","telefono_empresa","direccion_empresa","codigo","n_comercial","rnc","activo","token","nota","agente","nombre_empresa","usuario"];
/************************************************************************/
//import { useDatosEmpresa } from '../../stores'
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
const selectedItems = ref([]);
/************************************************************************/
const position = ref('top');
const openPosition = (pos) => {
    position.value = pos;
    visible.value = true;
}
/************************************************************************/
const datoscamposClientes = ref({})
/************************************************************************/
const visible = ref(false);
const visiblecrear = ref(false);
const value = ref(null);
const id = ref(null);
const datoscampos = ref({});
const data = ref([]);
const searchQuery = ref('');
const ClientesEditar = ref(null);
/************************************************************************/
async function limpiarCamposCrear() {
datoscamposClientes.value = {}
await campos();
}
/************************************************************************/
watchEffect(() => {
  if (visiblecrear.value) {
  }
});
/************************************************************************/
const popoverVisible = ref<Record<number, boolean>>({});
const togglePopover = (id: number) => {
  popoverVisible.value = { ...popoverVisible.value, [id]: !popoverVisible.value[id] };
};
const dropdownOptions = ['Editar', 'Borrar'];
const selectOption = (row: any, option: string) => {
  popoverVisible.value[row.id] = false;
  const datos = row;
  if(option === 'Editar'){
  console.log("datos", datos);
visible.value = true;
datoscampos.value = datos;
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
                        const datosFactura = await peticionesFetch(`${link.value}${api.value}`, `borrarporcampo/clientes`, { campo: 'id', valor: datos.id }, tokenCifrado.value, 'POST');
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
     'datosarray/clientes',
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
  const campos = await arrayToObjetoFromTabla(link.value+api.value, tokenCifrado.value, 'clientes', true,camposArray,'usuario');
  datoscamposClientes.value = campos;
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
//if (!datosEmpresa.$state.nombre) {
//  await datosEmpresa.inicializarDatosEmpresa(link.value+api.value);
//}
tokenCifrado.value = await encryptarPassword(token.value, 10);
await crearTablaSiNoExiste(link.value, api.value, 'clientes', camposArray, tokenCifrado.value,toast);
//usuarioLocal.value = JSON.parse(window.localStorage.getItem('usuarioLocal'))[0] || {};
await campos();
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
                    const envioDatos = await borrarTodoslosDatos(link.value + api.value + '/borrartodo', 'clientes', tokenCifrado.value);
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
  const url = link.value+api.value+"/actualizarcampos/clientes";
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
  const url = link.value+api.value+"/insertar/clientes";
  if (datoscamposClientes.value.hasOwnProperty('created_at')) {
    datoscamposClientes.value.created_at = nfecha('timestamp');
    datoscamposClientes.value.updated_at = nfecha('timestamp');
  }
  const envioDatos = await enviarDatosPorPost(url, datoscamposClientes.value, tokenCifrado.value);
  if (envioDatos[0] == 'ok') {
    await fetchAndSetupData();
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
                                const envioDatos = await eliminarDatos(`${link.value}${api.value}/borrar/clientes`, id, tokenCifrado.value);
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
const filteredClientes = computed(() => {
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
const onRowSelect = (event) => {
visible.value = true;
datoscampos.value = event;
};
/************************************************************************/
function onSelectionChange(selection) {
  selectedItems.value = selection; 
}
/************************************************************************/
    const exportTable = (type) => {
        let columns: any = cols.value.map((d) => {
            return d.field;
        });

        let records = rows.value;
        let filename = 'table';

        let newVariable: any;
        newVariable = window.navigator;

        if (type == 'csv') {
            let coldelimiter = ';';
            let linedelimiter = '\n';
            let result = columns
                .map((d) => {
                    return capitalize(d);
                })
                .join(coldelimiter);
            result += linedelimiter;
            records.map((item) => {
                columns.map((d: any, index) => {
                    if (index > 0) {
                        result += coldelimiter;
                    }
                    let val = item[d] ? item[d] : '';
                    result += val;
                });
                result += linedelimiter;
            });

            if (result == null) return;
            if (!result.match(/^data:text\/csv/i) && !newVariable.msSaveOrOpenBlob) {
                var data = 'data:application/csv;charset=utf-8,' + encodeURIComponent(result);
                var link = document.createElement('a');
                link.setAttribute('href', data);
                link.setAttribute('download', filename + '.csv');
                link.click();
            } else {
                var blob = new Blob([result]);
                if (newVariable.msSaveOrOpenBlob) {
                    newVariable.msSaveBlob(blob, filename + '.csv');
                }
            }
        } else if (type == 'print') {
            var rowhtml = '<p>' + filename + '</p>';
            rowhtml +=
                '<table style="width: 100%; " cellpadding="0" cellcpacing="0"><thead><tr style="color: #515365; background: #eff5ff; -webkit-print-color-adjust: exact; print-color-adjust: exact; "> ';
            columns.map((d) => {
                rowhtml += '<th>' + capitalize(d) + '</th>';
            });
            rowhtml += '</tr></thead>';
            rowhtml += '<tbody>';

            records.map((item) => {
                rowhtml += '<tr>';
                columns.map((d: any) => {
                    let val = item[d] ? item[d] : '';
                    rowhtml += '<td>' + val + '</td>';
                });
                rowhtml += '</tr>';
            });
            rowhtml +=
                '<style>body {font-family:Arial; color:#495057;}p{text-align:center;font-size:18px;font-weight:bold;margin:15px;}table{ border-collapse: collapse; border-spacing: 0; }th,td{font-size:12px;text-align:left;padding: 4px;}th{padding:8px 4px;}tr:nth-child(2n-1){background:#f7f7f7; }</style>';
            rowhtml += '</tbody></table>';
            var winPrint: any = window.open('', '', 'left=0,top=0,width=1000,height=600,toolbar=0,scrollbars=0,status=0');
            winPrint.document.write('<title>Print</title>' + rowhtml);
            winPrint.document.close();
            winPrint.focus();
            winPrint.print();
            // winPrint.close();
        } else if (type == 'txt') {
            let coldelimiter = ',';
            let linedelimiter = '\n';
            let result = columns
                .map((d) => {
                    return capitalize(d);
                })
                .join(coldelimiter);
            result += linedelimiter;
            records.map((item) => {
                columns.map((d: any, index) => {
                    if (index > 0) {
                        result += coldelimiter;
                    }
                    let val = item[d] ? item[d] : '';
                    result += val;
                });
                result += linedelimiter;
            });

            if (result == null) return;
            if (!result.match(/^data:text\/txt/i) && !newVariable.msSaveOrOpenBlob) {
                var data = 'data:application/txt;charset=utf-8,' + encodeURIComponent(result);
                var link = document.createElement('a');
                link.setAttribute('href', data);
                link.setAttribute('download', filename + '.txt');
                link.click();
            } else {
                var blob = new Blob([result]);
                if (newVariable.msSaveOrOpenBlob) {
                    newVariable.msSaveBlob(blob, filename + '.txt');
                }
            }
        }
    };
/************************************************************************/
</script>
<template>
  <div>
<div class="panel pb-1.5 mt-6">
<div class="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
    <div class="flex items-center flex-wrap">
        <button type="button" class="btn btn-primary btn-sm m-1" @click="fetchAndSetupData">
            <i class="pi pi-sync p-1 text-lg"></i>
        </button>
        <button type="button" class="btn btn-primary btn-sm m-1" @click="visiblecrear = true">
            <i class="pi pi-plus-circle p-1 text-lg"></i>
        </button>
        <button type="button" class="btn btn-primary btn-sm m-1" @click="borrarSeleccionados">
            <i class="pi pi-trash p-1 text-lg"></i>
        </button>
        <vue3-json-excel class="btn btn-primary btn-sm m-1 cursor-pointer" name="table.xls" :fields="excelColumns()" :json-data="excelItems()">
            <i class="pi pi-file-excel p-1 text-lg"></i>
           </vue3-json-excel>
        <button type="button" class="btn btn-primary btn-sm m-1" @click="exportTable('print')">
           <i class="pi pi-print p-1 text-lg"></i>
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
    @rowSelect="onSelectionChange"
    :stickyHeader="true"
    @rowClick="onRowSelect" 
    skin="whitespace-nowrap bh-table-hover bh-table-compact"
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
<!-- ////////////////////////////////////////////////////////////////////////////////////////// -->
 <TransitionRoot appear :show="visible" as="template">
     <Dialog as="div" @close="visible = false" class="relative z-50">
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
           <DialogPanel class="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark animate__animated animate__slideInDown">
             <button type="button" class="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" @click="visible = false">
               <svg> ... </svg>
             </button>
             <div class="text-lg font-bold bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Modal Agregar Clientes</div>
             <div class="p-5">
  <fieldset class="border p-3 round mb-2">
    <legend class="float-none w-auto px-2">Clientes</legend>
     <form id="formularioActualizarClientes" action="" method="">
         <div  style="margin-top: 15px;color: #34AAB2;" class="grid grid-cols-1 gap-4">

<div class="form-group col-12" hidden>
<label for="id-Actualizador">ID</label>
<input type="input" v-model="datoscampos.id" name="id"  class="form-input" id="id-Actualizador" readonly placeholder="id"  maxlength="11">
</div>
<div class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12" >
<label for="nombre-Actualizador">NOMBRE</label>
<input type="input" v-model="datoscampos.nombre" name="nombre"  class="form-input" id="nombre-Actualizador" v-mayuscula placeholder="nombre"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="cedula-Actualizador">CEDULA</label>
<input type="input" v-model="datoscampos.cedula" name="cedula"  class="form-input" id="cedula-Actualizador"  placeholder="cedula"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="telefono-Actualizador">TELEFONO</label>
<input id="telefonoAgregarDatos" nombrecampo="telefono"  class="form-input" v-model="datoscamposClientes.telefono" v-maska="patronTelefono" :placeholder="patronTelefono" />
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="email-Actualizador">EMAIL</label>
<input type="input" v-model="datoscampos.email" name="email"  class="form-input" id="email-Actualizador"  placeholder="email"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="password-Actualizador">PASSWORD</label>
<input type="input" v-model="datoscampos.password" name="password"  class="form-input" id="password-Actualizador"  placeholder="password"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12" >
<label for="direccion-Actualizador">DIRECCION</label>
<textarea class="form-input " id="direccion-Actualizador" name="direccion" v-model="datoscampos.direccion" cols="30" rows="3" ></textarea>
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-4" >
<label for="whatsapp-Actualizador">WHATSAPP</label>
<input type="input" v-model="datoscampos.whatsapp" name="whatsapp"  class="form-input" id="whatsapp-Actualizador"  placeholder="whatsapp"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-4" >
<label for="genero-Actualizador">GENERO</label>
<multiselect
 v-model="datoscamposClientes.genero"
  :options="['HOMBRE','MUJER','OTRO']"
  class="custom-multiselect"
  :searchable="true"
  placeholder="Genero"
  selected-label=""
  select-label=""
  deselect-label=""
></multiselect>
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-4" >
<label for="estado_civil-Actualizador">ESTADO_CIVIL</label>
<multiselect
 v-model="datoscamposClientes.estado_civil"
  :options="['SOLTERO','CASADO','UNIDO','OTRO']"
  class="custom-multiselect"
  :searchable="true"
  placeholder="Estado Civil"
  selected-label=""
  select-label=""
  deselect-label=""
></multiselect>
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="apodo-Actualizador">APODO</label>
<input type="input" v-model="datoscampos.apodo" name="apodo"  class="form-input" id="apodo-Actualizador" v-mayuscula placeholder="apodo"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="fecha_nacimiento-Actualizador">FECHA_NACIMIENTO</label>
<input type="input" v-model="datoscampos.fecha_nacimiento" name="fecha_nacimiento"  class="form-input" id="fecha_nacimiento-Actualizador"  placeholder="fecha_nacimiento"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="edad-Actualizador">EDAD</label>
<input type="input" v-model="datoscampos.edad" name="edad"  class="form-input" id="edad-Actualizador"  placeholder="edad" v-solonumeros maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="precio_fijado-Actualizador">PRECIO_FIJADO</label>
<input type="input" v-model="datoscampos.precio_fijado" name="precio_fijado"  class="form-input" id="precio_fijado-Actualizador"  placeholder="precio_fijado"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-4" >
<label for="empresa-Actualizador">EMPRESA</label>
<input type="input" v-model="datoscampos.empresa" name="empresa"  class="form-input" id="empresa-Actualizador" v-mayuscula placeholder="empresa"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-4" >
<label for="cargo-Actualizador">CARGO</label>
<input type="input" v-model="datoscampos.cargo" name="cargo"  class="form-input" id="cargo-Actualizador" v-mayuscula placeholder="cargo"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-4" >
<label for="telefono_empresa-Actualizador">TELEFONO_EMPRESA</label>
<input id="telefono_empresaAgregarDatos" nombrecampo="telefono" class="form-input" v-model="datoscamposClientes.telefono_empresa" :placeholder="patronTelefono" />
</div>
<div class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12" >
<label for="direccion_empresa-Actualizador">DIRECCION_EMPRESA</label>
<input type="input" v-model="datoscampos.direccion_empresa" name="direccion_empresa"  class="form-input" id="direccion_empresa-Actualizador"  placeholder="direccion_empresa"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="codigo-Actualizador">CODIGO</label>
<input type="input" v-model="datoscampos.codigo" name="codigo"  class="form-input" id="codigo-Actualizador" readonly placeholder="codigo"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="n_comercial-Actualizador">N_COMERCIAL</label>
<input type="input" v-model="datoscampos.n_comercial" name="n_comercial"  class="form-input" id="n_comercial-Actualizador" v-mayuscula placeholder="n_comercial"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="rnc-Actualizador">RNC</label>
<input type="input" v-model="datoscampos.rnc" name="rnc"  class="form-input" id="rnc-Actualizador"  placeholder="rnc"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="activo-Actualizador">ACTIVO</label>
<multiselect
 v-model="datoscamposClientes.activo"
  :options="['ON','OFF']"
  class="custom-multiselect"
  :searchable="true"
  placeholder="Activo"
  selected-label=""
  select-label=""
  deselect-label=""
></multiselect>
</div>
<div class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12" >
<label for="token-Actualizador">TOKEN</label>
<input type="input" v-model="datoscampos.token" name="token"  class="form-input" id="token-Actualizador"  placeholder="token"  maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12" >
<label for="nota-Actualizador">NOTA</label>
<textarea class="form-input " id="nota-Actualizador" name="nota" v-model="datoscampos.nota" cols="30" rows="3" ></textarea>
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-6" >
<label for="agente-Actualizador">AGENTE</label>
<textarea class="form-input " id="agente-Actualizador" name="agente" v-model="datoscampos.agente" cols="30" rows="3" v-mayuscula></textarea>
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-6" >
<label for="nombre_empresa-Actualizador">NOMBRE_EMPRESA</label>
<input type="input" v-model="datoscampos.nombre_empresa" name="nombre_empresa"  class="form-input" id="nombre_empresa-Actualizador" v-mayuscula placeholder="nombre_empresa"  maxlength="250">
</div>
<div class="form-group " hidden>
<label for="created_at-Actualizador">CREATED_AT</label>
<input type="input" v-model="datoscampos.created_at" name="created_at"  class="form-input" id="created_at-Actualizador"  placeholder="created_at"  maxlength="">
</div>
<div class="form-group " hidden>
<label for="updated_at-Actualizador">UPDATED_AT</label>
<input type="input" v-model="datoscampos.updated_at" name="updated_at"  class="form-input" id="updated_at-Actualizador"  placeholder="updated_at"  maxlength="">
</div>
<div class="form-group " hidden>
<label for="usuario-Actualizador">USUARIO</label>
<input type="input" v-model="datoscampos.usuario" name="usuario"  class="form-input" id="usuario-Actualizador"  placeholder="usuario"  maxlength="250">
</div>

        </div>
        </form>
</fieldset>
              <div class="flex justify-end items-center mt-8">
                <button type="button" @click="visible = false" class="btn btn-outline-danger">Cerrar</button>
                <button type="button" @click="funcionActualizar" class="btn btn-primary ltr:ml-4 rtl:mr-4">Actualizar</button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
<!-- ////////////////////////////////////////////////////////////////////////////////////////// -->
 <TransitionRoot appear :show="visiblecrear" as="template">
     <Dialog as="div" @close="visiblecrear = false" class="relative z-50">
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
           <DialogPanel class="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark animate__animated animate__slideInDown">
             <button type="button" class="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" @click="visiblecrear = false">
               <svg> ... </svg>
             </button>
             <div class="text-lg font-bold bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Modal Agregar Clientes</div>
             <div class="p-5">
  <fieldset class="border p-3 round mb-2">
    <legend class="float-none w-auto px-2">Clientes</legend>
     <form id="formularioActualizarClientes" action="" method="">
         <div  style="margin-top: 15px;color: #34AAB2;" class="grid grid-cols-1 gap-4">
<div class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12" >
<label for="nombreAgregarDatos">NOMBRE</label>
<input type="input" v-model="datoscamposClientes.nombre" name="nombre"  class="form-input " id="nombreAgregarDatos"  v-mayuscula placeholder="nombre" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="cedulaAgregarDatos">CEDULA</label>
<input type="input" v-model="datoscamposClientes.cedula" name="cedula"  class="form-input " id="cedulaAgregarDatos"   placeholder="cedula" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="telefonoAgregarDatos">TELEFONO</label>
<input id="telefonoAgregarDatos" nombrecampo="telefono" class="form-input" v-model="datoscamposClientes.telefono" v-maska="patronTelefono" :placeholder="patronTelefono" />
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="emailAgregarDatos">EMAIL</label>
<input type="input" v-model="datoscamposClientes.email" name="email"  class="form-input " id="emailAgregarDatos"   placeholder="email" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="passwordAgregarDatos">PASSWORD</label>
<input type="input" v-model="datoscamposClientes.password" name="password"  class="form-input " id="passwordAgregarDatos"   placeholder="password" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12" >
<label for="direccionAgregarDatos">DIRECCION</label>
<textarea class="form-input " id="direccionAgregarDatos" v-model="datoscamposClientes.direccion" name="direccion" cols="30" rows="3" ></textarea>
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-4" >
<label for="whatsappAgregarDatos">WHATSAPP</label>
<input type="input" v-model="datoscamposClientes.whatsapp" name="whatsapp"  class="form-input " id="whatsappAgregarDatos"   placeholder="whatsapp" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-4" >
<label for="generoAgregarDatos">GENERO</label>
<multiselect
 v-model="datoscamposClientes.genero"
  :options="['HOMBRE','MUJER','OTRO']"
  class="custom-multiselect"
  :searchable="true"
  placeholder="Genero"
  selected-label=""
  select-label=""
  deselect-label=""
></multiselect>
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-4" >
<label for="estado_civilAgregarDatos">ESTADO_CIVIL</label>
<multiselect
 v-model="datoscamposClientes.estado_civil"
  :options="['SOLTERO','CASADO','UNIDO','OTRO']"
  class="custom-multiselect"
  :searchable="true"
  placeholder="Estado Civil"
  selected-label="Estado Civil"
  select-label="Estado Civil"
  deselect-label=""
></multiselect>
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="apodoAgregarDatos">APODO</label>
<input type="input" v-model="datoscamposClientes.apodo" name="apodo"  class="form-input " id="apodoAgregarDatos"  v-mayuscula placeholder="apodo" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="fecha_nacimientoAgregarDatos">FECHA_NACIMIENTO</label>
<input type="input" v-model="datoscamposClientes.fecha_nacimiento" name="fecha_nacimiento"  class="form-input " id="fecha_nacimientoAgregarDatos"   placeholder="fecha_nacimiento" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="edadAgregarDatos">EDAD</label>
<input type="input" v-model="datoscamposClientes.edad" name="edad"  class="form-input soloNumero" id="edadAgregarDatos" v-solonumeros  placeholder="edad" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="precio_fijadoAgregarDatos">PRECIO_FIJADO</label>
<input type="input" v-model="datoscamposClientes.precio_fijado" name="precio_fijado"  class="form-input " id="precio_fijadoAgregarDatos"   placeholder="precio_fijado" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-4" >
<label for="empresaAgregarDatos">EMPRESA</label>
<input type="input" v-model="datoscamposClientes.empresa" name="empresa"  class="form-input " id="empresaAgregarDatos"  v-mayuscula placeholder="empresa" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-4" >
<label for="cargoAgregarDatos">CARGO</label>
<input type="input" v-model="datoscamposClientes.cargo" name="cargo"  class="form-input " id="cargoAgregarDatos"  v-mayuscula placeholder="cargo" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-4" >
<label for="telefono_empresaAgregarDatos">TELEFONO_EMPRESA</label>
<input id="telefono_empresaAgregarDatos" nombrecampo="telefono" data-mask class="form-input" v-model="datoscamposClientes.telefono_empresa" v-maska="patronTelefono" :placeholder="patronTelefono" />
</div>
<div class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12" >
<label for="direccion_empresaAgregarDatos">DIRECCION_EMPRESA</label>
<input type="input" v-model="datoscamposClientes.direccion_empresa" name="direccion_empresa"  class="form-input " id="direccion_empresaAgregarDatos"   placeholder="direccion_empresa" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="codigoAgregarDatos">CODIGO</label>
<input type="input" v-model="datoscamposClientes.codigo" name="codigo"  class="form-input " id="codigoAgregarDatos"  readonly placeholder="codigo" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="n_comercialAgregarDatos">N_COMERCIAL</label>
<input type="input" v-model="datoscamposClientes.n_comercial" name="n_comercial"  class="form-input " id="n_comercialAgregarDatos"  v-mayuscula placeholder="n_comercial" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="rncAgregarDatos">RNC</label>
<input type="input" v-model="datoscamposClientes.rnc" name="rnc"  class="form-input " id="rncAgregarDatos"   placeholder="rnc" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-3 2xl:col-span-3" >
<label for="activoAgregarDatos">ACTIVO</label>
<multiselect
 v-model="datoscamposClientes.activo"
  :options="['ON','OFF']"
  class="custom-multiselect"
  :searchable="true"
  placeholder="Activo"
  selected-label=""
  select-label=""
  deselect-label=""
></multiselect>
</div>
<div class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12" >
<label for="tokenAgregarDatos">TOKEN</label>
<input type="input" v-model="datoscamposClientes.token" name="token"  class="form-input " id="tokenAgregarDatos"   placeholder="token" maxlength="250">
</div>
<div class="form-group col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 2xl:col-span-12" >
<label for="notaAgregarDatos">NOTA</label>
<textarea class="form-input " v-model="datoscamposClientes.nota" id="notaAgregarDatos" name="nota" cols="30" rows="3" ></textarea>
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-6" >
<label for="agenteAgregarDatos">AGENTE</label>
<textarea class="form-input " id="agenteAgregarDatos" v-model="datoscamposClientes.agente" name="agente" cols="30" rows="3" v-mayuscula></textarea>
</div>
<div class="form-group col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 xl:col-span-6 2xl:col-span-6" >
<label for="nombre_empresaAgregarDatos">NOMBRE_EMPRESA</label>
<input type="input" v-model="datoscamposClientes.nombre_empresa" name="nombre_empresa"  class="form-input " id="nombre_empresaAgregarDatos"  v-mayuscula placeholder="nombre_empresa" maxlength="250">
</div>
<div class="form-group " hidden>
<label for="created_atAgregarDatos">CREATED_AT</label>
<input type="input" v-model="datoscamposClientes.created_at" name="created_at"  class="form-input " id="created_atAgregarDatos"   placeholder="created_at" maxlength="">
</div>
<div class="form-group " hidden>
<label for="updated_atAgregarDatos">UPDATED_AT</label>
<input type="input" v-model="datoscamposClientes.updated_at" name="updated_at"  class="form-input " id="updated_atAgregarDatos"   placeholder="updated_at" maxlength="">
</div>
<div class="form-group " hidden>
<label for="usuarioAgregarDatos">USUARIO</label>
<input type="input" v-model="datoscamposClientes.usuario" name="usuario"  class="form-input " id="usuarioAgregarDatos"   placeholder="usuario" maxlength="250">
</div>

        </div>
        </form>
</fieldset>
              <div class="flex justify-end items-center mt-8">
                <button type="button" @click="visiblecrear = false" class="btn btn-outline-danger">Cerrar</button>
                <button type="button" @click="funcionCrear" class="btn btn-primary ltr:ml-4 rtl:mr-4">Crear</button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
<!-- ////////////////////////////////////////////////////////////////////////////////////////// -->
</template>
<style scoped>
</style>
