import '../styles/globals.css';
import Swal from 'sweetalert2';
import Script from 'next/script';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></Script>
      <Component {...pageProps} />
    </>
  );
}
