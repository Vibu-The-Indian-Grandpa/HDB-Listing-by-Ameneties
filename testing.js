
// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6U-AwHL4fSOnmqjEVo1lU8rFWDhPuFDY",
    authDomain: "hdbamenities.firebaseapp.com",
    databaseURL: "https://hdbamenities-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "hdbamenities",
    storageBucket: "hdbamenities.appspot.com",
    messagingSenderId: "410996522613",
    appId: "1:410996522613:web:1193bc1b3df1b50e93423c",
    measurementId: "G-RY5WH9KYXF"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Example usage
const dbRef = ref(getDatabase());
get(child(dbRef, `Shopping Mall`)).then((snapshot) => {
  if (snapshot.exists()) {
    arr.push(...snapshot.val());
    console.log(arr[0]);
  } else {
    console.log("No data available");
  }
}).catch((error) => {
  console.error(error);
}).finally(()=>{
    console.log("Data fetched successfully");
    process.exit();
});
