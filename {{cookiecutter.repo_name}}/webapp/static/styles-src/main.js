// By default we create a single styles file, containing both vendor and app styles.
// If you wanted to, you can easily break them into 2 by adding vendor entry point to webpack config and removing the
//  import here.
import './vendor';

// Include main styles from scss
import './main.scss';
