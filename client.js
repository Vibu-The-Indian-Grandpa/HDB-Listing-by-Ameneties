
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";





document.addEventListener("DOMContentLoaded", async function () {

const firebaseConfig = {
  apiKey: "AIzaSyA6U-AwHL4fSOnmqjEVo1lU8rFWDhPuFDY",
  authDomain: "hdbamenities.firebaseapp.com",
  projectId: "hdbamenities",
  storageBucket: "hdbamenities.appspot.com",
  messagingSenderId: "410996522613",
  appId: "1:410996522613:web:1193bc1b3df1b50e93423c",
  measurementId: "G-RY5WH9KYXF"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

      firebase.initializeApp(firebaseConfig)

    
    let  HDBinfo;

    const schoolData =[];
    const HDBList = [];
    /***********************************************************************/
    // Load Data
    // Fetch data get and post

    let collectionId = 1; // Starting collection ID

    async function fetchCollectionData(collectionId) {
        const url = `https://api-production.data.gov.sg/v2/public/api/collections/${collectionId}/metadata`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Failed to fetch data for collection ID ${collectionId}`);
                return null;
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching data for collection ID ${collectionId}:`, error);
            return null;
        }
    }
    async function fetchSchoolData() {
        const datasetId = "d_688b934f82c1059ed0a6993d2a829089"
        const url = "https://data.gov.sg/api/action/datastore_search?resource_id=" + datasetId;
        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch data');
            }
            return response.json();
          })
          .then(async data => {
            // console.log(data);
        
            // Extract records
            const records = data.result.records;
        
            // Filter to keep only school_name and postal_code
            records.forEach(record => {
              schoolData.push({
                school_name: record.school_name,
                address : record.address,
                postal_code: record.postal_code,
                level : record.mainlevel_code
              });
            });
            // Print the filtered records
            for (const school of schoolData) {
                const coordinates = await getCoordinates(school.address);
                if (coordinates) {
                    school.latitude = coordinates.latitude;
                    school.longitude = coordinates.longitude;
                }else{
                    throw new Error('Unknown Error');
                }
            }
            console.log(schoolData);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
    }



    async function fetchAllCollections() {
        try {
            while (true) {
                const data = await fetchCollectionData(collectionId);
                if (!data) {
                    // If no data is returned, break the loop
                    break;
                }
                HDBList.push(data);
                collectionId++;
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        }

        console.log(HDBList);
    }

    async function getCoordinates(address) {
        const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(address)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
    
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const resultsDict = await response.json();
            console.log(resultsDict);
            
            if (resultsDict.results.length > 0) {
                return {
                    latitude: resultsDict.results[0].LATITUDE,
                    longitude: resultsDict.results[0].LONGITUDE
                };
            } else {
                return null; // or handle the case where no results are found
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return null; // or handle the error appropriately
        }
    }


    /******************************************************************************/
    // async await 

    async function getAllData() {
        HDBOption(fetchAllCollections());
        await fetchSchoolData();
    };

    /******************************************************************************/

    function locationConversion(lo1, la1, lo2, la2, d2r) {
        const R = 6367; // Radius of the Earth in kilometers
        const dlong = d2r * (lo2 - lo1);
        const dlat = d2r * (la2 - la1);

        const a = Math.pow(Math.sin(dlat / 2), 2) +
            Math.cos(la1 * d2r) * Math.cos(la2 * d2r) *
            Math.pow(Math.sin(dlong / 2), 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;

        return dist;
    }


    function getTownByLocation(list, location) {
        for (const item of list) {
            if (item.town === location) {
                return item;
            }
        }
        return null; // or some default value
    }

    function getListOfAddress(list){
        let listOfAddress = [];
        for (const item of list){
            listOfAddress.add(item.block + " " + item.street_name);
        }
        
        return listOfAddress;
    }

    function removeDuplicates(list) {
        let seen = new Set(); // To track unique concatenated strings
        return list.filter(item => {
            let key = `${item.flat_type} ${item.block} ${item.street_name} ${item.flat_model}`;
            if (!seen.has(key)) {
                seen.add(key);
                return true; // Keep this item in the filtered array
            }
            return false;
        });
    }

    function HDBOption(data) {
        let LISTS = [...data];
        const D2R = Math.PI / 180
        return {
            ////////////////////////////////
            getSpecifiedHDB(data) {
                const specifiedLocations = data.map(location => getTownByLocation(LISTS, location));
                const uniqueSpecifiedLocations = removeDuplicates(specifiedLocations);

                return uniqueSpecifiedLocations;
            },
            getListOfCoordinates(uniqueLocationList){
                const listOfAddress = getListOfAddress(uniqueLocationList);
                let listOfCoordinates = [];

                for (const item of listOfAddress){
                    listOfCoordinates.add(getCoordinates(item));
                }
                return listOfCoordinates;
            }
            /////////////////////////////////
        }
    };

    /******************************************************************************/
    await getAllData();


    // Method to push amenitites location into an array


    // Method to compare and push the values in

    // Define the custom element
    customElements.define('custom-card', CustomCard);

    //Define the forms and etc
    const TownForm = document.getElementById("TownForm");

    const warningCard = document.getElementById("warningCard");
    const warningText = document.getElementById("warningText");


    /***********************************All Callbacks****************************************/

    Form.addEventListener("submit", function (event) {
        console.log("TownForm.addEventListener");
        event.preventDefault();
        //Hides warning card if it was displayed
        warningCard.classList.add("d-none");


        let townInput = document.getElementById("town").value;
        //error handling
        console.log(townInput)

        let TownsArray = HDBinfo.displayTown();
        //Split input into an array by filtering spaces and commas
        let townArrayOfNumbers = townInput.split(/,|\s/).filter(Boolean);

        //error handling
        console.log(townArrayOfNumbers);

        let validTowns = [];

        TownsArray.forEach((item) => {
            townArrayOfNumbers.forEach((number) => {
                if (item == TownsArray[number - 1]) {
                    validTowns.push(item);
                }
            });
        });

        if (validTowns.length !== townArrayOfNumbers.length) {
            warningCard.classList.remove("d-none");
            warningText.innerText = "Please enter your input in the valid format (i.e. 1, 2, 5 or 1 2 5)";
        } else {

            // This Clears lists and the console.log is for error handling
            console.log("Clear Lists");
            const FilteredExtremeList = document.getElementById("filterExtremeList");
            const FilteredAverageList = document.getElementById("filterAverageList");
            FilteredExtremeList.innerHTML = '';
            FilteredAverageList.innerHTML = '';

            console.log(validTowns);
            HDBinfo.displayFilterByTown(validTowns);
            HDBinfo.displayMeanMedianByTownAndFlatType(validTowns);
        };
        TownForm.reset();
    });
});
