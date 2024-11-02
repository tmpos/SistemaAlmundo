<script setup lang="ts">
    import { ref, onMounted, nextTick, watchEffect, computed,watch } from 'vue';
    import Vue3Datatable from '@bhplugin/vue3-datatable';
    import { useMeta } from '@/composables/use-meta';
    import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogOverlay, TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue';
    import Multiselect from '@suadelabs/vue3-multiselect';
    import '@suadelabs/vue3-multiselect/dist/vue3-multiselect.css';
    import { useRouter, useRoute } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

    const router = useRouter();
    import axios from 'axios';
    import {
        enviarDatosPorPost,
        eliminarDatos,
        obtenerIdsSeleccionados,
        borrarTodoslosDatos,
        nfecha,
        arrayToObjetoFromTabla,
        peticionesFetch,
        encryptarPassword,
        envioElectron,
        toast,
        crearTablaSiNoExiste,
        peticiones,
        generarCodigoUnico,
        lasMayusculas,
    } from '../../funciones/funciones.js';
    import Swal from 'sweetalert2';
    import { vMaska } from 'maska/vue';
    import jsPDF from 'jspdf';
    import 'jspdf-autotable';
    /************************************************************************/
    useMeta({ title: 'Export Table' });
    const search = ref('');
    /************************************************************************/
    const usuarioLocal = ref({});
    /************************************************************************/
    const selectedState = ref('OPEN')
    /************************************************************************/
    const excelColumns = () => {
        return {
            Date: 'date',
            Name: 'name',
            Agent: 'agent',
            Email: 'email',
            Phone: 'phone',
            Branch_office: 'branch_office',
            Contact_method: 'contact_method',
            Service_type: 'service_type',
            Destiny: 'destiny',
            City: 'city',
            Markup: 'markup',
            State: 'state',
            Note: 'note',
            Imagen: 'imagen',
            Usuario: 'usuario',
        };
    };
    /************************************************************************/
    const cols =
        ref([
            { field: 'options', title: 'Options' },
            { field: 'date', title: 'Date' },
            { field: 'name', title: t('Name') },
            { field: 'agent', title: 'Agent' },
            { field: 'email', title: 'Email' },
            { field: 'phone', title: 'Phone' },
            { field: 'branch_office', title: 'Branch_office' },
            { field: 'contact_method', title: 'Contact_method' },
            { field: 'service_type', title: 'Service_type' },
            { field: 'destiny', title: 'Destiny' },
            { field: 'city', title: 'City' },
            { field: 'markup', title: 'Markup' },
            { field: 'state', title: 'State' },
            { field: 'note', title: 'Note' },
            { field: 'imagen', title: 'Imagen' },
            { field: 'usuario', title: 'Usuario' },
        ]) || [];
    /************************************************************************/
    const excelItems = () => {
        return filteredLeads.value;
    };
    const camposArray = [
        'date',
        'name',
        'agent',
        'email',
        'phone',
        'branch_office',
        'contact_method',
        'service_type',
        'destiny',
        'city',
        'markup',
        'state',
        'note',
        'imagen',
        'usuario',
    ];
    /************************************************************************/
    import { useDatosEmpresa } from '../../stores';
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
    };
    /************************************************************************/
    /************************************************************************/
    import FileUploader from '../../components/FileUploader.vue';
    const rutaIMAGEN = ref('');
    const urlIMAGEN = ref(null);
    const fileUpload = ref(null);
    const arrayIMG = ref([]);
    const uploadUrl = ref(null);
    const additionalData = ref(null);
    const fileUploaderRef = ref(null);
    /************************************************************************/
    const visible = ref(false);
    const visiblecrear = ref(false);
    const value = ref(null);
    const id = ref(null);
    const datoscampos = ref({});
    const data = ref([]);
    const searchQuery = ref('');
    const LeadsEditar = ref(null);
    /************************************************************************/
    async function limpiarCamposCrear() {
        datoscamposLeads.value = {};
        await campos();
    }
    /************************************************************************/
    watchEffect(() => {
        if (visiblecrear.value) {
            datoscamposLeads.value.imagen = generarCodigoUnico();
            additionalData.value = { ruta: '../vista/img/leads/' + datoscamposLeads.value.imagen };
        }
    });
    /************************************************************************/
    const popoverVisible = ref<Record<number, boolean>>({});
    const togglePopover = (id: number) => {
        popoverVisible.value = { ...popoverVisible.value, [id]: !popoverVisible.value[id] };
    };
    const dropdownOptions = ['Editar','Cerrar Presupuesto', 'Borrar'];
    const selectOption = async (row: any, option: string) => {
        popoverVisible.value[row.id] = false;
        const datos = row;
        if (option === 'Editar') {
            router.push({ path: `/editarleads/${datos.id}` });
        } else if (option === 'Cerrar Presupuesto') {

        datos.state = 'CLOSED'
           
  const url = link.value+api.value+"/actualizarcampos/leads";
  if (!datos) {
    console.error("Datos incompletos, no se puede actualizar.");
    return;
  }
  if (datos.hasOwnProperty('created_at')) {
      datos.updated_at = nfecha('timestamp')
    }
  const envioDatos = await enviarDatosPorPost(url, datos,tokenCifrado.value);
  if (envioDatos[0] == 'ok') {
     toast.add({ severity: 'success', summary: 'Éxito', detail: 'Datos Actualizados', life: 3000 });
  }else{
    toast.add({ severity: 'error', summary: 'Error', detail: 'Fallo al actualizar los datos.', life: 3000 });
  }


        } else if (option === 'Borrar') {
            Swal.fire({
                title: 'Introduce la contraseña',
                input: 'password',
                inputPlaceholder: 'Contraseña',
                showCancelButton: true,
                confirmButtonText: 'Eliminar',
                cancelButtonText: 'Cancelar',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const contrasenaIngresada = result.value;
                    if (contrasenaIngresada === token.value || contrasenaIngresada === tokenCorto.value) {
                        const datosFactura = await peticionesFetch(
                            `${link.value}${api.value}`,
                            `borrarporcampo/leads`,
                            { campo: 'id', valor: datos.id },
                            tokenCifrado.value,
                            'POST'
                        );
                        if (datosFactura[0] == 'ok') {
                            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Datos eliminados correctamente', life: 3000 });
                            await fetchAndSetupData();
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
    const loadingdata = ref(false);
    /*************************************************************************/
    const datosTabla = ref([]);
    /*************************************************************************/
    const fetchAndSetupData = async () => {
        try {
            loadingdata.value = true;
            const response = await peticionesFetch(`${link.value}${api.value}`, 'datosarray/leads', {}, tokenCifrado.value, 'GET');
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
        const campos = await arrayToObjetoFromTabla(link.value + api.value, tokenCifrado.value, 'leads', true, camposArray, 'usuario');
        datoscamposLeads.value = campos;
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
        await crearTablaSiNoExiste(link.value, api.value, 'leads', camposArray, tokenCifrado.value, toast);
        //usuarioLocal.value = JSON.parse(window.localStorage.getItem('usuarioLocal'))[0] || {};
        await fetchAndSetupData();
    });
    /************************************************************************/
    async function borrarTodo() {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡Se borrarán los datos!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, de acuerdo',
            cancelButtonText: 'No, cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { value: password } = await Swal.fire({
                    title: 'Introduce la contraseña',
                    input: 'password',
                    inputPlaceholder: 'Contraseña',
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar',
                    cancelButtonText: 'Cancelar',
                });
                if (password) {
                    if (password === token.value || password === tokenCorto.value) {
                        const envioDatos = await borrarTodoslosDatos(link.value + api.value + '/borrartodo', 'leads', tokenCifrado.value);
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
        const url = link.value + api.value + '/actualizarcampos/leads';
        if (!datoscampos.value) {
            console.error('Datos incompletos, no se puede actualizar.');
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
        const url = link.value + api.value + '/insertar/leads';
        if (datoscamposLeads.value.hasOwnProperty('created_at')) {
            datoscamposLeads.value.created_at = nfecha('timestamp');
            datoscamposLeads.value.updated_at = nfecha('timestamp');
        }
        const envioDatos = await enviarDatosPorPost(url, datoscamposLeads.value, tokenCifrado.value);
        if (envioDatos[0] == 'ok') {
            await fetchAndSetupData();
            const imagen = await peticionesFetch(`${link.value}${api.value}`, 'creardirectorio', { ruta: rutaIMAGEN.value }, tokenCifrado.value, 'POST');
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
            title: '¿Estas Seguro?',
            text: 'Se Borraran los Datos!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, de acuerdo!',
            cancelButtonText: 'No, cancelar!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { value: password } = await Swal.fire({
                    title: 'Introduce la contraseña',
                    input: 'password',
                    inputPlaceholder: 'Contraseña',
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar',
                    cancelButtonText: 'Cancelar',
                });
                if (password) {
                    if (password === token.value || password === tokenCorto.value) {
                        let exitoTotal = true;
                        if (ids.length > 0) {
                            for (const id of ids) {
                                try {
                                    const envioDatos = await eliminarDatos(`${link.value}${api.value}/borrar/leads`, id, tokenCifrado.value);
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
const filteredLeads = computed(() => {
    let filtered = datosTabla.value;
    if (selectedState.value !== 'ALL') {
        filtered = filtered.filter(item => item.state === selectedState.value);
    }

    if (searchQuery.value) {
        filtered = filtered.filter((busqueda) => {
            return Object.values(busqueda).some((value) =>
                String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
            );
        });
    }
    return filtered;
});

    /************************************************************************/


    /************************************************************************/
    const fnAwesomplete = () => {};
    const handleSelectComplete = async (selected) => {};
    /************************************************************************/
    const fnRouter = (ruta) => {
        router.push(ruta);
    };
    /************************************************************************/
    const uploadImages = async () => {
        if (fileUpload.value) {
            fileUpload.value.fnSubirIMG();
        }
    };
    /************************************************************************/
    const handleSuccess = async (result) => {
        arrayIMG.value = await peticiones(
            link.value + api.value + '/peticionimagenes',
            { origen: `../vista/img/leads/${datoscampos.value.imagen}` },
            'POST',
            tokenCifrado.value
        );
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Imagen Subida Correctamente', life: 3000 });
    };
    const deleteImage = async (imagen) => {
        const ruta = datoscampos.value.imagen;
        const url = link.value + api.value + '/borrararchivo';
        const datos = {
            ruta: '../vista/img/leads/' + ruta,
            archivo: imagen,
        };
        const envioDatos = await enviarDatosPorPost(url, datos, tokenCifrado.value);
        if (envioDatos[0] == 'ok') {
            arrayIMG.value = await peticiones(
                link.value + api.value + '/peticionimagenes',
                { origen: `../vista/img/leads/${ruta}` },
                'POST',
                tokenCifrado.value
            );
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Imagen Borrada', life: 3000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Fallo al Borrar la Imagen.', life: 3000 });
        }
    };
    /************************************************************************/
    const onRowSelect = async (event) => {
        router.push({ path: `/editarleads/${event.id}` });
    };
    /************************************************************************/
    function onSelectionChange(selection) {
        selectedItems.value = selection;
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
    const generatePDF = () => {
        const doc = new jsPDF();
        const columns = [
            { header: 'Date', dataKey: 'date' },
            { header: 'Name', dataKey: 'name' },
            { header: 'Agent', dataKey: 'agent' },
            { header: 'Email', dataKey: 'email' },
            { header: 'Phone', dataKey: 'phone' },
            { header: 'Branch_office', dataKey: 'branch_office' },
            { header: 'Contact_method', dataKey: 'contact_method' },
            { header: 'Service_type', dataKey: 'service_type' },
            { header: 'Destiny', dataKey: 'destiny' },
            { header: 'Markup', dataKey: 'markup' },
            { header: 'State', dataKey: 'state' },
            { header: 'Note', dataKey: 'note' },
            { header: 'Imagen', dataKey: 'imagen' },
            { header: 'Usuario', dataKey: 'usuario' },
        ];
        const rows = filteredLeads.value.map((item) => ({
            date: item.date,
            name: item.name,
            agent: item.agent,
            email: item.email,
            phone: item.phone,
            branch_office: item.branch_office,
            contact_method: item.contact_method,
            service_type: item.service_type,
            destiny: item.destiny,
            markup: item.markup,
            state: item.state,
            note: item.note,
            imagen: item.imagen,
            usuario: item.usuario,
        }));
        doc.autoTable({
            head: [columns.map((col) => col.header)],
            body: rows.map((row) => columns.map((col) => row[col.dataKey])),
        });
        doc.save('tabla_leads.pdf');
    };
    /************************************************************************/
const rowStateClass = (rowData) => {
  return {
    'bg-green-100': rowData.state === 'OPEN',
    'bg-red-100': rowData.state === 'CLOSED',
  }
}


    /************************************************************************/


    /************************************************************************/
</script>
<template>
    <div>
        <div class="panel pb-1.5 mt-5">
            <p class="text-lg ml-1 mb-1">Leads</p>
<div class="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
  <div class="flex items-center flex-wrap">
    <button type="button" class="btn btn-primary btn-sm m-1" @click="fetchAndSetupData">
      <i class="pi pi-sync p-1 text-lg"></i>
    </button>
    <router-link class="btn btn-primary btn-sm m-1" to="/crearleads">
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
  <div class="flex items-center">
    <select v-model="selectedState" class="form-select btn-sm m-1">
      <option value="OPEN">OPEN</option>
      <option value="CLOSED">CLOSED</option>
      <option value="ALL">ALL</option>
    </select>
  </div>
  </div>

  <!-- Select Dropdown for State (OPEN, CLOSED, ALL) -->

  <div class="text-right">
    <input v-model="search" type="text" class="form-input" placeholder="Buscar..." />
  </div>
</div>

            <div class="datatable">
                <vue3-datatable
                    :rows="filteredLeads"
                    :columns="cols"
                    :totalRows="rows?.length"
                    :sortable="true"
                    :search="search"
                    pageSize="20"
                    :rowClass="rowStateClass"
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
                            <button type="button" class="btn btn-primary" @click.stop="togglePopover(data.value.id)">
                                <i class="pi pi-bars"></i>
                            </button>

                            <!-- Popover con las opciones (solo visible si popoverVisible[id] es true) -->
                            <div v-if="popoverVisible[data.value.id]" class="absolute z-10 mt-2 py-2 w-48 bg-white rounded-md shadow-lg">
                                <ul>
                                    <li
                                        v-for="option in dropdownOptions"
                                        :key="option"
                                        @click.stop="selectOption(data.value, option)"
                                        class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                    >
                                        <!-- Mostrar el ícono correspondiente a la opción -->
                                        <i v-if="option === 'Editar'" class="pi pi-pencil text-blue-500"></i>
                                        <i v-if="option === 'Cerrar Presupuesto'" class="text-red-500 pi pi-ban text-blue-500"></i>
                                        <i v-if="option === 'Borrar'" class="pi pi-trash text-red-500"></i>
                                        {{ option }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </template>
                </vue3-datatable>
            </div>
        </div>
    </div>
</template>
<style scoped>

</style>
