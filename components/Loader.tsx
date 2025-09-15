import styles from '../styles/components/Loader.module.css';

/**
 * 
 * @returns A loader component that displays a loading spinner.
 */

export default function Loader() {
  return (
    <div id="loader" className={styles.loader}></div>
  );
}