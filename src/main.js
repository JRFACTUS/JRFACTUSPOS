import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; 

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';


// jQuery
import $ from 'jquery';
window.$ = $;
window.jQuery = $;

// DataTables
import 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-responsive-bs5';
import 'datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css';

const app = createApp(App);
app.use(router);
app.mount('#app');
