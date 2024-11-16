import Swal from 'sweetalert2';

export const handleErrorWithSweetAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message,
      confirmButtonText: 'OK',
      timer: 5000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }