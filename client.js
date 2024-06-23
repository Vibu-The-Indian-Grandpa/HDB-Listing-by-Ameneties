
// import { initializeApp } from 'firebase/app';
// import { getDatabase, ref, get, child } from 'firebase/database';



import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get,child  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

document.addEventListener("DOMContentLoaded", async function () {

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

    async function fetchMRTData() {
        // Example usage
        const dbRef = ref(getDatabase());
        get(child(dbRef, `MRT`)).then((snapshot) => {
            if (snapshot.exists()) {
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        }).finally(() => {
            console.log("Data fetched successfully");
        });

    }
    async function fetchMallData() {
        // Example usage
        const dbRef = ref(getDatabase());
        get(child(dbRef, `Shopping Mall`)).then((snapshot) => {
            if (snapshot.exists()) {
                MallList.push(...snapshot.val());
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        }).finally(() => {
            console.log("Data fetched successfully");
        });

    }



    let HDBinfo;

    const schoolData = [];
    const HDBList = [];
    const MRTList = [];
    const MallList = [];
    /***********************************************************************/
    // Load Data
    // Fetch data get and post

    let collectionId = 1; // Starting collection ID

    // async function fetchCollectionData(collectionId) {
    //     const url = `https://api-production.data.gov.sg/v2/public/api/collections/${collectionId}/metadata`;

    //     try {
    //         const response = await fetch(url);
    //         if (!response.ok) {
    //             console.error(`Failed to fetch data for collection ID ${collectionId}`);
    //             return null;
    //         }
    //         const data = await response.json();
    //         console.log(`Fetched data for collection ID ${collectionId}`);
    //         return data;
            
    //     } catch (error) {
    //         console.error(`Error fetching data for collection ID ${collectionId}:`, error);
    //         return null;
    //     }
    // }
    async function fetchHDBData() {
        const datasetId = "d_8b84c4ee58e3cfc0ece0d773c8ca6abc"
        const url = "https://data.gov.sg/api/action/datastore_search?resource_id=" + datasetId;
        
        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch data');
            }
            return response.json();
          })
          .then(data => {
            console.log(data);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
        
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
                        address: record.address,
                        postal_code: record.postal_code,
                        level: record.mainlevel_code
                    });
                });
                // Print the filtered records
                for (const school of schoolData) {
                    const coordinates = await getCoordinates(school.address);
                    if (coordinates) {
                        school.latitude = coordinates.latitude;
                        school.longitude = coordinates.longitude;
                    } else {
                        throw new Error('Unknown Error');
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }



    // async function fetchAllCollections() {
    //     const batchSize = 10; // Adjust batch size as needed
    //     let collectionId = 1;
    //     let hasData = true;
    
    //     while (hasData) {
    //         let collectionPromises = [];
    
    //         for (let i = 0; i < batchSize; i++) {
    //             collectionPromises.push(fetchCollectionData(collectionId + i));
    //         }
    
    //         try {
    //             const collectionsData = await Promise.all(collectionPromises);
    //             hasData = false;
    
    //             collectionsData.forEach(data => {
    //                 if (data) {
    //                     HDBList.push(data);
    //                     hasData = true; // Set to true if at least one collection has data
    //                 }
    //             });
    
    //             collectionId += batchSize;
    //         } catch (error) {
    //             console.error('Error fetching collections:', error);
    //             break;
    //         }
    //     }
    
    //     console.log(HDBList);
    // }

    async function getCoordinates(address) {
        const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(address)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const resultsDict = await response.json();
           // console.log(resultsDict);

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
        await fetchAllCollections();
        await fetchSchoolData();
        HDBinfo = HDBOption(HDBList);
        await fetchMRTData();
        await fetchMallData();
    };

    /******************************************************************************/

    function distanceCalculation(lo1, la1, lo2, la2, d2r) {
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

    function getListOfAddress(list) {
        let listOfAddress = [];
        for (const item of list) {
            listOfAddress.add(item.block + " " + item.street_name);
        }

        return listOfAddress;
    }

    function removeDuplicates(list) {
        let seen = new Set(); // To track unique concatenated strings
        return list.filter(item => {
            let key = `${item.flat_type} ${item.block} ${item.street_name}`;
            if (!seen.has(key)) {
                seen.add(key);
                return true; // Keep this item in the filtered array
            }
            return false;
        });
    }

    function HDBOption(data) {
        let LISTS = [...data];
        const D2R = Math.PI / 180;
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
            },
            getListOfDist(specifiedCoordList, amenityCoordList) {
                let leastDistance;
                let tempDistance;
                let arrayOfLeastDist = [];
                let arrayOfamenityCoord = [];

                for (let i = 0; i < specifiedCoordList; i++) {
                    // loop through all the locations
                    for (let j = 0; j < amenityCoordList; j++) {
                        // loop through all the amenity locations
                        tempDistance = distanceCalculation(specifiedCoordList[0], specifiedCoordList[1], amenityCoordList[0], amenityCoordList[1], D2R);
                        if (leastDistance > tempDistance) {
                            leastDistance = tempDistance;
                            arrayOfamenityCoord = amenityCoordList[j];
                        }
                    }
                    arrayOfLeastDist.push([arrayOfamenityCoord, leastDistance]);
                }

                return arrayOfLeastDist;
            }
            /////////////////////////////////
        }
    };




    /******************************************************************************/
    await getAllData();


    // Method to push amenitites location into an array


    // Method to compare and push the values in
        //Define the forms and etc
        var form = document.querySelector("form");
        const MRTStationCheckbox = document.getElementById("MRTStationCheckbox");
        const MallCheckbox = document.getElementById("MallCheckbox");
    
        const Primary = document.getElementById("PrimaryCheckbox");
        const Secondary = document.getElementById("SecondaryCheckbox");
        const JuniorCollege = document.getElementById("JCCheckbox");
    
    
    
        const warningCard = document.getElementById("warningCard");
    
        /***********************************All Callbacks****************************************/
    form.addEventListener("submit", function (event) {
        console.log("Form.addEventListener");
        event.preventDefault();
        //Hides warning card if it was displayed
        warningCard.classList.add("d-none");
    
        let listOfSchool,listofpri,listofsec,listofjc, listOfMall, listOfMrt, combinedList;
        let locationInput = document.getElementById("location").value;
        //error handlingconsol
        //Correct
        console.log(locationInput)
        if (typeof locationInput === 'string') {
            locationInput = [locationInput];
        }
    
        let specifiedList = HDBinfo.getSpecifiedHDB(locationInput);
    
        let listOfSpecifiedCoord = HDBinfo.getListOfCoordinates(specifiedList);
    
    
        for (let i = 0; i < specifiedList; i++) {
            // did it like this so that if one of the check box wasnt ticked, the code would still display without issue
            combinedList.push([[specifiedList[i]], [], [], [], [], []]);
        }
    
        if (MRTStationCheckbox.checked) {
            // MRT List
            // run the function to get mrt
            listOfMrt = HDBinfo.getListOfDist(listOfSpecifiedCoord, listOFMrt);
            //rmb to add the details
            for (let i = 0; i < specifiedList.length; i++) {
                combinedList[i][1].push(listOfMrt[i]);
            }
    
        }
    
        // Example: Check if Mall checkbox is checked
        if (MallCheckbox.checked) {
            // MALL LIST
            // run the function to get mall
            listOFMall = HDBinfo.getListOfDist(listOfSpecifiedCoord, listOFMall);
            for (let i = 0; i < specifiedList.length; i++) {
                combinedList[i][2].push(listOfMall[i]);
            }
        }
    
        // Example: Check if School checkbox is checked
        if (Primary.checked) {
            // SCHOOL LIST
            // CHECK FOR TYPE OF SCHOOL
            //
            // run the function to get SCHOOL
            listOFSchool = HDBinfo.getListOfDist(listOfSpecifiedCoord, listOFSCHOOL);
            listofpri=listOfSchool.filter(school => school.mainlevel_code == "PRIMARY")
            for (let i = 0; i < specifiedList.length; i++) {
                combinedList[i][3].push(listOfpri[i]);
            }
        }
    
        if (Secondary.checked) {
            // SCHOOL LIST
            // CHECK FOR TYPE OF SCHOOL
            // run the function to get SCHOOL
            listOFSchool = HDBinfo.getListOfDist(listOfSpecifiedCoord, listOFSCHOOL);
            listofsec=listOfSchool.filter(school => school.mainlevel_code == "SECONDARY")
            for (let i = 0; i < specifiedList.length; i++) {
                combinedList[i][4].push(listOfsec[i]);
            }
        }
    
        if (JuniorCollege.checked) {
            // SCHOOL LIST
            // CHECK FOR TYPE OF SCHOOL
            // run the function to get SCHOOL
            listOFSchool = HDBinfo.getListOfDist(listOfSpecifiedCoord, listOFSCHOOL);
            listofjc=listOfSchool.filter(school => school.mainlevel_code == "JUNIOR COLLEGE")
            for (let i = 0; i < specifiedList.length; i++) {
                combinedList[i][5].push(listOfjc[i]);
            }
        }
    
        // [[object, ]]
        for (let i = 0; i < specifiedList.length; i++) {
            combinedList.sort()
        }
    
        for (let i = 0; i < 10; i++) {
            // Retrieve the corresponding specified HDB object
            let specifiedHDB = specifiedList[i]; // Assuming combinedResults is sorted to match specifiedList
    
            // Create card element
            let card = document.createElement("div");
            card.classList.add("card");
            console.log(combinedList)
    
            // Card content
            card.innerHTML = `
                <h3>${combinedList[i][1].flat_type} - ${combinedList[i][1].block} ${combinedList[i][1].street_name}</h3>
                <p>Town: ${combinedList[i][1].town}</p>
                <p>Storey Range: ${combinedList[i][1].storey_range}</p>
                <p>Flat Area: ${combinedList[i][1].flat_area} sqm</p>
                <p>Lease Commence Date: ${combinedList[i][1].lease_commence_date}</p>
                <p>Remaining Lease: ${combinedList[i][1].remaining_lease} years</p>
                <p>Resale Price: $${combinedList[i][1].resale_price}</p>
            `;
    
            // Check if MRTStationCheckbox is checked and add MRT info
            if (MRTStationCheckbox.checked && combinedList[i][1].length > 0) {
                cardContent += `<p>MRT Distance: ${combinedList[i][1][0].distance.toFixed(2)} km</p>`;
            }
    
            // Check if MallCheckbox is checked and add Mall info
            if (MallCheckbox.checked && combinedList[i][2].length > 0) {
                cardContent += `<p>Mall Distance: ${combinedList[i][2][0].distance.toFixed(2)} km</p>`;
            }
    
            // Check if SchoolCheckbox is checked and add School info
            if (Primary.checked && combinedList[i][3].length > 0) {
                cardContent += `<p>School Distance: ${combinedList[i][3][0].distance.toFixed(2)} km</p>`;
            }
    
            if (Secondary.checked && combinedList[i][4].length > 0) {
                cardContent += `<p>School Distance: ${combinedList[i][4][0].distance.toFixed(2)} km</p>`;
            }
    
            if (JuniorCollege.checked && combinedList[i][5].length > 0) {
                cardContent += `<p>School Distance: ${combinedList[i][5][0].distance.toFixed(2)} km</p>`;
            }
    
            // Set the inner HTML of the card
            card.innerHTML = cardContent;
            // Append card to results container
            resultsContainer.appendChild(card);
        }
    
    });
    


});
