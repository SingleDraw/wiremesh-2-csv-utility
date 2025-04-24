import { connection } from './src/db';
import OpeningManager from './src/modules/OpeningManager/OpeningManager';

// Execute the main function
const openingManager = new OpeningManager(connection);

openingManager.main()

